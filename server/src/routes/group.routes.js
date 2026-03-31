const express = require('express');
const router = express.Router();
const { authenticate, requireGroupAdmin, requireGroupMember } = require('../middleware/auth');
const {
  getGroups, createGroup, getGroup, updateGroup, deleteGroup,
  leaveGroup, getMembers, removeMember, inviteMember, getMyInvitations, respondToInvite,
} = require('../controllers/group.controller');

router.get('/', authenticate, getGroups);
router.post('/', authenticate, createGroup);
router.get('/invitations', authenticate, getMyInvitations);
router.post('/invitations/:token/respond', authenticate, respondToInvite);

router.get('/:groupId', authenticate, requireGroupMember, getGroup);
router.put('/:groupId', authenticate, requireGroupAdmin, updateGroup);
router.delete('/:groupId', authenticate, requireGroupAdmin, deleteGroup);
router.post('/:groupId/leave', authenticate, requireGroupMember, leaveGroup);

router.get('/:groupId/members', authenticate, requireGroupMember, getMembers);
router.delete('/:groupId/members/:userId', authenticate, requireGroupAdmin, removeMember);
router.post('/:groupId/invite', authenticate, requireGroupMember, inviteMember);

module.exports = router;
