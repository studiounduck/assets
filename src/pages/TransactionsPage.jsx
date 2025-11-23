import React from 'react';
import TransactionForm from '../components/TransactionForm';
import Modal from '../components/Modal';
import { useLanguage } from '../context/LanguageContext';


const TransactionsPage = ({ transactions, onTransactionAdded }) => {
    const { t } = useLanguage();
    const [showForm, setShowForm] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState(null);
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setEditingTransaction(null);
    };

    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    // Filter transactions for the selected month
    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date.seconds * 1000);
        return txDate.getFullYear() === currentDate.getFullYear() &&
            txDate.getMonth() === currentDate.getMonth();
    });

    // Calculate monthly summary
    const getMonthlyFinancials = () => {
        const revenue = filteredTransactions
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = filteredTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const netIncome = revenue - expenses;
        const revenueWidth = (revenue / (revenue + expenses)) * 100 || 0;
        const expenseWidth = (expenses / (revenue + expenses)) * 100 || 0;

        return { revenue, expenses, netIncome, revenueWidth, expenseWidth };
    };

    const { revenue, expenses, netIncome, revenueWidth, expenseWidth } = getMonthlyFinancials();

    return (
        <div style={{ maxWidth: '100%' }}>
            {/* Unified Card Container */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                overflow: 'hidden'
            }}>
                {/* Header Section with Date Selector and Summary */}
                <div style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e9ecef'
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        alignItems: 'stretch',
                        marginBottom: '1rem'
                    }}>
                        {/* Date Selector */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '1px solid #dee2e6',
                            paddingRight: '2rem',
                            minWidth: '200px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <button onClick={() => changeMonth(-1)} style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: '0',
                                    margin: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'background 0.2s',
                                    color: '#212529'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#e9ecef'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                </button>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#212529', whiteSpace: 'nowrap', lineHeight: '1', paddingBottom: '2px' }}>
                                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                                </h2>
                                <button onClick={() => changeMonth(1)} style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: '0',
                                    margin: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'background 0.2s',
                                    color: '#212529'
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#e9ecef'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Summary Graph */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

                    {/* New Entry Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            {t('newEntry')}
                        </button>
                    </div>
                </div>

                {/* Transaction Table */}
                <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>{t('date')}</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>{t('description')}</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>{t('amount')}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>{t('type')}</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>{t('method')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(tx => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(tx.date.seconds * 1000).toLocaleDateString()}</td>
                                    <td
                                        style={{ padding: '1rem', cursor: 'pointer', color: 'var(--primary-color)', fontWeight: '500' }}
                                        onClick={() => handleEdit(tx)}
                                    >
                                        {tx.description}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: tx.type === 'income' ? 'var(--success-color)' : 'var(--text-color)' }}>
                                        {formatCurrency(tx.amount)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            background: tx.type === 'income' ? '#dcfce7' : '#fee2e2',
                                            color: tx.type === 'income' ? '#166534' : '#991b1b'
                                        }}>
                                            {t(tx.type)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{t(tx.method)}</td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#6c757d' }}>
                                        {t('noTransactions')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={showForm}
                onClose={handleClose}
                title={editingTransaction ? t('updateTransaction') : t('newTransaction')}
            >
                <TransactionForm
                    initialData={editingTransaction}
                    onTransactionAdded={() => {
                        onTransactionAdded();
                        handleClose();
                    }}
                    onTransactionUpdated={() => {
                        onTransactionAdded();
                        handleClose();
                    }}
                    onTransactionDeleted={() => {
                        onTransactionAdded();
                        handleClose();
                    }}
                    onClose={handleClose}
                />
            </Modal>
        </div>
    );
};

export default TransactionsPage;
