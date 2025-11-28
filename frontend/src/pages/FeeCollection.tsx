import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Search, Printer, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { Receipt } from '@/components/Receipt';
import API_URL from '@/config';

const FeeCollection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/students`);
      const filtered = response.data.filter((s: any) => 
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentMobile.includes(searchQuery)
      );
      setStudents(filtered);
    } catch (error) {
      console.error('Error searching students:', error);
    }
  };

  const openPaymentModal = (student: any) => {
    setSelectedStudent(student);
    setPaymentAmount('');
    setIsModalOpen(true);
    setShowReceipt(false);
  };

  const loadHistory = async (studentId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions?studentId=${studentId}`);
      setStudentHistory(response.data);
      return response.data;
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  };

  const handlePayment = async () => {
    if (!selectedStudent) return;
    
    if (Number(paymentAmount) > selectedStudent.pendingAmount) {
      alert('Amount cannot exceed pending balance');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/transactions`, {
        studentId: selectedStudent._id,
        amount: Number(paymentAmount),
        mode: paymentMode,
      });

      setLastTransaction(response.data);
      
      // Update local student state
      const updatedStudent = {
        ...selectedStudent,
        pendingAmount: selectedStudent.pendingAmount - Number(paymentAmount),
        totalPaid: selectedStudent.totalPaid + Number(paymentAmount),
      };
      setSelectedStudent(updatedStudent);
      
      // Update list
      setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));

      // Load updated history for receipt
      await loadHistory(selectedStudent._id);

      setIsModalOpen(false);
      setShowReceipt(true);
      
      // Trigger print after a short delay to ensure state update
      setTimeout(() => {
        handlePrint();
      }, 500);

      // Auto dismiss success message
      setTimeout(() => {
        setShowReceipt(false);
      }, 3000);

    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed');
    }
  };

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);

  const fetchHistory = async (studentId: string) => {
    await loadHistory(studentId);
    setHistoryModalOpen(true);
  };

  const openHistoryModal = (student: any) => {
    setSelectedStudent(student);
    fetchHistory(student._id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fee Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input 
              placeholder="Search by Name or Mobile..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.map(student => (
          <Card key={student._id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{student.firstName} {student.lastName}</h3>
                  <p className="text-sm text-slate-500">{student.courseId?.name} - {student.batch}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  student.pendingAmount === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {student.pendingAmount === 0 ? 'PAID' : 'UNPAID'}
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Total Fee:</span>
                  <span className="font-medium">₹{student.totalFeeCommitted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span className="font-medium text-green-600">₹{student.totalPaid}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium text-red-600">₹{student.pendingAmount}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => openPaymentModal(student)}
                  disabled={student.pendingAmount === 0}
                >
                  Collect Fee
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => openHistoryModal(student)}
                >
                  History
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {students.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500">
            No students found.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Collect Fee from ${selectedStudent?.firstName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Pending Amount</label>
            <div className="text-2xl font-bold text-red-600">₹{selectedStudent?.pendingAmount}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Paying Now</label>
            <Input 
              type="number" 
              value={paymentAmount} 
              onChange={(e) => setPaymentAmount(e.target.value)}
              max={selectedStudent?.pendingAmount}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Mode</label>
            <select 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <Button className="w-full" onClick={handlePayment}>
            Confirm Payment
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Payment History - ${selectedStudent?.firstName}`}
        className="max-w-3xl"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-2">Receipt No</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Mode</th>
                <th className="px-4 py-2">Remark</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {studentHistory.map((tx) => (
                <tr key={tx._id} className="border-b">
                  <td className="px-4 py-2 font-mono text-xs">{tx.receiptNo}</td>
                  <td className="px-4 py-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{tx.mode}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">{tx.remark}</td>
                  <td className="px-4 py-2 text-right font-bold text-green-600">₹{tx.amount}</td>
                  <td className="px-4 py-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setLastTransaction(tx);
                        setTimeout(() => handlePrint(), 100);
                      }}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {studentHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        <div ref={receiptRef}>
          {lastTransaction && (
            <Receipt 
              transaction={lastTransaction} 
              student={selectedStudent} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeCollection;
