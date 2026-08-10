import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NotificationSettings, PrayerKey, District } from '../types/prayer';
import { requestNotificationPermission, sendPrayerNotification, saveNotificationSettings } from '../utils/notifications';
import { getDistrictFullName } from '../utils/sriLankaDistricts';
import { Bell, BellRing, X, Check, ShieldCheck, Volume2, VolumeX, Music, Square } from 'lucide-react';
import { playAdhanTone, stopAdhanTone, SoundPreset } from '../utils/audioSynthesizer';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  selectedDistrict: District;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  selectedDistrict,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus('granted');
      const updated = { ...settings, pushEnabled: true };
      onUpdateSettings(updated);
      saveNotificationSettings(updated);
    } else {
      setPermissionStatus(Notification.permission);
    }
  };

  const handleTogglePush = async () => {
    if (!settings.pushEnabled && permissionStatus !== 'granted') {
      await handleRequestPermission();
    } else {
      const updated = { ...settings, pushEnabled: !settings.pushEnabled };
      onUpdateSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    onUpdateSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleSelectSoundPreset = (preset: SoundPreset) => {
    const updated = { ...settings, soundPreset: preset, soundEnabled: true };
    onUpdateSettings(updated);
    saveNotificationSettings(updated);

    // Play preview automatically when selecting
    setIsPlayingAudio(true);
    playAdhanTone(preset);
  };

  const handlePlaySoundPreview = () => {
    if (isPlayingAudio) {
      stopAdhanTone();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const preset = settings.soundPreset || 'notify_1';
      playAdhanTone(preset);
    }
  };

  const handleTogglePrayer = (key: PrayerKey) => {
    const updated = {
      ...settings,
      prayers: {
        ...settings.prayers,
        [key]: !settings.prayers[key],
      },
    };
    onUpdateSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTestNotification = () => {
    sendPrayerNotification(
      'Fajr',
      getDistrictFullName(selectedDistrict),
      false,
      settings.soundEnabled,
      settings.soundPreset || 'notify_1'
    );
  };

  const prayerKeys: { key: PrayerKey; label: string }[] = [
    { key: 'Fajr', label: 'Fajr Adhan' },
    { key: 'Dhuhr', label: 'Dhuhr Adhan' },
    { key: 'Asr', label: 'Asr Adhan' },
    { key: 'Maghrib', label: 'Maghrib Adhan' },
    { key: 'Isha', label: 'Isha Adhan' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md animate-fadeIn font-['Anek_Tamil',sans-serif]">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] bg-white/96 backdrop-blur-xl shadow-[0_24px_64px_-12px_rgba(14,116,144,0.22)] p-4 sm:p-8 space-y-5 sm:space-y-6 text-[#17252B] border border-[#CDEFF1]/60">
        
        {/* Header */}
        <div className="sticky -top-4 sm:-top-8 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-4 sm:pt-8 pb-4 bg-white/95 backdrop-blur-md z-10 flex items-center justify-between border-b border-[#E8F7F8]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-[14px] bg-[#E8F7F8] border border-[#CDEFF1] text-[#0E7490]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#17252B] font-['Anek_Tamil',sans-serif]">Push & Adhan Sound Alerts</h3>
              <p className="text-xs text-[#60757C]">Configure Audio Melody & Notifications</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopAdhanTone();
              onClose();
            }}
            className="p-2 rounded-[12px] bg-[#F7FBFC] border border-[#E8F7F8] text-[#60757C] hover:text-[#17252B] hover:bg-[#E8F7F8] transition-all active:scale-[0.97] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission Banner */}
        <div className="p-4 rounded-[16px] bg-[#F7FBFC] border border-[#E8F7F8] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#0E7490]" />
              <span className="text-xs font-bold text-[#17252B]">Browser Notification Permission</span>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-[6px] ${
              permissionStatus === 'granted'
                ? 'bg-[#E8F7F8] text-[#0E7490] border border-[#CDEFF1]'
                : 'bg-[#F7FBFC] text-[#60757C] border border-[#E8F7F8]'
            }`}>
              {permissionStatus}
            </span>
          </div>

          {permissionStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="w-full py-2.5 rounded-[12px] bg-gradient-to-b from-[#138BA6] to-[#0E7490] hover:from-[#0E7490] hover:to-[#0F6074] text-white font-extrabold text-xs transition-all active:scale-[0.97] cursor-pointer shadow-[0_4px_14px_-4px_rgba(14,116,144,0.38)]"
            >
              Grant Browser Notification Permission
            </button>
          )}
        </div>

        {/* Global Sound & Push Toggles */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3.5 rounded-[14px] bg-[#F7FBFC] border border-[#E8F7F8]">
            <div>
              <span className="block text-xs font-bold text-[#17252B]">Enable Push Notifications</span>
              <span className="text-[10px] text-[#60757C]">Receive browser popups at exact Adhan times</span>
            </div>
            <button
              onClick={handleTogglePush}
              className={`toggle-switch no-min-h ${settings.pushEnabled ? 'on' : 'off'}`}
              aria-checked={settings.pushEnabled}
              role="switch"
              aria-label="Enable Push Notifications"
            />
          </div>


          <div className="flex items-center justify-between p-3.5 rounded-[14px] bg-[#F7FBFC] border border-[#E8F7F8]">
            <div>
              <span className="block text-xs font-bold text-[#17252B]">Adhan Sound Notification</span>
              <span className="text-[10px] text-[#60757C]">Play rich acoustic Takbeer sound when prayer time arrives</span>
            </div>
            <button
              onClick={handleToggleSound}
              className={`toggle-switch no-min-h ${settings.soundEnabled ? 'on' : 'off'}`}
              aria-checked={settings.soundEnabled}
              role="switch"
              aria-label="Adhan Sound Notification"
            />
          </div>
        </div>

        {/* Adhan Sound Presets */}
        <div className="space-y-2.5 p-4 rounded-[18px] bg-[#E8F7F8]/60 border border-[#CDEFF1]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4 text-[#0E7490]" />
              <h4 className="text-xs font-extrabold text-[#0E7490] uppercase tracking-wider">Adhan Sound Tone Style</h4>
            </div>
            <button
              onClick={handlePlaySoundPreview}
              className="px-3 py-1.5 rounded-[10px] bg-gradient-to-b from-[#138BA6] to-[#0E7490] hover:from-[#0E7490] hover:to-[#0F6074] text-white text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-[0.97] cursor-pointer shadow-[0_4px_10px_-2px_rgba(14,116,144,0.35)]"
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3 h-3 text-white fill-current" />
                  <span>Stop Sound</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-white" />
                  <span>Preview Sound</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {/* 1. Notification Sound v1 */}
            <button
              onClick={() => handleSelectSoundPreset('notify_1')}
              className={`p-3 rounded-[14px] text-left transition-all cursor-pointer border ${
                (settings.soundPreset || 'notify_1') === 'notify_1'
                  ? 'bg-white border-[#0E7490] text-[#0E7490] shadow-[0_2px_8px_-2px_rgba(14,116,144,0.20)]'
                  : 'bg-white/80 border-[#E8F7F8] text-[#60757C] hover:border-[#CDEFF1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Notification Sound v1</span>
                <span className="text-[9px] font-bold uppercase bg-[#E8F7F8] text-[#0E7490] px-1.5 py-0.5 rounded-full border border-[#CDEFF1]">Default</span>
              </div>
              <span className="text-[10px] opacity-75 block mt-0.5">iPhone Notification Sound</span>
            </button>

            {/* 2. Notification Sound v2 */}
            <button
              onClick={() => handleSelectSoundPreset('notify_2')}
              className={`p-3 rounded-[14px] text-left transition-all cursor-pointer border ${
                settings.soundPreset === 'notify_2'
                  ? 'bg-white border-[#0E7490] text-[#0E7490] shadow-[0_2px_8px_-2px_rgba(14,116,144,0.20)]'
                  : 'bg-white/80 border-[#E8F7F8] text-[#60757C] hover:border-[#CDEFF1]'
              }`}
            >
              <span className="block text-xs font-black">Notification Sound v2</span>
              <span className="text-[10px] opacity-75 block mt-0.5">iPhone Pay Sound</span>
            </button>

            {/* 3. Short Adhan */}
            <button
              onClick={() => handleSelectSoundPreset('short_adhan')}
              className={`p-3 rounded-[14px] text-left transition-all cursor-pointer border ${
                settings.soundPreset === 'short_adhan'
                  ? 'bg-white border-[#0E7490] text-[#0E7490] shadow-[0_2px_8px_-2px_rgba(14,116,144,0.20)]'
                  : 'bg-white/80 border-[#E8F7F8] text-[#60757C] hover:border-[#CDEFF1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Short Adhan</span>
                <span className="text-[9px] font-bold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">Vocal</span>
              </div>
              <span className="text-[10px] opacity-75 block mt-0.5">By Medi Yarrahi</span>
            </button>

            {/* 4. Full Adhan v1 */}
            <button
              onClick={() => handleSelectSoundPreset('full_adhan_1')}
              className={`p-3 rounded-[14px] text-left transition-all cursor-pointer border ${
                settings.soundPreset === 'full_adhan_1'
                  ? 'bg-white border-[#0E7490] text-[#0E7490] shadow-[0_2px_8px_-2px_rgba(14,116,144,0.20)]'
                  : 'bg-white/80 border-[#E8F7F8] text-[#60757C] hover:border-[#CDEFF1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Full Adhan v1</span>
                <span className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">Full Vocal</span>
              </div>
              <span className="text-[10px] opacity-75 block mt-0.5">By Omar Hisham Al Arabi</span>
            </button>

            {/* 5. Full Adhan v2 */}
            <button
              onClick={() => handleSelectSoundPreset('full_adhan_2')}
              className={`p-3 rounded-[14px] text-left transition-all cursor-pointer border ${
                settings.soundPreset === 'full_adhan_2'
                  ? 'bg-white border-[#0E7490] text-[#0E7490] shadow-[0_2px_8px_-2px_rgba(14,116,144,0.20)]'
                  : 'bg-white/80 border-[#E8F7F8] text-[#60757C] hover:border-[#CDEFF1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Full Adhan v2</span>
                <span className="text-[9px] font-bold uppercase bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded-full border border-cyan-200">Full Vocal</span>
              </div>
              <span className="text-[10px] opacity-75 block mt-0.5">By Mevlan Kurtishi</span>
            </button>

            {/* 6. Full Adhan v3 */}
            <button
              onClick={() => handleSelectSoundPreset('full_adhan_3')}
              className={`p-3 rounded-[14px] text-left transition-all cursor-pointer border ${
                settings.soundPreset === 'full_adhan_3'
                  ? 'bg-white border-[#0E7490] text-[#0E7490] shadow-[0_2px_8px_-2px_rgba(14,116,144,0.20)]'
                  : 'bg-white/80 border-[#E8F7F8] text-[#60757C] hover:border-[#CDEFF1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">Full Adhan v3</span>
                <span className="text-[9px] font-bold uppercase bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full border border-purple-200">Full Vocal</span>
              </div>
              <span className="text-[10px] opacity-75 block mt-0.5">By Medi Yarrahi</span>
            </button>
          </div>

          {isPlayingAudio && (
            <div className="flex items-center justify-center space-x-1 py-1.5">
              <span className="text-[10px] text-[#0E7490] font-bold mr-2">Playing Adhan Tone...</span>
              <div className="w-1.5 h-3 bg-[#0E7490] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-4 bg-[#0E7490] rounded-full animate-bounce [animation-delay:0.15s]"></div>
              <div className="w-1.5 h-2 bg-[#0E7490] rounded-full animate-bounce [animation-delay:0.3s]"></div>
            </div>
          )}
        </div>

        {/* Per-Prayer Notification Matrix */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-[#0E7490] uppercase tracking-wider">Per-Prayer Sound & Push Alerts</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {prayerKeys.map(({ key }) => {
              const isChecked = settings.prayers[key];
              return (
                <button
                  key={key}
                  onClick={() => handleTogglePrayer(key)}
                  className={`p-3 rounded-[12px] text-xs font-bold flex items-center justify-between transition-all active:scale-[0.97] cursor-pointer ${
                    isChecked
                      ? 'bg-gradient-to-b from-[#138BA6] to-[#0E7490] text-white shadow-[0_4px_10px_-2px_rgba(14,116,144,0.35)]'
                      : 'bg-[#F7FBFC] border border-[#E8F7F8] text-[#60757C] hover:bg-[#E8F7F8] hover:text-[#0E7490]'
                  }`}
                >
                  <span>{key}</span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky -bottom-4 sm:-bottom-8 -mx-4 sm:-mx-8 px-4 sm:px-8 pb-4 sm:pb-8 pt-3 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#E8F7F8]">
          <button
            onClick={handleTestNotification}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-[12px] bg-[#F7FBFC] border border-[#E8F7F8] hover:bg-[#E8F7F8] text-[#17252B] text-xs font-bold transition-all active:scale-[0.97] cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5 text-[#0E7490]" />
            <span>Send Test Push & Sound Alert</span>
          </button>

          <button
            onClick={() => {
              stopAdhanTone();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-[12px] bg-gradient-to-b from-[#138BA6] to-[#0E7490] hover:from-[#0E7490] hover:to-[#0F6074] text-white text-xs font-extrabold transition-all active:scale-[0.97] cursor-pointer shadow-[0_4px_14px_-4px_rgba(14,116,144,0.38)]"
          >
            Done
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
