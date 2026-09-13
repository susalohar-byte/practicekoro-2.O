import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  Shield,
  ChevronDown,
  Crown,
  LogOut,
  User,
  LayoutDashboard,
  Check,
  Menu,
  X
} from 'lucide-react';

export const StudentNavbar: React.FC = () => {
  const { user, role, isPro, isAdmin, logout, switchDemoRole } = useAuth();
  const { exams, selectedExam, setSelectedExam } = useExam();
  const location = useLocation();
  const navigate = useNavigate();

  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Tests', path: '/tests' },
    { label: 'Practice', path: '/practice' },
    { label: 'My Tests', path: '/my-tests' },
    { label: 'Profile', path: '/profile' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Exam Switcher */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-600/20 group-hover:bg-brand-700 transition-colors">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 leading-none tracking-tight">
                  Practice<span className="text-brand-600">Koro</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  Mock & Practice
                </span>
              </div>
            </Link>

            {/* Exam Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="text-slate-500 font-normal">Exam:</span>
                <span className="truncate max-w-[140px] font-bold">
                  {selectedExam?.title || 'Select Exam'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {examDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setExamDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Target Examination
                    </p>
                  </div>
                  {exams.map((exam) => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setSelectedExam(exam);
                        setExamDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    >
                      <span className="truncate font-semibold">{exam.title}</span>
                      {selectedExam?.id === exam.id && (
                        <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-3">
            {/* Pro Badge / Pass CTA */}
            {isPro ? (
              <Badge variant="premium" className="hidden sm:inline-flex gap-1 py-1 px-2.5 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span className="font-bold">PRO PASS</span>
              </Badge>
            ) : (
              <Button
                variant="pro"
                size="sm"
                className="hidden sm:inline-flex text-xs font-bold"
                onClick={() => navigate('/profile')}
                leftIcon={<Crown className="w-3.5 h-3.5" />}
              >
                Get Pro Pass
              </Button>
            )}

            {/* Admin Switcher / Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {user?.fullName || 'Aspirant'}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">
                    {role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Student Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-brand-700 font-semibold hover:bg-brand-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-600" />
                      Admin Control Panel
                    </Link>
                  )}

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Demo Role Switcher
                    </p>
                    <button
                      onClick={() => {
                        switchDemoRole(role === 'admin' ? 'student' : 'admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-50 font-medium"
                    >
                      Switch to {role === 'admin' ? 'Student View' : 'Admin View'}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-2">
            <div className="px-2 pb-2">
              <label className="text-[11px] font-semibold uppercase text-slate-400 px-2 block mb-1">
                Active Exam
              </label>
              <select
                value={selectedExam?.id || ''}
                onChange={(e) => {
                  const f = exams.find(x => x.id === e.target.value);
                  if (f) setSelectedExam(f);
                }}
                className="w-full text-xs font-semibold py-2 px-3 bg-slate-100 rounded-lg border border-slate-200"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 rounded-lg mx-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Open Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
