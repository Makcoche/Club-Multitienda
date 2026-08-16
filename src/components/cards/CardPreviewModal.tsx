import React from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Download,
  Share2,
  Printer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const CardPreviewModal: React.FC = () => {
  const { showCardModal, setShowCardModal, selectedCardClient, setSelectedCardClient } = useApp();

  if (!showCardModal || !selectedCardClient) return null;

  const client = selectedCardClient;

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setShowCardModal(false);
    setSelectedCardClient(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Tarjeta VIP Club Multitienda</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card Visual Front */}
          <div className="relative w-full aspect-[1.586/1] bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-2xl border border-amber-400/30 overflow-hidden flex flex-col justify-between">
            {/* Background luxury watermark */}
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar */}
            <div className="flex items-start justify-between z-10">
              <div>
                <div className="text-sm font-black tracking-widest text-amber-400 uppercase">
                  CLUB MULTITIENDA
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold tracking-wider">
                  TARJETA VIP CLIENTE PREFERENCIAL
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="text-[10px] font-black text-amber-300">VIP MEMBER</span>
              </div>
            </div>

            {/* Chip & NFC Visual */}
            <div className="flex items-center gap-3 z-10 my-1">
              <div className="w-11 h-8 bg-gradient-to-tr from-amber-300 via-amber-100 to-amber-400 rounded-md border border-amber-500/40 shadow-inner flex items-center justify-center">
                <div className="w-6 h-5 border border-amber-600/40 rounded flex flex-col justify-around py-0.5">
                  <div className="w-full h-px bg-amber-600/30" />
                  <div className="w-full h-px bg-amber-600/30" />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span>((( RFID / NFC )))</span>
              </div>
            </div>

            {/* Bottom Bar: VIP Code & Holder Name */}
            <div className="flex items-end justify-between z-10">
              <div>
                <div className="text-[9px] text-slate-400 uppercase font-medium">Titular VIP</div>
                <div className="text-base font-bold text-white tracking-wide truncate max-w-[220px]">
                  {client.nombre}
                </div>
                <div className="text-[10px] font-mono text-slate-400">CC: {client.documento}</div>
              </div>

              <div className="text-right">
                <div className="text-[9px] text-amber-400 uppercase font-semibold">Código VIP</div>
                <div className="text-xl font-mono font-black text-amber-400 tracking-wider">
                  {client.codigoVip}
                </div>
              </div>
            </div>
          </div>

          {/* Client Details Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Total Aportado al CEB:</span>
              <span className="font-mono font-black text-emerald-700 text-sm">
                {formatCurrency(client.totalAporteCEB || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Compras Realizadas:</span>
              <span className="font-bold text-slate-800 text-sm">
                {client.totalCompras} transacciones
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Imprimir Carnet VIP
            </button>

            <a
              href={`https://wa.me/${client.telefono?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hola ${client.nombre}, aquí tienes tu Tarjeta Virtual VIP Club Multitienda con Código ${client.codigoVip}. ¡Úsala en todos los comercios afiliados para apoyar el programa bilingüe CEB!`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Enviar a WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
