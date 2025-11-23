import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import './TransactionForm.css';

const TransactionForm = ({ onTransactionAdded, initialData, onTransactionUpdated, onTransactionDeleted, onClose }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        method: 'card'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                date: new Date(initialData.date.seconds * 1000).toISOString().split('T')[0],
                amount: initialData.amount.toString(),
                description: initialData.description,
                type: initialData.type,
                method: initialData.method
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAmountChange = (e) => {
        // Remove non-numeric chars
        let value = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({
            ...prev,
            amount: value
        }));
    };

    // Helper to display formatted amount
    const getDisplayAmount = () => {
        if (!formData.amount) return '';
        return Number(formData.amount).toLocaleString();
    };

    const handleDelete = async () => {
        if (!initialData || !auth.currentUser) return;

        if (window.confirm(t('confirmDelete'))) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, `users/${auth.currentUser.uid}/transactions`, initialData.id));
                if (onTransactionDeleted) onTransactionDeleted();
                alert(t('successDelete'));
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert(t('errorDelete'));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert("Please sign in to add transactions.");
            return;
        }

        setLoading(true);

        try {
            const transactionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                date: Timestamp.fromDate(new Date(formData.date)),
            };

            if (initialData) {
                // Update existing transaction
                await updateDoc(doc(db, `users/${auth.currentUser.uid}/transactions`, initialData.id), {
                    ...transactionData,
                    updatedAt: Timestamp.now()
                });
                if (onTransactionUpdated) onTransactionUpdated();
                alert(t('successUpdate'));
            } else {
                // Add new transaction
                await addDoc(collection(db, `users/${auth.currentUser.uid}/transactions`), {
                    ...transactionData,
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
            }
        } catch (error) {
            console.error("Error saving document: ", error);
            alert(initialData ? t('errorUpdate') : t('errorAdd'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <h2 className="modal-title">{initialData ? t('updateTransaction') : t('newTransaction')}</h2>
                <button className="close-btn" onClick={onClose}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">{t('date')}</label>
                    <input
                        type="date"
                        className="form-input"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">{t('description')}</label>
                    <input
                        type="text"
                        className="form-input"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g. Office Supplies"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">{t('amount')}</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            className="form-input"
                            name="amount"
                            value={getDisplayAmount()}
                            onChange={handleAmountChange}
                            placeholder="0"
                            style={{ textAlign: 'right', paddingRight: '35px' }}
                            required
                        />
                        <span className="currency-unit">원</span>
                    </div>
                </div>

                <div className="row-group">
                    <div className="form-group">
                        <label className="form-label">{t('type')}</label>
                        <select className="form-input" name="type" value={formData.type} onChange={handleChange}>
                            <option value="expense">{t('expense')}</option>
                            <option value="income">{t('income')}</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('paymentMethod')}</label>
                        <select className="form-input" name="method" value={formData.method} onChange={handleChange}>
                            <option value="card">{t('card')}</option>
                            <option value="cash">{t('cash')}</option>
                        </select>
                    </div>
                </div>

                <div className="modal-footer">
                    {initialData ? (
                        <button type="button" className="btn-delete" onClick={handleDelete}>
                            {t('deleteTransaction')}
                        </button>
                    ) : (
                        <div></div> // Spacer for alignment if no delete button
                    )}
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? (initialData ? t('save') : t('adding')) : (initialData ? t('save') : t('addTransaction'))}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;
