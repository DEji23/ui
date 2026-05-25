'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useApp } from '@/lib/store';

export default function TransferOutPage() {
  const router = useRouter();
  const { passengers, busCode, route } = useApp();

  const preview = passengers.length <= 2
    ? passengers.map(p => p.name).join(', ')
    : `${passengers.slice(0, 2).map(p => p.name).join(', ')} + ${passengers.length - 2} more`;

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #1F2937' }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-[#1F2937] flex items-center justify-center text-gray-400"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-white font-bold text-lg">Transfer Manifest</h1>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-5">
        {/* QR card */}
        <div
          className="rounded-3xl p-6 mb-4 flex flex-col items-center"
          style={{ background: '#fff' }}
        >
          <QRCode
            value={`KOJA-TRF-4821-${busCode}`}
            size={180}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        {/* Transfer code */}
        <div className="text-center mb-4">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Transfer Code</p>
          <p className="text-amber-500 font-black text-4xl tracking-widest">TRF-4821</p>
        </div>

        {/* Passenger preview */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Passengers</p>
          <p className="text-white font-medium">
            {preview} ({passengers.length} passengers)
          </p>
        </div>

        {/* Info card */}
        <div
          className="rounded-2xl p-4 mb-5 flex items-start gap-3"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <span className="text-green-500 text-lg flex-shrink-0">ℹ️</span>
          <p className="text-green-400 text-sm leading-relaxed">
            Passengers do <strong>NOT</strong> pay again on the new bus.
          </p>
        </div>

        <p className="text-gray-400 text-sm text-center">
          Show this QR to the incoming driver
        </p>
      </div>
    </div>
  );
}
