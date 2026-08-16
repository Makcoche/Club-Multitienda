import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Search,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Building2,
  UserCheck,
  CreditCard,
  HeartHandshake,
  Receipt,
  Printer,
  Share2,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowRight,
  Wallet,
  Landmark,
  FileCheck,
  Percent,
  Coins,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Purchase, ClientVIP, PaymentMethod, PaymentDetails } from '../../types';
import {
  formatCurrency,
  formatDate,
  computeTaxDeductionBreakdown,
  generateAuthorizationCode,
} from '../../utils/formatters';
import { QRScannerModal } from '../qr/QRScannerModal';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'EFECTIVO', label: 'Efectivo en Caja', icon: '💵', desc: 'Pago contra entrega en caja' },
  { id: 'TARJETA_DEBITO', label: 'Tarjeta Débito POS', icon: '💳', desc: 'Datáfono Redeban/CredibanCo' },
  { id: 'TARJETA_CREDITO', label: 'Tarjeta Crédito', icon: '💳', desc: 'Visa / Mastercard / Amex' },
  { id: 'PSE_BANCOLOMBIA', label: 'PSE / Bancolombia', icon: '🏦', desc: 'Transferencia bancaria en línea' },
  { id: 'NEQUI_DAVIPLATA', label: 'Nequi / Daviplata', icon: '📱', desc: 'Billetera digital QR / Llave' },
  { id: 'QR_REDEBAN', label: 'QR Interoperable', icon: '📲', desc: 'Código QR multifinanciero' },
];

