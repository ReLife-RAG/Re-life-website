'use client';

import CounselorPageToggle from '@/components/counselors/CounselorPageToggle';

/* Mock sessions — replace with real API data when backend endpoint is ready */
const MOCK_SESSIONS = [
  {
    id: '1',
    counselorName: 'Dr. Sarah Mitchell',
    specialty: 'Addiction Recovery Specialist',
    date: 'March 10, 2026',
    time: '10:30',
    status: 'upcoming' as const,
    price: 80,
  },
  {
    id: '2',
    counselorName: 'James Okonkwo',
    specialty: 'Substance Abuse Counselor',
    date: 'February 28, 2026',
    time: '14:00',
    status: 'completed' as const,
    price: 65,
  },
  {
    id: '3',
    counselorName: 'Dr. Priya Nair',
    specialty: 'Trauma & PTSD Therapist',
    date: 'February 14, 2026',
    time: '09:00',
    status: 'completed' as const,
    price: 90,
  },
];

const STATUS_STYLES: Record<string, string> = {
  upcoming:  'bg-[#8CD092]/15 text-[#2d7a3a]',
  completed: 'bg-[#EAF4FB] text-[#40738E]',
  cancelled: 'bg-red-50 text-red-500',
};

export default function MySessionsPage() {
  const upcoming  = MOCK_SESSIONS.filter((s) => s.status === 'upcoming');
  const past      = MOCK_SESSIONS.filter((s) => s.status !== 'upcoming');

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A3D]">My Sessions</h1>
          <p className="text-sm text-[#C4C4C4] mt-0.5">
            Track your upcoming and past counseling appointments
          </p>
        </div>
        <CounselorPageToggle activeTab="sessions" onTabChange={() => {}} />
      </div>

      {/* Upcoming */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-[#40738E] uppercase tracking-wide mb-3">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E8F0F5] shadow-sm">
            <p className="text-[#C4C4C4]">No upcoming sessions.</p>
            <a
              href="/counselors"
              className="inline-block mt-3 text-sm text-[#40738E] font-medium hover:underline"
            >
              Find a counselor →
            </a>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </ul>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-sm font-semibold text-[#40738E] uppercase tracking-wide mb-3">
          Past Sessions ({past.length})
        </h2>
        {past.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E8F0F5] shadow-sm">
            <p className="text-[#C4C4C4]">No past sessions yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {past.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/* ─── Session row card ─── */
function SessionCard({
  session,
}: {
  session: (typeof MOCK_SESSIONS)[number];
}) {
  return (
    <li className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between gap-4 border border-[#E8F0F5] shadow-sm">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#40738E] to-[#8CD092] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
        {session.counselorName.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1B2A3D] truncate">{session.counselorName}</p>
        <p className="text-xs text-[#C4C4C4] truncate">{session.specialty}</p>
      </div>

      {/* Date & time */}
      <div className="hidden sm:block text-center">
        <p className="text-sm font-medium text-[#1B2A3D]">{session.date}</p>
        <p className="text-xs text-[#C4C4C4]">{session.time}</p>
      </div>

      {/* Price */}
      <div className="hidden md:block text-right">
        <p className="text-sm font-semibold text-[#1B2A3D]">${session.price}</p>
      </div>

      {/* Status badge */}
      <span
        className={`text-xs font-medium px-3 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[session.status]}`}
      >
        {session.status}
      </span>
    </li>
  );
}
