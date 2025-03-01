const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Apply auth middleware to all routes
router.use(auth);

// Get all customers - Admin only
router.get("/", admin, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error: error.message });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    // Users can only view their own profile unless they're admin
    if (!req.user.isAdmin && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error: error.message });
  }
});

// Create new customer - Admin only
router.post("/", admin, async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: "Error creating customer", error: error.message });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  try {
    // Users can only update their own profile unless they're admin
    if (!req.user.isAdmin && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error: error.message });
  }
});

// Delete customer - Admin only
router.delete("/:id", admin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Delete customer's orders first
    await Order.deleteMany({ customer_id: req.params.id });
    
    // Delete customer
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer and related orders deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error: error.message });
  }
});

// Get customer orders
router.get("/:id/orders", async (req, res) => {
  try {
    // Users can only view their own orders unless they're admin
    if (!req.user.isAdmin && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find({ customer_id: req.params.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer orders", error: error.message });
  }
});

module.exports = router;
