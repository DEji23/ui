'use client';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

const STEPS = [
  'Pull over safely at the next bus stop',
  'Do not collect more fares from passengers',
  'Inform passengers a replacement driver is coming',
  'Hand over the keys and manifest to the relief driver',
];

export default function ReliefNotifyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Warning banner */}
      <div
        className="px-4 py-4 flex-shrink-0 flex items-center gap-3"
        style={{ background: 'rgba(239,68,68,0.2)', borderBottom: '2px solid rgba(239,68,68,0.5)' }}
      >
        <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
        <div>
          <p className="text-red-400 font-black text-base">You Are Being Relieved</p>
          <p className="text-red-300 text-xs">Manager Request</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-5">
        {/* Pull over instruction */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <p className="text-amber-400 text-xs uppercase tracking-wider mb-1">Pull over at</p>
          <p className="text-white font-bold text-xl">Ojuelegba Bus Stop</p>
        </div>

        {/* Reason */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Reason</p>
          <p className="text-white">Manager request — end of allocation</p>
        </div>

        {/* Steps */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Handover Steps</p>
        <div className="flex flex-col gap-3 mb-6">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-2xl p-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: '#1F2937' }}
              >
                <span className="text-amber-500 text-sm font-bold">{i + 1}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/relief/handover')}
          className="w-full h-16 rounded-2xl text-xl font-bold"
          style={{ background: '#F59E0B', color: '#000' }}
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}
