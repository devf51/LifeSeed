'use client';

import { useHabitStore } from '@/store/habitStore';
import { useTaskStore } from '@/store/taskStore';
import { useFinanceStore } from '@/store/financeStore';
import {
    CalendarCheck,
    ListTodo,
    Wallet,
    TrendingUp,
    Flame,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Sprout,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const habits = useHabitStore((s) => s.habits);
    const logs = useHabitStore((s) => s.logs);
    const getStreak = useHabitStore((s) => s.getStreak);
    const tasks = useTaskStore((s) => s.tasks);
    const transactions = useFinanceStore((s) => s.transactions);
    const getBalance = useFinanceStore((s) => s.getBalance);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <DashboardSkeleton />;

    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter((l) => l.date === today && l.status === 'done');
    const pendingTasks = tasks.filter((t) => t.status !== 'completed');
    const completedToday = tasks.filter(
        (t) => t.status === 'completed' && t.dueDate === today
    );
    const balance = getBalance();
    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
    const bestStreak = habits.reduce((max, h) => {
        const s = getStreak(h.id);
        return s > max ? s : max;
    }, 0);

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1 className="page-title">
                        <Sprout size={32} className="page-title-icon" />
                        Dashboard
                    </h1>
                    <p className="page-subtitle">ยินดีต้อนรับกลับ — มาเริ่มต้นวันใหม่กันเถอะ</p>
                </div>
                <div className="header-date-badge">
                    {new Date().toLocaleDateString('th-TH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    icon={<CalendarCheck size={24} />}
                    label="นิสัยวันนี้"
                    value={`${todayLogs.length} / ${habits.length}`}
                    trend={`${habits.length > 0 ? Math.round((todayLogs.length / habits.length) * 100) : 0}% สำเร็จ`}
                    trendUp={todayLogs.length >= habits.length / 2}
                    color="emerald"
                />
                <StatCard
                    icon={<Flame size={24} />}
                    label="Streak สูงสุด"
                    value={`${bestStreak} วัน`}
                    trend="ต่อเนื่อง"
                    trendUp={bestStreak > 0}
                    color="amber"
                />
                <StatCard
                    icon={<ListTodo size={24} />}
                    label="งานค้าง"
                    value={`${pendingTasks.length} รายการ`}
                    trend={`ทำเสร็จวันนี้ ${completedToday.length}`}
                    trendUp={completedToday.length > 0}
                    color="blue"
                />
                <StatCard
                    icon={<Wallet size={24} />}
                    label="ยอดคงเหลือ"
                    value={`฿${balance.toLocaleString()}`}
                    trend={`รายได้ ฿${totalIncome.toLocaleString()}`}
                    trendUp={balance >= 0}
                    color="purple"
                />
            </div>

            {/* Widgets Row */}
            <div className="widgets-grid">
                {/* Habit Quick View */}
                <div className="glass-card widget-card">
                    <div className="widget-header">
                        <h3><CalendarCheck size={18} /> นิสัยประจำวัน</h3>
                        <a href="/habits" className="widget-link">ดูทั้งหมด →</a>
                    </div>
                    <div className="widget-body">
                        {habits.length === 0 ? (
                            <p className="empty-state">ยังไม่มีนิสัย — <a href="/habits">เพิ่มนิสัยแรก</a></p>
                        ) : (
                            habits.slice(0, 5).map((h) => {
                                const done = logs.some(
                                    (l) => l.habitId === h.id && l.date === today && l.status === 'done'
                                );
                                const streak = getStreak(h.id);
                                return (
                                    <div key={h.id} className={`habit-quick-item ${done ? 'done' : ''}`}>
                                        <div className="habit-quick-left">
                                            <div className={`habit-check ${done ? 'checked' : ''}`}>
                                                {done && '✓'}
                                            </div>
                                            <span>{h.name}</span>
                                        </div>
                                        {streak > 0 && (
                                            <span className="streak-badge">
                                                <Flame size={12} /> {streak}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Tasks Quick View */}
                <div className="glass-card widget-card">
                    <div className="widget-header">
                        <h3><Target size={18} /> งานที่ต้องทำ</h3>
                        <a href="/planner" className="widget-link">ดูทั้งหมด →</a>
                    </div>
                    <div className="widget-body">
                        {pendingTasks.length === 0 ? (
                            <p className="empty-state">ไม่มีงานค้าง 🎉</p>
                        ) : (
                            pendingTasks.slice(0, 5).map((t) => (
                                <div key={t.id} className="task-quick-item">
                                    <div className="task-quick-left">
                                        <span className={`priority-dot ${t.priority}`} />
                                        <span>{t.title}</span>
                                    </div>
                                    <span className={`status-badge ${t.status}`}>
                                        {t.status === 'pending' ? 'รอดำเนินการ' :
                                            t.status === 'in-progress' ? 'กำลังทำ' : 'เสร็จสิ้น'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Finance Quick View */}
                <div className="glass-card widget-card">
                    <div className="widget-header">
                        <h3><TrendingUp size={18} /> การเงินล่าสุด</h3>
                        <a href="/finance" className="widget-link">ดูทั้งหมด →</a>
                    </div>
                    <div className="widget-body">
                        {transactions.length === 0 ? (
                            <p className="empty-state">ยังไม่มีรายการ — <a href="/finance">เพิ่มรายการแรก</a></p>
                        ) : (
                            transactions.slice(-5).reverse().map((t) => (
                                <div key={t.id} className="txn-quick-item">
                                    <div className="txn-quick-left">
                                        {t.type === 'income' ? (
                                            <ArrowUpRight size={16} className="income-icon" />
                                        ) : (
                                            <ArrowDownRight size={16} className="expense-icon" />
                                        )}
                                        <div>
                                            <span className="txn-note">{t.note || t.category}</span>
                                            <span className="txn-date">{t.date}</span>
                                        </div>
                                    </div>
                                    <span className={`txn-amount ${t.type}`}>
                                        {t.type === 'income' ? '+' : '-'}฿{t.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    trend,
    trendUp,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    color: 'emerald' | 'amber' | 'blue' | 'purple';
}) {
    return (
        <div className={`glass-card stat-card-dash ${color}`}>
            <div className={`stat-icon-wrap ${color}`}>{icon}</div>
            <div className="stat-value-dash">{value}</div>
            <div className="stat-label-dash">{label}</div>
            <div className={`stat-trend-dash ${trendUp ? 'up' : 'down'}`}>
                {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <div className="skeleton-line" style={{ width: 200, height: 32 }} />
                    <div className="skeleton-line" style={{ width: 300, height: 18, marginTop: 8 }} />
                </div>
            </header>
            <div className="stats-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card stat-card-dash skeleton-card" />
                ))}
            </div>
        </div>
    );
}
