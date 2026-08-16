const Inventory = require('../models/Inventory');

exports.createInventory = async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    res.status(201).json({ success: true, data: inventory, message: 'Inventory created' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('warehouseId').populate('productId');
    res.status(200).json({ success: true, data: inventory, message: 'Inventory fetched' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });
    res.status(200).json({ success: true, data: inventory, message: 'Inventory updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
