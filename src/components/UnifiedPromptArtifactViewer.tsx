import React, { useState } from 'react';
import { UNIFIED_SYSTEM_PROMPT_TEXT, generatePromptInputPayload } from '../data/unifiedSystemPrompt';
import { BENCHMARK_SCENARIOS } from '../data/mockCatalog';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Cpu, 
  Terminal, 
  Play, 
  RefreshCw 
} from 'lucide-react';
import { playKioskBeep } from '../utils/audio';

export const UnifiedPromptArtifactViewer: React.FC = () => {
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [simulatedExecutionRunning, setSimulatedExecutionRunning] = useState<boolean>(false);
  const [simulatedOutput, setSimulatedOutput] = useState<string | null>(null);

  const scenario = BENCHMARK_SCENARIOS[selectedScenarioIndex];

  const samplePayload = generatePromptInputPayload({
    productId: scenario.figure.id,
    productName: scenario.figure.name,
    reason: scenario.returnReason,
    damageType: scenario.damageSubcategory,
    hasBox: scenario.hasOfficialBox,
    isSealed: scenario.isSealedBlister,
    visualDefectsDescription: scenario.simulatedBootleg
      ? 'Rebabas plásticas en extremidades, rebordes sin lijar, tono de pintura alterado y falta de sello holográfico.'
      : scenario.simulatedDamageSeverity === 'severe_over_threshold'
      ? `Fractura visible en ${scenario.damageSubcategory || 'pieza'} que supera el umbral de 4mm.`
      : 'Superficie limpia, sin marcas visibles de rotura.',
    overheadPhotoDescription: scenario.expectedOutcome === 'ESCALATE_HITL'
      ? 'Reflejo óptico cenital directo sobre el rostro que reduce el contraste'
      : 'Captura cenital de 1080p nítida, iluminación balanceada'
  });

  const handleCopyPrompt = () => {
    playKioskBeep(800, 0.05);
    navigator.clipboard.writeText(UNIFIED_SYSTEM_PROMPT_TEXT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyPayload = () => {
    playKioskBeep(800, 0.05);
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleTestInSimulator = () => {
    playKioskBeep(900, 0.08);
    setSimulatedExecutionRunning(true);
    setSimulatedOutput(null);

    setTimeout(() => {
      setSimulatedExecutionRunning(false);
      let outputObj;

      if (scenario.simulatedBootleg) {
        outputObj = {
          vision_auditor: {
            status: "success",
            figure_detected: true,
            box_detected: true,
            sealed_in_blister: false,
            match_with_product_id: false,
            confidence_score: 0.88,
            detected_features: ["inconsistencia_matriz", "sin_holograma_toei"]
          },
          fraud_damage_validator: {
            fraud_risk: "HIGH",
            bootleg_detected: true,
            damage_found: false,
            damage_exceeds_threshold: false,
            fraud_evidence: [
              "Falta de código de matriz en planta del pie",
              "Rebabas de inyección de PVC en cuello y hombros",
              "Ausencia de holograma comercial registrado Toei/Bandai",
              "Tono de pintura desfasado (saturación alta sospechosa)"
            ],
            damage_details: {
              detected_type: null,
              severity_percentage: 0,
              visual_match_notes: "Artículo apócrifo (réplica bootleg)."
            }
          },
          incidence_router: {
            final_action: "REJECT",
            reason_code: "FRAUDE_REPLICA_BOOTLEG_DETECTADA",
            human_message: "La inspección automatizada ha detectado inconsistencias críticas de autenticidad en el artículo depositado. El compartimento se ha destrabado para que retires tu producto. Devolución rechazada.",
            hitl_required: false,
            sla_target_seconds: 45
          }
        };
      } else if (scenario.expectedOutcome === 'ESCALATE_HITL') {
        outputObj = {
          vision_auditor: {
            status: "success",
            figure_detected: true,
            box_detected: false,
            sealed_in_blister: false,
            match_with_product_id: true,
            confidence_score: 0.54,
            detected_features: ["reflejo_especular", "caja_ausente"]
          },
          fraud_damage_validator: {
            fraud_risk: "MEDIUM",
            bootleg_detected: false,
            damage_found: false,
            damage_exceeds_threshold: false,
            fraud_evidence: ["Ambigüedad por reflejos en sensor cenital"],
            damage_details: {
              detected_type: null,
              severity_percentage: 0,
              visual_match_notes: "Se requiere confirmación ocular humana."
            }
          },
          incidence_router: {
            final_action: "ESCALATE_HITL",
            reason_code: "DERIVACION_HITL_CONFIANZA_BAJA",
            human_message: "Estamos validando un detalle visual con nuestro especialista en vivo. Por favor aguarda frente al kiosco unos instantes (SLA < 45s).",
            hitl_required: true,
            sla_target_seconds: 45
          }
        };
      } else if (scenario.simulatedDamageSeverity === 'severe_over_threshold') {
        outputObj = {
          vision_auditor: {
            status: "success",
            figure_detected: true,
            box_detected: true,
            sealed_in_blister: false,
            match_with_product_id: true,
            confidence_score: 0.96,
            detected_features: ["figura_oficial_tanjiro", "caja_comercial_presente"]
          },
          fraud_damage_validator: {
            fraud_risk: "LOW",
            bootleg_detected: false,
            damage_found: true,
            damage_exceeds_threshold: true,
            fraud_evidence: [],
            damage_details: {
              detected_type: "Rotura / Fisura",
              severity_percentage: 88,
              visual_match_notes: "Fractura de hoja Nichirin supera ampliamente el umbral de 4mm."
            }
          },
          incidence_router: {
            final_action: "APPROVE",
            reason_code: "APROBADO_DANIO_SUPERADO",
            human_message: "El daño reportado ha sido verificado con éxito contra nuestro catálogo de garantías. Tu devolución está lista para ser confirmada.",
            hitl_required: false,
            sla_target_seconds: 45
          }
        };
      } else {
        outputObj = {
          vision_auditor: {
            status: "success",
            figure_detected: true,
            box_detected: true,
            sealed_in_blister: scenario.isSealedBlister,
            match_with_product_id: true,
            confidence_score: 0.98,
            detected_features: ["esculpido_oficial", "empaque_original_presente"]
          },
          fraud_damage_validator: {
            fraud_risk: "LOW",
            bootleg_detected: false,
            damage_found: false,
            damage_exceeds_threshold: false,
            fraud_evidence: [],
            damage_details: {
              detected_type: null,
              severity_percentage: 0,
              visual_match_notes: scenario.isSealedBlister
                ? "Verificado en blíster sellado de fábrica (CASE-02)."
                : "Figura en condición prístina."
            }
          },
          incidence_router: {
            final_action: "APPROVE",
            reason_code: scenario.isSealedBlister
              ? "APROBADO_BLISTER_SELLADO_CASE_02"
              : "APROBADO_POR_GUSTO_IMPECABLE",
            human_message: "¡Tu devolución ha sido aprobada con éxito! Presiona Confirmar en pantalla para transferir la figura al depósito del cajero y recibir tu reembolso.",
            hitl_required: false,
            sla_target_seconds: 45
          }
        };
      }

      setSimulatedOutput(JSON.stringify(outputObj, null, 2));
    }, 600);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/80">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Artefacto Oficial: System Prompt Unificado (Gemini)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                Single-Pass Cluster
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Diseñado específicamente para simular todo el clúster de agentes en un solo paso dentro de Google AI Studio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPrompt}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-md transition-all"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>¡Copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar System Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guide to Run in Google AI Studio */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-cyan-300">
          <Sparkles className="w-4 h-4" />
          <span>Instrucciones para correr en Google AI Studio (Gemini):</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
          <li>Copia el <span className="text-indigo-300 font-mono">System Prompt</span> a continuación y pégalo en la sección <strong>System Instructions</strong> en Google AI Studio.</li>
          <li>Selecciona el modelo <strong>gemini-3.8-flash</strong> (o <strong>gemini-3.1-pro-preview</strong>).</li>
          <li>En los ajustes de salida, activa <strong>JSON Mode</strong> (<span className="font-mono text-cyan-400">responseMimeType: application/json</span>).</li>
          <li>En el mensaje de usuario, envía el objeto de entrada JSON (puedes generar uno abajo en la sección de pruebas).</li>
          <li>El modelo retornará en una sola pasada el objeto unificado con las 3 subevaluaciones y la decisión final del kiosco.</li>
        </ol>
      </div>

      {/* Two Columns: Prompt text vs Interactive Payload Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: System Prompt Raw Markdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Contenido del Artefacto (Markdown / Instrucciones)
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {UNIFIED_SYSTEM_PROMPT_TEXT.length} caracteres
            </span>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[500px] border border-slate-800/80 whitespace-pre-wrap leading-relaxed select-all">
            {UNIFIED_SYSTEM_PROMPT_TEXT}
          </div>
        </div>

        {/* Right: Payload Generator & Single-Pass Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Generador de Payload de Entrada & Prueba en 1 Paso
            </span>
            <button
              onClick={handleCopyPayload}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {copiedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPayload ? 'Copiado' : 'Copiar Payload'}</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-400">Seleccionar escenario para generar entrada:</label>
            <select
              value={selectedScenarioIndex}
              onChange={(e) => {
                setSelectedScenarioIndex(Number(e.target.value));
                setSimulatedOutput(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            >
              {BENCHMARK_SCENARIOS.map((sc, idx) => (
                <option key={sc.id} value={idx}>
                  {sc.title} ({sc.expectedOutcome})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              JSON de Entrada enviado a Gemini:
            </span>
            <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto border border-slate-800/80 max-h-40">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>

          <div>
            <button
              onClick={handleTestInSimulator}
              disabled={simulatedExecutionRunning}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              {simulatedExecutionRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando inferencia unificada en 1 paso...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Simular Ejecución en 1 Paso de este Payload</span>
                </>
              )}
            </button>
          </div>

          {simulatedOutput && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-emerald-400 block">
                Salida JSON devuelta por el Prompt Unificado:
              </span>
              <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-emerald-900/60 max-h-56">
                {simulatedOutput}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
