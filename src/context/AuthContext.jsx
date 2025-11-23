import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState('user');
    const [userApproved, setUserApproved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                setUserRole('user');
                setUserApproved(false);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // Subscribe to user document for role and approval status
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setUserRole(userData.role || 'user');
                setUserApproved(userData.approved || false);
            } else {
                setUserRole('user');
                setUserApproved(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        userApproved,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
