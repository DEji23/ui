import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { DemoNavigator } from '@/components/koja/demo-navigator';

export const metadata: Metadata = {
  title: 'Koja Captain',
  description: 'Koja Bus Driver App — Lagos Transport Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#060914] flex items-center justify-center p-4">
        <AppProvider>
          {/* Phone Frame */}
          <div
            className="relative flex flex-col"
            style={{
              width: '390px',
              height: '844px',
              background: '#0A0F1E',
              borderRadius: '44px',
              border: '2px solid #1F2937',
              boxShadow: '0 0 0 8px #0A0F1E, 0 0 0 10px #1F2937, 0 40px 80px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
          >
            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-1 flex-shrink-0" style={{ height: '44px' }}>
              <span className="text-white text-sm font-semibold">9:41</span>
              <div className="flex items-center gap-1.5">
                {/* Signal bars */}
                <div className="flex items-end gap-0.5">
                  <div className="w-1 bg-white rounded-sm" style={{ height: '4px' }} />
                  <div className="w-1 bg-white rounded-sm" style={{ height: '6px' }} />
                  <div className="w-1 bg-white rounded-sm" style={{ height: '8px' }} />
                  <div className="w-1 bg-white rounded-sm" style={{ height: '10px' }} />
                </div>
                {/* WiFi */}
                <svg width="15" height="12" viewBox="0 0 15 12" fill="white">
                  <path d="M7.5 9.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a4 4 0 0 1 3.2 1.6l-1.2 1.2a2.5 2.5 0 0 0-4 0L4.3 8.1A4 4 0 0 1 7.5 6.5zm0-3a7 7 0 0 1 5.6 2.8L11.9 7.5a5.5 5.5 0 0 0-8.8 0L1.9 6.3A7 7 0 0 1 7.5 3.5z" />
                </svg>
                {/* Battery */}
                <div className="flex items-center gap-0.5">
                  <div
                    className="relative rounded-sm border border-white"
                    style={{ width: '22px', height: '12px' }}
                  >
                    <div
                      className="absolute left-0.5 top-0.5 bottom-0.5 rounded-sm bg-white"
                      style={{ width: '75%' }}
                    />
                  </div>
                  <div className="rounded-r-sm bg-white" style={{ width: '2px', height: '5px' }} />
                </div>
              </div>
            </div>

            {/* App Content */}
            <div className="flex-1 overflow-hidden relative">
              {children}
            </div>

            {/* Home indicator */}
            <div className="flex justify-center pb-2 pt-1 flex-shrink-0">
              <div className="rounded-full bg-white opacity-30" style={{ width: '130px', height: '4px' }} />
            </div>
          </div>

          {/* Demo Navigator — outside phone frame, floating */}
          <DemoNavigator />
        </AppProvider>
      </body>
    </html>
  );
}
