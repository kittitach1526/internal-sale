const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET monthly sales summary
router.get('/sales/monthly', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const query = `
      SELECT 
        TO_CHAR(sale_date, 'Mon') as month,
        EXTRACT(MONTH FROM sale_date) as month_number,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM sales 
      WHERE status = 'SUCCESS' AND EXTRACT(YEAR FROM sale_date) = $1
      GROUP BY TO_CHAR(sale_date, 'Mon'), EXTRACT(MONTH FROM sale_date)
      ORDER BY month_number
    `;
    
    const result = await db.query(query, [year]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ error: 'Failed to fetch monthly sales data' });
  }
});

// GET sales by channel
router.get('/sales/channels', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        ch.name as channel_name,
        ch.color as channel_color,
        COUNT(s.id) as transaction_count,
        COALESCE(SUM(s.amount), 0) as total_amount,
        AVG(s.amount) as average_amount
      FROM sales_channels ch
      LEFT JOIN sales s ON ch.id = s.channel_id AND s.status = 'SUCCESS'
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (start_date) {
      query += ` AND s.sale_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND s.sale_date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    query += ` GROUP BY ch.id, ch.name, ch.color ORDER BY total_amount DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales by channel:', error);
    res.status(500).json({ error: 'Failed to fetch sales by channel data' });
  }
});

// GET expense summary by category
router.get('/expenses/categories', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        ec.name as category_name,
        ec.color as category_color,
        ec.is_fixed_cost,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_amount,
        AVG(e.amount) as average_amount
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
    
    query += ` GROUP BY ec.id, ec.name, ec.color, ec.is_fixed_cost ORDER BY total_amount DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ error: 'Failed to fetch expense categories data' });
  }
});

// GET monthly expenses
router.get('/expenses/monthly', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const query = `
      SELECT 
        TO_CHAR(expense_date, 'Mon') as month,
        EXTRACT(MONTH FROM expense_date) as month_number,
        COUNT(*) as expense_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM expenses 
      WHERE EXTRACT(YEAR FROM expense_date) = $1
      GROUP BY TO_CHAR(expense_date, 'Mon'), EXTRACT(MONTH FROM expense_date)
      ORDER BY month_number
    `;
    
    const result = await db.query(query, [year]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({ error: 'Failed to fetch monthly expenses data' });
  }
});

// GET dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Default to current month if no dates provided
    const currentMonth = new Date().toISOString().slice(0, 7);
    const defaultStartDate = start_date || `${currentMonth}-01`;
    const defaultEndDate = end_date || new Date().toISOString().split('T')[0];
    
    // Get total sales
    const salesQuery = `
      SELECT 
        COUNT(*) as sales_count,
        COALESCE(SUM(amount), 0) as total_sales,
        AVG(amount) as average_sale
      FROM sales 
      WHERE status = 'SUCCESS' AND sale_date BETWEEN $1 AND $2
    `;
    
    // Get total expenses
    const expensesQuery = `
      SELECT 
        COUNT(*) as expense_count,
        COALESCE(SUM(amount), 0) as total_expenses,
        AVG(amount) as average_expense
      FROM expenses 
      WHERE expense_date BETWEEN $1 AND $2
    `;
    
    // Get monthly target progress (assuming target is 500,000 baht)
    const targetQuery = `
      SELECT 
        COALESCE(SUM(amount), 0) as current_month_sales,
        CASE 
          WHEN COALESCE(SUM(amount), 0) >= 500000 THEN 100
          ELSE ROUND((COALESCE(SUM(amount), 0) / 500000) * 100, 2)
        END as target_percentage,
        500000 - COALESCE(SUM(amount), 0) as remaining_target
      FROM sales 
      WHERE status = 'SUCCESS' AND sale_date BETWEEN $1 AND $2
    `;
    
    // Get recent sales
    const recentSalesQuery = `
      SELECT 
        s.invoice_number,
        c.name as customer_name,
        s.amount,
        s.status,
        s.sale_date
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `;
    
    // Get recent expenses
    const recentExpensesQuery = `
      SELECT 
        e.description,
        ec.name as category_name,
        ec.color as category_color,
        e.amount,
        e.expense_date
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      ORDER BY e.created_at DESC
      LIMIT 5
    `;
    
    const [salesResult, expensesResult, targetResult, recentSalesResult, recentExpensesResult] = await Promise.all([
      db.query(salesQuery, [defaultStartDate, defaultEndDate]),
      db.query(expensesQuery, [defaultStartDate, defaultEndDate]),
      db.query(targetQuery, [defaultStartDate, defaultEndDate]),
      db.query(recentSalesQuery),
      db.query(recentExpensesQuery)
    ]);
    
    const dashboard = {
      summary: {
        total_sales: parseFloat(salesResult.rows[0]?.total_sales || 0),
        sales_count: parseInt(salesResult.rows[0]?.sales_count || 0),
        total_expenses: parseFloat(expensesResult.rows[0]?.total_expenses || 0),
        expense_count: parseInt(expensesResult.rows[0]?.expense_count || 0),
        net_profit: parseFloat(salesResult.rows[0]?.total_sales || 0) - parseFloat(expensesResult.rows[0]?.total_expenses || 0)
      },
      target: {
        current_month_sales: parseFloat(targetResult.rows[0]?.current_month_sales || 0),
        target_percentage: parseFloat(targetResult.rows[0]?.target_percentage || 0),
        remaining_target: parseFloat(targetResult.rows[0]?.remaining_target || 500000),
        monthly_target: 500000
      },
      recent_sales: recentSalesResult.rows,
      recent_expenses: recentExpensesResult.rows
    };
    
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET activity logs
router.get('/activity-logs', async (req, res) => {
  try {
    const { page = 1, limit = 20, action, table_name } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM activity_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(action);
    }
    
    if (table_name) {
      query += ` AND table_name = $${paramIndex++}`;
      params.push(table_name);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM activity_logs WHERE 1=1';
    const countParams = [];
    let countIndex = 1;
    
    if (action) {
      countQuery += ` AND action = $${countIndex++}`;
      countParams.push(action);
    }
    
    if (table_name) {
      countQuery += ` AND table_name = $${countIndex++}`;
      countParams.push(table_name);
    }
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

module.exports = router;
