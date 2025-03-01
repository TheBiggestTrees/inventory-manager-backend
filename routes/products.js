const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Apply auth middleware to all routes
router.use(auth);

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

// Create a new product - Admin only
router.post("/", admin, async (req, res) => {
  try {
    const { listPrice, costPrice } = req.body;
    
    if (!listPrice || listPrice < 0) {
      return res.status(400).json({ message: "Valid list price is required" });
    }
    
    if (!costPrice || costPrice < 0) {
      return res.status(400).json({ message: "Valid cost price is required" });
    }

    if (costPrice > listPrice) {
      return res.status(400).json({ message: "Cost price cannot be greater than list price" });
    }
    
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
});

// Delete a product by ID - Admin only
router.delete("/:id", admin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

// Update a product by ID - Admin only
router.put("/:id", admin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
});

// Get a product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ message: "Error getting product", error: error.message });
  }
});

// Get products by location
router.get("/location/:location", async (req, res) => {
  try {
    const products = await Product.find({ location: req.params.location });
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ message: "Error getting products", error: error.message });
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ message: "Error getting products", error: error.message });
  }
});

// Get products by SKU
router.get("/sku/:sku", async (req, res) => {
  try {
    const products = await Product.find({ sku: req.params.sku });
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ message: "Error getting products", error: error.message });
  }
});

// Delete multiple products by IDs
router.delete("/batch/delete", async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Please provide an array of product IDs" });
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No products found to delete" });
    }

    res.json({ 
      message: "Products deleted successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({ message: "Error deleting products", error: error.message });
  }
});

module.exports = router;
