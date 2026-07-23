const { validationResult } = require('express-validator');
const User = require('../models/User');

// @route  GET /api/users
// @desc   Ambil semua user/karyawan (bisa difilter ?role=Kasir&isActive=true)
// @access Private (Admin, Manager)
exports.getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/users/:id
// @access Private (Admin, Manager)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/users
// @desc   Tambah kasir/karyawan baru (oleh Admin/Manager)
// @access Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }

    if (role === 'Admin') {
      const existingAdmin = await User.findOne({ role: 'Admin' });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Hanya boleh ada satu akun Admin',
        });
      }
    }

    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ success: true, message: 'Karyawan berhasil ditambahkan', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/users/:id
// @desc   Update data karyawan (nama, role, phone, dll)
// @access Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, role, phone, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const isSelf = user._id.toString() === req.user._id.toString();

    if (role !== undefined && role !== user.role && isSelf) {
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa mengubah role akun sendiri',
      });
    }

    if (isActive !== undefined && isActive !== user.isActive && isSelf) {
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa mengubah status aktif akun sendiri',
      });
    }

    if (role !== undefined && role === 'Admin' && user.role !== 'Admin') {
      const existingAdmin = await User.findOne({ role: 'Admin' });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Hanya boleh ada satu akun Admin',
        });
      }
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    res.json({ success: true, message: 'Data karyawan berhasil diperbarui', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/users/:id/password
// @desc   Reset password karyawan (oleh Admin) atau ganti password sendiri
// @access Private (Admin, atau pemilik akun)
exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter',
      });
    }

    // Hanya Admin atau pemilik akun sendiri yang boleh ganti password
    const isOwner = req.user._id.toString() === req.params.id;
    if (req.user.role !== 'Admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    user.password = password; // akan di-hash otomatis lewat pre('save')
    await user.save();

    res.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/users/:id
// @desc   Hapus karyawan permanen
// @access Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa menghapus akun sendiri',
      });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'Karyawan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/users/:id/toggle-active
// @desc   Nonaktifkan / aktifkan kembali akun karyawan (alternatif soft-delete)
// @access Private (Admin)
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa menonaktifkan akun sendiri',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Karyawan berhasil ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};