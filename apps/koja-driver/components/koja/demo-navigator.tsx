'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Grid, X } from 'lucide-react';

const screens = [
  { num: '01', label: 'Login', href: '/login' },
  { num: '02', label: 'Support / Locked', href: '/support' },
  { num: '03', label: "Today's Shift", href: '/shift' },
  { num: '04', label: 'Trip Block View', href: '/shift/trips' },
  { num: '05', label: 'Report Problem', href: '/shift/problem' },
  { num: '06', label: 'No Shift Today', href: '/no-shift' },
  { num: '07', label: 'Bus Inspection', href: '/inspection' },
  { num: '08', label: 'Inspection Fail', href: '/inspection/fail' },
  { num: '09', label: 'Inspection Pass', href: '/inspection/pass' },
  { num: '10', label: 'Bus Blocked', href: '/inspection/blocked' },
  { num: '11', label: 'Late Start Warning', href: '/late-start' },
  { num: '12', label: 'Live Manifest', href: '/boarding' },
  { num: '13', label: 'QR Code Fullscreen', href: '/boarding/qr' },
  { num: '14', label: 'Manual Passenger', href: '/boarding/manual' },
  { num: '15', label: 'Drive Mode', href: '/drive' },
  { num: '16', label: 'Pickup Alert', href: '/drive/pickup' },
  { num: '17', label: 'Drop-off Confirm', href: '/drive/dropoff' },
  { num: '18', label: 'Emergency (Silent)', href: '/drive/emergency' },
  { num: '19', label: 'Report Breakdown', href: '/breakdown' },
  { num: '20', label: 'Awaiting Replacement', href: '/breakdown/waiting' },
  { num: '21', label: 'Transfer Out (QR)', href: '/transfer/out' },
  { num: '22', label: 'Accept Transfer', href: '/transfer/in' },
  { num: '23', label: 'Continue Trip', href: '/transfer/continue' },
  { num: '24', label: 'Being Relieved', href: '/relief/notify' },
  { num: '25', label: 'Handover Summary', href: '/relief/handover' },
  { num: '26', label: 'Emergency Assignment', href: '/relief/emergency' },
  { num: '27', label: 'Trip Summary', href: '/trip/summary' },
  { num: '28', label: 'Cash Reconciliation', href: '/trip/cash' },
  { num: '29', label: 'Daily Summary', href: '/daily-summary' },
  { num: '30', label: 'Go Offline', href: '/offline' },
  { num: '31', label: 'Request Leave', href: '/leave' },
  { num: '32', label: 'Leave Status', href: '/leave/status' },
  { num: '33', label: 'Compliance Status', href: '/compliance' },
  { num: '34', label: 'Profile & Docs', href: '/profile' },
  { num: '35', label: 'Wallet & Earnings', href: '/wallet' },
];

export default function DemoNavigator() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating pill button — outside phone frame, top-right */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#F59E0B] text-black px-4 py-2 rounded-full shadow-xl font-bold text-sm hover:bg-amber-400 transition-colors"
      >
        <Grid size={16} />
        <span>35 Screens</span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1F2937]">
              <div>
                <h2 className="text-white font-bold text-lg">Koja Captain</h2>
                <p className="text-[#9CA3AF] text-xs">Navigate to any of the 35 screens</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1F2937] text-white hover:bg-[#374151] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Screen list */}
            <div className="overflow-y-auto flex-1 p-3">
              <div className="grid grid-cols-1 gap-1">
                {screens.map((screen) => (
                  <Link
                    key={screen.href}
                    href={screen.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1F2937] transition-colors group"
                  >
                    <span className="w-8 h-6 flex items-center justify-center bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold rounded-md flex-shrink-0">
                      {screen.num}
                    </span>
                    <span className="text-white text-sm group-hover:text-[#F59E0B] transition-colors">
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
