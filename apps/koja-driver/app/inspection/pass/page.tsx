'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle, Check } from 'lucide-react';

const CHECKS = [
  'Tyres & Brakes',
  'Lights & Signals',
  'Fuel Level',
  'Engine & Exhaust',
  'Doors & Windows',
];

export default function InspectionPassPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E] px-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Big green check */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(34,197,94,0.15)', border: '3px solid rgba(34,197,94,0.5)' }}
        >
          <CheckCircle size={64} className="text-green-500" />
        </div>

        <h1 className="text-green-500 font-black text-4xl mb-2">All Clear!</h1>
        <p className="text-gray-400 text-base mb-8">All 5 checks passed</p>

        {/* Check list */}
        <div className="w-full flex flex-col gap-2 mb-8">
          {CHECKS.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: '#111827', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#22C55E' }}
                >
                  <Check size={14} className="text-black" strokeWidth={3} />
                </div>
                <span className="text-white text-sm font-medium">{item}</span>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
              >
                Pass
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Shift CTA */}
      <div className="pb-6 flex-shrink-0">
        <button
          onClick={() => router.push('/boarding')}
          className="w-full h-16 rounded-2xl text-xl font-bold"
          style={{ background: '#F59E0B', color: '#000' }}
        >
          Start Shift
        </button>
      </div>
    </div>
  );
}
