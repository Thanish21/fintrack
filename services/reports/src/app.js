const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
const pkg = require('../package.json');

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const app = express();
app.use(cors());
app.use(express.json());

function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Used in the blue-green demo to see which version is live
app.get('/reports/version', (_, res) =>
  res.json({
    version: process.env.APP_VERSION || pkg.version,
    chart: process.env.CHART_LIB || 'chartjs-3',
  }));

// feature/report-monthly-summary
app.get('/reports/monthly', auth, async (req, res) => {
  const month = req.query.month;
  if (!/^\d{4}-\d{2}$/.test(month || '')) return res.status(400).json({ error: 'month=YYYY-MM required' });
  const r = await db.query(
    `SELECT type, COALESCE(SUM(amount_cents),0)::int AS total
     FROM transactions WHERE user_id=$1 AND to_char(date,'YYYY-MM')=$2 GROUP BY type`,
    [req.user.id, month]);
  const get = t => (r.rows.find(x => x.type === t) || { total: 0 }).total;
  const totalIncome = get('income');
  const totalExpense = get('expense');
  res.json({ month, totalIncome, totalExpense, balance: totalIncome - totalExpense });
});

// feature/report-category-breakdown
app.get('/reports/by-category', auth, async (req, res) => {
  const r = await db.query(
    `SELECT category, SUM(amount_cents)::int AS total FROM transactions
     WHERE user_id=$1 AND type='expense' GROUP BY category ORDER BY total DESC`, [req.user.id]);
  res.json({ labels: r.rows.map(x => x.category), data: r.rows.map(x => x.total) });
});

module.exports = app;
