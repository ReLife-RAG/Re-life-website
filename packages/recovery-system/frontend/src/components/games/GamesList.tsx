'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Game, GameProgress, LeaderboardEntry, RecentActivity } from '@/types/games.types';
import { gamesApi } from '@/lib/gamesApi';
import GameCard         from './GameCard';
import GameOverlay      from './GameOverlay';
import LeaderboardPanel from './LeaderboardPanel';
import ProgressCard     from './ProgressCard';
import CategoryFilter   from './CategoryFilter';
import PrivacyModal     from './PrivacyModal';
import CheckInModal     from './CheckInModal';

// ── Mock data — shown immediately while API loads ─────────────────────────────
// NOTE: _id values here are temporary display IDs.
// When the API returns real games, these get replaced with real MongoDB ObjectIds.
const MOCK_GAMES: Game[] = [
  { _id:'mock_sober',    name:'sober',    title:'I Am Sober',           description:"Track your sobriety streak day by day with daily pledge commitments. See how much time and money you've saved on your journey.", category:'substance',   icon:'🌿', color:'#5bbf7a', features:['🔥 Streak Tracker','💰 Savings Counter','🎖 Milestones','👥 Community'],     activePlayers:12400, rating:4.8, difficulty:'easy',   estimatedTime:'5-10 min',  isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_forest',   name:'forest',   title:'Forest – Stay Focused', description:'Plant a virtual tree every time you want to focus. The tree dies if you leave to check social media — grow a whole forest by staying off your phone.',          category:'social',       icon:'🌲', color:'#5b9bf8', features:['🌲 Virtual Forest','📵 Phone Lock','🌍 Real Tree Planting','⏱ Focus Timer'], activePlayers:9800,  rating:4.9, difficulty:'medium', estimatedTime:'25 min',    isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_habitica', name:'habitica', title:'Habitica',             description:'Turn your real-life recovery habits into an RPG adventure. Your character levels up when you complete healthy daily tasks.',                            category:'behavioral',   icon:'⚔️', color:'#a67dd4', features:['🧝 RPG Character','📈 Level Up System','⚔️ Party Quests','✅ Habit Tracking'],  activePlayers:7300,  rating:4.7, difficulty:'hard',   estimatedTime:'15-20 min', isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_braver',   name:'braver',   title:'Braver',               description:'Streak-based progress tracking with daily check-ins and motivational challenges. A private, anonymous community working toward the same goal.',              category:'pornography',  icon:'🧗', color:'#e8a020', features:['🔥 Streak System','🎯 Daily Challenges','🔒 Anonymous','💎 Milestone Badges'],  activePlayers:5100,  rating:4.6, difficulty:'medium', estimatedTime:'10-15 min', isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_mindful',  name:'mindful',  title:'Mindful Moments',      description:'Guided breathing exercises and mindfulness practices to reduce stress and improve mental clarity. Complete daily sessions to build your practice.',                     category:'mindfulness',  icon:'🧘', color:'#14b8a6', features:['🌊 Ocean Breathing','🧘 Body Scan','🌸 Loving Kindness','🍃 Mindful Walking'], activePlayers:6200,  rating:4.8, difficulty:'easy',   estimatedTime:'5-15 min',  isHidden:false, createdAt:'', updatedAt:'' },
  { _id:'mock_journal',   name:'journal',  title:'Recovery Journal',      description:'Daily reflection journaling with guided prompts to process your thoughts and track your emotional journey. Build streaks and unlock insights.',                      category:'mindfulness',  icon:'📓', color:'#f43f5e', features:['🌅 Daily Prompts','💭 Mood Tracking','🎯 Goal Setting','🌟 Progress Insights'], activePlayers:4800,  rating:4.7, difficulty:'easy',   estimatedTime:'5-10 min',  isHidden:false, createdAt:'', updatedAt:'' },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { _id:'1', username:'User#4829', totalPoints:2940, currentStreak:14, rank:1 },
  { _id:'2', username:'User#1105', totalPoints:2680, currentStreak:9,  rank:2 },
  { _id:'3', username:'User#9921', totalPoints:2540, currentStreak:7,  rank:3 },
];

const MOCK_ACTIVITY: RecentActivity[] = [
  { game:MOCK_GAMES[0], lastPlayed:new Date().toISOString(), totalPoints:340, currentStreak:14 },
  { game:MOCK_GAMES[1], lastPlayed:new Date().toISOString(), totalPoints:120, currentStreak:4  },
  { game:MOCK_GAMES[2], lastPlayed:new Date().toISOString(), totalPoints:200, currentStreak:3  },
  { game:MOCK_GAMES[4], lastPlayed:new Date().toISOString(), totalPoints:85,  currentStreak:7  },
  { game:MOCK_GAMES[5], lastPlayed:new Date().toISOString(), totalPoints:150, currentStreak:5  },
];

// Build a fresh empty progress record for a game (used until real data loads)
function emptyProgress(game: Game): GameProgress {
  return {
    _id:'', userId:'', gameId:game._id, gameType:game.name as any,
    totalPoints:0, currentStreak:0, longestStreak:0, isFavorite:false,
    createdAt:'', updatedAt:'',
    soberData:    { daysSober:0, pledgedToday:false, moneySaved:0, hoursSober:0, milestones:[] },
    forestData:   { coins:0, treesPlanted:0, totalFocusTime:0 },
    habiticaData: { level:1, class:'Warrior', hp:100, maxHp:100, xp:0, xpToNext:500, mp:60, maxMp:100, tasksCompleted:0, questsCompleted:0, tasksDoneToday:[] },
    braverData:   { daysStrong:0, checkedInToday:false, challengesCompleted:0, challengesDoneToday:[], badges:[] },
    mindfulData:  { roundsCompleted:0, exercisesDoneToday:[], totalSessions:0, currentStreak:0 },
    journalData:  { entriesCount:0, currentStreak:0, promptsCompleted:[], moodHistory:[], insightsUnlocked:[] },
  };
}

interface ToastState { msg:string; type:'success'|'error'|'info'; visible:boolean }

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — renders inside your existing app layout (no own nav/topbar)
// ─────────────────────────────────────────────────────────────────────────────
export default function GamesList() {
  const [games,          setGames]          = useState<Game[]>(MOCK_GAMES);
  const [allProgress,    setAllProgress]    = useState<GameProgress[]>(MOCK_GAMES.map(emptyProgress));
  const [leaderboard,    setLeaderboard]    = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [activity,       setActivity]       = useState<RecentActivity[]>(MOCK_ACTIVITY);
  const [apiReady,       setApiReady]       = useState(false);  // true once real games loaded

  const [category,       setCategory]       = useState('all');
  const [hiddenIds,      setHiddenIds]      = useState<Set<string>>(new Set());
  const [activeGame,     setActiveGame]     = useState<Game|null>(null);
  const [activeProgress, setActiveProgress] = useState<GameProgress|null>(null);
  const [privPoints,     setPrivPoints]     = useState<string|null>(null);
  const [showCheckIn,    setShowCheckIn]    = useState(false);
  const [toast,          setToast]          = useState<ToastState>({ msg:'', type:'success', visible:false });

  const showToast = useCallback((msg:string, type:'success'|'error'|'info'='success') => {
    setToast({ msg, type, visible:true });
    setTimeout(() => setToast(t => ({ ...t, visible:false })), 2600);
  }, []);

  // ── Load real data from API, fall back silently to mocks ──────────────────
  useEffect(() => {
    async function load() {
      try {
        // 1. Load games — replaces mocks with real MongoDB _ids
        const [gRes, lbRes, actRes] = await Promise.allSettled([
          gamesApi.getGames(),
          gamesApi.getLeaderboard(5),
          gamesApi.getRecentActivity(5),
        ]);

        if (gRes.status === 'fulfilled' && gRes.value.length > 0) {
          setGames(gRes.value);   // real _ids now in state
          setApiReady(true);

          // 2. Load user progress (needs real gameIds)
          const prog = await gamesApi.getAllUserProgress().catch(() => [] as GameProgress[]);
          if (prog.length > 0) setAllProgress(prog);
        }
        if (lbRes.status  === 'fulfilled' && lbRes.value.length > 0)  setLeaderboard(lbRes.value);
        if (actRes.status === 'fulfilled' && actRes.value.length > 0) setActivity(actRes.value);
      } catch {
        // silently stay on mock data
      }
    }
    load();
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const getProgress = (gameId:string) => allProgress.find(p => p.gameId === gameId);
  const totalPoints  = allProgress.reduce((s,p) => s + (p.totalPoints    ?? 0), 0);
  const streak       = allProgress.reduce((m,p) => Math.max(m, p.currentStreak ?? 0), 0);
  const daysSober    = allProgress.find(p=>p.gameType==='sober')?.soberData?.daysSober     ?? 0;
  const treesGrown   = allProgress.find(p=>p.gameType==='forest')?.forestData?.treesPlanted ?? 0;
  const xpEarned     = allProgress.find(p=>p.gameType==='habitica')?.habiticaData?.xp       ?? 0;

  const visibleGames = games.filter(g =>
    !hiddenIds.has(g._id) && (category === 'all' || g.category === category)
  );

  // ── Play a game ───────────────────────────────────────────────────────────
  async function handlePlay(game: Game) {
    let prog = getProgress(game._id) ?? emptyProgress(game);

    if (apiReady && game._id && !game._id.startsWith('mock_')) {
      // Real MongoDB _id — fetch/create progress from DB
      try {
        prog = await gamesApi.getUserGameProgress(game._id);
      } catch {
        // use local empty progress if fetch fails
      }
    }

    setActiveGame(game);
    setActiveProgress(prog);
  }

  // ── Save progress ─────────────────────────────────────────────────────────
  async function handleUpdateProgress(updates: Partial<GameProgress>) {
    if (!activeGame || !activeProgress) return;

    // Always update local state immediately (optimistic)
    const merged = { ...activeProgress, ...updates };
    setActiveProgress(merged);
    setAllProgress(prev =>
      prev.some(p => p.gameId === activeGame._id)
        ? prev.map(p => p.gameId === activeGame._id ? merged : p)
        : [...prev, merged]
    );

    // Only call API if we have a real MongoDB _id (not mock)
    if (apiReady && activeGame._id && !activeGame._id.startsWith('mock_')) {
      try {
        const saved = await gamesApi.updateGameProgress(activeGame._id, updates);
        setActiveProgress(saved);
        setAllProgress(prev => prev.map(p => p.gameId === activeGame._id ? saved : p));
      } catch (err: any) {
        const msg = err?.response?.data?.message;
        if (msg) throw new Error(msg); // propagate to game component for toast
        // Otherwise keep local state — silent save failure
      }
    }
  }

  // ── Favourite ─────────────────────────────────────────────────────────────
  async function handleFavorite(gameId: string) {
    const wasFav = getProgress(gameId)?.isFavorite ?? false;
    // Optimistic toggle
    setAllProgress(prev => prev.map(p => p.gameId === gameId ? { ...p, isFavorite:!wasFav } : p));
    showToast(!wasFav ? 'Added to favourites ⭐' : 'Removed from favourites');

    if (apiReady && !gameId.startsWith('mock_')) {
      gamesApi.toggleFavorite(gameId).catch(() => {
        // Revert on failure
        setAllProgress(prev => prev.map(p => p.gameId === gameId ? { ...p, isFavorite:wasFav } : p));
        showToast('Failed to save favourite', 'error');
      });
    }
  }

  function handleShare(gameName: string) {
    navigator.clipboard.writeText(`Check out ${gameName} on Recovery Portal!`)
      .then(()  => showToast(`${gameName} link copied!`))
      .catch(()  => showToast(`Share: ${gameName}`));
  }

  function handleHide(gameId: string) {
    setHiddenIds(prev => new Set([...prev, gameId]));
    showToast('Game hidden');
  }

  async function handleCheckIn(mood: number, gamesPlayed: string[] = []) {
    if (apiReady) {
      const { pointsEarned } = await gamesApi.dailyCheckIn(mood, gamesPlayed);
      showToast(`Check-in done! +${pointsEarned} pts ✅`);
    } else {
      showToast('Check-in saved ✅');
    }
    setShowCheckIn(false);
  }

  // ── Overlay when a game is active ─────────────────────────────────────────
  if (activeGame && activeProgress) {
    return (
      <GameOverlay
        game={activeGame}
        progress={activeProgress}
        onBack={() => { setActiveGame(null); setActiveProgress(null); }}
        onUpdateProgress={handleUpdateProgress}
        showToast={showToast}
      />
    );
  }

  const toastBg = toast.type==='error' ? '#e05555' : toast.type==='info' ? '#3a5a52' : '#1a2e26';

  // ── Styles ─────────────────────────────────────────────────────────────────
  const layout:  React.CSSProperties = { display:'grid', gridTemplateColumns:'210px 1fr 265px', gap:'20px', maxWidth:'1160px', margin:'0 auto', padding:'24px 16px', alignItems:'start' };
  const sb:      React.CSSProperties = { background:'#fff', borderRadius:'14px', border:'1px solid #e2ebe6', padding:'18px 12px', position:'sticky', top:'24px' };
  const card:    React.CSSProperties = { background:'#fff', border:'1px solid #e2ebe6', borderRadius:'14px', padding:'16px 15px', marginBottom:'14px', boxShadow:'0 2px 12px rgba(60,100,80,.07)' };

  return (
    <div style={{ background:'#f4f6f5', minHeight:'100vh', fontFamily:"'Inter',sans-serif", fontSize:'14px' }}>

      {/* Toast */}
      <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:`translateX(-50%) translateY(${toast.visible?'0':'16px'})`, background:toastBg, color:'#fff', padding:'9px 20px', borderRadius:'20px', fontSize:'12.5px', fontWeight:600, zIndex:9999, opacity:toast.visible?1:0, pointerEvents:'none', transition:'all .25s', whiteSpace:'nowrap' }}>
        {toast.msg}
      </div>

      <div style={layout}>

        {/* ── SIDEBAR ── */}
        <aside style={sb}>
          <CategoryFilter selectedCategory={category} onCategoryChange={setCategory} />
          <div style={{ height:'1px', background:'#e2ebe6', margin:'12px 0' }} />
          <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#5bbf7a', marginBottom:'6px', padding:'0 2px' }}>
            🏆 My Progress
          </div>
          {[
            { label:'🌿 My Streaks',   fn:() => { const g=games.find(x=>x.name==='sober'); if(g) handlePlay(g); } },
            { label:'🏅 Achievements', fn:() => showToast('Achievements coming soon!') },
            { label:'🏆 Leaderboard',  fn:() => document.getElementById('lb-panel')?.scrollIntoView({ behavior:'smooth' }) },
          ].map(item => (
            <SbBtn key={item.label} label={item.label} onClick={item.fn} />
          ))}
        </aside>

        {/* ── MAIN ── */}
        <main style={{ minWidth:0 }}>
          <div style={{ fontSize:'12px', color:'#7a8f86', marginBottom:'6px' }}>
            Portal › <strong style={{ color:'#1a2e26', fontWeight:600 }}>Games</strong>
          </div>
          <h1 style={{ fontSize:'24px', fontWeight:800, color:'#1a2e26', margin:'0 0 18px', letterSpacing:'-.3px' }}>
            Recovery Games
          </h1>

          {/* Streak banner */}
          <div onClick={()=>setShowCheckIn(true)}
            style={{ background:'linear-gradient(135deg,#e8f7ee,#d4f0e0)', border:'1.5px solid #b2dfc4', borderRadius:'12px', padding:'13px 16px', display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px', cursor:'pointer' }}>
            <span style={{ fontSize:'26px' }}>🔥</span>
            <div>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#3a5a52' }}>You're on a {streak}-day streak!</div>
              <div style={{ fontSize:'11.5px', color:'#7a8f86', marginTop:'2px' }}>Keep playing daily to grow your recovery progress</div>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', marginBottom:'18px' }}>
            {[['all','All'],['substance','Drug & Substance'],['social','Social Media'],['behavioral','Behavioral'],['pornography','Pornography'],['mindfulness','Mindfulness']].map(([id,label]) => (
              <button key={id} onClick={()=>setCategory(id)}
                style={{ padding:'5px 14px', borderRadius:'20px', cursor:'pointer', border:`1.5px solid ${category===id?'#5bbf7a':'#e2ebe6'}`, background:category===id?'#e8f7ee':'#fff', color:category===id?'#5bbf7a':'#7a8f86', fontSize:'12.5px', fontWeight:category===id?600:500, transition:'all .15s' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Game cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {visibleGames.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 0', color:'#7a8f86' }}>
                <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎮</div>
                <div style={{ fontWeight:600 }}>No games in this category</div>
                {hiddenIds.size > 0 && (
                  <button onClick={()=>setHiddenIds(new Set())}
                    style={{ marginTop:'8px', color:'#5bbf7a', fontSize:'13px', textDecoration:'underline', background:'none', border:'none', cursor:'pointer' }}>
                    Restore hidden games
                  </button>
                )}
              </div>
            ) : visibleGames.map(game => (
              <GameCard key={game._id} game={game} progress={getProgress(game._id)}
                onPlay={handlePlay} onFavorite={handleFavorite}
                onShare={handleShare} onHide={handleHide} showToast={showToast} />
            ))}
          </div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside style={{ minWidth:0, width:'265px' }}>

          {/* Recent Activity */}
          <div style={card}>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#1a2e26', marginBottom:'12px' }}>Recent Activity</div>
            {activity.length === 0
              ? <p style={{ fontSize:'12px', color:'#7a8f86' }}>No activity yet — play a game!</p>
              : activity.map((a,i) => {
                  const g = a.game as any;
                  return (
                    <ActivityRow key={i} icon={g?.icon??'🎮'} title={g?.title??'Game'}
                      sub={a.currentStreak>0?`Day ${a.currentStreak} streak`:'Recently played'}
                      onClick={()=>{ const found=games.find(x=>x._id===g?._id||x.name===g?.name); if(found) handlePlay(found); }} />
                  );
                })
            }
          </div>

          {/* Leaderboard */}
          <div id="lb-panel">
            <LeaderboardPanel leaderboard={leaderboard} onShowPrivacy={pts=>setPrivPoints(pts)} showToast={showToast} />
          </div>

          {/* Progress card */}
          <ProgressCard totalPoints={totalPoints} currentStreak={streak}
            onCheckIn={()=>setShowCheckIn(true)} showToast={showToast} />
        </aside>
      </div>

      {/* Modals */}
      {privPoints !== null && <PrivacyModal points={privPoints} onClose={()=>setPrivPoints(null)} />}
      {showCheckIn && (
        <CheckInModal onClose={()=>setShowCheckIn(false)} onCheckIn={handleCheckIn}
          showToast={showToast} daysSober={daysSober} moneySaved={daysSober*12}
          treesGrown={treesGrown} xpEarned={xpEarned} />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SbBtn({ label, onClick }: { label:string; onClick:()=>void }) {
  const [h,setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'7px 10px', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer', border:'none', textAlign:'left', marginBottom:'1px', transition:'all .15s', background:h?'#f4f6f5':'transparent', color:h?'#1a2e26':'#7a8f86' }}>
      {label}
    </button>
  );
}

function ActivityRow({ icon, title, sub, onClick }: { icon:string; title:string; sub:string; onClick:()=>void }) {
  const [h,setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'9px', padding:'7px', borderRadius:'9px', cursor:'pointer', background:h?'#f4f6f5':'transparent', transition:'background .15s' }}>
      <div style={{ width:'32px', height:'32px', minWidth:'32px', borderRadius:'9px', background:'#e8f7ee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px' }}>{icon}</div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:'12.5px', fontWeight:600, color:'#1a2e26', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
        <div style={{ fontSize:'10.5px', color:'#7a8f86', textTransform:'uppercase', letterSpacing:'.04em', marginTop:'1px' }}>{sub}</div>
      </div>
    </div>
  );
}