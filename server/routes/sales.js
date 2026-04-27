const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all sales
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer_id, channel_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT s.*, c.name as customer_name, ch.name as channel_name, ch.color as channel_color
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN sales_channels ch ON s.channel_id = ch.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND s.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (customer_id) {
      query += ` AND s.customer_id = $${paramIndex++}`;
      params.push(customer_id);
    }
    
    if (channel_id) {
      query += ` AND s.channel_id = $${paramIndex++}`;
      params.push(channel_id);
    }
    
    if (start_date) {
      query += ` AND s.sale_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND s.sale_date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    query += ` ORDER BY s.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM sales WHERE 1=1';
    const countParams = [];
    let countIndex = 1;
    
    if (status) {
      countQuery += ` AND status = $${countIndex++}`;
      countParams.push(status);
    }
    
    if (customer_id) {
      countQuery += ` AND customer_id = $${countIndex++}`;
      countParams.push(customer_id);
    }
    
    if (channel_id) {
      countQuery += ` AND channel_id = $${countIndex++}`;
      countParams.push(channel_id);
    }
    
    if (start_date) {
      countQuery += ` AND sale_date >= $${countIndex++}`;
      countParams.push(start_date);
    }
    
    if (end_date) {
      countQuery += ` AND sale_date <= $${countIndex++}`;
      countParams.push(end_date);
    }
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      sales: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// GET single sale by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT s.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
             ch.name as channel_name, ch.color as channel_color
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN sales_channels ch ON s.channel_id = ch.id
      WHERE s.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// POST create new sale
router.post('/', async (req, res) => {
  try {
    const { invoice_number, customer_id, channel_id, amount, status = 'PENDING', sale_date, description } = req.body;
    
    // Check if invoice number already exists
    const existingInvoice = await db.query('SELECT id FROM sales WHERE invoice_number = $1', [invoice_number]);
    if (existingInvoice.rows.length > 0) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }
    
    const query = `
      INSERT INTO sales (invoice_number, customer_id, channel_id, amount, status, sale_date, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [invoice_number, customer_id, channel_id, amount, status, sale_date || new Date().toISOString().split('T')[0], description];
    const result = await db.query(query, values);
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['CREATE', 'sales', result.rows[0].id, `Created sale: ${invoice_number}`]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// PUT update sale
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { invoice_number, customer_id, channel_id, amount, status, sale_date, description } = req.body;
    
    // Check if sale exists
    const existingSale = await db.query('SELECT * FROM sales WHERE id = $1', [id]);
    if (existingSale.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    // Check if invoice number is being changed and if it conflicts
    if (invoice_number !== existingSale.rows[0].invoice_number) {
      const invoiceConflict = await db.query('SELECT id FROM sales WHERE invoice_number = $1 AND id != $2', [invoice_number, id]);
      if (invoiceConflict.rows.length > 0) {
        return res.status(400).json({ error: 'Invoice number already exists' });
      }
    }
    
    const query = `
      UPDATE sales 
      SET invoice_number = $1, customer_id = $2, channel_id = $3, amount = $4, status = $5, sale_date = $6, description = $7
      WHERE id = $8
      RETURNING *
    `;
    
    const values = [invoice_number, customer_id, channel_id, amount, status, sale_date, description, id];
    const result = await db.query(query, values);
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['UPDATE', 'sales', id, `Updated sale: ${invoice_number}`]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: 'Failed to update sale' });
  }
});

// DELETE sale
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if sale exists
    const existingSale = await db.query('SELECT invoice_number FROM sales WHERE id = $1', [id]);
    if (existingSale.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    await db.query('DELETE FROM sales WHERE id = $1', [id]);
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['DELETE', 'sales', id, `Deleted sale: ${existingSale.rows[0].invoice_number}`]
    );
    
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

// GET sales channels
router.get('/channels/list', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sales_channels ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales channels:', error);
    res.status(500).json({ error: 'Failed to fetch sales channels' });
  }
});

module.exports = router;
