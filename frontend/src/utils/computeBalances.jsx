// expenses: array of { amount, payerId, participants: [uid,...], splitDetails: { uid: amount } }
// returns map uid -> net balance (positive = others owe them)
export default function computeBalances(expenses = []) {
  const balances = {};
  for (const e of expenses) {
    const amount = Number(e.amount) || 0;
    const participants = (e.participants && e.participants.length) ? e.participants : [];

    // Initialize balances for payer and participants if not present
    if (!balances[e.payerId]) balances[e.payerId] = 0;
    participants.forEach(p => {
      if (!balances[p]) balances[p] = 0;
    });

    if (participants.length === 0) {
      // if no participants listed, treat payer as the only one (no split)
      balances[e.payerId] += amount;
      continue;
    }

    // Check for custom split details
    if (e.splitDetails && Object.keys(e.splitDetails).length > 0) {
      // Custom split: deduct specific amount for each participant
      for (const p of participants) {
        const oweAmount = Number(e.splitDetails[p]) || 0;
        balances[p] -= oweAmount;
      }
      // Payer gets back the total amount (they paid it all)
      // The net effect for payer is: +TotalAmount - TheirShare
      // But here we just add +TotalAmount to payer, and subtract TheirShare from payer in the loop above if they are in participants
      balances[e.payerId] += amount;
    } else {
      // Default equal split
      const share = amount / participants.length;
      for (const p of participants) {
        balances[p] -= share;
      }
      balances[e.payerId] += amount;
    }
  }
  return balances;
}
