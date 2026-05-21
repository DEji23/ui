'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, ShieldCheck, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/shift', icon: Home, label: 'Home' },
  { href: '/leave', icon: Calendar, label: 'Leave' },
  { href: '/compliance', icon: ShieldCheck, label: 'Compliance' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="flex-shrink-0 h-20 bg-[#111827] border-t border-[#1F2937] flex items-center px-2 pb-2">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] rounded-xl transition-colors',
              isActive
                ? 'text-[#F59E0B]'
                : 'text-[#9CA3AF] hover:text-white'
            )}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className={cn('text-[10px] font-medium', isActive ? 'text-[#F59E0B]' : 'text-[#9CA3AF]')}>
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
