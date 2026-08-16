const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');

// We will load the routes and app
const app = express();
app.use(express.json());

app.use('/api/warehouses', require('./routes/warehouseRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/routing', require('./routes/routingRoutes'));

const Warehouse = require('./models/Warehouse');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');

let mongoServer;
let server;

async function runTests() {
  // 1. Setup DB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('Connected to In-Memory DB');

  // 2. Start Express server
  server = app.listen(5001, () => console.log('Test server running on port 5001'));

  // 3. Seed data
  const warehousesData = [
    { warehouseName: 'Mumbai Central Hub', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777, capacity: 10000, activeStatus: true },
    { warehouseName: 'Delhi NCR Depot', city: 'Delhi', latitude: 28.7041, longitude: 77.1025, capacity: 15000, activeStatus: true },
  ];
  const warehouses = await Warehouse.insertMany(warehousesData);
  
  const productsData = [
    { productName: 'Laptop', category: 'Electronics', sku: 'ELEC-LAP-001' }
  ];
  const products = await Product.insertMany(productsData);

  const inventoryData = [
    { warehouseId: warehouses[0]._id, productId: products[0]._id, availableQuantity: 50, reservedQuantity: 0 },
    { warehouseId: warehouses[1]._id, productId: products[0]._id, availableQuantity: 2, reservedQuantity: 0 }
  ];
  await Inventory.insertMany(inventoryData);

  console.log('Data seeded.');

  // 4. Test GET /api/warehouses
  const res1 = await fetch('http://localhost:5001/api/warehouses');
  const d1 = await res1.json();
  console.log('GET /warehouses:', d1.success, d1.data.length === 2 ? 'OK' : 'FAIL');

  // 5. Test POST /api/routing/route-order
  // We mock Anthropic key so it gracefully skips
  process.env.ANTHROPIC_API_KEY = ""; 
  
  const res2 = await fetch('http://localhost:5001/api/routing/route-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerLat: 18.5204, // Pune (closer to Mumbai)
      customerLng: 73.8567,
      productId: products[0]._id.toString(),
      quantity: 1,
      customerName: 'Test User'
    })
  });
  
  const d2 = await res2.json();
  console.log('POST /route-order success:', d2.success);
  if (d2.success) {
    console.log('Selected Warehouse:', d2.data.selectedWarehouse.warehouseName);
    console.log('All Scores Count:', d2.data.allScores.length);
    console.log('Eliminated Count:', d2.data.eliminatedWarehouses.length);
  } else {
    console.log('Route Error:', d2);
  }

  // Teardown
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Tests completed.');
}

runTests().catch(console.error);
