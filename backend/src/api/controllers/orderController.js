const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new order
 */
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, notes } = req.body;
    
    // Calculate total from items
    const itemIds = items.map(item => item.dishId);
    
    // Get the dishes to calculate total price
    const dishes = await prisma.dish.findMany({
      where: {
        id: { in: itemIds }
      }
    });
    
    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
      const dish = dishes.find(d => d.id === item.dishId);
      if (!dish) {
        return res.status(400).json({ message: `Dish with id ${item.dishId} not found` });
      }
      
      // Base price
      let itemPrice = dish.price;
      
      // Add price for extras if any
      if (item.extras && item.extras.length > 0) {
        // This is simplified - in a real app you'd have a more complex
        // pricing system for extras
        itemPrice += item.extras.length * 0.5;
      }
      
      totalPrice += itemPrice * item.quantity;
    }
    
    // Create order and order items in a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create order
      const newOrder = await prisma.order.create({
        data: {
          userId: req.user.id,
          status: 'PENDING',
          totalPrice,
          deliveryAddress,
          paymentMethod,
          notes,
          orderItems: {
            create: items.map(item => ({
              dishId: item.dishId,
              quantity: item.quantity,
              extras: item.extras || [],
              exclusions: item.exclusions || []
            }))
          }
        }
      });
      
      return newOrder;
    });
    
    // Get the complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            dish: true
          }
        }
      }
    });
    
    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: {
            dish: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Ensure user can only access their own orders
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update order status (customers can only cancel their order)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Regular users can only cancel their orders, not update to other statuses
    if (status !== 'CANCELLED') {
      return res.status(403).json({ message: "Users can only cancel orders" });
    }
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Ensure user can only update their own orders
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Check if the order is already in a final state
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Order cannot be updated, current status: ${order.status}` 
      });
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        orderItems: {
          include: {
            dish: true
          }
        }
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Reorder a past order
 */
const reorderPastOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the original order
    const originalOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: true
      }
    });
    
    if (!originalOrder) {
      return res.status(404).json({ message: "Original order not found" });
    }
    
    // Ensure user can only reorder their own orders
    if (originalOrder.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Check if order is within the 30-day limit
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (originalOrder.createdAt < thirtyDaysAgo) {
      return res.status(400).json({ 
        message: "Only orders from the last 30 days can be reordered" 
      });
    }
    
    // Create new order based on original
    const newOrder = await prisma.order.create({
      data: {
        userId: req.user.id,
        status: 'PENDING',
        totalPrice: originalOrder.totalPrice,
        deliveryAddress: originalOrder.deliveryAddress,
        paymentMethod: originalOrder.paymentMethod,
        notes: originalOrder.notes,
        orderItems: {
          create: originalOrder.orderItems.map(item => ({
            dishId: item.dishId,
            quantity: item.quantity,
            extras: item.extras,
            exclusions: item.exclusions
          }))
        }
      }
    });
    
    // Get the complete new order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        orderItems: {
          include: {
            dish: true
          }
        }
      }
    });
    
    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error in reorderPastOrder:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Cancel an order
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Ensure user can only cancel their own orders
    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Check if the order is already in a final state
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Order cannot be cancelled, current status: ${order.status}` 
      });
    }
    
    // Cancel the order
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' },
      include: {
        orderItems: {
          include: {
            dish: true
          }
        }
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  reorderPastOrder,
  cancelOrder
};
