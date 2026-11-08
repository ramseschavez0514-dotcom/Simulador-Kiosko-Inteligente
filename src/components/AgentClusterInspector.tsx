import React, { useState } from 'react';
import { 
  ClusterInspectionResult, 
  FigureProduct, 
  ReturnReason, 
  DamageSubcategory, 
  TestScenario 
} from '../types/kiosk';
import { BENCHMARK_SCENARIOS, CATALOG_FIGURES } from '../data/mockCatalog';
import { 
  Eye, 
  ShieldAlert, 
  GitBranch, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Maximize2, 
  FileJson, 
  ZoomIn, 
  Sliders
} from 'lucide-react';
import { playKioskBeep } from '../utils/audio';

interface AgentClusterInspectorProps {
  lastResult: ClusterInspectionResult | null;
  isRunning: boolean;
  onExecuteInspection: (options: {
    kioskId: string;
    product: FigureProduct;
    returnReason: ReturnReason;
    damageSubcategory?: DamageSubcategory;
    hasOfficialBox: boolean;
    isSealedBlister: boolean;
    simulatedBootleg?: boolean;
    simulatedDamageSeverity?: 'none' | 'subtle_under_threshold' | 'severe_over_threshold';
    panoramicImageUrl?: string;
    forceHitl?: boolean;
  }) => Promise<ClusterInspectionResult>;
  onTriggerHitlFromInspector: (result: ClusterInspectionResult) => void;
}

