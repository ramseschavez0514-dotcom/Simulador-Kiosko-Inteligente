import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';

export const ArchitectureDocsModal: React.FC = () => {
  const [activeDocSection, setActiveDocSection] = useState<'flow' | 'subagents' | 'edgecases' | 'privacy'>('flow');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              ESPECIFICACIÓN TÉCNICA RET-FIG-001 v2.4.0
            </span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Arquitectura de Devolución de Figuras de Acción en Kioscos
          </h2>
          <p className="text-xs text-slate-400">
            Diagrama de los 15 pasos, actores del sistema, reglas críticas de negocio y límites operativos.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveDocSection('flow')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeDocSection === 'flow' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flujo 15 Pasos
          </button>
          <button
            onClick={() => setActiveDocSection('subagents')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeDocSection === 'subagents' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Subagentes IA
          </button>
          <button
            onClick={() => setActiveDocSection('edgecases')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeDocSection === 'edgecases' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Casos Borde (01-03)
          </button>
          <button
            onClick={() => setActiveDocSection('privacy')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeDocSection === 'privacy' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Límites & Ley 18.331
          </button>
        </div>
      </div>

      {/* SECTION 1: 15 STEPS FLOW */}
      {activeDocSection === 'flow' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Matriz de los 15 Pasos del Proceso (RET-FIG-001)</h3>
            <p className="text-xs text-slate-400">
              Tiempo medio de ejecución: 3 a 5 min · Timeout SLA HITL: 45s
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              { step: 1, name: 'Ingreso de credenciales', actor: 'CUSTOMER', type: 'Determinista', desc: 'Email y contraseña en pantalla táctil.' },
              { step: 2, name: 'Autenticación central', actor: 'CORE_SYSTEM', type: 'Determinista', desc: 'Valida token y sesión de usuario.' },
              { step: 3, name: 'Listado de elegibles', actor: 'CORE_SYSTEM', type: 'Determinista', desc: 'Pedidos dentro del plazo de 30 días.' },
              { step: 4, name: 'Selección de artículo', actor: 'CUSTOMER', type: 'Determinista', desc: 'Bloquea y asocia ID del producto.' },
              { step: 5, name: 'Registro de motivo', actor: 'CUSTOMER', type: 'Determinista', desc: 'Por gusto / Dañado (subcategoría) / Prod. Diferente.' },
              { step: 6, name: 'Escaneo QR de paquete', actor: 'CUSTOMER', type: 'Condicional', desc: 'Solo para motivo "Producto diferente".' },
              { step: 7, name: 'Selección de reembolso', actor: 'CUSTOMER', type: 'Determinista', desc: 'Cupón inmediato (+ $5) o reintegro bancario.' },
              { step: 8, name: 'Depósito y captura cenital', actor: 'CUSTOMER/HARDWARE', type: 'Hardware', desc: 'Figura y empaque lado a lado; foto cenital 1080p.' },
              { step: 9, name: 'Control de calidad visual', actor: 'CUSTOMER', type: 'Algorítmico', desc: 'Cliente confirma nitidez o reintenta toma.' },
              { step: 10, name: 'Inspección en Panel (IA)', actor: 'AI AGENTS / SUPPORT', type: 'Multimodal', desc: 'Ejecución del clúster de 3 subagentes y HITL.' },
              { step: 11, name: 'Ruta Rechazo', actor: 'KIOSK', type: 'Determinista', desc: 'Destrabe compuerta y fin sin reembolso.' },
              { step: 12, name: 'Solicitud confirmación', actor: 'KIOSK', type: 'Determinista', desc: 'Pregunta final: Confirmar o Cancelar.' },
              { step: 13, name: 'Decisión cliente', actor: 'CUSTOMER', type: 'Determinista', desc: 'Confirmación final de entrega.' },
              { step: 14, name: 'Retención electromecánica', actor: 'KIOSK', type: 'Hardware', desc: 'Bóveda traga figura y empaque; traba compuerta.' },
              { step: 15, name: 'Notificación y reembolso', actor: 'CORE_SYSTEM', type: 'Determinista', desc: 'Emisión de cupón/transferencia y comprobante legal.' },
            ].map((s) => (
              <div
                key={s.step}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-cyan-400 font-bold">PASO {s.step}</span>
                  <span className="text-slate-400">{s.actor}</span>
                </div>
                <div className="font-semibold text-white text-xs">{s.name}</div>
                <p className="text-[11px] text-slate-400">{s.desc}</p>
                <div className="text-[10px] font-mono text-indigo-400 pt-1">
                  Tipo: {s.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: SUBAGENTS SPEC */}
      {activeDocSection === 'subagents' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-cyan-300">1. vision_auditor</h4>
              <span className="text-[10px] font-mono text-cyan-400">Gemini Flash</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Auditor rápido de reconocimiento visual. Identifica qué figura y qué caja están presentes en la fotografía, comparando con la base de datos de catálogo.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <strong>Herramientas:</strong> query_catalogue_db, extract_box_features.<br />
              <strong>Regla HITL:</strong> Si confidence_score &lt; 0.60, marca derivación humana inmediata.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-purple-300">2. fraud_damage_validator</h4>
              <span className="text-[10px] font-mono text-purple-400">Gemini Pro</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Perito experto en figuras de colección. Verifica que no haya cambiazos por copias chinas (bootlegs) e inspecciona si los daños declarados superan el umbral mínimo aceptable de garantía.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <strong>Herramientas:</strong> get_damage_thresholds, run_bootleg_heuristics.<br />
              <strong>Regla:</strong> Si el cliente declaró "Por gusto", el daño debe ser cero.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-indigo-300">3. incidence_router</h4>
              <span className="text-[10px] font-mono text-indigo-400">Gemini Flash</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Orquestador y supervisor. Sintetiza los JSON del auditor y validador con la sesión del cliente y emite la orden física final a los motores del cajero.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <strong>Acciones:</strong> APPROVE, REJECT, REQUEST_NEW_ANGLE, DISCREPANCY, ESCALATE_HITL.<br />
              <strong>SLA:</strong> Invoca trigger_hitl(kiosk_id, reason) garantizando respuesta &lt; 45s.
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: OPERATIONAL EDGE CASES */}
      {activeDocSection === 'edgecases' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>CASE-01: Pérdida de caja de envío</span>
            </div>
            <h4 className="text-sm font-bold text-white">Reclamo "Producto diferente" sin caja original de flete</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Punto de fricción:</strong> El paso 6 exige escanear el código QR que venía pegado en la caja de cartón de flete que el cliente arrojó a la basura.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
              <strong>Workaround operativo:</strong> El cliente cancela en la terminal y soporte genera una etiqueta de devolución postal externa manual.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>CASE-02: Figura sellada de fábrica</span>
            </div>
            <h4 className="text-sm font-bold text-white">Devolución "Por gusto" con precintos intactos</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Punto de fricción:</strong> El paso 8 pide colocar figura y empaque lado a lado, lo que rompería precintos de fábrica destruyendo el valor coleccionable.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
              <strong>Workaround operativo:</strong> El agente o subagente aprueba en el paso 10 si el blíster transparente permite verificar la integridad sin abrirlo.
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>CASE-03: Cambiazo por Réplica China (Bootleg)</span>
            </div>
            <h4 className="text-sm font-bold text-white">Copia con molde similar pero plástico barato</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Punto de fricción:</strong> La cámara cenital no evalúa peso en gramos ni la textura microscópica del polímero si el molde es visualmente similar.
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
              <strong>Workaround operativo:</strong> El subagente analiza sellos holográficos y rebabas; si hay duda razonable se deriva a HITL o se delega peritaje final al centro de distribución.
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PRIVACY & SYSTEM LIMITS */}
      {activeDocSection === 'privacy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Límites Estrictos y Marco Regulatorio</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Ley 18.331 de Protección de Datos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                🚫 Prohibición de Rostros y Biometría
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Cumplimiento irrestricto de la <strong>Ley 18.331</strong>. La cámara cenital está calibrada mecánicamente con ángulo exclusivamente dirigido al fondo de la bandeja interna. Está estrictamente prohibido capturar, almacenar o procesar rostros de clientes, huellas dactilares o datos biométricos.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                🔒 Archivos de Hardware Protegidos
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Los módulos de control de motores físicos y criptografía central (<span className="font-mono text-rose-400">/src/hardware/motors.py</span> y <span className="font-mono text-rose-400">/src/auth/crypto.py</span>) están protegidos a nivel de permisos de sistema operativo y no deben ser modificados bajo ninguna circunstancia.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
