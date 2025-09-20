import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, register as apiRegister, getMe, AuthUser } from '../api/auth';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        console.log('[AuthContext] useEffect token:', token);
        if (token) {
            getMe(token)
                .then(user => {
                    console.log('[AuthContext] getMe success:', user);
                    setUser(user);
                })
                .catch((err) => {
                    console.log('[AuthContext] getMe error:', err);
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    console.log('[AuthContext] setLoading(false)');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const loginMutation = useMutation({
        mutationFn: (data: { email: string; password: string }) => apiLogin(data.email, data.password),
        onSuccess: (data) => {
            setToken(data.token);
            localStorage.setItem('token', data.token);
            setError(null);
            queryClient.clear();
        },
        onError: (err: any) => setError(err.message),
    });

    const registerMutation = useMutation({
        mutationFn: (data: { email: string; password: string }) => apiRegister(data.email, data.password),
        onSuccess: (data) => {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            setError(null);
            queryClient.clear();
        },
        onError: (err: any) => setError(err.message),
    });

    const loginHandler = async (email: string, password: string) => {
        setError(null);
        console.log('[AuthContext] loginHandler called', email);
        const data = await loginMutation.mutateAsync({ email, password });
        console.log('[AuthContext] loginMutation result:', data);
        // Fetch user info after login
        if (data.token) {
            const user = await getMe(data.token);
            console.log('[AuthContext] getMe after login:', user);
            setUser(user);
        }
    };
    const registerHandler = async (email: string, password: string) => {
        setError(null);
        await registerMutation.mutateAsync({ email, password });
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        queryClient.clear();
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user && !!token, login: loginHandler, register: registerHandler, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

// Alias for compatibility with existing code
export const useAuthContext = useAuth;
