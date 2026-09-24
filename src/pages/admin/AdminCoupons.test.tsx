import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminCoupons } from './AdminCoupons';
import { api } from '@/services/api';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', fullName: 'Super Admin', email: 'admin@practicekoro.com' },
    role: 'admin',
    isPro: true,
    isAdmin: true,
    adminRole: 'super_admin',
    hasPermission: () => true,
    logout: vi.fn(),
  }),
}));

vi.mock('@/services/api', () => ({
  api: {
    getAdminCoupons: vi.fn(),
    createAdminCoupon: vi.fn(),
    updateAdminCoupon: vi.fn(),
    deleteAdminCoupon: vi.fn(),
  },
}));

describe('AdminCoupons Page', () => {
  const mockCoupons = [
    {
      id: 'c1',
      code: 'WELCOME50',
      description: 'Introductory discount',
      discountType: 'fixed' as const,
      discountValue: 50,
      minOrderAmount: 199,
      maxUses: 500,
      usedCount: 30,
      maxUsesPerUser: 1,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'c2',
      code: 'FESTIVE20',
      description: 'Festive offer',
      discountType: 'percentage' as const,
      discountValue: 20,
      maxDiscountAmount: 100,
      minOrderAmount: 299,
      maxUses: 1000,
      usedCount: 75,
      maxUsesPerUser: 1,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getAdminCoupons).mockResolvedValue(mockCoupons);
  });

  const renderCoupons = () =>
    render(
      <MemoryRouter>
        <AdminCoupons />
      </MemoryRouter>
    );

  it('renders metrics and coupon list', async () => {
    renderCoupons();

    await waitFor(() => {
      expect(screen.getAllByText('Coupons & Discounts')[0]).toBeInTheDocument();
      expect(screen.getByText('WELCOME50')).toBeInTheDocument();
      expect(screen.getByText('FESTIVE20')).toBeInTheDocument();
      expect(screen.getByText('FLAT ₹50 OFF')).toBeInTheDocument();
      expect(screen.getByText('20% OFF')).toBeInTheDocument();
    });
  });

  it('filters coupons by search term', async () => {
    renderCoupons();

    await waitFor(() => {
      expect(screen.getByText('WELCOME50')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search code or description...');
    fireEvent.change(searchInput, { target: { value: 'FESTIVE' } });

    expect(screen.queryByText('WELCOME50')).not.toBeInTheDocument();
    expect(screen.getByText('FESTIVE20')).toBeInTheDocument();
  });

  it('opens create modal, clicks preset, and submits new coupon', async () => {
    vi.mocked(api.createAdminCoupon).mockResolvedValueOnce({
      success: true,
      coupon: {
        id: 'c3',
        code: 'NEWUSER50',
        description: 'Flat ₹50 introductory off for new students',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 199,
        maxUses: 500,
        usedCount: 0,
        maxUsesPerUser: 1,
        validFrom: '2026-03-18T00:00:00Z',
        isActive: true,
        createdAt: '2026-03-18T00:00:00Z',
        updatedAt: '2026-03-18T00:00:00Z',
      },
    });

    renderCoupons();

    await waitFor(() => {
      expect(screen.getByText('Create Coupon')).toBeInTheDocument();
    });

    // Click Create Coupon button
    const createBtn = screen.getByRole('button', { name: /Create Coupon/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Create New Promotional Coupon')).toBeInTheDocument();

    // Click Preset template
    const presetBtn = screen.getByRole('button', { name: /Flat ₹50 Off/i });
    fireEvent.click(presetBtn);

    expect(screen.getByDisplayValue('NEWUSER50')).toBeInTheDocument();

    // Submit form inside modal
    const createButtons = screen.getAllByRole('button', { name: /Create Coupon/i });
    const submitBtn = createButtons[createButtons.length - 1];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createAdminCoupon).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'NEWUSER50',
          discountType: 'fixed',
          discountValue: 50,
        })
      );
    });
  });

  it('toggles coupon active status', async () => {
    vi.mocked(api.updateAdminCoupon).mockResolvedValueOnce({ success: true });

    renderCoupons();

    await waitFor(() => {
      expect(screen.getByText('WELCOME50')).toBeInTheDocument();
    });

    const deactivateButtons = screen.getAllByRole('button', { name: /Deactivate/i });
    fireEvent.click(deactivateButtons[0]);

    await waitFor(() => {
      expect(api.updateAdminCoupon).toHaveBeenCalledWith('c1', { isActive: false });
    });
  });
});
