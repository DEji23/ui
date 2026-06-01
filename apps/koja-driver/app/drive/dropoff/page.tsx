'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';
import { useApp } from '@/lib/store';

const ALIGHTING = [
  { id: '1', name: 'Amaka O.' },
  { id: '2', name: 'Bello T.' },
];

export default function DropoffPage() {
  const router = useRouter();
  const { capacity, passengers, setPassengers } = useApp();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [confirmed, setConfirmed] = useState(false);
  const currentSeated = passengers.length;
  const alightCount = Object.values(checked).filter(Boolean).length;
  const newSeated = currentSeated - alightCount;
  const newAvailable = capacity - newSeated;

  function handleConfirm() {
    const ids = Object.entries(checked).filter(([, v]) => v).map(([k]) => k);
    setPassengers(passengers.filter(p => !ids.includes(p.id)));
    setConfirmed(true);
    setTimeout(() => router.push('/drive'), 1200);
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Drop-off at Ojuelegba" backHref="/drive" />

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-4">
        {/* Seat update preview */}
        <div
          className="rounded-2xl px-4 py-4 mb-5 flex items-center justify-between"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">Available now</p>
            <p className="text-white font-bold text-2xl">{capacity - currentSeated}</p>
          </div>
          <span className="text-amber-500 text-2xl font-bold">→</span>
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">After drop-off</p>
            <p className="text-green-500 font-bold text-2xl">{newAvailable}</p>
          </div>
          <p className="text-gray-500 text-sm">seats available</p>
        </div>

        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Confirm alighting passengers
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {ALIGHTING.map((p) => (
            <button
              key={p.id}
              onClick={() => setChecked(c => ({ ...c, [p.id]: !c[p.id] }))}
              className="flex items-center gap-4 rounded-2xl p-4 transition-all"
              style={{
                background: checked[p.id] ? 'rgba(34,197,94,0.1)' : '#111827',
                border: `1px solid ${checked[p.id] ? 'rgba(34,197,94,0.4)' : '#1F2937'}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: checked[p.id] ? '#22C55E' : '#1F2937',
                  border: checked[p.id] ? 'none' : '2px solid #374151',
                }}
              >
                {checked[p.id] && <Check size={16} className="text-black" strokeWidth={3} />}
              </div>
              <span className="text-white font-medium">{p.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={alightCount === 0 || confirmed}
          className="w-full h-16 rounded-2xl text-xl font-bold mb-3 transition-all"
          style={{
            background: alightCount > 0 ? '#F59E0B' : '#1F2937',
            color: alightCount > 0 ? '#000' : '#6B7280',
          }}
        >
          {confirmed ? 'Confirmed ✓' : 'Confirm Drop-off'}
        </button>

        <p className="text-gray-500 text-xs text-center">Auto GPS confirm in 5s...</p>
      </div>
    </div>
  );
}
