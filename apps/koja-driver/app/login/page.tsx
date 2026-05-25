'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Delete } from 'lucide-react';
import { useApp } from '@/lib/store';

const DEMO_PIN = '1234';

export default function LoginPage() {
  const router = useRouter();
  const { pinAttempts, setPinAttempts } = useApp();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  const canLogin = phone.length === 10 && pin.length === 4;

  function handleKey(key: string) {
    if (key === 'del') {
      if (pin.length > 0) setPin(p => p.slice(0, -1));
      else setPhone(p => p.slice(0, -1));
    } else {
      if (pin.length < 4) {
        setPin(p => p + key);
      } else if (phone.length < 10) {
        setPhone(p => p + key);
      }
    }
  }

  function handlePhoneKey(key: string) {
    if (key === 'del') setPhone(p => p.slice(0, -1));
    else if (phone.length < 10) setPhone(p => p + key);
  }

  function handleLogin() {
    if (!canLogin) return;
    if (pin === DEMO_PIN) {
      setPinAttempts(0);
      router.push('/shift');
    } else {
      const attempts = pinAttempts + 1;
      setPinAttempts(attempts);
      if (attempts >= 5) {
        router.push('/support');
      }
    }
  }

  const KEYS = ['1','2','3','4','5','6','7','8','9','*','0','del'];

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E] koja-scroll">
      {/* Logo */}
      <div className="flex flex-col items-center pt-8 pb-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: '#F59E0B' }}
        >
          <span className="text-black font-black text-3xl">K</span>
        </div>
        <span className="text-white font-black text-2xl tracking-[0.15em]">KOJA</span>
        <span className="text-gray-500 text-xs mt-1">Captain App</span>
      </div>

      {/* Phone field */}
      <div className="px-6 mb-4">
        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
          Phone Number
        </label>
        <div
          className="flex items-center gap-3 px-4 rounded-2xl h-14"
          style={{ background: '#111827', border: '1px solid #1F2937' }}
        >
          <div className="flex items-center gap-2 pr-3 border-r border-gray-700">
            <span className="text-xl">🇳🇬</span>
            <span className="text-gray-300 text-sm font-medium">+234</span>
          </div>
          <span className="text-white text-lg font-medium tracking-widest flex-1">
            {phone || <span className="text-gray-600">8XX XXX XXXX</span>}
          </span>
        </div>
      </div>

      {/* PIN dots */}
      <div className="px-6 mb-6">
        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 block">
          PIN
        </label>
        <div className="flex items-center justify-center gap-5">
          {[0,1,2,3].map((i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full transition-all duration-200"
              style={{
                background: i < pin.length ? '#F59E0B' : 'transparent',
                border: i === pin.length ? '2px solid #F59E0B' : '2px solid #374151',
                transform: i === pin.length ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
        {pinAttempts > 0 && pinAttempts < 5 && (
          <p className="text-red-400 text-xs text-center mt-2">
            Wrong PIN. {5 - pinAttempts} attempt{5 - pinAttempts !== 1 ? 's' : ''} remaining.
          </p>
        )}
      </div>

      {/* Numeric keypad */}
      <div className="px-6 flex-1">
        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === '*') return;
                if (key === 'del') {
                  if (pin.length > 0) setPin(p => p.slice(0, -1));
                  else setPhone(p => p.slice(0, -1));
                } else {
                  if (pin.length < 4) setPin(p => p + key);
                  else if (phone.length < 10) handlePhoneKey(key);
                }
              }}
              className="flex items-center justify-center rounded-2xl h-14 transition-all active:scale-95 font-semibold"
              style={{
                background: key === '*' ? 'transparent' : '#111827',
                border: key === '*' ? 'none' : '1px solid #1F2937',
                color: 'white',
                fontSize: key === 'del' ? '16px' : '22px',
              }}
            >
              {key === 'del' ? <Delete size={20} className="text-gray-300" /> : key === '*' ? '' : key}
            </button>
          ))}
        </div>
      </div>

      {/* Login CTA */}
      <div className="px-6 pb-3 pt-3">
        <button
          onClick={handleLogin}
          disabled={!canLogin}
          className="w-full h-16 rounded-2xl text-xl font-bold transition-all"
          style={{
            background: canLogin ? '#F59E0B' : '#1F2937',
            color: canLogin ? '#000' : '#6B7280',
            cursor: canLogin ? 'pointer' : 'not-allowed',
          }}
        >
          Log In
        </button>
      </div>

      {/* Support link */}
      <div className="flex justify-center pb-4">
        <button
          onClick={() => router.push('/support')}
          className="text-amber-500 text-sm font-medium underline underline-offset-2"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}
