'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle, MapPin } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function TransferInPage() {
  const router = useRouter();
  const { route } = useApp();

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      {/* Green header */}
      <div
        className="px-4 py-5 flex-shrink-0"
        style={{ background: 'rgba(34,197,94,0.15)', borderBottom: '1px solid rgba(34,197,94,0.3)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <CheckCircle size={28} className="text-green-500" />
          <h1 className="text-green-500 font-black text-2xl">Transfer Confirmed ✓</h1>
        </div>
        <p className="text-green-400 text-sm pl-10">Manifest received and verified</p>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-4">
        <div className="flex flex-col gap-3 mb-5">
          {[
            { label: 'Origin Bus', value: 'LG-458-KA' },
            { label: 'Outgoing Driver', value: 'Musa Abdullahi' },
            { label: 'Passengers Transferred', value: '8 passengers' },
            { label: 'Route', value: `Continue ${route}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl px-4 py-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="text-white font-semibold text-sm">{value}</span>
            </div>
          ))}
        </div>

        {/* Next stop card */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-amber-500" />
            <p className="text-amber-400 text-xs uppercase tracking-wider">Next Stop</p>
          </div>
          <p className="text-white font-bold text-xl">Ojuelegba</p>
          <p className="text-gray-400 text-sm">Continue on current route</p>
        </div>

        <button
          onClick={() => router.push('/transfer/continue')}
          className="w-full h-16 rounded-2xl text-xl font-bold"
          style={{ background: '#22C55E', color: '#000' }}
        >
          Accept &amp; Continue Trip
        </button>
      </div>
    </div>
  );
}
