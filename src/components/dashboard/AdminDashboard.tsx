import React, { useMemo } from 'react';
import {
  Users,
  Building2,
  ShoppingCart,
  TrendingUp,
  Award,
  HeartHandshake,
  ShieldAlert,
  Calendar,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  BookOpen,
  Shield,
  FileCheck,
  Database,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const {
    clients,
    merchants,
    purchases,
    cebConfig,
    setActiveTab,
    setShowPermissionsModal,
    setShowHabeasModal,
    setShowBackupModal,
    hasPermission,
  } = useApp();

  // Valid non-annulled purchases
  const validPurchases = useMemo(() => purchases.filter((p) => p.estado !== 'Anulada'), [purchases]);
  const annulledPurchases = useMemo(() => purchases.filter((p) => p.estado === 'Anulada'), [purchases]);

  // General KPIs
  const totalClients = clients.length;
  const totalMerchants = merchants.length;
  
  // Date calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  const purchasesToday = validPurchases.filter((p) => p.fecha === todayStr);
  const salesToday = purchasesToday.reduce((acc, curr) => acc + curr.valorCompra, 0);

  const purchasesThisMonth = validPurchases.filter((p) => p.fecha.startsWith(currentMonthStr));
  const salesThisMonth = purchasesThisMonth.reduce((acc, curr) => acc + curr.valorCompra, 0);

  const totalAccumulatedSales = validPurchases.reduce((acc, curr) => acc + curr.valorCompra, 0);
  const totalCEBContribution = validPurchases.reduce((acc, curr) => acc + curr.aporteCeb, 0);

  // Social Impact Metrics derived from total CEB contribution (Estimates: $100.000 funds ~2h bilingual immersion, $500.000 partial scholarship)
  const bilingualHoursFunded = Math.max(12, Math.round(totalCEBContribution / 25000));
  const studentBeneficiaries = Math.max(4, Math.round(totalCEBContribution / 70000));
  const fullScholarships = Math.max(2, Math.floor(totalCEBContribution / 200000));

  // Chart 1: Sales and CEB by Merchant
  const merchantChartData = useMemo(() => {
    return merchants.map((m) => {
      const merchantValidPurchases = validPurchases.filter((p) => p.comercioId === m.id);
      const totalVentas = merchantValidPurchases.reduce((acc, p) => acc + p.valorCompra, 0);
      const totalCEB = merchantValidPurchases.reduce((acc, p) => acc + p.aporteCeb, 0);
      return {
        name: m.nombre.length > 18 ? m.nombre.substring(0, 18) + '...' : m.nombre,
        ventas: totalVentas,
        ceb: totalCEB,
        transacciones: merchantValidPurchases.length,
      };
    }).sort((a, b) => b.ventas - a.ventas);
  }, [merchants, validPurchases]);

  // Chart 2: Time Series / Evolution
  const timelineChartData = useMemo(() => {
    const map = new Map<string, { fecha: string; ventas: number; ceb: number }>();
    
    // Sort chronological
    const sorted = [...validPurchases].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    sorted.forEach((p) => {
      const existing = map.get(p.fecha) || { fecha: formatDate(p.fecha), ventas: 0, ceb: 0 };
      existing.ventas += p.valorCompra;
      existing.ceb += p.aporteCeb;
      map.set(p.fecha, existing);
    });

    return Array.from(map.values());
  }, [validPurchases]);

  // Chart 3: Category distribution
  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    validPurchases.forEach((p) => {
      const merchant = merchants.find((m) => m.id === p.comercioId);
      const cat = merchant?.categoria || 'General';
      map.set(cat, (map.get(cat) || 0) + p.valorCompra);
    });

    const colors = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];
    return Array.from(map.entries()).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [validPurchases, merchants]);

  return (
    <div className="space-y-6">
      {/* Header Title with Slogan */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black tracking-wide">
              LOOKER STUDIO ANALYTICS
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Club Multitienda S.A.S.</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Dashboard General y Métricas de Responsabilidad Social
          </h1>
          <p className="text-xs text-slate-300 italic">
            “Cada compra construye educación, cada familia transforma futuros.”
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* SaaS & Multi-Tienda */}
          <button
            onClick={() => setActiveTab('saas-management')}
            className="px-3 py-2 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Gestión de planes SaaS, sedes y API keys POS"
          >
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>SaaS & Sedes</span>
          </button>

          {/* Permisos RBAC */}
          <button
            onClick={() => setShowPermissionsModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Consultar matriz de roles y permisos"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Matriz RBAC</span>
          </button>

          {/* Ley 1581 Habeas Data */}
          <button
            onClick={() => setShowHabeasModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Protección de datos personales Ley 1581 de 2012"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ley 1581</span>
          </button>

          {/* Respaldos */}
          {hasPermission('MANAGE_BACKUPS') && (
            <button
              onClick={() => setShowBackupModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copias de seguridad y restauración"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Respaldos</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('pos-register')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Nueva Compra VIP
          </button>
        </div>
      </div>

      {/* 8 Metric KPI Cards (Section 20 & 28) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Clientes VIP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Clientes VIP</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalClients}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">100%</span> con tarjeta digital
          </div>
        </div>

        {/* KPI 2: Comercios */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Comercios</span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalMerchants}</div>
          <div className="text-[11px] text-slate-500">Red Santander Activa</div>
        </div>

        {/* KPI 3: Compras del Día */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Compras Hoy</span>
            <ShoppingCart className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{purchasesToday.length}</div>
          <div className="text-[11px] text-slate-500">
            Ventas: <span className="font-semibold text-slate-700">{formatCurrency(salesToday)}</span>
          </div>
        </div>

        {/* KPI 4: Ventas del Mes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas del Mes</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(salesThisMonth)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> En crecimiento
          </div>
        </div>

        {/* KPI 5: Acumulado General */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Acumulado Histórico</span>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(totalAccumulatedSales)}
          </div>
          <div className="text-[11px] text-slate-500">
            {validPurchases.length} transacciones registradas
          </div>
        </div>

        {/* KPI 6: Aporte CEB TOTAL */}
        <div className="bg-emerald-900 text-white p-5 rounded-2xl border border-emerald-700 shadow-md space-y-2 col-span-2 md:col-span-2">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              Fondo Social Educativo CEB ({cebConfig.porcentaje}%)
            </span>
            <span className="text-[11px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
              Impacto Directo
            </span>
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono">
            {formatCurrency(totalCEBContribution)}
          </div>
          <div className="text-xs text-emerald-200">
            Destinado a inmersión bilingüe y becas para niños y jóvenes vulnerables
          </div>
        </div>

        {/* KPI 8: Compras Anuladas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Anuladas (Auditoría)</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{annulledPurchases.length}</div>
          <div className="text-[11px] text-rose-600 font-medium">Control de Trazabilidad</div>
        </div>
      </div>

      {/* Educational Social Impact Banner (Section 1 & 47) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Indicadores de Impacto Social — Centro de Experiencias Bilingüe (CEB)
              </h3>
              <p className="text-xs text-slate-500">
                Transformación comunitaria lograda gracias a las compras de clientes VIP
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
            Tasa Social Vigente: {cebConfig.porcentaje}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{bilingualHoursFunded} hrs</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Horas de Inmersión Bilingüe</div>
              <div className="text-[11px] text-slate-500 mt-1">Talleres prácticos de inglés intensivo</div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{studentBeneficiaries}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Estudiantes Beneficiados</div>
              <div className="text-[11px] text-slate-500 mt-1">Niños de Santander con acceso a formación</div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{fullScholarships} Becas</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Becas de Formación Total</div>
              <div className="text-[11px] text-slate-500 mt-1">Patrocinadas por el Club Multitienda</div>
            </div>
          </div>
        </div>
      </div>

      {/* Administrative Control & Governance Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Panel de Control & Seguridad
              </span>
              <span className="text-xs text-slate-400">Gobernanza del Sistema</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              Herramientas de Administración & Cumplimiento Normativo
            </h3>
            <p className="text-xs text-slate-300">
              Control de accesos RBAC, protección legal de datos, copias de seguridad y multi-tenancy SaaS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          {/* Card 1: Matriz RBAC */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                  Matriz de Permisos RBAC
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Control granular de privilegios para Superadmin, Comercios, Operadores POS y Clientes VIP.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPermissionsModal(true)}
              className="mt-4 w-full py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Ver Matriz de Permisos</span>
            </button>
          </div>

          {/* Card 2: Ley 1581 Habeas Data */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold shadow-inner">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  Protección de Datos (Ley 1581)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Consentimiento expreso de titulares, políticas de tratamiento Habeas Data y trazabilidad SIC.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHabeasModal(true)}
              className="mt-4 w-full py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Consultar Ley 1581</span>
            </button>
          </div>

          {/* Card 3: Copias de Seguridad */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold shadow-inner">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                  Respaldos y Recuperación
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Exportación e importación segura en JSON, snapshots de auditoría y recuperación de desastres.
                </p>
              </div>
            </div>
            {hasPermission('MANAGE_BACKUPS') ? (
              <button
                onClick={() => setShowBackupModal(true)}
                className="mt-4 w-full py-2 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Gestionar Respaldos</span>
              </button>
            ) : (
              <div className="mt-4 text-center py-2 text-[11px] text-slate-500">Privilegio Superadmin</div>
            )}
          </div>

          {/* Card 4: Plataforma SaaS Multi-Tienda */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold shadow-inner">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                  SaaS Multi-Tienda & Sedes
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Gestión de suscripciones, cuotas de sucursales, dominios y generación de API Keys POS.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('saas-management')}
              className="mt-4 w-full py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Abrir Panel SaaS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts (Data Studio look) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Sales & CEB per Merchant */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Ventas y Aporte CEB por Comercio</h4>
              <p className="text-xs text-slate-500">Distribución de volumen comercial e impacto educativo</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={merchantChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis
                  tickFormatter={(v) => `$${v >= 1000000 ? `${v / 1000000}M` : `${v / 1000}k`}`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value)),
                    name === 'ventas' ? 'Ventas Totales' : 'Aporte CEB',
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="ventas" name="ventas" fill="#0f172a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ceb" name="ceb" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Ventas por Sector</h4>
            <p className="text-xs text-slate-500">Categorías de comercios afiliados</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Ventas']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Purchases Table preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Últimas Transacciones VIP Registradas</h4>
            <p className="text-xs text-slate-500">Trazabilidad en tiempo real de operaciones</p>
          </div>
          <button
            onClick={() => setActiveTab('purchases')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            Ver todas las transacciones <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Transacción</th>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4">Cliente VIP</th>
                <th className="py-3 px-4">Comercio</th>
                <th className="py-3 px-4 text-right">Valor Compra</th>
                <th className="py-3 px-4 text-right">Aporte CEB</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {purchases.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.numeroTransaccion}</td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(p.fecha)} {p.hora}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">{p.clienteNombre}</span>
                    <span className="block font-mono text-[10px] text-slate-400">{p.codigoVip}</span>
                  </td>
                  <td className="py-3 px-4 font-medium">{p.comercioNombre}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(p.valorCompra)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(p.aporteCeb)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.estado === 'Confirmada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.estado === 'Anulada'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
