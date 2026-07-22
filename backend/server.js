require('dotenv').config();
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
const transaksiRoutes = require("./routes/transaksiRoutes");
const stokRoutes = require("./routes/stokRoutes"); // Import routes stok
const customerRoutes = require("./routes/customerRoutes");   // Import routes customer

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
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

app.use("/api/transaksi", transaksiRoutes);

// Routes Anggota 4: Manajemen Stok & Customer
app.use('/api/stok', stokRoutes);
app.use('/api/customers', customerRoutes);

// TODO: routes modul lain (transaksi, laporan) di-mount di sini oleh anggota tim lain

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
