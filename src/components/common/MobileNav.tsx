import React from 'react';
import {
  Home,
  LayoutDashboard,
  Zap,
  Users,
  Receipt,
  GraduationCap,
  Award,
  Shield,
  Building2,
  Layers,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, hasPermission, isAuthenticated, logout } = useApp();

  const mobileTabs = [
    { id: 'home', label: 'Inicio', icon: Home, show: true },
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard, show: isAuthenticated },
    { id: 'pos-register', label: 'POS', icon: Zap, show: isAuthenticated && hasPermission('REGISTER_PURCHASE') },
    { id: 'saas-management', label: 'SaaS', icon: Layers, show: isAuthenticated && (currentUser.rol === 'SUPERADMIN' || currentUser.rol === 'ADMIN_COMERCIO') },
    { id: 'client-portal', label: 'Carnet VIP', icon: Award, show: isAuthenticated && hasPermission('VIEW_VIP_PORTAL') },
  ];

  const visibleTabs = mobileTabs.filter((t) => t.show);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-white z-40 px-2 py-1.5 flex justify-around items-center">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}

      {isAuthenticated && (
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium text-rose-400 hover:text-rose-300 transition-colors"
          title="Cerrar Sesión"
        >
          <LogOut className="w-5 h-5 mb-0.5 text-rose-400" />
          <span>Salir</span>
        </button>
      )}
    </nav>
  );
};
