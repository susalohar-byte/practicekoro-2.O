import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useMaintenance } from '@/context/MaintenanceContext';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Sliders,
  CreditCard,
  Server,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { checkMaintenanceMode } = useMaintenance();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [appName, setAppName] = useState('PracticeKoro');
  const [supportEmail, setSupportEmail] = useState('support@practicekoro.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [websiteUrl, setWebsiteUrl] = useState('https://practicekoro.online');

  const [defaultDuration, setDefaultDuration] = useState(60);
  const [defaultMarks, setDefaultMarks] = useState(1.0);
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState(0.25);
  const [defaultPassingPercent, setDefaultPassingPercent] = useState(35);

  const [currency, setCurrency] = useState('INR');
  const [expiryWarningDays, setExpiryWarningDays] = useState(7);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [appVersion, setAppVersion] = useState('2.0.0');

  // Razorpay Payment Gateway State
  const [rzpKeyId, setRzpKeyId] = useState('');
  const [rzpKeySecret, setRzpKeySecret] = useState('');
  const [rzpWebhookSecret, setRzpWebhookSecret] = useState('');
  const [rzpIsActive, setRzpIsActive] = useState(true);
  const [rzpHasSecret, setRzpHasSecret] = useState(false);
  const [rzpSecretPreview, setRzpSecretPreview] = useState<string | null>(null);
  const [rzpHasWebhook, setRzpHasWebhook] = useState(false);
  const [rzpWebhookPreview, setRzpWebhookPreview] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const [data, gatewayConfig] = await Promise.all([
        api.getAppSettings(),
        api.getPaymentGatewayConfig('razorpay').catch((err) => {
          console.warn('Failed to load gateway config:', err);
          return null;
        }),
      ]);

      data.forEach((s) => {
        const val = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value;
        if (s.key === 'app_name' || s.id === 'general_app_name') setAppName(String(val));
        if (s.key === 'support_email' || s.id === 'general_support_email')
          setSupportEmail(String(val));
        if (s.key === 'support_phone' || s.id === 'general_support_phone')
          setSupportPhone(String(val));
        if (s.key === 'website_url' || s.id === 'general_website_url') setWebsiteUrl(String(val));

        if (s.key === 'default_duration_minutes' || s.id === 'exam_default_duration')
          setDefaultDuration(Number(val));
        if (s.key === 'default_marks_per_q' || s.id === 'exam_default_marks')
          setDefaultMarks(Number(val));
        if (s.key === 'default_negative_marks' || s.id === 'exam_default_negative_marks')
          setDefaultNegativeMarks(Number(val));
        if (s.key === 'default_passing_percentage' || s.id === 'exam_passing_percentage')
          setDefaultPassingPercent(Number(val));

        if (s.key === 'currency' || s.id === 'sub_currency') setCurrency(String(val));
        if (s.key === 'expiry_warning_days' || s.id === 'sub_expiry_warning_days')
          setExpiryWarningDays(Number(val));
        if (s.key === 'maintenance_mode' || s.id === 'sys_maintenance_mode') {
          setMaintenanceMode(val === true || val === 'true');
        }
        if (s.key === 'app_version' || s.id === 'sys_app_version') setAppVersion(String(val));
      });

      if (gatewayConfig) {
        setRzpKeyId(gatewayConfig.keyId || '');
        setRzpIsActive(gatewayConfig.isActive);
        setRzpHasSecret(gatewayConfig.hasSecret);
        setRzpSecretPreview(gatewayConfig.secretPreview || null);
        setRzpHasWebhook(gatewayConfig.hasWebhookSecret);
        setRzpWebhookPreview(gatewayConfig.webhookPreview || null);
        setRzpKeySecret('');
        setRzpWebhookSecret('');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMessage('');
      setSaveSuccess(false);

      const updates: Array<{ id: string; value: unknown }> = [
        { id: 'general_app_name', value: appName },
        { id: 'general_support_email', value: supportEmail },
        { id: 'general_support_phone', value: supportPhone },
        { id: 'general_website_url', value: websiteUrl },

        { id: 'exam_default_duration', value: defaultDuration },
        { id: 'exam_default_marks', value: defaultMarks },
        { id: 'exam_default_negative_marks', value: defaultNegativeMarks },
        { id: 'exam_passing_percentage', value: defaultPassingPercent },

        { id: 'sub_currency', value: currency },
        { id: 'sub_expiry_warning_days', value: expiryWarningDays },
        { id: 'sys_maintenance_mode', value: maintenanceMode },
        { id: 'sys_app_version', value: appVersion },
      ];

      const [res, gwRes] = await Promise.all([
        api.updateAppSettings(updates),
        api.updatePaymentGatewayConfig({
          gateway: 'razorpay',
          keyId: rzpKeyId,
          keySecret: rzpKeySecret,
          webhookSecret: rzpWebhookSecret,
          isActive: rzpIsActive,
        }),
      ]);

      if (!res.success) {
        throw new Error(res.error || 'Failed to save platform settings');
      }

      if (!gwRes.success) {
        throw new Error(gwRes.error || 'Failed to save Razorpay payment gateway settings');
      }

      // Update secret previews if new secret was supplied
      if (rzpKeySecret.trim()) {
        setRzpHasSecret(true);
        const trimmed = rzpKeySecret.trim();
        setRzpSecretPreview(trimmed.length >= 4 ? `••••••••${trimmed.slice(-4)}` : '••••••••');
        setRzpKeySecret('');
      }
      if (rzpWebhookSecret.trim()) {
        setRzpHasWebhook(true);
        const trimmed = rzpWebhookSecret.trim();
        setRzpWebhookPreview(trimmed.length >= 4 ? `••••••••${trimmed.slice(-4)}` : '••••••••');
        setRzpWebhookSecret('');
      }

      await api.logAdminActivity({
        action: 'SETTINGS_UPDATE',
        entityType: 'settings',
        entityId: 'global_platform_settings',
        entityName: 'Global Platform Settings',
        details: {
          maintenanceMode,
          appName,
          supportEmail,
          defaultDuration,
          defaultMarks,
          defaultNegativeMarks,
          defaultPassingPercent,
          appVersion,
          razorpayKeyId: rzpKeyId,
          razorpayActive: rzpIsActive,
          secretUpdated: Boolean(rzpKeySecret.trim()),
          webhookUpdated: Boolean(rzpWebhookSecret.trim()),
        },
        adminUser: currentAdmin,
      });

      await checkMaintenanceMode();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            Global Platform Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure system parameters, support contact lines, default exam guidelines, and payment
            variables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSettings}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Settings updated and saved successfully!
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: General Settings */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">General Brand & Support Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Platform Name
              </label>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Website Public URL
              </label>
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Support Helpline / WhatsApp
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Exam & Scoring Defaults */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Exam Defaults & Marking Scheme</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Default Duration (mins)
              </label>
              <input
                type="number"
                min={1}
                required
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Marks / Question
              </label>
              <input
                type="number"
                step="0.25"
                min={0.25}
                required
                value={defaultMarks}
                onChange={(e) => setDefaultMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Negative Penalty (marks)
              </label>
              <input
                type="number"
                step="0.05"
                min={0}
                required
                value={defaultNegativeMarks}
                onChange={(e) => setDefaultNegativeMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-rose-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Pass Threshold (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={defaultPassingPercent}
                onChange={(e) => setDefaultPassingPercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Subscriptions & Payments */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Monetization & Subscription Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Default Currency Code
              </label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Expiry Notice Threshold (days before expiry)
              </label>
              <input
                type="number"
                min={1}
                value={expiryWarningDays}
                onChange={(e) => setExpiryWarningDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Razorpay Payment Gateway Configuration */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Razorpay Payment Gateway</h3>
                  {rzpKeyId.trim().startsWith('rzp_live_') ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      LIVE MODE
                    </span>
                  ) : rzpKeyId.trim().startsWith('rzp_test_') ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      TEST / SANDBOX
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Secure checkout & signature verification credentials (Zero-Leak Architecture)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>কীভাবে Key পাবেন?</span>
                {showSetupGuide ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-semibold text-slate-300">
                  {rzpIsActive ? 'Gateway Active' : 'Gateway Disabled'}
                </span>
                <input
                  type="checkbox"
                  id="razorpayActiveToggle"
                  aria-label="Toggle Razorpay Active"
                  checked={rzpIsActive}
                  onChange={(e) => setRzpIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Setup Guide Box */}
          {showSetupGuide && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between font-bold text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Razorpay Dashboard থেকে Credentials পাওয়ার নিয়ম:
                </span>
                <a
                  href="https://dashboard.razorpay.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  Razorpay Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1">
                <li>
                  <strong className="text-white">dashboard.razorpay.com</strong> এ লগইন করুন।
                </li>
                <li>
                  উপরে টগল করে <strong>Test Mode</strong> (পরীক্ষার জন্য) বা{' '}
                  <strong>Live Mode</strong> (লাইভ পেমেন্ট চালুর জন্য) নির্বাচন করুন।
                </li>
                <li>
                  বামদিকের মেনু থেকে <strong>Account & Settings</strong> ➔ <strong>API Keys</strong>{' '}
                  অপশনে যান।
                </li>
                <li>
                  <strong>Generate Key</strong> বাটনে ক্লিক করে <strong>Key ID</strong> এবং{' '}
                  <strong>Key Secret</strong> কপি করুন।
                </li>
                <li>
                  নিচে Key ID এবং Key Secret পেস্ট করে <strong>Save All Settings</strong> বাটনে
                  ক্লিক করুন।
                </li>
              </ol>
              <p className="text-[10px] text-amber-300/90 pt-1">
                ⚠️ নোট: সিক্রেট কী ডাটাবেসের ভেতর এনক্রিপ্টেড থাকে এবং কোনো সাধারণ ইউজার বা
                ব্রাউজারে কখনোই দেখা যায় না।
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">জিরো-লিক সিকিউরিটি এনফোর্সড: </span>
              <span className="text-slate-400 text-[11px]">
                Key Secret সার্ভার-সাইড HMAC-SHA256 ভেরিফিকেশনের জন্য সরাসরি ডাটাবেসে সংরক্ষিত হয়।
                ক্লায়েন্ট ব্রাউজারে এটি কখনোই উন্মুক্ত হয় না।
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key ID Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase">
                  Razorpay Key ID
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  rzp_test_... বা rzp_live_...
                </span>
              </div>
              <input
                type="text"
                value={rzpKeyId}
                onChange={(e) => setRzpKeyId(e.target.value)}
                placeholder="e.g. rzp_test_xxxxxxxxxx"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                এটি পাবলিক আইডেন্টিফায়ার, যা ব্রাউজারে Razorpay Checkout পপআপ খোলার জন্য ব্যবহৃত
                হয়।
              </p>
            </div>

            {/* Key Secret Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase">
                  Razorpay Key Secret
                </label>
                {rzpHasSecret && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                    <ShieldCheck className="w-3 h-3" />
                    সেভ করা আছে ({rzpSecretPreview || '••••••••'})
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={rzpKeySecret}
                  onChange={(e) => setRzpKeySecret(e.target.value)}
                  placeholder={
                    rzpHasSecret
                      ? 'পূর্বে সংরক্ষিত কী রাখতে ফাঁকা রাখুন (Leave blank to keep existing)'
                      : 'Razorpay Key Secret এখানে পেস্ট করুন'
                  }
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {rzpHasSecret
                  ? 'পূর্ববর্তী সিক্রেট কী নিরাপদে ডাটাবেসে সেভ রয়েছে। নতুন কী দিয়ে পরিবর্তন করতে চাইলে শুধু নতুন মান টাইপ করুন।'
                  : 'অত্যন্ত গোপনীয়। পেমেন্ট ভ্যালিডেশন এবং সিগনেচার যাচাই করতে ডাটাবেসে ব্যবহৃত হবে।'}
              </p>
            </div>

            {/* Optional Webhook Secret */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase">
                  Razorpay Webhook Secret (ঐচ্ছিক / Optional)
                </label>
                {rzpHasWebhook && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                    <ShieldCheck className="w-3 h-3" />
                    কনফিগার করা আছে ({rzpWebhookPreview || '••••••••'})
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showWebhook ? 'text' : 'password'}
                  value={rzpWebhookSecret}
                  onChange={(e) => setRzpWebhookSecret(e.target.value)}
                  placeholder={
                    rzpHasWebhook
                      ? 'পূর্বে সংরক্ষিত Webhook Secret রাখতে ফাঁকা রাখুন'
                      : 'whsec_xxxxxxxxxx (যদি Webhook ব্যবহার করেন)'
                  }
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhook(!showWebhook)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Razorpay Webhook ইন্টিগ্রেশনের মাধ্যমে ব্যাকগ্রাউন্ড নোটিফিকেশন ভেরিফাই করতে ব্যবহৃত
                হয়।
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: System & Security */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
            <Server className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">System Environment & Controls</h3>
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors ${
              maintenanceMode
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="mb-3 sm:mb-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-white">
                  Maintenance Mode (প্ল্যাটফর্ম রক্ষণাবেক্ষণ)
                </p>
                {maintenanceMode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    সক্রিয় (Active)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    নিষ্ক্রিয় (Live)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                {maintenanceMode
                  ? '⚠️ সতর্কতা: মেইনটেন্যান্স মোড সক্রিয় রয়েছে। পরীক্ষার্থীদের জন্য পরীক্ষা ও ড্যাশবোর্ড সাময়িক বন্ধ থাকবে এবং রক্ষণাবেক্ষণ স্ক্রিন প্রদর্শিত হবে।'
                  : 'সক্রিয় করলে স্টুডেন্ট অ্যাপে মেইনটেন্যান্স স্ক্রিন প্রদর্শিত হবে এবং পরীক্ষা গ্রহণ সাময়িকভাবে বন্ধ থাকবে।'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                id="maintenanceToggle"
                aria-label="Toggle Maintenance Mode"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </label>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>Platform Version:</span>
            <span className="font-mono text-indigo-300 font-bold">
              v{appVersion} (V2 Architecture)
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
export default AdminSettings;
