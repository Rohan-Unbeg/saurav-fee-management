import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import API_URL from '@/config';

const Reports = () => {
  const [activeTab, setActiveTab] = useState<'defaulters' | 'batch' | 'collection'>('defaulters');
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [batchFilter, setBatchFilter] = useState('');
  
  // Collection Report State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalCollection, setTotalCollection] = useState(0);

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/students`);
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (activeTab === 'defaulters') {
      setFilteredStudents(students.filter(s => s.pendingAmount > 0));
    } else {
      if (batchFilter) {
        setFilteredStudents(students.filter(s => s.batch.toLowerCase().includes(batchFilter.toLowerCase())));
      } else {
        setFilteredStudents(students);
      }
    }
  }, [activeTab, students, batchFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/transactions?startDate=${startDate}&endDate=${endDate}`);
      setTransactions(response.data);
      const total = response.data.reduce((sum: number, tx: any) => sum + tx.amount, 0);
      setTotalCollection(total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'collection') {
      fetchTransactions();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="flex space-x-4">
          <Button 
            variant={activeTab === 'defaulters' ? 'default' : 'outline'}
            onClick={() => setActiveTab('defaulters')}
          >
            Defaulters List
          </Button>
          <Button 
            variant={activeTab === 'batch' ? 'default' : 'outline'}
            onClick={() => setActiveTab('batch')}
          >
            Batch-wise List
          </Button>
          <Button 
            variant={activeTab === 'collection' ? 'default' : 'outline'}
            onClick={() => setActiveTab('collection')}
          >
            Collection Report
          </Button>
        </div>
        <Button onClick={() => handlePrint()} variant="outline">
          <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </div>

      {activeTab === 'collection' && (
        <div className="flex gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-slate-700">Start Date</label>
            <Input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">End Date</label>
            <Input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={fetchTransactions}>Apply Filter</Button>
        </div>
      )}

      <div ref={componentRef} className="p-4 bg-white">
        <div className="mb-6 hidden print:block">
          <h1 className="text-2xl font-bold text-center uppercase">Saurav Computer Institute</h1>
          <p className="text-center text-sm">Report Generated on: {new Date().toLocaleDateString()}</p>
        </div>
        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <CardTitle>
              {activeTab === 'defaulters' ? 'Pending Fee Report' : 
               activeTab === 'batch' ? 'Student Batch Report' : 
               'Fee Collection Report'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {activeTab === 'collection' ? (
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 border-b">Date</th>
                      <th className="px-6 py-3 border-b">Student Name</th>
                      <th className="px-6 py-3 border-b">Receipt No</th>
                      <th className="px-6 py-3 border-b">Mode</th>
                      <th className="px-6 py-3 text-right border-b">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      // Skeleton Rows for Collection
                      [1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b">
                          <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        </tr>
                      ))
                    ) : (
                      <>
                        {transactions.map((tx) => (
                          <tr key={tx._id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">
                              {tx.studentId?.firstName} {tx.studentId?.lastName}
                            </td>
                            <td className="px-6 py-4">{tx.receiptNo}</td>
                            <td className="px-6 py-4">{tx.mode}</td>
                            <td className="px-6 py-4 text-right font-bold text-green-600">₹{tx.amount}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={4} className="px-6 py-4 text-right">Total Collection</td>
                          <td className="px-6 py-4 text-right text-green-700 text-lg">₹{totalCollection}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 border-b">Name</th>
                    <th className="px-6 py-3 border-b">Mobile</th>
                    <th className="px-6 py-3 border-b">Course</th>
                    <th className="px-6 py-3 border-b">Batch</th>
                    <th className="px-6 py-3 text-right border-b">Total Fee</th>
                    <th className="px-6 py-3 text-right border-b">Paid</th>
                    <th className="px-6 py-3 text-right border-b">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Skeleton Rows for Students
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b">
                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : (
                    <>
                      {filteredStudents.map((student) => (
                        <tr key={student._id} className="bg-white border-b hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4">{student.studentMobile}</td>
                          <td className="px-6 py-4">{student.courseId?.name}</td>
                          <td className="px-6 py-4">{student.batch}</td>
                          <td className="px-6 py-4 text-right">₹{student.totalFeeCommitted}</td>
                          <td className="px-6 py-4 text-right text-green-600">₹{student.totalPaid}</td>
                          <td className="px-6 py-4 text-right text-red-600 font-bold">₹{student.pendingAmount}</td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-slate-500">
                            No records found.
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
