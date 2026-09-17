// One-off script to create the first admin account.
// Usage: node utils/seed.js admin@example.com "StrongPass123" "Admin Name"
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.log('Usage: node utils/seed.js <email> <password> [name]');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log('A user with this email already exists:', existing.role);
    process.exit(0);
  }

  const admin = await User.create({
    name: name || 'Platform Admin',
    email,
    password,
    role: 'admin',
  });

  console.log('Admin account created:', admin.email);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
