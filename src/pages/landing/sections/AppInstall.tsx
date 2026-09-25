import React, { useState, useEffect } from 'react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import {
  Smartphone,
  Download,
  Zap,
  Bell,
  WifiOff,
  CheckCircle2,
  ArrowRight,
  Share2,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const AppInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if app is already installed in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstalledSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install error:', err);
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <section
      id="app-install"
      className="relative min-h-screen min-h-[100dvh] flex flex-col justify-center py-20 sm:py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 scroll-mt-24 overflow-hidden"
    >
      {/* Background Glows */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 -left-32 w-[420px] h-[420px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-10 -right-32 w-[420px] h-[420px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Download & Install"
          title={
            <>
              Study on the Go with the{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PracticeKoro App
              </span>
            </>
          }
          description="Install PracticeKoro directly on your mobile device for lightning-fast mock tests, instant test alerts, and seamless practice without storage hassle."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Key Features & Direct Install Action (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Reveal delay={100}>
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Instant 1-Tap Install
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Zero storage lag. No 100MB Play Store download required — opens instantly.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={150}>
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Mock Test Alerts
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Instant notifications for live Sunday mock tests, new PYQs & exam dates.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <WifiOff className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Low Data & Smooth
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Optimized for 3G/4G rural mobile connections across all districts.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={250}>
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Real Exam Interface
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Simulates real CBT exam hall screens with bilingual Bengali & English questions.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Install Action Card */}
            <Reveal delay={300}>
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                {/* Background Pattern */}
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"
                />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-[11px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>OFFICIAL MOBILE WEB APP</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Install On Your Phone Today
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100/90 max-w-md">
                      Compatible with Android (Chrome, Edge) and iPhone (Safari). 100% Free to install.
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2">
                    {installedSuccess || isInstalled ? (
                      <div className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-md">
                        <Check className="w-4 h-4" />
                        <span>Installed on Device</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleInstallClick}
                        className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-sm shadow-lg shadow-black/10 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4.5 h-4.5 stroke-[2.5]" />
                        <span>Install App Now</span>
                      </button>
                    )}
                    <span className="text-[11px] text-blue-200 text-center font-medium">
                      One-tap install • No storage required
                    </span>
                  </div>
                </div>

                {/* Instructions accordion / modal helper */}
                {showGuide && (
                  <div className="mt-5 pt-5 border-t border-white/20 text-xs text-blue-50 space-y-3">
                    <p className="font-bold text-white text-sm">How to install manually:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
                        <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-blue-200" /> Android (Chrome)
                        </p>
                        <p className="text-blue-100 leading-relaxed text-[11px]">
                          1. Tap the three dots (⋮) in the top-right corner.
                          <br />
                          2. Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
                        <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-blue-200" /> iPhone (Safari)
                        </p>
                        <p className="text-blue-100 leading-relaxed text-[11px]">
                          1. Tap the <strong>Share</strong> button at bottom (square with arrow).
                          <br />
                          2. Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>

            {/* Platform Trust Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified &amp; Secure
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Smartphone className="w-4 h-4 text-blue-500" />
                Works on Android &amp; iOS
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Zap className="w-4 h-4 text-amber-500" />
                Instant Updates
              </span>
            </div>
          </div>

          {/* Right Column: Modern Phone Mockup (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <Reveal delay={200} className="w-full max-w-[320px]">
              <div className="relative mx-auto border-[10px] border-slate-900 dark:border-slate-800 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 overflow-hidden bg-slate-50 dark:bg-slate-900">
                {/* Phone Speaker & Camera Notch */}
                <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 dark:bg-slate-800 rounded-b-xl w-36 mx-auto flex items-center justify-center gap-2 z-30">
                  <div className="w-10 h-1 bg-slate-700 rounded-full" />
                  <div className="w-2 h-2 bg-slate-700 rounded-full" />
                </div>

                {/* Status Bar */}
                <div className="pt-2 px-6 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 select-none bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">5G</span>
                    <div className="w-4 h-2 border border-current rounded-xs p-0.5 flex items-center">
                      <div className="w-full h-full bg-current rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Mock Phone App Screen Content */}
                <div className="p-4 space-y-3.5 bg-slate-50 dark:bg-slate-900">
                  {/* App Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                        <img
                          src="/logo-icon-transparent.png"
                          alt="PracticeKoro"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none">
                          Practice<span className="text-blue-600">Koro</span>
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">Student Portal</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      LIVE
                    </span>
                  </div>

                  {/* Active Live Test Card */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        Sunday Mega Mock
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">85 Mins</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        WBP Constable 2026
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        85 Marks • Bengali &amp; English
                      </p>
                    </div>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">1,420 Aspirants</span>
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        Start Test <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Daily Practice Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="text-[9px] text-slate-400 font-medium">State Rank</p>
                      <p className="text-sm font-black text-blue-600">#42</p>
                      <p className="text-[8px] text-emerald-600 font-bold">Top 2% in WB</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="text-[9px] text-slate-400 font-medium">Tests Solved</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">28</p>
                      <p className="text-[8px] text-blue-600 font-bold">88.5% Accuracy</p>
                    </div>
                  </div>

                  {/* App Bottom Mini Bar */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      <span>PYQ Practice Bank</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-blue-600">10,000+ Qs</span>
                  </div>
                </div>

                {/* Phone Bottom Home Bar */}
                <div className="pb-2 pt-1 bg-white dark:bg-slate-900 flex justify-center">
                  <div className="w-24 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
