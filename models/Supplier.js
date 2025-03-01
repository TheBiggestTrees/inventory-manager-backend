const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    name: String,
    contact_person: String,
    phone: String,
    email: String,
    address: String,
});

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;