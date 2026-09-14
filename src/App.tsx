import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from '@/components/layout/ProtectedRoute';

// Public Landing Page
import { Landing } from '@/pages/Landing';

// Student Core Pages
import { Home } from '@/pages/student/Home';
import { ExamsCatalog } from '@/pages/student/ExamsCatalog';
import { ExamDetail } from '@/pages/student/ExamDetail';
import { ExamOrTestDispatcher } from '@/pages/student/ExamOrTestDispatcher';
import { TestRunner } from '@/pages/student/TestRunner';
import { TestResult } from '@/pages/student/TestResult';
import { TestSolutions } from '@/pages/student/TestSolutions';
import { Practice } from '@/pages/student/Practice';
import { MyTests } from '@/pages/student/MyTests';
import { Profile } from '@/pages/student/Profile';
import { Settings } from '@/pages/student/Settings';
import { Subscription } from '@/pages/student/Subscription';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminExams } from '@/pages/admin/AdminExams';
import { AdminSubjects } from '@/pages/admin/AdminSubjects';
import { AdminChapters } from '@/pages/admin/AdminChapters';
import { AdminTestSeries } from '@/pages/admin/AdminTestSeries';
import { AdminTests } from '@/pages/admin/AdminTests';
import { AdminTestQuestions } from '@/pages/admin/AdminTestQuestions';
import { AdminQuestions } from '@/pages/admin/AdminQuestions';
import { AdminSubscriptions } from '@/pages/admin/AdminSubscriptions';

/**
 * RootRoute:
 * - If user is not authenticated: renders public Landing Page
 * - If user is student: redirects to /dashboard (Student Panel)
 * - If user is admin: redirects to /admin (Admin Panel)
 */
const RootRoute: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <Landing />;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Root Route (Landing for guests, redirects to appropriate panel if logged in) */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/landing" element={<Landing />} />

        {/* Student App Layout Routes (Standard Navbar & Bottom Nav) */}
        <Route element={<AppLayout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="home" element={<Navigate to="/dashboard" replace />} />
          <Route path="app" element={<Navigate to="/dashboard" replace />} />

          {/* Exams Hub & Catalog */}
          <Route path="exams" element={<ExamsCatalog />} />
          <Route path="exams/:id" element={<ExamOrTestDispatcher />} />
          <Route path="exams/:examId/:tab" element={<ExamDetail />} />

          {/* Legacy redirects */}
          <Route path="tests" element={<Navigate to="/exams" replace />} />
          <Route path="tests/*" element={<Navigate to="/exams" replace />} />
          <Route path="my-tests" element={<Navigate to="/results" replace />} />
          <Route path="my-tests/*" element={<Navigate to="/results" replace />} />

          <Route
            path="exams/:testId/results/:attemptId"
            element={
              <ProtectedRoute>
                <TestResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="exams/:testId/solutions/:attemptId"
            element={
              <ProtectedRoute>
                <TestSolutions />
              </ProtectedRoute>
            }
          />
          <Route path="practice" element={<Practice />} />
          <Route path="practice/*" element={<Practice />} />
          <Route
            path="results"
            element={
              <ProtectedRoute>
                <MyTests />
              </ProtectedRoute>
            }
          />
          <Route
            path="results/*"
            element={
              <ProtectedRoute>
                <MyTests />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="subscription" element={<Subscription />} />
        </Route>

      {/* Standalone Fullscreen Test Runner (Distraction-free, dedicated exam header) */}
      <Route
        path="/exams/:testId/runner"
        element={
          <ProtectedRoute>
            <TestRunner />
          </ProtectedRoute>
        }
      />

      {/* Auth Public-Only Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="exams" element={<AdminExams />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="chapters" element={<AdminChapters />} />
        <Route path="test-series" element={<AdminTestSeries />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="tests/:testId/questions" element={<AdminTestQuestions />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
