import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthForm: React.FC<AuthFormProps> = ({ mode, onModeChange }) => {
  const { login, register, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const validate = () => {
    if (!emailRegex.test(email)) return 'Please enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const validation = validate();
    if (validation) {
      setFormError(validation);
      return;
    }
    try {
      if (mode === 'login') {
        console.log('[AuthForm] calling login', email);
        await login(email, password);
        console.log('[AuthForm] login finished');
      } else {
        console.log('[AuthForm] calling register', email);
        await register(email, password);
        console.log('[AuthForm] register finished');
      }
    } catch (err: any) {
      console.log('[AuthForm] error:', err);
      // error is handled by AuthContext
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded shadow">
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 rounded-t ${mode === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => onModeChange('login')}
        >
          Login
        </button>
        <button
          className={`flex-1 py-2 rounded-t ${mode === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => onModeChange('register')}
        >
          Register
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          className="border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          className="border rounded px-3 py-2"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {(formError || error) && (
          <div className="text-red-500 text-sm">{formError || error}</div>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
