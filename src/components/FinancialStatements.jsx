import React, { useState } from 'react';
import { ACCOUNT_NAMES } from '../utils/accounting';
import { useLanguage } from '../context/LanguageContext';
import './FinancialStatements.css';

const FinancialStatements = ({ financials }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('is'); // is, bs, cf

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    };

    const renderIncomeStatement = () => {
        const { revenue, expenses, netIncome } = financials.incomeStatement;
        return (
            <div className="statement">
                <h3>{t('incomeStatement')} ({t('incomeStatement')})</h3>
                <div className="statement-row">
                    <span>{t('revenue')}</span>
                    <span>{formatCurrency(revenue)}</span>
                </div>
                <div className="statement-row">
                    <span>{t('expenses')}</span>
                    <span>{formatCurrency(expenses)}</span>
                </div>
                <div className="statement-row total">
                    <span>{t('netIncome')}</span>
                    <span className={netIncome >= 0 ? 'positive' : 'negative'}>{formatCurrency(netIncome)}</span>
                </div>
            </div>
        );
    };

    const renderBalanceSheet = () => {
        const { assets, liabilities, equity } = financials.balanceSheet;
        return (
            <div className="statement">
                <h3>{t('balanceSheet')} ({t('balanceSheet')})</h3>

                <div className="section">
                    <h4>{t('assets')}</h4>
                    {Object.entries(assets.breakdown).map(([name, value]) => (
                        <div key={name} className="statement-row sub-row">
                            <span>{name}</span>
                            <span>{formatCurrency(value)}</span>
                        </div>
                    ))}
                    <div className="statement-row total">
                        <span>{t('totalAssets')}</span>
                        <span>{formatCurrency(assets.total)}</span>
                    </div>
                </div>

                <div className="section">
                    <h4>{t('liabilities')}</h4>
                    {Object.entries(liabilities.breakdown).map(([name, value]) => (
                        <div key={name} className="statement-row sub-row">
                            <span>{name}</span>
                            <span>{formatCurrency(value)}</span>
                        </div>
                    ))}
                    <div className="statement-row total">
                        <span>{t('totalLiabilities')}</span>
                        <span>{formatCurrency(liabilities.total)}</span>
                    </div>
                </div>

                <div className="section">
                    <h4>{t('equity')}</h4>
                    {Object.entries(equity.breakdown).map(([name, value]) => (
                        <div key={name} className="statement-row sub-row">
                            <span>{name}</span>
                            <span>{formatCurrency(value)}</span>
                        </div>
                    ))}
                    <div className="statement-row total">
                        <span>{t('totalEquity')}</span>
                        <span>{formatCurrency(equity.total)}</span>
                    </div>
                </div>

                <div className="check-row">
                    <small>{t('check')}: {t('assets')} ({formatCurrency(assets.total)}) = L+E ({formatCurrency(liabilities.total + equity.total)})</small>
                </div>
            </div>
        );
    };

    const renderCashFlow = () => {
        const { operating } = financials.cashFlow;
        return (
            <div className="statement">
                <h3>{t('cashFlow')} ({t('cashFlow')})</h3>
                <div className="statement-row">
                    <span>{t('netCashOperating')}</span>
                    <span>{formatCurrency(operating)}</span>
                </div>
                <div className="statement-row total">
                    <span>{t('netChangeCash')}</span>
                    <span>{formatCurrency(operating)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="financial-statements">
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

            <div className="statement-content">
                {activeTab === 'is' && renderIncomeStatement()}
                {activeTab === 'bs' && renderBalanceSheet()}
                {activeTab === 'cf' && renderCashFlow()}
            </div>
        </div>
    );
};

export default FinancialStatements;
