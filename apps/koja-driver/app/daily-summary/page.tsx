'use client';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/koja/bottom-nav';
import { Star } from 'lucide-react';

export default function DailySummaryPage() {
  const router = useRouter();
  const rating = 4.8;
  const fullStars = Math.floor(rating);
  const STATS = [
    { label: 'Total Trips', value: '4', color: 'white' },
    { label: 'Total Passengers', value: '68', color: 'white' },
    { label: 'Gross Earnings', value: '₦18,200', color: 'white' },
    { label: 'Deductions', value: '-₦2,730', color: '#EF4444', sub: 'fuel + commission' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h1 className="text-white font-black text-2xl">End of Day</h1>
        <p className="text-gray-400 text-sm">21 May 2025</p>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        {/* Star rating */}
        <div
          className="rounded-3xl p-5 mb-4 flex flex-col items-center"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Driver Rating</p>
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star
                key={i}
                size={28}
                fill={i <= fullStars ? '#F59E0B' : 'none'}
                className={i <= fullStars ? 'text-amber-500' : 'text-gray-600'}
              />
            ))}
          </div>
          <p className="text-amber-500 font-black text-4xl">{rating}</p>
          <p className="text-gray-500 text-xs mt-1">out of 5.0</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {STATS.map(({ label, value, color, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <p className="text-gray-400 text-xs mb-1">{label}</p>
              <p className="font-bold text-2xl" style={{ color }}>{value}</p>
              {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Net earnings */}
        <div
          className="rounded-2xl p-5 mb-4 text-center"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <p className="text-gray-400 text-sm mb-1">Net Earnings Today</p>
          <p className="text-green-500 font-black" style={{ fontSize: '48px', lineHeight: 1 }}>₦15,470</p>
        </div>

        {/* Performance */}
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <span className="text-2xl">📈</span>
          <div>
            <p className="text-white font-medium text-sm">Up 12% vs yesterday</p>
            <p className="text-gray-500 text-xs">Yesterday: ₦13,800 net</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/offline')}
          className="w-full h-16 rounded-2xl text-xl font-bold"
          style={{ background: '#EF4444', color: '#fff' }}
        >
          Go Offline
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
