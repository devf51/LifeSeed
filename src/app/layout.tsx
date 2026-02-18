import type { Metadata } from 'next';
import './globals.css';
import '../components/sidebar.css';
import './pages.css';
import '../app/habits/habits.css';
import '../app/planner/planner.css';
import '../app/finance/finance.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
    title: 'LifeSeed — Grow Your Life',
    description: 'ระบบติดตามเป้าหมายชีวิต จัดการตารางเวลา และบันทึกข้อมูลการเงิน',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="th" className="dark">
            <body>
                <div className="app-layout">
                    <Sidebar />
                    <MobileNav />
                    <main className="main-content">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
