'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;       // YYYY-MM-DD
    status: TaskStatus;
    priority: TaskPriority;
    createdAt: string;
}

export interface YearlyGoal {
    id: string;
    title: string;
    year: number;
    completed: boolean;
}

export interface MonthlyGoal {
    id: string;
    title: string;
    month: number; // 0-11
    year: number;
    completed: boolean;
}

interface TaskState {
    tasks: Task[];
    goals: YearlyGoal[];
    monthlyGoals: MonthlyGoal[];
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    cycleStatus: (id: string) => void;
    addGoal: (goal: Omit<YearlyGoal, 'id'>) => void;
    updateGoal: (id: string, updates: Partial<YearlyGoal>) => void;
    deleteGoal: (id: string) => void;
    addMonthlyGoal: (goal: Omit<MonthlyGoal, 'id'>) => void;
    updateMonthlyGoal: (id: string, updates: Partial<MonthlyGoal>) => void;
    deleteMonthlyGoal: (id: string) => void;
}

const statusCycle: Record<TaskStatus, TaskStatus> = {
    'pending': 'in-progress',
    'in-progress': 'completed',
    'completed': 'pending',
};

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            goals: [],
            monthlyGoals: [],

            addTask: (task) => set((state) => ({
                tasks: [...state.tasks, {
                    ...task,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                }],
            })),

            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
            })),

            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
            })),

            cycleStatus: (id) => set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, status: statusCycle[t.status] } : t
                ),
            })),

            addGoal: (goal) => set((state) => ({
                goals: [...state.goals, { ...goal, id: crypto.randomUUID() }],
            })),

            updateGoal: (id, updates) => set((state) => ({
                goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g),
            })),

            deleteGoal: (id) => set((state) => ({
                goals: state.goals.filter((g) => g.id !== id),
            })),

            addMonthlyGoal: (goal) => set((state) => ({
                monthlyGoals: [...state.monthlyGoals, { ...goal, id: crypto.randomUUID() }],
            })),

            updateMonthlyGoal: (id, updates) => set((state) => ({
                monthlyGoals: state.monthlyGoals.map((g) => g.id === id ? { ...g, ...updates } : g),
            })),

            deleteMonthlyGoal: (id) => set((state) => ({
                monthlyGoals: state.monthlyGoals.filter((g) => g.id !== id),
            })),
        }),
        { name: 'lifeseed-tasks' }
    )
);
