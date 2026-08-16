import React, { useState, useMemo } from 'react';
import {
  Zap,
  ShoppingCart,
  Receipt,
  HeartHandshake,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator,
  UserCheck,
  Building2,
  CreditCard,
  QrCode,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Printer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OperadorDashboard: React.FC = () => {
  const { currentUser, merchants, purchases, setActiveTab, cebConfig } = useApp();

  // Find merchant assigned to this operator
  const myMerchant = useMemo(() => {
    return merchants.find((m) => m.id === currentUser.comercioId) || merchants[0];
  }, [merchants, currentUser]);

  // Operator purchases for today
  const todayStr = new Date().toISOString().split('T')[0];
  
  const operatorPurchasesToday = useMemo(() => {
    return purchases.filter(
      (p) =>
        (p.usuarioId === currentUser.id || p.comercioId === myMerchant?.id) &&
        p.fecha === todayStr &&
        p.estado !== 'Anulada'
    );
  }, [purchases, currentUser, myMerchant, todayStr]);

  const totalTurnoVentas = useMemo(() => {
    return operatorPurchasesToday.reduce((acc, p) => acc + p.valorCompra, 0);
  }, [operatorPurchasesToday]);

  const totalTurnoCEB = useMemo(() => {
    return operatorPurchasesToday.reduce((acc, p) => acc + p.aporteCeb, 0);
  }, [operatorPurchasesToday]);

  // Calculator simulator
  const [calcAmount, setCalcAmount] = useState<number>(150000);
  const calculatedCEB = Math.round((calcAmount * cebConfig.porcentaje) / 100);

  // Arqueo modal state
  const [showArqueoModal, setShowArqueoModal] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Top Banner / Operator Shift Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Turno de Caja Activo
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {myMerchant?.nombre}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Terminal POS — {currentUser.nombre}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Sesión iniciada hoy • Sede: {myMerchant?.ciudad} • Porcentaje Social CEB: {cebConfig.porcentaje}%
            </p>
          </div>
        </div>

        {/* Action Button: Jump straight to fast registration */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArqueoModal(true)}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            Arqueo de Turno
          </button>

          <button
            onClick={() => setActiveTab('pos-register')}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <ShoppingCart className="w-5 h-5" />
            Registrar Compra VIP (10-15s)
          </button>
        </div>
      </div>

      {/* 4 Shift Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compras VIP Procesadas</div>
          <div className="text-3xl font-black text-slate-900">{operatorPurchasesToday.length}</div>
          <div className="text-xs text-emerald-700 font-semibold">En tu turno de hoy</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Facturado en Turno</div>
          <div className="text-3xl font-black text-slate-900 font-mono">{formatCurrency(totalTurnoVentas)}</div>
          <div className="text-xs text-slate-500">Monto total registrado en caja</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" /> Aporte Social CEB
          </div>
          <div className="text-3xl font-black text-emerald-700 font-mono">{formatCurrency(totalTurnoCEB)}</div>
          <div className="text-xs text-emerald-800 font-semibold">{cebConfig.porcentaje}% para educación de Santander</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {operatorPurchasesToday.length > 0
              ? formatCurrency(Math.round(totalTurnoVentas / operatorPurchasesToday.length))
              : '$ 0'}
          </div>
          <div className="text-xs text-slate-500">Por compra VIP atendida</div>
        </div>
      </div>

      {/* Grid 2 Cols: Step Guide & Fast Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Guide for Cashier */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Protocolo de Atención Rápida en Caja (10 - 15 Segundos)
            </h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              Estándar Operativo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <div className="font-bold text-xs text-slate-900">Solicitar Cédula o QR</div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Pide al cliente su tarjeta física, cédula o escanea su QR desde el celular.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div className="font-bold text-xs text-slate-900">Digitar Monto</div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Ingresa el valor total de la compra. El sistema calcula en milisegundos el 7% CEB.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <div className="font-bold text-xs text-slate-900">Entregar Comprobante</div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Confirma la transacción e informa al cliente su valioso aporte a becas CEB.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Frase de Cierre Recomendada en Caja:</div>
              <p className="italic text-emerald-900 mt-0.5">
                “¡Gracias por su compra VIP en {myMerchant?.nombre}! Con esta compra usted aportó {formatCurrency(Math.round(150000 * 0.07))} a la educación bilingüe de los niños de Santander.”
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Quick Calculator for Customers */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Calculadora Rápida para Clientes
            </h2>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {cebConfig.porcentaje}% CEB
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Simula en vivo cuánto destina una compra familiar a la formación bilingüe:
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Valor de la Compra ($ COP)</label>
            <input
              type="number"
              step={1000}
              value={calcAmount}
              onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-lg font-mono font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Aporte CEB ({cebConfig.porcentaje}%)</div>
              <div className="text-lg font-mono font-bold text-amber-300 mt-0.5">{formatCurrency(calculatedCEB)}</div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Equivalente Social</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {(calculatedCEB / 12500).toFixed(1)} horas de inglés
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Table: Today's Purchases by this operator */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-base">Ventas VIP Procesadas en Tu Turno</h3>
            <p className="text-xs text-slate-500">Historial en tiempo real de transacciones registradas hoy</p>
          </div>

          <button
            onClick={() => setActiveTab('pos-register')}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            Nueva Venta
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Transacción</th>
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-4">Cliente VIP</th>
                <th className="py-3 px-4">Código / Cédula</th>
                <th className="py-3 px-4 text-right">Valor Compra</th>
                <th className="py-3 px-4 text-right">Aporte CEB</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {operatorPurchasesToday.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aún no has registrado transacciones en este turno. Presiona el botón verde para registrar la primera.
                  </td>
                </tr>
              ) : (
                operatorPurchasesToday.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.numeroTransaccion}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{p.hora}</td>
                    <td className="py-3 px-4 font-bold">{p.clienteNombre}</td>
                    <td className="py-3 px-4 font-mono text-emerald-800">{p.codigoVip}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(p.valorCompra)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(p.aporteCeb)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
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

      {/* Arqueo Modal */}
      {showArqueoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900">Arqueo y Cierre de Turno de Caja</h3>
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
                <span className="text-slate-500">Operador Responsable:</span>
                <span className="font-bold text-slate-900">{currentUser.nombre}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Comercio / Sucursal:</span>
                <span className="font-bold text-slate-900">{myMerchant?.nombre}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Fecha y Hora de Arqueo:</span>
                <span className="font-bold text-slate-900">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total Transacciones VIP:</span>
                <span className="font-bold text-slate-900">{operatorPurchasesToday.length} transacciones</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 bg-emerald-50 px-3 rounded-xl">
                <span className="font-bold text-emerald-950">Monto Total Facturado:</span>
                <span className="font-mono font-black text-emerald-900 text-sm">{formatCurrency(totalTurnoVentas)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 bg-amber-50 px-3 rounded-xl">
                <span className="font-bold text-amber-950">Aporte CEB Total (7%):</span>
                <span className="font-mono font-black text-amber-900 text-sm">{formatCurrency(totalTurnoCEB)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir Arqueo
              </button>
              <button
                onClick={() => setShowArqueoModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
