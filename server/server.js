require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes will go here
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/warehouses', require('./routes/warehouseRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/routing', require('./routes/routingRoutes'));
app.use('/api/config', require('./routes/configRoutes'));

const cron = require('node-cron');
const { runAutoOrder } = require('./services/orderGenerator');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  tls: true,
  tlsAllowInvalidCertificates: true
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      if (process.env.ENABLE_AUTO_ORDERS === 'true') {
        cron.schedule('*/30 * * * * *', runAutoOrder);
        console.log('Auto-order cron job started (every 2 minutes)');
      }
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
