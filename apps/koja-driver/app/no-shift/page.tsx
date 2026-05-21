'use client';
import { Calendar, X } from 'lucide-react';
import { BottomNav } from '@/components/koja/bottom-nav';
import { useApp } from '@/lib/store';

export default function NoShiftPage() {
  const { driverName } = useApp();
  const firstName = driverName.split(' ')[0];

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <div className="flex-1 overflow-y-auto koja-scroll flex flex-col items-center justify-center px-6">
        {/* Illustration */}
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center mb-6 relative"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <Calendar size={56} className="text-gray-600" />
          <div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#EF4444' }}
          >
            <X size={16} className="text-white" strokeWidth={3} />
          </div>
        </div>

        <h1 className="text-white font-black text-4xl mb-3 text-center">No Shift Today</h1>
        <p className="text-gray-400 text-center text-base mb-8">
          Enjoy your rest day, Captain {firstName}
        </p>

        {/* Next shift card */}
        <div
          className="w-full rounded-3xl p-5 mb-4"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-3">Next Shift</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">Fri, 23 May 2025</p>
              <p className="text-gray-400 text-sm">6:30 AM &nbsp;·&nbsp; Oshodi → CMS</p>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}
            >
              In 2 days
            </div>
          </div>
        </div>

        <button
          className="w-full h-14 rounded-2xl text-base font-bold transition-all"
          style={{ background: 'transparent', border: '1px solid #1F2937', color: '#9CA3AF' }}
        >
          View Full Schedule
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
