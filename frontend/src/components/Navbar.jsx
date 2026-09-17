import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          Meridian
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {user?.role === 'founder' && (
            <>
              <Link to="/founder/profile" className="hover:text-signal">My profile</Link>
              <Link to="/founder/requests" className="hover:text-signal">Requests</Link>
            </>
          )}
          {(user?.role === 'investor' || user?.role === 'admin') && (
            <>
              <Link to="/vc/search" className="hover:text-signal">Discover</Link>
              <Link to="/vc/shortlist" className="hover:text-signal">Shortlist</Link>
              <Link to="/vc/pipeline" className="hover:text-signal">Pipeline</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-signal">Admin</Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l border-line pl-6">
              <span className="text-ink/50">{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary py-1">Log out</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-line pl-6">
              <Link to="/login" className="hover:text-signal">Log in</Link>
              <Link to="/register" className="btn-primary py-1">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
