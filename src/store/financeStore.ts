'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense' | 'invest';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    date: string;          // YYYY-MM-DD
    category: string;
    note: string;
    createdAt: string;
}

export interface Investment {
    id: string;
    assetTicker: string;
    assetType: 'us-stock' | 'forex' | 'crypto' | 'other';
    buyPrice: number;
    quantity: number;
    datePurchased: string; // YYYY-MM-DD
    note: string;
}

interface FinanceState {
    transactions: Transaction[];
    investments: Investment[];
    addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addInvestment: (inv: Omit<Investment, 'id'>) => void;
    updateInvestment: (id: string, updates: Partial<Investment>) => void;
    deleteInvestment: (id: string) => void;
    getBalance: () => number;
    getMonthlyData: (year: number) => { month: string; income: number; expense: number }[];
}

export const useFinanceStore = create<FinanceState>()(
    persist(
        (set, get) => ({
            transactions: [],
            investments: [],

            addTransaction: (t) => set((state) => ({
                transactions: [...state.transactions, {
                    ...t,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                }],
            })),

            updateTransaction: (id, updates) => set((state) => ({
                transactions: state.transactions.map((t) =>
                    t.id === id ? { ...t, ...updates } : t
                ),
            })),

            deleteTransaction: (id) => set((state) => ({
                transactions: state.transactions.filter((t) => t.id !== id),
            })),

            addInvestment: (inv) => set((state) => ({
                investments: [...state.investments, { ...inv, id: crypto.randomUUID() }],
            })),

            updateInvestment: (id, updates) => set((state) => ({
                investments: state.investments.map((i) =>
                    i.id === id ? { ...i, ...updates } : i
                ),
            })),

            deleteInvestment: (id) => set((state) => ({
                investments: state.investments.filter((i) => i.id !== id),
            })),

            getBalance: () => {
                const txns = get().transactions;
                return txns.reduce((acc, t) => {
                    if (t.type === 'income') return acc + t.amount;
                    if (t.type === 'expense') return acc - t.amount;
                    if (t.type === 'invest') return acc - t.amount;
                    return acc;
                }, 0);
            },

            getMonthlyData: (year) => {
                const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                return months.map((month, i) => {
                    const txns = get().transactions.filter((t) => {
                        const d = new Date(t.date);
                        return d.getFullYear() === year && d.getMonth() === i;
                    });
                    return {
                        month,
                        income: txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
                        expense: txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
                    };
                });
            },
        }),
        { name: 'lifeseed-finance' }
    )
);
