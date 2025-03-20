const express = require('express');
const { 
  adminLogin, 
  getAllOrders, 
  updateOrderStatus,
  getDashboardStats,
  addDish,
  updateDish,
  removeDish,
  getAllAdminLogs
} = require('../controllers/adminController');
const { authenticateAdmin, authorizeRole } = require('../middleware/adminAuth');

const router = express.Router();

// Admin authentication
router.post('/login', adminLogin);

// Protected admin routes
router.get('/orders', authenticateAdmin, getAllOrders);
router.put('/orders/:id/status', authenticateAdmin, updateOrderStatus);
router.get('/dashboard', authenticateAdmin, getDashboardStats);

// Menu management (Content Manager role)
router.post('/dishes', authenticateAdmin, authorizeRole('CONTENT_MANAGER', 'SUPER_ADMIN'), addDish);
router.put('/dishes/:id', authenticateAdmin, authorizeRole('CONTENT_MANAGER', 'SUPER_ADMIN'), updateDish);
router.delete('/dishes/:id', authenticateAdmin, authorizeRole('CONTENT_MANAGER', 'SUPER_ADMIN'), removeDish);

// Admin logs (Super Admin only)
router.get('/logs', authenticateAdmin, authorizeRole('SUPER_ADMIN'), getAllAdminLogs);

module.exports = router;
