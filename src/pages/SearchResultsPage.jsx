import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const searchQuery = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allTransactions, setAllTransactions] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (allTransactions.length > 0) {
            performSearch();
        }
    }, [searchQuery, allTransactions]);

    const fetchTransactions = async () => {
        if (!auth.currentUser) return;

        try {
            const q = query(
                collection(db, `users/${auth.currentUser.uid}/transactions`),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            const txs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllTransactions(txs);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const performSearch = () => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = allTransactions.filter(tx => {
            return (
                tx.description?.toLowerCase().includes(lowerQuery) ||
                tx.category?.toLowerCase().includes(lowerQuery) ||
                tx.note?.toLowerCase().includes(lowerQuery) ||
                tx.paymentMethod?.toLowerCase().includes(lowerQuery)
            );
        });
        setResults(filtered);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₩${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                fontSize: '1.125rem',
                color: '#64748b'
            }}>
                검색 중...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#667eea',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#5568d3'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    뒤로 가기
                </button>

                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                    검색 결과
                </h1>
                <p style={{ fontSize: '1rem', color: '#64748b' }}>
                    "<span style={{ fontWeight: '600', color: '#1e293b' }}>{searchQuery}</span>" 검색 결과 {results.length}건
                </p>
            </div>

            {/* Results */}
            {results.length === 0 ? (
                <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '4rem 2rem',
                    textAlign: 'center'
                }}>
                    <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="2"
                        style={{ margin: '0 auto 1.5rem' }}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
                        검색 결과가 없습니다
                    </h3>
                    <p style={{ color: '#94a3af', fontSize: '0.875rem' }}>
                        다른 검색어로 다시 시도해보세요
                    </p>
                </div>
            ) : (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    textTransform: 'uppercase'
                                }}>
                                    날짜
                                </th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    textTransform: 'uppercase'
                                }}>
                                    설명
                                </th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    textTransform: 'uppercase'
                                }}>
                                    카테고리
                                </th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    textTransform: 'uppercase'
                                }}>
                                    유형
                                </th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'right',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    textTransform: 'uppercase'
                                }}>
                                    금액
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((tx, idx) => (
                                <tr
                                    key={tx.id}
                                    style={{
                                        borderBottom: idx < results.length - 1 ? '1px solid #e2e8f0' : 'none',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        {formatDate(tx.date)}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>
                                        {tx.description || '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: '#f3f4f6',
                                            color: '#374151',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {tx.category || '미분류'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: tx.type === 'income' ? '#d1fae5' : '#fee2e2',
                                            color: tx.type === 'income' ? '#065f46' : '#991b1b',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {tx.type === 'income' ? '수입' : '지출'}
                                        </span>
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: tx.type === 'income' ? '#059669' : '#dc2626',
                                        textAlign: 'right'
                                    }}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
