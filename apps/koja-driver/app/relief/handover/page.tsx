'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

export default function ReliefHandoverPage() {
  const router = useRouter();
  const { cashCollected, walletEarnings } = useApp();
  const totalEarnings = cashCollected + walletEarnings;
  const earningsToDate = 6650;

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h1 className="text-white font-black text-2xl">Handover Summary</h1>
        <p className="text-gray-400 text-sm">Confirm and hand over to relief driver</p>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        {/* Big cash */}
        <div
          className="rounded-3xl p-6 mb-4 text-center"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <p className="text-gray-400 text-sm mb-1">Cash Collected</p>
          <p
            className="font-black text-green-500"
            style={{ fontSize: '56px', lineHeight: 1 }}
          >
            ₦{cashCollected.toLocaleString()}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: '#111827', border: '1px solid #1F2937' }}
          >
            <p className="text-gray-400 text-xs mb-1">On Board</p>
            <p className="text-white font-bold text-2xl">8</p>
            <p className="text-gray-500 text-xs">passengers</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: '#111827', border: '1px solid #1F2937' }}
          >
            <p className="text-gray-400 text-xs mb-1">Wallet Earnings</p>
            <p className="text-amber-500 font-bold text-2xl">₦{walletEarnings.toLocaleString()}</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Trip ID</span>
            <span className="text-white font-semibold">TRP-20240521-003</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Earnings to Date</span>
            <span className="text-green-500 font-bold text-lg">₦{earningsToDate.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/trip/summary')}
          className="w-full h-16 rounded-2xl text-xl font-bold mb-3"
          style={{ background: '#F59E0B', color: '#000' }}
        >
          Confirm Handover
        </button>

        <p className="text-gray-500 text-xs text-center">All data logged automatically</p>
      </div>
    </div>
  );
}
