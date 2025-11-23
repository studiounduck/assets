import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);

        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                approved: false,
                role: 'user',
                createdAt: new Date(),
                approvedAt: null,
                approvedBy: null
            });

            setSuccess(true);

            // Sign out the user after signup
            await auth.signOut();

        } catch (err) {
            console.error('Signup error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('이미 사용 중인 이메일입니다.');
            } else if (err.code === 'auth/invalid-email') {
                setError('유효하지 않은 이메일 주소입니다.');
            } else {
                setError('회원가입에 실패했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
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
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '3rem',
                    maxWidth: '500px',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#d1fae5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
                        회원가입이 완료되었습니다
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                        관리자 승인 후 서비스를 이용하실 수 있습니다.<br />
                        승인이 완료되면 이메일로 안내드리겠습니다.
                    </p>
                    <Link
                        to="/login"
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.75rem',
                            background: '#667eea',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                    >
                        로그인 페이지로 이동
                    </Link>
                </div>
            </div>
        );
    }

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
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                padding: '2.5rem',
                maxWidth: '400px',
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#1e293b',
                    marginBottom: '0.5rem',
                    textAlign: 'center'
                }}>
                    회원가입
                </h1>
                <p style={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    계정을 생성하고 관리자 승인을 기다려주세요
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

                <form onSubmit={handleSignup}>
                    <div style={{ marginBottom: '1.5rem' }}>
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

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            비밀번호 확인
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#5568d3')}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#667eea')}
                    >
                        {loading ? '처리 중...' : '회원가입'}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#64748b'
                }}>
                    이미 계정이 있으신가요?{' '}
                    <Link
                        to="/login"
                        style={{
                            color: '#667eea',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
