export type ReturnReason = 'por_gusto' | 'danado' | 'producto_diferente';

export type DamageSubcategory =
  | 'Rotura / Fisura'
  | 'Golpe / Deformación'
  | 'Rayón o pintura desprendida'
  | 'Pieza faltante o desprendida visible';

export type RefundMethod = 'store_voucher' | 'bank_transfer';

export interface FigureProduct {
  id: string;
  name: string;
  series: string;
  manufacturer: string;
  sku: string;
  originalPrice: number;
  officialFigureImage: string;
  officialBoxImage: string;
  damageThresholdImage: string;
  description: string;
  authenticityMarkers: string[];
}

export interface CustomerOrder {
  orderId: string;
  purchaseDate: string;
  deliveryDate: string;
  eligibleUntil: string;
  product: FigureProduct;
  shippingQrCode: string;
}

export interface CustomerUser {
  userId: string;
  fullName: string;
  maskedEmail: string;
  maskedPhone: string;
  orders: CustomerOrder[];
}

export interface VisionAuditorOutput {
  status: 'success' | 'error';
  figure_detected: boolean;
  box_detected: boolean;
  sealed_in_blister: boolean;
  match_with_product_id: boolean;
  confidence_score: number;
  detected_features?: string[];
  notes?: string;
}

export interface FraudDamageValidatorOutput {
  fraud_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  bootleg_detected: boolean;
  damage_found: boolean;
  damage_exceeds_threshold: boolean;
  fraud_evidence: string[];
  damage_details?: {
    detected_type?: DamageSubcategory;
    severity_percentage?: number;
    visual_match_notes?: string;
  };
}

export type FinalAction =
  | 'APPROVE'
  | 'REJECT'
  | 'REQUEST_NEW_ANGLE'
  | 'DISCREPANCY'
  | 'ESCALATE_HITL';

export interface IncidenceRouterOutput {
  final_action: FinalAction;
  reason_code: string;
  human_message: string;
  hitl_required: boolean;
  sla_target_seconds: number;
}

export interface ClusterInspectionResult {
  execution_mode: 'gemini_live' | 'deterministic_simulation';
  model_used: string;
  execution_time_ms: number;
  vision_auditor: VisionAuditorOutput;
  fraud_damage_validator: FraudDamageValidatorOutput;
  incidence_router: IncidenceRouterOutput;
  timestamp: string;
  kiosk_id: string;
}

export interface HITLTicket {
  ticketId: string;
  kioskId: string;
  createdAt: number;
  expiresAt: number;
  remainingSeconds: number;
  status: 'PENDING' | 'RESOLVED_APPROVED' | 'RESOLVED_REJECTED' | 'REQUESTED_NEW_ANGLE' | 'RETURNED_TO_STEP_5';
  triggerReason: string;
  order: CustomerOrder;
  claimedReason: ReturnReason;
  claimedDamageSubcategory?: DamageSubcategory;
  panoramicCaptureUrl: string;
  inspectionResult: ClusterInspectionResult;
  resolutionNotes?: string;
  operatorId?: string;
}

export interface TestScenario {
  id: string;
  title: string;
  subtitle: string;
  expectedOutcome: FinalAction;
  figure: FigureProduct;
  returnReason: ReturnReason;
  damageSubcategory?: DamageSubcategory;
  capturedImageUrl: string;
  hasOfficialBox: boolean;
  isSealedBlister: boolean;
  simulatedBootleg: boolean;
  simulatedDamageSeverity: 'none' | 'subtle_under_threshold' | 'severe_over_threshold';
  description: string;
  tags: string[];
}
