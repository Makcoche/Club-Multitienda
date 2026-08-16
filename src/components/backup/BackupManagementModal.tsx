import React, { useRef, useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Shield,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BackupManagementModalProps {
  onClose: () => void;
}

export const BackupManagementModal: React.FC<BackupManagementModalProps> = ({ onClose }) => {
  const {
    exportDatabaseJSON,
    importDatabaseJSON,
    resetToDefaults,
    clients,
    purchases,
    merchants,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDatabaseJSON(content);
      setStatusMsg({
        text: res.message,
        isError: !res.success,
      });
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    if (
      window.confirm(
        '¿Estás seguro de restablecer toda la base de datos a los valores iniciales de prueba? Se conservarán los datos oficiales de seed.'
      )
    ) {
      resetToDefaults();
      setStatusMsg({
        text: 'Base de datos restablecida con éxito a los datos oficiales de fábrica.',
        isError: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Copias de Seguridad y Respaldos (Sección 34)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Current Database Summary */}
          <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-slate-500">Clientes VIP</div>
              <div className="font-bold text-sm text-slate-900">{clients.length}</div>
            </div>
            <div>
              <div className="text-slate-500">Comercios</div>
              <div className="font-bold text-sm text-slate-900">{merchants.length}</div>
            </div>
            <div>
              <div className="text-slate-500">Compras</div>
              <div className="font-bold text-sm text-slate-900">{purchases.length}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* 1. Export JSON */}
            <button
              onClick={exportDatabaseJSON}
              className="w-full p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                Descargar Copia de Seguridad JSON
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                Completo
              </span>
            </button>

            {/* 2. Import JSON */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Restaurar desde Respaldo JSON
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  Subir .json
                </span>
              </button>
            </div>

            {/* 3. Reset Defaults */}
            <button
              onClick={handleResetConfirm}
              className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl font-bold flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                Restablecer Datos de Demostración Iniciales
              </span>
              <span className="text-[10px] text-rose-600 font-normal">Reiniciar</span>
            </button>
          </div>

          {/* Feedback message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                statusMsg.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {statusMsg.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {statusMsg.text}
            </div>
          )}

          {/* Backup Policy */}
          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700">Política de Respaldo (Sección 34):</div>
            <div>• Backup Diario: Base transaccional de compras.</div>
            <div>• Backup Semanal: Consolidado de comercios y clientes VIP.</div>
            <div>• Backup Mensual: Cierre contable de aportes al fondo CEB.</div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
