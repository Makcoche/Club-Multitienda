import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Award, ShieldCheck, Download, Printer, Sparkles, Heart } from 'lucide-react';
import { ClientVIP, CardVIP } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface VirtualCardModalProps {
  client: ClientVIP;
  card?: CardVIP;
  onClose: () => void;
}

export const VirtualCardModal: React.FC<VirtualCardModalProps> = ({ client, card, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code encoding VIP code and client info
    const payload = JSON.stringify({
      vip: client.codigoVip,
      nombre: client.nombre,
      doc: client.documento,
      tarjeta: card?.codigoTarjeta || client.tarjetaActivaId,
    });

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [client, card]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg">Tarjeta Digital VIP Club Multitienda</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Canvas */}
        <div className="p-6 space-y-6">
          <div className="relative rounded-2xl p-6 text-white shadow-xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/30">
            {/* Background luxury accents */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar */}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 text-lg">
                    CLUB MULTITIENDA
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                  <Heart className="w-3 h-3 fill-emerald-400 inline" /> COMPRAS CON RESPONSABILIDAD SOCIAL
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> VIP MEMBER
              </div>
            </div>

            {/* Card Center Info & QR */}
            <div className="my-5 flex items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5 flex-1">
                <div className="text-xs text-slate-400 font-medium">Titular VIP</div>
                <div className="text-base font-bold text-white tracking-wide leading-tight">
                  {client.nombre}
                </div>
                <div className="text-xs text-slate-300">
                  Doc: <span className="font-mono">{client.documento}</span>
                </div>
                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Código VIP</div>
                  <div className="text-xl font-mono font-black text-amber-400 tracking-widest">
                    {client.codigoVip}
                  </div>
                </div>
              </div>

              {/* QR Image */}
              <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 shrink-0">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR VIP" className="w-24 h-24 block" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center bg-slate-100 text-xs text-slate-400">
                    Cargando QR...
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer on Card */}
            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-end text-[11px] text-slate-400 relative z-10">
              <div>
                <div>Tarjeta: <span className="text-slate-200 font-mono">{card?.codigoTarjeta || client.tarjetaActivaId || 'ACTIVA'}</span></div>
                <div>Emisión: <span className="text-slate-200">{formatDate(card?.fechaEmision || client.fechaRegistro)}</span></div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-medium flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Beneficiario CEB
                </div>
                <div className="text-[10px] text-slate-500">Centro de Experiencias Bilingüe</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Acumulado</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {formatCurrency(client.acumuladoTotal)}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Compras</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {client.totalCompras} transacciones
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-xs text-emerald-700 font-medium">Aporte CEB</div>
              <div className="text-sm font-bold text-emerald-800 mt-0.5">
                {formatCurrency(client.totalAporteCEB)}
              </div>
            </div>
          </div>

          {/* Slogan footnote */}
          <p className="text-center text-xs text-slate-500 italic">
            “Cada compra construye educación, cada familia transforma futuros.”
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Imprimir
            </button>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`Tarjeta_VIP_${client.codigoVip}.png`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar QR
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
