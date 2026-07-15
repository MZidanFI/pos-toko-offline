const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifikasi token JWT, lampirkan data user ke req.user
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Tidak ada token, akses ditolak',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User pemilik token tidak ditemukan',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun kamu telah dinonaktifkan. Hubungi Admin.',
      });
    }

    req.user = user; // tersedia di semua controller berikutnya
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kedaluwarsa, silakan login ulang',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
    });
  }
};

module.exports = { protect };
