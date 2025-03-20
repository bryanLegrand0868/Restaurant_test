const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all dishes in the menu
 */
const getAllDishes = async (req, res) => {
  try {
    const dishes = await prisma.dish.findMany({
      include: {
        category: true,
        ingredients: true
      }
    });
    
    res.json(dishes);
  } catch (error) {
    console.error('Error in getAllDishes:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get a dish by ID
 */
const getDishById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dish = await prisma.dish.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        ingredients: true
      }
    });
    
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }
    
    res.json(dish);
  } catch (error) {
    console.error('Error in getDishById:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get dishes by category
 */
const getDishByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const dishes = await prisma.dish.findMany({
      where: {
        category: {
          name: {
            equals: category,
            mode: 'insensitive'
          }
        }
      },
      include: {
        category: true,
        ingredients: true
      }
    });
    
    res.json(dishes);
  } catch (error) {
    console.error('Error in getDishByCategory:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Search dishes based on various criteria
 */
const searchDishes = async (req, res) => {
  try {
    const { 
      query, 
      category, 
      dietary, 
      minPrice, 
      maxPrice 
    } = req.query;
    
    // Build filter conditions
    const where = {};
    
    if (query) {
      where.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ];
    }
    
    if (category) {
      where.category = {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      };
    }
    
    if (dietary) {
      where.dietary = {
        contains: dietary,
        mode: 'insensitive'
      };
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }
    
    const dishes = await prisma.dish.findMany({
      where,
      include: {
        category: true,
        ingredients: true
      }
    });
    
    res.json(dishes);
  } catch (error) {
    console.error('Error in searchDishes:', error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllDishes,
  getDishById,
  getDishByCategory,
  searchDishes
};
