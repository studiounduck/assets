import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { calculateFinancials } from './utils/accounting';
import TransactionForm from './components/TransactionForm';
import FinancialStatements from './components/FinancialStatements';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import './index.css';

function AppContent() {
  const [transactions, setTransactions] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    // Subscribe to transactions collection
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
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
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="app-container">
      <header style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <button
            onClick={toggleLanguage}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {language === 'ko' ? 'English' : '한국어'}
          </button>
        </div>
        <h1 style={{ margin: 0, color: 'var(--primary-color)' }}>{t('appTitle')}</h1>
        <p style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }}>{t('appSubtitle')}</p>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <section>
            <TransactionForm />
          </section>

          <section>
            {loading ? (
              <p>{t('loading')}</p>
            ) : financials ? (
              <FinancialStatements financials={financials} />
            ) : (
              <p>{t('noData')}</p>
            )}
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h3>{t('recentTransactions')}</h3>
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>{t('date')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>{t('description')}</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>{t('amount')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('type')}</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>{t('method')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>{new Date(tx.date.seconds * 1000).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>{tx.description}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: tx.type === 'income' ? 'var(--success-color)' : 'var(--text-color)' }}>
                        {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(tx.amount)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          background: tx.type === 'income' ? '#dcfce7' : '#fee2e2',
                          color: tx.type === 'income' ? '#166534' : '#991b1b'
                        }}>
                          {t(tx.type)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>{t(tx.method)}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary-color)' }}>
                        {t('noTransactions')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
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
