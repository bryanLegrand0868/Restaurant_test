const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Protected routes
router.use(auth);

// Payment operations
router.post('/intent', paymentController.createPaymentIntent);
router.post('/success', paymentController.handlePaymentSuccess);
router.post('/failure', paymentController.handlePaymentFailure);

module.exports = router;