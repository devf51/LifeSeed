'use client';

import { useState, useEffect } from 'react';
import { useHabitStore, Habit } from '@/store/habitStore';
import {
    CalendarCheck,
    Plus,
    X,
    Trash2,
    Edit3,
    Flame,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

function getWeekDates(offset: number = 0): { date: Date; dateStr: string; dayLabel: string }[] {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1 + offset * 7); // Monday start
    const days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return {
            date: d,
            dateStr: d.toISOString().split('T')[0],
            dayLabel: days[i],
        };
    });
}

export default function HabitsPage() {
    const [mounted, setMounted] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [editHabit, setEditHabit] = useState<Habit | null>(null);

    const habits = useHabitStore((s) => s.habits);
    const logs = useHabitStore((s) => s.logs);
    const toggleLog = useHabitStore((s) => s.toggleLog);
    const deleteHabit = useHabitStore((s) => s.deleteHabit);
    const getStreak = useHabitStore((s) => s.getStreak);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const weekDates = getWeekDates(weekOffset);
    const today = new Date().toISOString().split('T')[0];

    const isChecked = (habitId: string, date: string) =>
        logs.some((l) => l.habitId === habitId && l.date === date && l.status === 'done');

    const weeklyDone = (habitId: string) =>
        weekDates.filter((d) => isChecked(habitId, d.dateStr)).length;

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">
                        <CalendarCheck size={32} className="page-title-icon" />
                        Habit Tracker
                    </h1>
                    <p className="page-subtitle">ติดตามนิสัยประจำวัน — สร้างความสำเร็จทีละวัน</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditHabit(null); setModalOpen(true); }}>
                    <Plus size={18} /> เพิ่มนิสัย
                </button>
            </header>

            {/* Week Navigator */}
            <div className="habit-week-nav">
                <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset((p) => p - 1)}>
                    <ChevronLeft size={16} />
                </button>
                <span className="habit-week-label">
                    {weekDates[0].date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    {' — '}
                    {weekDates[6].date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset((p) => p + 1)}>
                    <ChevronRight size={16} />
                </button>
                {weekOffset !== 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(0)}>
                        วันนี้
                    </button>
                )}
            </div>

            {/* Habit Grid */}
            {habits.length === 0 ? (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                    <p className="empty-state">ยังไม่มีนิสัย — กดปุ่ม &quot;เพิ่มนิสัย&quot; เพื่อเริ่มต้น</p>
                </div>
            ) : (
                <div className="glass-card habit-grid-card">
                    {/* Grid Header */}
                    <div className="habit-grid-header">
                        <div className="habit-grid-name-col">นิสัย</div>
                        {weekDates.map((d) => (
                            <div
                                key={d.dateStr}
                                className={`habit-grid-day-col ${d.dateStr === today ? 'today' : ''}`}
                            >
                                <span className="day-name">{d.dayLabel}</span>
                                <span className="day-num">{d.date.getDate()}</span>
                            </div>
                        ))}
                        <div className="habit-grid-stats-col">สำเร็จ</div>
                        <div className="habit-grid-actions-col"></div>
                    </div>

                    {/* Habit Rows */}
                    {habits.map((habit) => {
                        const streak = getStreak(habit.id);
                        const done = weeklyDone(habit.id);
                        const target = habit.targetDaysPerWeek;
                        const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;

                        return (
                            <div key={habit.id} className="habit-grid-row">
                                <div className="habit-grid-name-col">
                                    <div className="habit-name-cell">
                                        <span className="habit-name">{habit.name}</span>
                                        <span className="habit-category">{habit.category}</span>
                                    </div>
                                    {streak > 0 && (
                                        <span className="streak-badge">
                                            <Flame size={11} /> {streak}
                                        </span>
                                    )}
                                </div>

                                {weekDates.map((d) => {
                                    const checked = isChecked(habit.id, d.dateStr);
                                    return (
                                        <div key={d.dateStr} className={`habit-grid-day-col ${d.dateStr === today ? 'today' : ''}`}>
                                            <button
                                                className={`habit-check-btn ${checked ? 'checked' : ''}`}
                                                onClick={() => toggleLog(habit.id, d.dateStr)}
                                                aria-label={`Toggle ${habit.name} on ${d.dateStr}`}
                                            >
                                                {checked && '✓'}
                                            </button>
                                        </div>
                                    );
                                })}

                                <div className="habit-grid-stats-col">
                                    <div className="habit-progress-wrap">
                                        <div className="habit-progress-bar">
                                            <div
                                                className="habit-progress-fill"
                                                style={{
                                                    width: `${pct}%`,
                                                    background:
                                                        pct >= 100
                                                            ? 'var(--color-success)'
                                                            : pct >= 50
                                                                ? 'var(--color-warning)'
                                                                : 'var(--color-danger)',
                                                }}
                                            />
                                        </div>
                                        <span className="habit-progress-text">
                                            {done}/{target}
                                        </span>
                                    </div>
                                </div>

                                <div className="habit-grid-actions-col">
                                    <button
                                        className="icon-btn"
                                        onClick={() => { setEditHabit(habit); setModalOpen(true); }}
                                        aria-label="Edit"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        className="icon-btn danger"
                                        onClick={() => { if (confirm('ลบนิสัยนี้?')) deleteHabit(habit.id); }}
                                        aria-label="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <HabitModal
                    habit={editHabit}
                    onClose={() => { setModalOpen(false); setEditHabit(null); }}
                />
            )}
        </div>
    );
}

function HabitModal({ habit, onClose }: { habit: Habit | null; onClose: () => void }) {
    const addHabit = useHabitStore((s) => s.addHabit);
    const updateHabit = useHabitStore((s) => s.updateHabit);

    const [name, setName] = useState(habit?.name || '');
    const [category, setCategory] = useState(habit?.category || '');
    const [target, setTarget] = useState(habit?.targetDaysPerWeek || 7);

    const handleSubmit = () => {
        if (!name.trim()) return;
        if (habit) {
            updateHabit(habit.id, { name, category, targetDaysPerWeek: target });
        } else {
            addHabit({ name, category, targetDaysPerWeek: target });
        }
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{habit ? 'แก้ไขนิสัย' : 'เพิ่มนิสัยใหม่'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-form">
                    <div className="form-group">
                        <label className="form-label">ชื่อนิสัย</label>
                        <input
                            className="form-input"
                            placeholder="เช่น ออกกำลังกาย, เขียนโค้ด..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">หมวดหมู่</label>
                        <input
                            className="form-input"
                            placeholder="เช่น สุขภาพ, การเรียน..."
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">เป้าหมาย (วัน/สัปดาห์)</label>
                        <input
                            className="form-input"
                            type="number"
                            min={1}
                            max={7}
                            value={target}
                            onChange={(e) => setTarget(Number(e.target.value))}
                        />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            {habit ? 'บันทึก' : 'เพิ่มนิสัย'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
