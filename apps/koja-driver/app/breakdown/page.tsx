'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Circle, Zap, HelpCircle, MapPin } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';

const PROBLEMS = [
  { id: 'engine', icon: Flame, label: 'Engine Breakdown', color: '#EF4444' },
  { id: 'tyre', icon: Circle, label: 'Tyre Puncture', color: '#F59E0B' },
  { id: 'accident', icon: Zap, label: 'Accident', color: '#EF4444' },
  { id: 'other', icon: HelpCircle, label: 'Other', color: '#9CA3AF' },
];

export default function BreakdownPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Report Problem" backHref="/drive" />

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-5">
        <div className="flex flex-col gap-3 mb-6">
          {PROBLEMS.map(({ id, icon: Icon, label, color }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className="w-full flex items-center gap-4 rounded-2xl p-5 min-h-[72px] transition-all active:scale-98"
              style={{
                background: selected === id ? 'rgba(239,68,68,0.12)' : '#111827',
                border: `1px solid ${selected === id ? color : '#1F2937'}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20` }}
              >
                <Icon size={24} style={{ color }} />
              </div>
              <span
                className="font-bold text-lg"
                style={{ color: selected === id ? '#fff' : '#D1D5DB' }}
              >
                {label}
              </span>
              {selected === id && (
                <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: color }}>
                  <span className="text-white text-xs font-black">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/breakdown/waiting')}
          disabled={!selected}
          className="w-full h-16 rounded-2xl text-xl font-bold mb-4 transition-all"
          style={{
            background: selected ? '#EF4444' : '#1F2937',
            color: selected ? '#fff' : '#6B7280',
          }}
        >
          Send Emergency Alert
        </button>

        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-500 flex-shrink-0" />
          <p className="text-gray-500 text-xs">Manager notified with your GPS location</p>
        </div>
      </div>
    </div>
  );
}
