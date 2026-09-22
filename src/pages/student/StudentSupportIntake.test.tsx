import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Profile } from './Profile';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'student-456',
      fullName: 'Ananya Roy',
      email: 'ananya@example.com',
      phone: '9876543210',
    },
    role: 'student',
    isPro: true,
    isAdmin: false,
    updateProfile: vi.fn(),
  }),
}));

vi.mock('@/context/ExamContext', () => ({
  useExam: () => ({
    exams: [{ id: 'wbcs_2026', title: 'WBCS Prelims' }],
    selectedExam: { id: 'wbcs_2026', title: 'WBCS Prelims' },
    setSelectedExam: vi.fn(),
  }),
}));

vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    plans: [
      { id: 'pro_1_year', title: '1-Year Pro Pass', price: 499, durationDays: 365, isActive: true },
    ],
    subscriptionDetails: {
      isActive: true,
      hasSubscription: true,
      daysRemaining: 180,
      status: 'active',
    },
    refreshSubscription: vi.fn(),
  }),
}));

vi.mock('@/services/api', () => ({
  api: {
    getUserAttempts: vi.fn().mockResolvedValue([]),
    getStudentSupportTickets: vi.fn().mockResolvedValue([
      {
        id: 'tkt-init-1',
        userId: 'student-456',
        studentName: 'Ananya Roy',
        studentEmail: 'ananya@example.com',
        subject: 'WBCS Mock 02 question clarification',
        issue: 'Please verify option C in Q12',
        category: 'Test Issue',
        priority: 'medium',
        status: 'open',
        createdAt: '2026-03-10T10:00:00Z',
        updatedAt: '2026-03-10T10:00:00Z',
      },
    ]),
    createSupportTicket: vi.fn().mockResolvedValue({ success: true, ticketId: 'tkt-new-123' }),
    getStudentPaymentHistory: vi.fn().mockResolvedValue([]),
  },
}));

describe('Student Support Intake Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Help & Support Desk in Profile page and opens ticket modal when clicked', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Verify presence of Help & Support Desk actions (redesigned Bengali-first copy)
    expect(screen.getByText('Support & Help Desk')).toBeInTheDocument();
    expect(
      screen.getByText('সাহায্য ও সাপোর্ট: Raise tickets & report issues')
    ).toBeInTheDocument();
    expect(
      screen.getByText('সাপোর্ট ও অভিযোগ ডেস্ক (Direct Support Desk)')
    ).toBeInTheDocument();

    // Click "টিকেট তৈরি করুন" (Create Ticket)
    const createBtn = screen.getByRole('button', { name: 'টিকেট তৈরি করুন' });
    fireEvent.click(createBtn);

    // Verify modal appears
    await waitFor(() => {
      expect(screen.getByText('Student Support & Help')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Ticket/i })).toBeInTheDocument();
    });
  });

  it('opens ticket history tab directly when clicking "Ticket History" in Profile', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    const historyBtn = screen.getByRole('button', { name: 'টিকেট হিস্ট্রি' });
    fireEvent.click(historyBtn);

    await waitFor(() => {
      expect(screen.getByText('Student Support & Help')).toBeInTheDocument();
      expect(screen.getByText('WBCS Mock 02 question clarification')).toBeInTheDocument();
      expect(screen.getByText('OPEN')).toBeInTheDocument();
    });
  });
});
