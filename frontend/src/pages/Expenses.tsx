  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Maintenance',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreate = async () => {
    if (!newExpense.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!newExpense.amount || Number(newExpense.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/expenses`, newExpense);
      setIsModalOpen(false);
      setNewExpense({
        title: '',
        amount: '',
        category: 'Maintenance',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      fetchExpenses();
      toast.success('Expense recorded successfully');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`${API_URL}/api/expenses/${id}`);
        fetchExpenses();
        toast.success('Expense deleted');
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !/^\d*\.?\d*$/.test(value)) return; // Allow decimals
        title="Add New Expense"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              placeholder="e.g., Office Rent"
              value={newExpense.title}
              onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input 
              placeholder="0.00"
              value={newExpense.amount}
              onChange={handleAmountChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={newExpense.category}
              onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
            >
              <option value="Rent">Rent</option>
              <option value="Salary">Salary</option>
              <option value="Electricity">Electricity</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Stationery">Stationery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input 
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input 
              placeholder="Additional details..."
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
            />
          </div>

          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleCreate}>
            Record Expense
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
