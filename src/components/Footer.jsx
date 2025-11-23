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
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
            }}>
                {/* Studio Unduck Logo */}
                <img
                    src="https://studiounduck.com/favicon.png"
                    alt="studio unduck logo"
                    width="24"
                    height="24"
                    style={{ borderRadius: '4px' }}
                />
                <span>Made with</span>
                <span style={{ color: '#ef4444', fontSize: '1rem' }}>❤️</span>
                <span>by</span>
                <a
                    href="https://studiounduck.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '600',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
                >
                    studio unduck
                </a>
            </div>

            <div>
                <button
                    onClick={toggleLanguage}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        textDecoration: 'underline',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#cbd5e1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                    {t('languageLabel')}: {language === 'ko' ? '한국어 🇰🇷' : 'English 🇺🇸'}
                </button>
            </div>
        </footer>
    );
};

export default Footer;

