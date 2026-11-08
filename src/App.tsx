import React, { useState } from 'react';
import { 
  AppTab, 
  NavigationHeader 
} from './components/NavigationHeader';
import { KioskTerminal } from './components/KioskTerminal';
import { AgentClusterInspector } from './components/AgentClusterInspector';
import { HITLSupportConsole } from './components/HITLSupportConsole';
import { UnifiedPromptArtifactViewer } from './components/UnifiedPromptArtifactViewer';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { 
  ClusterInspectionResult, 
  CustomerOrder, 
  DamageSubcategory, 
  FigureProduct, 
  HITLTicket, 
  ReturnReason 
} from './types/kiosk';
import { executeAgentClusterInspection } from './services/agentClusterEngine';
import { BENCHMARK_SCENARIOS, MOCK_USERS } from './data/mockCatalog';
import { playKioskBeep, playUrgentHitlAlarm } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('kiosk');
  const [doorLocked, setDoorLocked] = useState<boolean>(true);
  const [lastInspectionResult, setLastInspectionResult] = useState<ClusterInspectionResult | null>(null);
  const [isInspectionRunning, setIsInspectionRunning] = useState<boolean>(false);

  // Initial HITL tickets queue
  const [hitlTickets, setHitlTickets] = useState<HITLTicket[]>([
    {
      ticketId: 'HITL-8910',
      kioskId: 'KIOSK-MONTEVIDEO-04',
      createdAt: Date.now() - 12000,
      expiresAt: Date.now() + 33000,
      remainingSeconds: 33,
      status: 'PENDING',
      triggerReason: 'Confianza de vision_auditor = 0.54 (< 0.60). Reflejos ópticos en sensor cenital.',
      order: MOCK_USERS[0].orders[0],
      claimedReason: 'producto_diferente',
      panoramicCaptureUrl: BENCHMARK_SCENARIOS[5].capturedImageUrl,
      inspectionResult: {
        execution_mode: 'deterministic_simulation',
        model_used: 'gemini-3.8-flash (Clúster Híbrido)',
        execution_time_ms: 380,
        timestamp: new Date().toISOString(),
        kiosk_id: 'KIOSK-MONTEVIDEO-04',
        vision_auditor: {
          status: 'success',
          figure_detected: true,
          box_detected: false,
          sealed_in_blister: false,
          match_with_product_id: true,
          confidence_score: 0.54,
          detected_features: ['reflejo_especular', 'caja_comercial_ausente'],
          notes: 'Reflejo en sensor cenital; confianza por debajo del umbral estándar (< 0.60)'
        },
        fraud_damage_validator: {
          fraud_risk: 'MEDIUM',
          bootleg_detected: false,
          damage_found: false,
          damage_exceeds_threshold: false,
          fraud_evidence: ['Reflejo impide peritaje de sellos con certeza'],
          damage_details: {
            detected_type: undefined,
            severity_percentage: 0,
            visual_match_notes: 'Requiere revisión ocular humana'
          }
        },
        incidence_router: {
          final_action: 'ESCALATE_HITL',
          reason_code: 'DERIVACION_HUMANA_BAJA_CONFIANZA',
          human_message: 'Estamos validando un detalle visual con nuestro especialista en vivo. Por favor aguarda frente al kiosco unos instantes (SLA < 45s).',
          hitl_required: true,
          sla_target_seconds: 45
        }
      }
    }
  ]);

  // Handler for running Step 10 inspection from Kiosk or Inspector
  const handleRunInspection = async (options: {
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
  }): Promise<ClusterInspectionResult> => {
    setIsInspectionRunning(true);
    try {
      const result = await executeAgentClusterInspection(options);
      setLastInspectionResult(result);
      setIsInspectionRunning(false);

      // If action is ESCALATE_HITL, spawn or update ticket
      if (result.incidence_router.final_action === 'ESCALATE_HITL') {
        const dummyOrder: CustomerOrder = {
          orderId: 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          purchaseDate: '2026-09-20',
          deliveryDate: '2026-09-24',
          eligibleUntil: '2026-10-24',
          product: options.product,
          shippingQrCode: 'PKG-RET-QR-' + Math.random().toString(36).substring(2, 8).toUpperCase()
        };
        handleEscalateToHitl(result, dummyOrder, options.returnReason, options.damageSubcategory);
      }

      return result;
    } catch (err) {
      setIsInspectionRunning(false);
      throw err;
    }
  };

  // Handler when Kiosk or Cluster escalates to HITL
  const handleEscalateToHitl = (
    inspection: ClusterInspectionResult,
    order: CustomerOrder,
    reason: ReturnReason,
    damageSub?: DamageSubcategory
  ) => {
    playUrgentHitlAlarm();
    const newTicket: HITLTicket = {
      ticketId: 'HITL-' + Math.floor(1000 + Math.random() * 9000),
      kioskId: inspection.kiosk_id,
      createdAt: Date.now(),
      expiresAt: Date.now() + 45000,
      remainingSeconds: 45,
      status: 'PENDING',
      triggerReason: inspection.incidence_router.reason_code + ' - ' + (inspection.vision_auditor.notes || 'Revisión obligatoria'),
      order,
      claimedReason: reason,
      claimedDamageSubcategory: damageSub,
      panoramicCaptureUrl: order.product.officialFigureImage,
      inspectionResult: inspection
    };

    setHitlTickets((prev) => [newTicket, ...prev]);
  };

  // Handler for Human Operator resolution
  const handleResolveTicket = (
    ticketId: string,
    resolution: 'APPROVE' | 'REJECT' | 'REQUEST_NEW_ANGLE' | 'RETURNED_TO_STEP_5',
    notes: string
  ) => {
    playKioskBeep(900, 0.08);
    setHitlTickets((prev) =>
      prev.map((t) => {
        if (t.ticketId === ticketId) {
          const statusKey =
            resolution === 'APPROVE'
              ? 'RESOLVED_APPROVED'
              : resolution === 'REJECT'
              ? 'RESOLVED_REJECTED'
              : resolution === 'REQUEST_NEW_ANGLE'
              ? 'REQUESTED_NEW_ANGLE'
              : 'RETURNED_TO_STEP_5';
          return {
            ...t,
            status: statusKey,
            resolutionNotes: notes,
            remainingSeconds: 0
          };
        }
        return t;
      })
    );
  };

  const pendingHitlCount = hitlTickets.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Universal Top Header */}
      <NavigationHeader
        currentTab={currentTab}
        onTabChange={(tab) => {
          playKioskBeep(750, 0.04);
          setCurrentTab(tab);
        }}
        hitlPendingCount={pendingHitlCount}
        doorLocked={doorLocked}
        activeKioskId="KIOSK-MONTEVIDEO-04"
      />

      {/* Main Tab View Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {currentTab === 'kiosk' && (
          <KioskTerminal
            onRunStep10Inspection={handleRunInspection}
            onEscalateToHitl={handleEscalateToHitl}
            onViewClusterTab={() => setCurrentTab('cluster')}
            doorLocked={doorLocked}
            setDoorLocked={setDoorLocked}
          />
        )}

        {currentTab === 'cluster' && (
          <AgentClusterInspector
            lastResult={lastInspectionResult}
            isRunning={isInspectionRunning}
            onExecuteInspection={handleRunInspection}
            onTriggerHitlFromInspector={() => setCurrentTab('hitl')}
          />
        )}

        {currentTab === 'hitl' && (
          <HITLSupportConsole
            tickets={hitlTickets}
            onResolveTicket={handleResolveTicket}
            doorLocked={doorLocked}
          />
        )}

        {currentTab === 'artifact' && <UnifiedPromptArtifactViewer />}

        {currentTab === 'docs' && <ArchitectureDocsModal />}
      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400">RET-FIG-001</span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span>Sistema Autónomo de Devolución de Figuras de Colección</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span>Subagentes: vision_auditor (Flash) · fraud_damage_validator (Pro) · incidence_router (Flash)</span>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <span>Ley 18.331 OK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
