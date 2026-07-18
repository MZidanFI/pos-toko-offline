const mongoose = require("mongoose");

const produkSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama produk wajib diisi"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU/Barcode wajib diisi"],
      unique: true,
      trim: true,
    },
    hargaBeli: {
      type: Number,
      required: [true, "Harga beli wajib diisi"],
      min: 0,
      default: 0,
    },
    hargaJual: {
      type: Number,
      required: [true, "Harga jual wajib diisi"],
      min: 0,
      default: 0,
    },
    stok: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    satuan: {
      type: String,
      default: "pcs",
    },
    kategori: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kategori",
      required: [true, "Kategori wajib dipilih"],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier wajib dipilih"],
    },
    gambar: {
      type: String, // path/nama file di folder uploads
      default: "",
    },
    deskripsi: {
      type: String,
      default: "",
    },
    aktif: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// index untuk pencarian teks (nama & sku)
produkSchema.index({ nama: "text", sku: "text" });

module.exports = mongoose.model("Produk", produkSchema);
