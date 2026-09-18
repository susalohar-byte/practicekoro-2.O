import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  Tag,
  Search,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Percent,
  IndianRupee,
  Calendar,
  Layers,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { CouponItem } from '@/types';

export const AdminCoupons: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<string>('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState<number>(1);
  const [applicablePlanId, setApplicablePlanId] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  const loadCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Copy Code Helper
  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('fixed');
    setDiscountValue(50);
    setMaxDiscountAmount('');
    setMinOrderAmount(199);
    setMaxUses('');
    setMaxUsesPerUser(1);
    setApplicablePlanId('');
    setValidUntil('');
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: CouponItem) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description || '');
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMaxDiscountAmount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : '');
    setMinOrderAmount(c.minOrderAmount);
    setMaxUses(c.maxUses ? String(c.maxUses) : '');
    setMaxUsesPerUser(c.maxUsesPerUser);
    setApplicablePlanId(c.applicablePlanId || '');
    setValidUntil(c.validUntil ? c.validUntil.slice(0, 10) : '');
    setIsActive(c.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  // Quick Preset Handlers
  const handleApplyPreset = (preset: {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscountAmount?: string;
    minOrderAmount: number;
    maxUses?: string;
  }) => {
    setCode(preset.code);
    setDescription(preset.description);
    setDiscountType(preset.discountType);
    setDiscountValue(preset.discountValue);
    setMaxDiscountAmount(preset.maxDiscountAmount || '');
    setMinOrderAmount(preset.minOrderAmount);
    setMaxUses(preset.maxUses || '');
  };

  // Submit Create / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Coupon code is required.');
      return;
    }
    if (discountValue <= 0) {
      setFormError('Discount value must be greater than 0.');
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');

      if (editingCoupon) {
        const res = await api.updateAdminCoupon(editingCoupon.id, {
          code: cleanCode,
          description: description.trim() || undefined,
          discountType,
          discountValue,
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
          minOrderAmount,
          maxUses: maxUses ? Number(maxUses) : undefined,
          maxUsesPerUser,
          applicablePlanId: applicablePlanId || undefined,
          validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
          isActive,
        });
        if (!res.success) throw new Error(res.error || 'Failed to update coupon');

        await api.logAdminActivity({
          action: 'COUPON_UPDATE',
          entityType: 'coupon',
          entityId: editingCoupon.id,
          entityName: cleanCode,
          details: { discountType, discountValue, minOrderAmount },
          adminUser: currentAdmin,
        });
      } else {
        const res = await api.createAdminCoupon({
          code: cleanCode,
          description: description.trim() || undefined,
          discountType,
          discountValue,
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
          minOrderAmount,
          maxUses: maxUses ? Number(maxUses) : undefined,
          maxUsesPerUser,
          applicablePlanId: applicablePlanId || undefined,
          validFrom: new Date().toISOString(),
          validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
          isActive,
        });
        if (!res.success) throw new Error(res.error || 'Failed to create coupon');

        await api.logAdminActivity({
          action: 'COUPON_CREATE',
          entityType: 'coupon',
          entityName: cleanCode,
          details: { discountType, discountValue, minOrderAmount },
          adminUser: currentAdmin,
        });
      }

      setIsModalOpen(false);
      await loadCoupons();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active State
  const handleToggleActive = async (c: CouponItem) => {
    try {
      const res = await api.updateAdminCoupon(c.id, { isActive: !c.isActive });
      if (res.success) {
        setCoupons((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, isActive: !item.isActive } : item))
        );
      }
    } catch (err) {
      console.error('Failed to toggle active state:', err);
    }
  };

  // Delete Coupon
  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon code "${couponCode}"?`)) return;
    try {
      const res = await api.deleteAdminCoupon(id);
      if (res.success) {
        await api.logAdminActivity({
          action: 'COUPON_DELETE',
          entityType: 'coupon',
          entityId: id,
          entityName: couponCode,
          adminUser: currentAdmin,
        });

        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  // Filtered Coupons
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      const isExpired = c.validUntil ? new Date(c.validUntil) < now : false;

      if (statusFilter === 'active') return c.isActive && !isExpired;
      if (statusFilter === 'inactive') return !c.isActive;
      if (statusFilter === 'expired') return isExpired;
      return true;
    });
  }, [coupons, searchTerm, statusFilter]);

  // Key Metrics
  const metrics = useMemo(() => {
    const total = coupons.length;
    const now = new Date();
    const active = coupons.filter(
      (c) => c.isActive && (!c.validUntil || new Date(c.validUntil) >= now)
    ).length;
    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const estimatedDiscountGranted = coupons.reduce((sum, c) => {
      const perUse = c.discountType === 'fixed' ? c.discountValue : 50; // estimate ₹50 avg for %
      return sum + perUse * (c.usedCount || 0);
    }, 0);

    return { total, active, totalRedemptions, estimatedDiscountGranted };
  }, [coupons]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Coupons & Discounts</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Commerce Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Create promotional discount codes and manage student subscription incentives
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={loadCoupons}
            disabled={isLoading}
            className="text-xs font-bold border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            type="button"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Coupons</span>
            <Tag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics.total}</p>
          <p className="text-[10px] text-slate-500">Registered discount codes</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Active & Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{metrics.active}</p>
          <p className="text-[10px] text-slate-500">Currently redeemable</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Redemptions</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{metrics.totalRedemptions}</p>
          <p className="text-[10px] text-slate-500">Times applied by candidates</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Benefits Granted</span>
            <IndianRupee className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300">
            ₹{metrics.estimatedDiscountGranted.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500">Estimated value saved</p>
        </div>
      </div>

      {/* Control Bar: Search & Status Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-850">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-850 w-full md:w-auto">
          {[
            { id: 'all', label: `All (${coupons.length})` },
            { id: 'active', label: `Active (${metrics.active})` },
            { id: 'inactive', label: 'Inactive' },
            { id: 'expired', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Coupons List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-850">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-2" />
          Loading promotional coupons...
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-950 rounded-2xl border border-slate-850 p-6">
          <Tag className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Coupons Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No coupons match your search criteria.'
              : 'Create your first coupon code to start running campaigns and special discounts.'}
          </p>
          <Button
            type="button"
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold mt-2"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create First Coupon
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((c) => {
            const isExpired = c.validUntil ? new Date(c.validUntil) < new Date() : false;
            const isLive = c.isActive && !isExpired;
            const usagePercent =
              c.maxUses && c.maxUses > 0
                ? Math.min(100, Math.round((c.usedCount / c.maxUses) * 100))
                : null;

            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl bg-slate-950 border transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
                  isLive
                    ? 'border-slate-850 hover:border-indigo-500/40 shadow-lg shadow-black/20'
                    : 'border-slate-850/60 opacity-75'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Row: Code Pill + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-sm text-indigo-300 tracking-wider bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-xl">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
                        title="Copy Coupon Code"
                      >
                        {copiedCode === c.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isLive
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : isExpired
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {isExpired ? 'EXPIRED' : c.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {c.description && (
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {c.description}
                    </p>
                  )}

                  {/* Discount Value Badge Card */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black">
                        {c.discountType === 'percentage' ? (
                          <Percent className="w-4 h-4" />
                        ) : (
                          <IndianRupee className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">
                          {c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : `FLAT ₹${c.discountValue} OFF`}
                        </p>
                        {c.maxDiscountAmount && c.discountType === 'percentage' && (
                          <p className="text-[10px] text-slate-400">
                            Capped at ₹{c.maxDiscountAmount}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Min Order</p>
                      <p className="text-xs font-bold text-slate-200">
                        {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : 'No Min'}
                      </p>
                    </div>
                  </div>

                  {/* Usage Progress & Limits */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Usage Progress</span>
                      <span className="font-bold text-slate-300">
                        {c.usedCount} / {c.maxUses ? `${c.maxUses} uses` : '∞ unlimited'}
                      </span>
                    </div>
                    {usagePercent !== null && (
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            usagePercent >= 90
                              ? 'bg-rose-500'
                              : usagePercent >= 50
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Target & Validity Details */}
                  <div className="pt-2 border-t border-slate-900 text-[11px] space-y-1 text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        Plan:
                      </span>
                      <span className="font-bold text-slate-300 truncate max-w-[150px]">
                        {c.applicablePlanId ? c.applicablePlanId : 'All Pro Plans'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Expires:
                      </span>
                      <span
                        className={`font-semibold ${
                          isExpired ? 'text-rose-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        {c.validUntil
                          ? new Date(c.validUntil).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'No expiry'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      c.isActive
                        ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/60'
                        : 'border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/40'
                    }`}
                  >
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
                      title="Edit Coupon"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.code)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-850 flex items-center justify-between shrink-0 bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {editingCoupon ? 'Edit Coupon' : 'Create New Promotional Coupon'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure discount rules, usage quotas, and validity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto grow space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Preset Quick Chips (only on create) */}
              {!editingCoupon && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Quick Preset Templates:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          code: 'NEWUSER50',
                          description: 'Flat ₹50 introductory off for new students',
                          discountType: 'fixed',
                          discountValue: 50,
                          minOrderAmount: 199,
                          maxUses: '500',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                    >
                      🚀 Flat ₹50 Off
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          code: 'FESTIVE20',
                          description: 'Festive 20% discount on Pro Pass',
                          discountType: 'percentage',
                          discountValue: 20,
                          maxDiscountAmount: '100',
                          minOrderAmount: 299,
                          maxUses: '1000',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                    >
                      🎉 20% Off (Max ₹100)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          code: 'EARLYBIRD30',
                          description: 'Early bird 30% discount for first 100 aspirants',
                          discountType: 'percentage',
                          discountValue: 30,
                          maxDiscountAmount: '120',
                          minOrderAmount: 299,
                          maxUses: '100',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                    >
                      ⚡ Early Bird 30% (100 uses)
                    </button>
                  </div>
                </div>
              )}

              {/* Coupon Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Coupon Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WBPSPECIAL50"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-white placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description / Campaign Name
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Durga Puja Special ₹50 off on 1-Year Pro Pass"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="fixed">Flat Fixed Amount (₹)</option>
                    <option value="percentage">Percentage Discount (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}{' '}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'percentage' ? '100' : '9999'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Percentage Max Cap & Min Order Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder={discountType === 'percentage' ? 'e.g. 100' : 'Optional'}
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    disabled={discountType === 'fixed'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Min Cart Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Max Total Uses & Per-User Limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Total Quota (Max Uses)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Max Uses Per Student
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxUsesPerUser}
                    onChange={(e) => setMaxUsesPerUser(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Target Plan & Expiry Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Target Plan
                  </label>
                  <select
                    value={applicablePlanId}
                    onChange={(e) => setApplicablePlanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Universal (All Plans)</option>
                    <option value="pro_1_year">1-Year All-Access Pro Pass (₹299)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-850">
                <div>
                  <p className="text-xs font-bold text-white">Active Status</p>
                  <p className="text-[10px] text-slate-400">
                    Enable so students can immediately apply this coupon during checkout
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold border-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  {isSaving ? 'Saving…' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
