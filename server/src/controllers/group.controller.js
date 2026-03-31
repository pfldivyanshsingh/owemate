const { v4: uuidv4 } = require('uuid');
const supabase = require('../utils/supabase');
const { sendGroupInviteEmail } = require('../services/email');
const { createNotification } = require('./notification.controller');

const getGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: memberRows, error: memErr } = await supabase
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', userId);

    if (memErr) throw memErr;

    const groupIds = memberRows.map((m) => m.group_id);
    if (groupIds.length === 0) return res.json({ groups: [] });

    const { data: groups, error } = await supabase
      .from('groups')
      .select('*, created_by_user:users!groups_created_by_fkey(id, name, email, avatar_url)')
      .in('id', groupIds);

    if (error) throw error;

    // Attach roles
    const groupsWithRole = groups.map((g) => ({
      ...g,
      my_role: memberRows.find((m) => m.group_id === g.id)?.role,
    }));

    res.json({ groups: groupsWithRole });
  } catch (err) {
    console.error('Get groups error:', err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ error: 'Group name is required' });

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name, description, created_by: userId })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'admin',
    });

    res.status(201).json({ group });
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: group, error } = await supabase
      .from('groups')
      .select('*, created_by_user:users!groups_created_by_fkey(id, name, email, avatar_url)')
      .eq('id', groupId)
      .single();

    if (error || !group) return res.status(404).json({ error: 'Group not found' });

    const { data: members } = await supabase
      .from('group_members')
      .select('*, user:users(id, name, email, avatar_url)')
      .eq('group_id', groupId);

    res.json({ group: { ...group, members } });
  } catch (err) {
    console.error('Get group error:', err);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;

    const { data: group, error } = await supabase
      .from('groups')
      .update({ name, description })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    res.json({ group });
  } catch (err) {
    console.error('Update group error:', err);
    res.status(500).json({ error: 'Failed to update group' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if any unsettled balances exist
    const { data: splits } = await supabase
      .from('expense_splits')
      .select('id')
      .eq('is_settled', false)
      .in(
        'expense_id',
        (await supabase.from('expenses').select('id').eq('group_id', groupId)).data?.map((e) => e.id) || []
      );

    if (splits && splits.length > 0) {
      return res.status(400).json({ error: 'Cannot delete group: There are unsettled dues' });
    }

    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) throw error;

    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('Delete group error:', err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if user has pending dues in this group
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id')
      .eq('group_id', groupId);

    const expenseIds = (expenses || []).map((e) => e.id);

    if (expenseIds.length > 0) {
      const { data: unsettled } = await supabase
        .from('expense_splits')
        .select('amount')
        .in('expense_id', expenseIds)
        .eq('user_id', userId)
        .eq('is_settled', false);

      if (unsettled && unsettled.length > 0) {
        const total = unsettled.reduce((sum, s) => sum + parseFloat(s.amount), 0);
        if (total > 0) {
          return res.status(400).json({ error: 'Clear dues before leaving group', pendingAmount: total });
        }
      }
    }

    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    res.json({ message: 'You have left the group' });
  } catch (err) {
    console.error('Leave group error:', err);
    res.status(500).json({ error: 'Failed to leave group' });
  }
};

const getMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: members, error } = await supabase
      .from('group_members')
      .select('*, user:users(id, name, email, avatar_url)')
      .eq('group_id', groupId);

    if (error) throw error;
    res.json({ members });
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const requesterId = req.user.id;

    if (userId === requesterId) {
      return res.status(400).json({ error: 'Use leave group instead' });
    }

    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;
    const inviterId = req.user.id;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Get group info
    const { data: group } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();

    // Check if already a member
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', existingUser.id)
        .single();

      if (existingMember) {
        return res.status(400).json({ error: 'User is already a member of this group' });
      }
    }

    // Check for pending invite
    const { data: pendingInvite } = await supabase
      .from('invitations')
      .select('id')
      .eq('group_id', groupId)
      .eq('invited_email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (pendingInvite) {
      return res.status(400).json({ error: 'An invitation is already pending for this email' });
    }

    const token = uuidv4();
    const { data: invite, error } = await supabase
      .from('invitations')
      .insert({
        group_id: groupId,
        invited_email: email.toLowerCase(),
        invited_by: inviterId,
        token,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Send invite email
    await sendGroupInviteEmail(email, req.user.name, group.name, token);

    // Create notification if user exists
    if (existingUser) {
      await createNotification(existingUser.id, 'group_invite', `${req.user.name} invited you to join "${group.name}"`, {
        groupId,
        inviteToken: token,
      });
    }

    res.status(201).json({ invite, message: 'Invitation sent!' });
  } catch (err) {
    console.error('Invite member error:', err);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};

const getMyInvitations = async (req, res) => {
  try {
    const email = req.user.email;

    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('*, group:groups(id, name, description), inviter:users!invitations_invited_by_fkey(id, name, email, avatar_url)')
      .eq('invited_email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ invitations });
  } catch (err) {
    console.error('Get invitations error:', err);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
};

const respondToInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.user.id;

    const { data: invite, error } = await supabase
      .from('invitations')
      .select('*, group:groups(id, name)')
      .eq('token', token)
      .eq('invited_email', req.user.email)
      .single();

    if (error || !invite) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: `Invitation has already been ${invite.status}` });
    }

    await supabase
      .from('invitations')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', invite.id);

    if (action === 'accept') {
      // Add to group
      await supabase.from('group_members').insert({
        group_id: invite.group_id,
        user_id: userId,
        role: 'member',
      });

      // Notify inviter
      await createNotification(
        invite.invited_by,
        'invite_accepted',
        `${req.user.name} accepted your invitation to "${invite.group.name}"`,
        { groupId: invite.group_id }
      );
    }

    res.json({ message: action === 'accept' ? 'Joined group successfully!' : 'Invitation declined' });
  } catch (err) {
    console.error('Respond to invite error:', err);
    res.status(500).json({ error: 'Failed to process invitation' });
  }
};

module.exports = {
  getGroups, createGroup, getGroup, updateGroup, deleteGroup,
  leaveGroup, getMembers, removeMember, inviteMember, getMyInvitations, respondToInvite,
};
