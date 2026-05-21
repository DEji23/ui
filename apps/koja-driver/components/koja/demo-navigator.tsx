'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Grid3X3, X } from 'lucide-react';

const SCREENS = [
  { num: '01', label: 'Login', href: '/login' },
  { num: '02', label: 'Support / Locked', href: '/support' },
  { num: '03', label: "Today's Shift", href: '/shift' },
  { num: '04', label: 'Trip Block View', href: '/shift/trips' },
  { num: '05', label: 'Report Problem', href: '/shift/problem' },
  { num: '06', label: 'No Shift Today', href: '/no-shift' },
  { num: '07', label: 'Bus Inspection', href: '/inspection' },
  { num: '08', label: 'Inspection Fail', href: '/inspection/fail' },
  { num: '09', label: 'All Clear', href: '/inspection/pass' },
  { num: '10', label: 'Bus Blocked', href: '/inspection/blocked' },
  { num: '11', label: 'Late Start', href: '/late-start' },
  { num: '12', label: 'Live Manifest', href: '/boarding' },
  { num: '13', label: 'QR Code', href: '/boarding/qr' },
  { num: '14', label: 'Manual Boarding', href: '/boarding/manual' },
  { num: '15', label: 'Drive Mode', href: '/drive' },
  { num: '16', label: 'Pickup Alert', href: '/drive/pickup' },
  { num: '17', label: 'Drop-off Confirm', href: '/drive/dropoff' },
  { num: '18', label: 'Emergency Code Red', href: '/drive/emergency' },
  { num: '19', label: 'Report Breakdown', href: '/breakdown' },
  { num: '20', label: 'Awaiting Replacement', href: '/breakdown/waiting' },
  { num: '21', label: 'Transfer Out (QR)', href: '/transfer/out' },
  { num: '22', label: 'Transfer In', href: '/transfer/in' },
  { num: '23', label: 'Continue w/ Transfer', href: '/transfer/continue' },
  { num: '24', label: 'Being Relieved', href: '/relief/notify' },
  { num: '25', label: 'Handover Summary', href: '/relief/handover' },
  { num: '26', label: 'Emergency Assignment', href: '/relief/emergency' },
  { num: '27', label: 'Trip Summary', href: '/trip/summary' },
  { num: '28', label: 'Cash Reconciliation', href: '/trip/cash' },
  { num: '29', label: 'Daily Summary', href: '/daily-summary' },
  { num: '30', label: 'Go Offline', href: '/offline' },
  { num: '31', label: 'Submit Leave', href: '/leave' },
  { num: '32', label: 'Leave Status', href: '/leave/status' },
  { num: '33', label: 'My Compliance', href: '/compliance' },
  { num: '34', label: 'Profile & Docs', href: '/profile' },
  { num: '35', label: 'Wallet & Earnings', href: '/wallet' },
];

export function DemoNavigator() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-black font-bold text-sm shadow-lg hover:scale-105 transition-transform"
        style={{ background: '#F59E0B', boxShadow: '0 4px 20px rgba(245,158,11,0.5)' }}
      >
        <Grid3X3 size={16} />
        <span>All 35 Screens</span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="relative w-full max-w-md rounded-3xl p-6 overflow-hidden"
            style={{ background: '#111827', border: '1px solid #1F2937', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-xl">Koja Captain App</h2>
                <p className="text-gray-400 text-sm mt-0.5">35 screens — tap to navigate</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                style={{ background: '#1F2937' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Screen grid */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              <div className="grid grid-cols-1 gap-2">
                {SCREENS.map((screen) => (
                  <Link
                    key={screen.href}
                    href={screen.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#1F2937] transition-colors group"
                  >
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold text-xs"
                      style={{ background: '#F59E0B' }}
                    >
                      {screen.num}
                    </span>
                    <span className="text-gray-300 group-hover:text-white transition-colors text-sm font-medium">
                      {screen.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
