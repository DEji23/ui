'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { ScreenHeader } from '@/components/koja/screen-header';
import { BottomNav } from '@/components/koja/bottom-nav';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'declined', label: 'Declined' },
  { id: 'modify', label: 'Modify' },
];

export default function LeaveStatusPage() {
  const [tab, setTab] = useState<string>('pending');

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="Leave Status" backHref="/leave" />

      {/* Tabs */}
      <div className="flex px-4 pt-3 pb-1 gap-2 flex-shrink-0 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: tab === t.id ? '#F59E0B' : '#111827',
              color: tab === t.id ? '#000' : '#9CA3AF',
              border: tab === t.id ? 'none' : '1px solid #1F2937',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto koja-scroll px-4 py-4">
        {tab === 'pending' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.2)' }}
              >
                <Clock size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-white font-bold">Annual Leave</p>
                <div
                  className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold mt-0.5"
                  style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}
                >
                  PENDING REVIEW
                </div>
              </div>
            </div>
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Requested Dates</p>
              <p className="text-white font-semibold">25 May 2025 — 30 May 2025</p>
              <p className="text-gray-500 text-xs mt-1">5 working days</p>
            </div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Affected Duties</p>
            {['Tue 27 May · Oshodi → CMS', 'Wed 28 May · CMS → OSHODI'].map(s => (
              <div
                key={s}
                className="rounded-2xl p-3 mb-2 flex items-center gap-2"
                style={{ background: '#111827', border: '1px solid #1F2937' }}
              >
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <p className="text-gray-300 text-sm">{s}</p>
              </div>
            ))}
            <button
              className="w-full h-14 rounded-2xl text-base font-bold mt-4"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              Cancel Request
            </button>
          </div>
        )}

        {tab === 'approved' && (
          <div>
            <div className="flex flex-col items-center py-4 mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'rgba(34,197,94,0.15)' }}
              >
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <p className="text-green-500 font-black text-2xl">Leave Approved</p>
              <p className="text-gray-400 text-sm mt-1">Approved by Fleet Manager</p>
            </div>
            <div
              className="rounded-2xl p-4 mb-4 text-center"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <p className="text-green-400 font-bold text-lg">🏠 Shifts locked. Stay home!</p>
              <p className="text-gray-400 text-sm mt-1">25 – 30 May 2025</p>
            </div>
            <div
              className="rounded-2xl p-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Compliance</p>
              <p className="text-white text-sm">Your schedule has been updated. No duties assigned during this period.</p>
            </div>
          </div>
        )}

        {tab === 'declined' && (
          <div>
            <div className="flex flex-col items-center py-4 mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'rgba(239,68,68,0.15)' }}
              >
                <XCircle size={48} className="text-red-500" />
              </div>
              <p className="text-red-500 font-black text-2xl">Request Declined</p>
            </div>
            <div
              className="rounded-2xl p-4 mb-5"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Reason</p>
              <p className="text-white">Insufficient driver coverage on that route during the requested period.</p>
            </div>
            <button
              className="w-full h-16 rounded-2xl text-xl font-bold"
              style={{ background: '#F59E0B', color: '#000' }}
            >
              Submit New Request
            </button>
          </div>
        )}

        {tab === 'modify' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.2)' }}
              >
                <RefreshCw size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-white font-bold">Modify Proposal</p>
                <p className="text-amber-500 text-xs">Manager has suggested new dates</p>
              </div>
            </div>
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Original Dates</p>
              <p className="text-gray-500 line-through text-lg">25 May — 30 May 2025</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider mt-3 mb-1">Proposed New Dates</p>
              <p className="text-amber-500 font-bold text-xl">2 Jun — 7 Jun 2025</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="h-14 rounded-2xl text-base font-bold"
                style={{ background: '#22C55E', color: '#000' }}
              >
                Accept
              </button>
              <button
                className="h-14 rounded-2xl text-base font-bold"
                style={{ background: '#EF4444', color: '#fff' }}
              >
                Decline
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
