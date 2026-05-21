'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, UserPlus, Play } from 'lucide-react';
import { BottomNav } from '@/components/koja/bottom-nav';
import { useApp } from '@/lib/store';

export default function BoardingPage() {
  const router = useRouter();
  const { busCode, capacity, passengers } = useApp();
  const seated = passengers.length;
  const available = capacity - seated;

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Top status bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: '#111827', borderBottom: '1px solid #1F2937' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">{busCode}</span>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.4)' }}
        >
          BOARDING OPEN
        </div>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll">
        {/* Giant seat counter */}
        <div className="flex flex-col items-center py-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Seats Available</p>
          <div className="flex items-end gap-2">
            <span
              className="font-black leading-none"
              style={{ fontSize: '80px', color: '#F59E0B', lineHeight: 1 }}
            >
              {available}
            </span>
            <span className="text-gray-500 font-bold text-3xl pb-2">/ {capacity}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">{seated} passengers boarded</p>
        </div>

        {/* Passenger list */}
        <div className="px-4 mb-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">On Board</p>
          <div className="flex flex-col gap-2">
            {passengers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: '#111827', border: '1px solid #1F2937' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#1F2937' }}
                >
                  <span className="text-white font-bold text-xs">
                    {p.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <span className="text-white font-medium flex-1 text-sm">{p.name}</span>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{
                    background: p.type === 'qr' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)',
                    color: p.type === 'qr' ? '#22C55E' : '#60A5FA',
                  }}
                >
                  {p.type === 'qr' ? 'QR' : 'Manual'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="px-4 flex flex-col gap-3 pb-4">
          <button
            onClick={() => router.push('/boarding/qr')}
            className="w-full h-16 rounded-2xl text-xl font-bold flex items-center justify-center gap-3"
            style={{ background: '#F59E0B', color: '#000' }}
          >
            <QrCode size={24} />
            Show QR Code
          </button>
          <button
            onClick={() => router.push('/boarding/manual')}
            className="w-full h-14 rounded-2xl text-base font-bold flex items-center justify-center gap-3"
            style={{ background: '#111827', border: '1px solid #1F2937', color: '#9CA3AF' }}
          >
            <UserPlus size={20} />
            Add Manual Passenger
          </button>
          <button
            onClick={() => router.push('/drive')}
            className="w-full h-16 rounded-2xl text-xl font-bold flex items-center justify-center gap-3"
            style={{ background: '#22C55E', color: '#000' }}
          >
            <Play size={24} fill="#000" />
            Start Trip
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
