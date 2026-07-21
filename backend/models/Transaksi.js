// models/Transaksi.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    produk: { type: mongoose.Schema.Types.ObjectId, ref: "Produk", required: true },
    nama: String,
    sku: String,
    harga: { type: Number, required: true }, // harga satuan saat transaksi (snapshot)
    qty: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const transaksiSchema = new mongoose.Schema(
  {
    nomorStruk: { type: String, required: true, unique: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, default: 0 },
    diskon: { type: Number, default: 0 },
    pajakPersen: { type: Number, default: 11 },
    pajak: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    metodePembayaran: {
      type: String,
      enum: ["tunai", "debit", "kredit", "qris", "transfer"],
      default: "tunai",
    },
    jumlahBayar: { type: Number, required: true },
    kembalian: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["selesai", "dibatalkan"],
      default: "selesai",
    },
    kasir: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    catatan: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaksi", transaksiSchema);