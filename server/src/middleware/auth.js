const { verifyToken } = require('../utils/jwt');
const supabase = require('../utils/supabase');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, is_verified')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

const requireGroupAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const { data: member, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error || !member) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    if (member.role !== 'admin') {
      return res.status(403).json({ error: 'Group admin access required' });
    }

    req.memberRole = member.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

const requireGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const { data: member, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error || !member) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    req.memberRole = member.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { authenticate, requireAdmin, requireGroupAdmin, requireGroupMember };
