const mongoose = require('mongoose');

const stokSchema = new mongoose.Schema({
  produk: { type: mongoose.Schema.Types.ObjectId, ref: 'Produk', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: false },
  tipe: { type: String, enum: ['MASUK', 'KELUAR', 'ADJUSTMENT'], required: true },
  jumlah: { type: Number, required: true },
  keterangan: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Stok', stokSchema);