const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { calculateBalance, totalByType, totalsByCategory } = require('./calculations');

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

app.post('/transactions', auth, async (req, res) => {
  const { type, amount_cents, category, description, date } = req.body;
  if (!['income', 'expense'].includes(type) || !Number.isInteger(amount_cents) ||
      amount_cents <= 0 || !category || !date)
    return res.status(400).json({ error: 'invalid transaction' });
  const r = await db.query(
    `INSERT INTO transactions(user_id,type,amount_cents,category,description,date)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, type, amount_cents, category, description || '', date]);
  res.status(201).json(r.rows[0]);
});

app.get('/transactions', auth, async (req, res) => {
  const r = await db.query(
    'SELECT * FROM transactions WHERE user_id=$1 ORDER BY date DESC, id DESC', [req.user.id]);
  res.json(r.rows);
});

app.delete('/transactions/:id', auth, async (req, res) => {
  await db.query('DELETE FROM transactions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.status(204).end();
});

app.get('/transactions/summary', auth, async (req, res) => {
  const r = await db.query('SELECT * FROM transactions WHERE user_id=$1', [req.user.id]);
  res.json({
    balance: calculateBalance(r.rows),
    totalIncome: totalByType(r.rows, 'income'),
    totalExpense: totalByType(r.rows, 'expense'),
    byCategory: totalsByCategory(r.rows),
  });
});

module.exports = app;
