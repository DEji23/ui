'use client';
import { CheckCircle, Play, Circle } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';
import { BottomNav } from '@/components/koja/bottom-nav';

const TRIPS = [
  { id: 1, from: 'OSHODI', to: 'CMS', time: '6:30 AM', status: 'done' },
  { id: 2, from: 'CMS', to: 'OSHODI', time: '9:00 AM', status: 'done' },
  { id: 3, from: 'OSHODI', to: 'CMS', time: '11:30 AM', status: 'active' },
  { id: 4, from: 'CMS', to: 'OSHODI', time: '2:00 PM', status: 'upcoming' },
];

export default function TripsPage() {
  const done = TRIPS.filter(t => t.status === 'done').length;

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Today's Trips" backHref="/shift" />

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-4">
        {/* Progress */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Progress</span>
            <span className="text-white font-bold">{done} / {TRIPS.length} trips</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: '#1F2937' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ background: '#F59E0B', width: `${(done / TRIPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[27px] top-8 bottom-8 w-0.5"
            style={{ background: '#1F2937' }}
          />

          <div className="flex flex-col gap-4">
            {TRIPS.map((trip, i) => {
              const isDone = trip.status === 'done';
              const isActive = trip.status === 'active';
              return (
                <div key={trip.id} className="flex items-start gap-4">
                  {/* Status icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center relative z-10"
                    style={{
                      background: isDone ? 'rgba(34,197,94,0.15)' : isActive ? 'rgba(245,158,11,0.15)' : '#111827',
                      border: `1px solid ${isDone ? 'rgba(34,197,94,0.4)' : isActive ? 'rgba(245,158,11,0.4)' : '#1F2937'}`,
                    }}
                  >
                    {isDone && <CheckCircle size={24} className="text-green-500" />}
                    {isActive && <Play size={24} className="text-amber-500" fill="#F59E0B" />}
                    {!isDone && !isActive && <Circle size={24} className="text-gray-600" />}
                  </div>

                  {/* Trip card */}
                  <div
                    className="flex-1 rounded-2xl p-4"
                    style={{
                      background: isActive ? 'rgba(245,158,11,0.08)' : '#111827',
                      border: `1px solid ${isActive ? 'rgba(245,158,11,0.3)' : '#1F2937'}`,
                      opacity: isDone ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold text-base">
                        {trip.from} → {trip.to}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: isDone ? 'rgba(34,197,94,0.2)' : isActive ? 'rgba(245,158,11,0.2)' : 'rgba(107,114,128,0.2)',
                          color: isDone ? '#22C55E' : isActive ? '#F59E0B' : '#6B7280',
                        }}
                      >
                        {isDone ? '✓ Completed' : isActive ? '▶ In Progress' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Trip {i + 1} &nbsp;·&nbsp; {trip.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
