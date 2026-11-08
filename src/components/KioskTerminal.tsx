import React, { useState } from 'react';
import { 
  CustomerOrder, 
  CustomerUser, 
  DamageSubcategory, 
  FigureProduct, 
  RefundMethod, 
  ReturnReason,
  ClusterInspectionResult
} from '../types/kiosk';
import { MOCK_USERS, CATALOG_FIGURES, createFigureSvg } from '../data/mockCatalog';
import { 
  playKioskBeep, 
  playCameraShutterSound, 
  playMechanicalDoorSound, 
  playUrgentHitlAlarm 
} from '../utils/audio';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  QrCode, 
  CreditCard, 
  Gift, 
  Lock, 
  Unlock, 
  RotateCcw, 
  RefreshCw, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Package, 
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

interface KioskTerminalProps {
  onRunStep10Inspection: (data: {
    kioskId: string;
    product: FigureProduct;
    returnReason: ReturnReason;
    damageSubcategory?: DamageSubcategory;
    hasOfficialBox: boolean;
    isSealedBlister: boolean;
    simulatedBootleg?: boolean;
    simulatedDamageSeverity?: 'none' | 'subtle_under_threshold' | 'severe_over_threshold';
    panoramicImageUrl?: string;
  }) => Promise<ClusterInspectionResult>;
  onEscalateToHitl: (inspection: ClusterInspectionResult, order: CustomerOrder, reason: ReturnReason, damageSub?: DamageSubcategory) => void;
  onViewClusterTab: () => void;
  doorLocked: boolean;
  setDoorLocked: (locked: boolean) => void;
}

