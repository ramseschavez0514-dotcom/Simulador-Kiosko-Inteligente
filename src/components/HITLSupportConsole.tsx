import React, { useState, useEffect } from 'react';
import { HITLTicket } from '../types/kiosk';
import { 
  Headset, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Send
} from 'lucide-react';
import { playKioskBeep, playUrgentHitlAlarm } from '../utils/audio';

interface HITLSupportConsoleProps {
  tickets: HITLTicket[];
  onResolveTicket: (ticketId: string, resolution: 'APPROVE' | 'REJECT' | 'REQUEST_NEW_ANGLE' | 'RETURNED_TO_STEP_5', notes: string) => void;
  doorLocked: boolean;
}

export const HITLSupportConsole: React.FC<HITLSupportConsoleProps> = ({
  tickets,
  onResolveTicket,
  doorLocked
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.ticketId || '');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [secondsRemainingMap, setSecondsRemainingMap] = useState<Record<string, number>>({});

  const activeTicket = tickets.find((t) => t.ticketId === selectedTicketId) || tickets[0];

  // SLA < 45s countdown timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemainingMap((prev) => {
        const next: Record<string, number> = {};
        tickets.forEach((t) => {
          if (t.status === 'PENDING') {
            const current = prev[t.ticketId] !== undefined ? prev[t.ticketId] : t.remainingSeconds;
            const updated = Math.max(0, current - 1);
            next[t.ticketId] = updated;
            if (updated === 10) {
              playUrgentHitlAlarm();
            }
          } else {
            next[t.ticketId] = 0;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tickets]);

  const handleResolve = (resolution: 'APPROVE' | 'REJECT' | 'REQUEST_NEW_ANGLE' | 'RETURNED_TO_STEP_5') => {
    if (!activeTicket) return;
    playKioskBeep(1000, 0.1);
    onResolveTicket(activeTicket.ticketId, resolution, resolutionNotes || 'Resolución manual emitida por operador de soporte.');
    setResolutionNotes('');
  };

  const currentSeconds = activeTicket
    ? secondsRemainingMap[activeTicket.ticketId] !== undefined
      ? secondsRemainingMap[activeTicket.ticketId]
      : activeTicket.remainingSeconds
    : 45;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* SLA & Operator Telemetry Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/80">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Panel de Soporte HITL (Human-in-the-Loop)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold">
                  SLA CRÍTICO &lt; 45s
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Intervención remota para el 20% de casos con ambigüedad visual, dudas de catálogo o riesgo medio/alto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">COLA PENDIENTE</span>
              <span className="text-amber-400 font-bold text-sm">
                {tickets.filter((t) => t.status === 'PENDING').length} en espera
              </span>
            </div>
            <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CUMPLIMIENTO SLA</span>
              <span className="text-emerald-400 font-bold text-sm">99.8% (&lt; 45s)</span>
            </div>
            <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PRIVACIDAD</span>
              <span className="text-cyan-400 font-bold text-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Ley 18.331
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main HITL Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tickets Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Cola de Casos Escalados
            </h3>
            <span className="text-xs font-mono text-slate-400">{tickets.length} casos</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {tickets.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No hay casos pendientes en este momento. El 80% autónomo está operando normalmente.
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = activeTicket?.ticketId === t.ticketId;
                const secs = secondsRemainingMap[t.ticketId] !== undefined ? secondsRemainingMap[t.ticketId] : t.remainingSeconds;
                const isPending = t.status === 'PENDING';

                return (
                  <div
                    key={t.ticketId}
                    onClick={() => {
                      playKioskBeep(600, 0.04);
                      setSelectedTicketId(t.ticketId);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        {t.kioskId}
                      </span>
                      {isPending ? (
                        <div
                          className={`flex items-center gap-1 font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            secs <= 10
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                              : secs <= 25
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{secs}s SLA</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono font-semibold text-emerald-400">
                          {t.status.replace('RESOLVED_', '')}
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      <span className="text-xs font-semibold text-white truncate block">
                        {t.order.product.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Motivo: <span className="text-slate-300">{t.claimedReason}</span>
                      </span>
                      <span className="text-[10px] text-amber-300 block mt-1 line-clamp-1">
                        Gatillo: {t.triggerReason}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Active Case Review & Resolution Actions */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
          {activeTicket ? (
            <>
              {/* Header of Active Ticket */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      TICKET {activeTicket.ticketId}
                    </span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="text-xs text-slate-400">Terminal: {activeTicket.kioskId}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {activeTicket.order.product.name}
                  </h3>
                </div>

                {activeTicket.status === 'PENDING' ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        Tiempo restante cliente en kiosco:
                      </span>
                      <div
                        className={`text-xl font-mono font-black ${
                          currentSeconds <= 10
                            ? 'text-rose-400 animate-pulse'
                            : currentSeconds <= 25
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {currentSeconds}s
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold">
                    Caso Resuelto: {activeTicket.status}
                  </div>
                )}
              </div>

              {/* Dossier Comparison: Camera vs Subagents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Evidence from Kiosk */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-cyan-300 flex items-center justify-between">
                    <span>Captura Cenital de la Terminal</span>
                    <span className="text-[10px] font-mono text-slate-400">1080p RAW</span>
                  </span>
                  <div className="w-full h-48 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden border border-slate-800">
                    <img
                      src={activeTicket.panoramicCaptureUrl || activeTicket.order.product.officialFigureImage}
                      alt="Captura cenital"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Reclamo del cliente:</span>
                      <span className="font-semibold text-white">{activeTicket.claimedReason}</span>
                    </div>
                    {activeTicket.claimedDamageSubcategory && (
                      <div className="flex justify-between">
                        <span>Subcategoría de daño:</span>
                        <span className="font-semibold text-amber-300">{activeTicket.claimedDamageSubcategory}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Empaque oficial en bandeja:</span>
                      <span className="text-slate-300">
                        {activeTicket.inspectionResult.vision_auditor.box_detected ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subagents Analysis Traces */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center justify-between">
                    <span>Diagnóstico de Subagentes IA</span>
                    <span className="text-[10px] font-mono text-slate-400">Flash & Pro</span>
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <span className="font-semibold text-cyan-300 block text-[11px]">
                        1. vision_auditor
                      </span>
                      <div className="text-[11px] text-slate-300 mt-1 flex justify-between">
                        <span>Confianza visual:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {(activeTicket.inspectionResult.vision_auditor.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {activeTicket.inspectionResult.vision_auditor.notes || 'Auditoría completa.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                      <span className="font-semibold text-purple-300 block text-[11px]">
                        2. fraud_damage_validator
                      </span>
                      <div className="text-[11px] text-slate-300 mt-1 flex justify-between">
                        <span>Riesgo fraude:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {activeTicket.inspectionResult.fraud_damage_validator.fraud_risk}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {activeTicket.inspectionResult.fraud_damage_validator.damage_details?.visual_match_notes || 'Peritaje ejecutado.'}
                      </p>
                    </div>

                    <div className="p-2 rounded bg-amber-950/40 border border-amber-900/60">
                      <span className="text-[10px] font-semibold text-amber-300 uppercase block">
                        Causa de derivación HITL:
                      </span>
                      <span className="text-xs text-amber-200">
                        {activeTicket.triggerReason}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operator Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas u Observaciones del Operador (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Se corrobora empaque original en orden; aprobación excepcional concedida..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Human Action Dispatchers */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-3">
                  Resolución Inmediata de la Terminal (SLA &lt; 45s):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => handleResolve('APPROVE')}
                    disabled={activeTicket.status !== 'PENDING'}
                    className="p-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar Devolución</span>
                    <span className="text-[10px] font-normal opacity-80">(Pasa a Paso 12)</span>
                  </button>

                  <button
                    onClick={() => handleResolve('REJECT')}
                    disabled={activeTicket.status !== 'PENDING'}
                    className="p-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40 shadow-md"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar por Fraude</span>
                    <span className="text-[10px] font-normal opacity-80">(Destraba compuerta)</span>
                  </button>

                  <button
                    onClick={() => handleResolve('REQUEST_NEW_ANGLE')}
                    disabled={activeTicket.status !== 'PENDING'}
                    className="p-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40 shadow-md"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Pedir Nuevo Ángulo</span>
                    <span className="text-[10px] font-normal opacity-80">(Retoma Paso 8)</span>
                  </button>

                  <button
                    onClick={() => handleResolve('RETURNED_TO_STEP_5')}
                    disabled={activeTicket.status !== 'PENDING'}
                    className="p-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40 shadow-md"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Discrepancia</span>
                    <span className="text-[10px] font-normal opacity-80">(Regresar a Paso 5)</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              No hay tickets seleccionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
