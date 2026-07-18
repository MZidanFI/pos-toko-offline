// Jalankan sekali di awal untuk membuat akun Admin pertama:
//   node seed/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@toko.com' });
  if (existing) {
    console.log('⚠️  Admin sudah ada, seeding dilewati.');
    process.exit(0);
  }

  await User.create({
    name: 'Administrator',
    email: 'admin@toko.com',
    password: 'admin123', // ganti setelah login pertama kali!
    role: 'Admin',
  });

  console.log('✅ Akun Admin berhasil dibuat:');
  console.log('   email: admin@toko.com');
  console.log('   password: admin123');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
