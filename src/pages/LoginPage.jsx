import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const checkApproval = async (user) => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            // Create user document if it doesn't exist (for Google login)
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                approved: false,
                role: 'user',
                createdAt: new Date(),
                approvedAt: null,
                approvedBy: null
            });
        }
        // Let App.jsx handle the approval check and redirect
        return true;
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            const result = await signInWithPopup(auth, googleProvider);
            await checkApproval(result.user);
        } catch (error) {
            console.error("Error signing in with Google", error);
            setError('Google 로그인에 실패했습니다.');
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await checkApproval(result.user);
        } catch (error) {
            console.error("Error signing in with email", error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError('이메일 또는 비밀번호가 잘못되었습니다.');
            } else {
                setError('로그인에 실패했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                maxWidth: '400px',
                width: '100%'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem', textAlign: 'center' }}>
                    {t('appTitle')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem', textAlign: 'center' }}>
                    {t('loginMessage')}
                </p>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        background: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            이메일
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'border 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: loading ? '#9ca3af' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '1rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#5568d3')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#667eea')}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>또는</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        transition: 'background 0.2s',
                        marginBottom: '1.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        style={{ width: '20px', height: '20px' }}
                    />
                    {t('signInGoogle')}
                </button>

                <div style={{
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#64748b'
                }}>
                    계정이 없으신가요?{' '}
                    <Link
                        to="/signup"
                        style={{
                            color: '#667eea',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
