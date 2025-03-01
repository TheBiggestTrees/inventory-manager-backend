const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  artist: String,
  genre: String,
  releaseDate: Date,
  price: Number,
  sku: String,
  listPrice: {
    type: Number,
    required: [true, "List price is required"],
    min: [0, "List price cannot be negative"],
  },
  costPrice: {
    type: Number,
    required: [true, "Cost price is required"],
    min: [0, "Cost price cannot be negative"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  }
});

// Calculate profit margin virtual field
productSchema.virtual('profitMargin').get(function() {
  if (this.costPrice === 0) return 0;
  return ((this.listPrice - this.costPrice) / this.listPrice * 100).toFixed(2);
});

module.exports = mongoose.model("Product", productSchema);
