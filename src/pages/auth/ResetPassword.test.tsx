import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResetPassword } from './ResetPassword';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      getSession: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

describe('ResetPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies valid token_hash and renders the password reset form', async () => {
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
      data: { user: { id: 'u1' } as any, session: { access_token: 'tok' } as any },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?token_hash=test_valid_hash&type=recovery']}>
        <ResetPassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'test_valid_hash',
        type: 'recovery',
      });
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
    });
  });

  it('displays error message when token verification fails', async () => {
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Token has expired' } as any,
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?token_hash=expired_hash&type=recovery']}>
        <ResetPassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired link/i)).toBeInTheDocument();
      expect(screen.getByText(/token has expired/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /request new reset link/i })).toBeInTheDocument();
    });
  });

  it('validates password length and matching confirmation before submitting', async () => {
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
      data: { user: { id: 'u1' } as any, session: { access_token: 'tok' } as any },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?token_hash=test_valid_hash&type=recovery']}>
        <ResetPassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    // 1. Too short
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters long/i)).toBeInTheDocument();
    });

    // 2. Mismatch
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('successfully updates user password and displays success screen', async () => {
    vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
      data: { user: { id: 'u1' } as any, session: { access_token: 'tok' } as any },
      error: null,
    });
    vi.mocked(supabase.auth.updateUser).mockResolvedValue({
      data: { user: { id: 'u1' } as any },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?token_hash=test_valid_hash&type=recovery']}>
        <ResetPassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(passwordInput, { target: { value: 'superSecurePassword@2026' } });
    fireEvent.change(confirmInput, { target: { value: 'superSecurePassword@2026' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'superSecurePassword@2026',
      });
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in now/i })).toBeInTheDocument();
    });
  });
});
