'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function TripSummaryPage() {
  const router = useRouter();
  const { cashCollected, walletEarnings, passengers, capacity } = useApp();
  const total = cashCollected + walletEarnings;

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0 text-center">
        <h1 className="text-white font-black text-2xl">Trip Complete</h1>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        {/* Green checkmark */}
        <div className="flex justify-center py-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.15)', border: '3px solid rgba(34,197,94,0.5)' }}
          >
            <CheckCircle size={48} className="text-green-500" />
          </div>
        </div>

        {/* Two money cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <p className="text-gray-400 text-xs mb-1">Cash</p>
            <p className="text-green-500 font-black text-2xl">₦{cashCollected.toLocaleString()}</p>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            <p className="text-gray-400 text-xs mb-1">Wallet</p>
            <p className="text-blue-400 font-black text-2xl">₦{walletEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* Total */}
        <div
          className="rounded-2xl p-5 mb-4 text-center"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
          <p
            className="font-black text-green-500"
            style={{ fontSize: '48px', lineHeight: 1 }}
          >
            ₦{total.toLocaleString()}
          </p>
        </div>

        {/* Trip stats */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Passengers</span>
            <span className="text-white font-bold">{capacity} boarded</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Status</span>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
            >
              Completed on time
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push('/trip/cash')}
          className="w-full h-16 rounded-2xl text-xl font-bold mb-3"
          style={{ background: '#F59E0B', color: '#000' }}
        >
          Start Return Trip
        </button>
        <button
          onClick={() => router.push('/offline')}
          className="w-full h-14 rounded-2xl text-base font-bold"
          style={{ background: 'transparent', border: '1px solid #1F2937', color: '#9CA3AF' }}
        >
          Go Offline
        </button>
      </div>
    </div>
  );
}
