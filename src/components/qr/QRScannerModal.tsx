import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QRScannerModalProps {
  onScanSuccess: (codigoVip: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScanSuccess, onClose }) => {
  const { clients } = useApp();
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Attempt camera start
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        }
      } catch (err: any) {
        console.warn('Camera access error or restricted iframe:', err);
        setCameraError('Cámara física no disponible en este entorno. Puedes usar el lector rápido simulado a continuación.');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSimulateScan = (vipCode: string) => {
    onScanSuccess(vipCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">Escanear Tarjeta VIP con QR</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Scanner Viewport */}
          <div className="relative aspect-square max-h-64 mx-auto rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-emerald-500/50 shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 space-y-2">
                <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  {cameraError || 'Apuntando al código QR de la tarjeta VIP...'}
                </p>
              </div>
            )}

            {/* Target Reticle */}
            <div className="absolute inset-8 border-2 border-emerald-400 border-dashed rounded-xl pointer-events-none flex items-center justify-center animate-pulse">
              <div className="w-16 h-1 bg-emerald-400/80 absolute top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Quick Mock Scanner / One-click test badges */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> O selecciona cliente para escaneo rápido (Demo):
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSimulateScan(client.codigoVip)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left transition-all group"
                >
                  <div>
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-emerald-800">
                      {client.nombre}
                    </div>
                    <div className="text-xs text-slate-500 flex gap-2">
                      <span>Doc: {client.documento}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {client.codigoVip}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
