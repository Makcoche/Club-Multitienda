import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Users,
  Building2,
  Calendar,
  Trophy,
  Award,
  Filter,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';

type ReportType = 'CLIENTS' | 'MERCHANTS' | 'PERIOD' | 'RANK_CLIENTS' | 'RANK_MERCHANTS';

export const ReportsCenter: React.FC = () => {
  const { clients, merchants, purchases, cebConfig } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType>('CLIENTS');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Valid non-annulled purchases
  const validPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (p.estado === 'Anulada') return false;
      return p.fecha >= startDate && p.fecha <= endDate;
    });
  }, [purchases, startDate, endDate]);

  // Report 1: Compras por Cliente
  const reportClientsData = useMemo(() => {
    return clients.map((client) => {
      const clientPurchases = validPurchases.filter((p) => p.clienteId === client.id);
      const totalAcumulado = clientPurchases.reduce((acc, p) => acc + p.valorCompra, 0);
      const totalCEB = clientPurchases.reduce((acc, p) => acc + p.aporteCeb, 0);

      return {
        id: client.id,
        nombre: client.nombre,
        codigoVip: client.codigoVip,
        documento: client.documento,
        numeroCompras: clientPurchases.length,
        totalAcumulado,
        aporteCEB: totalCEB,
      };
    }).sort((a, b) => b.totalAcumulado - a.totalAcumulado);
  }, [clients, validPurchases]);

  // Report 2: Compras por Comercio
  const reportMerchantsData = useMemo(() => {
    return merchants.map((m) => {
      const merchantPurchases = validPurchases.filter((p) => p.comercioId === m.id);
      const ventas = merchantPurchases.reduce((acc, p) => acc + p.valorCompra, 0);
      const aporteCEB = merchantPurchases.reduce((acc, p) => acc + p.aporteCeb, 0);

      return {
        id: m.id,
        comercio: m.nombre,
        categoria: m.categoria,
        nit: m.nit,
        transacciones: merchantPurchases.length,
        ventas,
        aporteCEB,
      };
    }).sort((a, b) => b.ventas - a.ventas);
  }, [merchants, validPurchases]);

  // Report 3: Ventas por Período
  const reportPeriodData = useMemo(() => {
    const totalVentas = validPurchases.reduce((acc, p) => acc + p.valorCompra, 0);
    const totalCompras = validPurchases.length;
    const clientesUnicos = new Set(validPurchases.map((p) => p.clienteId)).size;
    const totalCEB = validPurchases.reduce((acc, p) => acc + p.aporteCeb, 0);
    const ticketPromedio = totalCompras > 0 ? totalVentas / totalCompras : 0;

    return {
      fechaInicial: startDate,
      fechaFinal: endDate,
      ventas: totalVentas,
      compras: totalCompras,
      clientes: clientesUnicos,
      aporteCEB: totalCEB,
      ticketPromedio,
    };
  }, [validPurchases, startDate, endDate]);

  // Export handler based on active report
  const handleExportCSV = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    if (activeReport === 'CLIENTS') {
      exportToCSV(
        `reporte1_compras_por_cliente_${dateStr}`,
        reportClientsData.map((r) => ({
          Cliente: r.nombre,
          CodigoVIP: r.codigoVip,
          Documento: r.documento,
          NumeroCompras: r.numeroCompras,
          TotalAcumulado: r.totalAcumulado,
          AporteCEB: r.aporteCEB,
        }))
      );
    } else if (activeReport === 'MERCHANTS') {
      exportToCSV(
        `reporte2_compras_por_comercio_${dateStr}`,
        reportMerchantsData.map((r) => ({
          Comercio: r.comercio,
          NIT: r.nit,
          Categoria: r.categoria,
          Transacciones: r.transacciones,
          VentasTotales: r.ventas,
          AporteCEB: r.aporteCEB,
        }))
      );
    } else if (activeReport === 'PERIOD') {
      exportToCSV(`reporte3_ventas_por_periodo_${dateStr}`, [
        {
          FechaInicial: reportPeriodData.fechaInicial,
          FechaFinal: reportPeriodData.fechaFinal,
          Ventas: reportPeriodData.ventas,
          Compras: reportPeriodData.compras,
          ClientesUnicos: reportPeriodData.clientes,
          AporteCEB: reportPeriodData.aporteCEB,
          TicketPromedio: reportPeriodData.ticketPromedio,
        },
      ]);
    } else if (activeReport === 'RANK_CLIENTS') {
      exportToCSV(
        `reporte4_ranking_clientes_${dateStr}`,
        reportClientsData.map((r, idx) => ({
          Posicion: idx + 1,
          Cliente: r.nombre,
          CodigoVIP: r.codigoVip,
          Compras: r.numeroCompras,
          ValorAcumulado: r.totalAcumulado,
          AporteCEB: r.aporteCEB,
        }))
      );
    } else if (activeReport === 'RANK_MERCHANTS') {
      exportToCSV(
        `reporte5_ranking_comercios_${dateStr}`,
        reportMerchantsData.map((r, idx) => ({
          Posicion: idx + 1,
          Comercio: r.comercio,
          NIT: r.nit,
          Ventas: r.ventas,
          Transacciones: r.transacciones,
          AporteCEB: r.aporteCEB,
        }))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
              MÓDULO 27
            </span>
            <span className="text-xs text-slate-500">Club Multitienda S.A.S.</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Centro Oficial de Reportes y Rankings
          </h1>
          <p className="text-xs text-slate-500">
            Los 5 reportes estratégicos para control administrativo, financiero y auditoría social CEB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir Reporte
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Descargar en CSV / Excel
          </button>
        </div>
      </div>

      {/* Date Filter & Tab Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Tabs for 5 reports */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveReport('CLIENTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeReport === 'CLIENTS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Rep 1: Compras por Cliente
          </button>

          <button
            onClick={() => setActiveReport('MERCHANTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeReport === 'MERCHANTS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Rep 2: Compras por Comercio
          </button>

          <button
            onClick={() => setActiveReport('PERIOD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeReport === 'PERIOD'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Rep 3: Ventas por Período
          </button>

          <button
            onClick={() => setActiveReport('RANK_CLIENTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeReport === 'RANK_CLIENTS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Rep 4: Ranking Clientes
          </button>

          <button
            onClick={() => setActiveReport('RANK_MERCHANTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeReport === 'RANK_MERCHANTS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-blue-400" />
            Rep 5: Ranking Comercios
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Período:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
          />
          <span className="text-slate-400">al</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
          />
        </div>
      </div>

      {/* Report 1 View: Compras por Cliente */}
      {activeReport === 'CLIENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Reporte 1 — Compras por Cliente</h3>
              <p className="text-xs text-slate-500">Historial acumulado y contribución individual a la educación</p>
            </div>
            <span className="text-xs font-bold text-slate-700">{reportClientsData.length} Clientes VIP</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Código VIP</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4 text-center">Número de Compras</th>
                  <th className="py-3 px-4 text-right">Total Acumulado</th>
                  <th className="py-3 px-4 text-right">Aporte CEB ({cebConfig.porcentaje}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {reportClientsData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.nombre}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{row.codigoVip}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{row.documento}</td>
                    <td className="py-3 px-4 text-center font-bold">{row.numeroCompras}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(row.totalAcumulado)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(row.aporteCEB)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2 View: Compras por Comercio */}
      {activeReport === 'MERCHANTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Reporte 2 — Compras por Comercio</h3>
              <p className="text-xs text-slate-500">Transacciones comerciales y recaudo CEB por establecimiento</p>
            </div>
            <span className="text-xs font-bold text-slate-700">{reportMerchantsData.length} Comercios</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Comercio</th>
                  <th className="py-3 px-4">NIT</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-center">Transacciones</th>
                  <th className="py-3 px-4 text-right">Ventas Totales</th>
                  <th className="py-3 px-4 text-right">Aporte CEB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {reportMerchantsData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.comercio}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{row.nit}</td>
                    <td className="py-3 px-4 text-slate-500">{row.categoria}</td>
                    <td className="py-3 px-4 text-center font-bold">{row.transacciones}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(row.ventas)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(row.aporteCEB)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3 View: Ventas por Período */}
      {activeReport === 'PERIOD' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Reporte 3 — Ventas por Período</h3>
            <p className="text-xs text-slate-500">Consolidado general del rango de fechas seleccionado</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500">Fecha Inicial</span>
              <div className="font-bold text-sm text-slate-900">{formatDate(reportPeriodData.fechaInicial)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500">Fecha Final</span>
              <div className="font-bold text-sm text-slate-900">{formatDate(reportPeriodData.fechaFinal)}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500">Total Compras</span>
              <div className="font-bold text-sm text-slate-900">{reportPeriodData.compras} transacciones</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500">Clientes Atendidos</span>
              <div className="font-bold text-sm text-slate-900">{reportPeriodData.clientes} clientes VIP</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-900 text-white rounded-xl space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Ventas Totales del Período</span>
              <div className="text-2xl font-black font-mono">{formatCurrency(reportPeriodData.ventas)}</div>
            </div>

            <div className="p-5 bg-emerald-900 text-white rounded-xl space-y-1">
              <span className="text-xs text-emerald-300 font-bold uppercase">Aporte Social CEB Total</span>
              <div className="text-2xl font-black font-mono text-amber-300">
                {formatCurrency(reportPeriodData.aporteCEB)}
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase">Ticket Promedio por Compra</span>
              <div className="text-2xl font-black font-mono text-slate-900">
                {formatCurrency(reportPeriodData.ticketPromedio)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report 4 View: Ranking de Clientes */}
      {activeReport === 'RANK_CLIENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Reporte 4 — Ranking de Clientes VIP</h3>
              <p className="text-xs text-slate-500">Top clientes por valor acumulado y fidelidad comercial</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-center">Posición</th>
                  <th className="py-3 px-4">Cliente VIP</th>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4 text-center">Compras</th>
                  <th className="py-3 px-4 text-right">Valor Acumulado</th>
                  <th className="py-3 px-4 text-right">Aporte Generado al CEB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {reportClientsData.map((client, idx) => (
                  <tr key={client.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{client.nombre}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{client.codigoVip}</td>
                    <td className="py-3 px-4 text-center font-semibold">{client.numeroCompras}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(client.totalAcumulado)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(client.aporteCEB)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 5 View: Ranking de Comercios */}
      {activeReport === 'RANK_MERCHANTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Reporte 5 — Ranking de Comercios Afiliados</h3>
              <p className="text-xs text-slate-500">Top establecimientos por volumen de ventas y aportes CEB</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-center">Posición</th>
                  <th className="py-3 px-4">Comercio</th>
                  <th className="py-3 px-4">NIT</th>
                  <th className="py-3 px-4 text-center">Transacciones</th>
                  <th className="py-3 px-4 text-right">Ventas Totales</th>
                  <th className="py-3 px-4 text-right">Aporte Total al CEB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {reportMerchantsData.map((merchant, idx) => (
                  <tr key={merchant.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{merchant.comercio}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{merchant.nit}</td>
                    <td className="py-3 px-4 text-center font-semibold">{merchant.transacciones}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(merchant.ventas)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(merchant.aporteCEB)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
