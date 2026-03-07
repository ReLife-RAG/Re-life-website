interface ProgressLevelCardProps {
  points: number;
  level: number;
  nextLevelPoints: number;
  label?: string;
}

export default function ProgressLevelCard({
  points,
  level,
  nextLevelPoints,
  label = 'Recovery Points',
}: ProgressLevelCardProps) {
  const pct = Math.min(100, Math.round((points / nextLevelPoints) * 100));

  return (
    <div className="bg-gradient-to-br from-[#1B2A3D] to-[#40738E] rounded-2xl p-5 text-white shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white/60 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-0.5">
            {points.toLocaleString()}
            <span className="text-base font-normal text-white/60 ml-1">pts</span>
          </p>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-1.5 text-center">
          <p className="text-xs text-white/60">Level</p>
          <p className="text-xl font-bold leading-none">{level}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-1.5">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8CD092] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-white/50">
        {nextLevelPoints - points > 0
          ? `${(nextLevelPoints - points).toLocaleString()} pts to Level ${level + 1}`
          : 'Max level reached!'}
      </p>
    </div>
  );
}
