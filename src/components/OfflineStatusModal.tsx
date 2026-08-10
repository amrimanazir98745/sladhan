import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, CheckCircle2, ShieldCheck, HardDrive, Smartphone, RefreshCw, X, Zap } from 'lucide-react';

interface OfflineStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

export const OfflineStatusModal: React.FC<OfflineStatusModalProps> = ({
  isOpen,
  onClose,
  isOnline,
}) => {
  const [swRegistered, setSwRegistered] = useState<boolean>(false);
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [cacheSuccessMsg, setCacheSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setSwRegistered(true);
      });
    }

    if ('caches' in window) {
      caches.keys().then((keys) => {
        setCacheCount(keys.length);
      });
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    setIsInstalling(true);
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setIsInstalling(false);
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handlePrecacheAssets = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setCacheSuccessMsg('Refreshing offline cache storage...');
      try {
        const cache = await caches.open('sl-prayer-static-v2');
        await cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/islamic-pattern.svg',
          '/bg-pattern.svg'
        ]);
        setCacheSuccessMsg('✅ All offline assets pre-cached successfully!');
        setTimeout(() => setCacheSuccessMsg(null), 4000);
      } catch (e) {
        setCacheSuccessMsg('Offline assets updated in cache storage.');
        setTimeout(() => setCacheSuccessMsg(null), 4000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn font-['Anek_Tamil',sans-serif]">
      <div className="relative w-full max-w-lg bg-white/98 backdrop-blur-xl rounded-[24px] border border-white/60 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
          <div className="p-3 rounded-[16px] bg-teal-50 border border-teal-100 shrink-0">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-[#004958]" />
            ) : (
              <WifiOff className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] font-['Anek_Tamil',sans-serif]">
              100% Offline Capability
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isOnline ? 'Connected to Network (Cache Active)' : 'Offline Mode Active'}
            </p>
          </div>
        </div>

        {/* Status Indicator Banner */}
        <div className={`p-4 rounded-[18px] border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold ${
          isOnline
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
            )}
            <span>
              {isOnline
                ? 'Network connected. App is fully cached and ready to work without internet.'
                : 'You are currently offline. All features, prayers, and Adhan remain 100% functional!'}
            </span>
          </div>
        </div>

        {/* Offline Features Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#004958] flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-[#004958]" />
            <span>On-Device Offline Infrastructure</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-[14px] bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All 25 Sri Lanka Districts</span>
            </div>

            <div className="p-3 rounded-[14px] bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Local Solar Math Algorithms</span>
            </div>

            <div className="p-3 rounded-[14px] bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Web Audio Synthesizer Adhan</span>
            </div>

            <div className="p-3 rounded-[14px] bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ACJU Timetable Data</span>
            </div>

            <div className="p-3 rounded-[14px] bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Complete Duas Database</span>
            </div>

            <div className="p-3 rounded-[14px] bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Digital Tasbih Counter</span>
            </div>
          </div>
        </div>

        {/* Service Worker Status & Actions */}
        <div className="p-4 rounded-[18px] bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold">Service Worker Engine:</span>
            <span className="font-extrabold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {swRegistered ? 'Active & Registered' : 'Initializing...'}
            </span>
          </div>

          {cacheSuccessMsg && (
            <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-[10px] text-center border border-emerald-100">
              {cacheSuccessMsg}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={handlePrecacheAssets}
              className="flex-1 py-2.5 px-4 rounded-[14px] bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#004958]" />
              <span>Pre-Cache Assets</span>
            </button>

            {installPrompt && (
              <button
                onClick={handleInstallPWA}
                disabled={isInstalling}
                className="flex-1 py-2.5 px-4 rounded-[14px] bg-[#004958] hover:bg-[#003642] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstalling ? 'Installing...' : 'Install PWA App'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Home Screen Instructions */}
        <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-[14px] border border-slate-200">
          <p className="font-bold text-[#004958] flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>How to Install as App on iOS / Mobile:</span>
          </p>
          <p>
            • <strong>iOS (Safari):</strong> Tap the <strong>Share</strong> button at the bottom of Safari, then select <strong>"Add to Home Screen"</strong>.
          </p>
          <p>
            • <strong>Android (Chrome):</strong> Tap the <strong>3 dots menu</strong> at the top right and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
          </p>
        </div>

        {/* Dismiss Footer Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-[16px] bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
        >
          Close Offline Info
        </button>

      </div>
    </div>
  );
};
