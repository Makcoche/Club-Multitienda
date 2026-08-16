import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Monitor,
  Laptop,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, exportToCSV } from '../../utils/formatters';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();

  const [search, setSearch] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesModule = moduleFilter === 'ALL' || log.modulo === moduleFilter;
      const matchesAction = actionFilter === 'ALL' || log.accion === actionFilter;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        log.usuarioNombre.toLowerCase().includes(term) ||
        log.accion.toLowerCase().includes(term) ||
        log.detalle.toLowerCase().includes(term) ||
        (log.registroId && log.registroId.toLowerCase().includes(term));

      return matchesModule && matchesAction && matchesSearch;
    });
  }, [auditLogs, moduleFilter, actionFilter, search]);

  const handleExport = () => {
    exportToCSV(`auditoria_club_multitienda_${new Date().toISOString().split('T')[0]}`, filteredLogs);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-bold">
              MÓDULO 33
            </span>
            <span className="text-xs text-slate-500">Club Multitienda S.A.S.</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Bitácora de Auditoría y Trazabilidad Inmutable
          </h1>
          <p className="text-xs text-slate-500">
            Registro cronológico de todas las operaciones comerciales, creación de clientes, anulaciones y cambios de configuración.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Exportar Auditoría CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario, acción, detalle, ID de registro..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
          >
            <option value="ALL">Todos los Módulos</option>
            <option value="COMPRAS">COMPRAS</option>
            <option value="CLIENTES">CLIENTES</option>
            <option value="TARJETAS">TARJETAS</option>
            <option value="COMERCIOS">COMERCIOS</option>
            <option value="CEB">CEB</option>
            <option value="SISTEMA">SISTEMA</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Usuario Responsable</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Detalle de Operación</th>
                <th className="py-3 px-4">Dispositivo / IP</th>
                <th className="py-3 px-4 text-center">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    <div>{formatDate(log.fecha)}</div>
                    <div className="text-[10px] text-slate-400">{log.hora}</div>
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900">
                    <div>{log.usuarioNombre}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.usuarioEmail}</div>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {log.rol}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {log.accion}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 font-semibold">{log.modulo}</td>
                  <td className="py-3 px-4 font-sans text-slate-700 max-w-xs">{log.detalle}</td>
                  <td className="py-3 px-4 text-slate-500 text-[10px]">
                    <div>{log.ip}</div>
                    <div className="text-slate-400">{log.dispositivo}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.resultado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