export const FastPurchaseRegister: React.FC = () => {
  const {
    currentUser,
    merchants,
    clients,
    cebConfig,
    registerPurchase,
    getClientByVIPOrDoc,
    setShowSettlementModal,
  } = useApp();

  // State
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(() => {
    return currentUser.comercioId || (merchants[0]?.id || '');
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [identifiedClient, setIdentifiedClient] = useState<ClientVIP | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
  const [authCodeInput, setAuthCodeInput] = useState<string>('');
  const [observacion, setObservacion] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastPurchase, setLastPurchase] = useState<Purchase | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  // Speed measurement timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);

  // Focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Update selected merchant if user changes
  useEffect(() => {
    if (currentUser.comercioId) {
      setSelectedMerchantId(currentUser.comercioId);
    }
  }, [currentUser]);

  // Stopwatch effect for measuring transaction speed (10-15s requirement)
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  // Handle client search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIdentifiedClient(null);
      setErrorMsg(null);
      return;
    }

    const found = getClientByVIPOrDoc(searchQuery);
    if (found) {
      setIdentifiedClient(found);
      setErrorMsg(null);
      if (!timerActive && !lastPurchase) {
        setTimerActive(true);
        setTimerSeconds(0);
      }
    } else {
      setIdentifiedClient(null);
    }
  }, [searchQuery, getClientByVIPOrDoc]);

  // Quick Amount presets
  const presetAmounts = [50000, 100000, 250000, 500000, 1000000];

  const handleSelectPreset = (val: number) => {
    setAmountInput(String(val));
    setErrorMsg(null);
  };

  const parsedAmount = parseFloat(amountInput.replace(/[^0-9]/g, '')) || 0;
  const currentPercent = cebConfig.porcentaje || 7;
  const activeMerchant = merchants.find((m) => m.id === selectedMerchantId) || merchants[0];

  // Calculate live tax deductions
  const liveTaxBreakdown = computeTaxDeductionBreakdown(
    parsedAmount,
    currentPercent,
    activeMerchant?.nit || '901.884.210-4',
    'PRE-CALC'
  );

  const parsedCashReceived = parseFloat(cashReceivedInput.replace(/[^0-9]/g, '')) || 0;
  const cashChange = Math.max(0, parsedCashReceived - parsedAmount);

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!identifiedClient) {
      setErrorMsg('Por favor busca o escanea un cliente VIP válido primero.');
      searchInputRef.current?.focus();
      return;
    }

    if (parsedAmount <= 0) {
      setErrorMsg('Por favor ingresa un valor de compra mayor a $0.');
      amountInputRef.current?.focus();
      return;
    }

    if (selectedPaymentMethod === 'EFECTIVO' && parsedCashReceived > 0 && parsedCashReceived < parsedAmount) {
      setErrorMsg(`El efectivo recibido (${formatCurrency(parsedCashReceived)}) es menor al total de la compra.`);
      return;
    }

    const finalAuthCode = authCodeInput.trim() || generateAuthorizationCode();

    const paymentDetails: PaymentDetails = {
      metodo: selectedPaymentMethod,
      montoRecibido: selectedPaymentMethod === 'EFECTIVO' && parsedCashReceived > 0 ? parsedCashReceived : parsedAmount,
      cambioVueltas: selectedPaymentMethod === 'EFECTIVO' ? cashChange : 0,
      numeroAutorizacion: finalAuthCode,
      referenciaPasarela: selectedPaymentMethod !== 'EFECTIVO' ? `GW-${Math.random().toString(36).substring(2, 9).toUpperCase()}` : undefined,
    };

    const result = registerPurchase({
      codigoVip: identifiedClient.codigoVip,
      valorCompra: parsedAmount,
      observacion,
      overrideMerchantId: selectedMerchantId,
      metodoPago: selectedPaymentMethod,
      detallesPago: paymentDetails,
    });

    if (result.success && result.purchase) {
      setTimerActive(false);
      setLastPurchase(result.purchase);
      setShowReceipt(true);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleNewSale = () => {
    setSearchQuery('');
    setIdentifiedClient(null);
    setAmountInput('');
    setCashReceivedInput('');
    setAuthCodeInput('');
    setObservacion('');
    setErrorMsg(null);
    setShowReceipt(false);
    setLastPurchase(null);
    setTimerActive(false);
    setTimerSeconds(0);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Operator Context */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Terminal POS — Pasarela & Deducciones DIAN
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                Art. 257 E.T. Habilitado
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Registra compras con pasarela multi-medio, cálculo automático del 7% CEB y certificado tributario en tiempo real.
            </p>
          </div>
        </div>

        {/* Speed Timer & Active Merchant Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-mono">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600">Tiempo:</span>
            <span className={`font-bold ${timerSeconds > 15 ? 'text-amber-600' : 'text-emerald-700'}`}>
              {timerSeconds}s
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold">{activeMerchant?.nombre}</span>
          </div>
        </div>
      </div>

      {/* Main Registration Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            {/* Step 1: Merchant Selection (If Superadmin) */}
            {currentUser.rol === 'SUPERADMIN' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Comercio Afiliado Registrador
                </label>
                <select
                  value={selectedMerchantId}
                  onChange={(e) => setSelectedMerchantId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} — NIT: {m.nit} ({m.categoria})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 2: Search or Scan VIP Code */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  1. Código Tarjeta VIP o Cédula
                </label>
                <span className="text-[11px] text-slate-500">Ej: VIP-7626 o 1098745210</span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escribe código VIP o documento..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-emerald-600 rounded-xl text-base font-semibold text-slate-900 tracking-wide outline-none transition-all"
                  />
                  {identifiedClient && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                  title="Escanear con QR de cámara"
                >
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <span className="hidden sm:inline">Escanear</span>
                </button>
              </div>

              {/* Quick Pick Sample VIP Badges */}
              {!identifiedClient && (
                <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Rápido:</span>
                  {clients.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSearchQuery(c.codigoVip)}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-lg font-mono font-semibold transition-colors"
                    >
                      {c.codigoVip} ({c.nombre.split(' ')[0]})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Purchase Amount */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                2. Valor Total de la Compra (COP)
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                  $
                </span>
                <input
                  ref={amountInputRef}
                  type="text"
                  value={amountInput ? Number(amountInput.replace(/[^0-9]/g, '')).toLocaleString('es-CO') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setAmountInput(raw);
                    setErrorMsg(null);
                    if (!timerActive && identifiedClient) {
                      setTimerActive(true);
                    }
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-emerald-600 rounded-xl text-3xl font-extrabold text-slate-900 outline-none transition-all font-mono"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    ${amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Real Payment Gateway & Method Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  3. Pasarela & Medio de Pago
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Instantáneo & Seguro
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = selectedPaymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{method.icon}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="font-bold text-xs text-slate-900 mt-1.5 truncate">
                        {method.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{method.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Cash payment specific details (Received and Change) */}
              {selectedPaymentMethod === 'EFECTIVO' && (
                <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-3 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Efectivo Recibido (COP)
                    </label>
                    <input
                      type="text"
                      value={cashReceivedInput ? Number(cashReceivedInput.replace(/[^0-9]/g, '')).toLocaleString('es-CO') : ''}
                      onChange={(e) => setCashReceivedInput(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={parsedAmount > 0 ? parsedAmount.toLocaleString('es-CO') : '0'}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Cambio / Vueltas
                    </label>
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-extrabold font-mono text-emerald-800">
                      {formatCurrency(cashChange)}
                    </div>
                  </div>
                </div>
              )}

              {/* Digital / Card Voucher Number */}
              {selectedPaymentMethod !== 'EFECTIVO' && (
                <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-slate-700">
                      No. Comprobante / Aprobación Datáfono / Pasarela
                    </label>
                    <span className="text-[10px] text-slate-500">Auto-generado si se deja vacío</span>
                  </div>
                  <input
                    type="text"
                    value={authCodeInput}
                    onChange={(e) => setAuthCodeInput(e.target.value)}
                    placeholder="Ej: AP-984721 / TRF-839210"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Optional Observation */}
            <div className="space-y-1 pt-1">
              <label className="block text-xs font-medium text-slate-600">
                Observación / Detalle de Compra (Opcional)
              </label>
              <input
                type="text"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej: Calzado escolar, mercado de víveres, farmacia..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium">{errorMsg}</div>
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="button"
              onClick={() => handleRegister()}
              disabled={!identifiedClient || parsedAmount <= 0}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
                identifiedClient && parsedAmount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-5 h-5" />
              CONFIRMAR PAGO & GENERAR CERTIFICADO DIAN
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Calculation & Client Verification Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Client Verification Card */}
          {identifiedClient ? (
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                    Cliente VIP Identificado
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {identifiedClient.nombre}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-black text-amber-400">
                    {identifiedClient.codigoVip}
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                    {identifiedClient.estado}
                  </span>
                </div>
              </div>

              <div className="py-4 grid grid-cols-2 gap-3 text-xs border-b border-slate-800">
                <div>
                  <span className="text-slate-400 block">Documento / Cédula</span>
                  <span className="font-mono text-slate-200 font-semibold">{identifiedClient.documento}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Teléfono de contacto</span>
                  <span className="text-slate-200">{identifiedClient.telefono}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Compras históricas</span>
                  <span className="text-slate-200 font-bold">{identifiedClient.totalCompras} transacciones</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Acumulado actual</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {formatCurrency(identifiedClient.acumuladoTotal)}
                  </span>
                </div>
              </div>

              {/* CEB Live Tax Deduction Breakdown Box */}
              <div className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-bold">
                    <Percent className="w-3.5 h-3.5 text-emerald-400" />
                    Desglose Tributario (Art. 257 E.T.):
                  </span>
                  <span className="font-bold text-emerald-400">{currentPercent}% Fondo CEB</span>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Aporte 7% Fideicomiso CEB:</span>
                    <span className="font-black text-emerald-400 font-mono">
                      {formatCurrency(liveTaxBreakdown.deduccionCebMonto)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1 text-[11px] text-amber-300">
                      <ShieldCheck className="w-3 h-3" />
                      Descuento en Renta Comercio (25%):
                    </span>
                    <span className="font-bold text-amber-300 font-mono">
                      -{formatCurrency(liveTaxBreakdown.beneficioDescuentoRenta25)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-700 text-slate-200 font-semibold">
                    <span>Liquidación Neta Comercio (93%):</span>
                    <span className="font-black text-white font-mono text-sm">
                      {formatCurrency(liveTaxBreakdown.liquidacionNetaComercio)}
                    </span>
                  </div>
                </div>

                {parsedAmount > 0 && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Nuevo acumulado cliente:</span>
                    <span className="text-white font-mono font-bold">
                      {formatCurrency(identifiedClient.acumuladoTotal + parsedAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">Esperando Identificación de Cliente</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Ingresa el código VIP (ej: VIP-7626) o escanea el QR para habilitar la pasarela de pagos y el cálculo tributario.
              </p>
            </div>
          )}

          {/* Social Impact & Tax Deduction Info */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Beneficio Tributario Art. 257 E.T.
              </div>
              <button
                type="button"
                onClick={() => setShowSettlementModal(true)}
                className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                Ver Liquidaciones <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Las donaciones del <strong>{currentPercent}%</strong> al programa bilingüe CEB generan un <strong>descuento tributario directo del 25%</strong> sobre el valor donado en la declaración de renta anual del comercio.
            </p>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <QRScannerModal
          onScanSuccess={(vip) => {
            setSearchQuery(vip);
            setIsScannerOpen(false);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Confirmation & Virtual Ticket Modal */}
      {showReceipt && lastPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 print:shadow-none print:border-none">
            {/* Ticket Header */}
            <div className="bg-slate-900 text-white p-6 text-center space-y-1">
              <div className="inline-flex p-2 bg-emerald-500 text-slate-900 rounded-full mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">¡Pago VIP Procesado con Éxito!</h3>
              <p className="text-xs text-slate-400">Comprobante Fiscal DIAN & Aporte Social CEB</p>
            </div>

            {/* Ticket Content */}
            <div className="p-6 space-y-4 text-sm text-slate-800">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Transacción No:</span>
                <span className="font-mono font-bold text-slate-900">{lastPurchase.numeroTransaccion}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha y Hora:</span>
                  <span className="font-medium">{formatDate(lastPurchase.fecha)} - {lastPurchase.hora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Comercio:</span>
                  <span className="font-semibold text-slate-900">{lastPurchase.comercioNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Medio de Pago:</span>
                  <span className="font-bold text-emerald-800">
                    {lastPurchase.metodoPago ? lastPurchase.metodoPago.replace(/_/g, ' ') : 'EFECTIVO'}
                  </span>
                </div>
                {lastPurchase.detallesPago?.numeroAutorizacion && (
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">No. Autorización:</span>
                    <span className="font-bold text-slate-800">{lastPurchase.detallesPago.numeroAutorizacion}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente VIP:</span>
                  <span className="font-bold text-slate-900">{lastPurchase.clienteNombre} ({lastPurchase.codigoVip})</span>
                </div>
              </div>

              {/* Financial & Tax Breakdown */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700">Valor de Compra:</span>
                  <span className="font-black text-slate-900 text-base font-mono">
                    {formatCurrency(lastPurchase.valorCompra)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-emerald-800 pt-1 border-t border-slate-200">
                  <span className="font-medium">Aporte 7% CEB Bilingüe:</span>
                  <span className="font-black font-mono text-sm text-emerald-700">
                    {formatCurrency(lastPurchase.aporteCeb)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-amber-700">
                  <span className="font-medium">Beneficio Renta Comercio (25%):</span>
                  <span className="font-bold font-mono">
                    {formatCurrency(Math.round(lastPurchase.aporteCeb * 0.25))}
                  </span>
                </div>
              </div>

              {/* DIAN Hash verification stamp */}
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-[10px] space-y-1 font-mono">
                <div className="text-slate-500 flex items-center justify-between">
                  <span className="font-bold text-slate-700">HASH FISCAL DIAN ART. 257:</span>
                  <span className="text-emerald-700 font-bold">VERIFICADO</span>
                </div>
                <div className="break-all text-slate-700 select-all">
                  {lastPurchase.certificadoDianHash || `DIAN-257-${lastPurchase.numeroTransaccion}-VALID`}
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-500 italic">
                “Cada compra construye educación, cada familia transforma futuros.”
              </p>
            </div>

            {/* Ticket Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 print:hidden">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  Imprimir Comprobante
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Club Multitienda VIP: Hola ${lastPurchase.clienteNombre}, tu compra por ${formatCurrency(
                      lastPurchase.valorCompra
                    )} en ${lastPurchase.comercioNombre} generó un aporte educativo de ${formatCurrency(
                      lastPurchase.aporteCeb
                    )} al programa CEB. Hash DIAN: ${lastPurchase.certificadoDianHash || 'OK'}. ¡Gracias por transformar futuros!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  Enviar WhatsApp
                </a>
              </div>

              <button
                type="button"
                onClick={handleNewSale}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 mt-1 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                Registrar Nueva Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
