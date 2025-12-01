import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
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
  
  const reactToPrintFn = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => {
      // Optional: Restore pagination if needed, but keeping "View All" might be fine or just let user navigate
      // For now, we won't auto-revert to page 1 to avoid jarring UX.
    }
  });

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const limit = 10000; // Fetch all (or a very large number)
      
      if (activeTab === 'collection') {
        toast.info('Preparing report...');
        const response = await axios.get(`${API_URL}/api/transactions?startDate=${startDate}&endDate=${endDate}&page=1&limit=${limit}`);
        setTransactions(response.data.data);
        // Recalculate totals for the full dataset
        const total = response.data.data.reduce((sum: number, tx: any) => sum + tx.amount, 0);
        setTotalCollection(total);
        const modes = response.data.data.reduce((acc: any, tx: any) => {
          acc[tx.mode] = (acc[tx.mode] || 0) + tx.amount;
          return acc;
        }, { Cash: 0, UPI: 0, Cheque: 0 });
        setModeTotals(modes);
      } else {
        // Students (Defaulters or Batch)
        let url = `${API_URL}/api/students?page=1&limit=${limit}`;
        if (activeTab === 'batch' && batchFilter) {
          url += `&batch=${encodeURIComponent(batchFilter)}`;
        }
        if (activeTab === 'defaulters') {
          url += `&defaulters=true`;
        }
        
        toast.info('Preparing report...');
        const response = await axios.get(url);
        
        if (response.data.data) {
           setStudents(response.data.data);
           setFilteredStudents(response.data.data);
        } else {
           setStudents(response.data);
           setFilteredStudents(response.data);
        }
        
        // No need for client-side filtering anymore as backend handles it
      }

      setIsLoading(false);

      // Wait a bit for state to update and DOM to render
      setTimeout(() => {
        reactToPrintFn();
      }, 500);

    } catch (error) {
      console.error('Error preparing print:', error);
      setIsLoading(false);
      toast.error('Failed to prepare report for printing');
    }
  };

  const handleExport = () => {
    if (activeTab === 'collection') {
      if (transactions.length === 0) {
        toast.error('No transactions to export');
        return;
      }
      const exportData = transactions.map(tx => ({
        'Date': new Date(tx.date).toLocaleDateString(),
        'Student Name': `${tx.studentId?.firstName} ${tx.studentId?.lastName}`,
        'Receipt No': tx.receiptNo,
        'Mode': tx.mode,
        'Amount': tx.amount,
        'Remark': tx.remark
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Collection Report');
      XLSX.writeFile(wb, 'Collection_Report.xlsx');
    } else {
      if (filteredStudents.length === 0) {
        toast.error('No students to export');
        return;
      }
      const exportData = filteredStudents.map(student => ({
        'First Name': student.firstName,
        'Last Name': student.lastName,
        'Mobile': student.studentMobile,
        'Course': student.courseId?.name || 'N/A',
        'Batch': student.batch,
        'Total Fee': student.totalFeeCommitted,
        'Paid Amount': student.totalPaid,
        'Pending Amount': student.pendingAmount,
        'Status': student.status
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab === 'defaulters' ? 'Defaulters' : 'Batch Report');
      XLSX.writeFile(wb, `${activeTab === 'defaulters' ? 'Defaulters' : 'Batch'}_Report.xlsx`);
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      let url = `${API_URL}/api/students?page=${pageNum}&limit=10`;
      
      if (activeTab === 'batch' && batchFilter) {
        url += `&batch=${encodeURIComponent(batchFilter)}`;
      }
      
      if (activeTab === 'defaulters') {
        url += `&defaulters=true`;
      }
      
      // Note: Now we have server-side filtering for both batch and defaulters.
      
      const response = await axios.get(url);
      
      // Handle the new paginated response structure
      if (response.data.data) {
         setStudents(response.data.data);
         setFilteredStudents(response.data.data); 
         setTotalPages(response.data.totalPages);
         setPage(pageNum);
      } else {
         // Fallback for non-paginated response
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
    if (activeTab === 'batch') {
      const timer = setTimeout(() => {
        fetchStudents(1);
      }, 500); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [batchFilter]);

  useEffect(() => {
    if (activeTab === 'defaulters') {
       // Server-side filtering now enabled, just fetch page 1
       setPage(1);
       fetchStudents(1);
    }
  }, [activeTab]);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-4 gap-4 no-print">
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
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm" className="w-full md:w-auto">
            <Printer className="mr-2 h-4 w-4" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      <div className="bg-primary/5 p-4 rounded-md text-primary text-sm mb-4 no-print space-y-4">
        <div>
          {activeTab === 'defaulters' && "Showing all students who have pending fees."}
          {activeTab === 'batch' && "Filter students by their batch name."}
          {activeTab === 'collection' && "Showing all fee transactions within the selected date range."}
        </div>

        {activeTab === 'batch' && (
          <div className="flex gap-4 items-center max-w-md">
             <Input 
               placeholder="Enter Batch Name (e.g. Jan 2025)..." 
               value={batchFilter}
               onChange={(e) => setBatchFilter(e.target.value)}
               className="bg-white"
             />
          </div>
        )}
      </div>

      {activeTab === 'collection' && (
        <div className="flex flex-col md:flex-row gap-4 items-end no-print">
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

      <div ref={componentRef} className="print-container bg-white">
        {/* Print Header */}
        <div className="mb-8 hidden print:block text-center border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">Saurav Computer</h1>
          <p className="text-sm text-slate-600 mt-1">Near Bus Stand, Main Road, City Name - 123456</p>
          <p className="text-sm text-slate-600">Mobile: +91 98765 43210 | Email: info@sauravcomputer.com</p>
          <div className="mt-4 pt-2 border-t border-slate-200 inline-block w-full">
            <h2 className="text-xl font-semibold text-slate-800 uppercase">
              {activeTab === 'defaulters' ? 'Pending Fee Report' : 
               activeTab === 'batch' ? 'Student Batch Report' : 
               'Fee Collection Report'}
            </h2>
            <div className="flex justify-between items-center mt-1 px-4">
              <p className="text-xs text-slate-500">Generated on: {new Date().toLocaleString()}</p>
              <p className="text-xs text-slate-500 font-semibold">
                Total Records: {activeTab === 'collection' ? transactions.length : filteredStudents.length}
              </p>
            </div>
          </div>
        </div>

        <Card className="card-print-reset">
          <CardHeader className="no-print">
            <CardTitle>
              {activeTab === 'defaulters' ? 'Pending Fee Report' : 
               activeTab === 'batch' ? 'Student Batch Report' : 
               'Fee Collection Report'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6 print:p-0">
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
                              {tx.studentId?.isDeleted && <span className="text-red-500 text-xs ml-2">(Deleted)</span>}
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
        <div className="no-print">
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={(p) => setPage(p)} 
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
