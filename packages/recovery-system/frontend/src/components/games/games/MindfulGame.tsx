'use client';
import React, { useState, useEffect, useRef } from 'react';
import { GameProgress } from '@/types/games.types';

// ═══════════════════════════════════════════════════════════
//  MINDFUL GAME — Guided breathing + mindfulness exercises
//  Theme: Teal/ocean
//  Mechanic: Complete breathing rounds, unlock exercises
// ═══════════════════════════════════════════════════════════

interface Props {
  progress: GameProgress;
  onUpdateProgress: (u: Partial<GameProgress>) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'rest' | 'done';

const EXERCISES = [
  { id: 'x1', icon: '🧘', name: 'Body Scan',         desc: 'Notice each part of your body without judgment.',    pts: 20, mins: 5  },
  { id: 'x2', icon: '🌊', name: 'Ocean Breathing',    desc: 'Breathe slowly like waves washing on the shore.',    pts: 15, mins: 3  },
  { id: 'x3', icon: '🌸', name: 'Loving Kindness',    desc: 'Send compassion to yourself and those around you.',  pts: 25, mins: 7  },
  { id: 'x4', icon: '🍃', name: 'Mindful Walking',    desc: 'Walk slowly, noticing each step and your surroundings.', pts: 20, mins: 10 },
];

const BREATH_CYCLE = { inhale: 4, hold: 4, exhale: 6, rest: 2 }; // seconds
const TOTAL_ROUNDS = 5;

const getToday = () => new Date().toISOString().slice(0, 10);

export default function MindfulGame({ progress, onUpdateProgress, showToast }: Props) {
  // Pull saved data from backend
  const saved = (progress as any).mindfulData ?? {};
  const [roundsDone,   setRoundsDone]   = useState(saved.roundsCompleted ?? 0);
  const [exDone,       setExDone]       = useState<string[]>(saved.exercisesDoneToday ?? []);
  const [totalSessions, setTotalSessions] = useState(saved.totalSessions ?? 0);
  const [totalPts,     setTotalPts]     = useState(progress.totalPoints ?? 0);

  // Breathing state
  const [phase,   setPhase]   = useState<Phase>('idle');
  const [tick,    setTick]    = useState(0);
  const [round,   setRound]   = useState(0);
  const [exBusy,  setExBusy]  = useState<string | null>(null);

  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>('idle');
  const tickRef  = useRef(0);
  const roundRef = useRef(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { tickRef.current  = tick;  }, [tick]);
  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => () => { if (iv.current) clearInterval(iv.current); }, []);

  const newDay  = saved.lastSessionDate !== getToday();
  const exToday = newDay ? [] : exDone;

