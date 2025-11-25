import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, username, full_name, email, mobile, country, state, city, address, pincode, role FROM users WHERE role = 'user'"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const {
      userId,
      username,
      fullName,
      email,
      mobile,
      country,
      state,
      city,
      address,
      pincode,
      password,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
      (user_id, username, full_name, email, mobile, country, state, city, address, pincode, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user')`,
      [
        userId,
        username,
        fullName,
        email,
        mobile,
        country,
        state,
        city,
        address,
        pincode,
        passwordHash,
      ]
    );

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      mobile,
      country,
      state,
      city,
      address,
      pincode,
    } = req.body;

    await pool.query(
      `UPDATE users 
       SET full_name = ?, email = ?, mobile = ?, country = ?, state = ?, city = ?, address = ?, pincode = ?
       WHERE id = ? AND role = 'user'`,
      [fullName, email, mobile, country, state, city, address, pincode, id]
    );

    res.json({ message: 'User updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM users WHERE id = ? AND role = 'user'",
      [id]
    );

    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
