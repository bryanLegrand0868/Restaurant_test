const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  uploadProfilePhoto,
  getOrderHistory
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);
router.post('/profile/photo', authenticate, uploadProfilePhoto);
router.get('/orders', authenticate, getOrderHistory);

module.exports = router;
