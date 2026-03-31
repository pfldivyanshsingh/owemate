const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate, requireGroupMember } = require('../middleware/auth');
const { getGroupBalances, settleUp, getGroupTransactions } = require('../controllers/balance.controller');

router.get('/balances', authenticate, requireGroupMember, getGroupBalances);
router.post('/settle', authenticate, requireGroupMember, settleUp);
router.get('/transactions', authenticate, requireGroupMember, getGroupTransactions);

module.exports = router;
