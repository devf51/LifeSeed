'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
    id: string;
    name: string;
    category: string;
    targetDaysPerWeek: number;
    createdAt: string;
}

export interface HabitLog {
    id: string;
    habitId: string;
    date: string;        // YYYY-MM-DD
    status: 'done' | 'missed';
}

interface HabitState {
    habits: Habit[];
    logs: HabitLog[];
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
    updateHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    toggleLog: (habitId: string, date: string) => void;
    getStreak: (habitId: string) => number;
    getWeeklyProgress: (habitId: string, weekStart: string) => number;
}

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            habits: [],
            logs: [],

            addHabit: (habit) => set((state) => ({
                habits: [...state.habits, {
                    ...habit,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                }],
            })),

            updateHabit: (id, updates) => set((state) => ({
                habits: state.habits.map((h) => h.id === id ? { ...h, ...updates } : h),
            })),

            deleteHabit: (id) => set((state) => ({
                habits: state.habits.filter((h) => h.id !== id),
                logs: state.logs.filter((l) => l.habitId !== id),
            })),

            toggleLog: (habitId, date) => set((state) => {
                const existing = state.logs.find((l) => l.habitId === habitId && l.date === date);
                if (existing) {
                    return { logs: state.logs.filter((l) => l.id !== existing.id) };
                }
                return {
                    logs: [...state.logs, {
                        id: crypto.randomUUID(),
                        habitId,
                        date,
                        status: 'done' as const,
                    }],
                };
            }),

            getStreak: (habitId) => {
                const logs = get().logs
                    .filter((l) => l.habitId === habitId && l.status === 'done')
                    .map((l) => l.date)
                    .sort()
                    .reverse();

                if (logs.length === 0) return 0;

                let streak = 0;
                const today = new Date();
                const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                for (let i = 0; i < 365; i++) {
                    const checkDate = new Date(currentDate);
                    checkDate.setDate(checkDate.getDate() - i);
                    const dateStr = checkDate.toISOString().split('T')[0];
                    if (logs.includes(dateStr)) {
                        streak++;
                    } else if (i > 0) {
                        break;
                    }
                }
                return streak;
            },

            getWeeklyProgress: (habitId, weekStart) => {
                const start = new Date(weekStart);
                const dates: string[] = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(start);
                    d.setDate(d.getDate() + i);
                    dates.push(d.toISOString().split('T')[0]);
                }
                const logs = get().logs.filter(
                    (l) => l.habitId === habitId && l.status === 'done' && dates.includes(l.date)
                );
                return logs.length;
            },
        }),
        { name: 'lifeseed-habits' }
    )
);
