'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Delete, CheckCircle } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';
import { useApp } from '@/lib/store';

export default function BoardingManualPage() {
  const router = useRouter();
  const { capacity, passengers, addPassenger } = useApp();
  const [code, setCode] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const available = capacity - passengers.length;

  const KEYS = ['1','2','3','4','5','6','7','8','9','del','0','ok'];

  function handleKey(key: string) {
    if (key === 'del') setCode(c => c.slice(0, -1));
    else if (key === 'ok') handleConfirm();
    else if (code.length < 6) setCode(c => c + key);
  }

  function handleConfirm() {
    if (code.length < 3) return;
    addPassenger({
      id: Date.now().toString(),
      name: `Passenger ${passengers.length + 1}`,
      type: 'manual',
      boardedAt: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    });
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setCode('');
      router.back();
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Add Passenger" backHref="/boarding" />

      <div className="flex-1 flex flex-col px-4 py-4">
        {/* Seat count */}
        <div
          className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <span className="text-gray-400 text-sm">Seats remaining</span>
          <span className="text-amber-500 font-bold text-lg">{available} / {capacity}</span>
        </div>

        {/* Code display */}
        <div
          className="flex-shrink-0 rounded-2xl px-6 py-5 mb-5 text-center relative overflow-hidden"
          style={{
            background: confirmed ? 'rgba(34,197,94,0.15)' : '#111827',
            border: `1px solid ${confirmed ? 'rgba(34,197,94,0.5)' : '#1F2937'}`,
            transition: 'all 0.3s',
          }}
        >
          {confirmed ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle size={28} className="text-green-500" />
              <span className="text-green-500 font-bold text-2xl">PING! Boarded</span>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Short Code</p>
              <p
                className="font-black tracking-[0.3em] text-4xl"
                style={{ color: code ? '#F59E0B' : '#374151', minHeight: '48px' }}
              >
                {code || 'XXXXXX'}
              </p>
            </>
          )}
        </div>

        {/* Keypad */}
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-3">
            {KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                disabled={confirmed}
                className="flex items-center justify-center rounded-2xl h-14 transition-all active:scale-95 font-bold"
                style={{
                  background: key === 'ok' ? (code.length >= 3 ? '#22C55E' : '#1F2937') : '#111827',
                  border: '1px solid #1F2937',
                  color: key === 'ok' ? (code.length >= 3 ? '#000' : '#6B7280') : 'white',
                  fontSize: '20px',
                }}
              >
                {key === 'del' ? <Delete size={20} className="text-gray-300" /> : key === 'ok' ? '✓' : key}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm CTA */}
        <button
          onClick={handleConfirm}
          disabled={code.length < 3 || confirmed}
          className="w-full h-16 rounded-2xl text-xl font-bold mt-4 transition-all"
          style={{
            background: code.length >= 3 ? '#F59E0B' : '#1F2937',
            color: code.length >= 3 ? '#000' : '#6B7280',
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
