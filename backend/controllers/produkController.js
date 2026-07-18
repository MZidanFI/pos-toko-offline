const fs = require("fs");
const path = require("path");
const Produk = require("../models/Produk");

// Hapus file gambar lama dari folder uploads
const hapusFileGambar = (namaFile) => {
  if (!namaFile) return;
  const filePath = path.join(__dirname, "..", "uploads", namaFile);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") console.error("Gagal hapus file:", err.message);
  });
};

// @desc    Ambil semua produk dengan fitur pencarian & filter
// @route   GET /api/produk?search=&kategori=&supplier=&page=&limit=
const getProduk = async (req, res) => {
  const { search, kategori, supplier, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { nama: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  if (kategori) query.kategori = kategori;
  if (supplier) query.supplier = supplier;

  const pageNum = Math.max(parseInt(page), 1);
  const limitNum = Math.max(parseInt(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    Produk.find(query)
      .populate("kategori", "nama")
      .populate("supplier", "nama")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Produk.countDocuments(query),
  ]);

  res.json({
    data,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
};

// @desc    Ambil satu produk berdasarkan ID
// @route   GET /api/produk/:id
const getProdukById = async (req, res) => {
  const produk = await Produk.findById(req.params.id)
    .populate("kategori", "nama")
    .populate("supplier", "nama");

  if (!produk) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }
  res.json(produk);
};

// @desc    Tambah produk baru
// @route   POST /api/produk
const createProduk = async (req, res) => {
  const { nama, sku, hargaBeli, hargaJual, stok, satuan, kategori, supplier, deskripsi } = req.body;

  const produkBaru = new Produk({
    nama,
    sku,
    hargaBeli,
    hargaJual,
    stok,
    satuan,
    kategori,
    supplier,
    deskripsi,
    gambar: req.file ? req.file.filename : "",
  });

  const disimpan = await produkBaru.save();
  const hasil = await Produk.findById(disimpan._id)
    .populate("kategori", "nama")
    .populate("supplier", "nama");

  res.status(201).json(hasil);
};

// @desc    Update produk
// @route   PUT /api/produk/:id
const updateProduk = async (req, res) => {
  const produk = await Produk.findById(req.params.id);
  if (!produk) {
    if (req.file) hapusFileGambar(req.file.filename);
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  const fields = ["nama", "sku", "hargaBeli", "hargaJual", "stok", "satuan", "kategori", "supplier", "deskripsi", "aktif"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) produk[field] = req.body[field];
  });

  // Jika ada gambar baru diupload, hapus gambar lama & ganti dengan yang baru
  if (req.file) {
    hapusFileGambar(produk.gambar);
    produk.gambar = req.file.filename;
  }

  const updated = await produk.save();
  const hasil = await Produk.findById(updated._id)
    .populate("kategori", "nama")
    .populate("supplier", "nama");

  res.json(hasil);
};

// @desc    Hapus produk
// @route   DELETE /api/produk/:id
const deleteProduk = async (req, res) => {
  const produk = await Produk.findById(req.params.id);
  if (!produk) {
    return res.status(404).json({ message: "Produk tidak ditemukan" });
  }

  hapusFileGambar(produk.gambar);
  await produk.deleteOne();

  res.json({ message: "Produk berhasil dihapus" });
};

module.exports = { getProduk, getProdukById, createProduk, updateProduk, deleteProduk };
