import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminNotifications } from './AdminNotifications';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    getNotifications: vi.fn(),
    getAllAdminExams: vi.fn(),
    createNotification: vi.fn(),
    sendNotificationNow: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

describe('AdminNotifications Page', () => {
  const mockNotifications = [
    {
      id: 'n1',
      title: 'General Update for All',
      message: 'Practice platform maintenance tonight at 2 AM.',
      targetAudience: 'all',
      channel: 'in_app' as const,
      status: 'sent' as const,
      sentAt: '2026-09-18T10:00:00Z',
      createdAt: '2026-09-18T09:00:00Z',
    },
    {
      id: 'n2',
      title: 'Pro Pass Exclusive Mock',
      message: 'New premium mock test is live for Pro aspirants.',
      targetAudience: 'pro',
      channel: 'both' as const,
      status: 'sent' as const,
      sentAt: '2026-09-18T11:00:00Z',
      createdAt: '2026-09-18T10:30:00Z',
    },
    {
      id: 'n3',
      title: 'Scheduled Festival Greeting',
      message: 'Happy Durga Puja to all candidates!',
      targetAudience: 'all',
      channel: 'both' as const,
      status: 'scheduled' as const,
      scheduledAt: '2026-10-01T08:00:00Z',
      createdAt: '2026-09-18T12:00:00Z',
    },
  ];

  const mockExams = [
    { id: 'wbp-constable', title: 'WBP Constable 2026', slug: 'wbp-constable' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getNotifications).mockResolvedValue(mockNotifications);
    vi.mocked(api.getAllAdminExams).mockResolvedValue(mockExams as any);
  });

  it('renders notifications list, audience badges, and counts', async () => {
    render(<AdminNotifications />);

    await waitFor(() => {
      expect(screen.getByText('General Update for All')).toBeInTheDocument();
      expect(screen.getByText('Pro Pass Exclusive Mock')).toBeInTheDocument();
      expect(screen.getByText('Scheduled Festival Greeting')).toBeInTheDocument();
    });

    // Check audience badges
    expect(screen.getAllByText('All Students').length).toBeGreaterThan(0);
    expect(screen.getByText('Pro Members')).toBeInTheDocument();
    // Check scheduled badge
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
  });

  it('filters notifications by status tab', async () => {
    render(<AdminNotifications />);

    await waitFor(() => {
      expect(screen.getByText('General Update for All')).toBeInTheDocument();
    });

    // Click Scheduled tab
    const scheduledTab = screen.getByRole('button', { name: /Scheduled \(1\)/i });
    fireEvent.click(scheduledTab);

    expect(screen.getByText('Scheduled Festival Greeting')).toBeInTheDocument();
    expect(screen.queryByText('General Update for All')).not.toBeInTheDocument();
  });

  it('validates scheduled datetime when Schedule for Later is selected', async () => {
    render(<AdminNotifications />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Broadcast/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /New Broadcast/i }));

    await waitFor(() => {
      expect(screen.getByText('Compose Broadcast Notification')).toBeInTheDocument();
    });

    // Fill title and message
    fireEvent.change(screen.getByPlaceholderText(/New WBP Constable Full Mock/i), {
      target: { value: 'Future Exam Alert' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter clear announcement details/i), {
      target: { value: 'Exam will start next Monday.' },
    });

    // Switch dispatch mode to scheduled
    const dispatchSelect = screen.getByRole('combobox', { name: /dispatch mode/i });
    fireEvent.change(dispatchSelect, {
      target: { value: 'scheduled' },
    });

    await waitFor(() => {
      expect(screen.getByText(/Scheduled Dispatch Date & Time \*/i)).toBeInTheDocument();
    });

    // Try submitting without setting a date
    const submitBtn = screen.getByRole('button', { name: /Save Notice/i });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Please select a scheduled date and time/i)).toBeInTheDocument();
    });
  });

  it('successfully dispatches a scheduled notification using Send Now button', async () => {
    vi.mocked(api.sendNotificationNow).mockResolvedValue(true);

    render(<AdminNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Scheduled Festival Greeting')).toBeInTheDocument();
    });

    const sendNowBtn = screen.getByRole('button', { name: /Send Now/i });
    fireEvent.click(sendNowBtn);

    expect(api.sendNotificationNow).toHaveBeenCalledWith('n3');
  });
});
