import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  TrendingUp,
  HeartHandshake,
  Edit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Merchant } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const MerchantManagement: React.FC = () => {
  const { merchants, purchases, createMerchant, updateMerchant, currentUser } = useApp();

  const [search, setSearch] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<Merchant | null>(null);

  // Form State
  const [newNombre, setNewNombre] = useState<string>('');
  const [newRazonSocial, setNewRazonSocial] = useState<string>('');
  const [newNit, setNewNit] = useState<string>('');
  const [newCategoria, setNewCategoria] = useState<string>('Supermercados & Víveres');
  const [newDireccion, setNewDireccion] = useState<string>('');
  const [newCiudad, setNewCiudad] = useState<string>('Bucaramanga');
  const [newTelefono, setNewTelefono] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newResponsable, setNewResponsable] = useState<string>('');

  const filteredMerchants = merchants.filter((m) => {
    const term = search.toLowerCase().trim();
    return (
      !term ||
      m.nombre.toLowerCase().includes(term) ||
      m.razonSocial.toLowerCase().includes(term) ||
      m.nit.includes(term) ||
      m.ciudad.toLowerCase().includes(term) ||
      m.categoria.toLowerCase().includes(term)
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim() || !newNit.trim()) return;

    createMerchant({
      nombre: newNombre.trim(),
      razonSocial: newRazonSocial.trim() || newNombre.trim(),
      nit: newNit.trim(),
      categoria: newCategoria,
      direccion: newDireccion.trim() || 'Principal Bucaramanga',
      ciudad: newCiudad.trim() || 'Bucaramanga',
      telefono: newTelefono.trim() || '(607) 600-0000',
      email: newEmail.trim() || 'comercio@afiliado.co',
      responsable: newResponsable.trim() || 'Gerente de Sucursal',
      estado: 'Activo',
    });

    setShowCreateModal(false);
    setNewNombre('');
    setNewRazonSocial('');
    setNewNit('');
    setNewDireccion('');
    setNewTelefono('');
    setNewEmail('');
    setNewResponsable('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              MÓDULO 14
            </span>
            <span className="text-xs text-slate-500">Club Multitienda S.A.S.</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Comercios Afiliados al Club</h1>
          <p className="text-xs text-slate-500">
            Red de establecimientos comerciales vinculados al programa de compras VIP y aportes CEB.
          </p>
        </div>

        {currentUser.rol === 'SUPERADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Afiliar Nuevo Comercio
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar comercio por nombre, NIT, ciudad, categoría..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
      </div>

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMerchants.map((merchant) => {
          const validPurchases = purchases.filter((p) => p.comercioId === merchant.id && p.estado !== 'Anulada');
          const totalSales = validPurchases.reduce((acc, p) => acc + p.valorCompra, 0);
          const totalCEB = validPurchases.reduce((acc, p) => acc + p.aporteCeb, 0);

          return (
            <div
              key={merchant.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {merchant.categoria}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5">{merchant.nombre}</h3>
                    <div className="text-xs text-slate-500 font-mono">NIT: {merchant.nit}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      merchant.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {merchant.estado}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{merchant.direccion}, {merchant.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{merchant.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Resp: {merchant.responsable}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Ventas Acumuladas</div>
                    <div className="font-bold text-slate-900 font-mono mt-0.5">{formatCurrency(totalSales)}</div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-emerald-700 font-medium">Aporte al CEB</div>
                    <div className="font-bold text-emerald-800 font-mono mt-0.5">{formatCurrency(totalCEB)}</div>
                  </div>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Vinculado: {formatDate(merchant.fechaRegistro)}
                </span>
                {currentUser.rol === 'SUPERADMIN' && (
                  <button
                    onClick={() => setShowEditModal(merchant)}
                    className="font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Afiliar Comercio al Club Multitienda
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    placeholder="Ej: Almerkar Supermercados"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">NIT</label>
                  <input
                    type="text"
                    value={newNit}
                    onChange={(e) => setNewNit(e.target.value)}
                    placeholder="Ej: 900.845.120-4"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Razón Social</label>
                <input
                  type="text"
                  value={newRazonSocial}
                  onChange={(e) => setNewRazonSocial(e.target.value)}
                  placeholder="Ej: Distribuidora Almerkar S.A.S."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Categoría / Sector</label>
                  <select
                    value={newCategoria}
                    onChange={(e) => setNewCategoria(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Supermercados & Víveres">Supermercados & Víveres</option>
                    <option value="Salud & Farmacia">Salud & Farmacia</option>
                    <option value="Moda, Calzado y Cuero">Moda, Calzado y Cuero</option>
                    <option value="Gastronomía & Restaurantes">Gastronomía & Restaurantes</option>
                    <option value="Tecnología & Electrodomésticos">Tecnología & Electrodomésticos</option>
                    <option value="Servicios & Entretenimiento">Servicios & Entretenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={newCiudad}
                    onChange={(e) => setNewCiudad(e.target.value)}
                    placeholder="Bucaramanga, Floridablanca, etc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Dirección Física</label>
                <input
                  type="text"
                  value={newDireccion}
                  onChange={(e) => setNewDireccion(e.target.value)}
                  placeholder="Carrera 27 # 45-18"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newTelefono}
                    onChange={(e) => setNewTelefono(e.target.value)}
                    placeholder="(607) 643-8890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Responsable / Gerente</label>
                  <input
                    type="text"
                    value={newResponsable}
                    onChange={(e) => setNewResponsable(e.target.value)}
                    placeholder="Carlos Mendoza"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

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
                  Guardar y Afiliar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Editar Comercio</h3>
              <button onClick={() => setShowEditModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMerchant(showEditModal.id, showEditModal);
                setShowEditModal(null);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={showEditModal.nombre}
                  onChange={(e) => setShowEditModal({ ...showEditModal, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Dirección</label>
                <input
                  type="text"
                  value={showEditModal.direccion}
                  onChange={(e) => setShowEditModal({ ...showEditModal, direccion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
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
                <label className="block font-bold text-slate-700 uppercase mb-1">Responsable</label>
                <input
                  type="text"
                  value={showEditModal.responsable}
                  onChange={(e) => setShowEditModal({ ...showEditModal, responsable: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
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
    </div>
  );
};
