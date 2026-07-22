const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  telepon: { type: String },
  poin: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);