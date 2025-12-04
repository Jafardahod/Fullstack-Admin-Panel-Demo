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

/**
 * Map UI/backend incoming user type values to DB role values.
 * Accepts: userType (e.g. "Admin User" / "Normal User"), or user_type, or role.
 * Result: 'admin' or 'user' (default 'user').
 */
const normalizeRole = (body) => {
  if (!body) return 'user';
  const raw =
    (body.userType && String(body.userType).trim()) ||
    (body.user_type && String(body.user_type).trim()) ||
    (body.role && String(body.role).trim()) ||
    '';
  if (!raw) return 'user';
  if (/admin/i.test(raw) || raw.toLowerCase() === 'admin') return 'admin';
  return 'user';
};

export const getUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();

    // Expect authMiddleware to have attached the requester info.
    // e.g. req.user = { id: 123, role: 'admin' }
    const requester = req.user || {};
    const requesterId = requester.id || null;
    const isAdmin = String(requester.role || '').toLowerCase() === 'admin';

    // Columns we return (same as before + is_active)
    const cols =
      'id, user_id, username, full_name, email, mobile, country, state, city, address, pincode, role, is_active, created_at';

    // Helper to build search clause used in both admin and non-admin flows
    const buildSearchClause = () => {
      return `(
        username LIKE ? OR
        full_name LIKE ? OR
        email LIKE ? OR
        mobile LIKE ? OR
        user_id LIKE ? OR
        city LIKE ? OR
        state LIKE ?
      )`;
    };

    if (!q) {
      // No search: return either all users (except self) for admins,
      // or only role='user' for non-admins (backwards compatible).
      if (isAdmin) {
        // Admin: return all users except the requesting admin
        if (requesterId) {
          const [rows] = await pool.query(
            `SELECT ${cols} FROM users WHERE id != ? ORDER BY created_at DESC`,
            [requesterId]
          );
          return res.json(rows);
        } else {
          // Fallback: if no requester id available, return all users
          const [rows] = await pool.query(
            `SELECT ${cols} FROM users ORDER BY created_at DESC`
          );
          return res.json(rows);
        }
      } else {
        // Non-admin (previous behaviour) — return only normal users
        const [rows] = await pool.query(
          `SELECT ${cols} FROM users WHERE role = 'user' ORDER BY created_at DESC`
        );
        return res.json(rows);
      }
    }

    // Search case
    const like = `%${q}%`;

    if (isAdmin) {
      // Search across all users but exclude the requesting admin's row
      if (requesterId) {
        const [rows] = await pool.query(
          `SELECT ${cols} FROM users
           WHERE ${buildSearchClause()} AND id != ?
           ORDER BY created_at DESC`,
          [like, like, like, like, like, like, like, requesterId]
        );
        return res.json(rows);
      } else {
        // fallback - no requesterId
        const [rows] = await pool.query(
          `SELECT ${cols} FROM users
           WHERE ${buildSearchClause()}
           ORDER BY created_at DESC`,
          [like, like, like, like, like, like, like]
        );
        return res.json(rows);
      }
    } else {
      // Non-admin search: keep showing only role='user'
      const [rows] = await pool.query(
        `SELECT ${cols} FROM users
         WHERE role = 'user' AND ${buildSearchClause()}
         ORDER BY created_at DESC`,
        [like, like, like, like, like, like, like]
      );
      return res.json(rows);
    }
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

    // Determine role from payload (accept userType/user_type/role)
    const role = normalizeRole(req.body); // 'admin' or 'user'

    if (!userId || !username || !fullName || !email || !password) {
      return res.status(400).json({ error: 'VALIDATION', message: 'Missing required fields' });
    }

    // Normalize mobile (store as string exactly as provided)
    const mobileVal = mobile ? String(mobile).trim() : '';

    // Check any conflict for user_id, username, email, mobile (global)
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
      (user_id, username, full_name, email, mobile, country, state, city, address, pincode, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
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
        role,
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

    // If front sends userType / user_type / role, allow admin to change role here.
    const role = normalizeRole(req.body);

    await pool.query(
      `UPDATE users
        SET full_name = ?, email = ?, mobile = ?, country = ?, state = ?, city = ?, address = ?, pincode = ?, role = ?
       WHERE id = ? AND role = 'user'`,
      [fullName, email, mobileVal, country || null, state || null, city || null, address || null, pincode || null, role, id]
    );

    res.json({ message: 'USER_UPDATED' });
  } catch (err) {
    next(err);
  }
};

// soft-delete -> deactivate user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'VALIDATION', message: 'Missing id' });

    // Set is_active = 0 rather than deleting
    await pool.query("UPDATE users SET is_active = 0 WHERE id = ? AND role = 'user'", [id]);

    res.json({ message: 'USER_DEACTIVATED' });
  } catch (err) {
    next(err);
  }
};

// activate user (admin only)
export const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'VALIDATION', message: 'Missing id' });

    await pool.query("UPDATE users SET is_active = 1 WHERE id = ?", [id]);

    res.json({ message: 'USER_ACTIVATED' });
  } catch (err) {
    next(err);
  }
};
