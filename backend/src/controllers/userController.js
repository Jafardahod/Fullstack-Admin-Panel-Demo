// backend/src/controllers/userController.js
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * Helper to inspect existing rows and find which fields conflict.
 * rows: array of existing user rows returned by the SELECT query
 * payload: { userId, username, email, mobile }
 */
const findDuplicateFields = (rows, payload) => {
  const dupes = new Set();
  for (const r of rows) {
    if (r.user_id && payload.userId && r.user_id === payload.userId) dupes.add('userId');
    if (r.username && payload.username && r.username === payload.username) dupes.add('username');
    if (r.email && payload.email && r.email === payload.email) dupes.add('email');
    if (r.mobile && payload.mobile && r.mobile === payload.mobile) dupes.add('mobile');
  }
  return Array.from(dupes);
};

// backend/src/controllers/userController.js (only getUsers shown - keep rest unchanged)
export const getUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q) {
      const [rows] = await pool.query(
        "SELECT id, user_id, username, full_name, email, mobile, country, state, city, address, pincode, role, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC"
      );
      return res.json(rows);
    }

    // safe wildcard search across several columns
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT id, user_id, username, full_name, email, mobile, country, state, city, address, pincode, role, created_at
       FROM users
       WHERE role = 'user' AND (
         username LIKE ? OR
         full_name LIKE ? OR
         email LIKE ? OR
         mobile LIKE ? OR
         user_id LIKE ? OR
         city LIKE ? OR
         state LIKE ?
       )
       ORDER BY created_at DESC`,
      [like, like, like, like, like, like, like]
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

    if (!userId || !username || !fullName || !email || !password) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Missing required fields' });
    }

    // Normalize mobile (store as string exactly as provided)
    const mobileVal = mobile ? String(mobile).trim() : '';

    // Check any conflict for user_id, username, email, mobile
    const [existing] = await pool.query(
      `SELECT id, user_id, username, email, mobile FROM users
       WHERE user_id = ? OR username = ? OR email = ? OR mobile = ?`,
      [userId, username, email, mobileVal]
    );

    if (existing.length > 0) {
      const fields = findDuplicateFields(existing, {
        userId,
        username,
        email,
        mobile: mobileVal,
      });

      return res.status(400).json({
        error: 'DUPLICATE',
        fields,
        message: `Duplicate fields: ${fields.join(', ')}`,
      });
    }

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
        mobileVal,
        country || null,
        state || null,
        city || null,
        address || null,
        pincode || null,
        passwordHash,
      ]
    );

    res.status(201).json({ message: 'USER_CREATED' });
  } catch (err) {
    // If somehow a duplicate slipped through (race), catch mysql duplicate error
    if (err?.code === 'ER_DUP_ENTRY') {
      // friendly fallback response
      return res.status(400).json({ error: 'DUPLICATE', message: 'Entry already exists' });
    }
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

    if (!id) return res.status(400).json({ error: 'VALIDATION', message: 'Missing id' });

    const mobileVal = mobile ? String(mobile).trim() : '';

    // Check if email/mobile belong to another user
    const [existing] = await pool.query(
      `SELECT id, email, mobile FROM users WHERE (email = ? OR mobile = ?) AND id != ?`,
      [email, mobileVal, id]
    );

    if (existing.length > 0) {
      const fields = [];
      for (const r of existing) {
        if (r.email === email) fields.push('email');
        if (r.mobile === mobileVal) fields.push('mobile');
      }
      // dedupe
      const uniqueFields = [...new Set(fields)];
      return res.status(400).json({
        error: 'DUPLICATE',
        fields: uniqueFields,
        message: `Duplicate fields: ${uniqueFields.join(', ')}`,
      });
    }

    await pool.query(
      `UPDATE users SET full_name = ?, email = ?, mobile = ?, country = ?, state = ?, city = ?, address = ?, pincode = ? WHERE id = ? AND role = 'user'`,
      [fullName, email, mobileVal, country || null, state || null, city || null, address || null, pincode || null, id]
    );

    res.json({ message: 'USER_UPDATED' });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = ? AND role = 'user'", [id]);
    res.json({ message: 'USER_DELETED' });
  } catch (err) {
    next(err);
  }
};
