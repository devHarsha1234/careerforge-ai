import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, User, LogOut, LayoutDashboard, BookOpen, Sparkles, 
  Map, Briefcase, Activity, ShieldCheck, ChevronRight, ChevronDown, FileText, Settings 
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const primaryLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={15} /> },
    { name: 'Learn', path: '/learn', icon: <BookOpen size={15} /> },
    { name: 'Practice', path: '/practice', icon: <Sparkles size={15} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <Map size={15} /> },
    { name: 'Jobs', path: '/jobs', icon: <Briefcase size={15} /> },
  ];

  const moreLinks = [
    { name: 'Resume Builder', path: '/resume', icon: <FileText size={15} /> },
    { name: 'Progress', path: '/progress', icon: <Activity size={15} /> },
    { name: 'Assessment', path: '/assessment', icon: <ShieldCheck size={15} /> },
    { name: 'Profile', path: '/profile', icon: <User size={15} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={15} /> },
  ];

  const isMoreActive = moreLinks.some(l => isActive(l.path));

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[68px]">
          {/* Brand Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
              <span className="font-heading font-extrabold text-sm tracking-wider text-white">CF</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg text-slate-900 tracking-tight">CareerForge</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">AI</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block -mt-0.5">Career Readiness Platform</span>
            </div>
          </Link>

          {/* Desktop Nav - Public */}
          {!user && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                How It Works
              </Link>
              <div className="h-4 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  Sign In
                </Link>
                <Link to="/signup" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all">
                  <span>Get Started Free</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* Desktop Nav - Authenticated */}
          {user && (
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200">
                {primaryLinks.map(link => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        active 
                          ? 'text-indigo-700 bg-white shadow-soft-sm font-bold border border-slate-200/80' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{link.icon}</span>
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                {/* More Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(!moreOpen);
                      setDropdownOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isMoreActive || moreOpen
                        ? 'text-indigo-700 bg-white shadow-soft-sm font-bold border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown size={13} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-soft-md p-1.5 z-50"
                      >
                        {moreLinks.map(m => {
                          const active = isActive(m.path);
                          return (
                            <Link
                              key={m.path}
                              to={m.path}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                active
                                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{m.icon}</span>
                              <span>{m.name}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* User Avatar & Menu */}
              <div className="relative ml-1">
                <button 
                  type="button"
                  aria-label="User account menu"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setMoreOpen(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate hidden xl:inline">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-soft-md overflow-hidden p-1.5 z-50"
                    >
                      <div className="px-3.5 py-3 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                        {user.target_role && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200">
                            <Briefcase size={10} />
                            <span>{user.target_role}</span>
                          </div>
                        )}
                      </div>
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <User size={14} className="text-slate-500" />
                        <span>Profile & Preferences</span>
                      </Link>
                      <Link 
                        to="/resume" 
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <FileText size={14} className="text-slate-500" />
                        <span>Resume Builder</span>
                      </Link>
                      <Link 
                        to="/progress" 
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Activity size={14} className="text-slate-500" />
                        <span>Your Progress</span>
                      </Link>
                      <button 
                        type="button"
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left mt-1"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            {user && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 p-2 rounded-xl bg-slate-100 border border-slate-200"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 overflow-hidden shadow-soft-sm"
          >
            <div className="px-4 py-4 space-y-2">
              {!user ? (
                <>
                  <Link to="/how-it-works" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100">
                    How It Works
                  </Link>
                  <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Sign In
                  </Link>
                  <Link to="/signup" className="block px-4 py-3 rounded-xl text-sm font-bold bg-indigo-600 text-white text-center shadow-sm">
                    Get Started Free
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="text-xs text-indigo-700 font-semibold mt-1">Track: {user.target_role || 'Software Development'}</p>
                  </div>
                  {[...primaryLinks, ...moreLinks].map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive(link.path) ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  ))}
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <button 
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
