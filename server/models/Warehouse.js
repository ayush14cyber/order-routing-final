const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  warehouseName: { type: String, required: true },
  city: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  capacity: { type: Number, required: true },
  activeStatus: { type: Boolean, default: true },
  // Logistics attributes — used by the routing engine
  dispatchTime:  { type: Number, default: 24  }, // hours before warehouse begins shipping
  costPerKm:     { type: Number, default: 5   }, // ₹ per km shipping rate
  shipmentSpeed: { type: Number, default: 200 }, // km per day travel speed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
