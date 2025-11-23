import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

const Header = () => {
    const { t, language } = useLanguage();
    const location = useLocation();



    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="logo-section">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 className="app-title">{t('appTitle')}</h1>
                    </Link>
                </div>

                <nav className="main-nav">
                    <Link to="/transactions" className={`nav-link ${isActive('/transactions')}`}>{t('navTransactions')}</Link>
                    <Link to="/financial-statements" className={`nav-link ${isActive('/financial-statements')}`}>{t('navFinancialStatements')}</Link>
                </nav>


            </div>
        </header>
    );
};

export default Header;
