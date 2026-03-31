const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate, requireGroupMember } = require('../middleware/auth');
const {
  getGroupExpenses, addExpense, getExpense, updateExpense, deleteExpense, getAllExpenses,
} = require('../controllers/expense.controller');

// All expenses for current user (across all groups)
router.get('/', authenticate, getAllExpenses);
router.get('/:id', authenticate, getExpense);
router.put('/:id', authenticate, updateExpense);
router.delete('/:id', authenticate, deleteExpense);

module.exports = router;

// Mounted as /api/groups/:groupId/expenses
const groupExpenseRouter = express.Router({ mergeParams: true });
groupExpenseRouter.get('/', authenticate, requireGroupMember, getGroupExpenses);
groupExpenseRouter.post('/', authenticate, requireGroupMember, addExpense);
module.exports.groupExpenseRouter = groupExpenseRouter;
