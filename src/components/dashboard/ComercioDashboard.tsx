import React, { useState, useMemo } from 'react';
import {
  Building2,
  ShoppingCart,
  TrendingUp,
  Users,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  Printer,
  FileText,
  UserCheck,
  Shield,
  FileCheck,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ComercioDashboard: React.FC = () => {
  const {
    currentUser,
    merchants,
    purchases,
    users,
    setActiveTab,
    cebConfig,
    setShowPermissionsModal,
    setShowHabeasModal,
  } = useApp();

  const myMerchant = useMemo(() => {
    return merchants.find((m) => m.id === currentUser.comercioId) || merchants[0];
  }, [merchants, currentUser]);

  const myPurchases = useMemo(() => {
    return purchases.filter((p) => p.comercioId === myMerchant?.id);
  }, [purchases, myMerchant]);

  const validPurchases = useMemo(() => {
    return myPurchases.filter((p) => p.estado !== 'Anulada');
  }, [myPurchases]);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const purchasesToday = validPurchases.filter((p) => p.fecha === todayStr);
  const salesToday = purchasesToday.reduce((acc, p) => acc + p.valorCompra, 0);
  const cebToday = purchasesToday.reduce((acc, p) => acc + p.aporteCeb, 0);

  const purchasesThisMonth = validPurchases.filter((p) => p.fecha.startsWith(currentMonthStr));
  const salesThisMonth = purchasesThisMonth.reduce((acc, p) => acc + p.valorCompra, 0);

  const totalGeneratedCEB = validPurchases.reduce((acc, p) => acc + p.aporteCeb, 0);
  const uniqueClientsCount = new Set(validPurchases.map((p) => p.clienteId)).size;

  // Store Cashier / Operators
  const storeOperators = useMemo(() => {
    return users.filter((u) => u.comercioId === myMerchant?.id && u.rol === 'OPERADOR_COMERCIO');
  }, [users, myMerchant]);

  // Top VIP clients in this store
  const topStoreClients = useMemo(() => {
    const map = new Map<string, { nombre: string; vip: string; compras: number; total: number }>();
    validPurchases.forEach((p) => {
      const curr = map.get(p.clienteId) || { nombre: p.clienteNombre, vip: p.codigoVip, compras: 0, total: 0 };
      curr.compras += 1;
      curr.total += p.valorCompra;
      map.set(p.clienteId, curr);
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [validPurchases]);

  // Arqueo Modal
  const [showArqueoModal, setShowArqueoModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Commerce Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black text-xl shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Panel de Administración Comercial
              </span>
              <span className="text-xs text-slate-300 font-mono">NIT {myMerchant?.nit}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{myMerchant?.nombre}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {myMerchant?.categoria} • {myMerchant?.direccion}, {myMerchant?.ciudad}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('saas-management')}
            className="px-3.5 py-2.5 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Gestión de sedes, plan y API keys"
          >
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>SaaS & Sedes</span>
          </button>

          <button
            onClick={() => setShowPermissionsModal(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Matriz de permisos de cajeros"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Permisos</span>
          </button>

          <button
            onClick={() => setShowHabeasModal(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Tratamiento de datos personales de clientes"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ley 1581</span>
          </button>

          <button
            onClick={() => setShowArqueoModal(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Cierre Caja</span>
          </button>

          <button
            onClick={() => setActiveTab('pos-register')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Terminal POS</span>
          </button>
        </div>
      </div>

      {/* 6 Key Merchant Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compras VIP de Hoy</div>
          <div className="text-2xl font-black text-slate-900">{purchasesToday.length} transacciones</div>
          <div className="text-xs text-slate-500 font-medium">En tus cajas registradoras</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ventas VIP de Hoy</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(salesToday)}</div>
          <div className="text-xs text-emerald-700 font-semibold">Facturado en el día</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ventas VIP del Mes</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(salesThisMonth)}</div>
          <div className="text-xs text-slate-500">{purchasesThisMonth.length} transacciones acumuladas</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clientes VIP Fidelizados</div>
          <div className="text-2xl font-black text-slate-900">{uniqueClientsCount} clientes</div>
          <div className="text-xs text-slate-500">Compradores recurrentes</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {validPurchases.length > 0
              ? formatCurrency(Math.round(validPurchases.reduce((a, b) => a + b.valorCompra, 0) / validPurchases.length))
              : '$ 0'}
          </div>
          <div className="text-xs text-slate-500">Por venta VIP registrada</div>
        </div>

        <div className="bg-emerald-900 text-white p-5 rounded-2xl border border-emerald-800 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" /> Aporte Social CEB ({cebConfig.porcentaje}%)
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{formatCurrency(totalGeneratedCEB)}</div>
          <div className="text-[11px] text-emerald-200">Generado para la educación de Santander</div>
        </div>
      </div>

      {/* Grid: Cashiers on Shift & Top Store VIP Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cashier Team */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Equipo de Cajeros & Operadores de la Tienda
            </h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
              {storeOperators.length} activos
            </span>
          </div>

          <div className="space-y-2.5">
            {storeOperators.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay operadores asignados específicamente.</p>
            ) : (
              storeOperators.map((op) => {
                const opPurchasesToday = purchasesToday.filter((p) => p.usuarioId === op.id);
                const opSales = opPurchasesToday.reduce((a, b) => a + b.valorCompra, 0);

                return (
                  <div
                    key={op.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{op.nombre}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{op.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900">{formatCurrency(opSales)}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">{opPurchasesToday.length} ventas hoy</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top VIP Clients of this Store */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Top Clientes VIP Más Frecuentes
            </h3>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
              Fidelización
            </span>
          </div>

          <div className="space-y-2.5">
            {topStoreClients.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Aún no hay clientes registrados en este comercio.</p>
            ) : (
              topStoreClients.map((client, idx) => (
                <div
                  key={client.vip}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{client.nombre}</div>
                      <div className="text-[10px] text-emerald-800 font-mono font-semibold">{client.vip}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-900">{formatCurrency(client.total)}</div>
                    <div className="text-[10px] text-slate-500">{client.compras} compras</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Merchant Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-base">Historial de Compras de Tu Comercio</h3>
            <p className="text-xs text-slate-500">Registro exclusivo de transacciones en {myMerchant?.nombre}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Transacción</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Cliente VIP</th>
                <th className="py-3 px-4">Operador / Caja</th>
                <th className="py-3 px-4 text-right">Valor Compra</th>
                <th className="py-3 px-4 text-right">Aporte CEB</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {myPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay transacciones registradas para este comercio aún.
                  </td>
                </tr>
              ) : (
                myPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold">{p.numeroTransaccion}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{formatDate(p.fecha)} {p.hora}</td>
                    <td className="py-3 px-4 font-semibold">{p.clienteNombre} ({p.codigoVip})</td>
                    <td className="py-3 px-4">{p.usuarioNombre}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(p.valorCompra)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(p.aporteCeb)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.estado === 'Confirmada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arqueo Modal for Commerce Manager */}
      {showArqueoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900">Arqueo Consolidado de Sucursal</h3>
              </div>
              <button
                onClick={() => setShowArqueoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Comercio:</span>
                <span className="font-bold text-slate-900">{myMerchant?.nombre}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Administrador:</span>
                <span className="font-bold text-slate-900">{currentUser.nombre}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Fecha de Arqueo:</span>
                <span className="font-bold text-slate-900">{todayStr}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transacciones VIP de Hoy:</span>
                <span className="font-bold text-slate-900">{purchasesToday.length} transacciones</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 bg-blue-50 px-3 rounded-xl">
                <span className="font-bold text-blue-950">Ventas Totales Hoy:</span>
                <span className="font-mono font-black text-blue-900 text-sm">{formatCurrency(salesToday)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 bg-emerald-50 px-3 rounded-xl">
                <span className="font-bold text-emerald-950">Aporte CEB Hoy (7%):</span>
                <span className="font-mono font-black text-emerald-900 text-sm">{formatCurrency(cebToday)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir Arqueo
              </button>
              <button
                onClick={() => setShowArqueoModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
