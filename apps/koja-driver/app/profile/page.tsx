'use client';
import { BottomNav } from '@/components/koja/bottom-nav';
import { ScreenHeader } from '@/components/koja/screen-header';
import { Phone, FileText, CreditCard, Upload, Edit } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function ProfilePage() {
  const { driverName, driverCode, driverPhone } = useApp();
  const initials = driverName.split(' ').map((n: string) => n[0]).join('');

  const INFO_ROWS = [
    { icon: Phone, label: 'Phone', value: driverPhone },
    { icon: CreditCard, label: 'License', value: 'FRN-DL-4821993  ·  Expires Mar 2026' },
    { icon: FileText, label: 'NIN', value: 'Pending capture' },
  ];

  const DOCS = [
    { label: 'Driver\'s License', status: 'uploaded' },
    { label: 'LASG Permit', status: 'uploaded' },
    { label: 'Medical Certificate', status: 'pending' },
    { label: 'Vehicle Insurance', status: 'pending' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0F1E]">
      <ScreenHeader title="My Profile" rightElement={
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium" style={{ background: '#1F2937', color: '#9CA3AF' }}>
          <Edit size={14} />
          Edit
        </button>
      } />

      <div className="flex-1 overflow-y-auto koja-scroll px-4 pb-4">
        {/* Avatar + name */}
        <div className="flex flex-col items-center py-5">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
            style={{ background: '#F59E0B' }}
          >
            <span className="text-black font-black text-3xl">{initials}</span>
          </div>
          <h2 className="text-white font-black text-2xl">{driverName}</h2>
          <div
            className="mt-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: '#1F2937', color: '#9CA3AF' }}
          >
            {driverCode}
          </div>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-2 mb-5">
          {INFO_ROWS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl px-4 py-4"
              style={{ background: '#111827', border: '1px solid #1F2937' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#1F2937' }}
              >
                <Icon size={16} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="text-white text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Documents section */}
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Documents</p>
        <div className="flex flex-col gap-2">
          {DOCS.map(({ label, status }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl px-4 py-4"
              style={{
                background: '#111827',
                border: `1px solid ${status === 'uploaded' ? 'rgba(34,197,94,0.3)' : '#1F2937'}`,
              }}
            >
              <span className="text-white text-sm font-medium">{label}</span>
              <div className="flex items-center gap-2">
                {status === 'uploaded' ? (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
                  >
                    ✓ Uploaded
                  </span>
                ) : (
                  <button
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full min-h-[44px]"
                    style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}
                  >
                    <Upload size={12} />
                    Upload
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
