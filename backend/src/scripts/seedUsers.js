import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const seedUsers = async () => {
  try {
    console.log('Seeding users...');

    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const userPasswordHash = await bcrypt.hash('User@123', 10);

    await pool.query('DELETE FROM users');

    await pool.query(
      `INSERT INTO users 
       (user_id, username, full_name, email, mobile, country, state, city, address, pincode, password_hash, role)
       VALUES
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        // Admin
        'ADM001',
        'admin',
        'System Admin',
        'admin@example.com',
        '9999999999',
        'India',
        'Maharashtra',
        'Mumbai',
        'Admin Address',
        '400001',
        adminPasswordHash,
        'admin',

        // Normal user
        'USR001',
        'user1',
        'Normal User',
        'user1@example.com',
        '8888888888',
        'India',
        'Maharashtra',
        'Mumbai',
        'User Address',
        '400002',
        userPasswordHash,
        'user',
      ]
    );

    console.log('Users seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
