const Supplier = require("../models/Supplier");

// @desc    Ambil semua supplier
// @route   GET /api/supplier
const getSupplier = async (req, res) => {
  const supplier = await Supplier.find().sort({ nama: 1 });
  res.json(supplier);
};

// @desc    Tambah supplier baru
// @route   POST /api/supplier
const createSupplier = async (req, res) => {
  const { nama, kontakPerson, telepon, email, alamat } = req.body;
  const supplier = await Supplier.create({ nama, kontakPerson, telepon, email, alamat });
  res.status(201).json(supplier);
};

// @desc    Update supplier
// @route   PUT /api/supplier/:id
const updateSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    return res.status(404).json({ message: "Supplier tidak ditemukan" });
  }
  Object.assign(supplier, req.body);
  const updated = await supplier.save();
  res.json(updated);
};

// @desc    Hapus supplier
// @route   DELETE /api/supplier/:id
const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    return res.status(404).json({ message: "Supplier tidak ditemukan" });
  }
  await supplier.deleteOne();
  res.json({ message: "Supplier berhasil dihapus" });
};

module.exports = { getSupplier, createSupplier, updateSupplier, deleteSupplier };
