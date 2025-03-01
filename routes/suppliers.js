const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const Inventory = require("../models/Inventory");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Apply auth middleware to all routes
router.use(auth);

// Get all suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching suppliers", error: error.message });
  }
});

// Get supplier by ID
router.get("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Error fetching supplier", error: error.message });
  }
});

// Create new supplier - Admin only
router.post("/", admin, async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: "Error creating supplier", error: error.message });
  }
});

// Update supplier - Admin only
router.put("/:id", admin, async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: "Error updating supplier", error: error.message });
  }
});

// Delete supplier - Admin only
router.delete("/:id", admin, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting supplier", error: error.message });
  }
});

// Get supplier inventory records
router.get("/:id/inventory", async (req, res) => {
  try {
    const inventory = await Inventory.find({ supplier_id: req.params.id })
      .populate('product_id');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching supplier inventory", error: error.message });
  }
});

module.exports = router;
