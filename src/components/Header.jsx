import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SearchModal from './SearchModal';
import './Header.css';

const Header = () => {
    const { t } = useLanguage();
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const [showUserModal, setShowUserModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            setShowUserModal(false);
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <>
            <header style={{
                background: '#1e293b',
                color: 'white',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
                <div style={{
                    maxWidth: '100%',
                    margin: '0 auto',
                    padding: '0 1.5rem',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Left: Logo + Title */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            background: '#3b82f6',
                            padding: '6px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {/* Grid Icon */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                        </div>
                        <span style={{
                            fontWeight: 'bold',
                            fontSize: '1.125rem',
                            color: 'white',
                            letterSpacing: '-0.025em'
                        }}>
                            {t('appTitle')}
                        </span>
                    </Link>

                    {/* Center: Navigation */}
                    <nav style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2rem',
                        fontSize: '0.875rem'
                    }}>
                        <Link
                            to="/"
                            style={{
                                color: isActive('/') ? 'white' : '#94a3b8',
                                textDecoration: 'none',
                                fontWeight: isActive('/') ? '600' : '400',
                                transition: 'color 0.2s',
                                position: 'relative'
                            }}
                        >
                            대시보드
                            {isActive('/') && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-20px',
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: '#3b82f6'
                                }} />
                            )}
                        </Link>
                        <Link
                            to="/transactions"
                            style={{
                                color: isActive('/transactions') ? 'white' : '#94a3b8',
                                textDecoration: 'none',
                                fontWeight: isActive('/transactions') ? '600' : '400',
                                transition: 'color 0.2s',
                                position: 'relative'
                            }}
                        >
                            거래내역
                            {isActive('/transactions') && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-20px',
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: '#3b82f6'
                                }} />
                            )}
                        </Link>
                        <Link
                            to="/financial-statements"
                            style={{
                                color: isActive('/financial-statements') ? 'white' : '#94a3b8',
                                textDecoration: 'none',
                                fontWeight: isActive('/financial-statements') ? '600' : '400',
                                transition: 'color 0.2s',
                                position: 'relative'
                            }}
                        >
                            재무제표
                            {isActive('/financial-statements') && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-20px',
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: '#3b82f6'
                                }} />
                            )}
                        </Link>
                        {useAuth().userRole === 'admin' && (
                            <Link
                                to="/admin"
                                style={{
                                    color: isActive('/admin') ? 'white' : '#94a3b8',
                                    textDecoration: 'none',
                                    fontWeight: isActive('/admin') ? '600' : '400',
                                    transition: 'color 0.2s',
                                    position: 'relative'
                                }}
                            >
                                관리
                                {isActive('/admin') && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-20px',
                                        left: 0,
                                        right: 0,
                                        height: '2px',
                                        background: '#3b82f6'
                                    }} />
                                )}
                            </Link>
                        )}
                    </nav>

                    {/* Right: Icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Search Icon */}
                        <button
                            onClick={() => setShowSearchModal(true)}
                            style={{
                                background: '#334155',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </button>

                        {/* Notification Icon */}
                        <button style={{
                            background: '#334155',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            position: 'relative'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {/* TODO: Add unread count badge when message feature is implemented */}
                        </button>

                        {/* User Icon */}
                        <button
                            onClick={() => setShowUserModal(true)}
                            style={{
                                background: '#334155',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#334155'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Search Modal */}
            <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />

            {/* User Info Modal */}
            {showUserModal && (
                <div
                    onClick={() => setShowUserModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                                사용자 정보
                            </h2>
                            <button
                                onClick={() => setShowUserModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    color: '#64748b'
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* User Avatar */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #60a5fa 0%, #6366f1 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                        </div>

                        {/* User Info */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.875rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                                    이메일
                                </label>
                                <div style={{
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    color: '#1e293b'
                                }}>
                                    {currentUser?.email || '로그인 정보 없음'}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                                    사용자 ID
                                </label>
                                <div style={{
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    color: '#1e293b',
                                    fontFamily: 'monospace'
                                }}>
                                    {currentUser?.uid || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
