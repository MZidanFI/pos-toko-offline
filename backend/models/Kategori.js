const mongoose = require("mongoose");

const kategoriSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama kategori wajib diisi"],
      unique: true,
      trim: true,
    },
    deskripsi: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kategori", kategoriSchema);
