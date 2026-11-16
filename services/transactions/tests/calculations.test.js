const { calculateBalance, totalByType, totalsByCategory } = require('../src/calculations');

const txs = [
  { type: 'income',  amount_cents: 500000, category: 'Salary' },
  { type: 'expense', amount_cents: 120050, category: 'Rent' },
  { type: 'expense', amount_cents: 30010,  category: 'Rent' },
  { type: 'expense', amount_cents: 5000,   category: 'Food' },
];

test('balance = income - expenses in cents', () => {
  expect(calculateBalance(txs)).toBe(344940);
});
test('empty list gives 0', () => {
  expect(calculateBalance([])).toBe(0);
});
test('invalid type throws', () => {
  expect(() => calculateBalance([{ type: 'gift', amount_cents: 1 }])).toThrow('Invalid transaction type');
});
test('totalByType sums correctly', () => {
  expect(totalByType(txs, 'income')).toBe(500000);
  expect(totalByType(txs, 'expense')).toBe(155060);
});
test('totalsByCategory groups expenses and ignores income', () => {
  expect(totalsByCategory(txs)).toEqual({ Rent: 150060, Food: 5000 });
});
test('no floating point drift: 10 cents + 20 cents', () => {
  expect(calculateBalance([
    { type: 'income', amount_cents: 10 }, { type: 'income', amount_cents: 20 },
  ])).toBe(30);
});
