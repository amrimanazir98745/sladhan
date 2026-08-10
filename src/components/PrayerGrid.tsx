import React from 'react';
import { PrayerTimeItem, PrayerKey } from '../types/prayer';
import { Sunrise, Sun, Sunset, Moon, SunMedium, SunDim, CloudSun, Bell, BellOff } from 'lucide-react';

interface PrayerGridProps {
  prayers: PrayerTimeItem[];
  activeNotificationPrayers: Record<PrayerKey, boolean>;
  onToggleNotification: (key: PrayerKey) => void;
}

export const PrayerGrid: React.FC<PrayerGridProps> = ({
  prayers,
  activeNotificationPrayers,
  onToggleNotification,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudSun':  return <CloudSun className="w-5 h-5" />;
      case 'Sunrise':   return <Sunrise className="w-5 h-5" />;
      case 'SunMedium': return <SunMedium className="w-5 h-5" />;
      case 'Sun':       return <Sun className="w-5 h-5" />;
      case 'SunDim':    return <SunDim className="w-5 h-5" />;
      case 'Sunset':    return <Sunset className="w-5 h-5" />;
      case 'Moon':
      default:          return <Moon className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 font-['Anek_Tamil',sans-serif]">
      {prayers.map((prayer) => {
        const isNotified = activeNotificationPrayers[prayer.key];

        return (
          <div
            key={prayer.key}
            className={`relative flex flex-col h-full rounded-[20px] p-3.5 sm:p-4 transition-all duration-200 ${
              prayer.isNext
                ? 'bg-gradient-to-b from-[#E8F7F8] to-[#CDEFF1]/70 dark:from-[#0A2A35] dark:to-[#0E3D4D] border-2 border-[#0E7490] shadow-[0_8px_24px_-6px_rgba(14,116,144,0.40)] scale-[1.02] sm:scale-[1.03] z-10'
                : 'bg-white dark:bg-[#0A1E28] border border-[#E8F7F8] dark:border-[rgba(14,116,144,0.22)] shadow-[0_2px_12px_-4px_rgba(14,116,144,0.10)] hover:border-[#CDEFF1] dark:hover:border-[rgba(14,116,144,0.40)] hover:shadow-[0_6px_20px_-4px_rgba(14,116,144,0.18)] hover:-translate-y-0.5'
            }`}
          >
            {/* ── Row 1: Icon + Bell ── */}
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-[12px] ${
                prayer.isNext
                  ? 'bg-[#0E7490] text-white shadow-[0_2px_8px_-2px_rgba(14,116,144,0.40)]'
                  : 'bg-[#E8F7F8] dark:bg-[rgba(14,116,144,0.18)] border border-[#CDEFF1] dark:border-[rgba(14,116,144,0.25)] text-[#0E7490] dark:text-[#67D5DF]'
              }`}>
                {getIcon(prayer.iconName)}
              </div>

              {prayer.key !== 'Sunrise' && (
                <button
                  onClick={() => onToggleNotification(prayer.key)}
                  className={`p-2 rounded-[12px] transition-all active:scale-[0.97] cursor-pointer ${
                    isNotified
                      ? prayer.isNext
                        ? 'text-white bg-[#0E7490] shadow-[0_2px_6px_-2px_rgba(14,116,144,0.35)]'
                        : 'text-[#0E7490] dark:text-[#67D5DF] bg-[#E8F7F8] dark:bg-[rgba(14,116,144,0.18)] border border-[#CDEFF1] dark:border-[rgba(14,116,144,0.25)]'
                      : 'text-[#8CA5AD] dark:text-[#5A8D9A] hover:text-[#60757C] dark:hover:text-[#8ECFD8] hover:bg-[#F7FBFC] dark:hover:bg-[rgba(14,116,144,0.10)]'
                  }`}
                  title={isNotified ? 'Adhan notification ON' : 'Adhan notification OFF'}
                >
                  {isNotified ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* ── Row 2: Name + Arabic ── */}
            <div className="mt-3 sm:mt-4 flex-1 space-y-0.5">
              <div className="flex items-baseline justify-between gap-1">
                <h4 className={`text-sm sm:text-base font-black leading-tight ${
                  prayer.isNext ? 'text-[#0E7490] dark:text-[#67D5DF]' : 'text-[#17252B] dark:text-[#E8F7F8]'
                }`}>
                  {prayer.name}
                </h4>
                <span className={`font-arabic text-sm font-bold shrink-0 ${
                  prayer.isNext ? 'text-[#0E7490] dark:text-[#67D5DF]' : 'text-[#0E7490]/70 dark:text-[#67D5DF]/60'
                }`}>
                  {prayer.arabicName}
                </span>
              </div>
              <p className="text-[10px] text-[#60757C] dark:text-[#5A8D9A] font-semibold leading-tight font-sinhala">
                {prayer.sinhalaName} · {prayer.tamilName}
              </p>
            </div>

            {/* ── Row 3: Time + NEXT badge ── */}
            <div className="mt-3 sm:mt-4 flex items-center justify-between gap-1.5 flex-wrap">
              <span className={`font-mono text-sm sm:text-base font-black tabular-nums leading-none ${
                prayer.isNext ? 'text-[#0E7490] dark:text-[#67D5DF]' : 'text-[#17252B] dark:text-[#E8F7F8]'
              }`}>
                {prayer.time12}
              </span>

              {prayer.isNext && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0E7490] dark:bg-[#0E7490]/80 text-white text-[9px] font-black uppercase tracking-wide whitespace-nowrap shrink-0">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-80" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                  </span>
                  NEXT
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
