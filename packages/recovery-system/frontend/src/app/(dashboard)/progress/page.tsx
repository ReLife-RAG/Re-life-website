'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getStreak,
  getMoodData,
  getMoodAnalytics,
  getCheckInHistory,
  logMood,
  dailyCheckIn,
  type StreakData,
  type MoodDataResponse,
  type MoodAnalyticsResponse,
  type HistoryResponse,
} from '@/lib/auth-client';
import {
  Flame,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react';

/* ─── Mood score ↔ emoji/label ─── */
const MOOD_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  great: { emoji: '😄', label: 'Great', color: '#22c55e' },
  good: { emoji: '🙂', label: 'Good', color: '#86D293' },
  okay: { emoji: '😐', label: 'Okay', color: '#eab308' },
  struggling: { emoji: '😢', label: 'Struggling', color: '#f97316' },
  relapsed: { emoji: '😞', label: 'Relapsed', color: '#ef4444' },
};

const SCORE_EMOJI = ['', '😞', '😞', '😢', '😢', '😐', '😐', '🙂', '🙂', '😄', '😄'];

/* ─── Helpers ─── */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ProgressPage() {
  // ── State ──
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [moodData, setMoodData] = useState<MoodDataResponse | null>(null);
  const [analytics, setAnalytics] = useState<MoodAnalyticsResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mood logger state
  const [moodScore, setMoodScore] = useState<number>(5);
  const [moodNotes, setMoodNotes] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [logMsg, setLogMsg] = useState<string | null>(null);

  // Calendar state
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // ── Fetch all data ──
  const fetchAll = useCallback(async () => {
    try {
      const [s, m, a, h] = await Promise.all([
        getStreak(),
        getMoodData({ days: 30 }),
        getMoodAnalytics(),
        getCheckInHistory(90),
      ]);
      setStreak(s);
      setMoodData(m);
      setAnalytics(a);
      setHistory(h);
    } catch (err: any) {
      console.error('Progress fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Log mood handler ──
  const handleLogMood = async () => {
    setLogLoading(true);
    setLogMsg(null);
    try {
      const result = await logMood({ score: moodScore, notes: moodNotes || undefined });
      setLogMsg(result.message);
      setMoodNotes('');
      await fetchAll();
    } catch (err: any) {
      setLogMsg(err.message);
    } finally {
      setLogLoading(false);
    }
  };

  // ── Calendar helpers ──
  const calDays = () => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  };

  const getCalendarDateKey = (day: number) => {
    const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
    return d.toISOString().split('T')[0];
  };

  const prevMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1));
  const nextMonth = () => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1));

  // ── Trend icon ──
  const TrendIcon = ({ direction }: { direction: string }) => {
    if (direction === 'improving') return <TrendingUp size={16} className="text-green-500" />;
    if (direction === 'declining') return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-yellow-500" />;
  };

  // ── Loading / Error ──
  if (loading) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#86D293] border-t-transparent rounded-full" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 text-red-600 rounded-2xl p-6 text-center">
          <p className="font-medium">Failed to load progress data</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={() => { setError(null); setLoading(true); fetchAll(); }} className="mt-4 px-4 py-2 bg-red-100 rounded-xl text-sm font-medium hover:bg-red-200 transition">
            Retry
          </button>
        </div>
      </main>
    );
  }

  const dayOfWeekEntries = analytics?.patterns?.dayOfWeekAverages || {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Progress</h1>
        <p className="text-slate-400 mt-1">Track your recovery journey, moods, and milestones</p>
      </div>

      {/* ═══ TOP STATS ROW ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Current Streak */}
        <div className="bg-gradient-to-br from-[#86D293] to-[#6ab376] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Flame size={24} />
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-4xl font-bold">{streak?.currentStreak || 0}</p>
          <p className="text-sm opacity-80 mt-1">Day Streak</p>
        </div>

        {/* Longest Streak */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Trophy size={24} className="text-yellow-500" />
            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Best</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">{streak?.longestStreak || 0}</p>
          <p className="text-sm text-slate-400 mt-1">Longest Streak</p>
        </div>

        {/* Average Mood */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Heart size={24} className="text-pink-500" />
            {analytics && <TrendIcon direction={analytics.trends.direction} />}
          </div>
          <p className="text-4xl font-bold text-slate-900">
            {moodData?.averageScore ? moodData.averageScore.toFixed(1) : '—'}
          </p>
          <p className="text-sm text-slate-400 mt-1">Avg Mood (30d)</p>
        </div>

        {/* Total Check-ins */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Calendar size={24} className="text-[#4A7C7C]" />
            <span className="text-xs font-bold text-[#4A7C7C] bg-[#CFE1E1] px-2 py-0.5 rounded-full">Total</span>
          </div>
          <p className="text-4xl font-bold text-slate-900">{history?.stats?.totalCheckIns || 0}</p>
          <p className="text-sm text-slate-400 mt-1">Check-ins</p>
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── LEFT COLUMN (2/3) ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Mood Logger Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#86D293]" />
              Log Your Mood
            </h2>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Score slider */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">How are you feeling?</span>
                  <span className="text-2xl">{SCORE_EMOJI[moodScore]}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={moodScore}
                  onChange={(e) => setMoodScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#86D293]"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 - Low</span>
                  <span className="font-bold text-slate-700">{moodScore}/10</span>
                  <span>10 - Great</span>
                </div>
              </div>

              {/* Notes */}
              <div className="flex-1">
                <textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder="Optional notes... (max 500 chars)"
                  maxLength={500}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#86D293]/30 resize-none"
                />
                <button
                  onClick={handleLogMood}
                  disabled={logLoading}
                  className="mt-2 w-full py-2 bg-[#86D293] hover:bg-[#75c082] text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                  {logLoading ? 'Logging...' : 'Log Mood'}
                </button>
              </div>
            </div>

            {logMsg && (
              <p className={`mt-3 text-sm font-medium ${logMsg.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                {logMsg}
              </p>
            )}
          </div>

          {/* Mood Trends Card */}
          {analytics && analytics.totalEntries > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#4A7C7C]" />
                Mood Trends
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* 7-day avg */}
                <div className="bg-[#F3F7F3] rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">7-Day Avg</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analytics.trends.sevenDay?.average?.toFixed(1) ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{analytics.trends.sevenDay?.entries ?? 0} entries</p>
                </div>
                {/* 30-day avg */}
                <div className="bg-[#F3F7F3] rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">30-Day Avg</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {analytics.trends.thirtyDay?.average?.toFixed(1) ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{analytics.trends.thirtyDay?.entries ?? 0} entries</p>
                </div>
                {/* Trend direction */}
                <div className="bg-[#F3F7F3] rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trend</p>
                  <div className="flex items-center gap-2">
                    <TrendIcon direction={analytics.trends.direction} />
                    <p className="text-lg font-bold text-slate-900 capitalize">{analytics.trends.direction.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* Day-of-week pattern */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Day-of-Week Pattern</p>
                <div className="flex items-end gap-2 h-32">
                  {dayNames.map((day) => {
                    const val = dayOfWeekEntries[day];
                    const height = val != null ? (val / 10) * 100 : 0;
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-500">{val?.toFixed(1) ?? '—'}</span>
                        <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: '100px' }}>
                          <div
                            className="absolute bottom-0 w-full rounded-t-lg transition-all"
                            style={{
                              height: `${height}%`,
                              backgroundColor: val != null && val >= 7 ? '#86D293' : val != null && val >= 4 ? '#eab308' : '#ef4444',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{day.slice(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
                {analytics.patterns.bestDay && (
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="text-green-600 font-medium">Best: {analytics.patterns.bestDay}</span>
                    <span className="text-red-500 font-medium">Lowest: {analytics.patterns.worstDay}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Mood Entries */}
          {moodData && moodData.entries.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" />
                Recent Mood Entries
              </h2>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {moodData.entries.slice(0, 15).map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                    <span className="text-2xl">{MOOD_LABELS[entry.mood]?.emoji || '📝'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{MOOD_LABELS[entry.mood]?.label || entry.mood}</span>
                        {entry.score && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {entry.score}/10
                          </span>
                        )}
                      </div>
                      {entry.notes && <p className="text-xs text-slate-400 truncate mt-0.5">{entry.notes}</p>}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(entry.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN (1/3) ─── */}
        <div className="space-y-6">

          {/* Calendar Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-[#86D293]" />
                Check-in Calendar
              </h2>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition"><ChevronLeft size={16} /></button>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition"><ChevronRight size={16} /></button>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-600 mb-3">
              {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-slate-400">{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {calDays().map((day, i) => {
                if (day === null) return <div key={i} />;
                const dateKey = getCalendarDateKey(day);
                const entry = history?.calendar?.[dateKey];
                const isToday = dateKey === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition relative
                      ${entry?.hasCheckIn ? 'bg-[#86D293] text-white font-bold' : 'text-slate-500 hover:bg-slate-50'}
                      ${isToday ? 'ring-2 ring-[#4A7C7C] ring-offset-1' : ''}
                    `}
                    title={entry ? `${entry.mood} ${entry.energy ? '(' + entry.energy + '/10)' : ''}` : ''}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#86D293]" />
                <span>Checked in</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded ring-2 ring-[#4A7C7C]" />
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Mood Distribution */}
          {analytics && analytics.totalEntries > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Star size={20} className="text-yellow-500" />
                Mood Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(analytics.patterns.moodDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => {
                    const pct = Math.round((count / analytics.totalEntries) * 100);
                    const info = MOOD_LABELS[mood];
                    return (
                      <div key={mood}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="flex items-center gap-1.5">
                            <span>{info?.emoji || '📝'}</span>
                            <span className="font-medium text-slate-700">{info?.label || mood}</span>
                          </span>
                          <span className="text-slate-400 text-xs">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: info?.color || '#94a3b8' }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              {analytics.patterns.mostFrequentMood && (
                <p className="text-xs text-slate-400 mt-4">
                  Most frequent: <span className="font-bold text-slate-600">{MOOD_LABELS[analytics.patterns.mostFrequentMood]?.label || analytics.patterns.mostFrequentMood}</span>
                </p>
              )}
            </div>
          )}

          {/* Milestones */}
          {streak && streak.milestones && streak.milestones.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500" />
                Milestones
              </h2>
              <div className="space-y-3">
                {streak.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.achieved ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                      {m.achieved ? '🏆' : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${m.achieved ? 'text-slate-800' : 'text-slate-400'}`}>{m.name}</p>
                      {m.description && <p className="text-[10px] text-slate-400">{m.description}</p>}
                    </div>
                    {m.achieved && m.achievedDate && (
                      <span className="text-[10px] text-green-600 font-bold flex-shrink-0">{formatDate(m.achievedDate)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}