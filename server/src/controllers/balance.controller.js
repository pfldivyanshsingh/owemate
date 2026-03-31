const supabase = require('../utils/supabase');
const { createNotification } = require('./notification.controller');

const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get all expenses in group
    const { data: expenses, error: expErr } = await supabase
      .from('expenses')
      .select('id, amount, paid_by')
      .eq('group_id', groupId);

    if (expErr) throw expErr;

    const expenseIds = expenses.map((e) => e.id);
    if (!expenseIds.length) return res.json({ balances: [], netBalances: [] });

    // Get all unsettled splits
    const { data: splits, error: splitErr } = await supabase
      .from('expense_splits')
      .select('user_id, amount, expense_id')
      .in('expense_id', expenseIds)
      .eq('is_settled', false);

    if (splitErr) throw splitErr;

    // Build payer map (expense_id -> paid_by, amount)
    const payerMap = {};
    for (const e of expenses) {
      payerMap[e.id] = { paid_by: e.paid_by, amount: parseFloat(e.amount) };
    }

    // Calculate who owes whom
    const debtMap = {}; // key: "fromUser:toUser", value: amount

    for (const split of splits) {
      const payer = payerMap[split.expense_id]?.paid_by;
      if (!payer || split.user_id === payer) continue;

      const key = `${split.user_id}:${payer}`;
      debtMap[key] = (debtMap[key] || 0) + parseFloat(split.amount);
    }

    // Simplify debts (net out mutual debts)
    const netDebts = [];
    const processedPairs = new Set();

    for (const [key, amount] of Object.entries(debtMap)) {
      if (processedPairs.has(key)) continue;
      const [from, to] = key.split(':');
      const reverseKey = `${to}:${from}`;
      processedPairs.add(key);
      processedPairs.add(reverseKey);

      const reverseAmount = debtMap[reverseKey] || 0;
      const net = amount - reverseAmount;

      if (net > 0.01) {
        netDebts.push({ from, to, amount: parseFloat(net.toFixed(2)) });
      } else if (net < -0.01) {
        netDebts.push({ from: to, to: from, amount: parseFloat(Math.abs(net).toFixed(2)) });
      }
    }

    // Get member info
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id, user:users(id, name, avatar_url)')
      .eq('group_id', groupId);

    // Calculate net balance per user
    const balanceMap = {};
    for (const m of members) {
      balanceMap[m.user_id] = 0;
    }

    for (const debt of netDebts) {
      balanceMap[debt.from] = (balanceMap[debt.from] || 0) - debt.amount;
      balanceMap[debt.to] = (balanceMap[debt.to] || 0) + debt.amount;
    }

    const netBalances = members.map((m) => ({
      user: m.user,
      balance: parseFloat((balanceMap[m.user_id] || 0).toFixed(2)),
    }));

    res.json({ balances: netDebts, netBalances, members });
  } catch (err) {
    console.error('Get balances error:', err);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
};

const settleUp = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { to_user, amount, note } = req.body;
    const from_user = req.user.id;

    if (!to_user || !amount) {
      return res.status(400).json({ error: 'to_user and amount are required' });
    }

    const settleAmount = parseFloat(amount);

    // Record transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        group_id: groupId,
        from_user,
        to_user,
        amount: settleAmount,
        note,
      })
      .select()
      .single();

    if (error) throw error;

    // Mark splits as settled (partially or fully)
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, paid_by')
      .eq('group_id', groupId)
      .eq('paid_by', to_user);

    let remaining = settleAmount;

    for (const expense of expenses || []) {
      if (remaining <= 0) break;

      const { data: split } = await supabase
        .from('expense_splits')
        .select('*')
        .eq('expense_id', expense.id)
        .eq('user_id', from_user)
        .eq('is_settled', false)
        .single();

      if (split) {
        if (remaining >= parseFloat(split.amount)) {
          await supabase
            .from('expense_splits')
            .update({ is_settled: true })
            .eq('id', split.id);
          remaining -= parseFloat(split.amount);
        }
      }
    }

    // Notify the recipient
    await createNotification(
      to_user,
      'payment_received',
      `${req.user.name} paid you ₹${settleAmount}`,
      { groupId, transactionId: transaction.id, from_user }
    );

    // Emit realtime event
    const io = req.app.get('io');
    if (io) {
      io.to(groupId).emit('payment_settled', {
        transaction,
        fromUser: req.user,
        amount: settleAmount,
      });
    }

    res.status(201).json({ transaction, message: `Payment of ₹${settleAmount} recorded!` });
  } catch (err) {
    console.error('Settle up error:', err);
    res.status(500).json({ error: 'Failed to record settlement' });
  }
};

const getGroupTransactions = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        from_user_info:users!transactions_from_user_fkey(id, name, avatar_url),
        to_user_info:users!transactions_to_user_fkey(id, name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ transactions });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

module.exports = { getGroupBalances, settleUp, getGroupTransactions };
