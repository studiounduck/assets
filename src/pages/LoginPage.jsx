import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
    const { t } = useLanguage();

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            alert("Login failed. Please try again.");
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f8fafc'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%'
            }}>
                <h1 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{t('appTitle')}</h1>
                <p style={{ color: 'var(--secondary-color)', marginBottom: '2rem' }}>{t('loginMessage')}</p>

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#374151',
                        transition: 'background 0.2s'
                    }}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        style={{ width: '20px', height: '20px' }}
                    />
                    {t('signInGoogle')}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
