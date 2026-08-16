import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Shield,
  Building2,
  Award,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Phone,
  CreditCard,
  MapPin,
  FileCheck,
  Eye,
  EyeOff,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  initialMode?: 'login' | 'register-client' | 'register-merchant' | 'recovery';
  onClose?: () => void;
  isStandalone?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onClose,
  isStandalone = false,
}) => {
  const {
    login,
    registerClientAuth,
    registerMerchantRequest,
    requestPasswordRecovery,
    resetPasswordWithOtp,
    users,
    merchants,
    switchUser,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register-client' | 'register-merchant' | 'recovery' | 'reset-pin'>(
    initialMode
  );

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Client state
  const [clientForm, setClientForm] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    pin: '',
    aceptaHabeasData: true,
  });

  // Register Merchant state
  const [merchantForm, setMerchantForm] = useState({
    nombre: '',
    razonSocial: '',
    nit: '',
    categoria: 'Supermercados & Víveres',
    direccion: '',
    ciudad: 'Bucaramanga',
    telefono: '',
    email: '',
    responsable: '',
  });

  // Recovery state
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Switch Preset Users
  const demoUsers: { role: UserRole; label: string; email: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'SUPERADMIN',
      label: 'Superadministrador',
      email: 'admin@clubmultitienda.com.co',
      desc: 'Control global, comercios, auditoría y CEB',
      icon: Shield,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    },
    {
      role: 'ADMIN_COMERCIO',
      label: 'Gerente Comercio',
      email: 'gerencia@almerkar.com.co',
      desc: 'Métricas de tienda, caja y operadores',
      icon: Building2,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    },
    {
      role: 'OPERADOR_COMERCIO',
      label: 'Cajero / Operador',
      email: 'caja1@almerkar.com.co',
      desc: 'Registro ágil POS (10-15s) y turno de caja',
      icon: Zap,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    },
    {
      role: 'CLIENTE_VIP',
      label: 'Cliente VIP Titular',
      email: 'valeria.gomez@gmail.com',
      desc: 'Tarjeta QR, saldo, impacto CEB y compras',
      icon: Award,
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!loginIdentifier.trim()) {
      setFeedback({ type: 'error', message: 'Por favor ingresa tu correo, cédula o código VIP.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(loginIdentifier, loginPassword);
      setIsSubmitting(false);

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        if (onClose) setTimeout(onClose, 600);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }, 300);
  };

  const handleRegisterClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!clientForm.nombre.trim() || !clientForm.documento.trim() || !clientForm.telefono.trim() || !clientForm.email.trim()) {
      setFeedback({ type: 'error', message: 'Todos los campos obligatorios deben ser completados.' });
      return;
    }

    if (!clientForm.aceptaHabeasData) {
      setFeedback({ type: 'error', message: 'Debes aceptar la autorización de tratamiento de datos personales (Ley 1581).' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerClientAuth(clientForm);
      setIsSubmitting(false);

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        if (onClose) setTimeout(onClose, 1000);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }, 400);
  };

  const handleRegisterMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!merchantForm.nombre.trim() || !merchantForm.nit.trim() || !merchantForm.email.trim() || !merchantForm.responsable.trim()) {
      setFeedback({ type: 'error', message: 'Completa los campos principales del comercio y responsable.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerMerchantRequest(merchantForm);
      setIsSubmitting(false);

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setMode('login');
          setFeedback({ type: 'success', message: 'Comercio registrado. Inicia sesión con el correo registrado.' });
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }, 400);
  };

  const handleRecoveryRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!recoveryIdentifier.trim()) {
      setFeedback({ type: 'error', message: 'Ingresa tu correo, cédula o código VIP registrado.' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = requestPasswordRecovery(recoveryIdentifier);
      setIsSubmitting(false);

      if (res.success) {
        setGeneratedOtp(res.otpCode || '123456');
        setMode('reset-pin');
        setFeedback({
          type: 'success',
          message: `${res.message} Para fines de prueba y demostración, tu código OTP generado es: ${res.otpCode}`,
        });
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }, 400);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    setIsSubmitting(true);
    setTimeout(() => {
      const res = resetPasswordWithOtp(recoveryIdentifier, recoveryOtp, newPassword);
      setIsSubmitting(false);

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setMode('login');
          setLoginIdentifier(recoveryIdentifier);
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }, 400);
  };

  const handleQuickLogin = (email: string) => {
    setLoginIdentifier(email);
    setLoginPassword('demo123');
    const res = login(email);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (onClose) setTimeout(onClose, 500);
    }
  };

  return (
    <div className={isStandalone ? 'w-full max-w-2xl mx-auto' : 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in'}>
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6">
        {/* Header with Brand Gradient */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 text-white relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              VIP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wide">CLUB MULTITIENDA</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Acceso Seguro
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sistema de Registro de Compras VIP y Aportes a la Educación CEB
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-2 mt-6 p-1 bg-slate-800/80 rounded-2xl border border-slate-700">
            <button
              onClick={() => {
                setMode('login');
                setFeedback(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setMode('register-client');
                setFeedback(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                mode === 'register-client'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Registrar Cliente VIP
            </button>
            <button
              onClick={() => {
                setMode('register-merchant');
                setFeedback(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                mode === 'register-merchant'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Afiliar Comercio
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 mx-6 mt-4 rounded-2xl text-xs font-semibold flex items-start gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{feedback.message}</div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <div className="space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico, Cédula o Código VIP
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="ej: admin@clubmultitienda.com.co ó VIP-7626 ó 1098745210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">Contraseña o PIN de Seguridad</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('recovery');
                        setRecoveryIdentifier(loginIdentifier);
                        setFeedback(null);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="•••••••• (Cualquiera para cuentas demo)"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verificando Credenciales...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" /> Entrar al Sistema
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Fast Demo Logins for All 4 Roles */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Acceso Rápido Demo (1-Clic por Rol de Usuario):
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {demoUsers.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.email}
                        type="button"
                        onClick={() => handleQuickLogin(item.email)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${item.color}`}
                      >
                        <div className="p-2 bg-white rounded-xl shadow-xs shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs leading-snug">{item.label}</div>
                          <div className="text-[10px] opacity-80 truncate">{item.email}</div>
                          <div className="text-[10px] opacity-70 mt-0.5 leading-tight">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODE: REGISTER CLIENT VIP */}
          {mode === 'register-client' && (
            <form onSubmit={handleRegisterClientSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4 text-amber-600" /> Registro Inmediato de Cliente VIP
                </div>
                Al registrarte, el sistema generará automáticamente tu <strong>Código VIP único</strong>, tu <strong>Tarjeta Virtual con QR</strong> y comenzarás a acumular compras y apoyar becas CEB.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombres y Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.nombre}
                    onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                    placeholder="ej: Carolina Suárez Rueda"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cédula de Ciudadanía / Documento *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.documento}
                    onChange={(e) => setClientForm({ ...clientForm, documento: e.target.value })}
                    placeholder="ej: 1.098.632.410"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Celular *</label>
                  <input
                    type="tel"
                    required
                    value={clientForm.telefono}
                    onChange={(e) => setClientForm({ ...clientForm, telefono: e.target.value })}
                    placeholder="ej: +57 318 456 7890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="ej: carolina.suarez@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN de Seguridad (4 dígitos opcional)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={clientForm.pin}
                  onChange={(e) => setClientForm({ ...clientForm, pin: e.target.value })}
                  placeholder="ej: 1234"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Habeas Data Checkbox */}
              <label className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clientForm.aceptaHabeasData}
                  onChange={(e) => setClientForm({ ...clientForm, aceptaHabeasData: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="text-[11px] text-slate-700 leading-snug">
                  Autorizo el tratamiento de mis datos personales conforme a la <strong>Ley 1581 de 2012 (Habeas Data)</strong> para la emisión de mi membresía VIP, registro de compras y reporte de aportes educativos al Centro de Experiencias Bilingüe (CEB).
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Creando Membresía VIP...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" /> Crear Mi Cuenta VIP Inmediata
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: REGISTER MERCHANT */}
          {mode === 'register-merchant' && (
            <form onSubmit={handleRegisterMerchantSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Building2 className="w-4 h-4 text-blue-600" /> Afiliación de Comercio a la Red Multitienda
                </div>
                Registra tu establecimiento comercial para conceder beneficios VIP, fidelizar clientes y vincular tu marca a la responsabilidad social con el Centro de Experiencias Bilingüe (CEB).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Comercial de la Tienda *</label>
                  <input
                    type="text"
                    required
                    value={merchantForm.nombre}
                    onChange={(e) => setMerchantForm({ ...merchantForm, nombre: e.target.value })}
                    placeholder="ej: Farmacias Vida Sana VIP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={merchantForm.razonSocial}
                    onChange={(e) => setMerchantForm({ ...merchantForm, razonSocial: e.target.value })}
                    placeholder="ej: Drogas y Alimentos de Colombia S.A.S."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIT *</label>
                  <input
                    type="text"
                    required
                    value={merchantForm.nit}
                    onChange={(e) => setMerchantForm({ ...merchantForm, nit: e.target.value })}
                    placeholder="ej: 901.882.341-9"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría Comercial *</label>
                  <select
                    value={merchantForm.categoria}
                    onChange={(e) => setMerchantForm({ ...merchantForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  >
                    <option value="Supermercados & Víveres">Supermercados & Víveres</option>
                    <option value="Salud & Farmacia">Salud & Farmacia</option>
                    <option value="Moda, Calzado y Cuero">Moda, Calzado y Cuero</option>
                    <option value="Gastronomía & Restaurantes">Gastronomía & Restaurantes</option>
                    <option value="Tecnología & Electrodomésticos">Tecnología & Electrodomésticos</option>
                    <option value="Hogar & Construcción">Hogar & Construcción</option>
                    <option value="Servicios Profesionales">Servicios Profesionales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    required
                    value={merchantForm.ciudad}
                    onChange={(e) => setMerchantForm({ ...merchantForm, ciudad: e.target.value })}
                    placeholder="ej: Bucaramanga / Floridablanca"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dirección Sede Principal</label>
                  <input
                    type="text"
                    value={merchantForm.direccion}
                    onChange={(e) => setMerchantForm({ ...merchantForm, direccion: e.target.value })}
                    placeholder="ej: Carrera 33 # 48-20, Cabecera"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    required
                    value={merchantForm.telefono}
                    onChange={(e) => setMerchantForm({ ...merchantForm, telefono: e.target.value })}
                    placeholder="ej: (607) 645-1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Institucional *</label>
                  <input
                    type="email"
                    required
                    value={merchantForm.email}
                    onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })}
                    placeholder="ej: administracion@vidasanavip.co"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Gerente / Responsable *</label>
                <input
                  type="text"
                  required
                  value={merchantForm.responsable}
                  onChange={(e) => setMerchantForm({ ...merchantForm, responsable: e.target.value })}
                  placeholder="ej: Dr. Fernando Delgado Rincón"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Procesando Afiliación...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" /> Enviar Solicitud de Afiliación Comercial
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: RECOVERY STEP 1 */}
          {mode === 'recovery' && (
            <form onSubmit={handleRecoveryRequest} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-4 h-4 text-amber-600" /> Recuperación de Contraseña o PIN
                </div>
                Ingresa tu correo electrónico registrado, número de documento o código VIP. Te enviaremos un código OTP seguro para restablecer tu acceso.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico, Cédula o Código VIP *</label>
                <input
                  type="text"
                  required
                  value={recoveryIdentifier}
                  onChange={(e) => setRecoveryIdentifier(e.target.value)}
                  placeholder="ej: gerencia@almerkar.com.co ó 1098745210"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Volver al Login
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Generar Código de Recuperación'}
                </button>
              </div>
            </form>
          )}

          {/* MODE: RESET PASSWORD STEP 2 */}
          {mode === 'reset-pin' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ingresa el Código OTP y Tu Nueva Clave
                </div>
                {generatedOtp && (
                  <p className="mt-1">
                    Código de verificación temporal emitido: <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">{generatedOtp}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código de Verificación OTP (6 dígitos) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={recoveryOtp}
                  onChange={(e) => setRecoveryOtp(e.target.value)}
                  placeholder="ej: 123456"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-widest text-center text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nueva Contraseña o PIN de Seguridad *</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres o dígitos"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Guardar Nueva Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
