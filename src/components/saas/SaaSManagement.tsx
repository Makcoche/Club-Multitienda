import React, { useState } from 'react';
import {
  Layers,
  Store,
  Building2,
  Key,
  CreditCard,
  Plus,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Zap,
  Globe,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SaaSPlanTier, Branch } from '../../types';

export const SaaSManagement: React.FC = () => {
  const {
    currentUser,
    merchants,
    saasPlans,
    branches,
    saasSubscriptions,
    apiKeys,
    selectedTenantId,
    setSelectedTenantId,
    activeTenantMerchant,
    createBranch,
    updateBranch,
    deleteBranch,
    changeMerchantSaaSPlan,
    generateApiKey,
    revokeApiKey,
    getMerchantBranches,
    getMerchantSubscription,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'plans' | 'branches' | 'apikeys' | 'billing'>('plans');
  const [billingCycle, setBillingCycle] = useState<'MENSUAL' | 'ANUAL'>('MENSUAL');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for New Branch
  const [showNewBranchModal, setShowNewBranchModal] = useState<boolean>(false);
  const [newBranchData, setNewBranchData] = useState({
    nombre: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    cajasActivas: 2,
  });

  // Modal State for New API Key
  const [showNewKeyModal, setShowNewKeyModal] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');

  const isSuperadmin = currentUser.rol === 'SUPERADMIN';
  const targetMerchant = activeTenantMerchant || (currentUser.comercioId ? merchants.find((m) => m.id === currentUser.comercioId) : merchants[0]);
  const currentSub = targetMerchant ? getMerchantSubscription(targetMerchant.id) : undefined;
  const currentPlan = saasPlans.find((p) => p.id === (currentSub?.planId || targetMerchant?.planId || 'STARTER'));
  const currentBranches = targetMerchant ? getMerchantBranches(targetMerchant.id) : branches;
  const currentKeys = targetMerchant ? apiKeys.filter((k) => k.comercioId === targetMerchant.id) : apiKeys;

  const handleCopyKey = (keyString: string, keyId: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handlePlanChange = (newPlanId: SaaSPlanTier) => {
    if (!targetMerchant) return;
    const res = changeMerchantSaaSPlan(targetMerchant.id, newPlanId, billingCycle);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleCreateBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMerchant) return;

    // Check plan branch limit
    if (currentSub && currentSub.limiteSucursales !== 999 && currentBranches.length >= currentSub.limiteSucursales) {
      setFeedbackMsg({
        type: 'error',
        text: `Has alcanzado el límite de ${currentSub.limiteSucursales} sucursal(es) de tu Plan ${currentPlan?.nombre}. Actualiza tu plan para añadir más sedes.`,
      });
      setShowNewBranchModal(false);
      setTimeout(() => setFeedbackMsg(null), 4500);
      return;
    }

    const res = createBranch({
      comercioId: targetMerchant.id,
      nombre: newBranchData.nombre.trim(),
      ciudad: newBranchData.ciudad.trim(),
      direccion: newBranchData.direccion.trim(),
      telefono: newBranchData.telefono.trim(),
      cajasActivas: Number(newBranchData.cajasActivas) || 1,
      esPrincipal: false,
      estado: 'Activa',
    });

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setShowNewBranchModal(false);
      setNewBranchData({ nombre: '', ciudad: '', direccion: '', telefono: '', cajasActivas: 2 });
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleCreateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMerchant || !newKeyName.trim()) return;

    const res = generateApiKey(targetMerchant.id, newKeyName.trim(), ['READ_CLIENT', 'WRITE_PURCHASE']);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setShowNewKeyModal(false);
      setNewKeyName('');
    }
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-black tracking-wide uppercase">
                Arquitectura SaaS Multi-Tenant Cloud
              </span>
              {targetMerchant?.planId && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black tracking-wide">
                  Plan {targetMerchant.planId}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestión SaaS Multitienda & Sucursales
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Administra comercios aislados, sucursales descentralizadas, suscripciones recurrentes, cajas POS y credenciales API seguras.
            </p>
          </div>

          {/* Tenant Selector for SaaS Switch */}
          <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl shrink-0 w-full lg:w-80 backdrop-blur-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Tienda / Tenant en Foco:</span>
              <Store className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
            >
              {isSuperadmin && <option value="ALL">🌐 Toda la Red Multitienda (Global)</option>}
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  🏬 {m.nombre} ({m.planId || 'PRO'})
                </option>
              ))}
            </select>

            {targetMerchant && (
              <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-purple-300 truncate max-w-[170px]">
                  {targetMerchant.subdominio || `${targetMerchant.tenantSlug}.clubmultitienda.com.co`}
                </span>
                <span className="text-emerald-400 font-bold">Activo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-top ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* KPI Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Comercios SaaS</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{merchants.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% operativos en la nube</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Sucursales / Sedes</span>
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{branches.length}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">En {new Set(branches.map(b => b.ciudad)).size} ciudades</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Cajas POS Conectadas</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {branches.reduce((acc, b) => acc + (b.cajasActivas || 1), 0)}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5">Transacciones de 10 a 15 seg</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Ingresos SaaS Mensuales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${saasSubscriptions.reduce((acc, s) => acc + s.precioFacturadoCop, 0).toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Facturación recurrente</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-sm gap-1">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Planes SaaS & Precios</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Sedes & Sucursales ({currentBranches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('apikeys')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'apikeys'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Keys POS ({currentKeys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Facturación & Suscripciones</span>
        </button>
      </div>

      {/* Tab 1: SaaS Plans & Pricing */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === 'MENSUAL' ? 'text-slate-900' : 'text-slate-400'}`}>
              Facturación Mensual
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'MENSUAL' ? 'ANUAL' : 'MENSUAL')}
              className="w-12 h-6 bg-purple-950 rounded-full p-0.5 transition-colors relative cursor-pointer"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'ANUAL' ? 'translate-x-6 bg-amber-400' : ''
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${billingCycle === 'ANUAL' ? 'text-slate-900' : 'text-slate-400'}`}>
                Facturación Anual
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                Ahorra 20%
              </span>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {saasPlans.map((plan) => {
              const isCurrentForMerchant = targetMerchant?.planId === plan.id;
              const price = billingCycle === 'ANUAL' ? plan.precioAnualCop : plan.precioMensualCop;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative ${
                    plan.popular
                      ? 'border-purple-500 shadow-xl ring-2 ring-purple-500/20'
                      : 'border-slate-200 shadow-md hover:border-slate-300'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                      Más Popular para Cadenas
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900">{plan.nombre}</h3>
                      {isCurrentForMerchant && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold rounded-full">
                          Plan Actual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{plan.descripcion}</p>

                    <div className="mt-6 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">
                          ${price.toLocaleString('es-CO')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          COP /{billingCycle === 'ANUAL' ? 'año' : 'mes'}
                        </span>
                      </div>
                      <div className="text-[11px] text-purple-700 font-semibold mt-1">
                        {plan.maxSucursales === -1
                          ? 'Sucursales y Cajas POS Ilimitadas'
                          : `Hasta ${plan.maxSucursales} sucursal(es) incluidas`}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Incluye en la suscripción:
                      </div>
                      {plan.caracteristicas.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={isCurrentForMerchant}
                      className={`w-full py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                        isCurrentForMerchant
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isCurrentForMerchant ? 'Plan Activo en esta Tienda' : `Elegir Plan ${plan.nombre}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Branches / Sedes */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Sedes y Sucursales de {targetMerchant?.nombre || 'la Red'}
              </h2>
              <p className="text-xs text-slate-500">
                Descentraliza el cobro, asigna cajas POS registradoras y gestiona la cobertura geográfica.
              </p>
            </div>

            <button
              onClick={() => setShowNewBranchModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Sucursal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentBranches.map((branch) => {
              const merchantOfBranch = merchants.find((m) => m.id === branch.comercioId);

              return (
                <div
                  key={branch.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition-all space-y-3 ${
                    branch.esPrincipal ? 'border-purple-300 ring-1 ring-purple-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900">{branch.nombre}</h3>
                        {branch.esPrincipal && (
                          <span className="px-2 py-0.2 bg-purple-100 text-purple-800 font-bold text-[9px] rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{branch.ciudad}</div>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {branch.estado}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Dirección:</span>
                      <span className="text-slate-800">{branch.direccion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Teléfono:</span>
                      <span className="text-slate-800">{branch.telefono}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cajas POS activas:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                        {branch.cajasActivas} cajas
                      </span>
                    </div>
                    {merchantOfBranch && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Comercio:</span>
                        <span className="text-purple-700 font-semibold">{merchantOfBranch.nombre}</span>
                      </div>
                    )}
                  </div>

                  {!branch.esPrincipal && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la sucursal ${branch.nombre}?`)) {
                            deleteBranch(branch.id);
                          }
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar Sede
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: API Keys for POS & Software Integration */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-base font-black text-slate-900">API Keys de Conexión POS</h2>
              <p className="text-xs text-slate-500">
                Integra tu software de facturación o datáfonos externos directamente con el Club Multitienda SaaS.
              </p>
            </div>

            <button
              onClick={() => setShowNewKeyModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Generar API Key POS</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Nombre Clave</th>
                    <th className="p-3.5">Comercio</th>
                    <th className="p-3.5">API Key (Token)</th>
                    <th className="p-3.5">Permisos</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentKeys.map((k) => {
                    const m = merchants.find((item) => item.id === k.comercioId);
                    return (
                      <tr key={k.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{k.nombre}</td>
                        <td className="p-3.5 font-semibold text-purple-700">{m?.nombre || k.comercioId}</td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          <div className="flex items-center gap-2">
                            <span>{k.apiKey.substring(0, 18)}••••••••</span>
                            <button
                              onClick={() => handleCopyKey(k.apiKey, k.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                              title="Copiar API Key Completa"
                            >
                              {copiedKeyId === k.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex gap-1 flex-wrap">
                            {k.permisos.map((p, i) => (
                              <span key={i} className="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[9px] font-mono rounded">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono">{k.fechaCreacion}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              k.estado === 'Activa' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {k.estado}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {k.estado === 'Activa' && (
                            <button
                              onClick={() => revokeApiKey(k.id)}
                              className="text-rose-600 hover:text-rose-800 font-bold text-[11px] cursor-pointer"
                            >
                              Revocar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Billing & Subscriptions */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900">Estado de Facturación SaaS</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Plan Contratado</div>
                <div className="text-xl font-black text-purple-900 mt-1">{currentPlan?.nombre || 'PRO'}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  ${currentSub?.precioFacturadoCop.toLocaleString('es-CO')} COP / mes
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Próxima Renovación</div>
                <div className="text-xl font-black text-slate-900 mt-1">{currentSub?.fechaRenovacion || '2026-09-01'}</div>
                <div className="text-xs text-emerald-600 font-bold mt-0.5">Suscripción Automática Activa</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Método de Pago Registrado</div>
                <div className="text-xl font-black text-slate-900 mt-1">Visa Débito Corp</div>
                <div className="text-xs text-slate-500 mt-0.5">•••• 8821 (Factura Electrónica DIAN)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Branch */}
      {showNewBranchModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 mb-1">Añadir Nueva Sucursal / Sede</h3>
            <p className="text-xs text-slate-500 mb-4">
              Registra una nueva sede para {targetMerchant?.nombre}.
            </p>

            <form onSubmit={handleCreateBranchSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre de la Sede</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sede Poblado, Sucursal Norte"
                  value={newBranchData.nombre}
                  onChange={(e) => setNewBranchData({ ...newBranchData, nombre: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Ciudad</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Medellín"
                    value={newBranchData.ciudad}
                    onChange={(e) => setNewBranchData({ ...newBranchData, ciudad: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Cajas POS</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newBranchData.cajasActivas}
                    onChange={(e) => setNewBranchData({ ...newBranchData, cajasActivas: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Dirección</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carrera 43A # 1-50"
                  value={newBranchData.direccion}
                  onChange={(e) => setNewBranchData({ ...newBranchData, direccion: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono de Contacto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 310 987 6543"
                  value={newBranchData.telefono}
                  onChange={(e) => setNewBranchData({ ...newBranchData, telefono: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewBranchModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Guardar Sucursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Key */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 mb-1">Generar API Key POS</h3>
            <p className="text-xs text-slate-500 mb-4">
              Crea una credencial para conectar datáfonos o terminales de punto de venta.
            </p>

            <form onSubmit={handleCreateKeySubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Identificador de la Clave</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Datáfono Caja 1, Facturador Principal"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewKeyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Generar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
