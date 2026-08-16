import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Building2,
  Users,
  CreditCard,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calculator,
  Search,
  BookOpen,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Clock,
  Printer,
  Download,
  FileCheck,
  ChevronRight,
  GraduationCap,
  Store,
  Compass,
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { HabeasDataModal } from '../legal/HabeasDataModal';

export const HomePage: React.FC = () => {
  const {
    clients,
    merchants,
    purchases,
    cebConfig,
    createClient,
    createMerchant,
    registerMerchantRequest,
    setActiveTab,
    switchUser,
    users,
    getClientByVIPOrDoc,
  } = useApp();

  // Registration Type Toggle: 'client' | 'merchant' | 'lookup'
  const [registerType, setRegisterType] = useState<'client' | 'merchant'>('client');
  const [showHabeasModal, setShowHabeasModal] = useState<boolean>(false);

  // Client Registration Form State
  const [clientForm, setClientForm] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    pin: '',
    aceptaHabeasData: true,
  });
  const [showPin, setShowPin] = useState(false);
  const [clientFeedback, setClientFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    clientData?: any;
  } | null>(null);
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  // Merchant Registration Form State
  const [merchantForm, setMerchantForm] = useState<{
    nombre: string;
    razonSocial: string;
    nit: string;
    categoria: string;
    direccion: string;
    ciudad: string;
    telefono: string;
    email: string;
    responsable: string;
    planId: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  }>({
    nombre: '',
    razonSocial: '',
    nit: '',
    categoria: 'Supermercados & Víveres',
    direccion: '',
    ciudad: 'Bucaramanga',
    telefono: '',
    email: '',
    responsable: '',
    planId: 'GROWTH',
  });
  const [merchantFeedback, setMerchantFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSubmittingMerchant, setIsSubmittingMerchant] = useState(false);

  // Live Card Preview QR
  const [liveCardQrUrl, setLiveCardQrUrl] = useState<string>('');

  // Quick lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupSearched, setLookupSearched] = useState(false);

  // Impact Simulator State (Monthly spend in COP)
  const [simulatedSpend, setSimulatedSpend] = useState<number>(450000);

  // Partner Merchants Directory Filter
  const [merchantSearch, setMerchantSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Aggregated Stats
  const totalPurchasesAmount = purchases
    .filter((p) => p.estado !== 'Anulada')
    .reduce((sum, p) => sum + p.valorCompra, 0);

  const totalCEBAmount = purchases
    .filter((p) => p.estado !== 'Anulada')
    .reduce((sum, p) => sum + p.aporteCeb, 0);

  // Estimated CEB Hours (e.g., $15,000 COP per hour of bilingual immersion)
  const estimatedHours = Math.max(85, Math.floor(totalCEBAmount / 15000));
  const estimatedStudents = Math.max(24, Math.floor(estimatedHours / 6));

  // Generate live QR for the card preview
  useEffect(() => {
    const previewPayload = JSON.stringify({
      club: 'Club Multitienda',
      nombre: clientForm.nombre || 'Nombre del Titular',
      doc: clientForm.documento || '1000000000',
      codigo: 'VIP-NUEVO',
    });

    QRCode.toDataURL(previewPayload, {
      width: 200,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => setLiveCardQrUrl(url))
      .catch((err) => console.error(err));
  }, [clientForm.nombre, clientForm.documento]);

  // Handle Client Registration
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientFeedback(null);

    if (!clientForm.nombre.trim()) {
      setClientFeedback({ type: 'error', message: 'Por favor ingresa tu nombre completo.' });
      return;
    }
    if (!clientForm.documento.trim()) {
      setClientFeedback({ type: 'error', message: 'Por favor ingresa tu número de documento de identidad.' });
      return;
    }
    if (!clientForm.telefono.trim()) {
      setClientFeedback({ type: 'error', message: 'Por favor ingresa un número de teléfono de contacto.' });
      return;
    }
    if (!clientForm.email.trim() || !clientForm.email.includes('@')) {
      setClientFeedback({ type: 'error', message: 'Por favor ingresa un correo electrónico válido.' });
      return;
    }
    if (!clientForm.aceptaHabeasData) {
      setClientFeedback({
        type: 'error',
        message: 'Debes aceptar la autorización de tratamiento de datos personales (Ley 1581).',
      });
      return;
    }

    setIsSubmittingClient(true);

    setTimeout(() => {
      const result = createClient({
        nombre: clientForm.nombre.trim(),
        documento: clientForm.documento.trim(),
        telefono: clientForm.telefono.trim(),
        email: clientForm.email.trim().toLowerCase(),
        estado: 'Activo',
        fechaRegistro: new Date().toISOString().split('T')[0],
        codigoVip: '', // Generated by context
        aceptaHabeasData: true,
      });

      setIsSubmittingClient(false);

      if (result.success && result.client) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        setClientFeedback({
          type: 'success',
          message: `¡Registro exitoso! Tu Tarjeta Digital y Código VIP han sido emitidos con éxito.`,
          clientData: result.client,
        });

        // Reset form
        setClientForm({
          nombre: '',
          documento: '',
          telefono: '',
          email: '',
          pin: '',
          aceptaHabeasData: true,
        });
      } else {
        setClientFeedback({
          type: 'error',
          message: result.message || 'Error al procesar el registro.',
        });
      }
    }, 600);
  };

  // Handle Merchant Registration
  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantFeedback(null);

    if (!merchantForm.nombre.trim()) {
      setMerchantFeedback({ type: 'error', message: 'Ingresa el nombre comercial del establecimiento.' });
      return;
    }
    if (!merchantForm.nit.trim()) {
      setMerchantFeedback({ type: 'error', message: 'Ingresa el NIT o documento tributario.' });
      return;
    }
    if (!merchantForm.telefono.trim() || !merchantForm.email.trim()) {
      setMerchantFeedback({ type: 'error', message: 'Ingresa teléfono y correo electrónico de contacto.' });
      return;
    }

    setIsSubmittingMerchant(true);

    setTimeout(() => {
      const result = registerMerchantRequest({
        nombre: merchantForm.nombre.trim(),
        razonSocial: merchantForm.razonSocial.trim() || merchantForm.nombre.trim(),
        nit: merchantForm.nit.trim(),
        categoria: merchantForm.categoria,
        direccion: merchantForm.direccion.trim() || 'Dirección Comercial Principal',
        ciudad: merchantForm.ciudad.trim() || 'Bucaramanga',
        telefono: merchantForm.telefono.trim(),
        email: merchantForm.email.trim().toLowerCase(),
        responsable: merchantForm.responsable.trim() || 'Gerente Comercial',
        planId: merchantForm.planId,
      });

      setIsSubmittingMerchant(false);

      if (result.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });

        setMerchantFeedback({
          type: 'success',
          message: `¡Comercio y Tenant SaaS aprovisionados con éxito! El establecimiento "${merchantForm.nombre}" ya tiene asignado su subdominio cloud, sede principal y Plan ${merchantForm.planId}.`,
        });

        setMerchantForm({
          nombre: '',
          razonSocial: '',
          nit: '',
          categoria: 'Supermercados & Víveres',
          direccion: '',
          ciudad: 'Bucaramanga',
          telefono: '',
          email: '',
          responsable: '',
          planId: 'GROWTH',
        });
      } else {
        setMerchantFeedback({
          type: 'error',
          message: result.message || 'No fue posible registrar el comercio.',
        });
      }
    }, 600);
  };

  // Handle Quick VIP Card / Client Lookup
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    const client = getClientByVIPOrDoc(lookupQuery);
    setLookupResult(client || null);
    setLookupSearched(true);
  };

  // Filtered merchants
  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.nombre.toLowerCase().includes(merchantSearch.toLowerCase()) ||
      m.categoria.toLowerCase().includes(merchantSearch.toLowerCase()) ||
      m.ciudad.toLowerCase().includes(merchantSearch.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || m.categoria.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(merchants.map((m) => m.categoria)));

  // Simulated social impact calculations
  const simulatedCebContribution = Math.round((simulatedSpend * cebConfig.porcentaje) / 100);
  const simulatedHours = (simulatedCebContribution / 15000).toFixed(1);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-emerald-500/20">
        {/* Glow decorative spheres */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Fidelización Comercial & Responsabilidad Social</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Tus compras diarias transforman vidas con el{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
              Club Multitienda
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
            Únete a la red comercial aliada. Cada vez que compras con tu{' '}
            <strong className="text-amber-300 font-semibold">Tarjeta VIP</strong>, los comercios aliados
            destinan automáticamente el{' '}
            <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded font-bold">
              {cebConfig.porcentaje}%
            </span>{' '}
            de tu compra para financiar becas de inmersión en inglés y talleres de robótica para niños y jóvenes
            del <strong className="text-white">Centro de Experiencias Bilingüe (CEB)</strong>.
          </p>

          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" /> Tarjeta VIP
              </div>
              <p className="text-2xl font-black text-white">100% Gratis</p>
              <p className="text-xs text-slate-400">Emisión digital instantánea</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <HeartHandshake className="w-4 h-4" /> Aporte Social
              </div>
              <p className="text-2xl font-black text-emerald-400">{cebConfig.porcentaje}% CEB</p>
              <p className="text-xs text-slate-400">En cada compra registrada</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Store className="w-4 h-4" /> Red Aliada
              </div>
              <p className="text-2xl font-black text-white">{merchants.length} Tiendas</p>
              <p className="text-xs text-slate-400">Supermercados, moda, salud</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                <GraduationCap className="w-4 h-4" /> Impacto Real
              </div>
              <p className="text-2xl font-black text-purple-300">+{estimatedHours} Horas</p>
              <p className="text-xs text-slate-400">De formación bilingüe</p>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#seccion-registro"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 text-sm transition-all hover:scale-105 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Obtener mi Tarjeta VIP Gratis</span>
            </a>

            <a
              href="#seccion-comercios"
              className="px-5 py-3 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Ver Comercios Afiliados</span>
            </a>

            <a
              href="#seccion-calculadora"
              className="px-5 py-3 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-semibold rounded-xl border border-emerald-500/30 text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Simulador de Impacto</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN PRINCIPAL DE REGISTRO DESTACADA */}
      <section id="seccion-registro" className="scroll-mt-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header of Registration Section */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" /> Emisión Gratuita & Afiliación Instantánea
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Regístrate y comienza a generar impacto hoy
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Elige si deseas registrarte como <strong className="text-amber-300">Cliente VIP</strong> para
                obtener tu carnet digital con QR, o inscribir tu{' '}
                <strong className="text-emerald-300">Comercio</strong> en la red de establecimientos aliados.
              </p>
            </div>

            {/* Selector Tabs */}
            <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shrink-0 self-start md:self-auto">
              <button
                onClick={() => setRegisterType('client')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  registerType === 'client'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Soy Cliente VIP</span>
              </button>

              <button
                onClick={() => setRegisterType('merchant')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  registerType === 'merchant'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Soy Comercio / Tienda</span>
              </button>
            </div>
          </div>

          {/* Registration Body */}
          <div className="p-6 sm:p-8 lg:p-10">
            {registerType === 'client' ? (
              /* CLIENT REGISTRATION */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form column */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-amber-500" />
                      <span>Formulario de Emisión de Tarjeta VIP</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Sin cuotas de manejo, sin costos ocultos. Tu tarjeta virtual estará lista en segundos.
                    </p>
                  </div>

                  {clientFeedback && (
                    <div
                      className={`p-4 rounded-2xl border text-sm flex items-start gap-3 animate-in fade-in duration-200 ${
                        clientFeedback.type === 'success'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      {clientFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold">{clientFeedback.message}</p>
                        {clientFeedback.clientData && (
                          <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1">
                            <p>
                              <strong>Código VIP Asignado:</strong>{' '}
                              <span className="font-mono font-bold text-amber-600">
                                {clientFeedback.clientData.codigoVip}
                              </span>
                            </p>
                            <p>
                              <strong>Titular:</strong> {clientFeedback.clientData.nombre}
                            </p>
                            <p>
                              <strong>Documento:</strong> {clientFeedback.clientData.documento}
                            </p>
                            <div className="pt-2 flex flex-wrap gap-2">
                              <button
                                onClick={() => setActiveTab('client-portal')}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5" /> Ver Mi Portal & Tarjeta QR
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleClientSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Nombre Completo *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={clientForm.nombre}
                            onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                            placeholder="Ej: Laura Gómez Morales"
                            className="w-full pl-3.5 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Cédula / Documento de Identidad *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={clientForm.documento}
                            onChange={(e) =>
                              setClientForm({ ...clientForm, documento: e.target.value.replace(/[^0-9a-zA-Z-]/g, '') })
                            }
                            placeholder="Ej: 1098765432"
                            className="w-full pl-3.5 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Teléfono Móvil / WhatsApp *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            value={clientForm.telefono}
                            onChange={(e) => setClientForm({ ...clientForm, telefono: e.target.value })}
                            placeholder="Ej: 315 876 5432"
                            className="w-full pl-3.5 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Correo Electrónico *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={clientForm.email}
                            onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                            placeholder="ejemplo@correo.com"
                            className="w-full pl-3.5 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Crear PIN / Clave de Seguridad (4 a 6 dígitos)
                      </label>
                      <div className="relative">
                        <input
                          type={showPin ? 'text' : 'password'}
                          value={clientForm.pin}
                          onChange={(e) => setClientForm({ ...clientForm, pin: e.target.value })}
                          placeholder="Para acceder a tu carnet digital"
                          maxLength={6}
                          className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Opcional. Te servirá para consultar tus puntos y carnet sin necesidad de contraseña compleja.
                      </p>
                    </div>

                    {/* Habeas data agreement */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={clientForm.aceptaHabeasData}
                          onChange={(e) => setClientForm({ ...clientForm, aceptaHabeasData: e.target.checked })}
                          className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400 w-4 h-4"
                        />
                        <span className="text-slate-600 leading-tight">
                          Autorizo el tratamiento de mis datos personales conforme a la{' '}
                          <strong className="text-slate-800 font-semibold">Ley 1581 de 2012</strong> (Habeas Data)
                          para la asignación de mi Tarjeta VIP y cómputo de aportes sociales educativos al CEB.{' '}
                          <button
                            type="button"
                            onClick={() => setShowHabeasModal(true)}
                            className="text-amber-600 font-bold hover:underline cursor-pointer inline"
                          >
                            Ver política completa
                          </button>
                        </span>
                      </label>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isSubmittingClient}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 text-sm tracking-wide flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingClient ? (
                        <span>Emitiendo Tarjeta VIP...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generar Mi Tarjeta VIP y Unirme al Club</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Live Card Preview Column */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>Vista Previa en Vivo</span>
                    <span className="text-amber-600 flex items-center gap-1 font-extrabold">
                      <Sparkles className="w-3.5 h-3.5" /> Carnet Digital
                    </span>
                  </div>

                  {/* Virtual Card Rendering */}
                  <div className="relative rounded-2xl p-5 text-white shadow-xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 border border-amber-500/30 text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 text-sm">
                          CLUB MULTITIENDA
                        </span>
                        <p className="text-[9px] text-amber-300 font-medium">COMPRAS CON IMPACTO SOCIAL</p>
                      </div>
                      <div className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                        VIP MEMBER
                      </div>
                    </div>

                    <div className="my-4 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="w-8 h-6 rounded bg-amber-400/30 border border-amber-400/60 mb-2 flex items-center justify-center text-[8px] font-mono text-amber-200">
                          CHIP
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Titular</p>
                        <p className="font-bold text-sm text-slate-100 truncate max-w-[160px]">
                          {clientForm.nombre || 'Nombre y Apellidos'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-300">
                          CC: {clientForm.documento || '1000000000'}
                        </p>
                      </div>

                      {/* Live QR */}
                      <div className="bg-white p-1.5 rounded-xl shadow-md shrink-0">
                        {liveCardQrUrl ? (
                          <img src={liveCardQrUrl} alt="QR" className="w-16 h-16" />
                        ) : (
                          <div className="w-16 h-16 bg-slate-200 rounded animate-pulse" />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                      <span>CÓDIGO: <strong className="text-amber-400 font-mono">VIP-AUTO</strong></span>
                      <span className="text-emerald-400 font-bold">APORTE: {cebConfig.porcentaje}% CEB</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Al registrarte recibirás tu código único VIP y código QR para presentarlo en cajas de cualquier comercio aliado.
                  </p>
                </div>
              </div>
            ) : (
              /* MERCHANT REGISTRATION */
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>Afiliación de Establecimiento Comercial</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Atrae a miles de clientes VIP y posiciona tu marca como una empresa con responsabilidad social vinculada al programa CEB.
                  </p>
                </div>

                {merchantFeedback && (
                  <div
                    className={`p-4 rounded-2xl border text-sm flex items-start gap-3 animate-in fade-in duration-200 ${
                      merchantFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-rose-50 border-rose-300 text-rose-800'
                    }`}
                  >
                    {merchantFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <p className="font-semibold">{merchantFeedback.message}</p>
                  </div>
                )}

                <form onSubmit={handleMerchantSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nombre Comercial del Establecimiento *
                      </label>
                      <input
                        type="text"
                        required
                        value={merchantForm.nombre}
                        onChange={(e) => setMerchantForm({ ...merchantForm, nombre: e.target.value })}
                        placeholder="Ej: Supermercado La Canasta"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Razón Social *
                      </label>
                      <input
                        type="text"
                        required
                        value={merchantForm.razonSocial}
                        onChange={(e) => setMerchantForm({ ...merchantForm, razonSocial: e.target.value })}
                        placeholder="Ej: Distribuciones La Canasta S.A.S."
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        NIT / RUT Tributario *
                      </label>
                      <input
                        type="text"
                        required
                        value={merchantForm.nit}
                        onChange={(e) => setMerchantForm({ ...merchantForm, nit: e.target.value })}
                        placeholder="Ej: 900.542.118-4"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Categoría de Comercio *
                      </label>
                      <select
                        value={merchantForm.categoria}
                        onChange={(e) => setMerchantForm({ ...merchantForm, categoria: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      >
                        <option value="Supermercados & Víveres">Supermercados & Víveres</option>
                        <option value="Farmacias & Salud">Farmacias & Salud</option>
                        <option value="Moda, Calzado & Accesorios">Moda, Calzado & Accesorios</option>
                        <option value="Restaurantes & Gastronomía">Restaurantes & Gastronomía</option>
                        <option value="Tecnología & Electrodomésticos">Tecnología & Electrodomésticos</option>
                        <option value="Librería & Papelería">Librería & Papelería</option>
                        <option value="Hogar & Construcción">Hogar & Construcción</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        required
                        value={merchantForm.ciudad}
                        onChange={(e) => setMerchantForm({ ...merchantForm, ciudad: e.target.value })}
                        placeholder="Ej: Bucaramanga"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Dirección Principal *
                      </label>
                      <input
                        type="text"
                        required
                        value={merchantForm.direccion}
                        onChange={(e) => setMerchantForm({ ...merchantForm, direccion: e.target.value })}
                        placeholder="Ej: Carrera 27 # 45-12"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Teléfono / Celular de Contacto *
                      </label>
                      <input
                        type="tel"
                        required
                        value={merchantForm.telefono}
                        onChange={(e) => setMerchantForm({ ...merchantForm, telefono: e.target.value })}
                        placeholder="Ej: (607) 634 5678"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Correo Electrónico Institucional *
                      </label>
                      <input
                        type="email"
                        required
                        value={merchantForm.email}
                        onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })}
                        placeholder="contacto@lacanasta.com"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nombre del Representante Legal o Gerente
                    </label>
                    <input
                      type="text"
                      value={merchantForm.responsable}
                      onChange={(e) => setMerchantForm({ ...merchantForm, responsable: e.target.value })}
                      placeholder="Ej: Carlos Eduardo Mendoza"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* SaaS Plan Selector */}
                  <div>
                    <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5">
                      Plan SaaS Multitienda Inicial
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'STARTER', name: 'Starter', price: '$99.000/mes', desc: '1 Sede' },
                        { id: 'GROWTH', name: 'Growth', price: '$249.000/mes', desc: 'Hasta 5 Sedes' },
                        { id: 'ENTERPRISE', name: 'Enterprise', price: '$499.000/mes', desc: 'Sedes Ilimitadas' },
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setMerchantForm({ ...merchantForm, planId: tier.id as any })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            merchantForm.planId === tier.id
                              ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">{tier.name}</div>
                          <div className="text-[10px] text-purple-700 font-semibold">{tier.price}</div>
                          <div className="text-[9px] text-slate-500">{tier.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingMerchant}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingMerchant ? (
                      <span>Registrando Establecimiento...</span>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Afiliar Establecimiento & Aprovisionar SaaS</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA EL CLUB MULTITIENDA */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Paso a Paso
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ¿Cómo funciona el Club Multitienda?
          </h2>
          <p className="text-sm text-slate-600">
            Un modelo transparente donde ganas beneficios y apoyas la educación de los niños.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center font-black text-xl">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Obtén tu Carnet QR Gratis</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Completa el formulario en 30 segundos y recibe tu código VIP exclusivo con código QR digital para tu móvil.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-xl">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Compra en Comercios Aliados</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Presenta tu cédula, código o QR en supermercados, farmacias y tiendas afiliadas al momento de pagar.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-xl">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">El 7% Financia Becas CEB</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              El comercio transfiere el {cebConfig.porcentaje}% de tu compra al fondo de formación bilingüe para niños de escasos recursos.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SIMULADOR DE IMPACTO SOCIAL (Interactive Slider) */}
      <section id="seccion-calculadora" className="scroll-mt-20">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl text-white p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4" /> Simulador Interactivo
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Calcula el impacto de tus compras mensuales
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Mueve el selector para ver cuánto aporte social generas con tus gastos cotidianos.
              </p>
            </div>

            <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-right">
              <span className="text-xs text-slate-400 block">Tasa Fija CEB</span>
              <span className="text-lg font-bold text-emerald-400">{cebConfig.porcentaje}% por compra</span>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-300">
                  Gasto mensual estimado en comercios aliados:
                </label>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {formatCurrency(simulatedSpend)}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={25000}
                value={simulatedSpend}
                onChange={(e) => setSimulatedSpend(Number(e.target.value))}
                className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>$50.000 COP</span>
                <span>$1.000.000 COP</span>
                <span>$2.000.000 COP</span>
              </div>
            </div>

            {/* Simulated Outputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Aporte Fondo Educativo CEB
                </span>
                <p className="text-2xl font-black text-emerald-300 mt-1">
                  {formatCurrency(simulatedCebContribution)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Directo sin costo extra para ti</p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Horas de Inglés Financiadas
                </span>
                <p className="text-2xl font-black text-amber-300 mt-1">
                  ~{simulatedHours} Horas
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Clases y talleres CEB al mes</p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-purple-500/30">
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                  Nivel de Fidelización VIP
                </span>
                <p className="text-xl font-black text-purple-300 mt-1">
                  {simulatedSpend >= 1000000
                    ? 'Nivel Platino'
                    : simulatedSpend >= 500000
                    ? 'Nivel Oro'
                    : simulatedSpend >= 200000
                    ? 'Nivel Plata'
                    : 'Nivel Bronce'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Con promociones exclusivas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONSULTA RÁPIDA DE CLIENTE / TARJETA VIP REGISTRADA */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Search className="w-4 h-4" /> Ya estás registrado?
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Consulta tu saldo acumulado y estado de tarjeta VIP
          </h2>
          <p className="text-xs text-slate-500">
            Ingresa tu cédula o código VIP (ej: <span className="font-mono font-bold">VIP-7626</span> o <span className="font-mono font-bold">1098765432</span>) para ver tus compras registradas.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Número de cédula o código VIP..."
              className="w-full pl-3.5 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Consultar</span>
          </button>
        </form>

        {lookupSearched && (
          <div className="pt-2 animate-in fade-in duration-200">
            {lookupResult ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{lookupResult.nombre}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {lookupResult.estado}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Código: <strong className="text-amber-600">{lookupResult.codigoVip}</strong> | Documento: {lookupResult.documento}
                  </p>
                  <p className="text-xs text-slate-600">
                    Compras Acumuladas: <strong>{formatCurrency(lookupResult.acumuladoTotal)}</strong> ({lookupResult.totalCompras} transacciones)
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('client-portal')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Ver Carnet QR Completo</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>No se encontró ningún cliente registrado con "{lookupQuery}". Puedes registrarte arriba de forma gratuita.</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 6. DIRECTORIO DE COMERCIOS AFILIADOS */}
      <section id="seccion-comercios" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Store className="w-4 h-4" /> Red Comercial
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Comercios Aliados Club Multitienda
            </h2>
            <p className="text-xs text-slate-500">
              Usa tu código VIP en cualquiera de estos establecimientos autorizados.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={merchantSearch}
                onChange={(e) => setMerchantSearch(e.target.value)}
                placeholder="Buscar comercio..."
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Merchants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMerchants.map((merchant) => (
            <div
              key={merchant.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {merchant.nombre.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {merchant.categoria}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{merchant.nombre}</h4>
                  <p className="text-xs text-slate-500 font-mono">NIT: {merchant.nit}</p>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{merchant.direccion}, {merchant.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{merchant.telefono}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5" /> 7% CEB Activo
                </span>
                <span className="text-slate-400 text-[11px]">Caja POS Habilitada</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ACCESO RÁPIDO A ROLES Y DASHBOARDS (For system users / evaluators) */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" /> Acceso Directo a Módulos del Sistema
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Paneles de Gestión y Operación
            </h2>
            <p className="text-xs text-slate-400">
              Selecciona cualquier perfil para explorar sus funciones operativas y analíticas con 1 clic:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Superadmin */}
          <div
            onClick={() => {
              const superUser = users.find((u) => u.rol === 'SUPERADMIN');
              if (superUser) switchUser(superUser.id);
              setActiveTab('dashboard');
            }}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                SUPERADMIN
              </span>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-white text-sm">Superadministrador</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Control global, estadísticas generales, auditoría de seguridad y configuración CEB.
            </p>
          </div>

          {/* Admin Comercio */}
          <div
            onClick={() => {
              const adminComercio = users.find((u) => u.rol === 'ADMIN_COMERCIO');
              if (adminComercio) switchUser(adminComercio.id);
              setActiveTab('dashboard');
            }}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                GERENTE
              </span>
              <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-white text-sm">Gerente de Comercio</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Panel de sucursal, ventas del comercio, arqueo de caja y clientes más frecuentes.
            </p>
          </div>

          {/* Operador POS */}
          <div
            onClick={() => {
              const cajero = users.find((u) => u.rol === 'OPERADOR_COMERCIO');
              if (cajero) switchUser(cajero.id);
              setActiveTab('pos-register');
            }}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                CAJA POS
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-white text-sm">Registro POS (10-15s)</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Terminal de caja para registro ultra-rápido de compras y cálculo de aporte social.
            </p>
          </div>

          {/* Cliente VIP Portal */}
          <div
            onClick={() => {
              const clientUser = users.find((u) => u.rol === 'CLIENTE_VIP');
              if (clientUser) switchUser(clientUser.id);
              setActiveTab('client-portal');
            }}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                CLIENTE VIP
              </span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-white text-sm">Mi Carnet VIP Digital</h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Accede a tu código QR en vivo, compras acumuladas e impacto educativo personal.
            </p>
          </div>
        </div>
      </section>

      {/* Habeas Data Modal */}
      {showHabeasModal && <HabeasDataModal onClose={() => setShowHabeasModal(false)} />}
    </div>
  );
};
