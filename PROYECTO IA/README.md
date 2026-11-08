# Proyecto IA - Sistema de Devoluciones CMR

Este proyecto implementa la orquestación de agentes de IA para el proceso de devolución de productos en Retail y E-commerce, según la documentación técnica y flujos de negocio definidos.

## Arquitectura de Agentes

El sistema delega la lógica en tres agentes alojados bajo `.claude/agents/`:

1. `triage_agent.md`: Agente rápido (`haiku`) para captura de solicitudes y validación de reglas deterministas/clasificación de motivos.
2. `quality_inspector.md`: Agente rápido (`haiku`) para cruzar la inspección física en depósito con las evidencias fotográficas.
3. `approval_agent.md`: Agente profundo (`opus`) responsable de emitir órdenes de reembolso financiero y escalar casos complejos a un supervisor humano.

## Configuración y Límites
Todo el sistema está diseñado bajo estrictas normas de **Gobernanza de Datos (Ley N° 18.331 de Uruguay)**, operando bajo el supuesto de un esquema seguro que frena el proceso (HITL) en caso de contingencias bancarias o sospecha de fraude.

Para ejecutar y probar el sistema localmente, refiérase a `AGENTS.md` y asegúrese de utilizar exclusivamente bases de datos y APIs sintéticas o mockeadas. **No utilice credenciales de producción.**
