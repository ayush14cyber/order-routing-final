const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products, message: 'Products fetched' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
