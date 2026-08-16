import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS } from '../../types';

interface AccessDeniedProps {
  requiredRole?: string;
  requiredPermission?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole = 'Nivel Superior de Autorización',
  requiredPermission = 'Acceso a este módulo',
}) => {
  const { currentUser, setActiveTab, setShowPermissionsModal, setShowAuthModal } = useApp();
  const roleDef = ROLE_DEFINITIONS[currentUser.rol];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="bg-white max-w-lg w-full rounded-3xl p-8 shadow-sm border border-slate-200 text-center space-y-5">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Acceso Restringido por Política RBAC
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">Módulo No Autorizado Para Tu Rol</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Tu sesión actual corresponde al perfil <strong className="text-slate-800">{roleDef.name} ({currentUser.rol})</strong>, el cual no cuenta con los permisos necesarios para <strong>{requiredPermission}</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" /> Permisos de tu perfil actual:
          </div>
          <p className="text-slate-600 leading-snug">{roleDef.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Ir a Mi Dashboard
          </button>

          <button
            onClick={() => setShowPermissionsModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            Ver Matriz de Permisos
          </button>

          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Cambiar Usuario
          </button>
        </div>
      </div>
    </div>
  );
};
