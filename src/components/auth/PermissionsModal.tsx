import React from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Building2,
  Zap,
  Award,
  Users,
  KeyRound,
  FileCheck,
} from 'lucide-react';
import { ROLE_DEFINITIONS, SystemPermission, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

interface PermissionsModalProps {
  onClose: () => void;
}

interface PermissionItem {
  id: SystemPermission;
  label: string;
  category: string;
  description: string;
}

const ALL_PERMISSIONS: PermissionItem[] = [
  {
    id: 'VIEW_GLOBAL_DASHBOARD',
    label: 'Dashboard Global de la Red',
    category: 'Métricas & Visualización',
    description: 'Ver facturación total de toda la red, impacto CEB global y distribución por comercios.',
  },
  {
    id: 'VIEW_MERCHANT_DASHBOARD',
    label: 'Dashboard del Comercio / Sucursal',
    category: 'Métricas & Visualización',
    description: 'Ver estadísticas de ventas de la tienda, ticket promedio y aportes de la empresa.',
  },
  {
    id: 'VIEW_OPERATOR_DASHBOARD',
    label: 'Dashboard de Turno de Caja POS',
    category: 'Métricas & Visualización',
    description: 'Monitoreo de turno de cajero en vivo, metas diarias y arqueo de caja.',
  },
  {
    id: 'VIEW_VIP_PORTAL',
    label: 'Portal y Tarjeta Virtual VIP',
    category: 'Métricas & Visualización',
    description: 'Consulta de carnet digital con código QR, saldo acumulado y beneficios.',
  },
  {
    id: 'REGISTER_PURCHASE',
    label: 'Registro Rápido de Compras VIP (10-15s)',
    category: 'Transacciones',
    description: 'Procesamiento en caja, validación de estado de tarjeta y cálculo del 7% CEB.',
  },
  {
    id: 'ANNUL_PURCHASE',
    label: 'Anulación de Transacciones con Motivo',
    category: 'Transacciones',
    description: 'Anulación auditada de transacciones erróneas con reversión de saldos.',
  },
  {
    id: 'MANAGE_CLIENTS',
    label: 'Gestión y Registro de Clientes VIP',
    category: 'Membresías',
    description: 'Creación de clientes, actualización de datos y asignación de códigos VIP.',
  },
  {
    id: 'REPLACE_CARDS',
    label: 'Emisión y Reemplazo de Tarjetas VIP',
    category: 'Membresías',
    description: 'Bloqueo preventivo y reemisión de tarjetas por pérdida o deterioro.',
  },
  {
    id: 'MANAGE_MERCHANTS',
    label: 'Administración de Comercios Afiliados',
    category: 'Red Comercial',
    description: 'Alta de nuevos establecimientos comerciales, gestión de NITs y categorías.',
  },
  {
    id: 'MANAGE_CEB_CONFIG',
    label: 'Configuración del Porcentaje CEB',
    category: 'Responsabilidad Social',
    description: 'Ajuste del porcentaje oficial de aporte social al Centro de Experiencias Bilingüe.',
  },
  {
    id: 'VIEW_REPORTS',
    label: 'Centro de Reportes y Rankings',
    category: 'Informes',
    description: 'Generación de informes ejecutivos, comparativas y descargas en CSV/Excel.',
  },
  {
    id: 'VIEW_AUDIT_LOGS',
    label: 'Bitácora de Auditoría Inmutable',
    category: 'Seguridad',
    description: 'Trazabilidad de IPs, dispositivos, inicios de sesión y operaciones críticas.',
  },
  {
    id: 'MANAGE_BACKUPS',
    label: 'Copias de Seguridad y Restauración JSON',
    category: 'Seguridad',
    description: 'Exportación e importación completa de la base de datos del sistema.',
  },
];

const ROLES: UserRole[] = ['SUPERADMIN', 'ADMIN_COMERCIO', 'OPERADOR_COMERCIO', 'CLIENTE_VIP'];

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ onClose }) => {
  const { currentUser } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-800 text-purple-400 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide">Matriz de Roles y Permisos del Sistema (RBAC)</h2>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                  Control de Acceso
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tu rol actual es: <strong className="text-white">{currentUser.nombre} ({ROLE_DEFINITIONS[currentUser.rol].name})</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Summary Badges */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ROLES.map((roleKey) => {
              const def = ROLE_DEFINITIONS[roleKey];
              const isCurrent = currentUser.rol === roleKey;

              return (
                <div
                  key={roleKey}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${def.badgeColor}`}>
                      {def.shortName}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                        TÚ
                      </span>
                    )}
                  </div>
                  <div className="font-black text-xs text-slate-900">{def.name}</div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">{def.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permissions Table */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="pb-3 px-3">Funcionalidad / Permiso</th>
                <th className="pb-3 px-2 text-center">Superadmin</th>
                <th className="pb-3 px-2 text-center">Gerente Comercio</th>
                <th className="pb-3 px-2 text-center">Cajero POS</th>
                <th className="pb-3 px-2 text-center">Cliente VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ALL_PERMISSIONS.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{perm.label}</div>
                    <div className="text-[10px] text-slate-500">{perm.description}</div>
                  </td>

                  {ROLES.map((roleKey) => {
                    const has = ROLE_DEFINITIONS[roleKey].permissions.includes(perm.id);
                    return (
                      <td key={roleKey} className="py-2.5 px-2 text-center">
                        {has ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
