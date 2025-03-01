const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderItemSchema = new mongoose.Schema({
    order_id: Schema.Types.ObjectId,
    product_id: Schema.Types.ObjectId,
    quantity: Number,
    price: Number
});

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

module.exports = OrderItem;