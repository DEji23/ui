'use client';
import { BottomNav } from '@/components/koja/bottom-nav';
import { ShieldCheck, Clock, Calendar, FileText } from 'lucide-react';

export default function CompliancePage() {
  const STATS = [
    {
      icon: Clock,
      label: 'Hours This Week',
      value: '42h',
      max: '60h max',
      progress: 42 / 60,
      status: 'ok',
      detail: '18h remaining',
    },
    {
      icon: Clock,
      label: 'Rest Since Last Shift',
      value: '9 hours',
      max: 'min 8h required',
      progress: 1,
      status: 'good',
      detail: '1h above minimum',
    },
    {
      icon: FileText,
      label: 'License Expiry',
      value: '14 Mar 2026',
      max: '142 days remaining',
      progress: 142 / 365,
      status: 'ok',
      detail: 'FRN-DL-4821993',
    },
    {
      icon: Calendar,
      label: 'Rest Days This Month',
      value: '4 / 4',
      max: '4 required',
      progress: 1,
      status: 'good',
      detail: 'All rest days fulfilled',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h1 className="text-white font-black text-2xl">My Compliance</h1>
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        {/* Overall status badge */}
        <div
          className="rounded-2xl p-5 mb-5 flex items-center gap-4"
          style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.4)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#22C55E' }}
          >
            <ShieldCheck size={30} className="text-black" />
          </div>
          <div>
            <p className="text-green-500 font-black text-2xl">ALL CLEAR ✓</p>
            <p className="text-green-400 text-sm">All compliance checks passed</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3">
          {STATS.map(({ icon: Icon, label, value, max, progress, status, detail }) => (
            <div
              key={label}
              className="rounded-2xl p-4"
              style={{
                background: '#111827',
                border: `1px solid ${status === 'good' ? 'rgba(34,197,94,0.3)' : '#1F2937'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={status === 'good' ? 'text-green-500' : 'text-amber-500'} />
                  <span className="text-gray-400 text-sm">{label}</span>
                </div>
                <span className="text-white font-bold">{value}</span>
              </div>
              <div className="h-1.5 rounded-full mb-1.5" style={{ background: '#1F2937' }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(progress, 1) * 100}%`,
                    background: status === 'good' ? '#22C55E' : '#F59E0B',
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{detail}</span>
                <span className="text-gray-600 text-xs">{max}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
