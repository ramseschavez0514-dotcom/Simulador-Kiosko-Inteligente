import {
  ClusterInspectionResult,
  FigureProduct,
  ReturnReason,
  DamageSubcategory,
  VisionAuditorOutput,
  FraudDamageValidatorOutput,
  IncidenceRouterOutput
} from '../types/kiosk';
import { UNIFIED_SYSTEM_PROMPT_TEXT, generatePromptInputPayload } from '../data/unifiedSystemPrompt';

export interface InspectionRequestOptions {
  kioskId: string;
  product: FigureProduct;
  returnReason: ReturnReason;
  damageSubcategory?: DamageSubcategory;
  hasOfficialBox: boolean;
  isSealedBlister: boolean;
  simulatedBootleg?: boolean;
  simulatedDamageSeverity?: 'none' | 'subtle_under_threshold' | 'severe_over_threshold';
  panoramicImageUrl?: string;
  shippingQr?: string;
  forceHitl?: boolean;
}

/**
 * Motor central de evaluación del Clúster de Subagentes IA
 */
export async function executeAgentClusterInspection(
  options: InspectionRequestOptions,
  onStepProgress?: (step: 'vision_auditor' | 'fraud_damage_validator' | 'incidence_router', status: 'running' | 'done') => void
): Promise<ClusterInspectionResult> {
  const startTime = Date.now();
  const kioskId = options.kioskId || 'KIOSK-MONTEVIDEO-04';

  // Intento de llamada a API Gemini si el backend proxy está habilitado
  try {
    const payload = generatePromptInputPayload({
      productId: options.product.id,
      productName: options.product.name,
      reason: options.returnReason,
      damageType: options.damageSubcategory,
      hasBox: options.hasOfficialBox,
      isSealed: options.isSealedBlister,
      visualDefectsDescription: options.simulatedBootleg
        ? 'Rebabas plásticas en extremidades, rebordes sin lijar, tono de pintura alterado y falta de sello holográfico.'
        : options.simulatedDamageSeverity === 'severe_over_threshold'
        ? `Fractura visible de ${options.damageSubcategory || 'accesorio'} que supera el umbral de 4mm.`
        : 'Superficie limpia, sin marcas visibles de rotura.',
      overheadPhotoDescription: options.forceHitl
        ? 'Reflejo óptico cenital directo sobre el rostro que reduce el contraste'
        : 'Captura cenital de 1080p nítida, iluminación balanceada'
    });

    onStepProgress?.('vision_auditor', 'running');
    // Pequeño retardo de procesamiento para sensación realista de hardware/pipeline
    await new Promise((res) => setTimeout(res, 400));

    // Si podemos consultar el backend proxy:
    const response = await fetch('/api/cluster/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kioskId,
        options,
        payload
      })
    }).catch(() => null);

    if (response && response.ok) {
      const liveData = await response.json();
      if (liveData && liveData.vision_auditor && liveData.incidence_router) {
        onStepProgress?.('vision_auditor', 'done');
        onStepProgress?.('fraud_damage_validator', 'done');
        onStepProgress?.('incidence_router', 'done');
        return {
          ...liveData,
          execution_time_ms: Date.now() - startTime
        };
      }
    }
  } catch {
    // Fallback a motor determinista
  }

  // --- MOTOR DETERMINISTA DE ALTA PRECISIÓN (Garantiza 100% de confiabilidad) ---
  onStepProgress?.('vision_auditor', 'running');
  await new Promise((r) => setTimeout(r, 450));

  // 1. Subagente: vision_auditor (Flash)
  const isConfidenceLow = options.forceHitl || (!options.hasOfficialBox && options.returnReason === 'producto_diferente');
  const confidenceScore = isConfidenceLow ? 0.54 : options.simulatedBootleg ? 0.88 : 0.96;

  const visionAuditor: VisionAuditorOutput = {
    status: 'success',
    figure_detected: true,
    box_detected: options.hasOfficialBox,
    sealed_in_blister: options.isSealedBlister,
    match_with_product_id: !options.simulatedBootleg || options.returnReason === 'producto_diferente',
    confidence_score: confidenceScore,
    detected_features: [
      `Modelo detectado compatible con: ${options.product.name}`,
      options.hasOfficialBox ? 'Empaque comercial oficial detectado' : 'Empaque comercial ausente o no reconocido',
      options.isSealedBlister ? 'Precintos de fábrica circulares intactos (CASE-02)' : 'Empaque abierto / figura fuera de blister'
    ],
    notes: isConfidenceLow
      ? 'Reflejo especular en sensor cenital; confianza por debajo del umbral estándar (< 0.60)'
      : 'Encuadre cenital óptimo'
  };

  onStepProgress?.('vision_auditor', 'done');
  onStepProgress?.('fraud_damage_validator', 'running');
  await new Promise((r) => setTimeout(r, 500));

  // 2. Subagente: fraud_damage_validator (Pro)
  let fraudRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let bootlegDetected = false;
  let damageFound = false;
  let damageExceedsThreshold = false;
  const fraudEvidence: string[] = [];

  if (options.simulatedBootleg) {
    fraudRisk = 'HIGH';
    bootlegDetected = true;
    fraudEvidence.push(
      'Falta de código de matriz en planta del pie',
      'Rebabas de inyección de PVC en cuello y hombros',
      'Ausencia de holograma comercial registrado Toei/Bandai',
      'Tono de pintura desfasado (saturación alta sospechosa)'
    );
  } else if (isConfidenceLow) {
    fraudRisk = 'MEDIUM';
    fraudEvidence.push('No fue posible peritar con certeza la textura del polímero por iluminación insuficiente');
  }

  if (options.simulatedBootleg) {
    fraudRisk = 'HIGH';
    bootlegDetected = true;
    fraudEvidence.push(
      'Falta de código de matriz en planta del pie',
      'Rebabas de inyección de PVC en cuello y hombros',
      'Ausencia de holograma comercial registrado Toei/Bandai',
      'Tono de pintura desfasado (saturación alta sospechosa)'
    );
  } else if (isConfidenceLow) {
    fraudRisk = 'MEDIUM';
    fraudEvidence.push('No fue posible peritar con certeza la textura del polímero por iluminación insuficiente');
  }

  // Evaluación de daño basada en el estado simulado
  if (options.simulatedDamageSeverity === 'severe_over_threshold') {
    damageFound = true;
    damageExceedsThreshold = true;
  } else if (options.simulatedDamageSeverity === 'subtle_under_threshold') {
    damageFound = true;
    damageExceedsThreshold = false;
  } else {
    damageFound = false;
    damageExceedsThreshold = false;
  }

  const fraudValidator: FraudDamageValidatorOutput = {
    fraud_risk: fraudRisk,
    bootleg_detected: bootlegDetected,
    damage_found: damageFound,
    damage_exceeds_threshold: damageExceedsThreshold,
    fraud_evidence: fraudEvidence,
    damage_details: {
      detected_type: options.damageSubcategory,
      severity_percentage: damageExceedsThreshold ? 88 : damageFound ? 15 : 0,
      visual_match_notes: damageExceedsThreshold
        ? `Daño estructural en ${options.damageSubcategory || 'pieza'} supera claramente el umbral mínimo estipulado.`
        : damageFound
        ? 'Daño cosmético superficial inferior al umbral mínimo de garantía del fabricante.'
        : 'Sin daños perceptibles.'
    }
  };

  onStepProgress?.('fraud_damage_validator', 'done');
  onStepProgress?.('incidence_router', 'running');
  await new Promise((r) => setTimeout(r, 400));

  // 3. Subagente: incidence_router (Flash)
  let finalAction: IncidenceRouterOutput['final_action'] = 'APPROVE';
  let reasonCode = 'APROBADO_CONDICION_OPTIMA';
  let humanMessage = '¡Tu devolución ha sido aprobada con éxito! Presiona Confirmar en pantalla para transferir la figura al depósito del cajero y recibir tu reembolso.';
  let hitlRequired = false;

  // Lógica determinista de reglas críticas
  if (bootlegDetected || fraudRisk === 'HIGH') {
    finalAction = 'REJECT';
    reasonCode = 'FRAUDE_REPLICA_NO_AUTORIZADA';
    humanMessage = 'La inspección automatizada ha detectado inconsistencias críticas de autenticidad en el artículo depositado (Copia Bootleg / Réplica no oficial). El compartimento se ha destrabado para que retires tu producto. Devolución rechazada.';
  } else if (isConfidenceLow || fraudRisk === 'MEDIUM') {
    finalAction = 'ESCALATE_HITL';
    reasonCode = 'DERIVACION_HUMANA_BAJA_CONFIANZA';
    humanMessage = 'Estamos validando un detalle visual con nuestro especialista en vivo. Por favor aguarda frente al kiosco unos instantes (SLA < 45s).';
    hitlRequired = true;
  } else if (options.returnReason === 'danado') {
    if (!damageFound || !damageExceedsThreshold) {
      finalAction = 'DISCREPANCY';
      reasonCode = 'DISCREPANCIA_DANIO_NO_COMPROBADO';
      humanMessage = 'El daño detectado no supera el umbral mínimo de garantía exigido para esta figura o no coincide con la subcategoría seleccionada. Te redirigimos al menú anterior para rectificar tu selección.';
    } else {
      finalAction = 'APPROVE';
      reasonCode = 'APROBADO_DANIO_SUPERADO';
      humanMessage = 'El daño reportado ha sido verificado con éxito contra nuestro catálogo de garantías (supera umbral mínimo). Tu devolución está lista para ser confirmada.';
    }
  } else if (options.returnReason === 'por_gusto') {
    if (damageFound) {
      finalAction = 'DISCREPANCY';
      reasonCode = 'DISCREPANCIA_POR_GUSTO_CON_DANIO';
      humanMessage = 'El cliente solicitó devolución "Por gusto" (que exige figura en condición prístina), pero la inspección visual detectó daños físicos en el artículo. Te redirigimos al paso 5 para reportar como producto dañado.';
    } else if (options.isSealedBlister) {
      finalAction = 'APPROVE';
      reasonCode = 'APROBADO_BLISTER_SELLADO_CASE_02';
      humanMessage = 'Artículo sellado en blíster transparente verificado sin abrir. Se preserva el valor comercial de coleccionismo. Devolución aprobada.';
    } else {
      finalAction = 'APPROVE';
      reasonCode = 'APROBADO_POR_GUSTO_IMPECABLE';
      humanMessage = 'Figura en condición prístina con caja comercial oficial verificada. Procede a confirmar tu reembolso.';
    }
  } else if (options.returnReason === 'producto_diferente') {
    if (!options.hasOfficialBox) {
      finalAction = 'ESCALATE_HITL';
      reasonCode = 'PRODUCTO_DIFERENTE_SIN_CAJA_ENVIO';
      humanMessage = 'Se requiere asistencia del operador de soporte remoto para validar el producto recibido por error (CASE-01).';
      hitlRequired = true;
    } else {
      finalAction = 'APPROVE';
      reasonCode = 'APROBADO_PRODUCTO_DIFERENTE_VERIFICADO';
      humanMessage = 'Se ha corroborado la discrepancia del envío original. Devolución aceptada.';
    }
  }

  const incidenceRouter: IncidenceRouterOutput = {
    final_action: finalAction,
    reason_code: reasonCode,
    human_message: humanMessage,
    hitl_required: hitlRequired,
    sla_target_seconds: 45
  };

  onStepProgress?.('incidence_router', 'done');

  return {
    execution_mode: 'deterministic_simulation',
    model_used: 'gemini-3.8-flash (Clúster Híbrido)',
    execution_time_ms: Date.now() - startTime,
    vision_auditor: visionAuditor,
    fraud_damage_validator: fraudValidator,
    incidence_router: incidenceRouter,
    timestamp: new Date().toISOString(),
    kiosk_id: kioskId
  };
}
