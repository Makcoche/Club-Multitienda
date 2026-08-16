import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Download,
  Filter,
  Eye,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building2,
  User,
  HeartHandshake,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Purchase } from '../../types';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';

export const PurchasesList: React.FC = () => {
  const { purchases, merchants, currentUser, annulPurchase } = useApp();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [merchantFilter, setMerchantFilter] = useState<string>('ALL');

  // Modals
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [annulTarget, setAnnulTarget] = useState<Purchase | null>(null);
  const [annulMotivo, setAnnulMotivo] = useState<string>('');
  const [annulError, setAnnulError] = useState<string | null>(null);

  // Filtered
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      // Permission check: if merchant user, only view own merchant
      if (currentUser.rol === 'ADMIN_COMERCIO' || currentUser.rol === 'OPERADOR_COMERCIO') {
        if (currentUser.comercioId && p.comercioId !== currentUser.comercioId) {
          return false;
        }
      }

      const matchesStatus = statusFilter === 'ALL' || p.estado === statusFilter;
      const matchesMerchant = merchantFilter === 'ALL' || p.comercioId === merchantFilter;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.numeroTransaccion.toLowerCase().includes(term) ||
        p.clienteNombre.toLowerCase().includes(term) ||
        p.codigoVip.toLowerCase().includes(term) ||
        p.comercioNombre.toLowerCase().includes(term) ||
        p.usuarioNombre.toLowerCase().includes(term);

      return matchesStatus && matchesMerchant && matchesSearch;
    });
  }, [purchases, currentUser, statusFilter, merchantFilter, search]);

  const handleExport = () => {
    const dataToExport = filteredPurchases.map((p) => ({
      Transaccion: p.numeroTransaccion,
      Fecha: p.fecha,
      Hora: p.hora,
      CodigoVIP: p.codigoVip,
      Cliente: p.clienteNombre,
      Comercio: p.comercioNombre,
      Operador: p.usuarioNombre,
      ValorCompra: p.valorCompra,
      PorcentajeCEB: `${p.porcentajeCeb}%`,
      AporteCEB: p.aporteCeb,
      Estado: p.estado,
      Observacion: p.observacion || '',
      MotivoAnulacion: p.motivoAnulacion || '',
      UsuarioAnulacion: p.usuarioAnulacion || '',
    }));

    exportToCSV(`compras_club_multitienda_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };

  const handleConfirmAnnul = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnulError(null);

    if (!annulTarget) return;
    if (!annulMotivo.trim() || annulMotivo.trim().length < 5) {
      setAnnulError('Por favor ingresa un motivo descriptivo para la anulación (mínimo 5 caracteres).');
      return;
    }

    const res = annulPurchase(annulTarget.id, annulMotivo);
    if (res.success) {
      setAnnulTarget(null);
      setAnnulMotivo('');
    } else {
      setAnnulError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              MÓDULO 16, 17 Y 18
            </span>
            <span className="text-xs text-slate-500">Club Multitienda VIP</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Registro y Trazabilidad de Compras VIP
          </h1>
          <p className="text-xs text-slate-500">
            Control transaccional inmutable con cálculo de aportes al Centro de Experiencias Bilingüe (CEB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por # transacción, cliente, código VIP, comercio..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {currentUser.rol === 'SUPERADMIN' && (
            <select
              value={merchantFilter}
              onChange={(e) => setMerchantFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
            >
              <option value="ALL">Todos los Comercios</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="Anulada">Anuladas</option>
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Transacción</th>
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4">Cliente VIP</th>
                <th className="py-3.5 px-4">Comercio</th>
                <th className="py-3.5 px-4">Operador</th>
                <th className="py-3.5 px-4 text-right">Valor Compra</th>
                <th className="py-3.5 px-4 text-right">Aporte CEB</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron transacciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      purchase.estado === 'Anulada' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {purchase.numeroTransaccion}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{formatDate(purchase.fecha)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{purchase.hora}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{purchase.clienteNombre}</div>
                      <div className="text-[10px] text-amber-800 font-bold font-mono">
                        {purchase.codigoVip}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {purchase.comercioNombre}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {purchase.usuarioNombre}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {formatCurrency(purchase.valorCompra)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700">
                      {formatCurrency(purchase.aporteCeb)}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({purchase.porcentajeCeb}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          purchase.estado === 'Confirmada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {purchase.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedPurchase(purchase)}
                          title="Ver Detalle Transacción"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {currentUser.rol === 'SUPERADMIN' && purchase.estado !== 'Anulada' && (
                          <button
                            onClick={() => {
                              setAnnulTarget(purchase);
                              setAnnulMotivo('');
                              setAnnulError(null);
                            }}
                            title="Anulación Controlada (Sección 18)"
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Purchase Detail */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Detalle de Transacción {selectedPurchase.numeroTransaccion}
              </h3>
              <button onClick={() => setSelectedPurchase(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div className="flex justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Estado de la Compra:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${selectedPurchase.estado === 'Confirmada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {selectedPurchase.estado}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Fecha:</span>
                  <span className="font-semibold">{formatDate(selectedPurchase.fecha)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hora:</span>
                  <span className="font-semibold font-mono">{selectedPurchase.hora}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cliente VIP:</span>
                  <span className="font-semibold">{selectedPurchase.clienteNombre}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Código VIP:</span>
                  <span className="font-mono font-bold text-amber-700">{selectedPurchase.codigoVip}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Comercio:</span>
                  <span className="font-semibold">{selectedPurchase.comercioNombre}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Operador de Registro:</span>
                  <span className="font-semibold">{selectedPurchase.usuarioNombre}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Valor Bruto de Compra:</span>
                  <span className="font-mono font-black text-base">{formatCurrency(selectedPurchase.valorCompra)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-800 pt-1 border-t border-slate-200">
                  <span className="font-semibold">Aporte CEB ({selectedPurchase.porcentajeCeb}%):</span>
                  <span className="font-mono font-black text-sm">{formatCurrency(selectedPurchase.aporteCeb)}</span>
                </div>
              </div>

              {selectedPurchase.observacion && (
                <div>
                  <span className="text-slate-500 block">Observación registrada:</span>
                  <p className="mt-0.5 p-2.5 bg-slate-50 rounded-lg text-slate-700 italic">
                    "{selectedPurchase.observacion}"
                  </p>
                </div>
              )}

              {selectedPurchase.estado === 'Anulada' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-rose-800">
                    <ShieldAlert className="w-4 h-4" /> Transacción Anulada
                  </div>
                  <div>Motivo: "{selectedPurchase.motivoAnulacion}"</div>
                  <div className="text-[10px] text-rose-700">
                    Por: {selectedPurchase.usuarioAnulacion} ({selectedPurchase.fechaAnulacion})
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Controlled Annulment (Section 18: No physical deletion) */}
      {annulTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-rose-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-300" />
                Anulación Controlada (Sección 18)
              </h3>
              <button onClick={() => setAnnulTarget(null)} className="text-rose-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmAnnul} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <div className="font-bold">Regla de No Eliminación Física:</div>
                <p>
                  La transacción <strong>{annulTarget.numeroTransaccion}</strong> ({formatCurrency(annulTarget.valorCompra)}) conservará su registro histórico en la base de datos pero se restará del acumulado del cliente y de los reportes vigentes.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  Motivo Obligatorio de Anulación
                </label>
                <textarea
                  rows={3}
                  value={annulMotivo}
                  onChange={(e) => setAnnulMotivo(e.target.value)}
                  placeholder="Ej: Error en el valor digitado por el cajero, devolución de mercancía autorizada por gerencia..."
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:border-rose-600 outline-none"
                />
              </div>

              {annulError && (
                <div className="p-3 bg-rose-100 text-rose-800 rounded-xl font-semibold">
                  {annulError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAnnulTarget(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Confirmar Anulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
