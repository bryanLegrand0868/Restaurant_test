const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      token
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Login a user
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      token
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePhoto: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePhoto: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Upload profile photo
 */
const uploadProfilePhoto = async (req, res) => {
  try {
    // This would typically use a file upload middleware like multer
    // and then update the database with the photo URL
    const photoUrl = req.body.photoUrl; // Simplified for this example
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePhoto: photoUrl },
      select: {
        id: true,
        profilePhoto: true
      }
    });
    
    res.json({ profilePhoto: updatedUser.profilePhoto });
  } catch (error) {
    console.error('Error in uploadProfilePhoto:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get user order history (last 30 days)
 */
const getOrderHistory = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      include: {
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
    console.error('Error in getOrderHistory:', error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePhoto,
  getOrderHistory
};
