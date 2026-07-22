const Customer = require("../models/Customer");

// @desc    Ambil semua customer
// @route   GET /api/customers
const getCustomers = async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
};

// @desc    Tambah customer baru
// @route   POST /api/customers
const createCustomer = async (req, res) => {
  const { nama, telepon } = req.body;
  const customer = await Customer.create({ nama, telepon });
  res.status(201).json(customer);
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer tidak ditemukan" });
  }
  customer.nama = req.body.nama ?? customer.nama;
  customer.telepon = req.body.telepon ?? customer.telepon;
  const updated = await customer.save();
  res.json(updated);
};

// @desc    Hapus customer
// @route   DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: "Customer tidak ditemukan" });
  }
  await customer.deleteOne();
  res.json({ message: "Customer berhasil dihapus" });
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };