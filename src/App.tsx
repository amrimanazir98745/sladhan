/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { District, DayPrayerSchedule, PrayerKey, NotificationSettings } from './types/prayer';
import { DEFAULT_DISTRICT, findClosestDistrict, getDistrictById, getDistrictFullName } from './utils/sriLankaDistricts';
import { calculateDailyPrayerSchedule, buildPrayerTimeItems, getSriLankaTimeParts } from './utils/prayerCalculator';
import { loadNotificationSettings, saveNotificationSettings, sendPrayerNotification } from './utils/notifications';
import { Header } from './components/Header';
import { HeroTimer } from './components/HeroTimer';
import { RegionalAttentionBanner } from './components/RegionalAttentionBanner';
import { RegionalAttentionModal } from './components/RegionalAttentionModal';
import { PrayerGrid } from './components/PrayerGrid';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { TasbihCounter } from './components/TasbihCounter';
import { DuasModal } from './components/DuasModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { OfflineStatusModal } from './components/OfflineStatusModal';
import { TasbihIcon, DuaIcon, CustomMosqueLogoSvg, PrayingManIcon } from './components/IslamicIcons';
import { Clock, Calendar, ShieldCheck, Link as LinkIcon, CalendarDays, Bell, Zap, Navigation, AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<District>(DEFAULT_DISTRICT);
  const [selectedDate, setSelectedDate] = useState<Date>(() => getSriLankaTimeParts(new Date()).dateObj);
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'tasbih' | 'duas'>('today');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isRegionalModalOpen, setIsRegionalModalOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [locationNotice, setLocationNotice] = useState<{ msg: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(loadNotificationSettings());
  const [now, setNow] = useState<Date>(new Date());
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // Dark mode — persisted in localStorage & synced with DOM/system theme
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sl_dark_mode');
      if (saved !== null) return saved === 'true';
      if (typeof window !== 'undefined') {
        return document.documentElement.classList.contains('dark') ||
               (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch (_) {}
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) { root.classList.add('dark'); }
    else { root.classList.remove('dark'); }
    try { localStorage.setItem('sl_dark_mode', String(darkMode)); } catch (_) {}
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      const root = document.documentElement;
      if (next) { root.classList.add('dark'); }
      else { root.classList.remove('dark'); }
      try { localStorage.setItem('sl_dark_mode', String(next)); } catch (_) {}
      return next;
    });
  };

  // Catch PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredInstallPrompt(null);
        showNotice('✅ App successfully added to your Home Screen!', 'success');
      }
    } else {
      showNotice('📱 To Add to Home Screen: Tap your browser Share/Menu icon and select "Add to Home Screen".', 'success');
    }
  };

  // Listen to Online/Offline network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotice('⚡ Connection restored. App synced and online.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showNotice('📡 Network offline. App operating in 100% offline mode.', 'warn');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Remove any lingering dark class so the light theme shows correctly
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Restore saved district from localStorage if present
  useEffect(() => {
    try {
      const savedDistrictId = localStorage.getItem('sl_prayer_district_id');
      if (savedDistrictId) {
        setSelectedDistrict(getDistrictById(savedDistrictId));
      }
    } catch (e) {
      console.warn('Could not load saved district', e);
    }
  }, []);

  const handleSelectDistrict = (district: District) => {
    setSelectedDistrict(district);
    try {
      localStorage.setItem('sl_prayer_district_id', district.id);
    } catch (e) {
      console.warn('Could not save district preference', e);
    }
  };

  // Ticking timer every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate daily schedule
  const dailySchedule: DayPrayerSchedule = calculateDailyPrayerSchedule(
    selectedDate,
    selectedDistrict.lat,
    selectedDistrict.lng,
    selectedDistrict.id,
    18.0,
    17.5
  );

  // Build prayer time items
  const { items: prayerItems, nextPrayer, currentPrayer, timeRemainingSeconds, totalIntervalSeconds } =
    buildPrayerTimeItems(dailySchedule, now);

  // Automatic Adhan Push Alert & Sound trigger check
  useEffect(() => {
    if (!notificationSettings.pushEnabled && !notificationSettings.soundEnabled) return;

    const slNow = getSriLankaTimeParts(now);
    const currentMinKey = `${slNow.hours}:${slNow.minutes}`;
    const notifiedKey = `notified_${slNow.year}_${slNow.month}_${slNow.day}_${currentMinKey}`;

    if (sessionStorage.getItem(notifiedKey)) return;

    prayerItems.forEach(item => {
      if (item.key === 'Sunrise') return;
      if (!notificationSettings.prayers[item.key]) return;

      const pDate = item.dateObj;
      const diffMs = Math.abs(now.getTime() - pDate.getTime());

      if (diffMs <= 40000) {
        sessionStorage.setItem(notifiedKey, 'true');
        sendPrayerNotification(
          item.name,
          selectedDistrict.name,
          false,
          notificationSettings.soundEnabled,
          notificationSettings.soundPreset || 'takbeer'
        );
      }
    });
  }, [now, notificationSettings, prayerItems, selectedDate, selectedDistrict]);

  const showNotice = (msg: string, type: 'success' | 'warn' | 'error') => {
    setLocationNotice({ msg, type });
    setTimeout(() => {
      setLocationNotice(null);
    }, 7000);
  };

  // Handle Geolocation Detection with multi-stage fallback
  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      showNotice('Geolocation is not supported in this browser.', 'error');
      return;
    }

    setIsDetectingLocation(true);

    const onSuccess = (position: GeolocationPosition) => {
      setIsDetectingLocation(false);
      const { latitude, longitude } = position.coords;
      const closest = findClosestDistrict(latitude, longitude);
      handleSelectDistrict(closest);

      const inSriLanka = latitude >= 5.5 && latitude <= 10.0 && longitude >= 79.0 && longitude <= 82.5;
      if (inSriLanka) {
        showNotice(`📍 Location detected! District set to ${closest.name} (${closest.province}).`, 'success');
      } else {
        showNotice(`🌍 Device location detected (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°). Matched to closest Sri Lankan district: ${closest.name}.`, 'warn');
      }
    };

    // First attempt: High accuracy with 6s timeout
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        console.warn('High accuracy GPS timed out/failed, trying standard accuracy...', err);
        // Second attempt: Standard accuracy with 8s timeout (works reliably on Wi-Fi/desktop)
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (finalErr) => {
            setIsDetectingLocation(false);
            console.warn('Standard geolocation error:', finalErr);
            if (finalErr.code === finalErr.PERMISSION_DENIED) {
              showNotice('⚠️ GPS Permission Denied or restricted by browser/iframe. Please enable location permissions or pick your district manually.', 'warn');
            } else {
              showNotice('⚠️ Could not determine GPS coordinates. Falling back to default district.', 'warn');
            }
          },
          { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 }
        );
      },
      { timeout: 6000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  };

  const handleToggleNotification = (key: PrayerKey) => {
    const updated = {
      ...notificationSettings,
      prayers: {
        ...notificationSettings.prayers,
        [key]: !notificationSettings.prayers[key]
      }
    };
    setNotificationSettings(updated);
    saveNotificationSettings(updated);
  };

  return (
    <div className="app-bg min-h-screen text-[#17252B] flex flex-col font-['Anek_Tamil',sans-serif] selection:bg-[#0E7490]/20 selection:text-[#0F6074] transition-colors duration-500 overflow-x-hidden">
      
      <div className="app-content flex flex-col">
        {/* Sticky Header with Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hijriDate={dailySchedule.hijriDate}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onInstallPwa={handleInstallPwa}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />


      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6 lg:pb-8">
        
        {/* Floating Location Notice Banner */}
        {locationNotice && (
          <div className={`p-3.5 sm:p-4 rounded-[18px] border flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition-all animate-fadeIn ${
            locationNotice.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 shadow-[0_4px_16px_-4px_rgba(16,185,129,0.18)]'
              : locationNotice.type === 'warn'
              ? 'bg-amber-50/95 border-amber-200 text-amber-800 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.18)]'
              : 'bg-red-50/95 border-red-200 text-red-800 shadow-[0_4px_16px_-4px_rgba(239,68,68,0.18)]'
          }`}>
            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
              {locationNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
              ) : locationNotice.type === 'warn' ? (
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <span className="leading-snug">{locationNotice.msg}</span>
            </div>
            <button
              onClick={() => setLocationNotice(null)}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/8 hover:bg-black/14 shrink-0 cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: TODAY'S SCHEDULE (Primary View) */}
        {activeTab === 'today' && (
          <div className="space-y-4 sm:space-y-5 animate-fadeIn">

            {/* Hero Banner with Live Countdown Timer & District Selector */}
            <HeroTimer
              schedule={dailySchedule}
              nextPrayer={nextPrayer}
              currentPrayer={currentPrayer}
              timeRemainingSeconds={timeRemainingSeconds}
              totalIntervalSeconds={totalIntervalSeconds}
              district={selectedDistrict}
              onViewCalendar={() => setActiveTab('calendar')}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onSelectDistrict={handleSelectDistrict}
              onDetectLocation={handleDetectLocation}
              isDetectingLocation={isDetectingLocation}
              onOpenRegionalModal={() => setIsRegionalModalOpen(true)}
              darkMode={darkMode}
            />

            {/* Prayer Cards Row */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#17252B] flex items-center gap-2 font-['Anek_Tamil',sans-serif]">
                  <PrayingManIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#0E7490] dark:text-[#67D5DF]" fill="currentColor" />
                  <span>Daily Adhan Timings</span>
                  <span className="text-[#CDEFF1]">•</span>
                  <span className="text-[#0E7490] font-bold truncate max-w-[120px] sm:max-w-none">{getDistrictFullName(selectedDistrict)}</span>
                </h3>

                <span className="text-xs text-[#0E7490] font-bold flex items-center gap-1.5 glass-pill px-2.5 py-1 rounded-[12px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
                  <span className="hidden sm:inline">Official Sri Lanka Standard</span>
                  <span className="sm:hidden">ACJU Verified</span>
                </span>
              </div>

              <PrayerGrid
                prayers={prayerItems}
                activeNotificationPrayers={notificationSettings.prayers}
                onToggleNotification={handleToggleNotification}
              />
            </section>

          </div>
        )}


        {/* TAB 2: MONTHLY CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="animate-fadeIn">
            <MonthlyCalendar district={selectedDistrict} />
          </div>
        )}

        {/* TAB 3: TASBIH COUNTER */}
        {activeTab === 'tasbih' && (
          <div className="animate-fadeIn">
            <TasbihCounter />
          </div>
        )}

        {/* TAB 4: DAILY DUAS */}
        {activeTab === 'duas' && (
          <div className="animate-fadeIn">
            <DuasModal />
          </div>
        )}

      </main>

      {/* Floating Liquid-Glass Bottom Navigation Bar for Mobile */}
      <nav
        className="fixed left-3 right-3 z-50 lg:hidden glass-nav rounded-[22px] p-1.5"
        style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="grid grid-cols-4 gap-0.5">
          {([
            { id: 'today',    Icon: Clock,      label: 'Schedule' },
            { id: 'calendar', Icon: Calendar,   label: 'Calendar' },
            { id: 'tasbih',   Icon: null,       label: 'Tasbih',  isTasbih: true },
            { id: 'duas',     Icon: null,       label: 'Duas',    isDua: true },
          ] as any[]).map(({ id, Icon, label, isTasbih, isDua }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-[16px] transition-all duration-200 active:scale-[0.96] cursor-pointer min-h-[3rem] ${
                  isActive
                    ? 'bg-gradient-to-b from-[#138BA6] to-[#0E7490] text-white shadow-[0_4px_12px_-2px_rgba(14,116,144,0.40)]'
                    : 'text-[#60757C] hover:text-[#0E7490] hover:bg-[#E8F7F8]/60'
                }`}
              >
                {isTasbih ? (
                  <TasbihIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#0E7490]'}`} />
                ) : isDua ? (
                  <DuaIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#0E7490]'}`} />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Push Notification Settings Modal Overlay */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        settings={notificationSettings}
        onUpdateSettings={setNotificationSettings}
        selectedDistrict={selectedDistrict}
      />

      {/* 100% Offline Capability Status Modal Overlay */}
      <OfflineStatusModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        isOnline={isOnline}
      />

      {/* ACJU Regional Guidance Modal (Nallur, Padiyatalawa & Dehiattakandiya) */}
      <RegionalAttentionModal
        isOpen={isRegionalModalOpen}
        onClose={() => setIsRegionalModalOpen(false)}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={handleSelectDistrict}
      />

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-[#CDEFF1]/60 dark:border-[rgba(14,116,144,0.18)] bg-white/70 dark:bg-[rgba(6,14,22,0.90)] backdrop-blur-xl py-5 sm:py-6 px-4 sm:px-6 lg:px-8 text-xs text-[#60757C] pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-4 font-['Anek_Tamil',sans-serif]">

          {/* Main Title & Portal Info */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold text-[#17252B] dark:text-[#E8F7F8] tracking-wide">
              Srilanka Prayer Times
            </h3>
            <p className="text-xs text-[#60757C] dark:text-[#8ECFD8] font-medium">
              Official Sri Lanka Standard Prayer Portal 🇱🇰
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center gap-1.5 text-xs px-5 py-3.5 w-full max-w-md rounded-[20px] bg-white dark:bg-white/10 border border-[#E8F7F8] dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(14,116,144,0.10)] backdrop-blur-md">
            <div className="font-extrabold text-[#0E7490] dark:text-[#67D5DF] flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Quick Links</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              <button
                onClick={() => setActiveTab('calendar')}
                className="inline-flex items-center gap-1.5 text-[#0E7490] dark:text-[#67D5DF] hover:underline font-bold transition-colors cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Official Timetables</span>
              </button>
              <span className="text-[#CDEFF1] dark:text-white/20" aria-hidden>|</span>
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[#0E7490] dark:text-[#67D5DF] hover:underline font-bold transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Push Alerts</span>
              </button>
            </div>
          </div>

          {/* Copyright & Credit */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#8CA5AD] dark:text-[#4A7A86] pt-2 border-t border-[#E8F7F8] dark:border-[rgba(14,116,144,0.18)] w-full">
            <span className="text-[#8CA5AD] dark:text-[#4A7A86]">© 2026 Srilanka Prayer Times</span>
            <span className="hidden sm:inline text-[#CDEFF1] dark:text-[rgba(14,116,144,0.30)]">•</span>
            <a
              href="https://khalidz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#0E7490] dark:text-[#67D5DF] hover:underline font-bold transition-all hover:scale-[1.02]"
            >
              <Zap className="w-3.5 h-3.5 text-[#0E7490] dark:text-[#67D5DF] fill-[#0E7490]/20 dark:fill-[#67D5DF]/20" />
              <span>Powered by khalidz.com</span>
            </a>
          </div>
        </div>
      </footer>

      </div>
    </div>
  );
}
