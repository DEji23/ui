'use client';
import { BottomNav } from '@/components/koja/bottom-nav';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '@/lib/store';

const TRANSACTIONS = [
  { id: 'TRP-20240521-001', label: 'Today 2:30 PM', amount: 4750, type: 'credit' },
  { id: 'TRP-20240520-004', label: 'Yesterday 4:15 PM', amount: 5200, type: 'credit' },
  { id: 'TRP-20240520-003', label: 'Yesterday 1:00 PM', amount: 4800, type: 'credit' },
  { id: 'TRP-20240519-002', label: '19 May 11:45 AM', amount: 3960, type: 'credit' },
  { id: 'TRP-20240519-001', label: '19 May 9:00 AM', amount: 4200, type: 'credit' },
  { id: 'WDRL-20240518', label: '18 May', amount: 15000, type: 'debit', label2: 'Withdrawal' },
];

export default function WalletPage() {
  const { walletEarnings } = useApp();
  const balance = 15470;

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h1 className="text-white font-black text-2xl">Wallet & Earnings</h1>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        {/* Balance */}
        <div
          className="rounded-3xl p-6 mb-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.05) 100%)',
            border: '1px solid rgba(34,197,94,0.3)',
          }}
        >
          <p className="text-gray-400 text-sm mb-2">Current Balance</p>
          <p
            className="font-black text-green-500"
            style={{ fontSize: '56px', lineHeight: 1 }}
          >
            ₦{balance.toLocaleString()}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Today', value: '₦4,750' },
            { label: 'This Week', value: '₦22,180' },
            { label: 'This Month', value: '₦68,400' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <p className="text-gray-500 text-xs mb-0.5">{label}</p>
              <p className="text-white font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Transaction History</p>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {TRANSACTIONS.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-2xl px-4 py-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <div>
                <p className="text-white font-medium text-sm">{tx.id}</p>
                <p className="text-gray-500 text-xs">{tx.label}</p>
              </div>
              <span
                className="font-bold text-base"
                style={{ color: tx.type === 'credit' ? '#22C55E' : '#EF4444' }}
              >
                {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Withdraw CTA */}
        <button
          className="w-full h-16 rounded-2xl text-xl font-bold flex items-center justify-center gap-3"
          style={{ background: '#F59E0B', color: '#000' }}
        >
          <ArrowUpRight size={22} />
          Withdraw Earnings
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
