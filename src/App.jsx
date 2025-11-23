
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import { calculateFinancials } from './utils/accounting';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Layout from './components/Layout';
import TransactionsPage from './pages/TransactionsPage';
import FinancialStatementPage from './pages/FinancialStatementPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import './index.css';

function AppContent() {
  const [user, setUser] = useState(null);
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
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  if (loading && !user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  if (!user) {
    return <LoginPage />;
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
              onTransactionAdded={() => { }}
            />
          } />
          <Route path="financial-statements" element={
            <FinancialStatementPage
              financials={financials}
              transactions={transactions}
              loading={loading}
            />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
