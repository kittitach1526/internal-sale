const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT e.*, ec.name as category_name, ec.color as category_color
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (category_id) {
      query += ` AND e.category_id = $${paramIndex++}`;
      params.push(category_id);
    }
    
    if (start_date) {
      query += ` AND e.expense_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND e.expense_date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    query += ` ORDER BY e.expense_date DESC, e.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM expenses WHERE 1=1';
    const countParams = [];
    let countIndex = 1;
    
    if (category_id) {
      countQuery += ` AND category_id = $${countIndex++}`;
      countParams.push(category_id);
    }
    
    if (start_date) {
      countQuery += ` AND expense_date >= $${countIndex++}`;
      countParams.push(start_date);
    }
    
    if (end_date) {
      countQuery += ` AND expense_date <= $${countIndex++}`;
      countParams.push(end_date);
    }
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      expenses: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET single expense by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT e.*, ec.name as category_name, ec.color as category_color
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    // Get expense items if any
    const itemsQuery = 'SELECT * FROM expense_items WHERE expense_id = $1';
    const itemsResult = await db.query(itemsQuery, [id]);
    
    const expense = result.rows[0];
    expense.items = itemsResult.rows;
    
    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// POST create new expense
router.post('/', async (req, res) => {
  try {
    const { category_id, amount, expense_date, description, notes, items } = req.body;
    
    const query = `
      INSERT INTO expenses (category_id, amount, expense_date, description, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [category_id, amount, expense_date || new Date().toISOString().split('T')[0], description, notes];
    const result = await db.query(query, values);
    
    const expense = result.rows[0];
    
    // Add expense items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await db.query(
          'INSERT INTO expense_items (expense_id, item_name, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [expense.id, item.item_name, item.quantity, item.unit_price]
        );
      }
    }
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['CREATE', 'expenses', expense.id, `Created expense: ${description}`]
    );
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, amount, expense_date, description, notes, items } = req.body;
    
    // Check if expense exists
    const existingExpense = await db.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (existingExpense.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    const query = `
      UPDATE expenses 
      SET category_id = $1, amount = $2, expense_date = $3, description = $4, notes = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [category_id, amount, expense_date, description, notes, id];
    const result = await db.query(query, values);
    
    // Update expense items - remove existing and add new ones
    await db.query('DELETE FROM expense_items WHERE expense_id = $1', [id]);
    
    if (items && items.length > 0) {
      for (const item of items) {
        await db.query(
          'INSERT INTO expense_items (expense_id, item_name, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [id, item.item_name, item.quantity, item.unit_price]
        );
      }
    }
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['UPDATE', 'expenses', id, `Updated expense: ${description}`]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if expense exists
    const existingExpense = await db.query('SELECT description FROM expenses WHERE id = $1', [id]);
    if (existingExpense.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    // Delete expense items first (foreign key constraint)
    await db.query('DELETE FROM expense_items WHERE expense_id = $1', [id]);
    
    // Delete expense
    await db.query('DELETE FROM expenses WHERE id = $1', [id]);
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['DELETE', 'expenses', id, `Deleted expense: ${existingExpense.rows[0].description}`]
    );
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// GET expense categories
router.get('/categories/list', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expense_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ error: 'Failed to fetch expense categories' });
  }
});

// GET expenses by category with totals
router.get('/category/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT ec.*, COUNT(e.id) as expense_count, COALESCE(SUM(e.amount), 0) as total_amount
      FROM expense_categories ec
      LEFT JOIN expenses e ON ec.id = e.category_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (start_date) {
      query += ` AND e.expense_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND e.expense_date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    query += ` GROUP BY ec.id ORDER BY total_amount DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expense category summary:', error);
    res.status(500).json({ error: 'Failed to fetch expense category summary' });
  }
});

module.exports = router;
