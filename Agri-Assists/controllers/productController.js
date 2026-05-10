const Product = require('../models/Product');

// Get all products (can filter by city/shop if needed)
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('shopId', 'name shopName shopAddress city phone');
        res.json({ success: true, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get products for a specific shopkeeper
const getShopProducts = async (req, res) => {
    try {
        const products = await Product.find({ shopId: req.user.id });
        res.json({ success: true, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create a new product (Shopkeeper only)
const createProduct = async (req, res) => {
    try {
        const { productName, category, price, quantity, description } = req.body;
        
        const newProduct = new Product({
            productName,
            category,
            price,
            quantity,
            description,
            shopId: req.user.id
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error adding product' });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const product = await Product.findOneAndUpdate({ _id: id, shopId: req.user.id }, updates, { new: true });
        
        if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        
        res.json({ success: true, message: 'Product updated successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error updating product' });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOneAndDelete({ _id: id, shopId: req.user.id });
        
        if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error deleting product' });
    }
};

module.exports = { getProducts, getShopProducts, createProduct, updateProduct, deleteProduct };
