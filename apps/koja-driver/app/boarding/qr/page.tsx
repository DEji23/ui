'use client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { useApp } from '@/lib/store';

export default function BoardingQRPage() {
  const router = useRouter();
  const { busCode, route } = useApp();

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#FFFFFF' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center px-4 py-3 flex-shrink-0"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-600"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="ml-3 text-gray-800 font-bold text-lg">Scan to Board</span>
      </div>

      {/* QR code centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Brightness note */}
        <div
          className="w-full rounded-xl px-4 py-2.5 mb-6 flex items-center gap-2"
          style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}
        >
          <span className="text-amber-600 text-xs font-medium">
            ☀️ Screen brightness set to maximum for easy scanning
          </span>
        </div>

        {/* QR */}
        <div
          className="p-6 rounded-3xl"
          style={{ background: '#FFFFFF', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '2px solid #E5E7EB' }}
        >
          <QRCode
            value="KOJA-LG458KA-TRP001"
            size={220}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        {/* Bus info */}
        <div className="mt-6 text-center">
          <p className="text-gray-900 font-black text-2xl mb-1">Bus {busCode}</p>
          <p className="text-gray-500 text-base">Route: {route}</p>
        </div>

        {/* Instruction */}
        <div
          className="mt-6 w-full rounded-2xl px-5 py-4 text-center"
          style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
        >
          <p className="text-gray-600 text-sm leading-relaxed">
            Show passengers this QR to scan and board.
            <br />
            Each scan registers one seat.
          </p>
        </div>
      </div>
    </div>
  );
}
