'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Shield, ArrowLeftRight } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function TransferContinuePage() {
  const router = useRouter();
  const { busCode } = useApp();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEmergencyStart() {
    longPressTimer.current = setTimeout(() => {
      router.push('/drive/emergency');
    }, 1500);
  }

  function handleEmergencyEnd() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#060D1A' }}>
      {/* INHERITED MANIFEST badge */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ background: 'rgba(245,158,11,0.2)', borderBottom: '1px solid rgba(245,158,11,0.4)' }}
      >
        <ArrowLeftRight size={14} className="text-amber-500" />
        <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">INHERITED MANIFEST</span>
      </div>

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
      >
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">ACTIVE TRIP</p>
          <p className="text-white font-bold text-sm">{busCode}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
            style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <ArrowLeftRight size={10} />
            8 (transferred)
          </div>
          <button
            onClick={() => router.push('/breakdown')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <AlertTriangle size={16} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Map placeholder */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative"
        style={{ background: 'linear-gradient(135deg, #060D1A 0%, #0D1B2E 50%, #060D1A 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute w-full" style={{ top: `${i * 14}%`, height: '1px', background: '#22C55E' }} />
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)' }}
          >
            <span className="text-amber-500 text-5xl">↑</span>
          </div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">NEXT STOP</p>
          <p className="text-amber-500 font-black text-3xl">CMS</p>
          <p className="text-gray-400 text-sm mt-1">ETA: 8 mins · 3.4 km</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      >
        <div>
          <p className="text-gray-500 text-xs">SHIFT ACTIVE • {busCode}</p>
          <p className="text-white text-sm font-medium">Oshodi → CMS</p>
        </div>
        <button
          onMouseDown={handleEmergencyStart}
          onMouseUp={handleEmergencyEnd}
          onTouchStart={handleEmergencyStart}
          onTouchEnd={handleEmergencyEnd}
          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}
        >
          <Shield size={22} className="text-red-500" fill="rgba(239,68,68,0.3)" />
          <span className="text-red-400 text-[9px] font-bold">HOLD</span>
        </button>
      </div>
    </div>
  );
}
