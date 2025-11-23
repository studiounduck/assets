import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersData = [];
            querySnapshot.forEach((doc) => {
                usersData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            // Sort: pending first, then by created date
            usersData.sort((a, b) => {
                if (a.approved === b.approved) {
                    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
                }
                return a.approved ? 1 : -1;
            });
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                approved: true,
                approvedAt: new Date(),
                approvedBy: currentUser.uid
            });
            fetchUsers();
        } catch (error) {
            console.error('Error approving user:', error);
            alert('사용자 승인에 실패했습니다.');
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm('이 사용자를 거부하시겠습니까?')) return;

        try {
            await updateDoc(doc(db, 'users', userId), {
                approved: false,
                approvedAt: null,
                approvedBy: null
            });
            fetchUsers();
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('사용자 거부에 실패했습니다.');
        }
    };

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`이 사용자를 ${newRole}으로 변경하시겠습니까?`)) return;

        try {
            await updateDoc(doc(db, 'users', userId), {
                role: newRole
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('역할 변경에 실패했습니다.');
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.125rem',
                color: '#64748b'
            }}>
                로딩 중...
            </div>
        );
    }

    const pendingUsers = users.filter(u => !u.approved);
    const approvedUsers = users.filter(u => u.approved);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>
                사용자 관리
            </h1>

            {/* Pending Users Section */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
                    승인 대기 중 ({pendingUsers.length})
                </h2>
                {pendingUsers.length === 0 ? (
                    <div style={{
                        padding: '2rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#64748b'
                    }}>
                        승인 대기 중인 사용자가 없습니다.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {pendingUsers.map(user => (
                            <div key={user.id} style={{
                                background: 'white',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                                border: '2px solid #fbbf24'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                                            {user.email}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            가입일: {formatDate(user.createdAt)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleApprove(user.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                                        >
                                            승인
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                        >
                                            거부
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approved Users Section */}
            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
                    승인된 사용자 ({approvedUsers.length})
                </h2>
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                                    이메일
                                </th>
                                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                                    역할
                                </th>
                                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                                    승인일
                                </th>
                                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>
                                    작업
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvedUsers.map((user, idx) => (
                                <tr key={user.id} style={{ borderBottom: idx < approvedUsers.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1e293b' }}>
                                        {user.email}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                                            color: user.role === 'admin' ? '#1e40af' : '#374151',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {user.role === 'admin' ? '관리자' : '사용자'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        {formatDate(user.approvedAt)}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleToggleRole(user.id, user.role)}
                                            disabled={user.id === currentUser.uid}
                                            style={{
                                                padding: '0.375rem 0.75rem',
                                                background: user.id === currentUser.uid ? '#e5e7eb' : '#3b82f6',
                                                color: user.id === currentUser.uid ? '#9ca3af' : 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                cursor: user.id === currentUser.uid ? 'not-allowed' : 'pointer',
                                                marginRight: '0.5rem',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => user.id !== currentUser.uid && (e.currentTarget.style.background = '#2563eb')}
                                            onMouseLeave={(e) => user.id !== currentUser.uid && (e.currentTarget.style.background = '#3b82f6')}
                                        >
                                            {user.role === 'admin' ? '사용자로 변경' : '관리자로 변경'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(user.id)}
                                            disabled={user.id === currentUser.uid}
                                            style={{
                                                padding: '0.375rem 0.75rem',
                                                background: user.id === currentUser.uid ? '#e5e7eb' : '#ef4444',
                                                color: user.id === currentUser.uid ? '#9ca3af' : 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                cursor: user.id === currentUser.uid ? 'not-allowed' : 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => user.id !== currentUser.uid && (e.currentTarget.style.background = '#dc2626')}
                                            onMouseLeave={(e) => user.id !== currentUser.uid && (e.currentTarget.style.background = '#ef4444')}
                                        >
                                            승인 취소
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
