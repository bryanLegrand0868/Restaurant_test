const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./api/routes/userRoutes');
const menuRoutes = require('./api/routes/menuRoutes');
const orderRoutes = require('./api/routes/orderRoutes');
const adminRoutes = require('./api/routes/adminRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Restaurant Delivery API is running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});