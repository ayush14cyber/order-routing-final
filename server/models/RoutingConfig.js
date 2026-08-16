const mongoose = require('mongoose');

const routingConfigSchema = new mongoose.Schema({
  distanceWeight: { type: Number, required: true, default: 35 },
  inventoryWeight: { type: Number, required: true, default: 35 },
  deliveryWeight: { type: Number, required: true, default: 20 },
  costWeight: { type: Number, required: true, default: 10 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoutingConfig', routingConfigSchema);
