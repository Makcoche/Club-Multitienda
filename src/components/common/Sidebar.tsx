import React from 'react';
import {
  Home,
  LayoutDashboard,
  Zap,
  Users,
  Building2,
  Receipt,
  GraduationCap,
  BarChart3,
  ShieldAlert,
  Award,
  Sparkles,
  Shield,
  KeyRound,
  Compass,
  Layers,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, hasPermission, setShowPermissionsModal, isAuthenticated, logout } = useApp();
  const roleDef = ROLE_DEFINITIONS[currentUser.rol];

  const getDashboardLabel = () => {
    switch (currentUser.rol) {
      case 'SUPERADMIN':
        return 'Panel Superadmin';
      case 'ADMIN_COMERCIO':
        return 'Panel Comercio';
      case 'OPERADOR_COMERCIO':
        return 'Turno de Caja POS';
      case 'CLIENTE_VIP':
        return 'Mi Portal VIP & Saldo';
      default:
        return 'Panel Principal';
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Inicio & Registro',
      icon: Home,
      badge: 'Público',
      show: true,
    },
    {
      id: 'dashboard',
      label: getDashboardLabel(),
      icon: LayoutDashboard,
      show: isAuthenticated,
    },
    {
      id: 'saas-management',
      label: 'Plataforma SaaS & Sedes',
      icon: Layers,
      badge: 'Multi-Tienda',
      show: isAuthenticated && (currentUser.rol === 'SUPERADMIN' || currentUser.rol === 'ADMIN_COMERCIO'),
    },
    {
      id: 'pos-register',
      label: 'Registro Compra (POS)',
      icon: Zap,
      badge: '10-15s',
      show: isAuthenticated && hasPermission('REGISTER_PURCHASE'),
    },
    {
      id: 'clients',
      label: 'Clientes & Tarjetas VIP',
      icon: Users,
      show: isAuthenticated && hasPermission('MANAGE_CLIENTS'),
    },
    {
      id: 'merchants',
      label: 'Comercios Afiliados',
      icon: Building2,
      show: isAuthenticated && hasPermission('MANAGE_MERCHANTS'),
    },
    {
      id: 'purchases',
      label: 'Compras & Transacciones',
      icon: Receipt,
      show: isAuthenticated && (hasPermission('VIEW_GLOBAL_DASHBOARD') || hasPermission('VIEW_MERCHANT_DASHBOARD') || hasPermission('REGISTER_PURCHASE')),
    },
    {
      id: 'ceb-program',
      label: 'Programa Educativo CEB',
      icon: GraduationCap,
      show: isAuthenticated && (hasPermission('MANAGE_CEB_CONFIG') || currentUser.rol === 'SUPERADMIN' || currentUser.rol === 'ADMIN_COMERCIO'),
    },
    {
      id: 'reports',
      label: 'Reportes & Rankings',
      icon: BarChart3,
      show: isAuthenticated && hasPermission('VIEW_REPORTS'),
    },
    {
      id: 'audit-logs',
      label: 'Bitácora de Auditoría',
      icon: ShieldAlert,
      show: isAuthenticated && hasPermission('VIEW_AUDIT_LOGS'),
    },
    {
      id: 'client-portal',
      label: 'Tarjeta & Portal VIP',
      icon: Award,
      badge: 'QR',
      show: isAuthenticated && hasPermission('VIEW_VIP_PORTAL'),
    },
  ];

  const visibleItems = navItems.filter((item) => item.show);

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        {/* Current Role Context Card */}
        {isAuthenticated ? (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Sesión Activa
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${roleDef?.badgeColor}`}>
                {roleDef?.shortName}
              </span>
            </div>
            <div className="font-bold text-xs text-slate-900 mt-1 truncate">
              {currentUser.nombre}
            </div>
            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
              {roleDef?.name}
            </p>

            <button
              onClick={() => setShowPermissionsModal(true)}
              className="mt-2 text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Shield className="w-3 h-3" /> Ver permisos de este rol
            </button>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-center">
            <div className="text-[11px] font-bold text-amber-900">Portal Público</div>
            <p className="text-[10px] text-amber-700 mt-0.5">Inicia sesión para acceder a los módulos de gestión.</p>
          </div>
        )}

        {/* Navigation Menu List */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Módulos Habilitados
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slogan & Logout Bottom Box */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        {isAuthenticated && (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        )}

        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/60 text-center space-y-1">
          <Sparkles className="w-4 h-4 text-emerald-600 mx-auto" />
          <p className="text-[10px] text-emerald-900 font-medium italic leading-snug">
            “Cada compra construye educación, cada familia transforma futuros.”
          </p>
          <span className="text-[9px] text-emerald-700 font-bold block">
            Club Multitienda SaaS & CEB
          </span>
        </div>
      </div>
    </aside>
  );
};
