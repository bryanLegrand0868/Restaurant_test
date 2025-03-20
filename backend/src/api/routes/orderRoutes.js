const express = require('express');
const { 
  createOrder, 
  getOrderById, 
  updateOrderStatus,
  reorderPastOrder,
  cancelOrder
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/', authenticate, createOrder);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, updateOrderStatus);
router.post('/reorder/:id', authenticate, reorderPastOrder);
router.put('/:id/cancel', authenticate, cancelOrder);

module.exports = router;
