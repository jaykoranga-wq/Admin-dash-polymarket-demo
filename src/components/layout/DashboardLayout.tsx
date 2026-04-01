import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  Folder,
  TrendingUp,
  CheckCircle,
  BarChart3,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { clearCredentials } from '../../store/authSlice';
import { useLogoutMutation } from '../../services/authApi';

interface DashboardLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  pageTitle?: string;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'categories', name: 'Categories', icon: Folder },
  { id: 'markets', name: 'Markets', icon: TrendingUp },
  { id: 'resolutions', name: 'Resolutions', icon: CheckCircle },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
];

export function DashboardLayout({ children, currentView, onViewChange, pageTitle }: DashboardLayoutProps) {
  const adminUser = useSelector((state: RootState) => state.auth.adminUser);
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logout] = useLogoutMutation();

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Silently proceed — clear local credentials regardless of server response
    } finally {
      dispatch(clearCredentials());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-xs text-gray-500">Polymarket-demo</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {adminUser?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{adminUser?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {pageTitle || navigation.find((item) => item.id === currentView)?.name || 'Dashboard'}
            </h2>
            <div className="w-10 lg:w-0" />
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
