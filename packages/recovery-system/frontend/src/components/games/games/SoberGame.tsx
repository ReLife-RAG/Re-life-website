'use client';
import React, { useState } from 'react';
import { GameProgress } from '@/types/games.types';

interface Props {
  progress: GameProgress;
  onUpdateProgress: (u: Partial<GameProgress>) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}

const MILESTONES = [
  { days: 1,  label: 'Day 1',   icon: '🌱' },
  { days: 3,  label: '3 Days',  icon: '🌿' },
  { days: 7,  label: '1 Week',  icon: '⭐' },
  { days: 14, label: '2 Weeks', icon: '🔥' },
  { days: 30, label: '1 Month', icon: '🏆' },
  { days: 90, label: '90 Days', icon: '💎' },
];

const getToday = () => new Date().toISOString().slice(0, 10);

export default function SoberGame({ progress, onUpdateProgress, showToast }: Props) {
  const [loading, setLoading] = useState(false);

  const s         = progress.soberData;
  const days      = s?.daysSober  ?? 0;
  const money     = s?.moneySaved ?? days * 12;
  const hours     = s?.hoursSober ?? days * 24;
  const pledged   = !!(s?.pledgedToday || s?.lastPledgeDate === getToday());
  const nextMs    = MILESTONES.find(m => days < m.days);
  const pct       = nextMs ? Math.round((days / nextMs.days) * 100) : 100;
  const badge     = days >= 90 ? '💎 Diamond' : days >= 30 ? '🏆 Gold' : days >= 7 ? '⭐ Silver' : '🌱 Bronze';

  async function makePledge() {
    if (pledged || loading) return;
    setLoading(true);
    try {
      const nd = days + 1;
      await onUpdateProgress({
        soberData: {
          ...s,
          daysSober: nd, pledgedToday: true, lastPledgeDate: getToday(),
          moneySaved: nd * 12, hoursSober: nd * 24, milestones: s?.milestones ?? [],
        },
        totalPoints: (progress.totalPoints ?? 0) + 10,
        currentStreak: (progress.currentStreak ?? 0) + 1,
      });
      showToast(`Day ${nd} — Keep going! +10 pts 🎉`, 'success');
    } catch (e: any) {
      showToast(e?.message ?? 'Already pledged today', 'error');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', fontFamily: "'Inter',sans-serif" }}>

      {/* ══ GREEN HEADER ══ */}
      <div style={{ background: 'linear-gradient(135deg,#1a5c3a,#3a9a60)', borderRadius: '22px 22px 0 0', padding: '12px 24px', textAlign: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.12em' }}>
          🌿 I AM SOBER — SOBRIETY TRACKER
        </span>
      </div>

      {/* ══ HERO COUNT ══ */}
      <div style={{ background: 'linear-gradient(160deg,#edfaf3,#d4f0e2)', border: '1px solid #9adbb8', borderTop: 'none', padding: '36px 28px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 100, fontWeight: 900, color: '#1a5c3a', lineHeight: 1, letterSpacing: -5, marginBottom: 6 }}>{days}</div>
        <div style={{ fontSize: 18, color: '#2d7a50', fontWeight: 700, marginBottom: 24 }}>
          {days === 1 ? 'Day Sober 🌿' : 'Days Sober 🌿'}
        </div>

        {nextMs && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#2d6a48', fontWeight: 600, marginBottom: 6 }}>
              <span>Progress to {nextMs.label} {nextMs.icon}</span>
              <span>{days} / {nextMs.days}</span>
            </div>
            <div style={{ background: 'rgba(30,100,60,.15)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#3a9a60,#1a5c3a)', borderRadius: 8, transition: 'width .6s' }} />
            </div>
          </div>
        )}

        <button onClick={makePledge} disabled={pledged || loading}
          style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 800, cursor: pledged ? 'default' : 'pointer', background: pledged ? '#2d6a48' : '#3a9a60', color: '#fff', opacity: loading ? .7 : 1, transition: 'all .2s', boxShadow: pledged ? 'none' : '0 4px 16px rgba(30,100,60,.35)' }}
          onMouseEnter={e => { if (!pledged) e.currentTarget.style.background = '#2d7a50'; }}
          onMouseLeave={e => { if (!pledged) e.currentTarget.style.background = '#3a9a60'; }}>
          {loading ? '⌛ Saving…' : pledged ? '✅ Pledged Today!' : "🤝 Make Today's Pledge  (+10 pts)"}
        </button>
        {!pledged && <p style={{ fontSize: 12, color: '#4a7a5a', marginTop: 8 }}>Pledge every day to keep your streak alive</p>}
      </div>

      {/* ══ STATS ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '1px solid #9adbb8', borderTop: '1px dashed #9adbb8' }}>
        {[
          { icon: '⏰', val: `${hours}h`,   label: 'Hours Sober'  },
          { icon: '💰', val: `$${money}`,   label: 'Money Saved'  },
          { icon: '🏅', val: badge,          label: 'Your Badge'   },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: '18px 12px', textAlign: 'center', background: '#f4fbf7', borderLeft: i > 0 ? '1px solid #9adbb8' : 'none' }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a4a2c' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#4a8a60', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ MILESTONES ══ */}
      <div style={{ background: '#fff', border: '1px solid #9adbb8', borderTop: 'none', borderRadius: '0 0 22px 22px', padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a4a2c', marginBottom: 14 }}>🎯 Milestones</div>
        {MILESTONES.map(m => {
          const done = days >= m.days;
          const cur  = nextMs?.days === m.days;
          return (
            <div key={m.days} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, marginBottom: 6, background: done ? '#e8f7ee' : cur ? '#fffbe6' : '#f8f9fa', border: `1px solid ${done ? '#9adbb8' : cur ? '#f0d080' : '#e2ebe6'}` }}>
              <span style={{ fontSize: 22, opacity: done ? 1 : .25 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: done ? '#1a4a2c' : '#222' }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#7a8f86' }}>{m.days} days</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: done ? '#3a9a60' : cur ? '#b87a00' : '#b0c4bb' }}>
                {done ? '✓ Done' : cur ? `${m.days - days}d left` : '🔒'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
