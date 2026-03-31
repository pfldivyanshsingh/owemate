const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getNotifications, markRead, markAllRead } = require('../controllers/notification.controller');
const { getMyAnalytics, getAdminAnalytics, getCategories, getGlobalSpending } = require('../controllers/analytics.controller');

router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/:id/read', authenticate, markRead);
router.put('/notifications/read-all', authenticate, markAllRead);

router.get('/analytics/me', authenticate, getMyAnalytics);
router.get('/analytics/global', authenticate, getGlobalSpending);
router.get('/analytics/admin', authenticate, requireAdmin, getAdminAnalytics);
router.get('/categories', authenticate, getCategories);

module.exports = router;
