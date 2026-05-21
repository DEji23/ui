'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ScreenHeaderProps {
  title: string;
  backHref?: string;
  rightElement?: React.ReactNode;
}

export default function ScreenHeader({ title, backHref, rightElement }: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-[#0A0F1E] border-b border-[#1F2937]">
      <div className="flex items-center gap-3 flex-1">
        {backHref !== undefined && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#111827] border border-[#1F2937] text-white hover:bg-[#1F2937] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>
      {rightElement && (
        <div className="flex-shrink-0">{rightElement}</div>
      )}
    </div>
  );
}
