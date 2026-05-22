'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PickupAlertPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex flex-col h-full items-center justify-center border-flash"
      style={{ background: '#0A0F1E' }}
    >
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        {/* Pickup label */}
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'rgba(245,158,11,0.2)',
            border: '3px solid #F59E0B',
            boxShadow: '0 0 40px rgba(245,158,11,0.4)',
          }}
        >
          <span className="text-amber-500 text-5xl">🚏</span>
        </div>

        <p
          className="font-black uppercase tracking-widest mb-4"
          style={{ fontSize: '52px', color: '#F59E0B', lineHeight: 1 }}
        >
          PICKUP
        </p>

        <p className="text-white font-bold text-xl mb-2">
          3 passengers at Ojuelegba
        </p>
        <p className="text-gray-400 text-base mb-2">0.3 km away</p>

        {/* Countdown */}
        <div
          className="rounded-full px-6 py-2 mb-8"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <span className="text-amber-500 font-bold text-lg">{countdown}s</span>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => router.back()}
          className="w-full h-16 rounded-2xl text-xl font-bold"
          style={{ background: '#1F2937', color: '#9CA3AF' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
