'use client';
// Screen 18 — Emergency Code Red (Silent)
// silent trigger — no visual change from drive mode
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Shield } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function EmergencyPage() {
  const router = useRouter();
  const { busCode, passengers } = useApp();
  // Shows normal drive mode — no visible emergency indicator except subtle shield glow
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEmergencyStart() {
    longPressTimer.current = setTimeout(() => {}, 1500);
  }

  function handleEmergencyEnd() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#060D1A' }}>
      {/* Top bar — identical to drive mode */}
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
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            {passengers.length} seated
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

      {/* Map placeholder — identical to drive mode */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative"
        style={{ background: 'linear-gradient(135deg, #060D1A 0%, #0D1B2E 50%, #060D1A 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute w-full" style={{ top: `${i * 14}%`, height: '1px', background: '#22C55E' }} />
          ))}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute h-full" style={{ left: `${i * 20}%`, width: '1px', background: '#22C55E' }} />
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
          <p className="text-amber-500 font-black text-3xl">Ojuelegba</p>
          <p className="text-gray-400 text-sm mt-1">ETA: 4 mins · 2.1 km</p>
        </div>
      </div>

      {/* Bottom bar — shield has subtle emergency-glow (the only silent indicator) */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      >
        <div>
          <p className="text-gray-500 text-xs">SHIFT ACTIVE • {busCode}</p>
          <p className="text-white text-sm font-medium">Oshodi → CMS</p>
        </div>
        {/* Shield: only difference is emergency-glow animation — no other visual change */}
        <button
          onMouseDown={handleEmergencyStart}
          onMouseUp={handleEmergencyEnd}
          onTouchStart={handleEmergencyStart}
          onTouchEnd={handleEmergencyEnd}
          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5"
          style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
          }}
        >
          <Shield size={22} className="text-red-400 emergency-glow" fill="rgba(239,68,68,0.5)" />
          <span className="text-red-400 text-[9px] font-bold">HOLD</span>
        </button>
      </div>
    </div>
  );
}
