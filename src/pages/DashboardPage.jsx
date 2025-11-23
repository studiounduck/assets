import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    AreaChart, Area
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const DashboardPage = ({ transactions, loading }) => {
    const { t } = useLanguage();

    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return { trend: [], breakdown: [], cashflow: [] };

        // 1. Revenue & Expense Trend (Monthly)
        const monthlyData = {};
        // 3. Cash Flow Trend (Cumulative)
        let cumulativeCash = 0;
        const cashFlowData = [];

        // Sort transactions by date ascending for cumulative calc
        const sortedTxs = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedTxs.forEach(tx => {
            const date = new Date(tx.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { name: monthKey, income: 0, expense: 0 };
            }

            const amount = parseFloat(tx.amount);
            if (tx.type === 'income') {
                monthlyData[monthKey].income += amount;
                cumulativeCash += amount;
            } else {
                monthlyData[monthKey].expense += amount;
                cumulativeCash -= amount;
            }

            // For cash flow, we want the balance at the end of each transaction (or day)
            // To simplify, we'll just push every transaction point or aggregate by day. 
            // Aggregating by month for the chart might be cleaner.
        });

        // Convert monthly object to array
        const trend = Object.values(monthlyData).sort((a, b) => a.name.localeCompare(b.name));

        // Generate Cash Flow Data (Monthly Balance)
        let runningBalance = 0;
        const cashflow = trend.map(item => {
            runningBalance += (item.income - item.expense);
            return {
                name: item.name,
                value: runningBalance
            };
        });

        // 2. Expense Breakdown (Top 5)
        const expenses = {};
        transactions.filter(tx => tx.type === 'expense').forEach(tx => {
            const desc = tx.description || 'Unknown';
            expenses[desc] = (expenses[desc] || 0) + parseFloat(tx.amount);
        });

        const breakdown = Object.entries(expenses)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return { trend, breakdown, cashflow };
    }, [transactions]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>{t('dashboardTitle')}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>

                {/* 1. Revenue & Expense Trend */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#475569' }}>{t('chartTrend')}</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value)} />
                                <Legend />
                                <Bar dataKey="income" name={t('income')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name={t('expense')} fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Expense Breakdown */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#475569' }}>{t('chartBreakdown')}</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData.breakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Cash Flow Trend */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', gridColumn: '1 / -1' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#475569' }}>{t('chartCashFlow')}</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.cashflow}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value)} />
                                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
