// Synthesized UI sound effects using Web Audio API (reliable, zero external assets)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKioskBeep(freq = 600, duration = 0.08, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio optional
  }
}

export function playCameraShutterSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Click 1
    playKioskBeep(1200, 0.04, 'triangle');
    setTimeout(() => {
      // Click 2
      playKioskBeep(800, 0.06, 'triangle');
    }, 60);
  } catch {
    // Audio optional
  }
}

export function playMechanicalDoorSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playKioskBeep(220, 0.15, 'sawtooth');
    setTimeout(() => {
      playKioskBeep(330, 0.12, 'square');
    }, 80);
  } catch {
    // Audio optional
  }
}

export function playUrgentHitlAlarm() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    playKioskBeep(880, 0.1, 'sine');
    setTimeout(() => playKioskBeep(1100, 0.12, 'sine'), 120);
  } catch {
    // Audio optional
  }
}
