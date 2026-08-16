  const Order = require('../models/Order');
  const Product = require('../models/Product');
  const Inventory = require('../models/Inventory');
  const RoutingHistory = require('../models/RoutingHistory');
  const routingEngine = require('./routingEngine');
  const aiExplanation = require('./aiExplanation');
const orderService = require('./orderService');

  const names = [
    "Rahul Sharma", "Priya Patel", "Amit Kumar", 
    "Sneha Reddy", "Vikram Singh", "Anjali Gupta", 
    "Rohan Mehta", "Kavya Nair"
  ];

  const generateRandomOrder = async () => {
    // Random name + 3-digit number
    const baseName = names[Math.floor(Math.random() * names.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const customerName = `${baseName} ${randomNum}`;

    // Random Lat/Lng
    const customerLatitude = 8.4 + Math.random() * (37.6 - 8.4);
    const customerLongitude = 68.7 + Math.random() * (97.25 - 68.7);

    // Random product
    const products = await Product.find({}, '_id');
    if (!products.length) throw new Error('No products found in DB');
    const productId = products[Math.floor(Math.random() * products.length)]._id;

    // Random quantity 1-5
    const quantity = Math.floor(Math.random() * 5) + 1;

    return { customerName, customerLatitude, customerLongitude, productId, quantity };
  };

  const runAutoOrder = async () => {
    try {
      const fakeCustomer = await generateRandomOrder();
      
      const result = await orderService.processAndRouteOrder({
        customerName: fakeCustomer.customerName,
        customerLat: fakeCustomer.customerLatitude,
        customerLng: fakeCustomer.customerLongitude,
        productId: fakeCustomer.productId,
        quantity: fakeCustomer.quantity
      });

      if (!result.success) {
        console.log(`[CRON] Auto-order failed: No eligible warehouse for ${fakeCustomer.customerName}`);
        return;
      }

      console.log(`[CRON] Auto-order created: ${fakeCustomer.customerName} \u2192 ${result.data.selectedWarehouse.warehouseName} (score: ${result.data.routingScore.toFixed(4)})`);
    } catch (error) {
      console.error('[CRON] Auto-order error:', error);
    }
  };

  module.exports = {
    generateRandomOrder,
    runAutoOrder
  };
