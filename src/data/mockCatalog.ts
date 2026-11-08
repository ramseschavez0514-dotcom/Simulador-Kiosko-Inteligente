import { FigureProduct, CustomerUser, TestScenario } from '../types/kiosk';

// SVG helpers to generate crisp, domain-authentic visual cards
export function createFigureSvg(title: string, color: string, badge: string, detail: string, isDefective = false, defectText = ''): string {
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#bg)"/>
      <circle cx="200" cy="180" r="110" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.4"/>
      
      <!-- Base pedestal -->
      <polygon points="120,310 280,310 320,335 80,335" fill="#334155" stroke="#475569" stroke-width="2"/>
      <ellipse cx="200" cy="310" rx="80" ry="14" fill="#1e293b" stroke="${color}" stroke-width="2"/>
      
      <!-- Stylized Figure Silhouette/Details -->
      <path d="M175,120 Q200,90 225,120 Q240,160 230,220 Q215,260 220,305 L180,305 Q185,260 170,220 Q160,160 175,120 Z" fill="${color}" opacity="0.85"/>
      <circle cx="200" cy="115" r="26" fill="#f8fafc" stroke="${color}" stroke-width="3"/>
      
      <!-- Action cape / hair -->
      <path d="M180,105 Q150,70 140,110 Q160,140 170,150 Z" fill="${color}" opacity="0.6"/>
      <path d="M220,105 Q250,70 260,110 Q240,140 230,150 Z" fill="${color}" opacity="0.6"/>

      <!-- Accents -->
      <line x1="160" y1="200" x2="140" y2="260" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
      <line x1="240" y1="200" x2="260" y2="260" stroke="#f8fafc" stroke-width="4" stroke-linecap="round"/>
      
      ${isDefective ? `
        <!-- Visible Defect/Fracture Marker -->
        <circle cx="245" cy="235" r="22" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444" stroke-width="2" stroke-dasharray="3 3"/>
        <line x1="230" y1="225" x2="260" y2="245" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <line x1="240" y1="220" x2="250" y2="250" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <rect x="180" y="260" width="130" height="24" rx="4" fill="#ef4444"/>
        <text x="245" y="276" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">FALLA: ${defectText}</text>
      ` : ''}

      <!-- Labels -->
      <text x="200" y="42" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">${title}</text>
      <text x="200" y="64" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">${badge}</text>
      <text x="200" y="375" fill="#38bdf8" font-family="monospace" font-size="11" text-anchor="middle">${detail}</text>
    </svg>
  `);
  return `data:image/svg+xml;utf8,${encoded}`;
}

function createBoxSvg(title: string, brand: string, serial: string): string {
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#0f172a"/>
      <!-- Commercial Box Graphic -->
      <rect x="90" y="60" width="220" height="280" rx="8" fill="#1e293b" stroke="#0ea5e9" stroke-width="3"/>
      <!-- Window cut / transparent blister area -->
      <rect x="120" y="100" width="160" height="150" rx="4" fill="#0284c7" fill-opacity="0.15" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 4"/>
      <path d="M125,105 L275,245" stroke="#ffffff" stroke-width="0.7" opacity="0.3"/>
      
      <!-- Official Hologram Seal -->
      <circle cx="280" cy="85" r="14" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
      <text x="280" y="89" fill="#000" font-family="sans-serif" font-size="8" font-weight="900" text-anchor="middle">OFFICIAL</text>
      
      <!-- Brand & Title -->
      <text x="200" y="88" fill="#f8fafc" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">${brand}</text>
      <text x="200" y="278" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${title}</text>
      <text x="200" y="300" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">UPC: ${serial}</text>
      <text x="200" y="322" fill="#22c55e" font-family="sans-serif" font-size="9" text-anchor="middle">✓ EMPAQUE ORIGINAL VERIFICADO</text>
    </svg>
  `);
  return `data:image/svg+xml;utf8,${encoded}`;
}

