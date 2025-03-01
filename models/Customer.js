const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    phone_number: String,
    address: String,
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
