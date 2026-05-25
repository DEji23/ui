'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Delete, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';

const EXPECTED = 3600;
const MANUAL_COUNT = 12;
const FARE = 300;

export default function CashReconciliationPage() {
  const router = useRouter();
  const [entered, setEntered] = useState('');

  const enteredNum = entered ? parseInt(entered, 10) : null;
  const diff = enteredNum !== null ? enteredNum - EXPECTED : null;
  const isMatch = diff === 0;
  const hasDiscrepancy = diff !== null && diff !== 0;

  const KEYS = ['1','2','3','4','5','6','7','8','9','del','0','00'];

  function handleKey(key: string) {
    if (key === 'del') setEntered(e => e.slice(0, -1));
    else if (entered.length < 7) setEntered(e => e + key);
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Cash Reconciliation" backHref="/trip/summary" />

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-4">
        {/* System expected */}
        <div
          className="rounded-2xl p-5 mb-4 text-center"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">System Expected</p>
          <p className="text-white font-black text-5xl">₦{EXPECTED.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-2">
            Based on {MANUAL_COUNT} manual boardings × ₦{FARE} fare
          </p>
        </div>

        {/* Driver entry */}
        <div
          className="rounded-2xl p-4 mb-4 text-center"
          style={{
            background: '#111827',
            border: `1px solid ${isMatch ? 'rgba(34,197,94,0.5)' : hasDiscrepancy ? 'rgba(239,68,68,0.5)' : '#1F2937'}`,
          }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Your Count</p>
          <p
            className="font-black text-5xl"
            style={{ color: isMatch ? '#22C55E' : hasDiscrepancy ? '#EF4444' : '#F59E0B' }}
          >
            {entered ? `₦${parseInt(entered).toLocaleString()}` : '₦———'}
          </p>
        </div>

        {/* Match / discrepancy status */}
        {isMatch && (
          <div
            className="rounded-2xl p-4 mb-4 flex items-center gap-3"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)' }}
          >
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            <p className="text-green-400 font-bold">✓ Amounts Match!</p>
          </div>
        )}
        {hasDiscrepancy && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 font-bold">⚠ Discrepancy: {diff! > 0 ? '+' : ''}₦{diff!.toLocaleString()}</p>
            </div>
            <p className="text-gray-400 text-xs">Select reason:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Change given', 'Passenger refused', 'Counted wrong', 'Other'].map(r => (
                <button
                  key={r}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: '#1F2937', color: '#9CA3AF', border: '1px solid #374151' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {KEYS.map(key => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all active:scale-95"
              style={{ background: '#111827', border: '1px solid #1F2937', color: 'white' }}
            >
              {key === 'del' ? <Delete size={18} className="text-gray-300" /> : key}
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/daily-summary')}
          disabled={!entered}
          className="w-full h-16 rounded-2xl text-xl font-bold transition-all"
          style={{
            background: entered ? '#F59E0B' : '#1F2937',
            color: entered ? '#000' : '#6B7280',
          }}
        >
          Submit Reconciliation
        </button>
      </div>
    </div>
  );
}
