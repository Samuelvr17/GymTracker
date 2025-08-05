import React from 'react';
import { Dumbbell, History, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'routines' | 'reports';
  onTabChange: (tab: 'routines' | 'reports') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await signOut();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header with user info */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-8 h-8 rounded-lg flex items-center justify-center">
              <Dumbbell size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.username || 'Usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <main className="flex-1 pb-16">
        {children}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 sm:py-3 shadow-lg">
        <div className="flex justify-around max-w-sm mx-auto">
          <button
            onClick={() => onTabChange('routines')}
            className={`flex flex-col items-center py-2 px-4 sm:px-6 rounded-xl transition-all duration-200 ${
              activeTab === 'routines'
                ? 'text-blue-600 bg-blue-50 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Dumbbell size={20} className="sm:hidden" strokeWidth={2.5} />
            <Dumbbell size={22} className="hidden sm:block" strokeWidth={2.5} />
            <span className="text-xs sm:text-xs mt-1 font-semibold">Rutinas</span>
          </button>
          
          <button
            onClick={() => onTabChange('reports')}
            className={`flex flex-col items-center py-2 px-4 sm:px-6 rounded-xl transition-all duration-200 ${
              activeTab === 'reports'
                ? 'text-blue-600 bg-blue-50 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <History size={20} className="sm:hidden" strokeWidth={2.5} />
            <History size={22} className="hidden sm:block" strokeWidth={2.5} />
            <span className="text-xs sm:text-xs mt-1 font-semibold">Informe</span>
          </button>
        </div>
      </nav>
    </div>
  );
}