import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Bookmark, GitBranch, ShieldCheck, Inbox, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/login');
  };

  const founderLinks = [
    { to: '/founder/profile', label: 'My profile', icon: Sparkles },
    { to: '/founder/requests', label: 'Requests', icon: Inbox },
  ];
  const vcLinks = [
    { to: '/vc/search', label: 'Discover', icon: Compass },
    { to: '/vc/shortlist', label: 'Shortlist', icon: Bookmark },
    { to: '/vc/pipeline', label: 'Pipeline', icon: GitBranch },
  ];

  const links = user?.role === 'founder' ? founderLinks : user?.role === 'investor' || user?.role === 'admin' ? vcLinks : [];

  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl tracking-tight text-ink flex items-center gap-1.5" onClick={() => setOpen(false)}>
          <span className="text-signal">◆</span> Meridian
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="nav-link flex items-center gap-1.5">
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link flex items-center gap-1.5">
              <ShieldCheck size={15} strokeWidth={1.75} />
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l border-line pl-6">
              <span className="text-ink/50">{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary py-1">Log out</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-line pl-6">
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/register" className="btn-primary py-1">Sign up</Link>
            </div>
          )}
        </nav>

        <button className="md:hidden text-ink" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-line bg-paper"
          >
            <div className="flex flex-col px-6 py-4 gap-1 text-sm">
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-2 py-2.5 text-ink/80 hover:text-signal transition-colors">
                  <Icon size={16} strokeWidth={1.75} /> {label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2.5 text-ink/80 hover:text-signal transition-colors">
                  <ShieldCheck size={16} strokeWidth={1.75} /> Admin
                </Link>
              )}
              <div className="border-t border-line mt-2 pt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <span className="text-ink/50 py-1">{user.name}</span>
                    <button onClick={handleLogout} className="btn-secondary w-full">Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary w-full text-center">Log in</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full text-center">Sign up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
