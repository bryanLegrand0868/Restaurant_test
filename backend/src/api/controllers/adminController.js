const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

/**
 * Admin login
 */
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { username }
    });
    
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: '8h' }
    );
    
    // Log admin login
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        details: `Admin ${admin.username} logged in`
      }
    });
    
    res.json({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      token
    });
  } catch (error) {
    console.error('Error in adminLogin:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all current orders for admin
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, timeframe } = req.query;
    
    let dateFilter = {};
    
    // Filter orders by timeframe if specified
    if (timeframe) {
      const now = new Date();
      switch (timeframe) {
        case 'today':
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          dateFilter = { gte: startOfDay };
          break;
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          dateFilter = { gte: startOfWeek };
          break;
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { gte: startOfMonth };
          break;
      }
    }
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            dish: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update order status (admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if status transition is valid
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['READY_FOR_DELIVERY', 'CANCELLED'],
      'READY_FOR_DELIVERY': ['OUT_FOR_DELIVERY', 'CANCELLED'],
      'OUT_FOR_DELIVERY': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': []
    };
    
    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot update order from ${order.status} to ${status}` 
      });
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        statusNote: note || null
      }
    });
    
    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE_ORDER_STATUS',
        details: `Updated order #${id} status from ${order.status} to ${status}`
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get order counts
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });
    
    const preparingOrders = await prisma.order.count({
      where: { status: 'PREPARING' }
    });
    
    const deliveringOrders = await prisma.order.count({
      where: { 
        status: {
          in: ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY']
        }
      }
    });
    
    // Get sales data
    const todaySales = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfDay },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalPrice: true },
      _count: true
    });
    
    const weekSales = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfWeek },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalPrice: true },
      _count: true
    });
    
    const monthSales = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { not: 'CANCELLED' }
      },
      _sum: { totalPrice: true },
      _count: true
    });
    
    // Get top dishes
    const topDishes = await prisma.orderItem.groupBy({
      by: ['dishId'],
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });
    
    // Get dish details for top dishes
    const dishIds = topDishes.map(item => item.dishId);
    const dishes = await prisma.dish.findMany({
      where: {
        id: { in: dishIds }
      }
    });
    
    // Combine dish data
    const topDishesWithDetails = topDishes.map(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      return {
        id: item.dishId,
        name: dish?.name,
        totalOrdered: item._sum.quantity
      };
    });
    
    res.json({
      orders: {
        pending: pendingOrders,
        preparing: preparingOrders,
        delivering: deliveringOrders
      },
      sales: {
        today: {
          total: todaySales._sum.totalPrice || 0,
          count: todaySales._count
        },
        week: {
          total: weekSales._sum.totalPrice || 0,
          count: weekSales._count
        },
        month: {
          total: monthSales._sum.totalPrice || 0,
          count: monthSales._count
        }
      },
      topDishes: topDishesWithDetails
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add a new dish
 */
const addDish = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      imageUrl,
      ingredients,
      dietary
    } = req.body;
    
    // Create dish
    const dish = await prisma.dish.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        imageUrl,
        dietary: dietary || [],
        ingredients: {
          create: ingredients.map(ing => ({
            name: ing.name,
            optional: ing.optional || false,
            price: ing.price ? parseFloat(ing.price) : 0
          }))
        }
      },
      include: {
        category: true,
        ingredients: true
      }
    });
    
    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.admin.id,
        action: 'ADD_DISH',
        details: `Added new dish: ${name}`
      }
    });
    
    res.status(201).json(dish);
  } catch (error) {
    console.error('Error in addDish:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update an existing dish
 */
const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      imageUrl,
      ingredients,
      dietary
    } = req.body;
    
    // Get existing dish to log changes
    const existingDish = await prisma.dish.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingDish) {
      return res.status(404).json({ message: "Dish not found" });
    }
    
    // Update dish in a transaction
    const updatedDish = await prisma.$transaction(async (prisma) => {
      // Delete old ingredients if provided new ones
      if (ingredients && ingredients.length > 0) {
        await prisma.ingredient.deleteMany({
          where: { dishId: parseInt(id) }
        });
      }
      
      // Update dish
      return await prisma.dish.update({
        where: { id: parseInt(id) },
        data: {
          name: name || undefined,
          description: description || undefined,
          price: price ? parseFloat(price) : undefined,
          categoryId: categoryId ? parseInt(categoryId) : undefined,
          imageUrl: imageUrl || undefined,
          dietary: dietary || undefined,
          ingredients: ingredients ? {
            create: ingredients.map(ing => ({
              name: ing.name,
              optional: ing.optional || false,
              price: ing.price ? parseFloat(ing.price) : 0
            }))
          } : undefined
        },
        include: {
          category: true,
          ingredients: true
        }
      });
    });
    
    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE_DISH',
        details: `Updated dish: ${existingDish.name}`
      }
    });
    
    res.json(updatedDish);
  } catch (error) {
    console.error('Error in updateDish:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Remove a dish
 */
const removeDish = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get dish info before deletion for logging
    const dish = await prisma.dish.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }
    
    // Delete dish and related ingredients in a transaction
    await prisma.$transaction(async (prisma) => {
      // First delete ingredients
      await prisma.ingredient.deleteMany({
        where: { dishId: parseInt(id) }
      });
      
      // Then delete the dish
      await prisma.dish.delete({
        where: { id: parseInt(id) }
      });
    });
    
    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.admin.id,
        action: 'DELETE_DISH',
        details: `Deleted dish: ${dish.name}`
      }
    });
    
    res.json({ message: "Dish deleted successfully" });
  } catch (error) {
    console.error('Error in removeDish:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all admin logs
 */
const getAllAdminLogs = async (req, res) => {
  try {
    const logs = await prisma.adminLog.findMany({
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Error in getAllAdminLogs:', error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  adminLogin,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  addDish,
  updateDish,
  removeDish,
  getAllAdminLogs
};
