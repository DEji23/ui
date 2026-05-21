'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, Shuffle, Map, HelpCircle, AlertTriangle } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';

const PROBLEMS = [
  { id: 'roadworthy', icon: Bus, label: 'Bus not roadworthy', color: '#EF4444' },
  { id: 'wrong-bus', icon: Shuffle, label: 'Wrong bus assigned', color: '#F59E0B' },
  { id: 'wrong-route', icon: Map, label: 'Wrong route', color: '#3B82F6' },
  { id: 'other', icon: HelpCircle, label: 'Other problem', color: '#8B5CF6' },
];

export default function ShiftProblemPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Report Problem" backHref="/shift" />

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-5">
        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          Select the issue with your assignment. Your manager will be alerted immediately.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {PROBLEMS.map(({ id, icon: Icon, label, color }) => {
            const isSelected = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className="flex flex-col items-center justify-center gap-3 rounded-3xl p-5 min-h-[120px] transition-all active:scale-95"
                style={{
                  background: isSelected ? `rgba(245,158,11,0.15)` : '#111827',
                  border: isSelected ? '2px solid #F59E0B' : '1px solid #1F2937',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={24} style={{ color }} />
                </div>
                <span
                  className="text-sm font-semibold text-center leading-tight"
                  style={{ color: isSelected ? '#F59E0B' : 'white' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          disabled={!selected}
          className="w-full h-16 rounded-2xl text-xl font-bold mb-4 transition-all"
          style={{
            background: selected ? '#EF4444' : '#1F2937',
            color: selected ? '#fff' : '#6B7280',
          }}
        >
          Send Report to Manager
        </button>

        <div
          className="rounded-2xl p-3 flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-xs">Manager will be alerted immediately</p>
        </div>
      </div>
    </div>
  );
}
