import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <Link to="/" className="text-xl font-bold text-blue-600">Daily Learning Helper</Link>
      <div className="flex items-center gap-6">
        {user && (
          <>
            <Link to="/library" className="hover:text-blue-600">Library</Link>
            <Link to="/quiz" className="hover:text-blue-600">Quiz</Link>
            <Link to="/upload" className="hover:text-blue-600">Upload</Link>
            <Link to="/calendar" className="hover:text-blue-600">Calendar</Link>
          </>
        )}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
