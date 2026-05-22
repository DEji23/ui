'use client';
import { BusIcon, AlertTriangle } from 'lucide-react';
import { BottomNav } from '@/components/koja/bottom-nav';
import { useApp } from '@/lib/store';

export default function InspectionBlockedPage() {
  const { busCode } = useApp();

  const INSTRUCTIONS = [
    'Stay calm and stay with the bus',
    'Do not collect any more fares',
    'Keep passengers informed',
    'Wait for your replacement bus',
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-6">
        {/* Red bus icon */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 relative"
            style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}
          >
            <BusIcon size={48} className="text-red-500" />
            <div
              className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: '#EF4444' }}
            >
              <span className="text-white font-black text-lg">✕</span>
            </div>
          </div>
          <h1 className="text-red-500 font-black text-3xl">Bus Blocked</h1>
          <p className="text-gray-400 text-sm mt-1">{busCode}</p>
        </div>

        {/* Issue summary */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-red-400 font-bold text-sm">Reported Issue</p>
          </div>
          <p className="text-white font-medium">Engine & Exhaust — Overheating</p>
          <p className="text-gray-400 text-xs mt-1">Reported at 9:41 AM · GPS location sent</p>
        </div>

        {/* Waiting card */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full pulse-dot" style={{ background: '#F59E0B' }} />
            <p className="text-amber-500 font-bold">Waiting for replacement bus</p>
          </div>
          <p className="text-gray-400 text-xs mt-2">Fleet manager has been notified</p>
        </div>

        {/* Instructions */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">What to do now</p>
          <div className="flex flex-col gap-3">
            {INSTRUCTIONS.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: '#1F2937' }}
                >
                  <span className="text-amber-500 text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View schedule */}
      <div className="px-4 pb-3 flex-shrink-0">
        <button
          className="w-full h-14 rounded-2xl text-base font-bold"
          style={{ background: 'transparent', border: '1px solid #1F2937', color: '#9CA3AF' }}
        >
          View My Schedule
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
