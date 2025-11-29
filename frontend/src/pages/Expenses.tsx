import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Skeleton } from '@/components/ui/skeleton';
import API_URL from '@/config';

const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Maintenance',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
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
    } catch (error: any) {
      console.error('Error creating expense:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create expense';
      toast.error(errorMsg);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_URL}/api/expenses/${deleteId}`);
      fetchExpenses();
      toast.success('Expense deleted');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !/^\d*\.?\d*$/.test(value)) return; // Allow decimals
    setNewExpense({ ...newExpense, amount: value });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expense Management</h2>
          <p className="text-slate-500">Track and manage your institute's expenses.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : (
                <>
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{expense.title}</div>
                        <div className="text-xs text-slate-500">{expense.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">₹{expense.amount}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(expense._id)} aria-label="Delete Expense">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No expenses recorded.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
};

export default Expenses;
