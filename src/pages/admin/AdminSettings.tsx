import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
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
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
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

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getAppSettings();

      data.forEach((s) => {
        const val = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value;
        if (s.key === 'app_name') setAppName(String(val));
        if (s.key === 'support_email') setSupportEmail(String(val));
        if (s.key === 'support_phone') setSupportPhone(String(val));
        if (s.key === 'website_url') setWebsiteUrl(String(val));

        if (s.key === 'default_duration_minutes') setDefaultDuration(Number(val));
        if (s.key === 'default_marks_per_q') setDefaultMarks(Number(val));
        if (s.key === 'default_negative_marks') setDefaultNegativeMarks(Number(val));
        if (s.key === 'default_passing_percentage') setDefaultPassingPercent(Number(val));

        if (s.key === 'currency') setCurrency(String(val));
        if (s.key === 'expiry_warning_days') setExpiryWarningDays(Number(val));
        if (s.key === 'maintenance_mode') setMaintenanceMode(Boolean(val));
        if (s.key === 'app_version') setAppVersion(String(val));
      });
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

      await Promise.all(updates.map((u) => api.updateAppSetting(u.id, u.value)));

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

        {/* Section 4: System & Security */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
            <Server className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">System Environment & Controls</h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Maintenance Mode</p>
              <p className="text-[11px] text-slate-400">
                When enabled, student test taking will show a maintenance notice.
              </p>
            </div>
            <input
              type="checkbox"
              id="maintenanceToggle"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700"
            />
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
