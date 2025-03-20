const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Purge orders older than 30 days
 * This function should be scheduled to run daily
 */
const purgeOldOrders = async () => {
  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log(`[Order Cleanup] Starting purge of orders older than ${thirtyDaysAgo.toISOString()}`);
    
    // Count orders to be deleted first
    const orderCount = await prisma.order.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    if (orderCount === 0) {
      console.log('[Order Cleanup] No orders to purge');
      return { success: true, purgedCount: 0 };
    }
    
    // Delete order items and orders in a transaction
    const deletedOrders = await prisma.$transaction(async (prisma) => {
      // First get IDs of orders to be deleted
      const oldOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        },
        select: {
          id: true
        }
      });
      
      const orderIds = oldOrders.map(order => order.id);
      
      // Then delete order items
      await prisma.orderItem.deleteMany({
        where: {
          orderId: {
            in: orderIds
          }
        }
      });
      
      // Finally delete orders
      const result = await prisma.order.deleteMany({
        where: {
          id: {
            in: orderIds
          }
        }
      });
      
      return result;
    });
    
    console.log(`[Order Cleanup] Successfully purged ${deletedOrders.count} orders older than 30 days`);
    
    return {
      success: true,
      purgedCount: deletedOrders.count
    };
  } catch (error) {
    console.error('[Order Cleanup] Error purging old orders:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  purgeOldOrders
};
