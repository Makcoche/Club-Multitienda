/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { AccessDenied } from './components/common/AccessDenied';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { PermissionsModal } from './components/auth/PermissionsModal';
import { HabeasDataModal } from './components/legal/HabeasDataModal';
import { BackupManagementModal } from './components/backup/BackupManagementModal';

// Dashboards for each role
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ComercioDashboard } from './components/dashboard/ComercioDashboard';
import { OperadorDashboard } from './components/dashboard/OperadorDashboard';
import { ClientVIPDashboard } from './components/dashboard/ClientVIPDashboard';

// Other Modules
import { FastPurchaseRegister } from './components/pos/FastPurchaseRegister';
import { ClientManagement } from './components/clients/ClientManagement';
import { MerchantManagement } from './components/merchants/MerchantManagement';
import { PurchasesList } from './components/purchases/PurchasesList';
import { CEBProgramManagement } from './components/ceb/CEBProgramManagement';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { ClientVIPPortal } from './components/portal/ClientVIPPortal';
import { HomePage } from './components/home/HomePage';
import { SaaSManagement } from './components/saas/SaaSManagement';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    currentUser,
    hasPermission,
    showAuthModal,
    setShowAuthModal,
    showPermissionsModal,
    setShowPermissionsModal,
    showHabeasModal,
    setShowHabeasModal,
    showBackupModal,
    setShowBackupModal,
  } = useApp();

  const renderDashboardByRole = () => {
    switch (currentUser.rol) {
      case 'SUPERADMIN':
        return <AdminDashboard />;
      case 'ADMIN_COMERCIO':
        return <ComercioDashboard />;
      case 'OPERADOR_COMERCIO':
        return <OperadorDashboard />;
      case 'CLIENTE_VIP':
        return <ClientVIPDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;

      case 'dashboard':
        return renderDashboardByRole();

      case 'saas-management':
        return <SaaSManagement />;

      case 'pos-register':
        if (!hasPermission('REGISTER_PURCHASE')) {
          return <AccessDenied requiredPermission="Registro ágil de compras en caja POS" />;
        }
        return <FastPurchaseRegister />;

      case 'clients':
        if (!hasPermission('MANAGE_CLIENTS')) {
          return <AccessDenied requiredPermission="Gestión de clientes y emisión de tarjetas VIP" />;
        }
        return <ClientManagement />;

      case 'merchants':
        if (!hasPermission('MANAGE_MERCHANTS')) {
          return <AccessDenied requiredPermission="Administración y registro de comercios afiliados" />;
        }
        return <MerchantManagement />;

      case 'purchases':
        return <PurchasesList />;

      case 'ceb-program':
        return <CEBProgramManagement />;

      case 'reports':
        if (!hasPermission('VIEW_REPORTS')) {
          return <AccessDenied requiredPermission="Generación y consulta de reportes ejecutivos" />;
        }
        return <ReportsCenter />;

      case 'audit-logs':
        if (!hasPermission('VIEW_AUDIT_LOGS')) {
          return <AccessDenied requiredPermission="Consulta de la bitácora de auditoría de seguridad" />;
        }
        return <AuditLogsView />;

      case 'client-portal':
        if (!hasPermission('VIEW_VIP_PORTAL')) {
          return <AccessDenied requiredPermission="Consulta de tarjeta digital y saldo VIP" />;
        }
        return <ClientVIPPortal />;

      default:
        return renderDashboardByRole();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      <Header />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      <MobileNav />

      {/* Global Auth Modal for Login, Client Registration, Merchant Request, and Password Recovery */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* RBAC Permissions Matrix Modal */}
      {showPermissionsModal && (
        <PermissionsModal onClose={() => setShowPermissionsModal(false)} />
      )}

      {/* Habeas Data Legal Policy Modal */}
      {showHabeasModal && (
        <HabeasDataModal onClose={() => setShowHabeasModal(false)} />
      )}

      {/* Backup & Disaster Recovery Modal */}
      {showBackupModal && (
        <BackupManagementModal onClose={() => setShowBackupModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
