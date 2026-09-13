import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from '@/components/layout/ProtectedRoute';

// Student Pages
import { Home } from '@/pages/student/Home';
import { Tests } from '@/pages/student/Tests';
import { Practice } from '@/pages/student/Practice';
import { MyTests } from '@/pages/student/MyTests';
import { Profile } from '@/pages/student/Profile';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminExams } from '@/pages/admin/AdminExams';
import { AdminSubjects } from '@/pages/admin/AdminSubjects';
import { AdminChapters } from '@/pages/admin/AdminChapters';
import { AdminTests } from '@/pages/admin/AdminTests';
import { AdminQuestions } from '@/pages/admin/AdminQuestions';
import { AdminSubscriptions } from '@/pages/admin/AdminSubscriptions';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Student App Layout Routes */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="tests" element={<Tests />} />
        <Route path="practice" element={<Practice />} />
        <Route
          path="my-tests"
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
      </Route>

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
        <Route path="tests" element={<AdminTests />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
