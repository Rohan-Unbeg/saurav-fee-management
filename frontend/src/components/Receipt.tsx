import React from 'react';

interface ReceiptProps {
  transaction: any;
  student: any;
  history?: any[];
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ transaction, student, history = [] }, ref) => {
  if (!transaction || !student) return null;

  // Sort history by date ascending
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div ref={ref} className="p-12 bg-white text-black font-sans max-w-3xl mx-auto border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 uppercase">Saurav Computer</h1>
          <p className="text-sm text-slate-600 mt-2 font-medium">At Post: Shendurjan, Tal: Sindkhed Raja, Maharashtra 443202</p>
          <p className="text-sm text-slate-600 font-medium">Mobile: 9823779796</p>
        </div>
        <div className="text-right">
          <div className="bg-slate-100 px-4 py-2 rounded mb-2 inline-block">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receipt No</p>
            <p className="text-xl font-mono font-bold">{transaction.receiptNo}</p>
          </div>
          <p className="text-sm font-medium text-slate-600">Date: {new Date(transaction.date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Received From</p>
          <p className="text-xl font-bold text-slate-900">{student.firstName} {student.lastName}</p>
          <p className="text-sm text-slate-600">ID: <span className="font-mono font-bold">{student._id.slice(-6).toUpperCase()}</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Course Details</p>
          <p className="text-lg font-bold text-slate-900">{student.courseId?.name || 'N/A'}</p>
          <p className="text-sm text-slate-600">Batch: {student.batch}</p>
        </div>
      </div>

      {/* Current Transaction Table */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">Payment Details</h3>
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <th className="p-3 text-left font-bold">Description</th>
              <th className="p-3 text-left font-bold">Mode</th>
              <th className="p-3 text-right font-bold">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="p-3 font-medium text-slate-900">
                Fee Installment
                <span className="block text-xs text-slate-500 font-normal mt-1">{transaction.remark || 'Fee Payment'}</span>
              </td>
              <td className="p-3 text-slate-600">{transaction.mode}</td>
              <td className="p-3 text-right font-bold text-slate-900 text-lg">{transaction.amount}</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={2} className="p-3 text-right font-bold text-slate-900">Total Paid Now</td>
              <td className="p-3 text-right font-bold text-slate-900 text-xl">₹{transaction.amount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment History Summary */}
      {sortedHistory.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment History</h3>
          <table className="w-full text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Receipt No</th>
                <th className="py-2 text-left">Remark</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((tx, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-2 font-mono">{tx.receiptNo}</td>
                  <td className="py-2">{tx.remark}</td>
                  <td className="py-2 text-right">₹{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Financial Summary */}
      <div className="flex justify-end mb-12">
        <div className="w-64 bg-slate-50 p-4 rounded border border-slate-100">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-slate-600">Total Fee:</span>
            <span className="font-bold">₹{student.totalFeeCommitted}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-slate-600">Total Paid:</span>
            <span className="font-bold text-green-600">₹{student.totalPaid}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-base">
            <span className="font-bold text-slate-900">Pending Balance:</span>
            <span className="font-bold text-red-600">₹{student.pendingAmount}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-slate-100 pt-6">
        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-400">
            <p className="font-bold text-slate-500 uppercase mb-1">Computer Generated Receipt</p>
            <p>This document is valid without a signature.</p>
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-200 uppercase tracking-widest select-none">PAID</p>
          </div>
        </div>
      </div>

    </div>
  );
});

Receipt.displayName = 'Receipt';
