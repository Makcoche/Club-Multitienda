import React from 'react';
import { ShieldCheck, X, FileText, CheckCircle2, Lock } from 'lucide-react';

interface HabeasDataModalProps {
  onClose: () => void;
}

export const HabeasDataModal: React.FC<HabeasDataModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">
              Política de Protección de Datos Personales (Ley 1581 de 2012)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
            <strong>Club Multitienda S.A.S.</strong> da estricto cumplimiento a la <strong>Ley Estatutaria 1581 de 2012</strong> y al Decreto Reglamentario 1377 de 2013 de la República de Colombia en el tratamiento de los datos personales de clientes VIP y comercios afiliados.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">1. Finalidad del Tratamiento de Datos</h4>
            <p>
              Los datos recolectados (Nombre, Documento, Teléfono, Correo y Código VIP) son utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identificación del cliente en la red de comercios afiliados al Club Multitienda.</li>
              <li>Acumulación de transacciones y cálculo automático del aporte social al Centro de Experiencias Bilingüe (CEB).</li>
              <li>Emisión y validación de la Tarjeta Digital VIP con código QR.</li>
              <li>Envío de comprobantes de compra y estados de cuenta por correo electrónico o WhatsApp.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Derechos del Titular (Habeas Data)</h4>
            <p>
              El titular de los datos personales tiene derecho a conocer, actualizar, rectificar y suprimir su información personal en cualquier momento mediante comunicación a <code>contacto@clubmultitienda.com.co</code>.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">3. Seguridad y Confidencialidad</h4>
            <p>
              Los registros se encuentran cifrados, protegidos por controles de acceso basados en roles (RBAC) y bitácora de auditoría inmutable, evitando el acceso no autorizado de terceros.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
          >
            Entendido y Aceptado
          </button>
        </div>
      </div>
    </div>
  );
};
