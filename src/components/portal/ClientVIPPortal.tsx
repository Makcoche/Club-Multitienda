import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  CreditCard,
  QrCode,
  HeartHandshake,
  History,
  Sparkles,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { ClientVIP, CardVIP, Purchase } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ClientVIPPortal: React.FC = () => {
  const { clients, cards, purchases, cebConfig, getClientByVIPOrDoc } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('VIP-7626');
  const [activeClient, setActiveClient] = useState<ClientVIP | null>(() => {
    return clients[0] || null;
  });
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setActiveClient(null);
      return;
    }
    const found = getClientByVIPOrDoc(searchQuery);
    if (found) {
      setActiveClient(found);
    }
  }, [searchQuery, getClientByVIPOrDoc]);

  // Generate QR
  useEffect(() => {
    if (activeClient) {
      const payload = JSON.stringify({
        vip: activeClient.codigoVip,
        nombre: activeClient.nombre,
        doc: activeClient.documento,
      });

      QRCode.toDataURL(payload, {
        width: 220,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      }).then((url) => setQrUrl(url));
    }
  }, [activeClient]);

  const clientPurchases = purchases.filter(
    (p) => activeClient && p.clienteId === activeClient.id && p.estado !== 'Anulada'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
              MÓDULO 22 — AUTOCONSULTA
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Portal del Cliente VIP</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Mi Cuenta y Beneficios Club Multitienda</h1>
          <p className="text-xs text-slate-300 italic">
            “Cada compra construye educación, cada familia transforma futuros.”
          </p>
        </div>

        {/* Search / Lookup input */}
        <div className="w-full sm:w-auto min-w-[260px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ingresa código VIP o Cédula..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {activeClient ? (
        <div className="space-y-6">
          {/* Virtual Card & Top Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* VIP Card Visual */}
            <div className="md:col-span-7">
              <div className="relative rounded-2xl p-6 text-white shadow-xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 text-lg">
                      CLUB MULTITIENDA
                    </span>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      COMPRAS CON RESPONSABILIDAD SOCIAL
                    </p>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                    VIP MEMBER
                  </div>
                </div>

                <div className="my-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] text-slate-400">Titular VIP</div>
                    <div className="text-base font-bold text-white">{activeClient.nombre}</div>
                    <div className="text-xs text-slate-300 font-mono">Doc: {activeClient.documento}</div>
                    <div className="pt-2">
                      <div className="text-[10px] text-slate-400">Código VIP</div>
                      <div className="text-xl font-mono font-black text-amber-400">{activeClient.codigoVip}</div>
                    </div>
                  </div>

                  {qrUrl && (
                    <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 shrink-0">
                      <img src={qrUrl} alt="QR VIP" className="w-20 h-20" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                  <span>Miembro desde: {formatDate(activeClient.fechaRegistro)}</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Beneficiario CEB
                  </span>
                </div>
              </div>
            </div>

            {/* Account Quick Metrics (Section 22) */}
            <div className="md:col-span-5 space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Mi Saldo Acumulado
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {formatCurrency(activeClient.acumuladoTotal)}
                </div>
                <div className="text-xs text-slate-500">{activeClient.totalCompras} compras válidas</div>
              </div>

              <div className="bg-emerald-900 text-white p-4 rounded-2xl border border-emerald-700 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-400" /> Mi Aporte a la Educación (CEB)
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {formatCurrency(activeClient.totalAporteCEB)}
                </div>
                <div className="text-[11px] text-emerald-200">
                  Calculado al {cebConfig.porcentaje}% para becas bilingües
                </div>
              </div>
            </div>
          </div>

          {/* Purchases History in Section 22 format */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Historial de Compras de Mi Cuenta</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {clientPurchases.length} compras registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Fecha & Hora</th>
                    <th className="py-3 px-4">Comercio Afiliado</th>
                    <th className="py-3 px-4 text-right">Valor Compra</th>
                    <th className="py-3 px-4 text-right">Aporte Generado al CEB</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {clientPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No hay compras registradas para este cliente todavía.
                      </td>
                    </tr>
                  ) : (
                    clientPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 text-slate-500">{formatDate(p.fecha)} - {p.hora}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.comercioNombre}</td>
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
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <Award className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">Cliente VIP no encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Por favor ingresa un código VIP válido (ej: VIP-7626 o VIP-1002) o el número de cédula en el buscador superior.
          </p>
        </div>
      )}
    </div>
  );
};
