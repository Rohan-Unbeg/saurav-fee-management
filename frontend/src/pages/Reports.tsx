import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/Pagination';
import API_URL from '@/config';

const Reports = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'defaulters' | 'batch' | 'collection'>('defaulters');

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [batchFilter, setBatchFilter] = useState('');
  
  // Collection Report State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalCollection, setTotalCollection] = useState(0);
  const [modeTotals, setModeTotals] = useState({ Cash: 0, UPI: 0, Cheque: 0 });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      let url = `${API_URL}/api/students?page=${pageNum}&limit=10`;
      
      // Note: For true server-side filtering, we'd need to pass these params to the backend.
      // Currently backend only supports basic pagination. 
      // For now, we will fetch paginated students and filter client side which is NOT ideal for 'defaulters' 
      // if the defaulter is on page 2.
      // TODO: Implement server-side filtering for 'defaulters' and 'batch' in studentController.
      
      const response = await axios.get(url);
      
      // Handle the new paginated response structure
      if (response.data.data) {
         setStudents(response.data.data);
         setFilteredStudents(response.data.data); // Initial set, filtering happens in useEffect
         setTotalPages(response.data.totalPages);
         setPage(pageNum);
      } else {
         // Fallback for non-paginated response (should not happen with new backend)
         setStudents(response.data);
         setFilteredStudents(response.data);
      }

    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'collection') {
      fetchStudents(page);
    }
  }, [activeTab, page]);

  useEffect(() => {
    if (activeTab === 'defaulters') {
      // Client-side filtering on the *current page* of students.
      // This is a temporary limitation. Ideally, we need /api/students?status=Unpaid&page=1
      setFilteredStudents(students.filter(s => s.pendingAmount > 0));
    } else if (activeTab === 'batch') {
      if (batchFilter) {
        setFilteredStudents(students.filter(s => s.batch.toLowerCase().includes(batchFilter.toLowerCase())));
      } else {
        setFilteredStudents(students);
      }
    }
  }, [activeTab, students, batchFilter]);

  const fetchTransactions = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/transactions?startDate=${startDate}&endDate=${endDate}&page=${pageNum}&limit=10`);
      setTransactions(response.data.data);
      setTotalPages(response.data.totalPages);
      setPage(pageNum);
      
      // Note: Totals should ideally be fetched from a separate 'stats' endpoint to be accurate across all pages
      // For now, we are calculating totals only for the current page which is a limitation.
      // To fix this properly, we'd need a backend aggregation endpoint.
      const total = response.data.data.reduce((sum: number, tx: any) => sum + tx.amount, 0);
      setTotalCollection(total);

      const modes = response.data.data.reduce((acc: any, tx: any) => {
        acc[tx.mode] = (acc[tx.mode] || 0) + tx.amount;
        return acc;
      }, { Cash: 0, UPI: 0, Cheque: 0 });
      setModeTotals(modes);

    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'collection') {
      fetchTransactions(page);
    }
  }, [activeTab, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4">
        <div className="flex flex-wrap gap-2 md:space-x-4">
          <Button 
            variant={activeTab === 'defaulters' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('defaulters'); setPage(1); }}
            size="sm"
          >
            Defaulters
          </Button>
          <Button 
            variant={activeTab === 'batch' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('batch'); setPage(1); }}
            size="sm"
          >
            Batch-wise
          </Button>
          <Button 
            variant={activeTab === 'collection' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('collection'); setPage(1); }}
            size="sm"
          >
            Collection
          </Button>
        </div>
        <Button onClick={() => handlePrint()} variant="outline" size="sm" className="w-full md:w-auto">
          <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm mb-4">
        {activeTab === 'defaulters' && "Showing all students who have pending fees."}
        {activeTab === 'batch' && "Showing student list filtered by batch. Use the search bar to filter."}
        {activeTab === 'collection' && "Showing all fee transactions within the selected date range."}
      </div>

      {activeTab === 'collection' && (
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto">
            <label className="text-sm font-medium text-slate-700">Start Date</label>
            <Input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-auto">
            <label className="text-sm font-medium text-slate-700">End Date</label>
            <Input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={() => fetchTransactions(1)} className="w-full md:w-auto">Apply Filter</Button>
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
                        <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                          <td colSpan={4} className="px-6 py-4 text-right">Total Collection</td>
                          <td className="px-6 py-4 text-right text-green-700 text-lg">₹{totalCollection}</td>
                        </tr>
                        <tr className="bg-slate-50 text-sm text-slate-600">
                          <td colSpan={4} className="px-6 py-2 text-right">Cash</td>
                          <td className="px-6 py-2 text-right">₹{modeTotals.Cash}</td>
                        </tr>
                        <tr className="bg-slate-50 text-sm text-slate-600">
                          <td colSpan={4} className="px-6 py-2 text-right">UPI</td>
                          <td className="px-6 py-2 text-right">₹{modeTotals.UPI}</td>
                        </tr>
                        {modeTotals.Cheque > 0 && (
                          <tr className="bg-slate-50 text-sm text-slate-600">
                            <td colSpan={4} className="px-6 py-2 text-right">Cheque</td>
                            <td className="px-6 py-2 text-right">₹{modeTotals.Cheque}</td>
                          </tr>
                        )}
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
                    <th className="px-6 py-3 border-b">Next Due</th>
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
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {student.nextInstallmentDate ? new Date(student.nextInstallmentDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">₹{student.totalFeeCommitted}</td>
                          <td className="px-6 py-4 text-right text-green-600">₹{student.totalPaid}</td>
                          <td className="px-6 py-4 text-right text-red-600 font-bold">₹{student.pendingAmount}</td>
                        </tr>
                      ))}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 text-center text-slate-500">
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
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={(p) => setPage(p)} 
        />
      </div>
    </div>
  );
};

export default Reports;
