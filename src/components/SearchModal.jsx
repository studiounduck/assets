import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            onClose();
            setSearchQuery('');
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                zIndex: 1000,
                paddingTop: '20vh',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    width: '90%',
                    maxWidth: '600px',
                    animation: 'slideDown 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                        거래 내역 검색
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSearch}>
                    <div style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                검색어
                            </label>
                            <div style={{ position: 'relative' }}>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#9ca3af"
                                    strokeWidth="2"
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }}
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="거래 내용을 검색하세요..."
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
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
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                                거래 내용, 카테고리, 메모 등을 검색할 수 있습니다
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={!searchQuery.trim()}
                            style={{
                                padding: '0.5rem 1.5rem',
                                background: searchQuery.trim() ? '#667eea' : '#9ca3af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => searchQuery.trim() && (e.currentTarget.style.background = '#5568d3')}
                            onMouseLeave={(e) => searchQuery.trim() && (e.currentTarget.style.background = '#667eea')}
                        >
                            검색
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default SearchModal;
