'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Heart, AlertCircle, User } from 'lucide-react';
import { BottomNav } from '@/components/koja/bottom-nav';
import { ScreenHeader } from '@/components/koja/screen-header';

const LEAVE_TYPES = [
  { id: 'annual', icon: Calendar, label: 'Annual Leave', color: '#22C55E', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)' },
  { id: 'sick', icon: Heart, label: 'Sick Leave', color: '#60A5FA', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)' },
  { id: 'emergency', icon: AlertCircle, label: 'Emergency Leave', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' },
  { id: 'personal', icon: User, label: 'Personal Leave', color: '#A78BFA', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)' },
];

export default function LeavePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const daysRemaining = 14;
  const totalDays = 21;

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Request Leave" />

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-4">
        {/* Leave type grid */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Leave Type</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {LEAVE_TYPES.map(({ id, icon: Icon, label, color, bg, border }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className="flex flex-col items-center justify-center gap-2 rounded-3xl py-5 px-3 min-h-[110px] transition-all active:scale-95"
              style={{
                background: selected === id ? bg : '#111827',
                border: `1px solid ${selected === id ? border : '#1F2937'}`,
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: `${bg}` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <span className="text-sm font-semibold text-center" style={{ color: selected === id ? color : 'white' }}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Date pickers */}
        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full h-14 rounded-2xl px-4 text-white font-medium bg-transparent outline-none"
              style={{ background: '#111827', border: '1px solid #1F2937', colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">To</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full h-14 rounded-2xl px-4 text-white font-medium bg-transparent outline-none"
              style={{ background: '#111827', border: '1px solid #1F2937', colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Balance bar */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Leave Balance</span>
            <span className="text-amber-500 font-bold">{daysRemaining} / {totalDays} days</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: '#1F2937' }}>
            <div
              className="h-2 rounded-full"
              style={{ background: '#F59E0B', width: `${(daysRemaining / totalDays) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => router.push('/leave/status')}
          disabled={!selected || !fromDate || !toDate}
          className="w-full h-16 rounded-2xl text-xl font-bold transition-all"
          style={{
            background: (selected && fromDate && toDate) ? '#F59E0B' : '#1F2937',
            color: (selected && fromDate && toDate) ? '#000' : '#6B7280',
          }}
        >
          Send Request
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
