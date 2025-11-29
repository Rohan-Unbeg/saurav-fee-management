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
      <div className="md:hidden flex items-center p-4 bg-primary text-primary-foreground border-b border-white/10 sticky top-0 z-30">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="text-blue-100 hover:text-white hover:bg-white/10">
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="ml-4 text-lg font-bold text-white">
          Saurav Computer
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
