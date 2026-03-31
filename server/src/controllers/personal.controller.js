const supabase = require('../utils/supabase');

const getPersonalTransactions = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { category, type, dateFrom, dateTo } = req.query;

    let query = supabase
      .from('personal_transactions')
      .select('*, category:personal_categories(name)')
      .eq('user_email', userEmail)
      .order('date', { ascending: false });

    if (category) query = query.eq('category_id', category);
    if (type) query = query.eq('type', type);
    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);

    const { data: transactions, error } = await query;
    if (error) throw error;

    res.json({ transactions });
  } catch (err) {
    console.error('Get personal transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch personal transactions' });
  }
};

const getPersonalAnalytics = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    const { data: transactions, error } = await supabase
      .from('personal_transactions')
      .select('*, category:personal_categories(name)')
      .eq('user_email', userEmail);
      
    if (error) throw error;

    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyData = {};
    const categoryData = {};

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      if (t.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        
        // Category breakdown for expenses
        const catName = t.category?.name || 'Uncategorized';
        categoryData[catName] = (categoryData[catName] || 0) + amount;
      }
      
      const month = t.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
      monthlyData[month][t.type] += amount;
    });

    res.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      monthlyData: Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data })),
      categoryData: Object.entries(categoryData).map(([category, amount]) => ({ category, amount }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personal analytics' });
  }
};

const addTransaction = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { title, amount, type, category_id, date } = req.body;

    const { data: transaction, error } = await supabase
      .from('personal_transactions')
      .insert({ user_email: userEmail, title, amount, type, category_id, date })
      .select('*, category:personal_categories(name)')
      .single();

    if (error) throw error;

    const io = req.app.get('io');
    if (io) io.emit('personal_transaction_added', transaction);

    res.status(201).json({ transaction });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add personal transaction' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type, category_id, date } = req.body;

    const { data: transaction, error } = await supabase
      .from('personal_transactions')
      .update({ title, amount, type, category_id, date })
      .eq('id', id)
      .eq('user_email', req.user.email)
      .select('*, category:personal_categories(name)')
      .single();

    if (error) throw error;

    const io = req.app.get('io');
    if (io) io.emit('personal_transaction_updated', transaction);

    res.json({ transaction });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update personal transaction' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('personal_transactions')
      .delete()
      .eq('id', id)
      .eq('user_email', req.user.email);
      
    if (error) throw error;

    const io = req.app.get('io');
    if (io) io.emit('personal_transaction_deleted', { id });

    res.json({ message: 'Deleted transaction' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete personal transaction' });
  }
};

const getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('personal_categories')
      .select('*')
      .or(`user_email.is.null,user_email.eq.${req.user.email}`);

    if (error) throw error;
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personal categories' });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { data: category, error } = await supabase
      .from('personal_categories')
      .insert({ name, user_email: req.user.email })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add personal category' });
  }
};

module.exports = {
  getPersonalTransactions,
  getPersonalAnalytics,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  addCategory
};
