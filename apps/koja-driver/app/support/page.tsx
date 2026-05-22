'use client';
import { useState } from 'react';
import { Lock, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const supportNumber = '0800-KOJA-HELP';

  function handleCopy() {
    navigator.clipboard?.writeText(supportNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E] items-center justify-center px-6 koja-scroll">
      {/* Lock icon */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}
      >
        <Lock size={48} className="text-red-500" />
      </div>

      <h1 className="text-white font-black text-3xl mb-3 text-center">Account Locked</h1>
      <p className="text-gray-400 text-center text-sm leading-relaxed mb-8 max-w-[280px]">
        You&apos;ve exceeded 5 PIN attempts. Contact support to unlock your account.
      </p>

      {/* Support number */}
      <div
        className="w-full rounded-2xl p-6 mb-4 text-center"
        style={{ background: '#111827', border: '1px solid #1F2937' }}
      >
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Support Line</p>
        <p className="text-white font-black text-3xl tracking-wide">{supportNumber}</p>
        <p className="text-gray-500 text-xs mt-2">Available 24 / 7</p>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="w-full h-16 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all"
        style={{ background: copied ? '#22C55E' : '#F59E0B', color: '#000' }}
      >
        {copied ? <Check size={22} /> : <Copy size={22} />}
        {copied ? 'Copied!' : 'Copy Number'}
      </button>

      <button
        onClick={() => router.push('/login')}
        className="mt-4 text-gray-500 text-sm font-medium"
      >
        Back to Login
      </button>
    </div>
  );
}
