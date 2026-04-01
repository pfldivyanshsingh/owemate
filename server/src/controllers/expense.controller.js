const supabase = require('../utils/supabase');
const { createNotification } = require('./notification.controller');

const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { category, from, to, minAmount, maxAmount, search } = req.query;

    let query = supabase
      .from('expenses')
      .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey(id, name, email, avatar_url),
        category:categories(id, name, icon),
        splits:expense_splits(*, user:users(id, name, avatar_url))
      `)
      .eq('group_id', groupId)
      .order('date', { ascending: false });

    if (category) query = query.eq('category_id', category);
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);
    if (minAmount) query = query.gte('amount', minAmount);
    if (maxAmount) query = query.lte('amount', maxAmount);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data: expenses, error } = await query;
    if (error) throw error;

    res.json({ expenses });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

const addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, amount, date, paid_by, category_id, split_method, splits, notes } = req.body;
    const addedById = req.user.id;

    if (!title || !amount || !date || !paid_by) {
      return res.status(400).json({ error: 'Title, amount, date and paidBy are required' });
    }

    // Create expense
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        title,
        amount: parseFloat(amount),
        date,
        paid_by,
        added_by: addedById,
        category_id,
        split_method: split_method || 'equal',
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Get group members
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    const memberIds = members.map((m) => m.user_id);
    let splitRows = [];

    if (split_method === 'equal' || !split_method) {
      const perPerson = parseFloat(amount) / memberIds.length;
      splitRows = memberIds.map((uid) => ({
        expense_id: expense.id,
        user_id: uid,
        amount: parseFloat(perPerson.toFixed(2)),
        is_settled: uid === paid_by, // Payer's own share is settled
      }));
    } else if (split_method === 'unequal') {
      splitRows = splits.map((s) => ({
        expense_id: expense.id,
        user_id: s.user_id,
        amount: parseFloat(s.amount),
        is_settled: s.user_id === paid_by,
      }));
    } else if (split_method === 'percentage') {
      splitRows = splits.map((s) => ({
        expense_id: expense.id,
        user_id: s.user_id,
        amount: parseFloat(((parseFloat(amount) * s.percentage) / 100).toFixed(2)),
        percentage: s.percentage,
        is_settled: s.user_id === paid_by,
      }));
    } else if (split_method === 'selective') {
      const selectedIds = splits.map((s) => s.user_id);
      const perPerson = parseFloat(amount) / selectedIds.length;
      splitRows = selectedIds.map((uid) => ({
        expense_id: expense.id,
        user_id: uid,
        amount: parseFloat(perPerson.toFixed(2)),
        is_settled: uid === paid_by,
      }));
    }

    const { error: splitError } = await supabase.from('expense_splits').insert(splitRows);
    if (splitError) throw splitError;

    // Get full expense with splits
    const { data: fullExpense } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey(id, name, email, avatar_url),
        category:categories(id, name, icon),
        splits:expense_splits(*, user:users(id, name, avatar_url))
      `)
      .eq('id', expense.id)
      .single();

    // Notify members
    for (const memberId of memberIds) {
      if (memberId !== addedById) {
        await createNotification(
          memberId,
          'expense_added',
          `${req.user.name} added expense "${title}" - ₹${amount}`,
          { groupId, expenseId: expense.id }
        );
      }
    }

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(groupId).emit('expense_added', { expense: fullExpense });
    }

    res.status(201).json({ expense: fullExpense });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

const getExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: expense, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey(id, name, email, avatar_url),
        category:categories(id, name, icon),
        splits:expense_splits(*, user:users(id, name, avatar_url))
      `)
      .eq('id', id)
      .single();

    if (error || !expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ expense });
  } catch (err) {
    console.error('Get expense error:', err);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, date, category_id, notes } = req.body;

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({ title, amount, date, category_id, notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const io = req.app.get('io');
    if (io) {
      io.to(expense.group_id).emit('expense_updated', { expense });
    }

    res.json({ expense });
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: expense } = await supabase
      .from('expenses')
      .select('id, group_id, added_by, paid_by')
      .eq('id', id)
      .single();

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    // Check if the user is the one who added the expense
    if ((expense.added_by && expense.added_by !== userId) || (!expense.added_by && expense.paid_by !== userId)) {
      return res.status(403).json({ error: 'Only the person who added this expense can delete it' });
    }

    await supabase.from('expense_splits').delete().eq('expense_id', id);
    await supabase.from('expenses').delete().eq('id', id);

    const io = req.app.get('io');
    if (io && expense) {
      io.to(expense.group_id).emit('expense_deleted', { expenseId: id });
    }

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, from, to, category } = req.query;

    // Get groups the user belongs to
    const { data: memberRows } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    const groupIds = (memberRows || []).map((m) => m.group_id);
    if (!groupIds.length) return res.json({ expenses: [] });

    let query = supabase
      .from('expenses')
      .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey(id, name, email, avatar_url),
        category:categories(id, name, icon),
        group:groups(id, name)
      `)
      .in('group_id', groupId ? [groupId] : groupIds)
      .order('date', { ascending: false });

    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);
    if (category) query = query.eq('category_id', category);

    const { data: expenses, error } = await query;
    if (error) throw error;

    res.json({ expenses });
  } catch (err) {
    console.error('Get all expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

module.exports = { getGroupExpenses, addExpense, getExpense, updateExpense, deleteExpense, getAllExpenses };
