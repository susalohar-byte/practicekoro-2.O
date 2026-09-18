import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminSettings } from './AdminSettings';
import { MaintenanceScreen } from '@/components/common/MaintenanceScreen';
import { AppLayout } from '@/components/layout/AppLayout';
import { adminApi } from '@/services/domains/admin';
import { localAppSettings } from '@/services/domains/localStore';
import { MaintenanceProvider } from '@/context/MaintenanceContext';

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock ExamContext & Layout components for AppLayout test
vi.mock('@/context/ExamContext', () => ({
  useExam: () => ({
    exams: [],
    selectedExam: null,
    setSelectedExam: vi.fn(),
  }),
}));

vi.mock('@/components/layout/StudentNavbar', () => ({
  StudentNavbar: () => <div data-testid="student-navbar">Student Navbar</div>,
}));

vi.mock('@/components/layout/StudentSidebar', () => ({
  StudentSidebar: () => <div data-testid="student-sidebar">Student Sidebar</div>,
}));

vi.mock('@/components/layout/BottomNav', () => ({
  BottomNav: () => <div data-testid="bottom-nav">Bottom Nav</div>,
}));

describe('AdminSettings & Maintenance Mode System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'usr-admin-1', fullName: 'Super Admin', email: 'admin@practicekoro.online', role: 'admin' },
      isAdmin: true,
      isStudent: false,
      loading: false,
      adminRole: 'super_admin',
      hasPermission: () => true,
    });
  });

  describe('Service Layer: Upsert & Settings Management', () => {
    it('correctly upserts a newly introduced setting that did not exist before', async () => {
      const customKey = 'custom_test_feature_key';
      const customValue = 'enabled_v2';

      // Ensure key doesn't exist yet
      expect(localAppSettings.find((s) => s.id === customKey)).toBeUndefined();

      // Perform upsert
      const res = await adminApi.updateAppSetting(customKey, customValue);
      expect(res.success).toBe(true);

      // Verify that local store has the row inserted
      const saved = localAppSettings.find((s) => s.id === customKey);
      expect(saved).toBeDefined();
      expect(saved?.value).toBe(customValue);

      // Verify getAppSettings returns the upserted row
      const allSettings = await adminApi.getAppSettings();
      const match = allSettings.find((s) => s.id === customKey);
      expect(match).toBeDefined();
      expect(match?.value).toBe(customValue);
    });

    it('returns accurate boolean for getMaintenanceMode', async () => {
      // Set maintenance mode to true
      await adminApi.updateAppSetting('sys_maintenance_mode', true);
      let isMaint = await adminApi.getMaintenanceMode();
      expect(isMaint).toBe(true);

      // Set maintenance mode to false
      await adminApi.updateAppSetting('sys_maintenance_mode', false);
      isMaint = await adminApi.getMaintenanceMode();
      expect(isMaint).toBe(false);
    });
  });

  describe('AdminSettings Component', () => {
    it('renders global settings form and saves updates', async () => {
      render(
        <MemoryRouter>
          <MaintenanceProvider>
            <AdminSettings />
          </MaintenanceProvider>
        </MemoryRouter>
      );

      // Wait for settings to load
      await waitFor(() => {
        expect(screen.getByText('Global Platform Settings')).toBeInTheDocument();
      });

      // Find Platform Name input and change it
      const appNameInput = screen.getByDisplayValue('PracticeKoro');
      fireEvent.change(appNameInput, { target: { value: 'PracticeKoro Super' } });

      // Toggle maintenance switch
      const toggle = screen.getByRole('checkbox', { hidden: true });
      fireEvent.click(toggle);

      // Submit form
      const saveBtn = screen.getByRole('button', { name: /save all settings/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText(/settings updated and saved successfully/i)).toBeInTheDocument();
      });

      // Verify updated in memory
      const allSettings = await adminApi.getAppSettings();
      const updatedName = allSettings.find((s) => s.id === 'general_app_name');
      expect(updatedName?.value).toBe('PracticeKoro Super');
    });
  });

  describe('MaintenanceScreen Component', () => {
    it('renders bilingual messages and support details', () => {
      render(
        <MemoryRouter>
          <MaintenanceProvider>
            <MaintenanceScreen />
          </MaintenanceProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('প্ল্যাটফর্ম সাময়িক রক্ষণাবেক্ষণে রয়েছে')).toBeInTheDocument();
      expect(
        screen.getByText(/Platform Maintenance & Infrastructure Upgrade in Progress/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/আবার চেষ্টা করুন/i)).toBeInTheDocument();
      expect(screen.getByText(/সাপোর্ট ইমেইল/i)).toBeInTheDocument();
      expect(screen.getByText(/জরুরি হেল্পলাইন/i)).toBeInTheDocument();
    });
  });

  describe('AppLayout Route Guarding', () => {
    it('blocks student candidate and shows MaintenanceScreen when maintenance mode is active', async () => {
      // Configure non-admin student
      mockUseAuth.mockReturnValue({
        user: { id: 'usr-student-1', fullName: 'Candidate Student', email: 'student@test.com', role: 'student' },
        isAdmin: false,
        isStudent: true,
        loading: false,
      });

      // Set maintenance mode active
      await adminApi.updateAppSetting('sys_maintenance_mode', true);

      render(
        <MemoryRouter>
          <MaintenanceProvider>
            <AppLayout />
          </MaintenanceProvider>
        </MemoryRouter>
      );

      // Should render MaintenanceScreen, blocking student layout
      await waitFor(() => {
        expect(screen.getByText('প্ল্যাটফর্ম সাময়িক রক্ষণাবেক্ষণে রয়েছে')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('student-navbar')).not.toBeInTheDocument();
    });

    it('allows admin to bypass maintenance screen and access layout', async () => {
      // Configure admin user
      mockUseAuth.mockReturnValue({
        user: { id: 'usr-admin-1', fullName: 'Super Admin', email: 'admin@practicekoro.online', role: 'admin' },
        isAdmin: true,
        isStudent: false,
        loading: false,
      });

      // Set maintenance mode active
      await adminApi.updateAppSetting('sys_maintenance_mode', true);

      render(
        <MemoryRouter>
          <MaintenanceProvider>
            <AppLayout />
          </MaintenanceProvider>
        </MemoryRouter>
      );

      // Admin should bypass maintenance screen and see student navbar
      await waitFor(() => {
        expect(screen.getByTestId('student-navbar')).toBeInTheDocument();
      });
      expect(screen.queryByText('প্ল্যাটফর্ম সাময়িক রক্ষণাবেক্ষণে রয়েছে')).not.toBeInTheDocument();
    });
  });
});
