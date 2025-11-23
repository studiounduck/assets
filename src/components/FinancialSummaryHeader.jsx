import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const FinancialSummaryHeader = ({ transactions, currentDate, onDateChange }) => {
    const { t } = useLanguage();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    // Calculate financials for the selected month
    const getMonthlyFinancials = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthlyTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date.seconds * 1000);
            return txDate.getFullYear() === year && txDate.getMonth() === month;
        });

        const revenue = monthlyTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = monthlyTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const netIncome = revenue - expenses;

        return { revenue, expenses, netIncome };
    };

    const { revenue, expenses, netIncome } = getMonthlyFinancials();
    const revenueWidth = (revenue / (revenue + expenses)) * 100 || 0;
    const expenseWidth = (expenses / (revenue + expenses)) * 100 || 0;

    return (
        <div className="is-header-panel" style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '2rem',
            border: '1px solid #e9ecef'
        }}>
            {/* Date Selector */}
            <div className="date-selector" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid #dee2e6',
                paddingRight: '2rem',
                minWidth: '200px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <button onClick={() => onDateChange(-1)} style={{ border: '1px solid #ced4da', background: 'white', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>&lt;</button>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </h2>
                    <button onClick={() => onDateChange(1)} style={{ border: '1px solid #ced4da', background: 'white', borderRadius: '4px', cursor: 'pointer', padding: '0.25rem 0.5rem' }}>&gt;</button>
                </div>
                <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>(조회기간 변경 : 상단기간 선택바)</span>
            </div>

            {/* Summary Graph */}
            <div className="summary-graph" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    <span style={{ color: '#0d6efd' }}>{t('income')} {formatCurrency(revenue)}</span>
                    <span style={{ color: '#fd7e14' }}>{t('expenses')} {formatCurrency(expenses)}</span>
                </div>
                <div style={{ height: '24px', background: '#e9ecef', borderRadius: '12px', overflow: 'hidden', display: 'flex', marginBottom: '0.5rem' }}>
                    <div style={{ width: `${revenueWidth}%`, background: '#0d6efd', transition: 'width 0.3s' }}></div>
                    <div style={{ width: `${expenseWidth}%`, background: '#fd7e14', transition: 'width 0.3s' }}></div>
                </div>
                <div style={{ textAlign: 'right', color: '#495057', fontWeight: '600' }}>
                    {t('profit')} {formatCurrency(netIncome)}
                </div>
            </div>
        </div>
    );
};

export default FinancialSummaryHeader;
