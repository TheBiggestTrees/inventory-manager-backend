const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Apply auth middleware to all routes
router.use(auth);

// Get all inventory items
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate('product_id')
      .populate('supplier_id');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error: error.message });
  }
});

// Get inventory by ID
router.get("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('product_id')
      .populate('supplier_id');
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory item", error: error.message });
  }
});

// Create new inventory entry - Admin only
router.post("/", admin, async (req, res) => {
  try {
    const { product_id, quantity_received } = req.body;
    
    // Verify product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newInventory = new Inventory(req.body);
    await newInventory.save();

    // Update product quantity
    product.quantity += quantity_received;
    await product.save();

    res.status(201).json(newInventory);
  } catch (error) {
    res.status(500).json({ message: "Error creating inventory entry", error: error.message });
  }
});

// Update inventory entry - Admin only
router.put("/:id", admin, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // If quantity is being updated, adjust product quantity accordingly
    if (req.body.quantity_received !== undefined) {
      const quantityDifference = req.body.quantity_received - inventory.quantity_received;
      const product = await Product.findById(inventory.product_id);
      if (product) {
        product.quantity += quantityDifference;
        await product.save();
      }
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedInventory);
  } catch (error) {
    res.status(500).json({ message: "Error updating inventory", error: error.message });
  }
});

// Delete inventory entry - Admin only
router.delete("/:id", admin, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Adjust product quantity before deletion
    const product = await Product.findById(inventory.product_id);
    if (product) {
      product.quantity -= inventory.quantity_received;
      await product.save();
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Inventory entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting inventory entry", error: error.message });
  }
});

module.exports = router;
