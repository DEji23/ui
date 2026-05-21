import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import DemoNavigator from '@/components/koja/demo-navigator';

export const metadata: Metadata = {
  title: 'Koja Captain',
  description: 'Koja Captain App — Bus Driver Interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
        <AppProvider>
          {/* Phone frame */}
          <div className="relative w-full max-w-[390px] h-[844px] bg-[#0A0F1E] rounded-[48px] overflow-hidden shadow-2xl border border-[#2a2a4a] flex flex-col">
            {/* Fake status bar */}
            <div className="flex-shrink-0 h-12 bg-[#0A0F1E] flex items-center justify-between px-8 pt-2">
              <span className="text-white text-xs font-semibold">9:41</span>
              <div className="flex items-center gap-1.5">
                {/* Signal bars */}
                <div className="flex items-end gap-0.5">
                  <div className="w-1 h-1.5 bg-white rounded-sm"></div>
                  <div className="w-1 h-2 bg-white rounded-sm"></div>
                  <div className="w-1 h-2.5 bg-white rounded-sm"></div>
                  <div className="w-1 h-3 bg-white rounded-sm"></div>
                </div>
                {/* WiFi */}
                <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
                  <path d="M7 7.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-2.5a4.5 4.5 0 0 1 3.18 1.32l.9-.9A5.8 5.8 0 0 0 7 4a5.8 5.8 0 0 0-4.08 1.42l.9.9A4.5 4.5 0 0 1 7 5zm0-2.5a7.5 7.5 0 0 1 5.3 2.2l.9-.9A8.8 8.8 0 0 0 7 0 8.8 8.8 0 0 0 .8 3.8l.9.9A7.5 7.5 0 0 1 7 2.5z"/>
                </svg>
                {/* Battery */}
                <div className="flex items-center">
                  <div className="w-6 h-3 border border-white rounded-sm relative flex items-center">
                    <div className="w-4 h-2 bg-white rounded-sm ml-0.5"></div>
                  </div>
                  <div className="w-0.5 h-1.5 bg-white rounded-r-sm"></div>
                </div>
              </div>
            </div>

            {/* App content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
              {children}
            </div>
          </div>

          {/* Demo Navigator — outside phone frame */}
          <DemoNavigator />
        </AppProvider>
      </body>
    </html>
  );
}