export const AgentClusterInspector: React.FC<AgentClusterInspectorProps> = ({
  lastResult,
  isRunning,
  onExecuteInspection,
  onTriggerHitlFromInspector
}) => {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario>(BENCHMARK_SCENARIOS[0]);
  const [activeJsonTab, setActiveJsonTab] = useState<'auditor' | 'validator' | 'router' | 'all'>('all');
  const [zoomTile, setZoomTile] = useState<number | null>(null);

  // Custom parameters
  const [customProduct, setCustomProduct] = useState<FigureProduct>(CATALOG_FIGURES[0]);
  const [customReason, setCustomReason] = useState<ReturnReason>('por_gusto');
  const [customDamageSubcategory, setCustomDamageSubcategory] = useState<DamageSubcategory>('Rotura / Fisura');
  const [customHasBox, setCustomHasBox] = useState<boolean>(true);
  const [customIsSealed, setCustomIsSealed] = useState<boolean>(false);
  const [customBootleg, setCustomBootleg] = useState<boolean>(false);
  const [customDamageSeverity, setCustomDamageSeverity] = useState<'none' | 'subtle_under_threshold' | 'severe_over_threshold'>('none');
  const [customForceHitl, setCustomForceHitl] = useState<boolean>(false);

  const handleSelectScenario = async (scenario: TestScenario) => {
    playKioskBeep(700, 0.05);
    setSelectedScenario(scenario);
    setCustomProduct(scenario.figure);
    setCustomReason(scenario.returnReason);
    if (scenario.damageSubcategory) setCustomDamageSubcategory(scenario.damageSubcategory);
    setCustomHasBox(scenario.hasOfficialBox);
    setCustomIsSealed(scenario.isSealedBlister);
    setCustomBootleg(scenario.simulatedBootleg);
    setCustomDamageSeverity(scenario.simulatedDamageSeverity);
    setCustomForceHitl(scenario.expectedOutcome === 'ESCALATE_HITL');

    await onExecuteInspection({
      kioskId: 'KIOSK-MONTEVIDEO-04',
      product: scenario.figure,
      returnReason: scenario.returnReason,
      damageSubcategory: scenario.damageSubcategory,
      hasOfficialBox: scenario.hasOfficialBox,
      isSealedBlister: scenario.isSealedBlister,
      simulatedBootleg: scenario.simulatedBootleg,
      simulatedDamageSeverity: scenario.simulatedDamageSeverity,
      forceHitl: scenario.expectedOutcome === 'ESCALATE_HITL',
      panoramicImageUrl: scenario.capturedImageUrl
    });
  };

  const handleRunCustom = async () => {
    playKioskBeep(800, 0.06);
    await onExecuteInspection({
      kioskId: 'KIOSK-MONTEVIDEO-04',
      product: customProduct,
      returnReason: customReason,
      damageSubcategory: customReason === 'danado' ? customDamageSubcategory : undefined,
      hasOfficialBox: customHasBox,
      isSealedBlister: customIsSealed,
      simulatedBootleg: customBootleg,
      simulatedDamageSeverity: customDamageSeverity,
      forceHitl: customForceHitl
    });
  };

  const result = lastResult;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Scenario Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                PASO 10: INSPECCIÓN MULTIMODAL
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-xs text-slate-400">
                Orquestador de 3 Subagentes + Matriz de Peritaje
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Panel de Control y Diagnóstico del Clúster IA
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {result && (
              <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Tiempo:</span>
                <span className="text-cyan-300 font-semibold">{result.execution_time_ms} ms</span>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span className="text-slate-400">Modo:</span>
                <span className="text-emerald-400 font-semibold">{result.execution_mode}</span>
              </div>
            )}
          </div>
        </div>

        {/* 6 Benchmark Presets */}
        <div className="pt-4 space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Escenarios de Prueba Preconfigurados (Pruebas unitarias del clúster):
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {BENCHMARK_SCENARIOS.map((sc) => {
              const isSelected = selectedScenario.id === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className={`p-2.5 rounded-lg text-left border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 ring-1 ring-cyan-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-[11px] truncate">{sc.title.split(':')[0]}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{sc.subtitle}</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">{sc.returnReason}</span>
                    <span
                      className={`font-semibold ${
                        sc.expectedOutcome === 'APPROVE'
                          ? 'text-emerald-400'
                          : sc.expectedOutcome === 'REJECT'
                          ? 'text-rose-400'
                          : sc.expectedOutcome === 'ESCALATE_HITL'
                          ? 'text-amber-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {sc.expectedOutcome}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4-Tile Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Matriz Cuádruple de Comparación Visual
            </h3>
            <p className="text-xs text-slate-400">
              Mapeo de la foto del cajero contra catálogo oficial y umbrales de daño.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">4 Fuentes de Datos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Kiosk Overhead Capture */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
            <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300">1. Foto Cenital Kiosco</span>
              <span className="text-[10px] font-mono text-slate-400">Sensor HD</span>
            </div>
            <div className="h-44 p-2 flex items-center justify-center bg-slate-900/40 relative group">
              <img
                src={selectedScenario.capturedImageUrl || customProduct.officialFigureImage}
                alt="Foto cenital"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setZoomTile(zoomTile === 1 ? null : 1)}
                  className="p-1 rounded bg-black/70 text-white text-xs hover:bg-black"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="px-3 py-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              Bandeja K-04 · Iluminación 850 lux
            </div>
          </div>

          {/* Tile 2: Official Catalog Figure */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
            <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-300">2. Catálogo Oficial (Figura)</span>
              <span className="text-[10px] font-mono text-slate-400">Matriz Oficial</span>
            </div>
            <div className="h-44 p-2 flex items-center justify-center bg-slate-900/40 relative group">
              <img
                src={customProduct.officialFigureImage}
                alt="Catálogo oficial"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="px-3 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 truncate">
              {customProduct.sku} · {customProduct.name}
            </div>
          </div>

          {/* Tile 3: Official Box Image */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
            <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-300">3. Empaque Comercial Oficial</span>
              <span className="text-[10px] font-mono text-slate-400">Holograma</span>
            </div>
            <div className="h-44 p-2 flex items-center justify-center bg-slate-900/40 relative group">
              <img
                src={customProduct.officialBoxImage}
                alt="Caja oficial"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="px-3 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 truncate">
              Diseño de caja oficial registrado
            </div>
          </div>

          {/* Tile 4: Damage Threshold Reference */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
            <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-300">4. Umbral Mínimo de Garantía</span>
              <span className="text-[10px] font-mono text-slate-400">Tolerancia</span>
            </div>
            <div className="h-44 p-2 flex items-center justify-center bg-slate-900/40 relative group">
              <img
                src={customProduct.damageThresholdImage}
                alt="Umbral mínimo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="px-3 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 truncate">
              Límite admisible según política
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Subagents Execution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* SUBAGENT 1: vision_auditor (Flash) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">vision_auditor</h4>
                  <span className="text-[10px] font-mono text-cyan-400">Modelo: Gemini Flash</span>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Auditoría Rápida
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Identifica presencia de figura, empaque oficial, blíster sellado e identidad del modelo.
            </p>

            {result ? (
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Figura detectada:</span>
                  <span className="font-semibold text-emerald-400">
                    {result.vision_auditor.figure_detected ? '✓ SÍ' : '✗ NO'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Caja comercial oficial:</span>
                  <span
                    className={`font-semibold ${
                      result.vision_auditor.box_detected ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.vision_auditor.box_detected ? '✓ DETECTADA' : '✗ AUSENTE'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Sellado en blíster:</span>
                  <span className="font-semibold text-slate-200">
                    {result.vision_auditor.sealed_in_blister ? 'SÍ (CASE-02)' : 'NO (Abierto)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Coincide con Product ID:</span>
                  <span
                    className={`font-semibold ${
                      result.vision_auditor.match_with_product_id ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.vision_auditor.match_with_product_id ? '✓ COINCIDE' : '✗ DISCREPANCIA'}
                  </span>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Índice de Confianza:</span>
                    <span
                      className={`font-mono font-bold ${
                        result.vision_auditor.confidence_score >= 0.60 ? 'text-cyan-300' : 'text-amber-400'
                      }`}
                    >
                      {(result.vision_auditor.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        result.vision_auditor.confidence_score >= 0.60 ? 'bg-cyan-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${result.vision_auditor.confidence_score * 100}%` }}
                    />
                  </div>
                  {result.vision_auditor.confidence_score < 0.60 && (
                    <span className="text-[11px] text-amber-400 mt-1 block">
                      ⚠ Confianza &lt; 0.60: Gatilla derivación obligatoria a HITL (&lt; 45s).
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Selecciona un escenario o ejecuta una inspección.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Regla: No evalúa daños sutiles; describe presencia e identidad del modelo.
          </div>
        </div>

        {/* SUBAGENT 2: fraud_damage_validator (Pro) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">fraud_damage_validator</h4>
                  <span className="text-[10px] font-mono text-purple-400">Modelo: Gemini Pro</span>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Peritaje Experto
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Inspección exhaustiva de rebabas, articulaciones, tonos de pintura y umbrales de daño.
            </p>

            {result ? (
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Riesgo de Fraude:</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                      result.fraud_damage_validator.fraud_risk === 'LOW'
                        ? 'bg-emerald-950 text-emerald-300'
                        : result.fraud_damage_validator.fraud_risk === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-rose-950 text-rose-300 animate-pulse'
                    }`}
                  >
                    {result.fraud_damage_validator.fraud_risk}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Réplica Bootleg detectada:</span>
                  <span
                    className={`font-bold ${
                      result.fraud_damage_validator.bootleg_detected ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.fraud_damage_validator.bootleg_detected ? '⚠ DETECTADA' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Daño físico encontrado:</span>
                  <span className="font-semibold text-slate-200">
                    {result.fraud_damage_validator.damage_found ? 'SÍ' : 'NO (Cero daño)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">¿Supera Umbral de Garantía?:</span>
                  <span
                    className={`font-semibold ${
                      result.fraud_damage_validator.damage_exceeds_threshold
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {result.fraud_damage_validator.damage_exceeds_threshold ? '✓ SUPERA UMBRAL' : 'INSUFICIENTE'}
                  </span>
                </div>

                {result.fraud_damage_validator.fraud_evidence.length > 0 && (
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-900/60 space-y-1">
                    <span className="text-[10px] font-bold text-rose-300 uppercase block">
                      Evidencias de Anomalía:
                    </span>
                    <ul className="text-[11px] text-rose-200 list-disc list-inside space-y-0.5">
                      {result.fraud_damage_validator.fraud_evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Selecciona un escenario o ejecuta una inspección.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Regla: Implacable con bootlegs. Si el cliente declaró "Por gusto", el daño debe ser cero.
          </div>
        </div>

        {/* SUBAGENT 3: incidence_router (Flash) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">incidence_router</h4>
                  <span className="text-[10px] font-mono text-cyan-400">Modelo: Gemini Flash</span>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Supervisor Final
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Sintetiza determinismo + peritaje IA para ordenar la acción electromecánica del cajero.
            </p>

            {result ? (
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Acción Final Kiosco:</span>
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-1 rounded ${
                        result.incidence_router.final_action === 'APPROVE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : result.incidence_router.final_action === 'REJECT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : result.incidence_router.final_action === 'ESCALATE_HITL'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {result.incidence_router.final_action}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Código: {result.incidence_router.reason_code}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                    Mensaje al Cliente en Pantalla:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "{result.incidence_router.human_message}"
                  </p>
                </div>

                {result.incidence_router.final_action === 'ESCALATE_HITL' && (
                  <button
                    onClick={() => onTriggerHitlFromInspector(result)}
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Ver Ticket Activo en Soporte HITL (&lt; 45s)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                Selecciona un escenario o ejecuta una inspección.
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>SLA Objetivo: &lt; 45s</span>
            <span>Protocolo HITL Activo</span>
          </div>
        </div>
      </div>

      {/* Raw JSON Contracts & Schema Inspector */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Contratos JSON Estrictos de Salida</h3>
              <span className="text-xs text-slate-500">
                (Salida pura requerida sin texto libre)
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['all', 'auditor', 'validator', 'router'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveJsonTab(tab)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    activeJsonTab === tab
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto border border-slate-800/80 max-h-72">
            {JSON.stringify(
              activeJsonTab === 'auditor'
                ? result.vision_auditor
                : activeJsonTab === 'validator'
                ? result.fraud_damage_validator
                : activeJsonTab === 'router'
                ? result.incidence_router
                : {
                    vision_auditor: result.vision_auditor,
                    fraud_damage_validator: result.fraud_damage_validator,
                    incidence_router: result.incidence_router
                  },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* Custom Parameter Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Configurador Personalizado de Peritaje</h3>
          </div>
          <button
            onClick={handleRunCustom}
            disabled={isRunning}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ejecutar Clúster IA con Parámetros</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Figura a peritar:</label>
            <select
              value={customProduct.id}
              onChange={(e) => {
                const found = CATALOG_FIGURES.find((f) => f.id === e.target.value);
                if (found) setCustomProduct(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            >
              {CATALOG_FIGURES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Motivo declarado:</label>
            <select
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value as ReturnReason)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            >
              <option value="por_gusto">Por gusto</option>
              <option value="danado">Dañado</option>
              <option value="producto_diferente">Producto diferente</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Estado de figura simulado (1 de 4):</label>
            <select
              value={
                customBootleg
                  ? 'bootleg'
                  : customDamageSeverity === 'severe_over_threshold'
                  ? 'severe_over_threshold'
                  : customDamageSeverity === 'subtle_under_threshold'
                  ? 'subtle_under_threshold'
                  : 'none'
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'bootleg') {
                  setCustomBootleg(true);
                  setCustomDamageSeverity('none');
                } else if (val === 'severe_over_threshold') {
                  setCustomBootleg(false);
                  setCustomDamageSeverity('severe_over_threshold');
                  if (customReason !== 'danado') setCustomReason('danado');
                } else if (val === 'subtle_under_threshold') {
                  setCustomBootleg(false);
                  setCustomDamageSeverity('subtle_under_threshold');
                  if (customReason !== 'danado') setCustomReason('danado');
                } else {
                  setCustomBootleg(false);
                  setCustomDamageSeverity('none');
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            >
              <option value="none">1. Producto intacto (Sin daños)</option>
              <option value="severe_over_threshold">2. Producto dañado que cumple con el umbral (≥ 4mm)</option>
              <option value="subtle_under_threshold">3. Producto dañado que no cumple con el umbral (&lt; 2mm)</option>
              <option value="bootleg">4. El producto pirata (Bootleg / Réplica no oficial)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end space-y-1.5">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={customHasBox}
                onChange={(e) => setCustomHasBox(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600"
              />
              <span>Caja oficial presente</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={customForceHitl}
                onChange={(e) => setCustomForceHitl(e.target.checked)}
                className="rounded border-slate-700 text-amber-500"
              />
              <span className="text-amber-300">Simular baja confianza (&lt; 0.60)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