  function startBreathing() {
    setPhase('inhale'); setTick(BREATH_CYCLE.inhale); setRound(1);
    iv.current = setInterval(() => {
      setTick(prev => {
        if (prev <= 1) {
          // Advance phase
          const p = phaseRef.current;
          const r = roundRef.current;
          if (p === 'inhale') { setPhase('hold');   return BREATH_CYCLE.hold; }
          if (p === 'hold')   { setPhase('exhale');  return BREATH_CYCLE.exhale; }
          if (p === 'exhale') {
            if (r >= TOTAL_ROUNDS) {
              // Done!
              clearInterval(iv.current!); iv.current = null;
              setPhase('done');
              const newRounds = roundsDone + TOTAL_ROUNDS;
              const newSessions = totalSessions + 1;
              const pts = totalPts + 30;
              setRoundsDone(newRounds); setTotalSessions(newSessions); setTotalPts(pts);
              onUpdateProgress({
                ...(({} as any).mindfulData !== undefined ? {} : {}),
                totalPoints:   pts,
                currentStreak: (progress.currentStreak ?? 0) + 1,
                lastPlayed:    new Date().toISOString(),
              } as any).catch(() => {});
              showToast('Breathing session complete! +30 pts 🧘', 'success');
              return 0;
            }
            setRound(r => r + 1); setPhase('rest'); return BREATH_CYCLE.rest;
          }
          if (p === 'rest')   { setPhase('inhale');  return BREATH_CYCLE.inhale; }
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopBreathing() {
    if (iv.current) { clearInterval(iv.current); iv.current = null; }
    setPhase('idle'); setTick(0); setRound(0);
  }

  async function doExercise(ex: typeof EXERCISES[0]) {
    if (exBusy || exToday.includes(ex.id)) return;
    setExBusy(ex.id);
    try {
      const updated = [...exToday, ex.id];
      const pts = totalPts + ex.pts;
      setExDone(updated); setTotalPts(pts);
      await onUpdateProgress({
        totalPoints: pts,
        lastPlayed:  new Date().toISOString(),
      } as any);
      showToast(`${ex.name} done! +${ex.pts} pts ✨`, 'success');
    } catch { showToast('Save failed', 'error'); }
    finally { setExBusy(null); }
  }

  // Breathing ring animation
  const phases = ['inhale', 'hold', 'exhale', 'rest'];
  const maxTick = phase === 'inhale' ? BREATH_CYCLE.inhale : phase === 'hold' ? BREATH_CYCLE.hold : phase === 'exhale' ? BREATH_CYCLE.exhale : BREATH_CYCLE.rest;
  const ringPct = phase === 'idle' || phase === 'done' ? 0 : (maxTick - tick) / maxTick;
  const ringSize = phase === 'inhale' ? 0.4 + ringPct * 0.6 : phase === 'exhale' ? 1 - ringPct * 0.6 : phase === 'hold' ? 1 : 0.4;

  const phaseLabel: Record<Phase, string> = {
    idle:   'Press Start to begin',
    inhale: `Breathe In… (${tick}s)`,
    hold:   `Hold… (${tick}s)`,
    exhale: `Breathe Out… (${tick}s)`,
    rest:   `Rest… (${tick}s)`,
    done:   'Session Complete! 🎉',
  };
  const phaseColor: Record<Phase, string> = {
    idle: '#0d9488', inhale: '#0891b2', hold: '#7c3aed',
    exhale: '#059669', rest: '#d97706', done: '#16a34a',
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', fontFamily: "'Inter',sans-serif" }}>

      {/* ══ TEAL HEADER ══ */}
      <div style={{ background: 'linear-gradient(135deg,#0f766e,#0d9488)', borderRadius: '24px 24px 0 0', padding: '14px 24px', textAlign: 'center' }}>
        <span style={{ color: '#ccfbf1', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.14em' }}>
          🧘 MINDFUL — BREATHING & MINDFULNESS
        </span>
      </div>

      {/* ══ STATS ROW ══ */}
      <div style={{ background: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)', border: '1px solid #99f6e4', borderTop: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', padding: '14px 0' }}>
        {[
          { icon: '🌬️', val: roundsDone, label: 'Rounds Done'    },
          { icon: '🏅', val: totalSessions, label: 'Sessions'      },
          { icon: '⭐', val: `${totalPts} pts`, label: 'Total Points' },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: '8px 12px', borderLeft: i > 0 ? '1px solid #99f6e4' : 'none' }}>
            <div style={{ fontSize: 22, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#134e4a' }}>{s.val}</div>
            <div style={{ fontSize: 10.5, color: '#0f766e', marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ BREATHING CIRCLE ══ */}
      <div style={{ background: '#fff', border: '1px solid #99f6e4', borderTop: 'none', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f766e', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Box Breathing — {TOTAL_ROUNDS} Rounds
        </div>

        {/* Animated ring */}
        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 20px' }}>
          {/* Outer static ring */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #ccfbf1' }} />
          {/* Animated fill circle */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: `${ringSize * 160}px`,
              height: `${ringSize * 160}px`,
              borderRadius: '50%',
              background: phase === 'idle' || phase === 'done'
                ? 'radial-gradient(circle,#ccfbf1,#99f6e4)'
                : `radial-gradient(circle,${phaseColor[phase]}33,${phaseColor[phase]}88)`,
              border: `3px solid ${phaseColor[phase]}`,
              transition: 'all .8s ease-in-out',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
              boxShadow: phase === 'idle' ? 'none' : `0 0 30px ${phaseColor[phase]}44`,
            }}>
              <div style={{ fontSize: phase === 'done' ? 36 : 42, lineHeight: 1 }}>
                {phase === 'done' ? '✨' : phase === 'idle' ? '🌊' : phase === 'inhale' ? '🫁' : phase === 'hold' ? '⏸' : phase === 'exhale' ? '💨' : '😌'}
              </div>
              {phase !== 'idle' && phase !== 'done' && (
                <div style={{ fontSize: 28, fontWeight: 900, color: phaseColor[phase], marginTop: 4, lineHeight: 1 }}>{tick}</div>
              )}
            </div>
          </div>
          {/* Round indicator */}
          {round > 0 && phase !== 'done' && (
            <div style={{ position: 'absolute', top: -8, right: -8, background: '#0d9488', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
              {round}/{TOTAL_ROUNDS}
            </div>
          )}
        </div>

        {/* Phase label */}
        <div style={{ fontSize: 17, fontWeight: 700, color: phaseColor[phase], marginBottom: 8, minHeight: 28 }}>
          {phaseLabel[phase]}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 24 }}>
          Inhale 4s → Hold 4s → Exhale 6s → Rest 2s
        </div>

        {/* Phase dots */}
        {phase !== 'idle' && phase !== 'done' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            {phases.map(p => (
              <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 11, color: phase === p ? phaseColor[p as Phase] : '#9ca3af', fontWeight: phase === p ? 700 : 400, textTransform: 'capitalize' }}>{p}</div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: phase === p ? phaseColor[p as Phase] : '#e5e7eb' }} />
              </div>
            ))}
          </div>
        )}

        {/* Button */}
        {phase === 'idle' || phase === 'done'
          ? <button onClick={startBreathing} style={{ width: '100%', padding: 15, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0f766e,#0d9488)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(15,118,110,.4)' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              {phase === 'done' ? '🌊 Start Another Session' : '🌊 Start Breathing Session (+30 pts)'}
            </button>
          : <button onClick={stopBreathing} style={{ width: '100%', padding: 14, borderRadius: 14, background: '#fff', border: '2px solid #f87171', color: '#dc2626', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              ✕ Stop Session
            </button>
        }
      </div>

      {/* ══ MINDFULNESS EXERCISES ══ */}
      <div style={{ background: 'linear-gradient(135deg,#f0fdfa,#ecfdf5)', border: '1px solid #99f6e4', borderTop: 'none', borderRadius: '0 0 24px 24px', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#134e4a' }}>🌸 Mindfulness Exercises</div>
          <div style={{ fontSize: 12, color: '#0f766e', background: '#ccfbf1', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
            {exToday.length}/{EXERCISES.length} done today
          </div>
        </div>
        {EXERCISES.map(ex => {
          const done = exToday.includes(ex.id);
          const busy = exBusy === ex.id;
          return (
            <button key={ex.id} onClick={() => doExercise(ex)} disabled={done || !!exBusy}
              style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 16px', borderRadius: 14, border: `2px solid ${done ? '#6ee7b7' : '#99f6e4'}`, background: done ? 'linear-gradient(135deg,#d1fae5,#a7f3d0)' : '#fff', marginBottom: 10, cursor: done ? 'default' : exBusy ? 'wait' : 'pointer', textAlign: 'left', transition: 'all .2s' }}
              onMouseEnter={e => { if (!done && !exBusy) e.currentTarget.style.background = '#f0fdfa'; }}
              onMouseLeave={e => { if (!done) e.currentTarget.style.background = '#fff'; }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: done ? '#6ee7b7' : '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {busy ? '⌛' : done ? '✓' : ex.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: done ? '#065f46' : '#134e4a', marginBottom: 3 }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: done ? '#047857' : '#6b7280', lineHeight: 1.4 }}>{ex.desc}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>⏱ {ex.mins} min</div>
              </div>
              <div style={{ background: done ? '#059669' : 'linear-gradient(135deg,#0d9488,#0f766e)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: done ? 'none' : '0 2px 8px rgba(13,148,136,.3)' }}>
                {done ? '✓ Done' : `+${ex.pts} pts`}
              </div>
            </button>
          );
        })}
        <div style={{ padding: '10px 16px', background: 'rgba(13,148,136,.08)', borderRadius: 12, fontSize: 12, color: '#0f766e', border: '1px solid #99f6e4', textAlign: 'center', fontWeight: 500 }}>
          💡 Complete exercises daily for bonus points. Resets at midnight.
        </div>
      </div>
    </div>
  );
}
