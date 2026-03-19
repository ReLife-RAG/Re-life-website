'use client';
import React from 'react';
import { Game, GameProgress } from '@/types/games.types';

// ── 4 original games ──────────────────────────────────────────────────────────
import SoberGame    from './games/SoberGame';
import ForestGame   from './games/ForestGame';
import HabiticaGame from './games/HabiticaGame';
import BraverGame   from './games/BraverGame';

// ── 2 new games ───────────────────────────────────────────────────────────────
import MindfulGame  from './games/MindfulGame';
import JournalGame  from './games/JournalGame';

const CAT_LABEL: Record<string, string> = {
  substance:    'Drug & Substance',
  social:       'Social Media',
  behavioral:   'General Behavioral',
  pornography:  'Pornography',
  screen:       'Screen Time',
  mindfulness:  'Mindfulness',
};

interface Props {
  game:             Game;
  progress:         GameProgress;
  onBack:           () => void;
  onUpdateProgress: (u: Partial<GameProgress>) => Promise<void>;
  showToast:        (m: string, t?: 'success' | 'error' | 'info') => void;
}

export default function GameOverlay({ game, progress, onBack, onUpdateProgress, showToast }: Props) {

  // Each case maps to a completely different file — no shared code possible
  const renderGame = () => {
    const props = { progress, onUpdateProgress, showToast };
    switch (game.name) {
      case 'sober':    return <SoberGame    {...props} />;   // green,  sobriety tracker
      case 'forest':   return <ForestGame   {...props} />;   // brown,  focus timer
      case 'habitica': return <HabiticaGame {...props} />;   // purple, RPG tasks
      case 'braver':   return <BraverGame   {...props} />;   // amber,  decision game
      case 'mindful':  return <MindfulGame  {...props} />;   // teal,   breathing
      case 'journal':  return <JournalGame  {...props} />;   // rose,   journaling
      default:
        return (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#7a8f86' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{game.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2e26', marginBottom: 8 }}>{game.title}</div>
            <div style={{ fontSize: 13 }}>Game coming soon!</div>
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: '#f4f6f5', overflowY: 'auto', fontFamily: "'Inter',sans-serif" }}>
      {/* NO yellow topbar — app layout already has one */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2ebe6', display: 'flex', alignItems: 'center', padding: '0 24px', height: 54, gap: 10, position: 'sticky', top: 0, zIndex: 10 }}>
        <BackBtn onClick={onBack} />
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1a2e26' }}>{game.title}</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3a8a58', background: '#e6f5ec', borderRadius: 20, padding: '3px 11px' }}>
          {CAT_LABEL[game.category] ?? game.category}
        </span>
        <div style={{ flex: 1 }} />
        <FavBtn onClick={() => showToast('Added to favourites! ⭐')} />
      </nav>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 18px 56px' }}>
        {renderGame()}
      </div>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 5, background: h ? '#e8f7ee' : '#f4f6f5', border: `1.5px solid ${h ? '#5bbf7a' : '#e2ebe6'}`, borderRadius: 20, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, color: h ? '#5bbf7a' : '#1a2e26', cursor: 'pointer', transition: 'all .15s' }}>
      ← Back to Games
    </button>
  );
}

function FavBtn({ onClick }: { onClick: () => void }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? '#52b56e' : '#6dcb88', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }}>
      ⭐ Favourite
    </button>
  );
}
