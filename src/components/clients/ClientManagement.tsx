import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Award,
  CreditCard,
  QrCode,
  Edit2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClientVIP, CardVIP } from '../../types';
import { formatCurrency, formatDate, generateVIPCode } from '../../utils/formatters';
import { VirtualCardModal } from '../qr/VirtualCardModal';

export const ClientManagement: React.FC = () => {
  const {
    clients,
    cards,
    createClient,
    updateClient,
    replaceCard,
    currentUser,
  } = useApp();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<ClientVIP | null>(null);
  const [showCardModal, setShowCardModal] = useState<ClientVIP | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState<ClientVIP | null>(null);

  // Create Form State
  const [newNombre, setNewNombre] = useState<string>('');
  const [newDocumento, setNewDocumento] = useState<string>('');
  const [newTelefono, setNewTelefono] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newCodigoVip, setNewCodigoVip] = useState<string>(() => generateVIPCode(clients.length));
  const [formError, setFormError] = useState<string | null>(null);

  // Replace Card State
  const [replaceReason, setReplaceReason] = useState<string>('Pérdida de tarjeta física');

  // Filtered list
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesStatus = statusFilter === 'ALL' || c.estado === statusFilter;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        c.nombre.toLowerCase().includes(term) ||
        c.codigoVip.toLowerCase().includes(term) ||
        c.documento.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.telefono.includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [clients, search, statusFilter]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newNombre.trim() || !newDocumento.trim() || !newCodigoVip.trim()) {
      setFormError('Nombre completo, documento y código VIP son campos obligatorios.');
      return;
    }

    const res = createClient({
      codigoVip: newCodigoVip.trim().toUpperCase(),
      nombre: newNombre.trim(),
      documento: newDocumento.trim(),
      telefono: newTelefono.trim() || '+57 300 000 0000',
      email: newEmail.trim() || 'cliente@vip.clubmultitienda.co',
      estado: 'Activo',
      fechaRegistro: new Date().toISOString().split('T')[0],
    });

    if (res.success) {
      setShowCreateModal(false);
      setNewNombre('');
      setNewDocumento('');
      setNewTelefono('');
      setNewEmail('');
      setNewCodigoVip(generateVIPCode(clients.length + 1));
    } else {
      setFormError(res.message);
    }
  };

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReplaceModal) return;

    const res = replaceCard(showReplaceModal.id, replaceReason);
    if (res.success) {
      setShowReplaceModal(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              MÓDULO 12 Y 13
            </span>
            <span className="text-xs text-slate-500">Club Multitienda VIP</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Gestión de Clientes y Tarjetas VIP</h1>
          <p className="text-xs text-slate-500">
            Administración centralizada de clientes VIP, emisión de tarjetas digitales QR y control de acumulados.
          </p>
        </div>

        {currentUser.rol !== 'CLIENTE_VIP' && (
          <button
            onClick={() => {
              setNewCodigoVip(generateVIPCode(clients.length));
              setFormError(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Crear Nuevo Cliente VIP
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código VIP, nombre, cédula, teléfono..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
          >
            <option value="ALL">Todos ({clients.length})</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
            <option value="Suspendido">Suspendidos</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Código VIP</th>
                <th className="py-3.5 px-4">Cliente / Titular</th>
                <th className="py-3.5 px-4">Documento</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4 text-right">Acumulado</th>
                <th className="py-3.5 px-4 text-center">Compras</th>
                <th className="py-3.5 px-4 text-right">Aporte CEB</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron clientes con el criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const clientCard = cards.find((c) => c.clienteId === client.id && c.estado === 'Activa');
                  return (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                          {client.codigoVip}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{client.nombre}</div>
                        <div className="text-[11px] text-slate-400">Reg: {formatDate(client.fechaRegistro)}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{client.documento}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700">{client.telefono}</div>
                        <div className="text-[10px] text-slate-400">{client.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(client.acumuladoTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">{client.totalCompras}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(client.totalAporteCEB)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            client.estado === 'Activo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {client.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Virtual QR Card */}
                          <button
                            onClick={() => setShowCardModal(client)}
                            title="Ver Tarjeta Digital VIP con QR"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Replace Card (Section 13) */}
                          {currentUser.rol === 'SUPERADMIN' && (
                            <button
                              onClick={() => setShowReplaceModal(client)}
                              title="Reemplazar Tarjeta (conserva acumulado histórico)"
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit Client */}
                          {currentUser.rol === 'SUPERADMIN' && (
                            <button
                              onClick={() => setShowEditModal(client)}
                              title="Editar datos del cliente"
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create New VIP Client */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Registrar Nuevo Cliente VIP
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Código VIP Único</label>
                  <input
                    type="text"
                    value={newCodigoVip}
                    onChange={(e) => setNewCodigoVip(e.target.value.toUpperCase())}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Cédula / Documento</label>
                  <input
                    type="text"
                    value={newDocumento}
                    onChange={(e) => setNewDocumento(e.target.value)}
                    placeholder="Ej: 1.098.745.210"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Completo del Titular</label>
                <input
                  type="text"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej: Andrea Carolina Suárez Gómez"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    value={newTelefono}
                    onChange={(e) => setNewTelefono(e.target.value)}
                    placeholder="+57 315 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
                ✓ Se generará automáticamente la primera Tarjeta Digital VIP activa y el cliente quedará habilitado para acumular compras y aportar al programa CEB.
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 font-medium">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Crear Cliente VIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Replace Card (Section 13: Preserves historic balance) */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-400" />
                Reemplazo de Tarjeta VIP (Sección 13)
              </h3>
              <button
                onClick={() => setShowReplaceModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="p-6 space-y-4 text-xs text-slate-800">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">Cliente:</div>
                <div className="font-bold text-sm text-slate-900">{showReplaceModal.nombre}</div>
                <div className="text-slate-500">Código VIP: <span className="font-mono font-bold text-slate-800">{showReplaceModal.codigoVip}</span></div>
                <div className="text-slate-500">Saldo acumulado protegido: <span className="font-mono font-bold text-emerald-700">{formatCurrency(showReplaceModal.acumuladoTotal)}</span></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Motivo de Emisión de Nueva Tarjeta
                </label>
                <select
                  value={replaceReason}
                  onChange={(e) => setReplaceReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Pérdida de tarjeta física">Pérdida de tarjeta física</option>
                  <option value="Deterioro o daño físico">Deterioro o daño físico</option>
                  <option value="Renovación por vencimiento">Renovación por vencimiento</option>
                  <option value="Solicitud de tarjeta digital adicional">Solicitud de tarjeta digital adicional</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <div className="font-bold">Regla de Negocio Sección 13:</div>
                <p>
                  La tarjeta anterior se marcará como reemplazada/bloqueada, pero <strong>todo el historial de compras y el acumulado del cliente se conservarán íntegros</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Emitir Nueva Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Client */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Editar Cliente VIP</h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateClient(showEditModal.id, showEditModal);
                setShowEditModal(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  value={showEditModal.nombre}
                  onChange={(e) => setShowEditModal({ ...showEditModal, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono</label>
                <input
                  type="text"
                  value={showEditModal.telefono}
                  onChange={(e) => setShowEditModal({ ...showEditModal, telefono: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={showEditModal.email}
                  onChange={(e) => setShowEditModal({ ...showEditModal, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Estado</label>
                <select
                  value={showEditModal.estado}
                  onChange={(e) => setShowEditModal({ ...showEditModal, estado: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Digital Card with QR */}
      {showCardModal && (
        <VirtualCardModal
          client={showCardModal}
          card={cards.find((c) => c.clienteId === showCardModal.id && c.estado === 'Activa')}
          onClose={() => setShowCardModal(null)}
        />
      )}
    </div>
  );
};
