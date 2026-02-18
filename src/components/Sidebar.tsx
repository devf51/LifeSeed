'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CalendarCheck,
    ListTodo,
    Wallet,
    ChevronLeft,
    ChevronRight,
    Sprout,
    Menu,
    X,
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'Dashboard', labelTh: 'แดชบอร์ด', icon: LayoutDashboard },
    { href: '/habits', label: 'Habits', labelTh: 'นิสัย', icon: CalendarCheck },
    { href: '/planner', label: 'Planner', labelTh: 'แพลนเนอร์', icon: ListTodo },
    { href: '/finance', label: 'Finance', labelTh: 'การเงิน', icon: Wallet },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="sidebar-mobile-toggle"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>

            {/* Backdrop for mobile */}
            {mobileOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <Sprout size={collapsed ? 20 : 24} />
                    </div>
                    {!collapsed && <h2 className="sidebar-brand-title">LifeSeed</h2>}
                    {/* Mobile close */}
                    <button
                        className="sidebar-mobile-close"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={20} />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse toggle (desktop only) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="sidebar-collapse-btn"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </aside>
        </>
    );
}
