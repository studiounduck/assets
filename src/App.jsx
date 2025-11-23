import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, onSnapshot as onDocSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import { calculateFinancials } from './utils/accounting';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import TransactionsPage from './pages/TransactionsPage';
import FinancialStatementPage from './pages/FinancialStatementPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';
import SearchResultsPage from './pages/SearchResultsPage';
import './index.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [userApproved, setUserApproved] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [transactions, setTransactions] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTransactions([]);
        setFinancials(null);
        setUserApproved(false);
        setUserRole('user');
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to user document for approval status
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onDocSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserApproved(userData.approved || false);
        setUserRole(userData.role || 'user');
      } else {
        setUserApproved(false);
        setUserRole('user');
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !userApproved) return;

    setLoading(true);
    // Subscribe to transactions collection
    const q = query(collection(db, `users/${user.uid}/transactions`), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(txs);

      // Calculate financials whenever transactions change
      const calculated = calculateFinancials(txs);
      setFinancials(calculated);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userApproved]);

  if (loading && !user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (!userApproved) {
    return (
      <BrowserRouter>
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
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              승인 대기 중
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
              관리자 승인을 기다리고 있습니다.<br />
              승인이 완료되면 이메일로 안내드리겠습니다.
            </p>
            <button
              onClick={() => auth.signOut()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#64748b'}
            >
              로그아웃
            </button>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <DashboardPage
              transactions={transactions}
              loading={loading}
            />
          } />
          <Route path="transactions" element={
            <TransactionsPage
              transactions={transactions}
              loading={loading}
            />
          } />
          <Route path="financial-statements" element={
            <FinancialStatementPage
              financials={financials}
              transactions={transactions}
              loading={loading}
            />
          } />
          <Route path="search" element={<SearchResultsPage />} />
          {userRole === 'admin' && (
            <Route path="admin" element={<AdminPage />} />
          )}
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
