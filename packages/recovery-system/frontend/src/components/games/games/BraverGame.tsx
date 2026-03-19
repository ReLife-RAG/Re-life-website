'use client';
import React, { useState } from 'react';
import { GameProgress } from '@/types/games.types';

interface Props {
  progress: GameProgress;
  onUpdateProgress: (u: Partial<GameProgress>) => Promise<void>;
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void;
}

// ████████████████████████████████████████████
//   THIS IS: BRAVER GAME — DECISION STORY GAME
//   You face real-life scenarios.
//   Make strong choices → earn points + streak.
//   Make weak choices → lose willpower.
// ████████████████████████████████████████████

interface Scenario {
  id: string;
  situation: string;
  icon: string;
  options: { text: string; pts: number; feedback: string; strong: boolean }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', icon: '📱', situation: 'You feel a strong urge to check social media...',
    options: [
      { text: '📱 Open Instagram',             pts: -10, feedback: 'That fed the urge. Try to resist next time.', strong: false },
      { text: '🚶 Go for a 10-min walk',        pts: +15, feedback: 'Great choice! Physical activity beats cravings.', strong: true  },
      { text: '📞 Call a trusted friend',       pts: +20, feedback: 'Excellent! Connecting with people builds strength.', strong: true  },
    ]
  },
  {
    id: 's2', icon: '😰', situation: 'You feel stressed and anxious right now...',
    options: [
      { text: '📺 Watch random videos for hours',  pts: -5,  feedback: 'Numbing the feeling doesn\'t fix it.', strong: false },
      { text: '🧘 Do a 5-min breathing exercise',  pts: +15, feedback: 'Smart move! Breathing calms the nervous system.', strong: true  },
      { text: '📓 Write how you feel in a journal', pts: +10, feedback: 'Journaling helps you understand your emotions.', strong: true  },
    ]
  },
  {
    id: 's3', icon: '🌙', situation: 'It\'s late at night and you can\'t sleep...',
    options: [
      { text: '📱 Scroll through your phone',     pts: -15, feedback: 'Blue light makes sleep harder. Avoid screens!', strong: false },
      { text: '📚 Read a physical book',           pts: +10, feedback: 'Reading helps your brain wind down naturally.', strong: true  },
      { text: '🧘 Try a sleep meditation',         pts: +20, feedback: 'Perfect. Meditation is proven to improve sleep.', strong: true  },
    ]
  },
  {
    id: 's4', icon: '😤', situation: 'Someone annoyed you and you feel like arguing...',
    options: [
      { text: '💢 Respond angrily right now',     pts: -10, feedback: 'Acting in anger usually makes things worse.', strong: false },
      { text: '😤 Take 10 deep breaths first',    pts: +15, feedback: 'Smart! Pause before reacting — real strength.', strong: true  },
      { text: '🤝 Talk it out calmly later',       pts: +25, feedback: 'Excellent maturity. You controlled your emotions.', strong: true  },
    ]
  },
  {
    id: 's5', icon: '🎮', situation: 'You planned to study but friends want to play games...',
    options: [
      { text: '🎮 Skip studying, play all night',  pts: -10, feedback: 'Giving up your goals hurts your confidence.', strong: false },
      { text: '⏰ Study 2 hrs then join them',     pts: +20, feedback: 'Balance! You kept your commitment AND had fun.', strong: true  },
      { text: '📚 Stick to your study plan',       pts: +15, feedback: 'Discipline! Your future self thanks you.', strong: true  },
    ]
  },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function BraverGame({ progress, onUpdateProgress, showToast }: Props) {
  const b = progress.braverData;
  const [daysStrong, setDaysStrong] = useState(b?.daysStrong ?? 0);
  const [checkedIn,  setCheckedIn]  = useState(b?.lastCheckinDate === today());
  const [ciLoading,  setCiLoading]  = useState(false);
  const [score,      setScore]      = useState(0);
  const [idx,        setIdx]        = useState(0);
  const [feedback,   setFeedback]   = useState<{ text: string; pts: number; strong: boolean } | null>(null);
  const [gameOver,   setGameOver]   = useState(false);
  const [willpower,  setWillpower]  = useState(100);

  const scenario = SCENARIOS[idx % SCENARIOS.length];

  function choose(opt: Scenario['options'][0]) {
    const newWp  = Math.min(100, Math.max(0, willpower + opt.pts));
    const newScore = score + Math.max(0, opt.pts);
    setWillpower(newWp);
    setScore(newScore);
    setFeedback({ text: opt.feedback, pts: opt.pts, strong: opt.strong });

    setTimeout(() => {
      setFeedback(null);
      if (idx + 1 >= SCENARIOS.length) {
        setGameOver(true);
      } else {
        setIdx(idx + 1);
      }
    }, 1800);
  }

  async function handleCheckIn() {
    if (checkedIn || ciLoading) return;
    setCiLoading(true);
    try {
      const nd = daysStrong + 1;
      await onUpdateProgress({
        braverData: { ...b, daysStrong: nd, checkedInToday: true, lastCheckinDate: today(), challengesCompleted: b?.challengesCompleted ?? 0, challengesDoneToday: [], lastChallengeReset: today(), badges: b?.badges ?? [] },
        totalPoints: (progress.totalPoints ?? 0) + 15,
        currentStreak: (progress.currentStreak ?? 0) + 1,
        lastPlayed: new Date().toISOString(),
      });
      setDaysStrong(nd); setCheckedIn(true);
      showToast(`Day ${nd}! +15 pts 💪`, 'success');
    } catch (e: any) {
      showToast(e?.message ?? 'Check-in failed', 'error');
    } finally { setCiLoading(false); }
  }

  function restart() {
    setIdx(0); setScore(0); setWillpower(100); setGameOver(false); setFeedback(null);
  }

  const wpColor = willpower > 60 ? '#5bbf7a' : willpower > 30 ? '#e8a020' : '#e05555';

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', fontFamily: "'Arial Black', sans-serif" }}>

      {/* ── FIRE HEADER ─────────────────────────────────────────────── */}
      <div style={{ 
        background: 'linear-gradient(135deg,#d84315,#ff6f00)', 
        borderRadius: '28px 28px 0 0', 
        padding: '16px 24px',
        boxShadow: '0 6px 30px rgba(216,67,21,0.5)',
        border: '2px solid #ff6f00'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 900, 
          color: '#fff3e0', 
          textTransform: 'uppercase', 
          letterSpacing: '.15em', 
          textAlign: 'center',
          fontFamily: "'Arial Black', sans-serif",
          textShadow: '0 3px 6px rgba(0,0,0,0.4)'
        }}>
          🧗 MENTAL STRENGTH CHALLENGE
        </div>
      </div>

      {/* ── STREAK + DAILY CHECK-IN ──────────────────────────────────── */}
      <div style={{ 
        background: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', 
        border: '3px solid #ff6f00', 
        borderTop: 'none', 
        padding: '24px 28px',
        boxShadow: 'inset 0 4px 20px rgba(255,111,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '56px', 
              fontWeight: 900, 
              color: '#d84315', 
              lineHeight: 1, 
              letterSpacing: '-3px',
              fontFamily: "'Arial Black', sans-serif",
              textShadow: '0 4px 8px rgba(216,67,21,0.3)'
            }}>{daysStrong}</div>
            <div style={{ 
              fontSize: '13px', 
              color: '#ff6f00', 
              fontWeight: 800,
              fontFamily: "'Arial Black', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>Days Strong 🔥</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '12px'
            }}>
              <span style={{ 
                fontSize: '13px', 
                color: '#ff6f00', 
                fontWeight: 800, 
                width: '90px',
                fontFamily: "'Arial Black', sans-serif",
                textTransform: 'uppercase'
              }}>💪 Power</span>
              <div style={{ 
                flex: 1, 
                height: '12px', 
                background: 'rgba(255,111,0,0.2)', 
                borderRadius: '8px', 
                overflow: 'hidden',
                border: '2px solid rgba(255,111,0,0.4)'
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${willpower}%`, 
                  background: `linear-gradient(90deg,${willpower > 60 ? '#ff6f00' : willpower > 30 ? '#ffa726' : '#ef5350'},${willpower > 60 ? '#d84315' : willpower > 30 ? '#ff6f00' : '#e53935'})`, 
                  borderRadius: '8px', 
                  transition: 'width .6s ease',
                  boxShadow: `0 0 15px ${willpower > 60 ? '#ff6f00' : willpower > 30 ? '#ffa726' : '#ef5350'}66`
                }} />
              </div>
              <span style={{ 
                fontSize: '12px', 
                color: '#ff6f00', 
                fontWeight: 800,
                fontFamily: "'Arial Black', sans-serif",
                minWidth: '35px'
              }}>{willpower}%</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px'
            }}>
              <span style={{ 
                fontSize: '13px', 
                color: '#ff6f00', 
                fontWeight: 800,
                fontFamily: "'Arial Black', sans-serif",
                textTransform: 'uppercase',
                width: '90px'
              }}>🏆 Score</span>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 900, 
                color: '#d84315',
                fontFamily: "'Arial Black', sans-serif",
                textShadow: '0 2px 4px rgba(216,67,21,0.3)'
              }}>{score} pts</div>
            </div>
          </div>
          <button onClick={handleCheckIn} disabled={checkedIn || ciLoading}
            style={{ 
              padding: '14px 20px', 
              borderRadius: '16px', 
              border: '3px solid #ff6f00', 
              background: checkedIn ? 'linear-gradient(135deg,#66bb6a,#4caf50)' : 'linear-gradient(135deg,#ff6f00,#d84315)', 
              color: '#fff', 
              fontSize: '13px', 
              fontWeight: 900, 
              cursor: checkedIn ? 'default' : 'pointer', 
              flexShrink: 0, 
              transition: 'all .3s',
              fontFamily: "'Arial Black', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: checkedIn ? '0 4px 16px rgba(76,175,80,0.4)' : '0 6px 20px rgba(255,111,0,0.5)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={e => { 
              if (!checkedIn && !ciLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg,#ff8f00,#ff5722)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={e => { 
              if (!checkedIn && !ciLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg,#ff6f00,#d84315)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}>
            {ciLoading ? '⌛ Loading...' : checkedIn ? '✅ Complete!' : '🔥 Daily Check-In (+15)'}
          </button>
        </div>
      </div>

      {/* ── GAME OVER ──────────────────────────────────────────────────── */}
      {gameOver ? (
        <div style={{ 
          background: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', 
          border: '3px solid #ff6f00', 
          borderTop: 'none', 
          borderRadius: '0 0 28px 28px', 
          padding: '40px 32px', 
          textAlign: 'center',
          boxShadow: '0 6px 30px rgba(255,111,0,0.3)'
        }}>
          <div style={{ 
            fontSize: '72px', 
            marginBottom: '16px',
            textShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>{score >= 60 ? '🏆' : score >= 30 ? '💪' : '🌱'}</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 900, 
            color: '#d84315', 
            marginBottom: '12px',
            fontFamily: "'Arial Black', sans-serif",
            textShadow: '0 2px 4px rgba(216,67,21,0.3)'
          }}>
            {score >= 60 ? 'CHAMPION STRENGTH!' : score >= 30 ? 'STRONG EFFORT!' : 'KEEP TRAINING!'}
          </div>
          <div style={{ 
            fontSize: '18px', 
            color: '#ff6f00', 
            marginBottom: '12px',
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 800
          }}>Final Score: <strong style={{ color: '#d84315' }}>{score} POINTS</strong></div>
          <div style={{ 
            fontSize: '16px', 
            color: '#ff6f00', 
            marginBottom: '32px',
            fontFamily: "'Arial Black', sans-serif"
          }}>Power Remaining: <strong style={{ color: willpower > 60 ? '#66bb6a' : willpower > 30 ? '#ffa726' : '#ef5350' }}>{willpower}%</strong></div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={restart} style={{ 
              padding: '16px 32px', 
              borderRadius: '16px', 
              border: '3px solid #ff6f00', 
              background: 'linear-gradient(135deg,#ff6f00,#d84315)', 
              color: '#fff', 
              fontSize: '15px', 
              fontWeight: 900, 
              cursor: 'pointer',
              fontFamily: "'Arial Black', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: '0 6px 20px rgba(255,111,0,0.5)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transition: 'all .3s'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg,#ff8f00,#ff5722)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg,#ff6f00,#d84315)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              🔄 Train Again
            </button>
          </div>
        </div>
      ) : (
        /* ── SCENARIO CARD ─────────────────────────────────────────────── */
        <div style={{ 
          background: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', 
          border: '3px solid #ff6f00', 
          borderTop: 'none', 
          borderRadius: '0 0 28px 28px', 
          padding: '32px 28px',
          boxShadow: 'inset 0 4px 20px rgba(255,111,0,0.1)'
        }}>

          {/* Progress dots */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '28px'
          }}>
            {SCENARIOS.map((_, i) => (
              <div key={i} style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                background: i < idx ? 'linear-gradient(135deg,#ff6f00,#d84315)' : i === idx ? '#ffa726' : 'rgba(255,111,0,0.2)', 
                transition: 'all .3s',
                border: i === idx ? '3px solid #ff6f00' : '3px solid rgba(255,111,0,0.3)',
                boxShadow: i < idx ? '0 0 10px rgba(255,111,0,0.6)' : 'none'
              }} />
            ))}
          </div>

          {/* Scenario */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '16px',
              filter: 'drop-shadow(0 4px 8px rgba(255,111,0,0.3))'
            }}>{scenario.icon}</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              color: '#d84315', 
              lineHeight: 1.6,
              fontFamily: "'Arial Black', sans-serif",
              textShadow: '0 2px 4px rgba(216,67,21,0.2)'
            }}>{scenario.situation}</div>
            <div style={{ 
              fontSize: '13px', 
              color: '#ff6f00', 
              marginTop: '8px',
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>Challenge {idx + 1} of {SCENARIOS.length}</div>
          </div>

          {/* Feedback overlay */}
          {feedback ? (
            <div style={{ 
              background: feedback.strong ? 'linear-gradient(135deg,#e8f5e8,#c8e6c9)' : 'linear-gradient(135deg,#ffebee,#ffcdd2)', 
              border: `3px solid ${feedback.strong ? '#66bb6a' : '#ef5350'}`, 
              borderRadius: '18px', 
              padding: '24px', 
              textAlign: 'center',
              boxShadow: feedback.strong ? '0 6px 20px rgba(102,187,106,0.4)' : '0 6px 20px rgba(239,83,80,0.4)'
            }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '12px',
                textShadow: '0 3px 6px rgba(0,0,0,0.2)'
              }}>{feedback.strong ? '💪' : '😔'}</div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 900, 
                color: feedback.strong ? '#2e7d32' : '#c62828', 
                marginBottom: '8px',
                fontFamily: "'Arial Black', sans-serif",
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {feedback.pts > 0 ? `+${feedback.pts} POWER` : `${feedback.pts} POWER`}
              </div>
              <div style={{ 
                fontSize: '15px', 
                color: feedback.strong ? '#388e3c' : '#d32f2f',
                fontFamily: "'Arial Black', sans-serif",
                fontWeight: 800
              }}>{feedback.text}</div>
            </div>
          ) : (
            /* Options */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {scenario.options.map((opt, i) => (
                <button key={i} onClick={() => choose(opt)}
                  style={{ 
                    padding: '18px 24px', 
                    borderRadius: '16px', 
                    border: `3px solid ${opt.strong ? '#66bb6a' : '#ef5350'}`, 
                    background: opt.strong ? 'linear-gradient(135deg,#e8f5e8,#c8e6c9)' : 'linear-gradient(135deg,#ffebee,#ffcdd2)', 
                    color: '#1a2e26', 
                    fontSize: '15px', 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    transition: 'all .3s',
                    fontFamily: "'Arial Black', sans-serif",
                    boxShadow: opt.strong ? '0 4px 16px rgba(102,187,106,0.3)' : '0 4px 16px rgba(239,83,80,0.3)'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.background = opt.strong ? 'linear-gradient(135deg,#c8e6c9,#a5d6a7)' : 'linear-gradient(135deg,#ffcdd2,#ef9a9a)'; 
                    e.currentTarget.style.transform = 'translateX(8px) translateY(-2px)';
                  }} 
                  onMouseLeave={e => { 
                    e.currentTarget.style.background = opt.strong ? 'linear-gradient(135deg,#e8f5e8,#c8e6c9)' : 'linear-gradient(135deg,#ffebee,#ffcdd2)'; 
                    e.currentTarget.style.transform = 'translateX(0) translateY(0)';
                  }}>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}