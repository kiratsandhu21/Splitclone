// expenses: array of { amount, payerId, participants: [uid,...] }
// returns map uid -> net balance (positive = others owe them)
export default function computeBalances(expenses = []) {
  const balances = {};
  for (const e of expenses) {
    const amount = Number(e.amount) || 0;
    const participants = (e.participants && e.participants.length) ? e.participants : [];
    if (participants.length === 0) {
      // if no participants listed, treat payer as the only one (no split)
      balances[e.payerId] = (balances[e.payerId] || 0) + amount;
      continue;
    }
    const share = amount / participants.length;
    for (const p of participants) {
      balances[p] = (balances[p] || 0) - share;
    }
    balances[e.payerId] = (balances[e.payerId] || 0) + amount;
  }
  return balances;
}
