const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM customers WHERE 1=1';
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1)`;
    }
    
    const countResult = await db.query(countQuery, search ? [`%${search}%`] : []);
    
    res.json({
      customers: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get customer's sales history
    const salesQuery = `
      SELECT s.*, ch.name as channel_name
      FROM sales s
      LEFT JOIN sales_channels ch ON s.channel_id = ch.id
      WHERE s.customer_id = $1
      ORDER BY s.created_at DESC
    `;
    const salesResult = await db.query(salesQuery, [id]);
    
    const customer = result.rows[0];
    customer.sales_history = salesResult.rows;
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// POST create new customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, company, tax_id } = req.body;
    
    const query = `
      INSERT INTO customers (name, email, phone, address, company, tax_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [name, email, phone, address, company, tax_id];
    const result = await db.query(query, values);
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['CREATE', 'customers', result.rows[0].id, `Created customer: ${name}`]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, company, tax_id } = req.body;
    
    // Check if customer exists
    const existingCustomer = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const query = `
      UPDATE customers 
      SET name = $1, email = $2, phone = $3, address = $4, company = $5, tax_id = $6
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [name, email, phone, address, company, tax_id, id];
    const result = await db.query(query, values);
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['UPDATE', 'customers', id, `Updated customer: ${name}`]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const existingCustomer = await db.query('SELECT name FROM customers WHERE id = $1', [id]);
    if (existingCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check if customer has sales records
    const salesCount = await db.query('SELECT COUNT(*) FROM sales WHERE customer_id = $1', [id]);
    if (parseInt(salesCount.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing sales records',
        message: 'Please delete or reassign sales records first'
      });
    }
    
    await db.query('DELETE FROM customers WHERE id = $1', [id]);
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (action, table_name, record_id, description) VALUES ($1, $2, $3, $4)',
      ['DELETE', 'customers', id, `Deleted customer: ${existingCustomer.rows[0].name}`]
    );
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
