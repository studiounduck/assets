import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t, language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
    };

    return (
        <footer style={{
            padding: '2rem',
            color: '#94a3b8',
            fontSize: '0.9rem',
            borderTop: '1px solid #334155',
            marginTop: 'auto',
            background: '#1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <p style={{ margin: 0 }}>{t('copyright')}</p>

            <div>
                <button
                    onClick={toggleLanguage}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        textDecoration: 'underline'
                    }}
                >
                    {t('languageLabel')}: {language === 'ko' ? '한국어' : 'English'}
                </button>
            </div>
        </footer>
    );
};

export default Footer;

