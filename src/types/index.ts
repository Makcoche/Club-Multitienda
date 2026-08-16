export type UserRole = 'SUPERADMIN' | 'ADMIN_COMERCIO' | 'OPERADOR_COMERCIO' | 'CLIENTE_VIP';

export type CardStatus = 'Activa' | 'Bloqueada' | 'Perdida' | 'Inactiva' | 'Reemplazada';
export type ClientStatus = 'Activo' | 'Inactivo' | 'Suspendido';
export type MerchantStatus = 'Activo' | 'Inactivo' | 'Suspendido';
export type PurchaseStatus = 'Registrada' | 'Confirmada' | 'Anulada';

export type SystemPermission =
  | 'VIEW_GLOBAL_DASHBOARD'
  | 'VIEW_MERCHANT_DASHBOARD'
  | 'VIEW_OPERATOR_DASHBOARD'
  | 'VIEW_VIP_PORTAL'
  | 'REGISTER_PURCHASE'
  | 'ANNUL_PURCHASE'
  | 'MANAGE_CLIENTS'
  | 'REPLACE_CARDS'
  | 'MANAGE_MERCHANTS'
  | 'MANAGE_CEB_CONFIG'
  | 'VIEW_REPORTS'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_BACKUPS'
  | 'MANAGE_SAAS';