export const KioskTerminal: React.FC<KioskTerminalProps> = ({
  onRunStep10Inspection,
  onEscalateToHitl,
  onViewClusterTab,
  doorLocked,
  setDoorLocked
}) => {
  // Current Step state (1 to 15)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState<CustomerUser>(MOCK_USERS[0]);
  
  // Step 1: Credentials
  const [emailInput, setEmailInput] = useState<string>('ramses.chavez0514@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>('');

  // Step 3-4: Order & Product Selection
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(MOCK_USERS[0].orders[0]);

  // Step 5: Return Reason & Damage
  const [returnReason, setReturnReason] = useState<ReturnReason>('por_gusto');
  const [damageSubcategory, setDamageSubcategory] = useState<DamageSubcategory>('Rotura / Fisura');

  // Step 6: QR Scan
  const [scannedQrCode, setScannedQrCode] = useState<string>('');
  const [isScanningQr, setIsScanningQr] = useState<boolean>(false);

  // Step 7: Refund Method
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('store_voucher');

  // Step 8-9: Physical Compartment & Camera Capture
  const [isTrayOccupied, setIsTrayOccupied] = useState<boolean>(true);
  const [hasOfficialBoxInTray, setHasOfficialBoxInTray] = useState<boolean>(true);
  const [isFactorySealedBlister, setIsFactorySealedBlister] = useState<boolean>(false);
  const [simulatedBootlegCondition, setSimulatedBootlegCondition] = useState<boolean>(false);
  const [simulatedDamageSeverity, setSimulatedDamageSeverity] = useState<'none' | 'subtle_under_threshold' | 'severe_over_threshold'>('none');
  const [isCameraFlashing, setIsCameraFlashing] = useState<boolean>(false);
  const [panoramicCaptured, setPanoramicCaptured] = useState<boolean>(false);

  // Step 10: AI Cluster Inspection
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectionResult, setInspectionResult] = useState<ClusterInspectionResult | null>(null);

  // Step 11: Rejection Message
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Step 14-15: Retention & Success
  const [isRetainingMotorActive, setIsRetainingMotorActive] = useState<boolean>(false);
  const [refundReference, setRefundReference] = useState<string>('');

  // Quick preset loader for quick testing right on the kiosk
  const loadScenarioPreset = (preset: 'authentic_like' | 'bootleg_fraud' | 'broken_katana' | 'false_damage' | 'sealed_blister' | 'hitl_ambiguous') => {
    playKioskBeep(700, 0.05);
    if (preset === 'authentic_like') {
      setSelectedOrder(MOCK_USERS[0].orders[0]); // Goku
      setReturnReason('por_gusto');
      setHasOfficialBoxInTray(true);
      setIsFactorySealedBlister(false);
      setSimulatedBootlegCondition(false);
      setSimulatedDamageSeverity('none');
    } else if (preset === 'bootleg_fraud') {
      setSelectedOrder(MOCK_USERS[0].orders[0]); // Goku or Naruto
      setReturnReason('por_gusto');
      setHasOfficialBoxInTray(true);
      setIsFactorySealedBlister(false);
      setSimulatedBootlegCondition(true);
      setSimulatedDamageSeverity('none');
    } else if (preset === 'broken_katana') {
      setSelectedOrder(MOCK_USERS[0].orders[1]); // Tanjiro
      setReturnReason('danado');
      setDamageSubcategory('Rotura / Fisura');
      setHasOfficialBoxInTray(true);
      setIsFactorySealedBlister(false);
      setSimulatedBootlegCondition(false);
      setSimulatedDamageSeverity('severe_over_threshold');
    } else if (preset === 'false_damage') {
      setSelectedOrder(MOCK_USERS[0].orders[1]); // Tanjiro
      setReturnReason('danado');
      setDamageSubcategory('Rayón o pintura desprendida');
      setHasOfficialBoxInTray(true);
      setIsFactorySealedBlister(false);
      setSimulatedBootlegCondition(false);
      setSimulatedDamageSeverity('subtle_under_threshold');
    } else if (preset === 'sealed_blister') {
      setSelectedOrder(MOCK_USERS[0].orders[2]); // Levi
      setReturnReason('por_gusto');
      setHasOfficialBoxInTray(true);
      setIsFactorySealedBlister(true);
      setSimulatedBootlegCondition(false);
      setSimulatedDamageSeverity('none');
    } else if (preset === 'hitl_ambiguous') {
      setSelectedOrder(MOCK_USERS[0].orders[0]);
      setReturnReason('producto_diferente');
      setHasOfficialBoxInTray(false);
      setIsFactorySealedBlister(false);
      setSimulatedBootlegCondition(false);
      setSimulatedDamageSeverity('subtle_under_threshold');
    }
  };

  // Step 1 -> 2: Authenticate
  const handleLogin = () => {
    playKioskBeep(800, 0.06);
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      setSessionToken('AUTH-SES-TOKEN-' + Math.random().toString(36).substring(2, 9).toUpperCase());
      setCurrentStep(3); // Directly to eligible items
      playKioskBeep(1000, 0.08);
    }, 700);
  };

  // Step 4 -> 5: Select Item
  const handleSelectProduct = (order: CustomerOrder) => {
    playKioskBeep(650, 0.05);
    setSelectedOrder(order);
    setCurrentStep(5);
  };

  // Step 5 -> 6 or 7
  const handleConfirmReason = () => {
    playKioskBeep(700, 0.05);
    if (returnReason === 'producto_diferente') {
      setCurrentStep(6);
    } else {
      setCurrentStep(7);
    }
  };

  // Step 6: Scan QR
  const handleScanQr = () => {
    setIsScanningQr(true);
    playKioskBeep(900, 0.08);
    setTimeout(() => {
      setScannedQrCode(selectedOrder?.shippingQrCode || 'PKG-RET-QR-99120-GOKU');
      setIsScanningQr(false);
      playKioskBeep(1200, 0.1);
      setCurrentStep(7);
    }, 900);
  };

  // Step 7 -> 8: Deposit & Photo
  const handleConfirmRefundMethod = () => {
    playKioskBeep(750, 0.05);
    // Destrabar compuerta para que el cliente deposite
    setDoorLocked(false);
    playMechanicalDoorSound();
    setCurrentStep(8);
  };

  // Step 8: Trigger Camera Shutter
  const handleTriggerCamera = () => {
    playCameraShutterSound();
    setIsCameraFlashing(true);
    setDoorLocked(true); // Se bloquea mientras la cámara toma y analiza
    setTimeout(() => {
      setIsCameraFlashing(false);
      setPanoramicCaptured(true);
      setCurrentStep(9);
    }, 600);
  };

  // Step 9 -> 10: Confirm photo quality and run Step 10 Multi-Agent Cluster
  const handleStartInspection = async () => {
    if (!selectedOrder) return;
    playKioskBeep(850, 0.07);
    setCurrentStep(10);
    setIsInspecting(true);

    try {
      const result = await onRunStep10Inspection({
        kioskId: 'KIOSK-MONTEVIDEO-04',
        product: selectedOrder.product,
        returnReason,
        damageSubcategory: returnReason === 'danado' ? damageSubcategory : undefined,
        hasOfficialBox: hasOfficialBoxInTray,
        isSealedBlister: isFactorySealedBlister,
        simulatedBootleg: simulatedBootlegCondition,
        simulatedDamageSeverity: simulatedDamageSeverity
      });

      setInspectionResult(result);
      setIsInspecting(false);

      const action = result.incidence_router.final_action;

      if (action === 'APPROVE') {
        playKioskBeep(1100, 0.15);
        setCurrentStep(12); // To Confirmation step
      } else if (action === 'REJECT') {
        playKioskBeep(350, 0.2, 'sawtooth');
        setRejectionReason(result.incidence_router.human_message);
        setDoorLocked(false); // Destrabe compuerta para retiro
        playMechanicalDoorSound();
        setCurrentStep(11); // Rejection screen
      } else if (action === 'REQUEST_NEW_ANGLE') {
        playKioskBeep(500, 0.1);
        setDoorLocked(false);
        setCurrentStep(8);
      } else if (action === 'DISCREPANCY') {
        playKioskBeep(450, 0.15);
        setCurrentStep(5); // Back to reason selection
      } else if (action === 'ESCALATE_HITL') {
        playUrgentHitlAlarm();
        onEscalateToHitl(result, selectedOrder, returnReason, damageSubcategory);
      }
    } catch {
      setIsInspecting(false);
    }
  };

  // Step 12 -> 13 -> 14: Customer Confirmation
  const handleFinalCustomerDecision = (confirmed: boolean) => {
    if (confirmed) {
      playKioskBeep(900, 0.08);
      setCurrentStep(14); // Mechanical storage
      setIsRetainingMotorActive(true);
      playMechanicalDoorSound();
      
      setTimeout(() => {
        setIsRetainingMotorActive(false);
        setDoorLocked(true);
        setRefundReference('REF-' + Math.random().toString(36).substring(2, 9).toUpperCase());
        playKioskBeep(1200, 0.2);
        setCurrentStep(15); // Success screen
      }, 1600);
    } else {
      // Customer cancels
      playMechanicalDoorSound();
      setDoorLocked(false);
      setRejectionReason('Trámite cancelado voluntariamente por el cliente. La compuerta se ha destrabado.');
      handleResetSession();
    }
  };

  const handleResetSession = () => {
    playKioskBeep(600, 0.05);
    setCurrentStep(1);
    setPanoramicCaptured(false);
    setInspectionResult(null);
    setDoorLocked(true);
    setRefundReference('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4">
      {/* Kiosk Chassis Frame */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Physical Kiosk Header Display */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Terminal Kiosco #04 · Pantalla Táctil Activa
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-cyan-400">Paso {currentStep} de 15</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-slate-400">
              {currentStep <= 4 ? 'Autenticación' : currentStep <= 9 ? 'Depósito & Captura' : currentStep === 10 ? 'Inspección IA' : 'Resolución'}
            </span>
          </div>
        </div>

        {/* Quick Test Scenario Toolbar (for testers/reviewers) */}
        <div className="bg-slate-950/70 px-6 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simulador de Casos de Prueba Rápidos:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => loadScenarioPreset('authentic_like')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
            >
              A: Por Gusto (Óptimo)
            </button>
            <button
              onClick={() => loadScenarioPreset('bootleg_fraud')}
              className="px-2.5 py-1 rounded bg-rose-950/70 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 text-[11px] font-medium transition-colors"
            >
              B: Bootleg (Fraude)
            </button>
            <button
              onClick={() => loadScenarioPreset('broken_katana')}
              className="px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-300 text-[11px] font-medium transition-colors"
            >
              C: Katana Rota (&gt;Umbral)
            </button>
            <button
              onClick={() => loadScenarioPreset('false_damage')}
              className="px-2.5 py-1 rounded bg-amber-950/70 border border-amber-800/60 hover:bg-amber-900/60 text-amber-300 text-[11px] font-medium transition-colors"
            >
              D: Daño Falso (&lt;Umbral)
            </button>
            <button
              onClick={() => loadScenarioPreset('sealed_blister')}
              className="px-2.5 py-1 rounded bg-indigo-950/70 border border-indigo-800/60 hover:bg-indigo-900/60 text-indigo-300 text-[11px] font-medium transition-colors"
            >
              E: Blíster Sellado (CASE-02)
            </button>
            <button
              onClick={() => loadScenarioPreset('hitl_ambiguous')}
              className="px-2.5 py-1 rounded bg-purple-950/70 border border-purple-800/60 hover:bg-purple-900/60 text-purple-300 text-[11px] font-medium transition-colors"
            >
              F: Ambigüedad (HITL 45s)
            </button>
          </div>
        </div>

        {/* Interactive Touchscreen Body */}
        <div className="p-6 md:p-8 bg-slate-900 text-slate-100 min-h-[520px] flex flex-col justify-between">
          {/* STEP 1: Login */}
          {currentStep === 1 && (
            <div className="max-w-md mx-auto w-full my-auto space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-cyan-950/80 text-cyan-400 mb-2 border border-cyan-800/40">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">Bienvenido al Kiosco de Devolución</h2>
                <p className="text-xs text-slate-400">
                  Ingresa tus credenciales de la tienda para acceder a tus compras elegibles.
                </p>
              </div>

              <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Cumplimiento Ley 18.331: El correo será enmascarado en registros públicos.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isAuthenticating}
                  className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión en Kiosco</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <span className="text-xs text-slate-500">
                  Usuario de prueba cargado: {currentUser.fullName} ({currentUser.maskedEmail})
                </span>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Eligible Orders Selection */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Selecciona la figura a devolver</h2>
                  <p className="text-xs text-slate-400">
                    Mostrando compras entregadas dentro del plazo de 30 días de garantía.
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  Cliente: <span className="text-cyan-300 font-medium">{currentUser.fullName}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentUser.orders.map((ord) => (
                  <div
                    key={ord.orderId}
                    onClick={() => handleSelectProduct(ord)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedOrder?.orderId === ord.orderId
                        ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="w-full h-36 rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center p-2 border border-slate-800/80">
                        <img
                          src={ord.product.officialFigureImage}
                          alt={ord.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                          {ord.product.series}
                        </span>
                        <h3 className="text-sm font-bold text-white line-clamp-1">{ord.product.name}</h3>
                        <p className="text-xs text-slate-400">{ord.product.manufacturer}</p>
                      </div>
                      <div className="text-xs space-y-1 pt-2 border-t border-slate-800/80 text-slate-400">
                        <div className="flex justify-between">
                          <span>Pedido:</span>
                          <span className="font-mono text-slate-300">{ord.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Entregado:</span>
                          <span>{ord.deliveryDate}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-slate-200">
                          <span>Valor:</span>
                          <span className="text-emerald-400">${ord.product.originalPrice.toFixed(2)} USD</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="mt-4 w-full py-2 px-3 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Seleccionar esta figura</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Reason for Return & Damage Subclassification */}
          {currentStep === 5 && selectedOrder && (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Motivo de la Devolución</h2>
                  <p className="text-xs text-slate-400">
                    Artículo: <span className="text-cyan-300 font-semibold">{selectedOrder.product.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Cambiar figura
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setReturnReason('por_gusto')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    returnReason === 'por_gusto'
                      ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sm text-white mb-1">Por gusto</div>
                  <p className="text-xs text-slate-400">
                    No me convenció. La figura está intacta en perfecto estado estético.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setReturnReason('danado')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    returnReason === 'danado'
                      ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sm text-white mb-1">Dañado</div>
                  <p className="text-xs text-slate-400">
                    Llegó con rotura, golpe o defecto que supera el umbral de garantía.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setReturnReason('producto_diferente')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    returnReason === 'producto_diferente'
                      ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-sm text-white mb-1">Producto diferente</div>
                  <p className="text-xs text-slate-400">
                    Recibí un modelo erróneo al que compré (requiere escanear QR de caja de flete).
                  </p>
                </button>
              </div>

              {/* Subclasificación obligatoria si es DAÑADO */}
              {returnReason === 'danado' && (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Selecciona la subcategoría de daño físico obligatoria:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(
                      [
                        'Rotura / Fisura',
                        'Golpe / Deformación',
                        'Rayón o pintura desprendida',
                        'Pieza faltante o desprendida visible'
                      ] as DamageSubcategory[]
                    ).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setDamageSubcategory(sub)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all ${
                          damageSubcategory === sub
                            ? 'bg-amber-950/70 text-amber-200 border-amber-500 ring-1 ring-amber-500'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    * La cámara cenital del Paso 8 verificará la figura contra la foto de umbral mínimo de garantía del fabricante.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleConfirmReason}
                  className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Continuar al Paso siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Scan Shipping Box QR (Conditional) */}
          {currentStep === 6 && (
            <div className="max-w-md mx-auto w-full space-y-6 text-center">
              <div className="inline-flex p-3 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                <QrCode className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Escaneo de Código QR del Paquete</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Acerca la etiqueta de envío pegada en la caja exterior al lector óptico del kiosco.
                </p>
              </div>

              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="p-6 border-2 border-dashed border-cyan-500/50 rounded-lg bg-slate-900/60 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-2 border-cyan-400 rounded-lg flex items-center justify-center font-mono text-xs text-cyan-300">
                    QR SENSOR
                  </div>
                  <span className="text-xs text-slate-400 mt-3 font-mono">
                    {scannedQrCode || selectedOrder?.shippingQrCode}
                  </span>
                </div>

                <button
                  onClick={handleScanQr}
                  disabled={isScanningQr}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isScanningQr ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Leyendo código óptico...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Simular Escaneo en Lector Óptico</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-500">
                Caso Borde CASE-01: Si no tienes la caja de envío, el sistema derivará a soporte postal externo.
              </div>
            </div>
          )}

          {/* STEP 7: Refund Method */}
          {currentStep === 7 && (
            <div className="max-w-md mx-auto w-full space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-white">Método de Reembolso</h2>
                <p className="text-xs text-slate-400">
                  Selecciona cómo deseas recibir el reintegro de tu dinero ($
                  {selectedOrder?.product.originalPrice.toFixed(2)} USD).
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setRefundMethod('store_voucher')}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    refundMethod === 'store_voucher'
                      ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Gift className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      Cupón de Tienda Inmediato
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-400 rounded font-mono">
                        Instantáneo + $5 Bonus
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Código emitido al instante en pantalla y enviado a tu correo para compras online o físicas.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRefundMethod('bank_transfer')}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    refundMethod === 'bank_transfer'
                      ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm text-white">
                      Reintegro Bancario Diferido
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Acreditación al medio de pago original de la tarjeta (24 a 72 horas hábiles).
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleConfirmRefundMethod}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Confirmar Método y Abrir Compuerta de Depósito</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Physical Tray Deposition & Overhead Panoramic Shutter */}
          {currentStep === 8 && selectedOrder && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Depósito en Bandeja y Captura Cenital
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                      Compuerta Destrabada
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Coloca la figura y su caja comercial lado a lado sobre la plataforma interna.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-400">
                  Cámara Cenital HD 1080p Lista
                </div>
              </div>

              {/* Hardware Tray Simulator Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Visual Tray View */}
                <div className="md:col-span-2 relative bg-slate-950 border-2 border-slate-800 rounded-xl p-4 overflow-hidden min-h-[260px] flex items-center justify-center">
                  {/* Camera Reticle & Lighting Overlay */}
                  <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 m-3 rounded flex flex-col justify-between p-2">
                    <div className="flex justify-between text-[10px] font-mono text-cyan-500/60">
                      <span>[REC 60FPS]</span>
                      <span>ILLUM: 850 LUX</span>
                    </div>
                    <div className="self-center w-8 h-8 border border-cyan-500/40 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-cyan-500/60">
                      <span>FOV: 94° PANORAMIC</span>
                      <span>SENSOR: CENITAL-01</span>
                    </div>
                  </div>

                  {/* Flash animation */}
                  {isCameraFlashing && (
                    <div className="absolute inset-0 bg-white z-20 animate-ping opacity-90" />
                  )}

                  {/* Figures placed in the tray */}
                  <div className="flex flex-wrap items-center justify-center gap-4 z-10">
                    {/* Figure preview */}
                    <div className="w-36 h-44 rounded-lg bg-slate-900 border border-slate-700/80 p-2 flex flex-col items-center justify-between shadow-lg relative">
                      <img
                        src={
                          simulatedBootlegCondition
                            ? createFigureSvg(
                                selectedOrder.product.name,
                                '#dc2626',
                                'RÉPLICA PIRATA NO OFICIAL',
                                'FALLAS DE MOLDE / BOOTLEG',
                                true,
                                '4. PIRATA'
                              )
                            : simulatedDamageSeverity === 'severe_over_threshold'
                            ? createFigureSvg(
                                selectedOrder.product.name,
                                '#10b981',
                                'DAÑO REAL CONFIRMADO',
                                `ROTURA > 4mm (${damageSubcategory})`,
                                true,
                                '2. CUMPLE UMBRAL'
                              )
                            : simulatedDamageSeverity === 'subtle_under_threshold'
                            ? createFigureSvg(
                                selectedOrder.product.name,
                                '#f59e0b',
                                'DEFECTO MENOR',
                                'LEVE DESGASTE < UMBRAL',
                                true,
                                '3. BAJO UMBRAL'
                              )
                            : selectedOrder.product.officialFigureImage
                        }
                        alt="Figura en bandeja"
                        className="w-full h-32 object-contain"
                      />
                      <span className="text-[10px] font-mono text-slate-300 truncate w-full text-center">
                        {simulatedBootlegCondition
                          ? '4. El Producto Pirata'
                          : simulatedDamageSeverity === 'severe_over_threshold'
                          ? '2. Dañado ≥ Umbral'
                          : simulatedDamageSeverity === 'subtle_under_threshold'
                          ? '3. Dañado < Umbral'
                          : '1. Producto Intacto'}
                      </span>
                      {simulatedBootlegCondition ? (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] font-mono shadow">
                          4. PIRATA
                        </div>
                      ) : simulatedDamageSeverity === 'severe_over_threshold' ? (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[9px] font-mono shadow">
                          2. ≥ UMBRAL
                        </div>
                      ) : simulatedDamageSeverity === 'subtle_under_threshold' ? (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[9px] font-mono shadow">
                          3. &lt; UMBRAL
                        </div>
                      ) : (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-cyan-500/90 text-slate-950 font-bold text-[9px] font-mono shadow">
                          1. INTACTO
                        </div>
                      )}
                    </div>

                    {/* Packaging preview */}
                    {hasOfficialBoxInTray ? (
                      <div className="w-32 h-44 rounded-lg bg-slate-900 border border-slate-700/80 p-2 flex flex-col items-center justify-between shadow-lg">
                        <img
                          src={selectedOrder.product.officialBoxImage}
                          alt="Caja oficial"
                          className="w-full h-32 object-contain"
                        />
                        <span className="text-[10px] font-mono text-cyan-300">Caja Comercial</span>
                      </div>
                    ) : (
                      <div className="w-32 h-44 rounded-lg border-2 border-dashed border-rose-800/80 p-4 flex flex-col items-center justify-center text-center text-rose-400">
                        <Package className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">Caja Ausente</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tray Controls & Shutter */}
                <div className="space-y-4">
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-200 block text-xs">
                          Opciones de simulación del producto:
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">Elige 1 de 4</span>
                      </div>

                      <div className="space-y-1.5">
                        {/* 1. Producto intacto */}
                        <button
                          type="button"
                          onClick={() => {
                            setSimulatedBootlegCondition(false);
                            setSimulatedDamageSeverity('none');
                            playKioskBeep(700, 0.04);
                          }}
                          className={`w-full text-left p-2 rounded-lg border transition-all text-[11px] flex items-center justify-between ${
                            !simulatedBootlegCondition && simulatedDamageSeverity === 'none'
                              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-semibold ring-1 ring-cyan-500'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center font-bold ${
                              !simulatedBootlegCondition && simulatedDamageSeverity === 'none'
                                ? 'bg-cyan-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              1
                            </span>
                            <div>
                              <span className="font-medium text-cyan-300 block">1. Producto intacto</span>
                              <span className="text-[9px] text-slate-400">Figura original en estado perfecto (aprobación "Por gusto")</span>
                            </div>
                          </div>
                          {!simulatedBootlegCondition && simulatedDamageSeverity === 'none' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                          )}
                        </button>

                        {/* 2. Producto dañado que cumple con el umbral */}
                        <button
                          type="button"
                          onClick={() => {
                            setSimulatedBootlegCondition(false);
                            setSimulatedDamageSeverity('severe_over_threshold');
                            if (returnReason !== 'danado') {
                              setReturnReason('danado');
                            }
                            playKioskBeep(750, 0.04);
                          }}
                          className={`w-full text-left p-2 rounded-lg border transition-all text-[11px] flex items-center justify-between ${
                            !simulatedBootlegCondition && simulatedDamageSeverity === 'severe_over_threshold'
                              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center font-bold ${
                              !simulatedBootlegCondition && simulatedDamageSeverity === 'severe_over_threshold'
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              2
                            </span>
                            <div>
                              <span className="font-medium text-emerald-300 block">2. Producto dañado que cumple con el umbral</span>
                              <span className="text-[9px] text-slate-400">Rotura o quiebre visible ≥ 4mm (garantía verificada de fábrica)</span>
                            </div>
                          </div>
                          {!simulatedBootlegCondition && simulatedDamageSeverity === 'severe_over_threshold' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                          )}
                        </button>

                        {/* 3. Producto dañado que no cumple con el umbral */}
                        <button
                          type="button"
                          onClick={() => {
                            setSimulatedBootlegCondition(false);
                            setSimulatedDamageSeverity('subtle_under_threshold');
                            if (returnReason !== 'danado') {
                              setReturnReason('danado');
                            }
                            playKioskBeep(650, 0.04);
                          }}
                          className={`w-full text-left p-2 rounded-lg border transition-all text-[11px] flex items-center justify-between ${
                            !simulatedBootlegCondition && simulatedDamageSeverity === 'subtle_under_threshold'
                              ? 'bg-amber-950/90 border-amber-500 text-amber-200 font-semibold ring-1 ring-amber-500'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center font-bold ${
                              !simulatedBootlegCondition && simulatedDamageSeverity === 'subtle_under_threshold'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              3
                            </span>
                            <div>
                              <span className="font-medium text-amber-300 block">3. Producto dañado que no cumple con el umbral</span>
                              <span className="text-[9px] text-slate-400">Micro-desgaste superficial &lt; 2mm (no califica para cobertura)</span>
                            </div>
                          </div>
                          {!simulatedBootlegCondition && simulatedDamageSeverity === 'subtle_under_threshold' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                          )}
                        </button>

                        {/* 4. El producto pirata */}
                        <button
                          type="button"
                          onClick={() => {
                            setSimulatedBootlegCondition(true);
                            setSimulatedDamageSeverity('none');
                            playKioskBeep(500, 0.05);
                          }}
                          className={`w-full text-left p-2 rounded-lg border transition-all text-[11px] flex items-center justify-between ${
                            simulatedBootlegCondition
                              ? 'bg-rose-950/90 border-rose-500 text-rose-200 font-semibold ring-1 ring-rose-500'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center font-bold ${
                              simulatedBootlegCondition
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              4
                            </span>
                            <div>
                              <span className="font-medium text-rose-300 block">4. El producto pirata (Bootleg)</span>
                              <span className="text-[9px] text-slate-400">Falsificación china con rebabas de inyección y molde apócrifo</span>
                            </div>
                          </div>
                          {simulatedBootlegCondition && (
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <span className="font-semibold text-slate-200 block text-[11px]">Empaque y estado de caja:</span>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasOfficialBoxInTray}
                          onChange={(e) => setHasOfficialBoxInTray(e.target.checked)}
                          className="rounded border-slate-700 text-cyan-600 focus:ring-0"
                        />
                        <span>Caja comercial oficial presente lado a lado</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFactorySealedBlister}
                          onChange={(e) => setIsFactorySealedBlister(e.target.checked)}
                          className="rounded border-slate-700 text-cyan-600 focus:ring-0"
                        />
                        <span>Figura sellada en blíster transparente de fábrica (CASE-02)</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleTriggerCamera}
                    disabled={isCameraFlashing}
                    className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Disparar Captura Fotográfica</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: Customer Visual Quality Confirmation */}
          {currentStep === 9 && selectedOrder && (
            <div className="max-w-2xl mx-auto w-full space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-white">Control de Calidad Visual</h2>
                <p className="text-xs text-slate-400">
                  Verifica en pantalla que la figura y la caja se aprecien con nitidez e iluminación adecuada.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="w-full h-56 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={
                      simulatedBootlegCondition
                        ? createFigureSvg(
                            selectedOrder.product.name,
                            '#dc2626',
                            'FOTO CENITAL CAPTURADA',
                            'RÉPLICA PIRATA NO OFICIAL (BOOTLEG)',
                            true,
                            '4. PIRATA'
                          )
                        : simulatedDamageSeverity === 'severe_over_threshold'
                        ? createFigureSvg(
                            selectedOrder.product.name,
                            '#10b981',
                            'FOTO CENITAL CAPTURADA',
                            `ROTURA SUPERIOR AL UMBRAL (${damageSubcategory})`,
                            true,
                            '2. CUMPLE UMBRAL'
                          )
                        : simulatedDamageSeverity === 'subtle_under_threshold'
                        ? createFigureSvg(
                            selectedOrder.product.name,
                            '#f59e0b',
                            'FOTO CENITAL CAPTURADA',
                            'DEFECTO MENOR INSUFICIENTE',
                            true,
                            '3. BAJO UMBRAL'
                          )
                        : selectedOrder.product.officialFigureImage
                    }
                    alt="Foto capturada"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/85 rounded text-[10px] font-mono text-emerald-400 flex items-center gap-2 border border-slate-800">
                    <span>✓ ENCUADRE Y ENFOQUE (1080p)</span>
                    <span className="text-slate-600">|</span>
                    {simulatedBootlegCondition ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">
                        4. PIRATA DETECTADO
                      </span>
                    ) : simulatedDamageSeverity === 'severe_over_threshold' ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black font-bold">
                        2. DAÑO ≥ UMBRAL
                      </span>
                    ) : simulatedDamageSeverity === 'subtle_under_threshold' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold">
                        3. MICRO-DAÑO &lt; UMBRAL
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-600 text-white font-bold">
                        1. PRODUCTO INTACTO
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick switcher in Step 9 to re-test another condition if desired */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300 font-medium">
                    Condición fotografiada actual:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatedBootlegCondition(false);
                        setSimulatedDamageSeverity('none');
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        !simulatedBootlegCondition && simulatedDamageSeverity === 'none'
                          ? 'bg-cyan-600 text-white font-bold ring-1 ring-cyan-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      1. Intacto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatedBootlegCondition(false);
                        setSimulatedDamageSeverity('severe_over_threshold');
                        if (returnReason !== 'danado') setReturnReason('danado');
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        !simulatedBootlegCondition && simulatedDamageSeverity === 'severe_over_threshold'
                          ? 'bg-emerald-600 text-white font-bold ring-1 ring-emerald-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      2. Dañado ≥ Umbral
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatedBootlegCondition(false);
                        setSimulatedDamageSeverity('subtle_under_threshold');
                        if (returnReason !== 'danado') setReturnReason('danado');
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        !simulatedBootlegCondition && simulatedDamageSeverity === 'subtle_under_threshold'
                          ? 'bg-amber-600 text-white font-bold ring-1 ring-amber-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      3. Dañado &lt; Umbral
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatedBootlegCondition(true);
                        setSimulatedDamageSeverity('none');
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        simulatedBootlegCondition
                          ? 'bg-rose-600 text-white font-bold ring-1 ring-rose-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      4. El Pirata
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => setCurrentStep(8)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reintentar toma / Girar figura</span>
                  </button>

                  <button
                    onClick={handleStartInspection}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Confirmar Foto y Ejecutar Inspección IA (Paso 10)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: AI Multi-Agent Cluster Inspection Progress */}
          {currentStep === 10 && (
            <div className="max-w-md mx-auto w-full text-center space-y-6 my-auto">
              <div className="inline-flex p-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 animate-pulse">
                <RefreshCw className="w-10 h-10 animate-spin text-cyan-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Inspección de Inteligencia Artificial</h2>
                <p className="text-xs text-slate-400">
                  El clúster de subagentes está analizando la imagen cenital contra el catálogo de autenticidad y umbrales de daño...
                </p>
              </div>

              <div className="space-y-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left text-xs font-mono">
                <div className="flex items-center justify-between text-cyan-300">
                  <span>1. vision_auditor (Flash)</span>
                  <span className="text-[11px] text-emerald-400">Auditando modelo & empaque...</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>2. fraud_damage_validator (Pro)</span>
                  <span className="text-[11px] text-amber-400">Verificando Bootleg / Daño...</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>3. incidence_router (Flash)</span>
                  <span className="text-[11px] text-slate-500">Evaluando resolución y SLA...</span>
                </div>
              </div>

              <button
                onClick={onViewClusterTab}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
              >
                <span>Abrir Panel de Inspección Técnica en Detalle</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 11: Rejection Screen */}
          {currentStep === 11 && (
            <div className="max-w-md mx-auto w-full space-y-6 text-center my-auto">
              <div className="inline-flex p-3 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                <XCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Devolución No Aprobada</h2>
                <p className="text-xs text-slate-300 bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-left leading-relaxed">
                  {rejectionReason || 'La inspección automatizada ha rechazado el trámite.'}
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <Unlock className="w-4 h-4" />
                  <span>Compuerta Destrabada</span>
                </div>
                <p className="text-xs text-slate-400">
                  Por favor retira la figura y el empaque del compartimento físico. La sesión se cerrará sin emitir reembolso.
                </p>
              </div>

              <button
                onClick={handleResetSession}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cerrar Sesión y Finalizar
              </button>
            </div>
          )}

          {/* STEP 12 & 13: Final Customer Confirmation */}
          {currentStep === 12 && selectedOrder && inspectionResult && (
            <div className="max-w-lg mx-auto w-full space-y-6 my-auto">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-white">¡Devolución Aprobada!</h2>
                <p className="text-xs text-slate-300">
                  {inspectionResult.incidence_router.human_message}
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Artículo entregado:</span>
                  <span className="font-semibold text-white">{selectedOrder.product.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Motivo verificado:</span>
                  <span className="font-semibold text-cyan-300 uppercase">{returnReason}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Método de reembolso:</span>
                  <span className="font-semibold text-white">
                    {refundMethod === 'store_voucher' ? 'Cupón Inmediato (+ $5 USD Bonus)' : 'Reintegro Bancario'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span className="text-slate-300">Total a reembolsar:</span>
                  <span className="text-emerald-400">
                    ${selectedOrder.product.originalPrice.toFixed(2)} USD
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handleFinalCustomerDecision(false)}
                  className="w-full sm:w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar y Devolver Producto
                </button>
                <button
                  onClick={() => handleFinalCustomerDecision(true)}
                  className="w-full sm:w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  Confirmar Entrega de Figura
                </button>
              </div>
            </div>
          )}

          {/* STEP 14: Electromechanical Storage & Locking */}
          {currentStep === 14 && (
            <div className="max-w-md mx-auto w-full text-center space-y-6 my-auto">
              <div className="inline-flex p-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 animate-spin">
                <RefreshCw className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Resguardando en Bóveda Interna</h2>
                <p className="text-xs text-slate-400">
                  Activación electromecánica: la figura está siendo depositada de forma segura en el contenedor sellado del cajero.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center gap-3 text-xs font-mono text-cyan-300">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>MOTOR ACTIVO · BLOQUEANDO COMPUERTA DE SEGURIDAD...</span>
              </div>
            </div>
          )}

          {/* STEP 15: Success and Refund Dispatched */}
          {currentStep === 15 && selectedOrder && (
            <div className="max-w-lg mx-auto w-full space-y-6 my-auto text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">¡Devolución Completada con Éxito!</h2>
                <p className="text-xs text-slate-400">
                  El sistema central ha procesado tu solicitud y emitido el comprobante legal.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-emerald-900/60 text-left space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Código de Devolución:</span>
                  <span className="font-mono text-emerald-400 font-bold">{refundReference}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Comprobante enviado a:</span>
                  <span className="font-mono text-slate-200">{currentUser.maskedEmail}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Monto Acreditado:</span>
                  <span className="text-emerald-400 font-bold">
                    ${selectedOrder.product.originalPrice.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Destino del depósito:</span>
                  <span className="text-slate-200">Bóveda KIOSK-04 Sellada</span>
                </div>
              </div>

              <button
                onClick={handleResetSession}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Finalizar y Volver al Inicio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
