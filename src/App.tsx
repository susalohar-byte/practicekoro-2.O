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
const Support = React.lazy(() =>
  import('@/pages/student/Support').then((module) => ({ default: module.Support }))
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
const AdminTopicManage = React.lazy(() =>
  import('@/pages/admin/AdminTopicManage').then((module) => ({ default: module.AdminTopicManage }))
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
const AdminSubscriptions = React.lazy(() =>
  import('@/pages/admin/AdminSubscriptions').then((module) => ({
    default: module.AdminSubscriptions,
  }))
);

const AdminQuestionBank = React.lazy(() =>
  import('@/pages/admin/AdminQuestionBank').then((module) => ({
    default: module.AdminQuestionBank,
  }))
);
const AdminItemAnalysis = React.lazy(() =>
  import('@/pages/admin/AdminItemAnalysis').then((module) => ({
    default: module.AdminItemAnalysis,
  }))
);
const AdminNotifications = React.lazy(() =>
  import('@/pages/admin/AdminNotifications').then((module) => ({
    default: module.AdminNotifications,
  }))
);
const AdminSupport = React.lazy(() =>
  import('@/pages/admin/AdminSupport').then((module) => ({
    default: module.AdminSupport,
  }))
);
const AdminSettings = React.lazy(() =>
  import('@/pages/admin/AdminSettings').then((module) => ({
    default: module.AdminSettings,
  }))
);
const AdminCoupons = React.lazy(() =>
  import('@/pages/admin/AdminCoupons').then((module) => ({
    default: module.AdminCoupons,
  }))
);
const AdminStaff = React.lazy(() =>
  import('@/pages/admin/AdminStaff').then((module) => ({
    default: module.AdminStaff,
  }))
);
const AdminAuditLogs = React.lazy(() =>
  import('@/pages/admin/AdminAuditLogs').then((module) => ({
    default: module.AdminAuditLogs,
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
          <Route
            path="support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
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
          {/* 1. Dashboard (Consolidated Home + Analytics) */}
          <Route index element={<AdminDashboard />} />

          {/* 2. Question Bank & Item Analysis */}
          <Route
            path="question-bank"
            element={
              <AdminRoute requiredPermission="canManageQuestions">
                <AdminQuestionBank />
              </AdminRoute>
            }
          />
          <Route
            path="item-analysis"
            element={
              <AdminRoute requiredPermission="canManageQuestions">
                <AdminItemAnalysis />
              </AdminRoute>
            }
          />

          {/* 3. Manage Exams */}
          <Route
            path="exams"
            element={
              <AdminRoute requiredPermission="canManageExams">
                <AdminExams />
              </AdminRoute>
            }
          />
          <Route
            path="exam-topics"
            element={
              <AdminRoute requiredPermission="canManageExams">
                <AdminExamTopics />
              </AdminRoute>
            }
          />

          {/* 4. Mock Test Management */}
          <Route
            path="tests"
            element={
              <AdminRoute requiredPermission="canManageTests">
                <AdminTests />
              </AdminRoute>
            }
          />
          <Route
            path="tests/:testId/questions"
            element={
              <AdminRoute requiredPermission="canManageTests">
                <AdminTestQuestions />
              </AdminRoute>
            }
          />
          <Route
            path="test-questions"
            element={
              <AdminRoute requiredPermission="canManageTests">
                <AdminTestQuestions />
              </AdminRoute>
            }
          />
          <Route
            path="test-questions/:testId"
            element={
              <AdminRoute requiredPermission="canManageTests">
                <AdminTestQuestions />
              </AdminRoute>
            }
          />

          {/* 5. Subscriptions & Pro Users */}
          <Route
            path="subscriptions"
            element={
              <AdminRoute requiredPermission="canManageSubscriptions">
                <AdminSubscriptions />
              </AdminRoute>
            }
          />
          <Route
            path="coupons"
            element={
              <AdminRoute requiredPermission="canManageCoupons">
                <AdminCoupons />
              </AdminRoute>
            }
          />
          <Route path="discounts" element={<Navigate to="/admin/coupons" replace />} />

          {/* 6. Team & Staff RBAC */}
          <Route
            path="staff"
            element={
              <AdminRoute requiredPermission="canManageStaff">
                <AdminStaff />
              </AdminRoute>
            }
          />

          {/* 7. Audit Trail Logs */}
          <Route
            path="audit-logs"
            element={
              <AdminRoute requiredPermission="canViewAuditLogs">
                <AdminAuditLogs />
              </AdminRoute>
            }
          />

          {/* 8. Notifications */}
          <Route
            path="notifications"
            element={
              <AdminRoute requiredPermission="canManageNotifications">
                <AdminNotifications />
              </AdminRoute>
            }
          />

          {/* 9. Support & Help */}
          <Route
            path="support"
            element={
              <AdminRoute requiredPermission="canManageSupport">
                <AdminSupport />
              </AdminRoute>
            }
          />

          {/* 10. Settings */}
          <Route
            path="settings"
            element={
              <AdminRoute requiredPermission="canManageSettings">
                <AdminSettings />
              </AdminRoute>
            }
          />

          {/* Backward compatibility & Consolidation Redirects */}
          <Route path="students" element={<Navigate to="/admin/subscriptions" replace />} />
          <Route path="pro-users" element={<Navigate to="/admin/subscriptions" replace />} />
          <Route path="analytics" element={<Navigate to="/admin" replace />} />
          <Route path="overview" element={<Navigate to="/admin" replace />} />
          <Route path="questions" element={<Navigate to="/admin/question-bank" replace />} />
          <Route
            path="full-mock-questions"
            element={<Navigate to="/admin/question-bank" replace />}
          />
          <Route
            path="subjects"
            element={
              <AdminRoute requiredPermission="canManageExams">
                <AdminTopicManage />
              </AdminRoute>
            }
          />
          <Route
            path="topic-manage"
            element={
              <AdminRoute requiredPermission="canManageExams">
                <AdminTopicManage />
              </AdminRoute>
            }
          />
          <Route path="topics" element={<Navigate to="/admin/topic-manage" replace />} />
          <Route path="chapters" element={<Navigate to="/admin/topic-manage" replace />} />
          <Route
            path="test-series"
            element={
              <AdminRoute requiredPermission="canManageTests">
                <AdminTestSeries />
              </AdminRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};
