// Middleware otorisasi: batasi akses route berdasarkan role tertentu
// Contoh pemakaian: router.delete('/:id', protect, authorize('Admin'), deleteUser)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Silakan login terlebih dahulu',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin untuk aksi ini.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
