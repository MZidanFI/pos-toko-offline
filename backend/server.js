require('dotenv').config();
<<<<<<< HEAD
require('express-async-errors'); // agar error di controller async (modul Produk) otomatis ditangkap
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const produkRoutes = require('./routes/produkRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
=======
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
>>>>>>> upstream/main

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
<<<<<<< HEAD
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Folder statis untuk menyajikan gambar produk yang diupload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'POS API berjalan' });
});

// Routes Anggota 1: Auth, User Management & Project Setup
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Routes Anggota 2: Master Data Produk (Produk, Kategori, Supplier)
app.use('/api/produk', produkRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/supplier', supplierRoutes);

// TODO: routes modul lain (transaksi, laporan) di-mount di sini oleh anggota tim lain

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);
=======
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'POS API (Auth & User Service) berjalan' });
});

// Routes modul Anggota 1
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// TODO: routes modul lain (produk, transaksi, laporan) di-mount di sini
// oleh anggota tim lain, contoh:
// app.use('/api/products', require('./routes/productRoutes'));
// app.use('/api/transactions', require('./routes/transactionRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan server',
  });
});
>>>>>>> upstream/main

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
