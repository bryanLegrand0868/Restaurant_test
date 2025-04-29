const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./api/routes/userRoutes');
const menuRoutes = require('./api/routes/menuRoutes');
const orderRoutes = require('./api/routes/orderRoutes');
const adminRoutes = require('./api/routes/adminRoutes');
const authRoutes = require('./api/routes/authRoutes');

// Use routes
app.use('/api/auth', authRoutes);  // Add auth routes at the top
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Not found middleware
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Close database connection on server shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});