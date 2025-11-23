import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, AreaChart, Area
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const DashboardPage = ({ transactions, loading }) => {
    const { t } = useLanguage();

    const [currentDate, setCurrentDate] = useState(new Date());

    const { chartData, kpiData, previousKpiData } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return {
                chartData: { trend: [], breakdown: [], cashflow: [] },
                kpiData: { totalAssets: 0, totalLiabilities: 0, netAssets: 0, monthlyProfit: 0 },
                previousKpiData: { totalAssets: 0, totalLiabilities: 0, netAssets: 0, monthlyProfit: 0 }
            };
        }

        const selectedYear = currentDate.getFullYear();
        const selectedMonth = currentDate.getMonth();

        // Calculate KPIs for selected month
        const getKpiForMonth = (year, month) => {
            // End date of the month
            const endDate = new Date(year, month + 1, 0);

            // Cumulative transactions up to end of the month
            const cumulativeTransactions = transactions.filter(tx => {
                const txDate = new Date(tx.date.seconds * 1000);
                return txDate <= endDate;
            });

            let totalIncome = 0;
            let totalExpense = 0;

            cumulativeTransactions.forEach(tx => {
                const amount = parseFloat(tx.amount) || 0;
                if (tx.type === 'income') {
                    totalIncome += amount;
                } else {
                    totalExpense += amount;
                }
            });

            // Total Assets = Cash (cumulative income - expense)
            const totalAssets = totalIncome - totalExpense;

            // Total Liabilities = 0 (placeholder)
            const totalLiabilities = 0;

            // Net Assets = Assets - Liabilities
            const netAssets = totalAssets - totalLiabilities;

            // Monthly Profit for this specific month
            const monthlyTransactions = transactions.filter(tx => {
                const txDate = new Date(tx.date.seconds * 1000);
                return txDate.getFullYear() === year && txDate.getMonth() === month;
            });

            const monthlyIncome = monthlyTransactions
                .filter(tx => tx.type === 'income')
                .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

            const monthlyExpense = monthlyTransactions
                .filter(tx => tx.type === 'expense')
                .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

            const monthlyProfit = monthlyIncome - monthlyExpense;

            return { totalAssets, totalLiabilities, netAssets, monthlyProfit };
        };

        const kpiData = getKpiForMonth(selectedYear, selectedMonth);

        // Previous month KPI for comparison
        const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
        const previousKpiData = getKpiForMonth(prevYear, prevMonth);

        // === Chart Data ===
        // 1. Monthly Trend Data
        const monthlyData = {};
        const sortedTxs = [...transactions].sort((a, b) => {
            const dateA = new Date(a.date.seconds * 1000);
            const dateB = new Date(b.date.seconds * 1000);
            return dateA - dateB;
        });

        sortedTxs.forEach(tx => {
            const date = new Date(tx.date.seconds * 1000);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthKey = `${year}.${String(month).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { name: monthKey, income: 0, expense: 0, profit: 0 };
            }

            const amount = parseFloat(tx.amount) || 0;
            if (tx.type === 'income') {
                monthlyData[monthKey].income += amount;
            } else {
                monthlyData[monthKey].expense += amount;
            }
        });

        // Calculate profit for each month
        Object.values(monthlyData).forEach(month => {
            month.profit = month.income - month.expense;
        });

        const trend = Object.values(monthlyData).sort((a, b) => a.name.localeCompare(b.name));

        // 2. Expense Breakdown (Top 5)
        // Filter transactions for the selected month for breakdown
        const expenses = {};
        transactions.filter(tx => {
            const txDate = new Date(tx.date.seconds * 1000);
            return tx.type === 'expense' && txDate.getFullYear() === selectedYear && txDate.getMonth() === selectedMonth;
        }).forEach(tx => {
            const desc = tx.description || '기타';
            expenses[desc] = (expenses[desc] || 0) + (parseFloat(tx.amount) || 0);
        });

        const breakdown = Object.entries(expenses)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 3. Cash Flow (Cumulative)
        let runningBalance = 0;
        const cashflow = trend.map(item => {
            runningBalance += item.profit;
            return {
                name: item.name,
                amount: runningBalance
            };
        });

        return {
            chartData: { trend, breakdown, cashflow },
            kpiData,
            previousKpiData
        };
    }, [transactions, currentDate]);

    const COLORS = ['#FF6B6B', '#FFD93D', '#4D96FF', '#6BCB77', '#A0A0A0'];

    const formatCurrency = (value) => {
        if (value == null || isNaN(value)) return '₩0';
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    };

    const calculateChange = (current, previous) => {
        if (previous === 0) {
            if (current === 0) return { percent: 0, isPositive: true };
            return { percent: 100, isPositive: current > 0 };
        }
        const change = ((current - previous) / Math.abs(previous)) * 100;
        return { percent: Math.abs(change).toFixed(1), isPositive: change >= 0 };
    };

    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'white',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '14px'
                }}>
                    <p style={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
                            <span style={{ color: '#6b7280' }}>{entry.name}:</span>
                            <span style={{ fontWeight: '500' }}>{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.1rem', color: '#6b7280' }}>
                {t('loading')}
            </div>
        );
    }

    // Calculate total expense for the selected month for the pie chart
    const totalExpenseForMonth = transactions
        .filter(tx => {
            const txDate = new Date(tx.date.seconds * 1000);
            return tx.type === 'expense' && txDate.getFullYear() === currentDate.getFullYear() && txDate.getMonth() === currentDate.getMonth();
        })
        .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header with Month Selector */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                            재무 대시보드
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 재무 현황 리포트
                        </p>
                    </div>

                    {/* Month Selector */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <button
                            onClick={() => changeMonth(-1)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                color: '#64748b'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b', minWidth: '100px', textAlign: 'center' }}>
                            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                        </span>
                        <button
                            onClick={() => changeMonth(1)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                color: '#64748b'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <KpiCard
                        title="총 자산"
                        amount={kpiData.totalAssets}
                        bgColor="#dbeafe"
                        iconColor="#2563eb"
                        icon="💰"
                        change={calculateChange(kpiData.totalAssets, previousKpiData.totalAssets)}
                    />
                    <KpiCard
                        title="총 부채"
                        amount={kpiData.totalLiabilities}
                        bgColor="#fee2e2"
                        iconColor="#dc2626"
                        icon="💳"
                        change={calculateChange(kpiData.totalLiabilities, previousKpiData.totalLiabilities)}
                    />
                    <KpiCard
                        title="순자산"
                        amount={kpiData.netAssets}
                        bgColor="#d1fae5"
                        iconColor="#059669"
                        icon="📊"
                        change={calculateChange(kpiData.netAssets, previousKpiData.netAssets)}
                    />
                    <KpiCard
                        title="이번 달 순이익"
                        amount={kpiData.monthlyProfit}
                        bgColor="#e0e7ff"
                        iconColor="#4f46e5"
                        icon="📈"
                        change={calculateChange(kpiData.monthlyProfit, previousKpiData.monthlyProfit)}
                    />
                </div>

                {/* Main Charts */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                }}>

                    {/* Trend Chart */}
                    <div style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        border: '1px solid #f1f5f9',
                        gridColumn: chartData.trend.length > 0 ? 'span 2' : 'auto'
                    }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>
                            {t('chartTrend')}
                        </h2>
                        {chartData.trend.length > 0 ? (
                            <div style={{ height: '320px' }}>
                                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                                    <ComposedChart data={chartData.trend} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => `${value / 10000}만`}
                                            tick={{ fill: '#6b7280', fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="income" name={t('income')} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="expense" name={t('expense')} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Line type="monotone" dataKey="profit" name="순이익" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                데이터가 없습니다
                            </div>
                        )}
                    </div>

                    {/* Expense Breakdown */}
                    <div style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                            {t('chartBreakdown')}
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                            카테고리별 지출 비중 (상위 5개)
                        </p>
                        {chartData.breakdown.length > 0 ? (
                            <>
                                <div style={{ height: '320px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                                        <PieChart>
                                            <Pie
                                                data={chartData.breakdown}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.breakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center',
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>총 지출</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                                            {formatCurrency(totalExpenseForMonth).replace('₩', '')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {chartData.breakdown.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx] }} />
                                                <span style={{ color: '#64748b' }}>{item.name}</span>
                                            </div>
                                            <span style={{ fontWeight: '500', color: '#1e293b' }}>
                                                {Math.round((item.value / totalExpenseForMonth) * 100)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                데이터가 없습니다
                            </div>
                        )}
                    </div>
                </div>

                {/* Cash Flow Chart */}
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                            {t('chartCashFlow')}
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            누적 현금 흐름 추이
                        </p>
                    </div>
                    {chartData.cashflow.length > 0 ? (
                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                                <AreaChart data={chartData.cashflow} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `${value / 10000}만`}
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        name="현금잔고"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            데이터가 없습니다
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// KPI Card Component
const KpiCard = ({ title, amount, bgColor, iconColor, icon, change }) => {
    const formatCurrency = (value) => {
        if (value == null || isNaN(value)) return '₩0';
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    };

    return (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '1px solid #f1f5f9'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}>
                    {icon}
                </div>
                {change && (
                    <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: change.isPositive ? '#059669' : '#dc2626',
                        background: change.isPositive ? '#d1fae5' : '#fee2e2',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px'
                    }}>
                        {change.isPositive ? '+' : '-'}{change.percent}%
                    </span>
                )}
            </div>
            <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500', marginBottom: '0.5rem' }}>
                    {title}
                </p>
                <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {formatCurrency(amount)}
                </h3>
            </div>
        </div>
    );
};

export default DashboardPage;
