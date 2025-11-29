import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { Button } from './ui/button';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center p-4 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white hover:bg-slate-800">
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="ml-4 text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Saurav Institute
        </h1>
      </div>

      <main className="md:ml-64 p-4 md:p-8 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
