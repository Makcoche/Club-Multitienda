import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  KeyRound,
  LogOut,
  Globe,
  Store,
  Shield,
  Building2,
  Zap,
  Award,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    users,
    merchants,
    selectedTenantId,
    setSelectedTenantId,
    activeTenantMerchant,
    isAuthenticated,
    switchUser,
    logout,
    setShowAuthModal,
    setShowPermissionsModal,
    hasPermission,
    cebConfig,
    setActiveTab,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState<boolean>(false);

  const roleDef = ROLE_DEFINITIONS[currentUser.rol] || {
    name: currentUser.rol,
    shortName: currentUser.rol,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            title="Ir a la Página de Inicio"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
              VIP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  CLUB MULTITIENDA
                </span>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  SaaS Cloud
                </span>
                <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold hidden sm:inline-block">
                  CEB {cebConfig.porcentaje}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                Plataforma SaaS Multitienda de Fidelización y Responsabilidad Social
              </p>
            </div>
          </div>

          {/* Tenant Switcher for SaaS Multitienda */}
          {isAuthenticated && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedTenantId === 'ALL'
                    ? 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                }`}
                title="Filtrar datos por comercio o ver red multitienda global"
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[140px] truncate">
                  {selectedTenantId === 'ALL' ? 'Red Multitienda (Global)' : activeTenantMerchant?.nombre || 'Comercio'}
                </span>
                {activeTenantMerchant?.planId && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeTenantMerchant.planId}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showTenantDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Tenant Activo (Multitienda SaaS):
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Selecciona una tienda para filtrar métricas o gestionarla.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTenantId('ALL');
                      setShowTenantDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedTenantId === 'ALL'
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>Vista Global (Todas las tiendas)</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                      {merchants.length}
                    </span>
                  </button>

                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Comercios Afiliados:
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {merchants.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedTenantId(m.id);
                          setShowTenantDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          selectedTenantId === m.id
                            ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate font-semibold text-slate-900">{m.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{m.subdominio || m.nit}</div>
                        </div>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                          {m.planId || 'PRO'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Center / Right controls */}
          <div className="flex items-center gap-2">
            {/* If Authenticated: User Badge + Role Switcher */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-left transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      {currentUser.nombre.charAt(0)}
                    </div>
                    <div className="hidden sm:block">
                      <div className="font-bold text-white leading-tight">{currentUser.nombre.split(' ')[0]}</div>
                      <div className="text-[10px] text-amber-400 font-mono font-medium">{roleDef.shortName}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Role Switcher Menu */}
                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 z-50 animate-in fade-in">
                      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Sesión Activa:
                          </div>
                          <div className="text-xs font-bold text-slate-900">{currentUser.nombre}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleDef.badgeColor}`}>
                          {roleDef.shortName}
                        </span>
                      </div>

                      <div className="py-1">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Cambiar Rol de Demostración:
                        </div>
                        {users.map((u) => {
                          const uDef = ROLE_DEFINITIONS[u.rol];
                          return (
                            <button
                              key={u.id}
                              onClick={() => {
                                switchUser(u.id);
                                setShowRoleDropdown(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                                u.id === currentUser.id
                                  ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="p-1.5 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                                {u.rol === 'SUPERADMIN' && <Shield className="w-4 h-4 text-purple-600" />}
                                {u.rol === 'ADMIN_COMERCIO' && <Building2 className="w-4 h-4 text-blue-600" />}
                                {u.rol === 'OPERADOR_COMERCIO' && <Zap className="w-4 h-4 text-emerald-600" />}
                                {u.rol === 'CLIENTE_VIP' && <Award className="w-4 h-4 text-amber-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 truncate">{u.nombre}</div>
                                <div className="text-[10px] text-slate-500 leading-none">{uDef?.name || u.rol}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <button
                          onClick={() => {
                            setActiveTab('saas-management');
                            setShowRoleDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Layers className="w-4 h-4 text-purple-600" />
                          Plataforma SaaS & Facturación
                        </button>

                        <button
                          onClick={() => {
                            setShowPermissionsModal(true);
                            setShowRoleDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-purple-600" />
                          Ver Matriz de Permisos
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setShowRoleDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-2 border-t border-slate-100 mt-1 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Prominent Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="Cerrar sesión y volver al inicio público"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              /* If NOT Authenticated: Login and Register buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-300" />
                  <span>Iniciar Sesión</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('home');
                    const element = document.getElementById('registro');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Obtener Tarjeta VIP</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
  );
};
