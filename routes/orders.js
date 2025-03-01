const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Apply auth middleware to all routes
router.use(auth);

// Get all orders - Admin only
router.get("/", admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer_id');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer_id');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Users can only view their own orders unless they're admin
    if (!req.user.isAdmin && order.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Get order items
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('product_id');
    
    const response = {
      ...order.toObject(),
      items: orderItems
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
});

// Create new order
router.post("/", async (req, res) => {
  try {
    const { customer_id, items } = req.body;
    
    // Non-admin users can only create orders for themselves
    if (!req.user.isAdmin && customer_id !== req.user._id.toString()) {
      return res.status(403).json({ message: "Can only create orders for yourself" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }

    let total_amount = 0;

    // Verify products and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient quantity for product ${product.title}` 
        });
      }
      total_amount += product.price * item.quantity;
    }

    // Create order
    const order = new Order({
      customer_id,
      order_date: new Date(),
      total_amount
    });
    await order.save();

    // Create order items and update product quantities
    for (const item of items) {
      const orderItem = new OrderItem({
        order_id: order._id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      });
      await orderItem.save();

      // Update product quantity
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { quantity: -item.quantity } }
      );
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});

// Update order status - Admin only
router.put("/:id", admin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
});

// Delete order - Admin only
router.delete("/:id", admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order items to restore product quantities
    const orderItems = await OrderItem.find({ order_id: order._id });
    
    // Restore product quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { quantity: item.quantity } }
      );
    }

    // Delete order items
    await OrderItem.deleteMany({ order_id: order._id });
    
    // Delete order
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Order and related items deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
});

// Get order items for an order
router.get("/:id/items", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only view their own order items unless they're admin
    if (!req.user.isAdmin && order.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const orderItems = await OrderItem.find({ order_id: req.params.id })
      .populate('product_id');
    res.json(orderItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order items", error: error.message });
  }
});

module.exports = router;
