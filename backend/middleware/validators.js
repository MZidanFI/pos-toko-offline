const { body } = require('express-validator');

exports.registerValidator = [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  body('role')
    .optional()
    .isIn(['Admin', 'Manager', 'Kasir'])
    .withMessage('Role tidak valid'),
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
];

exports.createUserValidator = [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  body('role')
    .isIn(['Admin', 'Manager', 'Kasir'])
    .withMessage('Role wajib salah satu dari: Admin, Manager, Kasir'),
];
