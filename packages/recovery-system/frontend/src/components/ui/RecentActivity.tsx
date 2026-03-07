interface ActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  time: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export default function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8F0F5]">
      <h3 className="font-semibold text-[#1B2A3D] mb-4">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="text-sm text-[#C4C4C4] text-center py-4">No activity yet</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: item.iconBg + '22' }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1B2A3D] truncate">{item.title}</p>
              </div>
              <span className="text-xs text-[#C4C4C4] flex-shrink-0">{item.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
