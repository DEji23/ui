'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, Clock } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function BreakdownWaitingPage() {
  const router = useRouter();
  const { passengers, cashCollected } = useApp();
  const [eta, setEta] = useState(25);

  useEffect(() => {
    const t = setInterval(() => setEta(e => (e > 0 ? e - 1 : 0)), 60000);
    return () => clearInterval(t);
  }, []);

  const INSTRUCTIONS = [
    'Stay calm and stay with the bus',
    "Don't collect any more fares",
    'Keep passengers updated',
    'Await the replacement bus',
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h1 className="text-white font-black text-2xl">Breakdown Reported</h1>
        <p className="text-gray-400 text-sm">Help is on the way</p>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        {/* Bus icon with spinner */}
        <div className="flex flex-col items-center py-4 mb-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)' }}
            >
              <Bus size={40} className="text-amber-500" />
            </div>
            <div
              className="absolute -inset-2 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: '#F59E0B' }}
            />
          </div>
          <p className="text-amber-500 font-bold text-lg mt-4">Replacement Bus Coming</p>
        </div>

        {/* ETA card */}
        <div
          className="rounded-2xl p-5 mb-4 text-center"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={16} className="text-amber-500" />
            <p className="text-amber-400 text-sm font-medium">Estimated Arrival</p>
          </div>
          <p className="text-amber-500 font-black" style={{ fontSize: '56px', lineHeight: 1 }}>{eta}</p>
          <p className="text-amber-400 font-medium text-lg">minutes</p>
        </div>

        {/* Status card */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Current Status</p>
          <div className="flex justify-between">
            <div className="text-center">
              <p className="text-white font-bold text-2xl">{passengers.length}</p>
              <p className="text-gray-400 text-xs">On board</p>
            </div>
            <div className="text-center">
              <p className="text-green-500 font-bold text-2xl">₦{cashCollected.toLocaleString()}</p>
              <p className="text-gray-400 text-xs">Collected</p>
            </div>
            <div className="text-center">
              <p className="text-amber-500 font-bold text-2xl">TRP-003</p>
              <p className="text-gray-400 text-xs">Trip ID</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          {INSTRUCTIONS.map((step, i) => (
            <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: '#1F2937' }}
              >
                <span className="text-amber-500 text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-gray-300 text-sm">{step}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/transfer/out')}
          className="w-full h-16 rounded-2xl text-xl font-bold"
          style={{ background: '#F59E0B', color: '#000' }}
        >
          Generate Transfer Manifest
        </button>
      </div>
    </div>
  );
}
