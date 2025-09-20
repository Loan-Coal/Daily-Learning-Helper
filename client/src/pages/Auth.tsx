import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('[AuthPage] useEffect', { user, loading });
        if (!loading && user) {
            console.log('[AuthPage] navigating to /');
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        console.log('[AuthPage] loading...');
        return null; // or a spinner
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <AuthForm mode={mode} onModeChange={setMode} />
        </div>
    );
};

export default AuthPage;
