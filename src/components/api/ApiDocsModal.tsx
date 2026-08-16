import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  CheckCircle2,
  Terminal,
  Key,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ApiDocsModal: React.FC = () => {
  const { showApiDocsModal, setShowApiDocsModal, apiKeys, merchants } = useApp();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pos' | 'clients' | 'tax' | 'webhooks'>('pos');

  if (!showApiDocsModal) return null;

  const sampleApiKey = apiKeys[0]?.apiKey || 'cm_live_sk_supermerca_8f7b2e9a1c4d';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 text-white p-6 rounded-t-3xl flex items-center justify-between border-b border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                API REST & SDK para Comercios y Software POS
                <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  v2.0 LIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Integra tu software de caja (SIIGO, World Office, Vendty, Redeban) directamente con Club Multitienda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowApiDocsModal(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active API Key Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                Tu API Key Secreta en Vivo (Bearer Authorization):
              </span>
              <div className="font-mono text-xs font-semibold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 inline-block">
                {sampleApiKey}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(sampleApiKey, 'key')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedSection === 'key' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedSection === 'key' ? 'Copiada' : 'Copiar API Key'}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            {[
              { id: 'pos', label: '1. Registrar Compra POS (POST)' },
              { id: 'clients', label: '2. Consultar Cliente VIP (GET)' },
              { id: 'tax', label: '3. Certificados DIAN (GET)' },
              { id: 'webhooks', label: '4. Webhooks de Liquidación' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: POS Endpoint */}
          {activeTab === 'pos' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono font-black text-xs rounded-lg">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  https://api.clubmultitienda.com/v1/pos/transaction
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Registra una venta desde tu software POS. Valida cliente VIP, calcula y retiene el 7% de CEB automáticamente, y devuelve el Hash fiscal DIAN.
              </p>

              {/* cURL Example */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs space-y-2 relative">
                <div className="flex justify-between items-center text-slate-400 text-[10px] pb-2 border-b border-slate-800">
                  <span>cURL Command</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `curl -X POST https://api.clubmultitienda.com/v1/pos/transaction \\\n  -H "Authorization: Bearer ${sampleApiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "codigoVip": "VIP-7626",\n    "valorCompra": 150000,\n    "metodoPago": "TARJETA_DEBITO",\n    "numeroAutorizacion": "AP-839210"\n  }'`,
                        'curl-pos'
                      )
                    }
                    className="flex items-center gap-1 hover:text-white"
                  >
                    {copiedSection === 'curl-pos' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSection === 'curl-pos' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-300">{`curl -X POST https://api.clubmultitienda.com/v1/pos/transaction \\
  -H "Authorization: Bearer ${sampleApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "codigoVip": "VIP-7626",
    "valorCompra": 150000,
    "metodoPago": "TARJETA_DEBITO",
    "numeroAutorizacion": "AP-839210"
  }'`}</pre>
              </div>

              {/* Response JSON */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs space-y-2">
                <div className="text-[10px] text-slate-400 pb-2 border-b border-slate-800">
                  Respuesta JSON (201 Created)
                </div>
                <pre className="overflow-x-auto text-slate-300">{`{
  "status": "success",
  "transaccionId": "TRX-2026-000842",
  "cliente": {
    "nombre": "Elena Restrepo",
    "codigoVip": "VIP-7626",
    "nuevoAcumulado": 2980000
  },
  "desgloseTributario": {
    "valorCompra": 150000,
    "porcentajeCeb": 7,
    "deduccionCebMonto": 10500,
    "descuentoRentaArt257": 2625,
    "liquidacionNetaComercio": 139500,
    "certificadoDianHash": "DIAN-257-2026-000842-890900123-1"
  }
}`}</pre>
              </div>
            </div>
          )}

          {/* Tab 2: Client Lookup */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-mono font-black text-xs rounded-lg">
                  GET
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  https://api.clubmultitienda.com/v1/clients/:codigoVipOrDoc
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Consulta el estado de una tarjeta VIP antes de autorizar el cobro o descuento en caja.
              </p>

              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs space-y-2">
                <div className="text-[10px] text-slate-400 pb-2 border-b border-slate-800">
                  Respuesta JSON (200 OK)
                </div>
                <pre className="overflow-x-auto text-slate-300">{`{
  "status": "success",
  "client": {
    "id": "CLI-001",
    "nombre": "Elena Restrepo",
    "documento": "1098745210",
    "codigoVip": "VIP-7626",
    "estado": "Activo",
    "acumuladoTotal": 2830000,
    "totalCompras": 14
  }
}`}</pre>
              </div>
            </div>
          )}

          {/* Tab 3: Tax Certificate */}
          {activeTab === 'tax' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-mono font-black text-xs rounded-lg">
                  GET
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  https://api.clubmultitienda.com/v1/dian/certificate/:hash
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Descarga el comprobante XML/JSON criptográfico firmado para el contador del comercio y soporte de la DIAN.
              </p>
            </div>
          )}

          {/* Tab 4: Webhooks */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Eventos Webhook Disponibles:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><code>purchase.completed</code> — Se dispara al confirmar una compra en el POS.</li>
                  <li><code>ceb.settlement_transferred</code> — Se dispara al transferir la liquidación al Fideicomiso CEB.</li>
                  <li><code>card.replaced</code> — Se dispara al reponer una tarjeta VIP.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => setShowApiDocsModal(false)}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
