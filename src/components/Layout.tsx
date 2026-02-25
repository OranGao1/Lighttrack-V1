import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Scale, Utensils, Dumbbell, PieChart, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/weight', icon: Scale, label: '体重' },
    { path: '/diet', icon: Utensils, label: '饮食' },
    { path: '/fitness', icon: Dumbbell, label: '健身' },
    { path: '/report', icon: PieChart, label: '报表' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <header className="fixed top-0 right-0 p-4 z-50">
        <button 
          onClick={handleSignOut}
          className="p-2 bg-white/80 rounded-full shadow-sm text-gray-500 hover:text-red-500 transition-colors backdrop-blur-sm"
          title="退出登录"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg flex justify-around items-center h-16 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