function createThresholdSvg(title: string, thresholdType: string, minLimit: string): string {
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#18181b"/>
      <!-- Ruler & Scale -->
      <rect x="40" y="40" width="320" height="320" rx="6" fill="#27272a" stroke="#52525b" stroke-width="1.5"/>
      <text x="200" y="75" fill="#f43f5e" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">UMBRAL MÍNIMO DE GARANTÍA</text>
      <text x="200" y="98" fill="#a1a1aa" font-family="sans-serif" font-size="12" text-anchor="middle">${thresholdType}</text>
      
      <!-- Visual fracture gauge -->
      <rect x="80" y="130" width="240" height="130" rx="4" fill="#09090b" stroke="#ef4444" stroke-width="2"/>
      <path d="M120,195 Q170,180 200,210 T280,185" fill="none" stroke="#f43f5e" stroke-width="5" stroke-linecap="round"/>
      <circle cx="200" cy="210" r="10" fill="#ef4444" fill-opacity="0.4"/>
      
      <!-- Measurement callout -->
      <line x1="200" y1="145" x2="200" y2="270" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="200" y="295" fill="#f59e0b" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">Límite mínimo requerido: ${minLimit}</text>
      <text x="200" y="335" fill="#71717a" font-family="sans-serif" font-size="10" text-anchor="middle">Daños inferiores se consideran desgaste estético normal.</text>
    </svg>
  `);
  return `data:image/svg+xml;utf8,${encoded}`;
}

export const CATALOG_FIGURES: FigureProduct[] = [
  {
    id: 'FIG-DBZ-001',
    name: 'Son Goku Super Saiyan - Master Stars Piece',
    series: 'Dragon Ball Z',
    manufacturer: 'Banpresto / Bandai Spirits',
    sku: 'BP-MSP-9921',
    originalPrice: 78.50,
    officialFigureImage: createFigureSvg('Son Goku SSJ', '#eab308', 'Master Stars Piece', 'BANPRESTO AUTHENTIC #MSP-9921'),
    officialBoxImage: createBoxSvg('Son Goku SSJ', 'BANPRESTO', '4983164158921'),
    damageThresholdImage: createThresholdSvg('Son Goku SSJ', 'Rotura / Fisura Estructural', 'Fisura ≥ 4.0 mm en extremidad'),
    description: 'Figura estática de 25cm, pintado sombreado mate de cabello dorado y botas con cordones modelados.',
    authenticityMarkers: ['Logo Banpresto dorado en relieve', 'Sello Toei Animation brillante', 'Acabado mate sin rebabas en cuello']
  },
  {
    id: 'FIG-NAR-002',
    name: 'Naruto Uzumaki - Sage Mode Grandista',
    series: 'Naruto Shippuden',
    manufacturer: 'Bandai Spirits',
    sku: 'BD-GRD-4412',
    originalPrice: 84.00,
    officialFigureImage: createFigureSvg('Naruto Uzumaki', '#f97316', 'Grandista Nero', 'BANDAI SPIRITS #GRD-4412'),
    officialBoxImage: createBoxSvg('Naruto Sage Mode', 'GRANDISTA', '4573102554412'),
    damageThresholdImage: createThresholdSvg('Naruto Sage Mode', 'Rayón o Pintura Desprendida', 'Área despintada ≥ 6 mm²'),
    description: 'Figura de 27cm con capa de Ermitaño de los Sapos removible y pergamino dorsal esculpido.',
    authenticityMarkers: ['Pergamino con textura mate', 'Ojos con pupila de sapo nítida', 'Sello Pierrot oficial']
  },
  {
    id: 'FIG-KMY-003',
    name: 'Tanjiro Kamado - Hinokami Kagura Dance',
    series: 'Kimetsu no Yaiba',
    manufacturer: 'Aniplex / Kotobukiya',
    sku: 'ANX-KMY-7731',
    originalPrice: 125.00,
    officialFigureImage: createFigureSvg('Tanjiro Kamado', '#10b981', 'Hinokami Kagura', 'ANIPLEX ARTFX #KMY-7731'),
    officialBoxImage: createBoxSvg('Tanjiro Kamado', 'ANIPLEX+', '4534530777311'),
    damageThresholdImage: createThresholdSvg('Tanjiro Kamado', 'Rotura de Accesorio (Katana)', 'Quiebre o astillado total de hoja Nichirin'),
    description: 'Estatua escala 1/8 con efectos translúcidos de dragón de fuego y katana Nichirin de metalizado oscuro.',
    authenticityMarkers: ['Efecto fuego translúcido naranja-rubí', 'Pendientes Hanafuda grabados a doble cara', 'Caja ventana con holograma Aniplex']
  },
  {
    id: 'FIG-SNK-004',
    name: 'Levi Ackerman - Clean Clothes Edition Figma 213',
    series: 'Attack on Titan',
    manufacturer: 'Max Factory / Good Smile Company',
    sku: 'GSC-FIG-0213',
    originalPrice: 95.00,
    officialFigureImage: createFigureSvg('Levi Ackerman', '#6366f1', 'Figma Action #213', 'MAX FACTORY FIGMA #213'),
    officialBoxImage: createBoxSvg('Levi Figma 213', 'GOOD SMILE', '4545784062135'),
    damageThresholdImage: createThresholdSvg('Levi Figma', 'Pieza Faltante o Articulación Rota', 'Pérdida de mano intercambiable o socket roto'),
    description: 'Figura altamente articulada de 14cm con pañuelos de limpieza, plumero y expresiones intercambiables.',
    authenticityMarkers: ['Articulaciones figma con marca registrada', 'Precintos circulares transparentes de fábrica', 'Logo Kodansha holográfico']
  }
];

export const MOCK_USERS: CustomerUser[] = [
  {
    userId: 'USR-8829-UY',
    fullName: 'Ramsés Chávez',
    maskedEmail: 'r******z@gmail.com',
    maskedPhone: '+598 99 *** *14',
    orders: [
      {
        orderId: 'ORD-2026-99120',
        purchaseDate: '2026-09-15',
        deliveryDate: '2026-09-18',
        eligibleUntil: '2026-10-18',
        product: CATALOG_FIGURES[0], // Goku
        shippingQrCode: 'PKG-RET-QR-99120-GOKU'
      },
      {
        orderId: 'ORD-2026-88410',
        purchaseDate: '2026-09-12',
        deliveryDate: '2026-09-16',
        eligibleUntil: '2026-10-16',
        product: CATALOG_FIGURES[2], // Tanjiro
        shippingQrCode: 'PKG-RET-QR-88410-TANJ'
      },
      {
        orderId: 'ORD-2026-77330',
        purchaseDate: '2026-09-20',
        deliveryDate: '2026-09-22',
        eligibleUntil: '2026-10-22',
        product: CATALOG_FIGURES[3], // Levi
        shippingQrCode: 'PKG-RET-QR-77330-LEVI'
      }
    ]
  }
];

export const BENCHMARK_SCENARIOS: TestScenario[] = [
  {
    id: 'SCENARIO-01-AUTHENTIC-LIKE',
    title: 'Caso A: Devolución legítima "Por gusto" (Óptimo)',
    subtitle: 'Goku SSJ Banpresto en estado impecable con su caja oficial.',
    expectedOutcome: 'APPROVE',
    figure: CATALOG_FIGURES[0],
    returnReason: 'por_gusto',
    hasOfficialBox: true,
    isSealedBlister: false,
    simulatedBootleg: false,
    simulatedDamageSeverity: 'none',
    capturedImageUrl: createFigureSvg('Son Goku SSJ (Cámara Cenital)', '#eab308', 'Captura Bandeja Kiosco K-04', 'ESTADO IMPECABLE · SIN DEFECTOS'),
    description: 'El cliente devuelve la figura porque ya la tenía en su colección. La figura no presenta roturas ni desgaste; el empaque oficial coincide.',
    tags: ['Por gusto', 'Auténtico', 'Aprobación directa']
  },
  {
    id: 'SCENARIO-02-BOOTLEG-FRAUD',
    title: 'Caso B: Detección de Fraude / Réplica China (Bootleg)',
    subtitle: 'Naruto Uzumaki cambiazo por copia pirata con rebabas y pintura defectuosa.',
    expectedOutcome: 'REJECT',
    figure: CATALOG_FIGURES[1],
    returnReason: 'por_gusto',
    hasOfficialBox: true,
    isSealedBlister: false,
    simulatedBootleg: true,
    simulatedDamageSeverity: 'none',
    capturedImageUrl: createFigureSvg('Naruto (Copia Bootleg)', '#dc2626', 'ALERTA FRAUDE RECONOCIDO', 'MOLDE DEFECTUOSO · PINTURA TÓXICA', true, 'COPIA PIRATA'),
    description: 'Intento de estafa por cambiazo. El cliente deposita una réplica barata adquirida en mercado secundario. Uniones plásticas deformes, sin sello holográfico.',
    tags: ['Fraude', 'Bootleg', 'Rechazo inmediato']
  },
  {
    id: 'SCENARIO-03-VALID-DAMAGE',
    title: 'Caso C: Daño Real Verificado (Supera Umbral)',
    subtitle: 'Tanjiro Kamado con Katana partida por impacto en flete.',
    expectedOutcome: 'APPROVE',
    figure: CATALOG_FIGURES[2],
    returnReason: 'danado',
    damageSubcategory: 'Rotura / Fisura',
    hasOfficialBox: true,
    isSealedBlister: false,
    simulatedBootleg: false,
    simulatedDamageSeverity: 'severe_over_threshold',
    capturedImageUrl: createFigureSvg('Tanjiro Kamado (Cámara)', '#10b981', 'ROTURA DETECTADA', 'FRACTURA TOTAL EN HOJA NICHIRIN', true, 'QUIEBRE 8mm'),
    description: 'El cliente reporta que la espada llegó fracturada. La cámara cenital detecta la discontinuidad estructural que supera ampliamente el umbral mínimo (8mm > 4mm).',
    tags: ['Dañado', 'Rotura severa', 'Supera umbral', 'Aprobado']
  },
  {
    id: 'SCENARIO-04-FALSE-DAMAGE-SUBTLE',
    title: 'Caso D: Reclamo de Daño Inexistente / Bajo Umbral',
    subtitle: 'Tanjiro reportado como rayón severo pero solo tiene micro-marca imperceptible.',
    expectedOutcome: 'DISCREPANCY',
    figure: CATALOG_FIGURES[2],
    returnReason: 'danado',
    damageSubcategory: 'Rayón o pintura desprendida',
    hasOfficialBox: true,
    isSealedBlister: false,
    simulatedBootleg: false,
    simulatedDamageSeverity: 'subtle_under_threshold',
    capturedImageUrl: createFigureSvg('Tanjiro Kamado (Cámara)', '#10b981', 'INSPECCIÓN ESTÉTICA', 'MICRO-MARCA < 1mm (DESGASTE NORMAL)', false),
    description: 'El cliente reclama rayón severo de pintura, pero la inspección por visión computacional determina que la marca es inferior al umbral mínimo exigible.',
    tags: ['Discrepancia', 'Bajo umbral', 'Retorno a Paso 5']
  },
  {
    id: 'SCENARIO-05-SEALED-BLISTER-CASE',
    title: 'Caso E: Caso Borde CASE-02 (Blíster Sellado de Fábrica)',
    subtitle: 'Levi Figma 213 en blíster transparente con precintos intactos.',
    expectedOutcome: 'APPROVE',
    figure: CATALOG_FIGURES[3],
    returnReason: 'por_gusto',
    hasOfficialBox: true,
    isSealedBlister: true,
    simulatedBootleg: false,
    simulatedDamageSeverity: 'none',
    capturedImageUrl: createFigureSvg('Levi Figma (Sellado)', '#6366f1', 'BLÍSTER PRECINTADO', 'VERIFICADO SIN ABRIR · PRESERVA VALOR', false),
    description: 'Cumplimiento del caso operacional CASE-02: Se verifica la figura a través del empaque transparente sin exigir abrir los precintos para no arruinar el valor comercial.',
    tags: ['Edge Case 02', 'Blíster sellado', 'Aprobado']
  },
  {
    id: 'SCENARIO-06-HITL-ESCALATION',
    title: 'Caso F: Ambigüedad Crítica / Escalado HITL Urgente (SLA < 45s)',
    subtitle: 'Reflejos ópticos confusos y etiqueta con inconsistencia de escaneo.',
    expectedOutcome: 'ESCALATE_HITL',
    figure: CATALOG_FIGURES[1],
    returnReason: 'producto_diferente',
    hasOfficialBox: false,
    isSealedBlister: false,
    simulatedBootleg: false,
    simulatedDamageSeverity: 'subtle_under_threshold',
    capturedImageUrl: createFigureSvg('Naruto (Luz Reflejada)', '#f59e0b', 'REFLEJO COMPLEJO', 'CONFIANZA 0.54 < 0.60 · DERIVACIÓN HUMANA', false),
    description: 'El algoritmo obtiene un índice de confianza de 0.54 (< 0.60). El subagente Incidence Router bloquea la terminal e invoca trigger_hitl() inmediatamente.',
    tags: ['HITL', 'SLA < 45s', 'Intervención humana']
  }
];
