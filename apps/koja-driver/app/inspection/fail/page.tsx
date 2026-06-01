'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, AlertTriangle, MapPin } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';

const ISSUES = [
  { id: 'engine', label: 'Engine problems' },
  { id: 'fluid', label: 'Oil / fluid leak' },
  { id: 'noise', label: 'Unusual noise' },
  { id: 'heat', label: 'Overheating' },
];

export default function InspectionFailPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Engine & Exhaust" backHref="/inspection" />

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-4">
        {/* Failed badge */}
        <div
          className="rounded-2xl p-3 flex items-center gap-3 mb-5"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <Settings size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-bold text-sm">Engine &amp; Exhaust — FAILED</p>
            <p className="text-red-300 text-xs">This item requires attention before departure</p>
          </div>
        </div>

        <p className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">Select Issue Type</p>

        <div className="flex flex-col gap-3 mb-6">
          {ISSUES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className="w-full p-4 rounded-2xl text-left transition-all min-h-[64px] flex items-center"
              style={{
                background: selected === id ? 'rgba(239,68,68,0.15)' : '#111827',
                border: `1px solid ${selected === id ? '#EF4444' : '#1F2937'}`,
              }}
            >
              <span
                className="font-semibold text-base"
                style={{ color: selected === id ? '#EF4444' : 'white' }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/inspection/blocked')}
          disabled={!selected}
          className="w-full h-16 rounded-2xl text-xl font-bold mb-4 transition-all"
          style={{
            background: selected ? '#EF4444' : '#1F2937',
            color: selected ? '#fff' : '#6B7280',
          }}
        >
          Report &amp; Block Bus
        </button>

        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-gray-500 text-xs leading-relaxed">
            Fleet manager will be alerted with your GPS location
          </p>
        </div>
      </div>
    </div>
  );
}
