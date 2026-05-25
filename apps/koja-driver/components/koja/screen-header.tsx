'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreenHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  backHref,
  rightElement,
  className,
}: ScreenHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 border-b border-[#1F2937] flex-shrink-0',
        className
      )}
      style={{ background: '#0A0F1E' }}
    >
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
        )}
        <h1 className="text-white font-bold text-lg leading-tight">{title}</h1>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}
