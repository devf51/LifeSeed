'use client';

import { useState, useEffect } from 'react';
import { useTaskStore, Task, TaskPriority, TaskStatus } from '@/store/taskStore';
import {
    ListTodo,
    Plus,
    X,
    Trash2,
    Calendar,
    Target,
    AlertCircle,
    CheckCircle2,
    Clock,
} from 'lucide-react';

type ViewTab = 'daily' | 'monthly' | 'yearly';

export default function PlannerPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<ViewTab>('daily');
    const [taskModal, setTaskModal] = useState(false);
    const [goalModal, setGoalModal] = useState(false);
    const [monthlyGoalModal, setMonthlyGoalModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());

    const tasks = useTaskStore((s) => s.tasks);
    const goals = useTaskStore((s) => s.goals);
    const monthlyGoals = useTaskStore((s) => s.monthlyGoals);
    const addTask = useTaskStore((s) => s.addTask);
    const deleteTask = useTaskStore((s) => s.deleteTask);
    const cycleStatus = useTaskStore((s) => s.cycleStatus);
    const addGoal = useTaskStore((s) => s.addGoal);
    const updateGoal = useTaskStore((s) => s.updateGoal);
    const deleteGoal = useTaskStore((s) => s.deleteGoal);
    const addMonthlyGoal = useTaskStore((s) => s.addMonthlyGoal);
    const updateMonthlyGoal = useTaskStore((s) => s.updateMonthlyGoal);
    const deleteMonthlyGoal = useTaskStore((s) => s.deleteMonthlyGoal);

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    const today = new Date().toISOString().split('T')[0];
    const dailyTasks = tasks
        .filter((t) => t.dueDate === selectedDate)
        .sort((a, b) => {
            const prioOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
            const statusOrder: Record<TaskStatus, number> = { 'in-progress': 0, pending: 1, completed: 2 };
            return prioOrder[a.priority] - prioOrder[b.priority] || statusOrder[a.status] - statusOrder[b.status];
        });

    const currentYearGoals = goals.filter((g) => g.year === calYear);
    const currentMonthGoals = monthlyGoals.filter((g) => g.month === calMonth && g.year === calYear);

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">
                        <ListTodo size={32} className="page-title-icon" />
                        Planner
                    </h1>
                    <p className="page-subtitle">จัดการเป้าหมายและรายการที่ต้องทำ</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="tabs">
                {(['daily', 'monthly', 'yearly'] as ViewTab[]).map((tab) => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'daily' ? '📋 รายวัน' : tab === 'monthly' ? '📅 รายเดือน' : '🎯 รายปี'}
                    </button>
                ))}
            </div>

            {/*  Daily View  */}
            {activeTab === 'daily' && (
                <div>
                    <div className="daily-header">
                        <div className="form-group" style={{ maxWidth: 200 }}>
                            <input
                                type="date"
                                className="form-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={() => setTaskModal(true)}>
                            <Plus size={16} /> เพิ่มงาน
                        </button>
                    </div>

                    {dailyTasks.length === 0 ? (
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                            <p className="empty-state">
                                ไม่มีงานในวันนี้ — กดปุ่ม &quot;เพิ่มงาน&quot; เพื่อเริ่มต้น
                            </p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {dailyTasks.map((task) => (
                                <div key={task.id} className={`glass-card task-item ${task.status}`}>
                                    <div className="task-left">
                                        <button
                                            className={`task-status-btn ${task.status}`}
                                            onClick={() => cycleStatus(task.id)}
                                            title="เปลี่ยนสถานะ"
                                        >
                                            {task.status === 'completed' ? (
                                                <CheckCircle2 size={20} />
                                            ) : task.status === 'in-progress' ? (
                                                <Clock size={20} />
                                            ) : (
                                                <AlertCircle size={20} />
                                            )}
                                        </button>
                                        <div className="task-info">
                                            <span className={`task-title ${task.status === 'completed' ? 'done' : ''}`}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <span className="task-desc">{task.description}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="task-right">
                                        <span className={`priority-badge ${task.priority}`}>
                                            {task.priority === 'high' ? 'สูง' : task.priority === 'medium' ? 'กลาง' : 'ต่ำ'}
                                        </span>
                                        <button
                                            className="icon-btn danger"
                                            onClick={() => { if (confirm('ลบงานนี้?')) deleteTask(task.id); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/*  Monthly View  */}
            {activeTab === 'monthly' && (
                <div>
                    <div className="daily-header">
                        <div className="calendar-nav">
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
                                else setCalMonth((m) => m - 1);
                            }}>←</button>
                            <span className="calendar-month-label">
                                {new Date(calYear, calMonth).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                            </span>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
                                else setCalMonth((m) => m + 1);
                            }}>→</button>
                        </div>
                        <button className="btn btn-primary" onClick={() => setMonthlyGoalModal(true)}>
                            <Plus size={16} /> เพิ่มเป้าหมาย ({new Date(calYear, calMonth).toLocaleDateString('th-TH', { month: 'short' })})
                        </button>
                    </div>

                    {currentMonthGoals.length === 0 ? (
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                            <p className="empty-state">ยังไม่มีเป้าหมายสำหรับเดือน{new Date(calYear, calMonth).toLocaleDateString('th-TH', { month: 'long' })}</p>
                        </div>
                    ) : (
                        <div className="goals-list">
                            {currentMonthGoals.map((goal) => (
                                <div key={goal.id} className={`glass-card goal-item ${goal.completed ? 'completed' : ''}`}>
                                    <button
                                        className={`goal-check ${goal.completed ? 'checked' : ''}`}
                                        onClick={() => updateMonthlyGoal(goal.id, { completed: !goal.completed })}
                                    >
                                        {goal.completed && '✓'}
                                    </button>
                                    <span className={`goal-title ${goal.completed ? 'done' : ''}`}>
                                        {goal.title}
                                    </span>
                                    <button
                                        className="icon-btn danger"
                                        onClick={() => { if (confirm('ลบเป้าหมาย?')) deleteMonthlyGoal(goal.id); }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/*  Yearly View  */}
            {activeTab === 'yearly' && (
                <div>
                    <div className="daily-header">
                        <div className="year-selector">
                            <button className="btn btn-secondary btn-sm" onClick={() => setCalYear((y) => y - 1)}>←</button>
                            <span className="year-label">{calYear}</span>
                            <button className="btn btn-secondary btn-sm" onClick={() => setCalYear((y) => y + 1)}>→</button>
                        </div>
                        <button className="btn btn-primary" onClick={() => setGoalModal(true)}>
                            <Plus size={16} /> เพิ่มเป้าหมาย
                        </button>
                    </div>

                    {currentYearGoals.length === 0 ? (
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                            <p className="empty-state">ยังไม่มีเป้าหมายสำหรับปี {calYear}</p>
                        </div>
                    ) : (
                        <div className="goals-list">
                            {currentYearGoals.map((goal) => (
                                <div key={goal.id} className={`glass-card goal-item ${goal.completed ? 'completed' : ''}`}>
                                    <button
                                        className={`goal-check ${goal.completed ? 'checked' : ''}`}
                                        onClick={() => updateGoal(goal.id, { completed: !goal.completed })}
                                    >
                                        {goal.completed && '✓'}
                                    </button>
                                    <span className={`goal-title ${goal.completed ? 'done' : ''}`}>
                                        {goal.title}
                                    </span>
                                    <button
                                        className="icon-btn danger"
                                        onClick={() => { if (confirm('ลบเป้าหมาย?')) deleteGoal(goal.id); }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Task Modal */}
            {taskModal && (
                <TaskModal
                    date={selectedDate}
                    onClose={() => setTaskModal(false)}
                    onAdd={addTask}
                />
            )}

            {/* Goal Modal */}
            {goalModal && (
                <GoalModal
                    year={calYear}
                    onClose={() => setGoalModal(false)}
                    onAdd={addGoal}
                />
            )}

            {/* Monthly Goal Modal */}
            {monthlyGoalModal && (
                <MonthlyGoalModal
                    month={calMonth}
                    year={calYear}
                    onClose={() => setMonthlyGoalModal(false)}
                    onAdd={addMonthlyGoal}
                />
            )}
        </div>
    );
}

function TaskModal({
    date,
    onClose,
    onAdd,
}: {
    date: string;
    onClose: () => void;
    onAdd: (t: { title: string; description: string; dueDate: string; status: TaskStatus; priority: TaskPriority }) => void;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [dueDate, setDueDate] = useState(date);

    const handleSubmit = () => {
        if (!title.trim()) return;
        onAdd({ title, description, dueDate, status: 'pending', priority });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>เพิ่มงานใหม่</h2>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-form">
                    <div className="form-group">
                        <label className="form-label">ชื่องาน</label>
                        <input className="form-input" placeholder="สิ่งที่ต้องทำ..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                    </div>
                    <div className="form-group">
                        <label className="form-label">รายละเอียด</label>
                        <textarea className="form-input form-textarea" placeholder="รายละเอียดเพิ่มเติม..." value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">กำหนดส่ง</label>
                            <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">ความสำคัญ</label>
                            <select className="form-input form-select" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                                <option value="high">สูง</option>
                                <option value="medium">กลาง</option>
                                <option value="low">ต่ำ</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>เพิ่มงาน</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GoalModal({
    year,
    onClose,
    onAdd,
}: {
    year: number;
    onClose: () => void;
    onAdd: (g: { title: string; year: number; completed: boolean }) => void;
}) {
    const [title, setTitle] = useState('');

    const handleSubmit = () => {
        if (!title.trim()) return;
        onAdd({ title, year, completed: false });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>เพิ่มเป้าหมายปี {year}</h2>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-form">
                    <div className="form-group">
                        <label className="form-label">เป้าหมาย</label>
                        <input className="form-input" placeholder="เป้าหมายที่ต้องการบรรลุ..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>เพิ่มเป้าหมาย</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MonthlyGoalModal({
    month,
    year,
    onClose,
    onAdd,
}: {
    month: number;
    year: number;
    onClose: () => void;
    onAdd: (g: { title: string; month: number; year: number; completed: boolean }) => void;
}) {
    const [title, setTitle] = useState('');

    const handleSubmit = () => {
        if (!title.trim()) return;
        onAdd({ title, month, year, completed: false });
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>เพิ่มเป้าหมายเดือน{new Date(year, month).toLocaleDateString('th-TH', { month: 'long' })}</h2>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-form">
                    <div className="form-group">
                        <label className="form-label">เป้าหมาย</label>
                        <input className="form-input" placeholder="เป้าหมายเดือนนี้ (สิ่งที่ต้องทำเดือนนี้)..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={onClose}>ยกเลิก</button>
                        <button className="btn btn-primary" onClick={handleSubmit}>เพิ่มเป้าหมาย</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
