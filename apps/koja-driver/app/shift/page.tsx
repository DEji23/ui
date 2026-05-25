'use client';
import { useRouter } from 'next/navigation';
import { Bus, MapPin, Clock, Users, Warehouse } from 'lucide-react';
import { BottomNav } from '@/components/koja/bottom-nav';
import { useApp } from '@/lib/store';

export default function ShiftPage() {
  const router = useRouter();
  const { busCode, route, capacity, depot } = useApp();

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <p className="text-gray-400 text-sm">Good morning,</p>
        <h1 className="text-white font-black text-2xl">Today&apos;s Shift</h1>
      </div>

      {/* Assignment card */}
      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        <div
          className="rounded-3xl p-5 mb-4"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          {/* Bus code */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.15)' }}
              >
                <Bus size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Bus Code</p>
                <p className="text-white font-black text-2xl">{busCode}</p>
              </div>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}
            >
              NEW
            </div>
          </div>

          {/* Route */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: '#0A0F1E' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-amber-500" />
              <p className="text-gray-400 text-xs uppercase tracking-wider">Route</p>
            </div>
            <p className="text-white font-bold text-xl">{route}</p>
          </div>

          {/* Countdown badge */}
          <div
            className="w-full rounded-2xl py-3 px-4 mb-4 flex items-center justify-center gap-2"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <Clock size={16} className="text-amber-500" />
            <span className="text-amber-500 font-bold text-lg">Departs in 47 mins</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: '#0A0F1E' }}>
              <p className="text-amber-500 font-black text-xl">4</p>
              <p className="text-gray-400 text-xs mt-0.5">Trips Today</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#0A0F1E' }}>
              <p className="text-amber-500 font-black text-xl">{capacity}</p>
              <p className="text-gray-400 text-xs mt-0.5">Seats</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#0A0F1E' }}>
              <div className="flex items-center justify-center mb-0.5">
                <Warehouse size={16} className="text-amber-500" />
              </div>
              <p className="text-gray-400 text-xs">{depot}</p>
            </div>
          </div>
        </div>

        {/* Extra info */}
        <div
          className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <Users size={16} className="text-gray-400" />
          <p className="text-gray-400 text-sm">
            <span className="text-white font-semibold">4 trips scheduled</span> — Oshodi ⇄ CMS
          </p>
        </div>

        {/* CTAs */}
        <button
          onClick={() => router.push('/inspection')}
          className="w-full h-16 rounded-2xl text-xl font-bold mb-3 transition-all active:scale-98"
          style={{ background: '#F59E0B', color: '#000' }}
        >
          Accept Shift
        </button>
        <button
          onClick={() => router.push('/shift/problem')}
          className="w-full h-16 rounded-2xl text-xl font-bold transition-all active:scale-98"
          style={{ background: '#EF4444', color: '#fff' }}
        >
          Report a Problem
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
