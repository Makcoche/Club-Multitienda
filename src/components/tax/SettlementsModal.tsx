import React, { useState } from 'react';
import {
  X,
  Building2,
  FileCheck2,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  Send,
  Coins,
  GraduationCap,
  Calendar,
  AlertCircle,
  Hash,
  ExternalLink,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CEBSettlementRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SettlementsModal: React.FC = () => {
  const {
    showSettlementModal,
    setShowSettlementModal,
    merchants,
    purchases,
    settlements,
    liquidateMerchantCEB,
    currentUser,
  } = useApp();

  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(() => {
    return currentUser.comercioId || (merchants[0]?.id || '');
  });

  const [transferMethod, setTransferMethod] = useState<'PSE_BANCOLOMBIA' | 'TRANSFERENCIA_ACH' | 'PASARELA_WOMPI'>(
    'PSE_BANCOLOMBIA'
  );

  const [selectedSettlementToView, setSelectedSettlementToView] = useState<CEBSettlementRecord | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!showSettlementModal) return null;

  const currentMerchant = merchants.find((m) => m.id === selectedMerchantId) || merchants[0];

  // Calculate pending unliquidated 7% CEB for selected merchant
  const merchantPurchases = purchases.filter(
    (p) => p.comercioId === selectedMerchantId && p.estado === 'Confirmada'
  );
  const totalVentas = merchantPurchases.reduce((sum, p) => sum + p.valorCompra, 0);
  const total7Ceb = merchantPurchases.reduce((sum, p) => sum + p.aporteCeb, 0);
  const total93Net = totalVentas - total7Ceb;
  const taxDiscount25 = Math.round(total7Ceb * 0.25);

  const merchantSettlements = settlements.filter(
    (s) => s.comercioId === selectedMerchantId || currentUser.rol === 'SUPERADMIN'
  );

  const handleExecuteLiquidation = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    setTimeout(() => {
      const res = liquidateMerchantCEB(selectedMerchantId, transferMethod);
      setIsProcessing(false);
      if (res.success && res.settlement) {
        setSuccessMsg(res.message);
        setSelectedSettlementToView(res.settlement);
      } else {
        setErrorMsg(res.message);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 text-white p-6 rounded-t-3xl flex items-center justify-between border-b border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Liquidaciones 7% CEB & Deducción DIAN
                <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                  Art. 257 E.T.
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Fideicomiso Educativo Centro de Experiencias Bilingüe & Certificados Tributarios
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSettlementModal(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Merchant Filter for Superadmin */}
          {currentUser.rol === 'SUPERADMIN' && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 uppercase">Seleccionar Comercio:</span>
              </div>
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} — NIT: {m.nit}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current Period Financial Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs text-slate-500 font-medium">Ventas Acumuladas VIP</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {formatCurrency(totalVentas)}
              </div>
              <span className="text-[10px] text-slate-400">{merchantPurchases.length} transacciones</span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                Fondo CEB (7% Retenido)
              </span>
              <div className="text-xl font-black text-emerald-700 font-mono mt-1">
                {formatCurrency(total7Ceb)}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Fideicomiso Educativo</span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <span className="text-xs text-amber-800 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Descuento Renta (25%)
              </span>
              <div className="text-xl font-black text-amber-700 font-mono mt-1">
                {formatCurrency(taxDiscount25)}
              </div>
              <span className="text-[10px] text-amber-700 font-bold">Ahorro DIAN Comercio</span>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Liquidación Neta (93%)</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                {formatCurrency(total93Net)}
              </div>
              <span className="text-[10px] text-slate-400">Fondos libres comercio</span>
            </div>
          </div>

          {/* Social Impact Metric Box */}
          <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Impacto Educativo en Proceso</h4>
                <p className="text-xs text-emerald-200 max-w-md">
                  Con el 7% acumulado de <strong>{currentMerchant?.nombre}</strong>, se financian{' '}
                  <strong className="text-amber-300 font-mono">
                    {Math.round(total7Ceb / 3000)} horas
                  </strong>{' '}
                  de inmersión en inglés para niños vulnerables del programa CEB.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Estudiantes Beneficiados:</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {Math.max(1, Math.round(total7Ceb / 120000))} becas
              </div>
            </div>
          </div>

          {/* Execute Liquidate & Transfer Action */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Transferir Aportes Retenidos al Fideicomiso & Emitir Certificado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'PSE_BANCOLOMBIA', label: 'PSE / Bancolombia', desc: 'Transferencia bancaria directa' },
                { id: 'TRANSFERENCIA_ACH', label: 'ACH Interbancario', desc: 'Cualquier banco en Colombia' },
                { id: 'PASARELA_WOMPI', label: 'Wompi Bancolombia', desc: 'Pasarela en tiempo real' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTransferMethod(m.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    transferMethod === m.id
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{m.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExecuteLiquidation}
              disabled={isProcessing || total7Ceb <= 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                total7Ceb > 0 && !isProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              {isProcessing
                ? 'Procesando Fideicomiso...'
                : `LIQUIDAR $${total7Ceb.toLocaleString('es-CO')} Y GENERAR CERTIFICADO DIAN`}
            </button>
          </div>

          {/* Historical Settlements List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Historial de Liquidaciones & Certificados Emitidos
            </h3>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
              {merchantSettlements.map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-white hover:bg-slate-50 transition-colors flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{s.numeroLiquidacion}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        {s.estado}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      {s.comercioNombre} • Período: {s.periodo} • {formatDate(s.fechaLiquidacion)}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Hash DIAN: {s.certificadoDianHash}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Aporte 7% Fideicomiso:</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        {formatCurrency(s.montoRetenido7Ceb)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSettlementToView(s)}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      Ver Certificado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certificate Inspection Modal */}
        {selectedSettlementToView && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 space-y-6 border border-slate-200">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    República de Colombia — Certificado Tributario Art. 257 E.T.
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Certificación de Donación Fideicomiso Educativo CEB
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprobante oficial válido para descuento tributario del 25% en el Impuesto sobre la Renta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSettlementToView(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Número de Certificación:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedSettlementToView.numeroLiquidacion}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fecha de Liquidación:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedSettlementToView.fechaLiquidacion}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Comercio Donante:</span>
                    <span className="font-bold text-slate-900">
                      {selectedSettlementToView.comercioNombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Entidad Receptora:</span>
                    <span className="font-bold text-emerald-800">
                      Centro de Experiencias Bilingüe (CEB) — NIT 901.884.210-4
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ventas Brutas Procesadas:</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(selectedSettlementToView.totalVentasProcesadas)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Monto Donado al Fondo (7%):</span>
                    <span className="font-mono">
                      {formatCurrency(selectedSettlementToView.montoRetenido7Ceb)}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-700 font-bold border-t border-slate-100 pt-1">
                    <span>Descuento Tributario Aplicable en Renta (25%):</span>
                    <span className="font-mono">
                      {formatCurrency(Math.round(selectedSettlementToView.montoRetenido7Ceb * 0.25))}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[10px] bg-slate-900 text-emerald-400 p-3 rounded-xl break-all select-all">
                  <div className="text-slate-400">FIRMA DIGITAL & HASH DIAN:</div>
                  <div>{selectedSettlementToView.certificadoDianHash}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Certificado DIAN
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSettlementToView(null)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
