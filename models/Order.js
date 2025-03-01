const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new mongoose.Schema({
    customer_id: Schema.Types.ObjectId,
    order_date: Date,
    total_amount: Number
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;