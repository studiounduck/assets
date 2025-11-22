import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import './TransactionForm.css';

const TransactionForm = ({ onTransactionAdded }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        method: 'card'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, 'transactions'), {
                ...formData,
                amount: parseFloat(formData.amount),
                date: Timestamp.fromDate(new Date(formData.date)),
                createdAt: Timestamp.now()
            });

            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                type: 'expense',
                method: 'card'
            });

            if (onTransactionAdded) onTransactionAdded();
            alert(t('successAdd'));
        } catch (error) {
            console.error("Error adding document: ", error);
            alert(t('errorAdd'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="transaction-form" onSubmit={handleSubmit}>
            <h2>{t('newTransaction')}</h2>

            <div className="form-group">
                <label>{t('date')}</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>{t('description')}</label>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g. Office Supplies"
                    required
                />
            </div>

            <div className="form-group">
                <label>{t('amount')}</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>{t('type')}</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="expense">{t('expense')}</option>
                        <option value="income">{t('income')}</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>{t('paymentMethod')}</label>
                    <select name="method" value={formData.method} onChange={handleChange}>
                        <option value="card">{t('card')}</option>
                        <option value="cash">{t('cash')}</option>
                    </select>
                </div>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? t('adding') : t('addTransaction')}
            </button>
        </form>
    );
};

export default TransactionForm;
