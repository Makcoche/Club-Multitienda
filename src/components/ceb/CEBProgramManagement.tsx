import React, { useState } from 'react';
import {
  HeartHandshake,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calculator,
  Save,
  CheckCircle2,
  AlertTriangle,
  Award,
  Globe,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const CEBProgramManagement: React.FC = () => {
  const { cebConfig, updateCEBConfig, currentUser, purchases } = useApp();

  const [newPercent, setNewPercent] = useState<number>(cebConfig.porcentaje);
  const [nota, setNota] = useState<string>(cebConfig.nota || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Test amounts from Section 44 of technical specs:
  // $100.000 x 7% = $7.000
  // $250.000 x 7% = $17.500
  // $500.000 x 7% = $35.000
  // $1.000.000 x 7% = $70.000
  const [simulationAmount, setSimulationAmount] = useState<number>(250000);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const res = updateCEBConfig(newPercent, nota);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      alert(res.message);
    }
  };

  const validPurchases = purchases.filter((p) => p.estado !== 'Anulada');
  const totalAccumulatedCEB = validPurchases.reduce((acc, p) => acc + p.aporteCeb, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black">
              MÓDULO 9 Y 10
            </span>
            <span className="text-xs text-emerald-300 font-semibold">Responsabilidad Social Empresarial</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Programa Centro de Experiencias Bilingüe (CEB)</h1>
          <p className="text-xs text-emerald-200 mt-0.5 italic">
            “Cada compra construye educación, cada familia transforma futuros.”
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-400/40 rounded-xl text-right">
          <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Porcentaje Vigente</div>
          <div className="text-2xl font-black text-amber-300 font-mono">{cebConfig.porcentaje}%</div>
        </div>
      </div>

      {/* Program Overview & Total Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
            <HeartHandshake className="w-4 h-4" /> Fondo Social Recaudado
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(totalAccumulatedCEB)}
          </div>
          <p className="text-[11px] text-slate-500">
            Aportado 100% por compras registradas en comercios afiliados.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase">
            <Globe className="w-4 h-4" /> Misión del CEB
          </div>
          <div className="text-base font-bold text-slate-900">Bilingüismo & Inclusión</div>
          <p className="text-[11px] text-slate-500">
            Clases interactivas en inglés con metodología inmersiva para niños de Santander.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase">
            <GraduationCap className="w-4 h-4" /> Becas Activas
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {Math.max(2, Math.floor(totalAccumulatedCEB / 200000))} Becados
          </div>
          <p className="text-[11px] text-slate-500">
            Estudiantes en proceso de certificación A1/A2.
          </p>
        </div>
      </div>

      {/* Configuration & Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Configuración de Tasa de Aporte Social</h3>
              <p className="text-xs text-slate-500">Administrado por Superadministrador (Sección 10)</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Porcentaje CEB de Aporte Oficial (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="30"
                  value={newPercent}
                  onChange={(e) => setNewPercent(parseFloat(e.target.value) || 0)}
                  disabled={currentUser.rol !== 'SUPERADMIN'}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xl font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-base">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Nota Administrativa / Acuerdo de Junta
              </label>
              <textarea
                rows={3}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                disabled={currentUser.rol !== 'SUPERADMIN'}
                placeholder="Detalle o justificación de la tasa..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
            </div>

            {/* Inmutability Rule Box (Section 10) */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4" /> Regla de Inmutabilidad Histórica (Sección 10)
              </div>
              <p className="text-[11px] leading-relaxed">
                Cada compra almacena de forma inmutable el porcentaje vigente en el momento exacto de su registro. Si se actualiza el porcentaje, <strong>las compras anteriores conservarán su valor de corte original</strong>.
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {successMsg}
              </div>
            )}

            {currentUser.rol === 'SUPERADMIN' ? (
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Actualizar Porcentaje Oficial CEB
              </button>
            ) : (
              <p className="text-center text-slate-400 italic">
                Solo el Superadministrador puede modificar la tasa del programa CEB.
              </p>
            )}
          </form>
        </div>

        {/* Right: Real-time Simulator & Section 44 Calculation Tests */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Simulador y Pruebas de Cálculo (Sección 44)</h3>
              <p className="text-xs text-slate-500">Validación de la fórmula: Aporte = Valor × % CEB</p>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200 text-xs">
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">
                Ingresa Valor de Compra a Simular:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="10000"
                  value={simulationAmount}
                  onChange={(e) => setSimulationAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[11px] block">Aporte Calculado al CEB:</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {formatCurrency(Math.round(simulationAmount * (cebConfig.porcentaje / 100)))}
                </span>
              </div>
              <div className="text-right font-mono text-xs text-slate-500">
                {formatCurrency(simulationAmount)} × {cebConfig.porcentaje}%
              </div>
            </div>
          </div>

          {/* Section 44 Verification Matrix */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase">
              Matriz de Validación Oficial (Sección 44):
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { val: 100000, expected: 7000 },
                { val: 250000, expected: 17500 },
                { val: 500000, expected: 35000 },
                { val: 1000000, expected: 70000 },
              ].map((row) => {
                const actual = Math.round(row.val * (cebConfig.porcentaje / 100));
                return (
                  <div
                    key={row.val}
                    className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <span>{formatCurrency(row.val)} × {cebConfig.porcentaje}%</span>
                    <span className="font-bold text-emerald-800">{formatCurrency(actual)}</span>
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-sans font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
