const supabase = require('../utils/supabase');

const getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get groups the user belongs to
    const { data: memberRows } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    const groupIds = (memberRows || []).map((m) => m.group_id);

    // Total spent (amount you paid)
    const { data: paidExpenses } = await supabase
      .from('expenses')
      .select('amount, date, category_id, category:categories(name)')
      .eq('paid_by', userId)
      .in('group_id', groupIds.length ? groupIds : ['none']);

    const totalPaid = (paidExpenses || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Monthly breakdown
    const monthlyData = {};
    for (const e of paidExpenses || []) {
      const month = e.date?.substring(0, 7);
      if (month) {
        monthlyData[month] = (monthlyData[month] || 0) + parseFloat(e.amount);
      }
    }

    // Category breakdown
    const categoryData = {};
    for (const e of paidExpenses || []) {
      const cat = e.category?.name || 'Uncategorized';
      categoryData[cat] = (categoryData[cat] || 0) + parseFloat(e.amount);
    }

    // Total owed to me
    const { data: owedSplits } = await supabase
      .from('expense_splits')
      .select('amount, expense:expenses(paid_by)')
      .eq('is_settled', false)
      .neq('user_id', userId);

    const totalOwedToMe = (owedSplits || [])
      .filter((s) => s.expense?.paid_by === userId)
      .reduce((sum, s) => sum + parseFloat(s.amount), 0);

    // Total I owe
    const { data: iOweSplits } = await supabase
      .from('expense_splits')
      .select('amount, expense:expenses(paid_by)')
      .eq('user_id', userId)
      .eq('is_settled', false);

    const totalIOwe = (iOweSplits || [])
      .filter((s) => s.expense?.paid_by !== userId)
      .reduce((sum, s) => sum + parseFloat(s.amount), 0);

    res.json({
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      totalOwedToMe: parseFloat(totalOwedToMe.toFixed(2)),
      totalIOwe: parseFloat(totalIOwe.toFixed(2)),
      netBalance: parseFloat((totalOwedToMe - totalIOwe).toFixed(2)),
      monthlyData: Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) })),
      categoryData: Object.entries(categoryData).map(([category, amount]) => ({
        category,
        amount: parseFloat(amount.toFixed(2)),
      })),
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

const getAdminAnalytics = async (req, res) => {
  try {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: totalGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });

    const { count: totalExpenses } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true });

    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    const { data: totalAmountResult } = await supabase
      .from('expenses')
      .select('amount');
    const totalAmount = (totalAmountResult || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Recent signups per month
    const { data: recentUsers } = await supabase
      .from('users')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    const usersByMonth = {};
    for (const u of recentUsers || []) {
      const month = u.created_at?.substring(0, 7);
      if (month) usersByMonth[month] = (usersByMonth[month] || 0) + 1;
    }

    res.json({
      totalUsers,
      totalGroups,
      totalExpenses,
      totalTransactions,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      usersByMonth: Object.entries(usersByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count })),
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
};

const getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('is_default', { ascending: false });

    if (error) throw error;
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const getGlobalSpending = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // 1. Personal Spending
    const { data: personalTrx } = await supabase
      .from('personal_transactions')
      .select('amount, type, date')
      .eq('user_email', userEmail);

    let personalExpense = 0;
    (personalTrx || []).forEach(t => {
      if (t.type === 'expense') personalExpense += parseFloat(t.amount);
    });

    // 2. Group Spending (User's share)
    // We need to fetch splits where user_id matches, and join with expenses to get group_id and date
    const { data: splits, error: splitError } = await supabase
      .from('expense_splits')
      .select(`
        amount,
        expense:expenses (
          id,
          group_id,
          date
        )
      `)
      .eq('user_id', userId);

    if (splitError) throw splitError;

    const groupShareExpense = (splits || []).reduce((sum, s) => sum + parseFloat(s.amount), 0);

    // monthly trend (combined)
    const monthlyData = {};

    (personalTrx || []).forEach(t => {
      if (t.type === 'expense') {
        const m = t.date.substring(0, 7);
        if (!monthlyData[m]) monthlyData[m] = { personal: 0, group: 0, total: 0 };
        monthlyData[m].personal += parseFloat(t.amount);
        monthlyData[m].total += parseFloat(t.amount);
      }
    });

    (splits || []).forEach(s => {
      if (s.expense) {
        const dateStr = s.expense.date;
        if (dateStr) {
          const m = dateStr.substring(0, 7);
          if (!monthlyData[m]) monthlyData[m] = { personal: 0, group: 0, total: 0 };
          monthlyData[m].group += parseFloat(s.amount);
          monthlyData[m].total += parseFloat(s.amount);
        }
      }
    });

    res.json({
      personalExpense: parseFloat(personalExpense.toFixed(2)),
      groupShareExpense: parseFloat(groupShareExpense.toFixed(2)),
      totalSpending: parseFloat((personalExpense + groupShareExpense).toFixed(2)),
      monthlyData: Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ 
          month, 
          personal: parseFloat(data.personal.toFixed(2)),
          group: parseFloat(data.group.toFixed(2)),
          total: parseFloat(data.total.toFixed(2))
        }))
    });
  } catch (err) {
    console.error('Global spending error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

module.exports = { getMyAnalytics, getAdminAnalytics, getCategories, getGlobalSpending };
