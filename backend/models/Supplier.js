const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama supplier wajib diisi"],
      unique: true,
      trim: true,
    },
    kontakPerson: { type: String, default: "", trim: true },
    telepon: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    alamat: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
