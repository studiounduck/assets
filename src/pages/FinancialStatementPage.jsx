import React from 'react';
import FinancialStatements from '../components/FinancialStatements';
import { useLanguage } from '../context/LanguageContext';

const FinancialStatementPage = ({ financials, transactions, loading }) => {
    const { t } = useLanguage();

    if (loading) return <p>{t('loading')}</p>;
    if (!financials) return <p>{t('noData')}</p>;

    return (
        <FinancialStatements financials={financials} transactions={transactions} />
    );
};

export default FinancialStatementPage;
