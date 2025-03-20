const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to authenticate regular users 
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication invalid' });
    }
    
    // Add user object to request
    req.user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('Error in authenticate middleware:', error);
    res.status(401).json({ message: 'Authentication invalid' });
  }
};

module.exports = {
  authenticate
};
