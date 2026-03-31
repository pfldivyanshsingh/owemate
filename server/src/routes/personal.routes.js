const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personal.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/transactions', personalController.getPersonalTransactions);
router.post('/transactions', personalController.addTransaction);
router.put('/transactions/:id', personalController.updateTransaction);
router.delete('/transactions/:id', personalController.deleteTransaction);

router.get('/analytics', personalController.getPersonalAnalytics);

router.get('/categories', personalController.getCategories);
router.post('/categories', personalController.addCategory);

module.exports = router;