export interface RoleDescriptor {
  role: UserRole;
  name: string;
  shortName: string;
  badgeColor: string;
  description: string;
  permissions: SystemPermission[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDescriptor> = {
  SUPERADMIN: {
    role: 'SUPERADMIN',
    name: 'Superadministrador General',
    shortName: 'Superadmin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Acceso total y control maestro de la red de comercios, configuración CEB, clientes y bitácora de auditoría.',
    permissions: [
      'VIEW_GLOBAL_DASHBOARD',
      'VIEW_MERCHANT_DASHBOARD',
      'VIEW_OPERATOR_DASHBOARD',
      'VIEW_VIP_PORTAL',
      'REGISTER_PURCHASE',
      'ANNUL_PURCHASE',
      'MANAGE_CLIENTS',
      'REPLACE_CARDS',
      'MANAGE_MERCHANTS',
      'MANAGE_CEB_CONFIG',
      'VIEW_REPORTS',
      'VIEW_AUDIT_LOGS',
      'MANAGE_BACKUPS',
      'MANAGE_SAAS',
    ],
  },
  ADMIN_COMERCIO: {
    role: 'ADMIN_COMERCIO',
    name: 'Administrador de Comercio',
    shortName: 'Gerente / Admin',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Gestión de sucursal, control de ventas de su tienda, registro de clientes VIP, corte de caja y anulación autorizada.',
    permissions: [
      'VIEW_MERCHANT_DASHBOARD',
      'VIEW_OPERATOR_DASHBOARD',
      'VIEW_VIP_PORTAL',
      'REGISTER_PURCHASE',
      'ANNUL_PURCHASE',
      'MANAGE_CLIENTS',
      'REPLACE_CARDS',
      'VIEW_REPORTS',
      'MANAGE_SAAS',
    ],
  },
  OPERADOR_COMERCIO: {
    role: 'OPERADOR_COMERCIO',
    name: 'Operador de Comercio / Cajero POS',
    shortName: 'Cajero / Operador',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Registro ágil de compras VIP en caja (10-15 seg), consulta de código/QR y control de su turno de caja diario.',
    permissions: [
      'VIEW_OPERATOR_DASHBOARD',
      'VIEW_VIP_PORTAL',
      'REGISTER_PURCHASE',
    ],
  },
  CLIENTE_VIP: {
    role: 'CLIENTE_VIP',
    name: 'Cliente VIP Titular',
    shortName: 'Cliente VIP',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Acceso a su tarjeta virtual QR, saldo acumulado, beneficios en comercios afiliados e impacto en becas bilingües CEB.',
    permissions: [
      'VIEW_VIP_PORTAL',
    ],
  },
};

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  passwordHash?: string;
  pin?: string;
  comercioId?: string; // Si es ADMIN_COMERCIO u OPERADOR_COMERCIO
  clienteId?: string;  // Si es CLIENTE_VIP
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string;
  ultimoAcceso: string;
}

export interface ClientVIP {
  id: string;
  codigoVip: string; // ej: "VIP-7626"
  nombre: string;
  documento: string; // Cédula o NIT
  telefono: string;
  email: string;
  estado: ClientStatus;
  fechaRegistro: string;
  updatedAt: string;
  tarjetaActivaId?: string;
  acumuladoTotal: number; // Suma de compras válidas
  totalCompras: number;
  totalAporteCEB: number;
  aceptaHabeasData?: boolean;
}

export interface CardVIP {
  id: string;
  codigoTarjeta: string; // ej: "CRD-VIP-7626-01"
  codigoVip: string;
  clienteId: string;
  estado: CardStatus;
  fechaEmision: string;
  fechaActivacion: string;
  fechaVencimiento: string;
  motivoBloqueo?: string;
}

export interface Branch {
  id: string;
  comercioId: string;
  nombre: string; // ej: "Sede Cabecera", "Sede Cañaveral", "Sede Centro"
  direccion: string;
  ciudad: string;
  telefono: string;
  cajasActivas: number;
  esPrincipal: boolean;
  estado: 'Activa' | 'Inactiva';
}

export type SaaSPlanTier = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface SaaSPlan {
  id: SaaSPlanTier;
  nombre: string;
  precioMensualCop: number;
  precioAnualCop: number;
  maxSucursales: number; // -1 for unlimited
  maxClientesVip: number; // -1 for unlimited
  maxCajerosPos: number; // -1 for unlimited
  soportePrioritario: boolean;
  apiRestEnabled: boolean;
  marcaBlanca: boolean;
  beneficios: string[];
  destacado?: boolean;
}

export interface SaaSSubscription {
  id: string;
  comercioId: string;
  planId: SaaSPlanTier;
  estado: 'ACTIVA' | 'PRUEBA' | 'VENCIDA' | 'CANCELADA';
  cicloFacturacion: 'MENSUAL' | 'ANUAL';
  fechaInicio: string;
  fechaRenovacion: string;
  precioFacturadoCop: number;
  metodoPago: 'TARJETA_CREDITO' | 'PSE_TRANSFERENCIA' | 'FACTURA_ELECTRONICA';
  limiteSucursales: number;
  sucursalesUsadas: number;
}

export interface SaaSApiKey {
  id: string;
  comercioId: string;
  nombre: string; // ej: "Integración POS Caja Central"
  apiKey: string; // ej: "cm_live_sk_948a3f892..."
  permisos: ('READ_CLIENT' | 'WRITE_PURCHASE' | 'WEBHOOK_NOTIFY')[];
  fechaCreacion: string;
  ultimoUso?: string;
  estado: 'Activa' | 'Revocada';
}

export interface Merchant {
  id: string;
  tenantSlug: string; // ej: "almerkar", "farmavida", "calzados-elegance"
  nombre: string; // Nombre comercial ej: "Supermercados Almerkar"
  razonSocial: string;
  nit: string;
  categoria: string; // Supermercados, Farmacia, Calzado, Gastronomía, etc.
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  responsable: string;
  estado: MerchantStatus;
  fechaRegistro: string;
  logoColor?: string;
  planId?: SaaSPlanTier;
  subdominio?: string;
  totalSucursales?: number;
  totalCajasPos?: number;
}

export interface Purchase {
  id: string;
  numeroTransaccion: string; // ej: "TRX-2026-0045"
  clienteId: string;
  codigoVip: string;
  clienteNombre: string;
  comercioId: string;
  comercioNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM:SS
  valorCompra: number;
  porcentajeCeb: number; // ej: 7
  aporteCeb: number;     // ej: 17500
  estado: PurchaseStatus;
  metodoPago?: PaymentMethod;
  detallesPago?: PaymentDetails;
  desgloseTributario?: TaxDeductionBreakdown;
  certificadoDianHash?: string;
  observacion?: string;
  motivoAnulacion?: string;
  usuarioAnulacion?: string;
  fechaAnulacion?: string;
  createdAt: string;
}

export interface CEBConfig {
  id: string;
  porcentaje: number; // default 7
  fechaInicio: string;
  fechaFin?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  nota?: string;
  descripcionPrograma: string;
}

export interface AuditLog {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  rol: UserRole;
  accion:
    | 'REGISTRAR_COMPRA'
    | 'ANULAR_COMPRA'
    | 'CREAR_CLIENTE'
    | 'EDITAR_CLIENTE'
    | 'REEMPLAZAR_TARJETA'
    | 'CREAR_COMERCIO'
    | 'MODIFICAR_CEB'
    | 'INICIO_SESION'
    | 'CIERRE_SESION'
    | 'RECUPERAR_PASSWORD'
    | 'CAMBIO_PASSWORD'
    | 'REGISTRO_CLIENTE'
    | 'REGISTRO_COMERCIO'
    | 'EXPORTAR_DATOS'
    | 'RESTAURAR_BACKUP';
  modulo: 'COMPRAS' | 'CLIENTES' | 'TARJETAS' | 'COMERCIOS' | 'CEB' | 'SISTEMA' | 'REPORTES' | 'SEGURIDAD';
  registroId?: string;
  fecha: string;
  hora: string;
  ip: string;
  dispositivo: string;
  detalle: string;
  resultado: 'EXITOSO' | 'FALLIDO' | 'ADVERTENCIA';
}

export interface CEBImpactStats {
  totalAportado: number;
  estudiantesBeneficiados: number;
  horasBilinguesImpartidas: number;
  becasEntregadas: number;
  talleresComunitarios: number;
}

export type PaymentMethod =
  | 'EFECTIVO'
  | 'DATAFONO_TARJETA'
  | 'PSE_TRANSFERENCIA'
  | 'PASARELA_WOMPI_PAYU'
  | 'QR_INTEROPERABLE';

export interface PaymentDetails {
  metodo: PaymentMethod;
  montoRecibido?: number;
  cambioVueltas?: number;
  numeroAutorizacion?: string;
  franquicia?: string; // 'VISA' | 'MASTERCARD' | 'AMEX'
  bancoOrigen?: string; // 'Bancolombia' | 'Nequi' | 'Daviplata' | 'PSE'
  referenciaPasarela?: string;
  firmaDigitalSha256?: string;
}

export interface TaxDeductionBreakdown {
  valorBrutoCompra: number;
  baseGravable: number;
  deduccionCebPorcentaje: number; // 7%
  deduccionCebMonto: number;       // e.g. 10500
  liquidacionNetaComercio: number; // 93% e.g. 139500
  descuentoTributarioEstimadoDian: number; // Hasta 25% del 7% donado (Art. 257 E.T.)
  certificadoDianHash: string;
}

export interface CEBSettlementRecord {
  id: string;
  numeroLiquidacion: string;
  comercioId: string;
  comercioNombre: string;
  periodo: string; // ej: "Agosto 2026"
  fechaLiquidacion: string;
  totalVentasProcesadas: number;
  montoRetenido7Ceb: number;
  montoNetoComercio93: number;
  estado: 'LIQUIDADO_TRANSFERIDO' | 'PENDIENTE_TRANSFERENCIA';
  metodoTransferencia: 'PSE_BANCOLOMBIA' | 'TRANSFERENCIA_ACH' | 'PASARELA_WOMPI';
  comprobanteTransferenciaId: string;
  certificadoDianHash: string;
  horasInglesFinanciadas: number;
  estudiantesBeneficiados: number;
}

