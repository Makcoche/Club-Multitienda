import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  CreditCard,
  QrCode,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  Building2,
  Calendar,
  ShieldCheck,
  Download,
  Printer,
  ChevronRight,
  ShoppingBag,
  Clock,
  Search,
  BookOpen,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ClientVIPDashboard: React.FC = () => {
  const { currentUser, clients, cards, merchants, purchases, cebConfig } = useApp();

  // Identify client associated with current user or fallback to first client
  const myClient = useMemo(() => {
    return (
      clients.find((c) => c.id === currentUser.clienteId || c.email === currentUser.email) ||
      clients[0]
    );
  }, [clients, currentUser]);

  const myCard = useMemo(() => {
    return cards.find((c) => c.clienteId === myClient?.id && c.estado === 'Activa') || cards[0];
  }, [cards, myClient]);

  const myPurchases = useMemo(() => {
    return purchases.filter((p) => myClient && p.clienteId === myClient.id && p.estado !== 'Anulada');
  }, [purchases, myClient]);

  const totalSpent = useMemo(() => {
    return myPurchases.reduce((acc, p) => acc + p.valorCompra, 0);
  }, [myPurchases]);

  const totalCEBContributed = useMemo(() => {
    return myPurchases.reduce((acc, p) => acc + p.aporteCeb, 0);
  }, [myPurchases]);

  // VIP Tier calculation
  const vipTier = useMemo(() => {
    if (totalSpent >= 2000000) return { name: 'Platino', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', nextTier: 'Máximo Nivel', target: 2000000, progress: 100 };
    if (totalSpent >= 1000000) return { name: 'Oro', badge: 'bg-amber-100 text-amber-900 border-amber-300', nextTier: 'Platino ($2.000.000)', target: 2000000, progress: Math.min(100, (totalSpent / 2000000) * 100) };
    if (totalSpent >= 500000) return { name: 'Plata', badge: 'bg-slate-200 text-slate-800 border-slate-300', nextTier: 'Oro ($1.000.000)', target: 1000000, progress: Math.min(100, (totalSpent / 1000000) * 100) };
    return { name: 'Bronce', badge: 'bg-amber-900/10 text-amber-900 border-amber-400/40', nextTier: 'Plata ($500.000)', target: 500000, progress: Math.min(100, (totalSpent / 500000) * 100) };
  }, [totalSpent]);

  // Estimated bilingual learning hours sponsored
  const bilingualHours = (totalCEBContributed / 12500).toFixed(1);

  // QR generation
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (myClient) {
      const payload = JSON.stringify({
        vip: myClient.codigoVip,
        nombre: myClient.nombre,
        doc: myClient.documento,
        tarjeta: myCard?.codigoTarjeta || 'CRD-VIP',
      });

      QRCode.toDataURL(payload, {
        width: 240,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      }).then((url) => setQrDataUrl(url));
    }
  }, [myClient, myCard]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* VIP Member Top Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
                Socio VIP Activo
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${vipTier.badge}`}>
                Nivel {vipTier.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              ¡Hola, {myClient?.nombre}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Bienvenido a tu panel VIP de compras con responsabilidad social para el Centro de Experiencias Bilingüe (CEB).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              Imprimir Carnet VIP
            </button>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-400">
              Progreso hacia el Nivel <strong className="text-amber-300">{vipTier.nextTier}</strong>
            </span>
            <span className="font-mono font-bold text-emerald-400">{vipTier.progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${vipTier.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Virtual Card & Impact Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Virtual VIP Card Interactive Display */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl p-6 sm:p-7 text-white shadow-2xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/30">
            {/* Holographic Chip */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  CLUB MULTITIENDA VIP
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">
                  Membresía Oficial Santander
                </div>
              </div>
              <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 flex items-center justify-center shadow-inner border border-amber-200">
                <div className="w-6 h-4 border border-amber-600/40 rounded-xs opacity-75" />
              </div>
            </div>

            {/* QR & VIP Code */}
            <div className="flex items-center gap-5 my-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Código QR Tarjeta VIP"
                  className="w-24 h-24 rounded-xl bg-white p-1 shadow-sm shrink-0"
                />
              )}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Código VIP Titular</div>
                <div className="font-mono text-2xl font-black text-amber-400 tracking-wider">
                  {myClient?.codigoVip}
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  {myCard?.codigoTarjeta}
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  <ShieldCheck className="w-3 h-3" /> Tarjeta {myCard?.estado}
                </div>
              </div>
            </div>

            {/* Cardholder Details */}
            <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Titular</div>
                <div className="font-bold text-sm tracking-wide text-white uppercase">{myClient?.nombre}</div>
                <div className="text-[11px] text-slate-400 font-mono">CC: {myClient?.documento}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Vence</div>
                <div className="font-mono text-xs text-amber-300 font-bold">
                  {myCard?.fechaVencimiento || '2028-12-31'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Presenta este código QR o tu cédula en cualquier caja afiliada.</span>
            </div>
          </div>
        </div>

        {/* 4 Metrics & Direct CEB Social Impact */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compras Acumuladas</div>
              <div className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(totalSpent)}</div>
              <div className="text-xs text-slate-500">{myPurchases.length} transacciones registradas</div>
            </div>

            <div className="bg-emerald-900 text-white p-5 rounded-2xl border border-emerald-800 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" /> Tu Aporte CEB ({cebConfig.porcentaje}%)
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">{formatCurrency(totalCEBContributed)}</div>
              <div className="text-xs text-emerald-200">Para becas de niños de Santander</div>
            </div>
          </div>

          {/* Social Impact Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Tu Huella Social en Educación</h3>
                <p className="text-xs text-slate-500">
                  Gracias a tus compras familiares en el Club Multitienda
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-2xl font-black text-emerald-700">{bilingualHours} hrs</div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">Clases de inglés financiadas</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-2xl font-black text-purple-700">Padrino VIP</div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">Distinción Solidaria CEB</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
              “Cada compra que realizas fortalece el fondo de inmersión lingüística en inglés para los jóvenes con mayores talentos de nuestra región.”
            </p>
          </div>
        </div>
      </div>

      {/* Affiliated Merchants Directory where they can shop */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Comercios Afiliados donde Acumulas Puntos y Apoyas al CEB
            </h3>
            <p className="text-xs text-slate-500">
              Disfruta de beneficios VIP y descuentos presentando tu tarjeta o código en estos establecimientos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {merchants.map((merchant) => (
            <div
              key={merchant.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all bg-slate-50/50 hover:bg-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${merchant.logoColor || 'from-emerald-600 to-teal-700'} text-white flex items-center justify-center font-black text-xs shadow-xs`}>
                  {merchant.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{merchant.nombre}</div>
                  <div className="text-[10px] text-slate-500 truncate">{merchant.categoria}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span>📍 {merchant.direccion}, {merchant.ciudad}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-700 pt-1">
                  <span>Beneficio: Aporte 7% CEB + Descuento VIP</span>
                  <span className="text-amber-600 font-bold">★ Afiliado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Purchases History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-base">Historial de Tus Compras VIP</h3>
          <p className="text-xs text-slate-500">Registro detallado de tus compras y aportes generados a CEB</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Comprobante</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Comercio</th>
                <th className="py-3 px-4 text-right">Valor Compra</th>
                <th className="py-3 px-4 text-right">Aporte CEB (7%)</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {myPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aún no tienes compras registradas. Presenta tu tarjeta VIP en tu próxima visita a cualquiera de los comercios afiliados.
                  </td>
                </tr>
              ) : (
                myPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold">{p.numeroTransaccion}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {formatDate(p.fecha)} {p.hora}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.comercioNombre}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(p.valorCompra)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(p.aporteCeb)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
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
    </div>
  );
};
