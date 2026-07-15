const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
  toggleActive,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createUserValidator } = require('../middleware/validators');

// Semua route di bawah ini wajib login
router.use(protect);

router.get('/', authorize('Admin', 'Manager'), getUsers);
router.get('/:id', authorize('Admin', 'Manager'), getUserById);
router.post('/', authorize('Admin'), createUserValidator, createUser);
router.put('/:id', authorize('Admin'), updateUser);
router.put('/:id/password', updatePassword); // Admin atau pemilik akun (dicek di controller)
router.patch('/:id/toggle-active', authorize('Admin'), toggleActive);
router.delete('/:id', authorize('Admin'), deleteUser);

module.exports = router;
