const Warehouse = require('../models/Warehouse');

exports.createWarehouse = async (req, res) => {
  try {
    const warehouse = new Warehouse(req.body);
    await warehouse.save();
    res.status(201).json({ success: true, data: warehouse, message: 'Warehouse created' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.status(200).json({ success: true, data: warehouses, message: 'Warehouses fetched' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.status(200).json({ success: true, data: warehouse, message: 'Warehouse fetched' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.status(200).json({ success: true, data: warehouse, message: 'Warehouse updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
