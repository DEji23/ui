'use client';
import { useRouter } from 'next/navigation';
import { Power } from 'lucide-react';

export default function OfflinePage() {
  const router = useRouter();

  return (
    <div
      className="flex flex-col h-full items-center justify-center px-6"
      style={{ background: '#0A0F1E' }}
    >
      {/* Power icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}
      >
        <Power size={48} className="text-red-500" />
      </div>

      <h1 className="text-white font-black text-3xl mb-2">Going Offline</h1>
      <p className="text-gray-400 text-sm mb-8">This will end your shift</p>

      {/* Info box */}
      <div
        className="w-full rounded-2xl p-5 mb-8"
        style={{ border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.08)' }}
      >
        <p className="text-amber-400 font-bold text-sm mb-3">Going offline will:</p>
        <div className="flex flex-col gap-2">
          {[
            'Release your bus from passenger map',
            'Stop GPS tracking',
            'End your shift',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span className="text-amber-500 text-sm mt-0.5">•</span>
              <p className="text-amber-300 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => router.push('/login')}
        className="w-full h-16 rounded-2xl text-xl font-bold mb-4"
        style={{ background: '#EF4444', color: '#fff' }}
      >
        Confirm Offline
      </button>

      <button
        onClick={() => router.back()}
        className="text-gray-500 text-sm font-medium"
      >
        Cancel
      </button>
    </div>
  );
}
