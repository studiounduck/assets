import React, { useState, useEffect } from 'react';
import { ACCOUNT_NAMES } from '../utils/accounting';
import { useLanguage } from '../context/LanguageContext';
import './FinancialStatements.css';

const FinancialStatements = ({ financials, transactions = [], activeTab: initialTab = 'is', hideTabs = false }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    // Filter transactions for the selected month and calculate standard IS items
    const getMonthlyFinancials = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthlyTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date.seconds * 1000);
            return txDate.getFullYear() === year && txDate.getMonth() === month;
        });

        // 1. Revenue (Sales)
        const revenue = monthlyTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        // 2. Cost of Sales (Placeholder: 0 for now)
        const costOfSales = 0;

        // 3. Gross Profit
        const grossProfit = revenue - costOfSales;

        // 4. Selling & Admin Expenses
        const sellingAndAdminExpenses = monthlyTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        // 5. Operating Income
        const operatingIncome = grossProfit - sellingAndAdminExpenses;

        // 6. Non-operating Income (Placeholder: 0)
        const nonOperatingIncome = 0;

        // 7. Non-operating Expenses (Placeholder: 0)
        const nonOperatingExpenses = 0;

        // 8. Income Before Tax
        const incomeBeforeTax = operatingIncome + nonOperatingIncome - nonOperatingExpenses;

        // 9. Income Tax Expense (Placeholder: 0)
        const incomeTaxExpense = 0;

        // 10. Net Income
        const netIncome = incomeBeforeTax - incomeTaxExpense;

        return {
            revenue,
            costOfSales,
            grossProfit,
            sellingAndAdminExpenses,
            operatingIncome,
            nonOperatingIncome,
            nonOperatingExpenses,
            incomeBeforeTax,
            incomeTaxExpense,
            netIncome
        };
    };

    const renderIncomeStatement = () => {
        const financials = getMonthlyFinancials();

        const Row = ({ label, value, isTotal = false, isSubTotal = false, indent = false }) => (
            <tr style={{
                background: isTotal ? '#e9ecef' : (isSubTotal ? '#f8f9fa' : 'white'),
                fontWeight: (isTotal || isSubTotal) ? 'bold' : 'normal',
                borderBottom: '1px solid #dee2e6'
            }}>
                <td style={{ padding: '1rem', paddingLeft: indent ? '2rem' : '1rem' }}>{label}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(value)}</td>
            </tr>
        );

        return (
            <div className="statement income-statement-revamp">
                <div className="is-table-container" style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#e9ecef', borderBottom: '2px solid #ced4da' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('account')}</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Row label={`I. ${t('revenue')}`} value={financials.revenue} isSubTotal />
                            <Row label={`II. ${t('costOfSales')}`} value={financials.costOfSales} isSubTotal />
                            <Row label={`III. ${t('grossProfit')}`} value={financials.grossProfit} isTotal />
                            <Row label={`IV. ${t('sellingAndAdminExpenses')}`} value={financials.sellingAndAdminExpenses} isSubTotal />
                            <Row label={`V. ${t('operatingIncome')}`} value={financials.operatingIncome} isTotal />
                            <Row label={`VI. ${t('nonOperatingIncome')}`} value={financials.nonOperatingIncome} isSubTotal />
                            <Row label={`VII. ${t('nonOperatingExpenses')}`} value={financials.nonOperatingExpenses} isSubTotal />
                            <Row label={`VIII. ${t('incomeBeforeTax')}`} value={financials.incomeBeforeTax} isTotal />
                            <Row label={`IX. ${t('incomeTaxExpense')}`} value={financials.incomeTaxExpense} isSubTotal />
                            <Row label={`X. ${t('netIncome')}`} value={financials.netIncome} isTotal />
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Calculate Balance Sheet items (Cumulative up to selected month)
    const getBalanceSheetData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // End date of the selected month
        const endDate = new Date(year, month + 1, 0); // Last day of the month

        const cumulativeTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date.seconds * 1000);
            return txDate <= endDate;
        });

        const totalIncome = cumulativeTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const totalExpense = cumulativeTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Assets
        const cashAndCashEquivalents = totalIncome - totalExpense;
        const currentAssets = cashAndCashEquivalents;
        const nonCurrentAssets = 0;
        const totalAssets = currentAssets + nonCurrentAssets;

        // Liabilities
        const currentLiabilities = 0;
        const nonCurrentLiabilities = 0;
        const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

        // Equity
        const capitalStock = 0;
        const retainedEarnings = totalAssets - totalLiabilities - capitalStock; // Should equal net income/cash in this simple model
        const totalEquity = capitalStock + retainedEarnings;

        return {
            currentAssets,
            cashAndCashEquivalents,
            nonCurrentAssets,
            totalAssets,
            currentLiabilities,
            nonCurrentLiabilities,
            totalLiabilities,
            capitalStock,
            retainedEarnings,
            totalEquity
        };
    };

    const renderBalanceSheet = () => {
        const bs = getBalanceSheetData();

        const Row = ({ label, value, isTotal = false, isSubTotal = false, indent = false, doubleIndent = false }) => (
            <tr style={{
                background: isTotal ? '#e9ecef' : (isSubTotal ? '#f8f9fa' : 'white'),
                fontWeight: (isTotal || isSubTotal) ? 'bold' : 'normal',
                borderBottom: '1px solid #dee2e6'
            }}>
                <td style={{
                    padding: '1rem',
                    paddingLeft: doubleIndent ? '3rem' : (indent ? '2rem' : '1rem')
                }}>{label}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(value)}</td>
            </tr>
        );

        return (
            <div className="statement balance-sheet-revamp">
                <div className="bs-table-container" style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#e9ecef', borderBottom: '2px solid #ced4da' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('account')}</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Assets */}
                            <Row label={t('assets')} value={bs.totalAssets} isTotal />
                            <Row label={`I. ${t('currentAssets')}`} value={bs.currentAssets} isSubTotal indent />
                            <Row label={`   1. ${t('cashAndCashEquivalents')}`} value={bs.cashAndCashEquivalents} doubleIndent />
                            <Row label={`II. ${t('nonCurrentAssets')}`} value={bs.nonCurrentAssets} isSubTotal indent />

                            {/* Liabilities */}
                            <Row label={t('liabilities')} value={bs.totalLiabilities} isTotal />
                            <Row label={`I. ${t('currentLiabilities')}`} value={bs.currentLiabilities} isSubTotal indent />
                            <Row label={`II. ${t('nonCurrentLiabilities')}`} value={bs.nonCurrentLiabilities} isSubTotal indent />

                            {/* Equity */}
                            <Row label={t('equity')} value={bs.totalEquity} isTotal />
                            <Row label={`I. ${t('capitalStock')}`} value={bs.capitalStock} isSubTotal indent />
                            <Row label={`II. ${t('retainedEarnings')}`} value={bs.retainedEarnings} isSubTotal indent />
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Calculate Cash Flow items (Indirect Method)
    const getCashFlowData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // 1. Calculate Net Income for the current month (Operating Activities base)
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

        // 2. Operating Activities
        // In this simple model, we assume all income/expense is cash-based.
        // So Net Income = Cash Flow from Operating Activities.
        // Adjustments would go here (e.g. depreciation, AP/AR changes).
        const cashFlowOperating = netIncome;

        // 3. Investing Activities (Placeholder)
        const cashFlowInvesting = 0;

        // 4. Financing Activities (Placeholder)
        const cashFlowFinancing = 0;

        // 5. Net Increase/Decrease in Cash
        const netIncreaseCash = cashFlowOperating + cashFlowInvesting + cashFlowFinancing;

        // 6. Cash at Beginning of Period
        // Calculate cumulative cash up to the end of the PREVIOUS month
        const startDate = new Date(year, month, 1);
        const previousTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date.seconds * 1000);
            return txDate < startDate;
        });

        const prevIncome = previousTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const prevExpense = previousTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const cashBeginning = prevIncome - prevExpense;

        // 7. Cash at End of Period
        const cashEnding = cashBeginning + netIncreaseCash;

        return {
            netIncome,
            cashFlowOperating,
            cashFlowInvesting,
            cashFlowFinancing,
            netIncreaseCash,
            cashBeginning,
            cashEnding
        };
    };

    const renderCashFlow = () => {
        const cf = getCashFlowData();

        const Row = ({ label, value, isTotal = false, isSubTotal = false, indent = false }) => (
            <tr style={{
                background: isTotal ? '#e9ecef' : (isSubTotal ? '#f8f9fa' : 'white'),
                fontWeight: (isTotal || isSubTotal) ? 'bold' : 'normal',
                borderBottom: '1px solid #dee2e6'
            }}>
                <td style={{
                    padding: '1rem',
                    paddingLeft: indent ? '2rem' : '1rem'
                }}>{label}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(value)}</td>
            </tr>
        );

        return (
            <div className="statement cash-flow-revamp">
                <div className="cf-table-container" style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#e9ecef', borderBottom: '2px solid #ced4da' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>{t('account')}</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* I. Operating Activities */}
                            <Row label={`I. ${t('cashFlowOperating')}`} value={cf.cashFlowOperating} isTotal />
                            <Row label={`   1. ${t('netIncome')}`} value={cf.netIncome} indent />

                            {/* II. Investing Activities */}
                            <Row label={`II. ${t('cashFlowInvesting')}`} value={cf.cashFlowInvesting} isTotal />

                            {/* III. Financing Activities */}
                            <Row label={`III. ${t('cashFlowFinancing')}`} value={cf.cashFlowFinancing} isTotal />

                            {/* IV. Net Increase/Decrease */}
                            <Row label={`IV. ${t('netIncreaseCash')} (I+II+III)`} value={cf.netIncreaseCash} isTotal />

                            {/* V. Beginning Cash */}
                            <Row label={`V. ${t('cashBeginning')}`} value={cf.cashBeginning} isSubTotal />

                            {/* VI. Ending Cash */}
                            <Row label={`VI. ${t('cashEnding')} (IV+V)`} value={cf.cashEnding} isTotal />
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="financial-statements">
            {!hideTabs && (
                <div className="tabs">
                    <button
                        className={activeTab === 'is' ? 'active' : ''}
                        onClick={() => setActiveTab('is')}
                    >
                        {t('incomeStatement')}
                    </button>
                    <button
                        className={activeTab === 'bs' ? 'active' : ''}
                        onClick={() => setActiveTab('bs')}
                    >
                        {t('balanceSheet')}
                    </button>
                    <button
                        className={activeTab === 'cf' ? 'active' : ''}
                        onClick={() => setActiveTab('cf')}
                    >
                        {t('cashFlow')}
                    </button>
                </div>
            )}

            <div className="statement-content">
                {activeTab === 'is' && renderIncomeStatement()}
                {activeTab === 'bs' && renderBalanceSheet()}
                {activeTab === 'cf' && renderCashFlow()}
            </div>
        </div>
    );
};

export default FinancialStatements;
