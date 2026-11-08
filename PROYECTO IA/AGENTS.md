# Sistema de Agentes para Devoluciones (CMR)

## Objetivo
Automatizar y optimizar el proceso de devoluciones en el entorno Retail E-commerce (flujos de confianza, posventa y fricciones comerciales), utilizando agentes de Inteligencia Artificial para la validación inicial, control de calidad y aprobación financiera, mientras se mantiene una estricta gobernanza.

## Pasos del Proceso (Flujo Agéntico)
1. **Triage Agent**: El cliente solicita la devolución. El agente clasifica el motivo y exige evidencias digitales acordes (fotos o QR del empaque).
2. **Quality Inspector**: Una vez que la logística entrega el artículo en el depósito central, este agente compara el estado físico contra la evidencia del cliente.
3. **Approval Agent**: Tras la validación, decide el mecanismo de reembolso (cupón digital vs. reversión bancaria) y escala a revisión humana en caso de errores de API de pagos o riesgos.

## LÍMITES Y REGLAS ESTRICTAS
1. **Datos Sintéticos Únicamente**: Queda estrictamente prohibido utilizar datos reales de clientes, tarjetas de crédito reales o correos electrónicos reales en desarrollo y pruebas. Todo el flujo debe usar mocks.
2. **Ley de Protección de Datos (N° 18.331 - Uruguay)**:
   - **Veracidad y Calidad**: Confirmación doble de identidad al ingreso.
   - **Finalidad**: La evidencia recabada se utilizará exclusivamente para el proceso de devolución.
   - **Humano en el Circuito (HITL)**: Obligatorio para resoluciones financieras complejas, errores de reversión (API dLocal/Stripe) o transferencias bancarias directas.
3. **Archivos Restringidos (NO TOCAR)**:
   - Los agentes tienen prohibido modificar los archivos `.env`, `credentials/*`, `config/production.yml` o cualquier acceso a pasarelas reales.

## Cómo correr el sistema
1. Asegúrate de estar usando datos mockeados en `data/synthetic_returns.json`.
2. Para probar un flujo completo, invoca al primer agente (triage_agent) enviándole un mensaje simulado de solicitud de devolución.
3. Observa cómo el resultado se encadena con los siguientes agentes.
