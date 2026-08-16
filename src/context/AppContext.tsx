import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  ClientVIP,
  CardVIP,
  Merchant,
  Purchase,
  CEBConfig,
  AuditLog,
  UserRole,
  SystemPermission,
  ROLE_DEFINITIONS,
  Branch,
  SaaSPlan,
  SaaSPlanTier,
  SaaSSubscription,
  SaaSApiKey,
  PaymentMethod,
  PaymentDetails,
  CEBSettlementRecord,
} from '../types';
import {
  INITIAL_CEB_CONFIG,
  INITIAL_MERCHANTS,
  INITIAL_CLIENTS,
  INITIAL_CARDS,
  INITIAL_USERS,
  INITIAL_PURCHASES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SAAS_PLANS,
  INITIAL_BRANCHES,
  INITIAL_SAAS_SUBSCRIPTIONS,
  INITIAL_API_KEYS,
  INITIAL_SETTLEMENTS,
} from '../data/initialData';
import {
  generateTransactionNumber,
  generateVIPCode,
  playSuccessSound,
  computeTaxDeductionBreakdown,
  generateAuthorizationCode,
  generateDianHash,
} from '../utils/formatters';

interface AppContextType {
  // State
  currentUser: User;
  users: User[];
  clients: ClientVIP[];
  cards: CardVIP[];
  merchants: Merchant[];
  purchases: Purchase[];
  cebConfig: CEBConfig;
  auditLogs: AuditLog[];
  settlements: CEBSettlementRecord[];
  
  // SaaS Multi-tenant State
  saasPlans: SaaSPlan[];
  branches: Branch[];
  saasSubscriptions: SaaSSubscription[];
  apiKeys: SaaSApiKey[];
  selectedTenantId: string; // 'ALL' for global or specific merchant ID
  setSelectedTenantId: (tenantId: string) => void;
  activeTenantMerchant?: Merchant;

  // Authentication & Session
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  registerClientAuth: (data: {
    nombre: string;
    documento: string;
    telefono: string;
    email: string;
    pin?: string;
  }) => { success: boolean; message: string; client?: ClientVIP; user?: User };
  registerMerchantRequest: (data: {
    nombre: string;
    razonSocial: string;
    nit: string;
    categoria: string;
    direccion: string;
    ciudad: string;
    telefono: string;
    email: string;
    responsable: string;
    planId?: SaaSPlanTier;
  }) => { success: boolean; message: string };
  requestPasswordRecovery: (identifier: string) => { success: boolean; message: string; otpCode?: string };
  resetPasswordWithOtp: (identifier: string, otp: string, newPassword: string) => { success: boolean; message: string };

  // Modals & Popups
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showPermissionsModal: boolean;
  setShowPermissionsModal: (show: boolean) => void;
  showHabeasModal: boolean;
  setShowHabeasModal: (show: boolean) => void;
  showBackupModal: boolean;
  setShowBackupModal: (show: boolean) => void;
  showSettlementModal: boolean;
  setShowSettlementModal: (show: boolean) => void;
  showApiDocsModal: boolean;
  setShowApiDocsModal: (show: boolean) => void;
  showCardModal: boolean;
  setShowCardModal: (show: boolean) => void;
  selectedCardClient: ClientVIP | null;
  setSelectedCardClient: (client: ClientVIP | null) => void;

  // RBAC Permission Helper
  hasPermission: (permission: SystemPermission) => boolean;

  // Quick View / active navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Role & Session
  switchUser: (userId: string) => void;
  
  // Actions
  registerPurchase: (params: {
    codigoVip: string;
    valorCompra: number;
    observacion?: string;
    overrideMerchantId?: string;
    metodoPago?: PaymentMethod;
    detallesPago?: PaymentDetails;
  }) => { success: boolean; message: string; purchase?: Purchase };

  liquidateMerchantCEB: (
    comercioId: string,
    metodo: 'PSE_BANCOLOMBIA' | 'TRANSFERENCIA_ACH' | 'PASARELA_WOMPI'
  ) => { success: boolean; message: string; settlement?: CEBSettlementRecord };
  
  annulPurchase: (purchaseId: string, motivo: string) => { success: boolean; message: string };
  
  createClient: (clientData: Omit<ClientVIP, 'id' | 'acumuladoTotal' | 'totalCompras' | 'totalAporteCEB' | 'updatedAt' | 'tarjetaActivaId'>) => {
    success: boolean;
    message: string;
    client?: ClientVIP;
  };
  
  updateClient: (id: string, updates: Partial<ClientVIP>) => { success: boolean; message: string };
  
  replaceCard: (clienteId: string, nuevoMotivo: string) => { success: boolean; message: string; card?: CardVIP };
  
  createMerchant: (merchantData: Omit<Merchant, 'id' | 'fechaRegistro'>) => { success: boolean; message: string };
  
  updateMerchant: (id: string, updates: Partial<Merchant>) => { success: boolean; message: string };
  
  updateCEBConfig: (nuevoPorcentaje: number, nota?: string) => { success: boolean; message: string };
  
  addAuditLog: (log: Omit<AuditLog, 'id' | 'fecha' | 'hora' | 'ip' | 'dispositivo'>) => void;
  
  // SaaS Multi-tenant Actions
  createBranch: (data: Omit<Branch, 'id'>) => { success: boolean; message: string; branch?: Branch };
  updateBranch: (id: string, updates: Partial<Branch>) => { success: boolean; message: string };
  deleteBranch: (id: string) => { success: boolean; message: string };
  changeMerchantSaaSPlan: (comercioId: string, planId: SaaSPlanTier, ciclo: 'MENSUAL' | 'ANUAL') => { success: boolean; message: string };
  generateApiKey: (comercioId: string, nombre: string, permisos: ('READ_CLIENT' | 'WRITE_PURCHASE' | 'WEBHOOK_NOTIFY')[]) => { success: boolean; message: string; key?: SaaSApiKey };
  revokeApiKey: (keyId: string) => { success: boolean; message: string };

