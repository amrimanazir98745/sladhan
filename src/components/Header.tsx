import React from 'react';
import { Bell, Calendar, Clock, Download, Sun, Moon } from 'lucide-react';
import { TasbihIcon, DuaIcon, WebsiteLogoIcon } from './IslamicIcons';

interface HeaderProps {
  activeTab: 'today' | 'calendar' | 'tasbih' | 'duas';
  setActiveTab: (tab: 'today' | 'calendar' | 'tasbih' | 'duas') => void;
  hijriDate: string;
  onOpenNotifications: () => void;
  onInstallPwa?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hijriDate,
  onOpenNotifications,
  onInstallPwa,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-[#CDEFF1]/50 dark:border-[#0E7490]/20 transition-all duration-300 font-['Anek_Tamil',sans-serif]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-2">

          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0 flex-1"
            onClick={() => setActiveTab('today')}
          >
            <div className="relative flex items-center justify-center shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full transition-transform hover:scale-105">
              <WebsiteLogoIcon className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="text-sm sm:text-lg font-black text-[#17252B] dark:text-[#E8F7F8] tracking-wide font-['Anek_Tamil',sans-serif] truncate">
                  Srilanka <span className="text-[#0E7490] dark:text-[#67D5DF]">Prayer Times</span>
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-[#60757C] dark:text-[#8ECFD8] font-medium leading-none mt-0.5 truncate">
                {hijriDate}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {onInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="px-2.5 sm:px-3.5 py-2 rounded-[12px] bg-gradient-to-b from-[#138BA6] to-[#0E7490] hover:from-[#0E7490] hover:to-[#0F6074] text-white text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-[0.97] cursor-pointer shadow-[0_4px_14px_-4px_rgba(14,116,144,0.40)] shrink-0"
                title="Download App / Add to Home Screen"
              >
                <Download className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="hidden sm:inline">Download App</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleDarkMode();
              }}
              className="relative p-2.5 sm:p-3 rounded-[12px] bg-white/80 dark:bg-[#0E7490]/15 border border-[#CDEFF1] dark:border-[#0E7490]/30 text-[#0E7490] dark:text-[#67D5DF] hover:bg-[#E8F7F8] dark:hover:bg-[#0E7490]/25 transition-all active:scale-[0.97] flex items-center justify-center cursor-pointer shadow-[0_2px_8px_-2px_rgba(14,116,144,0.12)] shrink-0"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 sm:p-3 rounded-[12px] bg-white/80 dark:bg-[#0E7490]/15 border border-[#CDEFF1] dark:border-[#0E7490]/30 text-[#0E7490] dark:text-[#67D5DF] hover:bg-[#E8F7F8] dark:hover:bg-[#0E7490]/25 transition-all active:scale-[0.97] flex items-center justify-center cursor-pointer shadow-[0_2px_8px_-2px_rgba(14,116,144,0.12)] shrink-0"
              title="Push Notification Settings"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#0E7490] dark:bg-[#67D5DF] rounded-full" />
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1.5 border-t border-[#E8F7F8] dark:border-[#0E7490]/15 py-2">
          {([
            { id: 'today',    label: "Today's Schedule",  Icon: Clock },
            { id: 'calendar', label: 'Monthly Calendar',   Icon: Calendar },
            { id: 'tasbih',   label: 'Digital Tasbih',     Icon: null, isTasbih: true },
            { id: 'duas',     label: 'Daily Duas',          Icon: null, isDua: true },
          ] as any[]).map(({ id, label, Icon, isTasbih, isDua }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-[12px] text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-[#138BA6] to-[#0E7490] text-white shadow-[0_4px_12px_-2px_rgba(14,116,144,0.38)]'
                    : 'text-[#60757C] dark:text-[#8ECFD8] hover:text-[#0E7490] dark:hover:text-[#67D5DF] hover:bg-[#E8F7F8] dark:hover:bg-[#0E7490]/10 border border-transparent hover:border-[#CDEFF1] dark:hover:border-[#0E7490]/25'
                }`}
              >
                {isTasbih ? (
                  <TasbihIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#0E7490] dark:text-[#67D5DF]'}`} />
                ) : isDua ? (
                  <DuaIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#0E7490] dark:text-[#67D5DF]'}`} />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#0E7490] dark:text-[#67D5DF]'}`} />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
