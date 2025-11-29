import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, FileText, Settings, LogOut, TrendingDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Admission', path: '/admission' },
    { icon: Users, label: 'Students', path: '/students' },
    { icon: IndianRupee, label: 'Fee Collection', path: '/fee-collection' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "h-screen w-64 bg-primary text-primary-foreground flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">
              Saurav Computer
            </h1>
            <p className="text-xs text-blue-200 mt-1">Fee Management System</p>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-blue-200 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose()} // Close sidebar on mobile when link clicked
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-white/20 text-white shadow-lg" 
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "scale-110")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-blue-100 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
