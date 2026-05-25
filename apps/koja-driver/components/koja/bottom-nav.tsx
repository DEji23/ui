'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, ShieldCheck, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/shift', icon: Home, label: 'Home' },
  { href: '/leave', icon: Calendar, label: 'Leave' },
  { href: '/compliance', icon: ShieldCheck, label: 'Comply' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="flex items-center border-t border-[#1F2937] flex-shrink-0"
      style={{ background: '#0A0F1E', height: '64px' }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors min-h-[44px]',
              active ? 'text-amber-500' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className={cn('text-[10px] font-medium', active ? 'text-amber-500' : '')}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
