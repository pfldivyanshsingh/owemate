const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getMe, updateMe, searchUsers } = require('../controllers/user.controller');

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.get('/search', authenticate, searchUsers);

module.exports = router;
