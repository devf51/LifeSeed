'use client';

import { useState, useEffect } from 'react';
import { useFinanceStore, TransactionType, Investment } from '@/store/financeStore';
import {
    Wallet,
    Plus,
    X,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

type FinanceTab = 'transactions' | 'investments';

const COLORS = ['#34d399', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa', '#94a3b8'];

export default function FinancePage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<FinanceTab>('transactions');
    const [txnModal, setTxnModal] = useState(false);
    const [invModal, setInvModal] = useState(false);

    const transactions = useFinanceStore((s) => s.transactions);
    const investments = useFinanceStore((s) => s.investments);
    const getBalance = useFinanceStore((s) => s.getBalance);
    const getMonthlyData = useFinanceStore((s) => s.getMonthlyData);
    const addTransaction = useFinanceStore((s) => s.addTransaction);
    const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
    const addInvestment = useFinanceStore((s) => s.addInvestment);
    const deleteInvestment = useFinanceStore((s) => s.deleteInvestment);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const balance = getBalance();
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalInvest = transactions.filter((t) => t.type === 'invest').reduce((s, t) => s + t.amount, 0);
    const monthlyData = getMonthlyData(new Date().getFullYear());

    // Spending by category
    const categoryMap: Record<string, number> = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
        categoryMap[t.category || 'อื่นๆ'] = (categoryMap[t.category || 'อื่นๆ'] || 0) + t.amount;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Asset allocation
    const assetMap: Record<string, number> = {};
    investments.forEach((inv) => {
        const label = inv.assetType === 'us-stock' ? 'หุ้น US' :
            inv.assetType === 'forex' ? 'Forex' :
                inv.assetType === 'crypto' ? 'Crypto' : 'อื่นๆ';
        assetMap[label] = (assetMap[label] || 0) + inv.buyPrice * inv.quantity;
    });
    const assetData = Object.entries(assetMap).map(([name, value]) => ({ name, value }));
    const totalPortfolio = investments.reduce((s, i) => s + i.buyPrice * i.quantity, 0);

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">
                        <Wallet size={32} className="page-title-icon" />
                        Finance
                    </h1>
                    <p className="page-subtitle">ติดตามรายรับ-รายจ่ายและการลงทุน</p>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="finance-summary">
                <div className="glass-card finance-summary-card">
                    <div className="fin-icon-wrap income"><ArrowUpRight size={20} /></div>
                    <div className="fin-summary-info">
                        <span className="fin-summary-label">รายได้</span>
                        <span className="fin-summary-value income">฿{totalIncome.toLocaleString()}</span>
                    </div>
                </div>
                <div className="glass-card finance-summary-card">
                    <div className="fin-icon-wrap expense"><ArrowDownRight size={20} /></div>
                    <div className="fin-summary-info">
                        <span className="fin-summary-label">รายจ่าย</span>
                        <span className="fin-summary-value expense">฿{totalExpense.toLocaleString()}</span>
                    </div>
                </div>
                <div className="glass-card finance-summary-card">
                    <div className="fin-icon-wrap invest"><TrendingUp size={20} /></div>
                    <div className="fin-summary-info">
                        <span className="fin-summary-label">ลงทุน</span>
                        <span className="fin-summary-value invest">฿{totalInvest.toLocaleString()}</span>
                    </div>
                </div>
                <div className="glass-card finance-summary-card">
                    <div className="fin-icon-wrap balance"><BarChart3 size={20} /></div>
                    <div className="fin-summary-info">
                        <span className="fin-summary-label">คงเหลือ</span>
                        <span className={`fin-summary-value ${balance >= 0 ? 'income' : 'expense'}`}>
                            ฿{balance.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
                    💰 รายรับ-รายจ่าย
                </button>
                <button className={`tab-btn ${activeTab === 'investments' ? 'active' : ''}`} onClick={() => setActiveTab('investments')}>
                    📈 การลงทุน
                </button>
            </div>

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
                <div>
                    {/* Charts Row */}
                    <div className="finance-charts-row">
                        <div className="glass-card finance-chart-card">
                            <h3 className="chart-title"><BarChart3 size={18} /> รายรับ vs รายจ่าย</h3>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f87171" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" stroke="#6b7c93" fontSize={12} />
                                        <YAxis stroke="#6b7c93" fontSize={12} tickFormatter={(v: number) => `฿${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(15, 32, 39, 0.95)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 10,
                                                color: '#f0fdf4',
                                            }}
                                            formatter={(value: number) => [`฿${value.toLocaleString()}`, '']}
                                        />
                                        <Area type="monotone" dataKey="income" stroke="#34d399" fill="url(#gradIncome)" strokeWidth={2} name="รายได้" />
                                        <Area type="monotone" dataKey="expense" stroke="#f87171" fill="url(#gradExpense)" strokeWidth={2} name="รายจ่าย" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card finance-chart-card">
                            <h3 className="chart-title"><PieChartIcon size={18} /> สัดส่วนรายจ่าย</h3>
                            <div className="chart-container">
                                {categoryData.length === 0 ? (
                                    <p className="empty-state" style={{ paddingTop: 60 }}>ยังไม่มีข้อมูลรายจ่าย</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                                                {categoryData.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'rgba(15, 32, 39, 0.95)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 10,
                                                    color: '#f0fdf4',
                                                }}
                                                formatter={(value: number) => [`฿${value.toLocaleString()}`, '']}
                                            />
                                            <Legend formatter={(value: string) => <span style={{ color: '#a5b4c7', fontSize: 12 }}>{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="daily-header" style={{ marginTop: 24 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>รายการทั้งหมด</h3>
                        <button className="btn btn-primary" onClick={() => setTxnModal(true)}>
                            <Plus size={16} /> เพิ่มรายการ
                        </button>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                            <p className="empty-state">ยังไม่มีรายการ — เพิ่มรายรับหรือรายจ่ายแรก</p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {[...transactions].reverse().map((t) => (
                                <div key={t.id} className="glass-card task-item">
                                    <div className="task-left">
                                        {t.type === 'income' ? (
                                            <div className="fin-icon-wrap income"><ArrowUpRight size={18} /></div>
                                        ) : t.type === 'invest' ? (
                                            <div className="fin-icon-wrap invest"><TrendingUp size={18} /></div>
                                        ) : (
                                            <div className="fin-icon-wrap expense"><ArrowDownRight size={18} /></div>
                                        )}
                                        <div className="task-info">
                                            <span className="task-title">{t.note || t.category || 'ไม่ระบุ'}</span>
                                            <span className="task-desc">{t.category} · {t.date}</span>
                                        </div>
                                    </div>
                                    <div className="task-right">
                                        <span className={`txn-amount ${t.type}`}>
                                            {t.type === 'income' ? '+' : '-'}฿{t.amount.toLocaleString()}
                                        </span>
                                        <button className="icon-btn danger" onClick={() => { if (confirm('ลบรายการ?')) deleteTransaction(t.id); }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Investments Tab */}
            {activeTab === 'investments' && (
                <div>
                    {/* Portfolio Summary */}
                    <div className="finance-charts-row">
                        <div className="glass-card finance-chart-card">
                            <h3 className="chart-title"><PieChartIcon size={18} /> สัดส่วนสินทรัพย์ (Asset Allocation)</h3>
                            <div className="chart-container">
                                {assetData.length === 0 ? (
                                    <p className="empty-state" style={{ paddingTop: 60 }}>ยังไม่มีข้อมูลการลงทุน</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie data={assetData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                                                {assetData.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'rgba(15, 32, 39, 0.95)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 10,
                                                    color: '#f0fdf4',
                                                }}
                                                formatter={(value: number) => [`฿${value.toLocaleString()}`, '']}
                                            />
                                            <Legend formatter={(value: string) => <span style={{ color: '#a5b4c7', fontSize: 12 }}>{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="glass-card finance-chart-card">
                            <h3 className="chart-title"><TrendingUp size={18} /> มูลค่าพอร์ตโฟลิโอ</h3>
                            <div className="portfolio-total">
                                <span className="portfolio-amount">฿{totalPortfolio.toLocaleString()}</span>
                                <span className="portfolio-label">มูลค่ารวมสินทรัพย์</span>
                            </div>
                            <div className="portfolio-stats">
                                <div className="portfolio-stat">
                                    <span className="portfolio-stat-val">{investments.length}</span>
                                    <span className="portfolio-stat-label">รายการลงทุน</span>
                                </div>
                                <div className="portfolio-stat">
                                    <span className="portfolio-stat-val">{new Set(investments.map((i) => i.assetTicker)).size}</span>
                                    <span className="portfolio-stat-label">สินทรัพย์</span>
                                </div>
                                <div className="portfolio-stat">
                                    <span className="portfolio-stat-val">{new Set(investments.map((i) => i.assetType)).size}</span>
                                    <span className="portfolio-stat-label">ประเภท</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Investment List */}
                    <div className="daily-header" style={{ marginTop: 24 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>ประวัติ DCA / การซื้อสินทรัพย์</h3>
                        <button className="btn btn-primary" onClick={() => setInvModal(true)}>
                            <Plus size={16} /> เพิ่มรายการลงทุน
                        </button>
                    </div>

                    {investments.length === 0 ? (
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                            <p className="empty-state">ยังไม่มีรายการลงทุน — บันทึกการ DCA รายการแรก</p>
                        </div>
                    ) : (
                        <div className="investment-table glass-card">
                            <table className="inv-table">
                                <thead>
                                    <tr>
                                        <th>Ticker</th>
                                        <th>ประเภท</th>
                                        <th>ราคาซื้อ</th>
                                        <th>จำนวน</th>
                                        <th>มูลค่ารวม</th>
                                        <th>วันที่</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...investments].reverse().map((inv) => (
                                        <tr key={inv.id}>
                                            <td className="ticker-cell">{inv.assetTicker}</td>
                                            <td>
                                                <span className={`asset-type-badge ${inv.assetType}`}>
                                                    {inv.assetType === 'us-stock' ? 'หุ้น US' :
                                                        inv.assetType === 'forex' ? 'Forex' :
                                                            inv.assetType === 'crypto' ? 'Crypto' : 'อื่นๆ'}
                                                </span>
                                            </td>
                                            <td>฿{inv.buyPrice.toLocaleString()}</td>
                                            <td>{inv.quantity}</td>
                                            <td className="value-cell">฿{(inv.buyPrice * inv.quantity).toLocaleString()}</td>
                                            <td className="date-cell">{inv.datePurchased}</td>
                                            <td>
                                                <button className="icon-btn danger" onClick={() => { if (confirm('ลบ?')) deleteInvestment(inv.id); }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Transaction Modal */}
            {txnModal && (
                <TransactionModal onClose={() => setTxnModal(false)} onAdd={addTransaction} />
            )}

            {/* Investment Modal */}
            {invModal && (
                <InvestmentModal onClose={() => setInvModal(false)} onAdd={addInvestment} />
            )}
        </div>
    );
}

function TransactionModal({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (t: { type: TransactionType; amount: number; date: string; category: string; note: string }) => void;
}) {
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');

    const handleSubmit = () => {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) return;
        onAdd({ type, amount: amt, date, category, note });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>เพิ่มรายการการเงิน</h2>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-form">
                    <div className="form-group">
                        <label className="form-label">ประเภท</label>
                        <select className="form-input form-select" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                            <option value="income">รายได้</option>
                            <option value="expense">รายจ่าย</option>
                            <option value="invest">ลงทุน</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">จำนวนเงิน (฿)</label>
                            <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">วันที่</label>
                            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">หมวดหมู่</label>
                        <input className="form-input" placeholder="เช่น อาหาร, ค่าเช่า, เงินเดือน..." value={category} onChange={(e) => setCategory(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">หมายเหตุ</label>
                        <input className="form-input" placeholder="รายละเอียดเพิ่มเติม..." value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>เพิ่มรายการ</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InvestmentModal({
    onClose,
    onAdd,
}: {
    onClose: () => void;
    onAdd: (inv: Omit<Investment, 'id'>) => void;
}) {
    const [ticker, setTicker] = useState('');
    const [assetType, setAssetType] = useState<Investment['assetType']>('us-stock');
    const [buyPrice, setBuyPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [datePurchased, setDatePurchased] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');

    const handleSubmit = () => {
        const price = parseFloat(buyPrice);
        const qty = parseFloat(quantity);
        if (!ticker.trim() || !price || !qty) return;
        onAdd({
            assetTicker: ticker.toUpperCase(),
            assetType,
            buyPrice: price,
            quantity: qty,
            datePurchased,
            note,
        });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>เพิ่มรายการลงทุน</h2>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-form">
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Ticker / ชื่อสินทรัพย์</label>
                            <input className="form-input" placeholder="เช่น AAPL, NVDA..." value={ticker} onChange={(e) => setTicker(e.target.value)} autoFocus />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">ประเภท</label>
                            <select className="form-input form-select" value={assetType} onChange={(e) => setAssetType(e.target.value as Investment['assetType'])}>
                                <option value="us-stock">หุ้น US</option>
                                <option value="forex">Forex</option>
                                <option value="crypto">Crypto</option>
                                <option value="other">อื่นๆ</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">ราคาซื้อ (฿)</label>
                            <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">จำนวน</label>
                            <input className="form-input" type="number" min="0" step="0.001" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">วันที่ซื้อ</label>
                            <input type="date" className="form-input" value={datePurchased} onChange={(e) => setDatePurchased(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">หมายเหตุ</label>
                            <input className="form-input" placeholder="DCA #1, ..." value={note} onChange={(e) => setNote(e.target.value)} />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>บันทึกการลงทุน</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
