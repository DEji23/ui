'use client';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle } from 'lucide-react';

export default function LateStartPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E] px-4">
      {/* Warning banner */}
      <div
        className="mx-0 mt-4 rounded-2xl p-4 flex items-center gap-3 mb-6 flex-shrink-0"
        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' }}
      >
        <Clock size={24} className="text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-amber-500 font-bold">Late Start Warning</p>
          <p className="text-amber-400 text-xs">Shift was due to start at 6:30 AM</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-white font-black text-3xl leading-tight mb-2">
            Your shift was due to start
          </h1>
          <p className="text-amber-500 font-black text-5xl mb-2">23 minutes ago</p>
          <p className="text-gray-400 text-sm">LG-458-KA &nbsp;·&nbsp; Oshodi → CMS</p>
        </div>

        {/* Dual buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => router.push('/inspection')}
            className="h-20 rounded-2xl text-lg font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            style={{ background: '#22C55E', color: '#000' }}
          >
            <span className="text-2xl">🚀</span>
            On My Way
          </button>
          <button
            className="h-20 rounded-2xl text-lg font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            style={{ background: '#EF4444', color: '#fff' }}
          >
            <span className="text-2xl">✋</span>
            Cannot Make It
          </button>
        </div>

        <div
          className="rounded-2xl p-3 flex items-center gap-2"
          style={{ background: 'rgba(107,114,128,0.1)', border: '1px solid #1F2937' }}
        >
          <AlertTriangle size={14} className="text-gray-400 flex-shrink-0" />
          <p className="text-gray-400 text-xs">Your dispatcher will be notified of your response</p>
        </div>
      </div>
    </div>
  );
}
