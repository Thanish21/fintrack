const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const db = require('../src/db');

const USER_ID = 999999;
const token = jwt.sign({ id: USER_ID }, process.env.JWT_SECRET || 'dev-secret');
const seed = [
  ['income', 500000, 'Salary', '2026-10-01'],
  ['expense', 120050, 'Rent', '2026-10-02'],
  ['expense', 30010, 'Food', '2026-10-05'],
  ['expense', 9999, 'Food', '2026-09-30'], // different month, excluded from October
];

beforeAll(async () => {
  await db.query('DELETE FROM transactions WHERE user_id=$1', [USER_ID]);
  for (const [type, amt, cat, date] of seed)
    await db.query(
      'INSERT INTO transactions(user_id,type,amount_cents,category,date) VALUES($1,$2,$3,$4,$5)',
      [USER_ID, type, amt, cat, date]);
});
afterAll(async () => {
  await db.query('DELETE FROM transactions WHERE user_id=$1', [USER_ID]);
  await db.end();
});

test('monthly report matches underlying October data', async () => {
  const res = await request(app).get('/reports/monthly?month=2026-10')
    .set('Authorization', `Bearer ${token}`);
  expect(res.body.totalIncome).toBe(500000);
  expect(res.body.totalExpense).toBe(150060);
  expect(res.body.balance).toBe(349940);
});
test('category report matches data', async () => {
  const res = await request(app).get('/reports/by-category')
    .set('Authorization', `Bearer ${token}`);
  expect(res.body.labels).toEqual(['Rent', 'Food']);
  expect(res.body.data).toEqual([120050, 40009]);
});
test('rejects bad month', async () => {
  const res = await request(app).get('/reports/monthly?month=oops')
    .set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(400);
});