  // Backup & Storage
  resetToDefaults: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonData: string) => { success: boolean; message: string };

  // Quick lookup helper
  getClientByVIPOrDoc: (query: string) => ClientVIP | undefined;
  getMerchantById: (id: string) => Merchant | undefined;
  getMerchantBranches: (merchantId: string) => Branch[];
  getMerchantSubscription: (merchantId: string) => SaaSSubscription | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLIENTS: 'cm_vip_clients_v1',
  CARDS: 'cm_vip_cards_v1',
  MERCHANTS: 'cm_vip_merchants_v1',
  USERS: 'cm_vip_users_v1',
  PURCHASES: 'cm_vip_purchases_v1',
  CEB_CONFIG: 'cm_vip_ceb_config_v1',
  AUDIT_LOGS: 'cm_vip_audit_logs_v1',
  SETTLEMENTS: 'cm_vip_settlements_v1',
  CURRENT_USER_ID: 'cm_vip_current_user_id_v1',
  IS_AUTHENTICATED: 'cm_vip_is_authenticated_v1',
  BRANCHES: 'cm_vip_branches_v1',
  SAAS_SUBSCRIPTIONS: 'cm_vip_saas_subs_v1',
  API_KEYS: 'cm_vip_api_keys_v1',
  SELECTED_TENANT_ID: 'cm_vip_selected_tenant_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or fallback to initial data
  const [clients, setClients] = useState<ClientVIP[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [cards, setCards] = useState<CardVIP[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
    return saved ? JSON.parse(saved) : INITIAL_MERCHANTS;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [saasPlans] = useState<SaaSPlan[]>(INITIAL_SAAS_PLANS);

  const [saasSubscriptions, setSaasSubscriptions] = useState<SaaSSubscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAAS_SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : INITIAL_SAAS_SUBSCRIPTIONS;
  });

  const [apiKeys, setApiKeys] = useState<SaaSApiKey[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    return saved ? JSON.parse(saved) : INITIAL_API_KEYS;
  });

  const [selectedTenantId, setSelectedTenantId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_TENANT_ID);
    return saved || 'ALL';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [settlements, setSettlements] = useState<CEBSettlementRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
  });

  const [cebConfig, setCebConfig] = useState<CEBConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CEB_CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_CEB_CONFIG;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'USR-001'; // Default to Superadmin
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [showHabeasModal, setShowHabeasModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [showSettlementModal, setShowSettlementModal] = useState<boolean>(false);
  const [showApiDocsModal, setShowApiDocsModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [selectedCardClient, setSelectedCardClient] = useState<ClientVIP | null>(null);

  const [activeTab, setActiveTab] = useState<string>('home');

  // Active User object
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Active Tenant Merchant (if filtered by a specific tenant)
  const activeTenantMerchant = selectedTenantId !== 'ALL' ? merchants.find((m) => m.id === selectedTenantId) : undefined;

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAAS_SUBSCRIPTIONS, JSON.stringify(saasSubscriptions));
  }, [saasSubscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_TENANT_ID, selectedTenantId);
  }, [selectedTenantId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CEB_CONFIG, JSON.stringify(cebConfig));
  }, [cebConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  // Permission Check
  const hasPermission = (permission: SystemPermission): boolean => {
    const roleDef = ROLE_DEFINITIONS[currentUser.rol];
    if (!roleDef) return false;
    return roleDef.permissions.includes(permission);
  };

  // Lookup helper
  const getClientByVIPOrDoc = (query: string): ClientVIP | undefined => {
    if (!query) return undefined;
    const cleanQuery = query.trim().toUpperCase().replace(/[^a-zA-Z0-9-]/g, '');
    const cleanRaw = query.trim().toLowerCase();
    
    return clients.find((c) => {
      const vipClean = c.codigoVip.toUpperCase().replace(/[^a-zA-Z0-9-]/g, '');
      const docClean = c.documento.replace(/[^0-9]/g, '');
      const searchDoc = query.replace(/[^0-9]/g, '');
      
      return (
        vipClean === cleanQuery ||
        c.codigoVip.toLowerCase() === cleanRaw ||
        (searchDoc.length >= 5 && docClean === searchDoc) ||
        c.documento.toLowerCase() === cleanRaw ||
        c.email.toLowerCase() === cleanRaw
      );
    });
  };

  const getMerchantById = (id: string): Merchant | undefined => {
    return merchants.find((m) => m.id === id);
  };

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'fecha' | 'hora' | 'ip' | 'dispositivo'>) => {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0];
    
    const newLog: AuditLog = {
      id: `AUD-${String(auditLogs.length + 1).padStart(4, '0')}`,
      fecha,
      hora,
      ip: '190.158.' + Math.floor(Math.random() * 200) + '.' + Math.floor(Math.random() * 250),
      dispositivo: navigator.userAgent.includes('Mobile') ? 'Terminal Móvil POS' : 'Terminal Web Escritorio',
      ...logData,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      setIsAuthenticated(true);
      setActiveTab('dashboard');

      addAuditLog({
        usuarioId: target.id,
        usuarioNombre: target.nombre,
        usuarioEmail: target.email,
        rol: target.rol,
        accion: 'INICIO_SESION',
        modulo: 'SEGURIDAD',
        detalle: `Cambio de sesión a usuario ${target.nombre} con rol ${target.rol}.`,
        resultado: 'EXITOSO',
      });
    }
  };

  // Auth: Login
  const login = (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Find matching user by email, or associated client VIP/Doc
    let matchedUser = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.id.toLowerCase() === cleanId
    );

    if (!matchedUser) {
      // Check if identifier matches a client's VIP code or Document
      const matchedClient = getClientByVIPOrDoc(identifier);
      if (matchedClient) {
        matchedUser = users.find((u) => u.clienteId === matchedClient.id);
        if (!matchedUser) {
          // Auto create user for existing client if not present
          const newUser: User = {
            id: `USR-CLI-${matchedClient.id}`,
            nombre: matchedClient.nombre,
            email: matchedClient.email,
            rol: 'CLIENTE_VIP',
            clienteId: matchedClient.id,
            estado: 'Activo',
            fechaRegistro: matchedClient.fechaRegistro,
            ultimoAcceso: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
          setUsers((prev) => [...prev, newUser]);
          matchedUser = newUser;
        }
      }
    }

    if (!matchedUser) {
      return {
        success: false,
        message: `No se encontró ningún usuario con el correo, cédula o código VIP "${identifier}".`,
      };
    }

    if (matchedUser.estado === 'Inactivo') {
      return {
        success: false,
        message: 'Esta cuenta de usuario se encuentra inactiva. Contacte al administrador.',
      };
    }

    setCurrentUserId(matchedUser.id);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setActiveTab('dashboard');

    // Update last access
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setUsers((prev) =>
      prev.map((u) => (u.id === matchedUser!.id ? { ...u, ultimoAcceso: nowStr } : u))
    );

    addAuditLog({
      usuarioId: matchedUser.id,
      usuarioNombre: matchedUser.nombre,
      usuarioEmail: matchedUser.email,
      rol: matchedUser.rol,
      accion: 'INICIO_SESION',
      modulo: 'SEGURIDAD',
      detalle: `Inicio de sesión exitoso como ${matchedUser.nombre} (${matchedUser.rol}).`,
      resultado: 'EXITOSO',
    });

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch {}

    return {
      success: true,
      message: `¡Bienvenido de nuevo, ${matchedUser.nombre}!`,
      user: matchedUser,
    };
  };

  // Auth: Logout
  const logout = () => {
    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'CIERRE_SESION',
      modulo: 'SEGURIDAD',
      detalle: `Cierre de sesión de ${currentUser.nombre} (${currentUser.rol}).`,
      resultado: 'EXITOSO',
    });

    setIsAuthenticated(false);
    setActiveTab('home');
    setShowAuthModal(false);
  };

  // Auth: Register VIP Client & User
  const registerClientAuth = (data: {
    nombre: string;
    documento: string;
    telefono: string;
    email: string;
    pin?: string;
  }) => {
    // Check duplicates
    const cleanDoc = data.documento.replace(/[^0-9]/g, '');
    const cleanEmail = data.email.trim().toLowerCase();

    const existingClient = clients.find(
      (c) => c.documento.replace(/[^0-9]/g, '') === cleanDoc || c.email.toLowerCase() === cleanEmail
    );

    if (existingClient) {
      return {
        success: false,
        message: `Ya existe un cliente registrado con el documento ${data.documento} o email ${data.email}.`,
      };
    }

    const newVipCode = generateVIPCode(clients.map((c) => c.codigoVip));
    const newClientId = `CLI-${String(clients.length + 1).padStart(3, '0')}`;
    const newCardId = `CRD-${newVipCode}-01`;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const expiry = new Date(now.setFullYear(now.getFullYear() + 3)).toISOString().split('T')[0];

    const newClient: ClientVIP = {
      id: newClientId,
      codigoVip: newVipCode,
      nombre: data.nombre.trim(),
      documento: data.documento.trim(),
      telefono: data.telefono.trim(),
      email: data.email.trim(),
      estado: 'Activo',
      fechaRegistro: today,
      updatedAt: today,
      tarjetaActivaId: newCardId,
      acumuladoTotal: 0,
      totalCompras: 0,
      totalAporteCEB: 0,
      aceptaHabeasData: true,
    };

    const newCard: CardVIP = {
      id: newCardId,
      codigoTarjeta: newCardId,
      codigoVip: newVipCode,
      clienteId: newClientId,
      estado: 'Activa',
      fechaEmision: today,
      fechaActivacion: today,
      fechaVencimiento: expiry,
    };

    const newUserId = `USR-CLI-${newClientId}`;
    const newUser: User = {
      id: newUserId,
      nombre: data.nombre.trim(),
      email: data.email.trim(),
      rol: 'CLIENTE_VIP',
      clienteId: newClientId,
      pin: data.pin || '1234',
      estado: 'Activo',
      fechaRegistro: today,
      ultimoAcceso: today + ' ' + new Date().toTimeString().split(' ')[0],
    };

    setClients((prev) => [newClient, ...prev]);
    setCards((prev) => [newCard, ...prev]);
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUserId);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setActiveTab('dashboard');

    addAuditLog({
      usuarioId: newUserId,
      usuarioNombre: data.nombre,
      usuarioEmail: data.email,
      rol: 'CLIENTE_VIP',
      accion: 'REGISTRO_CLIENTE',
      modulo: 'CLIENTES',
      registroId: newClientId,
      detalle: `Auto-registro de nuevo Cliente VIP ${data.nombre} con código ${newVipCode} y tarjeta activa.`,
      resultado: 'EXITOSO',
    });

    try {
      playSuccessSound();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } catch {}

    return {
      success: true,
      message: `¡Registro exitoso! Tu código VIP oficial es ${newVipCode}.`,
      client: newClient,
      user: newUser,
    };
  };

  // Auth: Request Merchant Affiliation
  const registerMerchantRequest = (data: {
    nombre: string;
    razonSocial: string;
    nit: string;
    categoria: string;
    direccion: string;
    ciudad: string;
    telefono: string;
    email: string;
    responsable: string;
    planId?: SaaSPlanTier;
  }) => {
    const existing = merchants.find((m) => m.nit.replace(/[^0-9]/g, '') === data.nit.replace(/[^0-9]/g, ''));
    if (existing) {
      return { success: false, message: `Ya existe un comercio registrado con el NIT ${data.nit}.` };
    }

    const newMerchantId = `COM-${String(merchants.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const planTier: SaaSPlanTier = data.planId || 'STARTER';
    const slug = data.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || `tenant-${merchants.length + 1}`;

    const gradients = [
      'from-emerald-600 to-teal-700',
      'from-blue-600 to-indigo-700',
      'from-amber-600 to-orange-700',
      'from-rose-600 to-red-700',
      'from-violet-600 to-purple-700',
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const newMerchant: Merchant = {
      id: newMerchantId,
      tenantSlug: slug,
      nombre: data.nombre.trim(),
      razonSocial: data.razonSocial.trim(),
      nit: data.nit.trim(),
      categoria: data.categoria.trim(),
      direccion: data.direccion.trim(),
      ciudad: data.ciudad.trim(),
      telefono: data.telefono.trim(),
      email: data.email.trim(),
      responsable: data.responsable.trim(),
      estado: 'Activo',
      fechaRegistro: today,
      logoColor: randomGradient,
      planId: planTier,
      subdominio: `${slug}.clubmultitienda.com.co`,
      totalSucursales: 1,
      totalCajasPos: 2,
    };

    // Create Initial Headquarter Branch
    const newBranch: Branch = {
      id: `BRN-${String(branches.length + 1).padStart(3, '0')}`,
      comercioId: newMerchantId,
      nombre: `Sede Principal - ${data.ciudad}`,
      direccion: data.direccion.trim(),
      ciudad: data.ciudad.trim(),
      telefono: data.telefono.trim(),
      cajasActivas: 2,
      esPrincipal: true,
      estado: 'Activa',
    };

    // Create SaaS Subscription
    const planDef = saasPlans.find((p) => p.id === planTier) || saasPlans[0];
    const newSubscription: SaaSSubscription = {
      id: `SUB-${String(saasSubscriptions.length + 1).padStart(3, '0')}`,
      comercioId: newMerchantId,
      planId: planTier,
      estado: 'ACTIVA',
      cicloFacturacion: 'MENSUAL',
      fechaInicio: today,
      fechaRenovacion: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      precioFacturadoCop: planDef.precioMensualCop,
      metodoPago: 'TARJETA_CREDITO',
      limiteSucursales: planDef.maxSucursales === -1 ? 999 : planDef.maxSucursales,
      sucursalesUsadas: 1,
    };

    // Create API Key
    const newApiKey: SaaSApiKey = {
      id: `KEY-${String(apiKeys.length + 1).padStart(3, '0')}`,
      comercioId: newMerchantId,
      nombre: `API Key POS ${data.nombre}`,
      apiKey: `cm_live_sk_${slug}_${Math.random().toString(36).substring(2, 12)}`,
      permisos: ['READ_CLIENT', 'WRITE_PURCHASE'],
      fechaCreacion: today,
      estado: 'Activa',
    };

    // Also create manager user
    const managerId = `USR-ADM-${newMerchantId}`;
    const managerUser: User = {
      id: managerId,
      nombre: data.responsable.trim(),
      email: data.email.trim(),
      rol: 'ADMIN_COMERCIO',
      comercioId: newMerchantId,
      estado: 'Activo',
      fechaRegistro: today,
      ultimoAcceso: today + ' ' + new Date().toTimeString().split(' ')[0],
    };

    setMerchants((prev) => [...prev, newMerchant]);
    setBranches((prev) => [...prev, newBranch]);
    setSaasSubscriptions((prev) => [...prev, newSubscription]);
    setApiKeys((prev) => [...prev, newApiKey]);
    setUsers((prev) => [...prev, managerUser]);

    addAuditLog({
      usuarioId: managerId,
      usuarioNombre: data.responsable,
      usuarioEmail: data.email,
      rol: 'ADMIN_COMERCIO',
      accion: 'REGISTRO_COMERCIO',
      modulo: 'COMERCIOS',
      registroId: newMerchantId,
      detalle: `Afiliación SaaS de nuevo comercio: ${newMerchant.nombre} (NIT: ${newMerchant.nit}) con Plan ${planTier} y sede inicial ${newBranch.nombre}.`,
      resultado: 'EXITOSO',
    });

    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}

    return {
      success: true,
      message: `Comercio "${data.nombre}" registrado y activado con éxito en la plataforma SaaS. Se ha creado el usuario administrador.`,
    };
  };

  // Auth: Password / PIN Recovery
  const requestPasswordRecovery = (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const targetUser = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.nombre.toLowerCase().includes(cleanId)
    );

    const targetClient = getClientByVIPOrDoc(identifier);

    if (!targetUser && !targetClient) {
      return {
        success: false,
        message: `No se encontró ninguna cuenta asociada a "${identifier}".`,
      };
    }

    const email = targetUser?.email || targetClient?.email || 'contacto@clubmultitienda.com.co';
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));

    addAuditLog({
      usuarioId: targetUser?.id || targetClient?.id || 'ANONYMOUS',
      usuarioNombre: targetUser?.nombre || targetClient?.nombre || identifier,
      usuarioEmail: email,
      rol: targetUser?.rol || 'CLIENTE_VIP',
      accion: 'RECUPERAR_PASSWORD',
      modulo: 'SEGURIDAD',
      detalle: `Solicitud de recuperación de contraseña/PIN para ${email}. Código OTP temporal generado.`,
      resultado: 'EXITOSO',
    });

    return {
      success: true,
      message: `Código de verificación temporal enviado a ${email}.`,
      otpCode,
    };
  };

  const resetPasswordWithOtp = (identifier: string, otp: string, newPassword: string) => {
    if (otp.length < 4) {
      return { success: false, message: 'El código de verificación ingresado no es válido.' };
    }
    if (newPassword.length < 4) {
      return { success: false, message: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }

    const cleanId = identifier.trim().toLowerCase();
    const targetUser = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.id.toLowerCase() === cleanId
    );

    if (targetUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, pin: newPassword, passwordHash: 'hash_updated' } : u))
      );
    }

    addAuditLog({
      usuarioId: targetUser?.id || 'USR-RECOVERED',
      usuarioNombre: targetUser?.nombre || identifier,
      usuarioEmail: targetUser?.email || identifier,
      rol: targetUser?.rol || 'CLIENTE_VIP',
      accion: 'CAMBIO_PASSWORD',
      modulo: 'SEGURIDAD',
      detalle: `Restablecimiento exitoso de contraseña para usuario ${identifier}.`,
      resultado: 'EXITOSO',
    });

    return {
      success: true,
      message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión con tu nueva clave.',
    };
  };

  // 10-15 Second Fast VIP Purchase Registration with Payment Gateway & Deductions
  const registerPurchase = ({
    codigoVip,
    valorCompra,
    observacion,
    overrideMerchantId,
    metodoPago = 'EFECTIVO',
    detallesPago,
  }: {
    codigoVip: string;
    valorCompra: number;
    observacion?: string;
    overrideMerchantId?: string;
    metodoPago?: PaymentMethod;
    detallesPago?: PaymentDetails;
  }) => {
    // 1. Identify Client
    const client = getClientByVIPOrDoc(codigoVip);
    if (!client) {
      return { success: false, message: `No se encontró ningún cliente VIP con el código o documento "${codigoVip}".` };
    }

    if (client.estado !== 'Activo') {
      return { success: false, message: `El cliente ${client.nombre} se encuentra en estado "${client.estado}". No puede registrar compras.` };
    }

    // 2. Identify Merchant
    let merchantId = overrideMerchantId || currentUser.comercioId;
    if (!merchantId && currentUser.rol === 'SUPERADMIN') {
      merchantId = merchants[0]?.id; // Default to first merchant if superadmin didn't select
    }

    const merchant = merchants.find((m) => m.id === merchantId);
    if (!merchant) {
      return { success: false, message: 'No se pudo determinar el comercio afiliado para la transacción.' };
    }

    if (merchant.estado !== 'Activo') {
      return { success: false, message: `El comercio ${merchant.nombre} se encuentra "${merchant.estado}".` };
    }

    // 3. Validation on Amount
    if (!valorCompra || valorCompra <= 0 || isNaN(valorCompra)) {
      return { success: false, message: 'Por favor ingresa un valor de compra válido mayor a $0.' };
    }

    // 4. Anti-duplicate window check (same client, merchant, amount within 3 minutes)
    const now = new Date();
    const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
    const isDuplicate = purchases.some((p) => {
      if (p.estado === 'Anulada') return false;
      if (p.clienteId === client.id && p.comercioId === merchant.id && Math.abs(p.valorCompra - valorCompra) < 1) {
        const pDate = new Date(p.createdAt);
        return pDate >= threeMinutesAgo;
      }
      return false;
    });

    if (isDuplicate) {
      return {
        success: false,
        message: 'ADVERTENCIA ANTI-DUPLICADO: Se detectó una compra idéntica para este cliente en los últimos 3 minutos. Para registrarla nuevamente, verifique el comprobante o espere unos instantes.',
      };
    }

    // 5. Calculate CEB Contribution & Tax Deduction Breakdown
    const currentPercent = cebConfig.porcentaje || 7;
    const numeroTransaccion = generateTransactionNumber(purchases.length);
    const desglose = computeTaxDeductionBreakdown(valorCompra, currentPercent, merchant.nit, numeroTransaccion);
    const aporteCeb = desglose.deduccionCebMonto;
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0];

    const finalPaymentDetails: PaymentDetails = detallesPago || {
      metodo: metodoPago,
      montoRecibido: valorCompra,
      cambioVueltas: 0,
      numeroAutorizacion: generateAuthorizationCode(),
      firmaDigitalSha256: desglose.certificadoDianHash,
    };

    const newPurchase: Purchase = {
      id: numeroTransaccion,
      numeroTransaccion,
      clienteId: client.id,
      codigoVip: client.codigoVip,
      clienteNombre: client.nombre,
      comercioId: merchant.id,
      comercioNombre: merchant.nombre,
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      fecha,
      hora,
      valorCompra,
      porcentajeCeb: currentPercent,
      aporteCeb,
      estado: 'Confirmada',
      metodoPago,
      detallesPago: finalPaymentDetails,
      desgloseTributario: desglose,
      certificadoDianHash: desglose.certificadoDianHash,
      observacion: observacion?.trim() || `Compra VIP registrada vía ${metodoPago.replace(/_/g, ' ')}`,
      createdAt: now.toISOString(),
    };

    // 7. Update Purchases & Client totals
    setPurchases((prev) => [newPurchase, ...prev]);

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === client.id) {
          return {
            ...c,
            acumuladoTotal: c.acumuladoTotal + valorCompra,
            totalCompras: c.totalCompras + 1,
            totalAporteCEB: c.totalAporteCEB + aporteCeb,
            updatedAt: fecha,
          };
        }
        return c;
      })
    );

    // 8. Audit Log
    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'REGISTRAR_COMPRA',
      modulo: 'COMPRAS',
      registroId: numeroTransaccion,
      detalle: `Registro de compra exitoso por $${valorCompra.toLocaleString('es-CO')} vía ${metodoPago}. Cliente: ${client.codigoVip} (${client.nombre}) en ${merchant.nombre}. Deducción 7% CEB: $${aporteCeb.toLocaleString('es-CO')}. Liq. Neta 93%: $${desglose.liquidacionNetaComercio.toLocaleString('es-CO')}. Certificado DIAN: ${desglose.certificadoDianHash}.`,
      resultado: 'EXITOSO',
    });

    // 9. Sound and visual celebration
    playSuccessSound();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#059669', '#2563eb', '#f59e0b', '#10b981'],
    });

    return {
      success: true,
      message: `¡Compra registrada exitosamente! Se retuvo y destinó el 7% ($${aporteCeb.toLocaleString('es-CO')}) al Fondo de Becas Bilingües CEB. Certificado DIAN: ${desglose.certificadoDianHash}.`,
      purchase: newPurchase,
    };
  };

  // Liquidate & Transfer 7% CEB Fund to Trust with Tax Certificate
  const liquidateMerchantCEB = (
    comercioId: string,
    metodo: 'PSE_BANCOLOMBIA' | 'TRANSFERENCIA_ACH' | 'PASARELA_WOMPI'
  ) => {
    const targetMerchant = merchants.find((m) => m.id === comercioId);
    if (!targetMerchant) {
      return { success: false, message: 'Comercio no encontrado para liquidación.' };
    }

    const merchantPurchases = purchases.filter(
      (p) => p.comercioId === comercioId && p.estado === 'Confirmada'
    );
    const totalVentas = merchantPurchases.reduce((sum, p) => sum + p.valorCompra, 0);
    const totalAporte7 = merchantPurchases.reduce((sum, p) => sum + p.aporteCeb, 0);

    if (totalAporte7 <= 0) {
      return {
        success: false,
        message: 'No existen aportes del 7% pendientes por liquidar para este establecimiento comercial.',
      };
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const seq = String(settlements.length + 1).padStart(3, '0');
    const numeroLiquidacion = `LIQ-CEB-2026-${seq}`;
    const comprobanteId = `${metodo.split('_')[0]}-TRF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const dianHash = generateDianHash(numeroLiquidacion, totalAporte7, targetMerchant.nit);
    const horasFinanciadas = Math.round(totalAporte7 / 3000);
    const estudiantes = Math.max(1, Math.round(horasFinanciadas / 40));

    const newSettlement: CEBSettlementRecord = {
      id: `SET-${now.getFullYear()}-${seq}`,
      numeroLiquidacion,
      comercioId,
      comercioNombre: targetMerchant.nombre,
      periodo: `${now.toLocaleString('es-CO', { month: 'long' })} ${now.getFullYear()}`,
      fechaLiquidacion: today,
      totalVentasProcesadas: totalVentas,
      montoRetenido7Ceb: totalAporte7,
      montoNetoComercio93: totalVentas - totalAporte7,
      estado: 'LIQUIDADO_TRANSFERIDO',
      metodoTransferencia: metodo,
      comprobanteTransferenciaId: comprobanteId,
      certificadoDianHash: dianHash,
      horasInglesFinanciadas: horasFinanciadas,
      estudiantesBeneficiados: estudiantes,
    };

    setSettlements((prev) => [newSettlement, ...prev]);

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'REGISTRAR_COMPRA',
      modulo: 'CEB',
      registroId: numeroLiquidacion,
      detalle: `Liquidación y transferencia del 7% CEB por $${totalAporte7.toLocaleString('es-CO')} vía ${metodo}. Comercio: ${targetMerchant.nombre}. Comprobante: ${comprobanteId}. Hash DIAN: ${dianHash}.`,
      resultado: 'EXITOSO',
    });

    try {
      playSuccessSound();
      confetti({ particleCount: 70, spread: 80 });
    } catch {}

    return {
      success: true,
      message: `¡Liquidación y transferencia del 7% completada con éxito! Se transfirieron $${totalAporte7.toLocaleString('es-CO')} al Fideicomiso Educativo CEB. Certificado Tributario DIAN generado.`,
      settlement: newSettlement,
    };
  };

  // Controlled Annulment Rule (No physical deletion, retains audit & history)
  const annulPurchase = (purchaseId: string, motivo: string) => {
    if (!motivo || motivo.trim().length < 5) {
      return { success: false, message: 'Debe especificar un motivo detallado de anulación (mínimo 5 caracteres).' };
    }

    const target = purchases.find((p) => p.id === purchaseId);
    if (!target) {
      return { success: false, message: 'No se encontró la compra a anular.' };
    }

    if (target.estado === 'Anulada') {
      return { success: false, message: 'Esta compra ya fue previamente anulada.' };
    }

    const now = new Date();
    const fechaAnulacion = now.toISOString();

    // Mark as Anulada
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id === purchaseId) {
          return {
            ...p,
            estado: 'Anulada',
            motivoAnulacion: motivo.trim(),
            usuarioAnulacion: currentUser.nombre,
            fechaAnulacion,
          };
        }
        return p;
      })
    );

    // Recalculate client's valid accumulated totals
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === target.clienteId) {
          return {
            ...c,
            acumuladoTotal: Math.max(0, c.acumuladoTotal - target.valorCompra),
            totalCompras: Math.max(0, c.totalCompras - 1),
            totalAporteCEB: Math.max(0, c.totalAporteCEB - target.aporteCeb),
            updatedAt: now.toISOString().split('T')[0],
          };
        }
        return c;
      })
    );

    // Audit log
    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'ANULAR_COMPRA',
      modulo: 'COMPRAS',
      registroId: target.numeroTransaccion,
      detalle: `Anulación controlada de transacción ${target.numeroTransaccion} ($${target.valorCompra.toLocaleString('es-CO')}). Motivo: "${motivo}". Autorizado por: ${currentUser.nombre}.`,
      resultado: 'EXITOSO',
    });

    return {
      success: true,
      message: `Transacción ${target.numeroTransaccion} anulada exitosamente. El acumulado del cliente y los reportes han sido actualizados.`,
    };
  };

  const createClient = (clientData: Omit<ClientVIP, 'id' | 'acumuladoTotal' | 'totalCompras' | 'totalAporteCEB' | 'updatedAt' | 'tarjetaActivaId'>) => {
    // Check if code or doc already exists
    const existingVIP = clients.find((c) => c.codigoVip.toUpperCase() === clientData.codigoVip.toUpperCase());
    if (existingVIP) {
      return { success: false, message: `Ya existe un cliente con el código VIP "${clientData.codigoVip}".` };
    }

    const existingDoc = clients.find((c) => c.documento === clientData.documento);
    if (existingDoc) {
      return { success: false, message: `Ya existe un cliente registrado con el documento "${clientData.documento}".` };
    }

    const newId = `CLI-${String(clients.length + 1).padStart(3, '0')}`;
    const cardId = `CRD-${clientData.codigoVip}-01`;
    const now = new Date().toISOString().split('T')[0];

    const newCard: CardVIP = {
      id: cardId,
      codigoTarjeta: cardId,
      codigoVip: clientData.codigoVip,
      clienteId: newId,
      estado: 'Activa',
      fechaEmision: now,
      fechaActivacion: now,
      fechaVencimiento: `${new Date().getFullYear() + 2}-12-31`,
    };

    const newClient: ClientVIP = {
      ...clientData,
      id: newId,
      acumuladoTotal: 0,
      totalCompras: 0,
      totalAporteCEB: 0,
      tarjetaActivaId: cardId,
      updatedAt: now,
      aceptaHabeasData: true,
    };

    setCards((prev) => [newCard, ...prev]);
    setClients((prev) => [newClient, ...prev]);

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'CREAR_CLIENTE',
      modulo: 'CLIENTES',
      registroId: newId,
      detalle: `Creación de nuevo cliente VIP: ${newClient.nombre} (${newClient.codigoVip}) con tarjeta digital ${cardId}.`,
      resultado: 'EXITOSO',
    });

    return {
      success: true,
      message: `Cliente VIP "${newClient.nombre}" creado exitosamente con código ${newClient.codigoVip}.`,
      client: newClient,
    };
  };

  const updateClient = (id: string, updates: Partial<ClientVIP>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c))
    );

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'EDITAR_CLIENTE',
      modulo: 'CLIENTES',
      registroId: id,
      detalle: `Actualización de información del cliente ID: ${id}.`,
      resultado: 'EXITOSO',
    });

    return { success: true, message: 'Información del cliente actualizada correctamente.' };
  };

  const replaceCard = (clienteId: string, motivo: string) => {
    const client = clients.find((c) => c.id === clienteId);
    if (!client) return { success: false, message: 'Cliente no encontrado.' };

    const clientCards = cards.filter((c) => c.clienteId === clienteId);
    const nextSeq = clientCards.length + 1;
    const newCardId = `CRD-${client.codigoVip}-${String(nextSeq).padStart(2, '0')}`;
    const now = new Date().toISOString().split('T')[0];

    // Mark previous active cards as Reemplazada or Perdida
    setCards((prev) =>
      prev.map((card) => {
        if (card.clienteId === clienteId && card.estado === 'Activa') {
          return {
            ...card,
            estado: motivo.toLowerCase().includes('perd') ? 'Perdida' : 'Reemplazada',
            motivoBloqueo: motivo,
          };
        }
        return card;
      })
    );

    const newCard: CardVIP = {
      id: newCardId,
      codigoTarjeta: newCardId,
      codigoVip: client.codigoVip,
      clienteId: client.id,
      estado: 'Activa',
      fechaEmision: now,
      fechaActivacion: now,
      fechaVencimiento: `${new Date().getFullYear() + 2}-12-31`,
    };

    setCards((prev) => [newCard, ...prev]);

    // Update active card on client without modifying accumulated balance
    setClients((prev) =>
      prev.map((c) => (c.id === clienteId ? { ...c, tarjetaActivaId: newCardId, updatedAt: now } : c))
    );

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'REEMPLAZAR_TARJETA',
      modulo: 'TARJETAS',
      registroId: newCardId,
      detalle: `Reemplazo de tarjeta para cliente ${client.nombre} (${client.codigoVip}). Nueva tarjeta: ${newCardId}. Motivo: ${motivo}. Acumulado histórico conservado: $${client.acumuladoTotal.toLocaleString('es-CO')}.`,
      resultado: 'EXITOSO',
    });

    return {
      success: true,
      message: `Nueva tarjeta ${newCardId} asignada exitosamente al cliente ${client.nombre}. El historial y saldo acumulado se mantienen intactos.`,
      card: newCard,
    };
  };

  const createMerchant = (merchantData: Omit<Merchant, 'id' | 'fechaRegistro'>) => {
    const newId = `COM-${String(merchants.length + 1).padStart(3, '0')}`;
    const newMerchant: Merchant = {
      ...merchantData,
      id: newId,
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    setMerchants((prev) => [...prev, newMerchant]);

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'CREAR_COMERCIO',
      modulo: 'COMERCIOS',
      registroId: newId,
      detalle: `Afiliación de nuevo comercio: ${newMerchant.nombre} (NIT: ${newMerchant.nit}).`,
      resultado: 'EXITOSO',
    });

    return { success: true, message: `Comercio "${newMerchant.nombre}" afiliado exitosamente.` };
  };

  const updateMerchant = (id: string, updates: Partial<Merchant>) => {
    setMerchants((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    return { success: true, message: 'Datos del comercio actualizados.' };
  };

  const updateCEBConfig = (nuevoPorcentaje: number, nota?: string) => {
    if (nuevoPorcentaje <= 0 || nuevoPorcentaje > 50) {
      return { success: false, message: 'El porcentaje debe ser un valor razonable entre 0.5% y 50%.' };
    }

    const previousPercent = cebConfig.porcentaje;
    setCebConfig((prev) => ({
      ...prev,
      porcentaje: nuevoPorcentaje,
      nota: nota || prev.nota,
    }));

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'MODIFICAR_CEB',
      modulo: 'CEB',
      registroId: cebConfig.id,
      detalle: `Actualización de porcentaje de responsabilidad social CEB de ${previousPercent}% a ${nuevoPorcentaje}%. Las transacciones previas conservan su porcentaje de corte inmutable.`,
      resultado: 'EXITOSO',
    });

    return {
      success: true,
      message: `Porcentaje CEB actualizado a ${nuevoPorcentaje}%. Las nuevas compras aplicarán esta tasa.`,
    };
  };

  // SaaS Helper actions
  const getMerchantBranches = (merchantId: string): Branch[] => {
    return branches.filter((b) => b.comercioId === merchantId);
  };

  const getMerchantSubscription = (merchantId: string): SaaSSubscription | undefined => {
    return saasSubscriptions.find((s) => s.comercioId === merchantId);
  };

  const createBranch = (data: Omit<Branch, 'id'>) => {
    const newId = `BRN-${String(branches.length + 1).padStart(3, '0')}`;
    const newBranch: Branch = {
      ...data,
      id: newId,
    };

    setBranches((prev) => [...prev, newBranch]);

    // Update merchant count
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === data.comercioId
          ? {
              ...m,
              totalSucursales: (m.totalSucursales || 1) + 1,
              totalCajasPos: (m.totalCajasPos || 2) + data.cajasActivas,
            }
          : m
      )
    );

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'CREAR_COMERCIO',
      modulo: 'COMERCIOS',
      registroId: newId,
      detalle: `Apertura de nueva sucursal SaaS: ${newBranch.nombre} en ${newBranch.ciudad} para comercio ${data.comercioId}.`,
      resultado: 'EXITOSO',
    });

    return { success: true, message: `Sucursal "${newBranch.nombre}" creada exitosamente.`, branch: newBranch };
  };

  const updateBranch = (id: string, updates: Partial<Branch>) => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    return { success: true, message: 'Sucursal actualizada correctamente.' };
  };

  const deleteBranch = (id: string) => {
    const target = branches.find((b) => b.id === id);
    if (!target) return { success: false, message: 'Sucursal no encontrada.' };
    if (target.esPrincipal) {
      return { success: false, message: 'No se puede eliminar la sede principal del comercio.' };
    }

    setBranches((prev) => prev.filter((b) => b.id !== id));
    return { success: true, message: 'Sucursal eliminada.' };
  };

  const changeMerchantSaaSPlan = (comercioId: string, planId: SaaSPlanTier, ciclo: 'MENSUAL' | 'ANUAL') => {
    const plan = saasPlans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Plan SaaS no válido.' };

    const merchant = merchants.find((m) => m.id === comercioId);
    if (!merchant) return { success: false, message: 'Comercio no encontrado.' };

    const cost = ciclo === 'ANUAL' ? plan.precioAnualCop : plan.precioMensualCop;
    const today = new Date().toISOString().split('T')[0];
    const renewalMonths = ciclo === 'ANUAL' ? 12 : 1;
    const nextRenewal = new Date(new Date().setMonth(new Date().getMonth() + renewalMonths)).toISOString().split('T')[0];

    // Update merchant plan
    setMerchants((prev) => prev.map((m) => (m.id === comercioId ? { ...m, planId } : m)));

    // Update or create subscription
    setSaasSubscriptions((prev) => {
      const existing = prev.find((s) => s.comercioId === comercioId);
      if (existing) {
        return prev.map((s) =>
          s.comercioId === comercioId
            ? {
                ...s,
                planId,
                cicloFacturacion: ciclo,
                fechaRenovacion: nextRenewal,
                precioFacturadoCop: cost,
                limiteSucursales: plan.maxSucursales === -1 ? 999 : plan.maxSucursales,
              }
            : s
        );
      }
      return [
        ...prev,
        {
          id: `SUB-${String(prev.length + 1).padStart(3, '0')}`,
          comercioId,
          planId,
          estado: 'ACTIVA',
          cicloFacturacion: ciclo,
          fechaInicio: today,
          fechaRenovacion: nextRenewal,
          precioFacturadoCop: cost,
          metodoPago: 'TARJETA_CREDITO',
          limiteSucursales: plan.maxSucursales === -1 ? 999 : plan.maxSucursales,
          sucursalesUsadas: branches.filter((b) => b.comercioId === comercioId).length || 1,
        },
      ];
    });

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'REGISTRO_COMERCIO',
      modulo: 'COMERCIOS',
      registroId: comercioId,
      detalle: `Actualización de Plan SaaS para "${merchant.nombre}" a ${plan.nombre} (${ciclo}). Valor: $${cost.toLocaleString('es-CO')}.`,
      resultado: 'EXITOSO',
    });

    try {
      playSuccessSound();
      confetti({ particleCount: 50, spread: 60 });
    } catch {}

    return { success: true, message: `Plan SaaS actualizado exitosamente a ${plan.nombre}.` };
  };

  const generateApiKey = (
    comercioId: string,
    nombre: string,
    permisos: ('READ_CLIENT' | 'WRITE_PURCHASE' | 'WEBHOOK_NOTIFY')[]
  ) => {
    const merchant = merchants.find((m) => m.id === comercioId);
    const slug = merchant?.tenantSlug || 'tenant';
    const newKey: SaaSApiKey = {
      id: `KEY-${String(apiKeys.length + 1).padStart(3, '0')}`,
      comercioId,
      nombre,
      apiKey: `cm_live_sk_${slug}_${Math.random().toString(36).substring(2, 14)}`,
      permisos,
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: 'Activa',
    };

    setApiKeys((prev) => [newKey, ...prev]);

    addAuditLog({
      usuarioId: currentUser.id,
      usuarioNombre: currentUser.nombre,
      usuarioEmail: currentUser.email,
      rol: currentUser.rol,
      accion: 'CREAR_COMERCIO',
      modulo: 'SEGURIDAD',
      registroId: newKey.id,
      detalle: `Generación de nueva API Key POS "${nombre}" para comercio ${merchant?.nombre || comercioId}.`,
      resultado: 'EXITOSO',
    });

    return { success: true, message: 'API Key generada exitosamente.', key: newKey };
  };

  const revokeApiKey = (keyId: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, estado: 'Revocada' } : k)));
    return { success: true, message: 'API Key revocada.' };
  };

  const resetToDefaults = () => {
    setClients(INITIAL_CLIENTS);
    setCards(INITIAL_CARDS);
    setMerchants(INITIAL_MERCHANTS);
    setBranches(INITIAL_BRANCHES);
    setSaasSubscriptions(INITIAL_SAAS_SUBSCRIPTIONS);
    setApiKeys(INITIAL_API_KEYS);
    setSelectedTenantId('ALL');
    setUsers(INITIAL_USERS);
    setPurchases(INITIAL_PURCHASES);
    setCebConfig(INITIAL_CEB_CONFIG);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentUserId('USR-001');
    localStorage.clear();
  };

  const exportDatabaseJSON = () => {
    const dbExport = {
      exportDate: new Date().toISOString(),
      system: 'Club Multitienda VIP SaaS - CEB',
      version: '2.0.0',
      clients,
      cards,
      merchants,
      branches,
      saasSubscriptions,
      apiKeys,
      users,
      purchases,
      cebConfig,
      auditLogs,
    };

    const blob = new Blob([JSON.stringify(dbExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_club_multitienda_saas_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJSON = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (!data.clients || !data.purchases || !data.merchants) {
        return { success: false, message: 'El archivo JSON no contiene la estructura requerida del sistema.' };
      }
      if (data.clients) setClients(data.clients);
      if (data.cards) setCards(data.cards);
      if (data.merchants) setMerchants(data.merchants);
      if (data.branches) setBranches(data.branches);
      if (data.saasSubscriptions) setSaasSubscriptions(data.saasSubscriptions);
      if (data.apiKeys) setApiKeys(data.apiKeys);
      if (data.users) setUsers(data.users);
      if (data.purchases) setPurchases(data.purchases);
      if (data.cebConfig) setCebConfig(data.cebConfig);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      addAuditLog({
        usuarioId: currentUser.id,
        usuarioNombre: currentUser.nombre,
        usuarioEmail: currentUser.email,
        rol: currentUser.rol,
        accion: 'RESTAURAR_BACKUP',
        modulo: 'SISTEMA',
        detalle: 'Restauración de base de datos completa desde archivo JSON.',
        resultado: 'EXITOSO',
      });

      return { success: true, message: 'Base de datos restaurada correctamente desde el respaldo.' };
    } catch (e: any) {
      return { success: false, message: `Error al parsear el archivo: ${e.message}` };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        clients,
        cards,
        merchants,
        purchases,
        settlements,
        cebConfig,
        auditLogs,
        saasPlans,
        branches,
        saasSubscriptions,
        apiKeys,
        selectedTenantId,
        setSelectedTenantId,
        activeTenantMerchant,
        isAuthenticated,
        login,
        logout,
        registerClientAuth,
        registerMerchantRequest,
        requestPasswordRecovery,
        resetPasswordWithOtp,
        showAuthModal,
        setShowAuthModal,
        showPermissionsModal,
        setShowPermissionsModal,
        showHabeasModal,
        setShowHabeasModal,
        showBackupModal,
        setShowBackupModal,
        showSettlementModal,
        setShowSettlementModal,
        showApiDocsModal,
        setShowApiDocsModal,
        showCardModal,
        setShowCardModal,
        selectedCardClient,
        setSelectedCardClient,
        hasPermission,
        activeTab,
        setActiveTab,
        switchUser,
        registerPurchase,
        liquidateMerchantCEB,
        annulPurchase,
        createClient,
        updateClient,
        replaceCard,
        createMerchant,
        updateMerchant,
        updateCEBConfig,
        addAuditLog,
        createBranch,
        updateBranch,
        deleteBranch,
        changeMerchantSaaSPlan,
        generateApiKey,
        revokeApiKey,
        getMerchantBranches,
        getMerchantSubscription,
        resetToDefaults,
        exportDatabaseJSON,
        importDatabaseJSON,
        getClientByVIPOrDoc,
        getMerchantById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
