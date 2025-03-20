const express = require('express');
const { 
  getAllDishes, 
  getDishById, 
  getDishByCategory,
  searchDishes
} = require('../controllers/menuController');

const router = express.Router();

// Public routes - available to all users
router.get('/', getAllDishes);
router.get('/dish/:id', getDishById);
router.get('/category/:category', getDishByCategory);
router.get('/search', searchDishes);

module.exports = router;
