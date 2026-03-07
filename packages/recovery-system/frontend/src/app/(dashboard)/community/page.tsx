'use client';

import React, { useState } from 'react';
import { MessageCircle, Users, Heart, Search, Plus, TrendingUp } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  tag: string;
}

const posts: Post[] = [
  {
    id: '1',
    author: 'Anonymous User',
    avatar: '🙂',
    time: '2 hours ago',
    content: 'Today marks my 30th day clean. I never thought I could make it this far. Taking it one day at a time really works.',
    likes: 24,
    comments: 8,
    tag: 'Success Story',
  },
  {
    id: '2',
    author: 'Anonymous User',
    avatar: '😊',
    time: '5 hours ago',
    content: 'Struggling a bit today. Does anyone have tips for handling cravings in the evening?',
    likes: 12,
    comments: 15,
    tag: 'Question',
  },
  {
    id: '3',
    author: 'Anonymous User',
    avatar: '🌟',
    time: 'Yesterday',
    content: 'The breathing exercises in the app genuinely helped me get through a tough moment. Really grateful for this community.',
    likes: 31,
    comments: 6,
    tag: 'Gratitude',
  },
];

const TOPICS = ['Trauma', 'Addiction', 'Anxiety', 'Family', 'Mindfulness'];
const AVAILABILITY_OPTIONS = ['All Time', 'Today', 'This Week'];
const tags = ['All', 'Success Story', 'Question', 'Gratitude', 'Support'];

const recentActivity = [
  { icon: '🧘', label: 'Meditation', sub: '20 MIN · 2H AGO' },
  { icon: '📓', label: 'Journal', sub: 'DAILY ENTRY · 5H AGO' },
  { icon: '👤', label: 'Counseling', sub: 'COMPLETED · YESTERDAY' },
];

export default function CommunityPage() {
  const [activeTag, setActiveTag] = useState('All');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [checkedTopics, setCheckedTopics] = useState<Set<string>>(new Set());
  const [availability, setAvailability] = useState('All Time');

  const toggleTopic = (t: string) => {
    setCheckedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = activeTag === 'All' ? posts : posts.filter((p) => p.tag === activeTag);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Nav ── */}
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4caf7d] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 8C8 10 5.9 16.17 3.82 19.52a1 1 0 001.66 1.06C6.94 18.77 9.54 16 17 16v3l4-4-4-4v3z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm">Re-Life</span>
          </div>
          <div className="flex items-center gap-1">
            {['Dashboard', 'Counselors', 'Games', 'Library', 'Community'].map((link) => (
              <button
                key={link}
                aria-label={link}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  link === 'Community'
                    ? 'bg-[#4caf7d] text-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Search" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="px-4 py-2 rounded-full bg-[#4caf7d] text-white text-sm font-semibold hover:bg-[#3d9e6d] transition-colors shadow-sm">
            Daily Check-in
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex gap-6">

        {/* ── Left Sidebar ── */}
        <aside className="w-56 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <span>Portal</span><span>›</span><span className="text-gray-600">Community</span>
          </div>

          {/* Filter header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm4 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
              </svg>
              <span className="font-semibold text-gray-800 text-sm">Filters</span>
            </div>
            <button
              aria-label="Reset filters"
              onClick={() => { setCheckedTopics(new Set()); setAvailability('All Time'); setActiveTag('All'); }}
              className="text-xs text-[#4caf7d] font-medium hover:underline"
            >
              RESET
            </button>
          </div>

          {/* Topic checkboxes */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Topic</p>
            <div className="space-y-2.5">
              {TOPICS.map((topic) => {
                const checked = checkedTopics.has(topic);
                return (
                  <label key={topic} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => toggleTopic(topic)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        checked ? 'bg-[#4caf7d] border-[#4caf7d]' : 'border-gray-300 group-hover:border-[#4caf7d]'
                      }`}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{topic}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Availability</p>
            <div className="space-y-1.5">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAvailability(opt)}
                  aria-label={`Filter by ${opt}`}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    availability === opt
                      ? 'bg-[#e8f5ee] text-[#2d7a55] border border-[#b2dfca]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main Feed ── */}
        <div className="flex-1 min-w-0">
          {/* Page title + new post */}
          <div className="flex items-end justify-between mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Community</h1>
            <button
              aria-label="Create new post"
              className="flex items-center gap-2 bg-[#4caf7d] hover:bg-[#3d9e6d] text-white text-sm font-semibold px-4 py-2 rounded-full transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>

          {/* Tag pills */}
          <div className="flex gap-2 flex-wrap mb-5">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                aria-label={`Filter by ${tag}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  activeTag === tag
                    ? 'bg-[#4caf7d] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4caf7d]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Post count */}
          <p className="text-sm text-gray-400 mb-4">{filtered.length} post{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Posts */}
          <div className="space-y-4">
            {filtered.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] flex items-center justify-center text-xl">{post.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
                    <p className="text-xs text-gray-400">{post.time}</p>
                  </div>
                  <span className="ml-auto text-xs font-medium bg-[#e8f5ee] text-[#2d7a55] px-3 py-1 rounded-full">{post.tag}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{post.content}</p>
                <div className="flex items-center gap-5 text-sm text-gray-400 border-t border-gray-50 pt-3">
                  <button
                    onClick={() => toggleLike(post.id)}
                    aria-label="Like post"
                    className={`flex items-center gap-1.5 transition font-medium ${likedPosts.has(post.id) ? 'text-red-500' : 'hover:text-red-400'}`}
                  >
                    <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-red-500' : ''}`} />
                    {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                  </button>
                  <button aria-label="View comments" className="flex items-center gap-1.5 hover:text-[#4caf7d] transition font-medium">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="w-64 shrink-0 space-y-4">

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Recent Activity</h3>
              <button aria-label="More options" className="text-gray-400 hover:text-gray-600 text-lg leading-none">···</button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] flex items-center justify-center text-base shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#4caf7d]" />
                <span className="text-sm text-gray-600">1,240 Members</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#4caf7d]" />
                <span className="text-sm text-gray-600">348 Posts Today</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-[#4caf7d]" />
                <span className="text-sm text-gray-600">5,021 Supports Given</span>
              </div>
            </div>
          </div>

          {/* Progress Level */}
          <div className="rounded-2xl p-5 shadow-sm bg-gradient-to-br from-[#3d8b7a] to-[#4caf7d]">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Progress Level</p>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-extrabold text-3xl">2,540 <span className="text-lg font-semibold">pts</span></p>
              <button aria-label="View progress" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div className="bg-white rounded-full h-2 w-[65%]" />
            </div>
            <button className="w-full py-2.5 rounded-full bg-[#4caf7d] hover:bg-[#3d9e6d] border-2 border-white/30 text-white text-sm font-semibold transition">
              Redeem Rewards
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}
