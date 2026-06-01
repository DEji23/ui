'use client';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function ReliefEmergencyPage() {
  const router = useRouter();
  const { busCode, route } = useApp();

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Emergency badge */}
      <div
        className="flex items-center justify-center py-3 flex-shrink-0"
        style={{ background: '#EF4444' }}
      >
        <span className="text-white font-black text-sm uppercase tracking-widest">🚨 EMERGENCY ASSIGNMENT</span>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-4">
        {/* Map placeholder */}
        <div
          className="w-full rounded-3xl mb-5 flex items-center justify-center relative overflow-hidden"
          style={{ height: '160px', background: '#111827', border: '1px solid #1F2937' }}
        >
          <div className="absolute inset-0 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute w-full" style={{ top: `${i * 20}%`, height: '1px', background: '#22C55E' }} />
            ))}
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ background: '#EF4444' }}
            >
              <MapPin size={24} className="text-white" />
            </div>
            <p className="text-white font-bold">Ojuelegba Bus Stop</p>
            <p className="text-gray-400 text-xs">Pickup location</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="flex flex-col gap-3 mb-5">
          {[
            { label: 'Pickup At', value: 'Ojuelegba Bus Stop' },
            { label: 'Passengers to Inherit', value: '8 passengers' },
            { label: 'Bus', value: busCode },
            { label: 'Route', value: route },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl px-4 py-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="text-white font-semibold">{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/transfer/in')}
          className="w-full h-16 rounded-2xl text-xl font-bold mb-4"
          style={{ background: '#22C55E', color: '#000' }}
        >
          Accept Assignment
        </button>

        <button className="w-full text-gray-500 text-sm font-medium py-2">
          Decline with Reason
        </button>
      </div>
    </div>
  );
}
