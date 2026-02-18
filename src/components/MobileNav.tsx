'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CalendarCheck,
    ListTodo,
    Wallet,
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/habits', label: 'Habits', icon: CalendarCheck },
    { href: '/planner', label: 'Planner', icon: ListTodo },
    { href: '/finance', label: 'Finance', icon: Wallet },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="mobile-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="mobile-nav-icon">
                            <Icon size={22} />
                        </div>
                        <span className="mobile-nav-label">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
