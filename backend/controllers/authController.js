const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateToken');

// @route  POST /api/auth/register
// @desc   Registrasi user baru
// @access Public (untuk demo). Di produksi, sebaiknya dibatasi hanya Admin
//         yang bisa mendaftarkan kasir/manager baru lewat /api/users
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Kasir',
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/auth/login
// @desc   Login user, mengembalikan JWT
// @access Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun kamu telah dinonaktifkan. Hubungi Admin.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/auth/refresh
// @desc   Ambil access token baru menggunakan refresh token
// @access Public (butuh refresh token valid)
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token wajib disertakan',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token tidak valid',
      });
    }

    const accessToken = generateAccessToken(user._id);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Refresh token tidak valid atau kedaluwarsa',
    });
  }
};

// @route  GET /api/auth/me
// @desc   Ambil data user yang sedang login
// @access Private
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
