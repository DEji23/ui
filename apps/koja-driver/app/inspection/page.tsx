'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Lightbulb, Fuel, Settings, DoorOpen } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';

const CHECKS = [
  { id: 'tyres', icon: Wrench, label: 'Tyres & Brakes' },
  { id: 'lights', icon: Lightbulb, label: 'Lights & Signals' },
  { id: 'fuel', icon: Fuel, label: 'Fuel Level' },
  { id: 'engine', icon: Settings, label: 'Engine & Exhaust' },
  { id: 'doors', icon: DoorOpen, label: 'Doors & Windows' },
];

type CheckState = 'pass' | 'fail' | null;

export default function InspectionPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<Record<string, CheckState>>({});

  const total = CHECKS.length;
  const done = Object.keys(checks).length;
  const allDone = done === total;
  const anyFailed = Object.values(checks).some(v => v === 'fail');

  function handleCheck(id: string, val: CheckState) {
    setChecks(prev => ({ ...prev, [id]: val }));
  }

  function handleContinue() {
    if (!allDone) return;
    if (anyFailed) router.push('/inspection/fail');
    else router.push('/inspection/pass');
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader
        title="Pre-Trip Inspection"
        backHref="/shift"
        rightElement={
          <span className="text-gray-400 text-sm font-semibold">{done} of {total}</span>
        }
      />

      {/* Progress bar */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="h-2 rounded-full" style={{ background: '#1F2937' }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ background: '#F59E0B', width: `${(done / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        <div className="flex flex-col gap-3">
          {CHECKS.map(({ id, icon: Icon, label }) => {
            const state = checks[id] ?? null;
            return (
              <div
                key={id}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: '#111827',
                  border: `1px solid ${state === 'pass' ? 'rgba(34,197,94,0.4)' : state === 'fail' ? 'rgba(239,68,68,0.4)' : '#1F2937'}`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: state === 'pass' ? 'rgba(34,197,94,0.15)' : state === 'fail' ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.1)',
                  }}
                >
                  <Icon size={20} className={state === 'pass' ? 'text-green-500' : state === 'fail' ? 'text-red-500' : 'text-gray-500'} />
                </div>
                <span className="flex-1 text-white font-medium">{label}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCheck(id, 'pass')}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all min-h-[44px]"
                    style={{
                      background: state === 'pass' ? '#22C55E' : 'rgba(34,197,94,0.1)',
                      color: state === 'pass' ? '#000' : '#22C55E',
                      border: `1px solid ${state === 'pass' ? '#22C55E' : 'rgba(34,197,94,0.3)'}`,
                    }}
                  >
                    PASS
                  </button>
                  <button
                    onClick={() => handleCheck(id, 'fail')}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all min-h-[44px]"
                    style={{
                      background: state === 'fail' ? '#EF4444' : 'rgba(239,68,68,0.1)',
                      color: state === 'fail' ? '#fff' : '#EF4444',
                      border: `1px solid ${state === 'fail' ? '#EF4444' : 'rgba(239,68,68,0.3)'}`,
                    }}
                  >
                    FAIL
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5">
          <button
            onClick={handleContinue}
            disabled={!allDone}
            className="w-full h-16 rounded-2xl text-xl font-bold transition-all"
            style={{
              background: allDone ? (anyFailed ? '#EF4444' : '#F59E0B') : '#1F2937',
              color: allDone ? (anyFailed ? '#fff' : '#000') : '#6B7280',
            }}
          >
            {!allDone ? `Complete all ${total} checks` : anyFailed ? 'Report Issues' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
