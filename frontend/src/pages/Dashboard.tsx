import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Users, IndianRupee, AlertCircle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import API_URL from '@/config';

interface DashboardStats {
  totalStudents: number;
  todaysCollection: number;
  totalPending: number;
  totalExpenses: number;
  netBalance: number;
  monthlyStats: { name: string; total: number }[];
  upcomingDues: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    todaysCollection: 0,
    totalPending: 0,
    totalExpenses: 0,
    netBalance: 0,
    monthlyStats: [],
    upcomingDues: [],
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, transactionsRes] = await Promise.all([
          axios.get(`${API_URL}/api/stats`),
          axios.get(`${API_URL}/api/transactions?limit=5`)
        ]);
        setStats(statsRes.data);
        // Handle paginated response
        const txData = transactionsRes.data.data || transactionsRes.data;
        setRecentTransactions(Array.isArray(txData) ? txData.slice(0, 5) : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Active Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Today's Collection",
      value: `₹${stats.todaysCollection.toLocaleString()}`,
      icon: IndianRupee,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Total Pending Fees",
      value: `₹${stats.totalPending.toLocaleString()}`,
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: "Total Expenses",
      value: `₹${stats.totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-100",
    },
    {
      title: "Net Balance",
      value: `₹${stats.netBalance.toLocaleString()}`,
      icon: TrendingUp,
      color: stats.netBalance >= 0 ? "text-green-600" : "text-red-600",
      bg: stats.netBalance >= 0 ? "bg-green-100" : "bg-red-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-slate-500">Overview of your institute's performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
        <Card className="col-span-1 md:col-span-4">
          <CardHeader>
            <CardTitle>Monthly Collection Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="overflow-x-auto">
              <div className="h-[300px] w-full min-w-[500px]">
                {stats.monthlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `₹${value}`} 
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No data available for the chart.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/reports" state={{ activeTab: 'collection' }}>
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">
                        <div className="font-medium">
                          {tx.studentId?.firstName} {tx.studentId?.lastName}
                          {tx.studentId?.isDeleted && <span className="text-red-500 text-xs ml-2">(Deleted)</span>}
                        </div>
                        <div className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">₹{tx.amount}</td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-center text-slate-500">
                        No recent transactions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Installments Card */}
        <Card className="col-span-1 md:col-span-7">
          <CardHeader>
            <CardTitle>Upcoming Installments (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[500px]">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingDues?.map((student: any) => (
                    <tr key={student._id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-4 py-3">{student.courseId?.name}</td>
                      <td className="px-4 py-3 text-red-500 font-medium">
                        {new Date(student.nextInstallmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-700">₹{student.pendingAmount}</td>
                    </tr>
                  ))}
                  {(!stats.upcomingDues || stats.upcomingDues.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                        No upcoming installments in the next 7 days.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
