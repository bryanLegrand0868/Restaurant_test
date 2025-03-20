const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to authenticate admin users
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    });
    
    if (!admin) {
      return res.status(401).json({ message: 'Admin authentication invalid' });
    }
    
    // Add admin object to request
    req.admin = {
      id: admin.id,
      role: admin.role
    };
    
    next();
  } catch (error) {
    console.error('Error in authenticateAdmin middleware:', error);
    res.status(401).json({ message: 'Admin authentication invalid' });
  }
};

/**
 * Middleware to authorize admin roles
 * @param {...string} roles - Allowed roles for the route
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }
    
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: `Admin role ${req.admin.role} not authorized for this action` 
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateAdmin,
  authorizeRole
};
