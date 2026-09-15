import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from '@/components/layout/ProtectedRoute';

const Landing = React.lazy(() =>
  import('@/pages/Landing').then((module) => ({ default: module.Landing }))
);
const Home = React.lazy(() =>
  import('@/pages/student/Home').then((module) => ({ default: module.Home }))
);
const ExamsCatalog = React.lazy(() =>
  import('@/pages/student/ExamsCatalog').then((module) => ({ default: module.ExamsCatalog }))
);
const ExamDetail = React.lazy(() =>
  import('@/pages/student/ExamDetail').then((module) => ({ default: module.ExamDetail }))
);
const ExamOrTestDispatcher = React.lazy(() =>
  import('@/pages/student/ExamOrTestDispatcher').then((module) => ({
    default: module.ExamOrTestDispatcher,
  }))
);
const TestRunner = React.lazy(() =>
  import('@/pages/student/TestRunner').then((module) => ({ default: module.TestRunner }))
);
const TestResult = React.lazy(() =>
  import('@/pages/student/TestResult').then((module) => ({ default: module.TestResult }))
);
const TestSolutions = React.lazy(() =>
  import('@/pages/student/TestSolutions').then((module) => ({ default: module.TestSolutions }))
);
const Practice = React.lazy(() =>
  import('@/pages/student/Practice').then((module) => ({ default: module.Practice }))
);
const MyTests = React.lazy(() =>
  import('@/pages/student/MyTests').then((module) => ({ default: module.MyTests }))
);
const Profile = React.lazy(() =>
  import('@/pages/student/Profile').then((module) => ({ default: module.Profile }))
);
const Settings = React.lazy(() =>
  import('@/pages/student/Settings').then((module) => ({ default: module.Settings }))
);
const Subscription = React.lazy(() =>
  import('@/pages/student/Subscription').then((module) => ({ default: module.Subscription }))
);
const Login = React.lazy(() =>
  import('@/pages/auth/Login').then((module) => ({ default: module.Login }))
);
const Register = React.lazy(() =>
  import('@/pages/auth/Register').then((module) => ({ default: module.Register }))
);
const ForgotPassword = React.lazy(() =>
  import('@/pages/auth/ForgotPassword').then((module) => ({ default: module.ForgotPassword }))
);
const AdminDashboard = React.lazy(() =>
  import('@/pages/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard }))
);
const AdminExams = React.lazy(() =>
  import('@/pages/admin/AdminExams').then((module) => ({ default: module.AdminExams }))
);
const AdminSubjects = React.lazy(() =>
  import('@/pages/admin/AdminSubjects').then((module) => ({ default: module.AdminSubjects }))
);
const AdminChapters = React.lazy(() =>
  import('@/pages/admin/AdminChapters').then((module) => ({ default: module.AdminChapters }))
);
const AdminExamTopics = React.lazy(() =>
  import('@/pages/admin/AdminExamTopics').then((module) => ({ default: module.AdminExamTopics }))
);
const AdminTestSeries = React.lazy(() =>
  import('@/pages/admin/AdminTestSeries').then((module) => ({ default: module.AdminTestSeries }))
);
const AdminTests = React.lazy(() =>
  import('@/pages/admin/AdminTests').then((module) => ({ default: module.AdminTests }))
);
const AdminTestQuestions = React.lazy(() =>
  import('@/pages/admin/AdminTestQuestions').then((module) => ({
    default: module.AdminTestQuestions,
  }))
);
const AdminQuestions = React.lazy(() =>
  import('@/pages/admin/AdminQuestions').then((module) => ({ default: module.AdminQuestions }))
);
const AdminSubscriptions = React.lazy(() =>
  import('@/pages/admin/AdminSubscriptions').then((module) => ({
    default: module.AdminSubscriptions,
  }))
);

/**
 * RootRoute:
 * - Always displays the public Landing Page at https://practicekoro.online/
 * - If user is logged in, Landing Page dynamically displays Dashboard button instead of Login/Get Started
 */
const RootRoute: React.FC = () => {
  return <Landing />;
};

export const App: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"
            aria-label="Loading page"
          />
        </div>
      }
    >
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
          <Route path="exams/:examId/full-mock" element={<ExamDetail />} />
          <Route path="exams/:examId/pyq" element={<ExamDetail />} />
          <Route path="exams/:examId/topic-tests" element={<ExamDetail />} />

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
          <Route path="exam-topics" element={<AdminExamTopics />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="topics" element={<AdminChapters />} />
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
    </React.Suspense>
  );
};
