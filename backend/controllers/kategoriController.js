const Kategori = require("../models/Kategori");

// @desc    Ambil semua kategori
// @route   GET /api/kategori
const getKategori = async (req, res) => {
  const kategori = await Kategori.find().sort({ nama: 1 });
  res.json(kategori);
};

// @desc    Tambah kategori baru
// @route   POST /api/kategori
const createKategori = async (req, res) => {
  const { nama, deskripsi } = req.body;
  const kategori = await Kategori.create({ nama, deskripsi });
  res.status(201).json(kategori);
};

// @desc    Update kategori
// @route   PUT /api/kategori/:id
const updateKategori = async (req, res) => {
  const kategori = await Kategori.findById(req.params.id);
  if (!kategori) {
    return res.status(404).json({ message: "Kategori tidak ditemukan" });
  }
  kategori.nama = req.body.nama ?? kategori.nama;
  kategori.deskripsi = req.body.deskripsi ?? kategori.deskripsi;
  const updated = await kategori.save();
  res.json(updated);
};

// @desc    Hapus kategori
// @route   DELETE /api/kategori/:id
const deleteKategori = async (req, res) => {
  const kategori = await Kategori.findById(req.params.id);
  if (!kategori) {
    return res.status(404).json({ message: "Kategori tidak ditemukan" });
  }
  await kategori.deleteOne();
  res.json({ message: "Kategori berhasil dihapus" });
};

module.exports = { getKategori, createKategori, updateKategori, deleteKategori };
