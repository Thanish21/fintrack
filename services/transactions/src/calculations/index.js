function assertType(t) {
  if (t.type !== 'income' && t.type !== 'expense') {
    throw new Error('Invalid transaction type: ' + t.type);
  }
}

// All amounts are integer cents, which avoids floating-point errors.
function calculateBalance(txs) {
  return txs.reduce((sum, t) => {
    assertType(t);
    return t.type === 'income' ? sum + t.amount_cents : sum - t.amount_cents;
  }, 0);
}

function totalByType(txs, type) {
  return txs.filter(t => t.type === type).reduce((s, t) => s + t.amount_cents, 0);
}

function totalsByCategory(txs) {
  const out = {};
  for (const t of txs) {
    if (t.type !== 'expense') continue;
    out[t.category] = (out[t.category] || 0) + t.amount_cents;
  }
  return out;
}

module.exports = { calculateBalance, totalByType, totalsByCategory };
