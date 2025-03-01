const mongoose = require("mongoose");
const { Schema } = mongoose;

const inventorySchema = new mongoose.Schema({
    product_id: Schema.Types.ObjectId,
    supplier_id: Schema.Types.ObjectId,
    quantity_received: Number,
    date_received: Date,
    remarks: String
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;