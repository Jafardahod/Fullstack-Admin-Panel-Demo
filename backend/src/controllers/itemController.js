import pool from '../config/db.js';

export const getItems = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, item_name, item_price, item_type FROM items'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const { itemName, itemPrice, itemType } = req.body;

    await pool.query(
      'INSERT INTO items (item_name, item_price, item_type) VALUES (?, ?, ?)',
      [itemName, itemPrice, itemType]
    );
    res.status(201).json({ message: 'Item created' });
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemName, itemPrice, itemType } = req.body;

    await pool.query(
      'UPDATE items SET item_name = ?, item_price = ?, item_type = ? WHERE id = ?',
      [itemName, itemPrice, itemType, id]
    );
    res.json({ message: 'Item updated' });
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM items WHERE id = ?', [id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
};
