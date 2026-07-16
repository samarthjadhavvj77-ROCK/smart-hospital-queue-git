const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, subscribeAdmin } = require('../controllers/authController.js');
const { protect } = require('../middlewares/authMiddleware.js');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/subscribe', protect, subscribeAdmin);

module.exports = router;
