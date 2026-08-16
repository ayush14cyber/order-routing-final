const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const RoutingHistory = require('../models/RoutingHistory');
const routingEngine = require('../services/routingEngine');
const aiExplanation = require('../services/aiExplanation');
const { generateRandomOrder } = require('../services/orderGenerator');
const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ success: true, data: order, message: 'Order created' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('productId').populate('assignedWarehouseId');
    res.status(200).json({ success: true, data: orders, message: 'Orders fetched' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('productId').populate('assignedWarehouseId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order, message: 'Order fetched' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order, message: 'Order updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.generateRandomOrderRoute = async (req, res) => {
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
      return res.status(400).json({ 
        success: false, 
        message: 'No eligible warehouses with sufficient stock found for random order',
        data: result.data
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      message: 'Random order generated and routed successfully'
    });

  } catch (error) {
    console.error('Random Order Route error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
