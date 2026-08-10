import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DayPrayerSchedule, PrayerTimeItem, District } from '../types/prayer';
import { SRI_LANKA_DISTRICTS, getDistrictFullName, getDistrictExplanationNote } from '../utils/sriLankaDistricts';
import { Calendar, Clock, Volume2, VolumeX, ChevronLeft, ChevronRight, Check, ShieldCheck, ChevronDown, Navigation, MapPin, Info, AlertTriangle, Eye } from 'lucide-react';
import { playAdhanTone, stopAdhanTone } from '../utils/audioSynthesizer';
import { isSriLankaToday, getSriLankaTimeParts } from '../utils/prayerCalculator';
import { RegionalAttentionModal } from './RegionalAttentionModal';
import { PrayingManIcon } from './IslamicIcons';

interface HeroTimerProps {
  schedule: DayPrayerSchedule;
  nextPrayer: PrayerTimeItem | null;
  currentPrayer: PrayerTimeItem | null;
  timeRemainingSeconds: number;
  totalIntervalSeconds: number;
  district: District;
  onViewCalendar: () => void;
  selectedDate: Date;
  onChangeDate: (newDate: Date) => void;
  onSelectDistrict?: (district: District) => void;
  onDetectLocation?: () => void;
  isDetectingLocation?: boolean;
  onOpenRegionalModal?: () => void;
  darkMode?: boolean;
}

export const HeroTimer: React.FC<HeroTimerProps> = ({
  schedule,
  nextPrayer,
  currentPrayer,
  timeRemainingSeconds,
  totalIntervalSeconds,
  district,
  onViewCalendar,
  selectedDate,
  onChangeDate,
  onSelectDistrict,
  onDetectLocation,
  isDetectingLocation = false,
  darkMode = false,
}) => {
  /* Dark-mode colour tokens used in inline-style portal elements */
  const dm = {
    bg:          darkMode ? '#0C1E2E'              : '#FFFFFF',
    bgSoft:      darkMode ? 'rgba(14,116,144,0.12)': '#F7FBFC',
    bgAccent:    darkMode ? 'rgba(14,116,144,0.18)': '#E8F7F8',
    border:      darkMode ? 'rgba(14,116,144,0.25)': '#CDEFF1',
    borderSoft:  darkMode ? 'rgba(14,116,144,0.12)': '#E8F7F8',
    text:        darkMode ? '#E8F7F8'              : '#17252B',
    textSec:     darkMode ? '#8ECFD8'              : '#60757C',
    textMuted:   darkMode ? '#5A8D9A'              : '#8CA5AD',
    accent:      darkMode ? '#67D5DF'              : '#0E7490',
  };
  const [isPlayingTestAdhan, setIsPlayingTestAdhan] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [isHeroDistrictOpen, setIsHeroDistrictOpen] = useState(false);
  const [heroDistrictSearch, setHeroDistrictSearch] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [attentionModalOpen, setAttentionModalOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ── Live clock — Sri Lanka Standard Time ── */
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Colombo',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Calculate fixed portal position from trigger button ── */
  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropW = Math.min(window.innerWidth * 0.92, 380);
    // Center horizontally under trigger, clamped to viewport
    let left = rect.left + rect.width / 2 - dropW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - dropW - 8));
    setDropdownStyle({
      top: rect.bottom + 6,
      left,
      width: dropW,
    });
    setIsHeroDistrictOpen(true);
    setHeroDistrictSearch('');
  }, []);

  /* ── Close on outside click/touch or Escape ──
     IMPORTANT: we must check BOTH the trigger AND the portal dropdown.
     The portal lives at document.body so it is NOT inside triggerRef.
     Without this guard, mousedown on a district item closes the dropdown
     before the click event fires — swallowing every selection. */
  useEffect(() => {
    if (!isHeroDistrictOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      // Stay open if click is inside trigger OR inside the portal
      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsHeroDistrictOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsHeroDistrictOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isHeroDistrictOpen]);

  const formatCountdown = (totalSecs: number) => {
    if (totalSecs <= 0) return '00s';
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}h ${m < 10 ? '0' + m : m}m ${s < 10 ? '0' + s : s}s`;
    return `${m}m ${s < 10 ? '0' + s : s}s`;
  };

  const progressPercent = Math.min(100, Math.max(0, 100 - (timeRemainingSeconds / Math.max(1, totalIntervalSeconds)) * 100));
  const dotLeft = `clamp(6px, calc(${progressPercent}% - 6px), calc(100% - 6px))`;

  const handlePrevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onChangeDate(d); };
  const handleNextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onChangeDate(d); };
  const handleTodayReset = () => { onChangeDate(getSriLankaTimeParts(new Date()).dateObj); };

  const isToday = isSriLankaToday(selectedDate);
  const currentMonthName = selectedDate.toLocaleString('default', { month: 'long' }).toUpperCase();

  const getDisplayDateLabel = () => {
    const slToday = getSriLankaTimeParts(new Date()).dateObj;
    const tReset = new Date(slToday.getFullYear(), slToday.getMonth(), slToday.getDate());
    const sReset = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const diffDays = Math.round((sReset.getTime() - tReset.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  };

  const handlePlayAdhanPreview = () => {
    if (isPlayingTestAdhan) { stopAdhanTone(); setIsPlayingTestAdhan(false); }
    else { setIsPlayingTestAdhan(true); playAdhanTone('notify_1'); setTimeout(() => setIsPlayingTestAdhan(false), 6500); }
  };

  const filteredDistricts = SRI_LANKA_DISTRICTS.filter(d => {
    const q = heroDistrictSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      (d.officialNote && d.officialNote.toLowerCase().includes(q)) ||
      (d.officialName && d.officialName.toLowerCase().includes(q)) ||
      (d.tamilName && d.tamilName.toLowerCase().includes(q)) ||
      (d.explanationNote && d.explanationNote.toLowerCase().includes(q)) ||
      d.province.toLowerCase().includes(q) ||
      (q.includes('nallur') && (d.id === 'jaffna' || d.id === 'mullaitivu')) ||
      ((q.includes('padiya') || q.includes('dehiat')) && (d.id === 'badulla' || d.id === 'ampara' || d.id === 'monaragala'))
    );
  });

  const explanation = getDistrictExplanationNote(district);

  /* ── Attention notice — verified bilingual ACJU content per district ── */
  const ATTENTION_IDS = ['ampara', 'jaffna', 'mullaitivu', 'badulla'];
  const showAttention = ATTENTION_IDS.includes(district.id.toLowerCase());

  let attentionEn = '';
  let attentionTa = '';

  if (district.id === 'ampara') {
    attentionEn = 'As per ACJU, residents of Padiyatalawa & Dehiattakandiya should follow the Badulla prayer schedule.';
    attentionTa = 'ACJU அறிவுறுத்தலின்படி, பதியத்தலாவை & தெஹியத்தகண்டிய மக்கள் பதுளை தொழுகை நேர அட்டவணையைப் பின்பற்றவும்.';
  } else if (district.id === 'jaffna') {
    attentionEn = 'As per ACJU, residents of Nallur Division, Mullaitivu District should follow the Jaffna prayer schedule.';
    attentionTa = 'ACJU அறிவுறுத்தலின்படி, முல்லைத்தீவு மாவட்ட நள்ளூர் பிரிவு மக்கள் யாழ்ப்பாண தொழுகை நேர அட்டவணையைப் பின்பற்றவும்.';
  } else if (district.id === 'badulla') {
    attentionEn = 'As per ACJU, Badulla, Monaragala, Padiyatalawa & Dehiattakandiya follow the Badulla prayer schedule.';
    attentionTa = 'ACJU அறிவுறுத்தலின்படி, பதுளை, மொனராகலை, பதியத்தலாவை & தெஹியத்தகண்டிய பகுதிகள் பதுளை தொழுகை நேர அட்டவணையைப் பின்பற்றவும்.';
  } else if (district.id === 'mullaitivu') {
    attentionEn = 'As per ACJU, Nallur Division follows the Jaffna prayer schedule. The rest of Mullaitivu follows the Mullaitivu prayer schedule.';
    attentionTa = 'ACJU அறிவுறுத்தலின்படி, நள்ளூர் பிரிவு யாழ்ப்பாண தொழுகை நேர அட்டவணையையும், முல்லைத்தீவின் ஏனைய பகுதிகள் முல்லைத்தீவு தொழுகை நேர அட்டவணையையும் பின்பற்றவும்.';
  }

  /* ── District dropdown portal ── */
  const districtDropdown = isHeroDistrictOpen && onSelectDistrict
    ? createPortal(
        <div
          ref={dropdownRef}
          className="district-dropdown-portal"
          style={dropdownStyle}
        >
          {/* Search + quick filters */}
          <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid #E8F7F8', flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Search district or area…"
              value={heroDistrictSearch}
              onChange={e => setHeroDistrictSearch(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 8,
                border: `1px solid ${dm.border}`, background: dm.bgSoft,
                fontSize: 12, outline: 'none', color: dm.text, boxSizing: 'border-box',
              }}
            />
            {/* Quick chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 10, color: dm.textMuted, fontWeight: 700, alignSelf: 'center' }}>Quick:</span>
              {[
                { id: 'colombo', label: 'Colombo' },
                { id: 'badulla', label: 'Badulla' },
                { id: 'jaffna',  label: 'Jaffna' },
                { id: 'ampara',  label: 'Ampara' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  className="no-min-h"
                  onClick={() => {
                    const d = SRI_LANKA_DISTRICTS.find(x => x.id === id);
                    if (d && onSelectDistrict) { onSelectDistrict(d); setIsHeroDistrictOpen(false); }
                  }}
                  style={{
                    padding: '2px 8px', borderRadius: 6, border: `1px solid ${dm.border}`,
                    background: dm.bgAccent, color: dm.accent, fontSize: 10,
                    fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* ACJU note */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8, padding: '6px 8px', background: dm.bgAccent, borderRadius: 8, border: `1px solid ${dm.border}`, alignItems: 'flex-start' }}>
              <Info style={{ width: 12, height: 12, color: dm.accent, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 10, color: dm.textSec, lineHeight: 1.4 }}>
                <strong style={{ color: dm.accent }}>ACJU:</strong> Padiyatalawa & Dehiattakandiya → Badulla. Nallur → Jaffna.
              </span>
            </div>
          </div>

          {/* District list — scroll only here, never the whole page */}
          <div className="district-list">
            {filteredDistricts.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#60757C' }}>
                No results for "{heroDistrictSearch}"
              </div>
            ) : (
              <ul>
                {filteredDistricts.map(d => {
                  const isSel = district.id === d.id;
                  return (
                    <li key={d.id}>
                      <button
                        className={`no-min-h ${isSel ? 'selected' : ''}`}
                        onClick={() => { onSelectDistrict(d); setIsHeroDistrictOpen(false); }}
                      >
                        {/* Left: name + tags */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontWeight: 700, color: isSel ? dm.accent : dm.text, fontSize: 12 }}>
                              {getDistrictFullName(d)}
                            </span>
                            {d.tamilName && (
                              <span style={{ fontSize: 10, color: dm.accent, opacity: 0.8 }}>({d.tamilName})</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                            <span style={{ fontSize: 10, color: dm.textMuted }}>{d.province}</span>
                            {d.id === 'badulla' && (
                              <span style={{ fontSize: 9, background: dm.bgAccent, color: dm.accent, padding: '1px 5px', borderRadius: 4, border: `1px solid ${dm.border}`, fontWeight: 700 }}>+Padiyatalawa</span>
                            )}
                            {d.id === 'jaffna' && (
                              <span style={{ fontSize: 9, background: dm.bgAccent, color: dm.accent, padding: '1px 5px', borderRadius: 4, border: `1px solid ${dm.border}`, fontWeight: 700 }}>+Nallur</span>
                            )}
                          </div>
                        </div>
                        {/* Check mark — always reserves fixed width so layout never shifts */}
                        <div style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isSel && <Check style={{ width: 14, height: 14, color: dm.accent }} />}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className="relative rounded-[24px] glass-card transition-all font-['Anek_Tamil',sans-serif]">

        {/* Decorative glow blobs — wrapped so glass-card > * rule doesn't make them block elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[24px]">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#67D5DF]/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#0E7490]/08 blur-3xl" />
        </div>

        {/* Main content */}
        <div className="relative z-10 p-3.5 sm:p-5 space-y-3 sm:space-y-4">

          {/* ── Top Header ── */}
          <div className="flex flex-col items-center text-center gap-2 sm:gap-3 border-b border-[#E8F7F8] pb-3 sm:pb-4">

            {/* Title with praying-man icon */}
            <h2 className="text-sm sm:text-xl font-black tracking-wide text-[#17252B] flex items-center justify-center gap-2 font-['Anek_Tamil',sans-serif] leading-snug">
              <PrayingManIcon className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 text-[#0E7490] dark:text-[#67D5DF]" fill="currentColor" />
              <span>PRAYER TIMES — <span className="text-[#0E7490]">{currentMonthName}</span></span>
            </h2>

            {/* GPS + District selector */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
              {onDetectLocation && (
                <button
                  onClick={onDetectLocation}
                  disabled={isDetectingLocation}
                  title="Auto detect location using GPS"
                  className="no-min-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white/90 border border-[#CDEFF1] text-[#0E7490] hover:bg-[#E8F7F8] text-xs font-bold transition-all active:scale-[0.97] cursor-pointer disabled:opacity-70 shadow-sm"
                >
                  <Navigation className={`w-3.5 h-3.5 text-[#0E7490] shrink-0 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span className="text-[11px]">{isDetectingLocation ? 'Locating…' : 'GPS'}</span>
                </button>
              )}

              {onSelectDistrict && (
                <button
                  ref={triggerRef}
                  onClick={openDropdown}
                  className="no-min-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white/90 border border-[#CDEFF1] text-[#17252B] text-xs font-bold transition-all active:scale-[0.97] hover:border-[#0E7490]/40 hover:bg-[#E8F7F8] cursor-pointer shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
                  <span className="max-w-[110px] sm:max-w-[200px] truncate">{getDistrictFullName(district)}</span>
                  <span className="hidden sm:inline text-[10px] text-[#60757C] font-normal shrink-0">({district.province})</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#0E7490] shrink-0 transition-transform duration-200 ${isHeroDistrictOpen ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Date + Hijri */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="bg-white/90 px-3 py-1 rounded-[8px] border border-[#E8F7F8] text-[11px] font-bold inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap overflow-x-auto max-w-full">
                <span className="text-[#0E7490] font-black shrink-0">Schedule:</span>
                <span className="text-[#17252B]">{schedule.dateFormatted} ({schedule.dayName}) | {schedule.hijriDate}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-[#0E7490] bg-[#E8F7F8] px-3 py-1 rounded-[8px] border border-[#CDEFF1]">
                <ShieldCheck className="w-3 h-3 text-[#0E7490] shrink-0" />
                <span className="font-semibold">Approved by ACJU Sri Lanka</span>
              </div>
            </div>

            {/* Day Switcher + Calendar */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <div className="flex items-center bg-white/90 dark:bg-[#0C1E2E] border border-[#E8F7F8] dark:border-[rgba(14,116,144,0.25)] rounded-[12px] p-0.5 shadow-sm">
                <button
                  onClick={handlePrevDay}
                  className="no-min-h p-1.5 text-[#60757C] dark:text-[#8ECFD8] hover:text-[#0E7490] dark:hover:text-[#67D5DF] hover:bg-[#E8F7F8] dark:hover:bg-[rgba(14,116,144,0.18)] rounded-[8px] transition-colors cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleTodayReset}
                  className="no-min-h px-3 py-1 text-xs font-bold text-[#0E7490] dark:text-[#67D5DF] hover:bg-[#E8F7F8] dark:hover:bg-[rgba(14,116,144,0.18)] rounded-[8px] transition-colors cursor-pointer min-w-[70px] text-center"
                  title={isToday ? 'Current Date (Today)' : 'Click to reset to Today'}
                >
                  {getDisplayDateLabel()}
                </button>

                <button
                  onClick={handleNextDay}
                  className="no-min-h p-1.5 text-[#60757C] dark:text-[#8ECFD8] hover:text-[#0E7490] dark:hover:text-[#67D5DF] hover:bg-[#E8F7F8] dark:hover:bg-[rgba(14,116,144,0.18)] rounded-[8px] transition-colors cursor-pointer"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={onViewCalendar}
                className="no-min-h inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white/90 border border-[#0E7490]/30 text-[#0E7490] hover:bg-[#E8F7F8] text-xs font-bold transition-all active:scale-[0.97] cursor-pointer shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
                <span className="uppercase font-bold whitespace-nowrap">View {currentMonthName}</span>
              </button>
            </div>
          </div>

          {/* ── ATTENTION card — between header controls and Live Adhan ── */}
          {showAttention && (
            <div
              onClick={() => setAttentionModalOpen(true)}
              className="w-full flex items-start justify-between gap-3 px-3.5 py-3 rounded-[14px] bg-red-50 border border-red-200 cursor-pointer hover:border-red-300 transition-all"
            >
              {/* Left: icon + text */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Pulsing icon */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                </div>

                {/* Bilingual text */}
                <div className="min-w-0 flex-1 space-y-1">
                  {/* Badge */}
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                    Attention / முக்கிய அறிவுறுத்தல்
                  </span>
                  {/* English */}
                  <p className="text-[11px] text-red-800 font-semibold leading-snug">{attentionEn}</p>
                  {/* Tamil */}
                  <p className="text-[10px] text-slate-600 font-medium leading-snug font-tamil">{attentionTa}</p>
                </div>
              </div>

              {/* View button */}
              <button
                onClick={e => { e.stopPropagation(); setAttentionModalOpen(true); }}
                className="no-min-h shrink-0 self-start mt-1 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-black whitespace-nowrap transition-all active:scale-95"
              >
                <Eye className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">View</span>
              </button>
            </div>
          )}

          {/* ── Live Countdown Banner ── */}
          <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-b from-[#E8F7F8] to-[#F0FAFB] border border-[#CDEFF1] p-3.5 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_16px_-4px_rgba(14,116,144,0.10)]">
            <div className="flex flex-col items-center gap-3">

              {/* Status */}
              <div className="flex flex-col items-center text-center gap-1.5 w-full">
                <div className="flex items-center gap-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 animate-smooth-red-blink shrink-0" />
                  <span className="text-[10px] font-black tracking-wider uppercase bg-white/90 px-2.5 py-0.5 rounded-[5px] border border-[#CDEFF1] text-[#0E7490] whitespace-nowrap">
                    LIVE ADHAN STATUS
                  </span>
                </div>

                <span className="text-[11px] text-[#60757C] font-semibold">
                  {getDistrictFullName(district)}, Sri Lanka
                </span>

                {explanation && (
                  <div className="text-[11px] text-[#0E7490] bg-white/90 px-3 py-0.5 rounded-full border border-[#CDEFF1] inline-flex items-center gap-1.5 font-medium shadow-sm">
                    <Info className="w-3 h-3 text-[#0E7490] shrink-0" />
                    <span>{explanation}</span>
                  </div>
                )}

                {nextPrayer ? (
                  <h3 className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 text-base sm:text-2xl font-black text-[#17252B] mt-1 font-['Anek_Tamil',sans-serif] leading-tight">
                    <span className="whitespace-nowrap">Next Adhan:</span>
                    <span className="text-[#0E7490] text-xl sm:text-3xl font-black underline decoration-[#67D5DF] decoration-wavy underline-offset-4">
                      {nextPrayer.name}
                    </span>
                    <span className="text-[#0E7490] font-extrabold font-mono whitespace-nowrap text-sm sm:text-base">
                      ({nextPrayer.timeFormatted})
                    </span>
                  </h3>
                ) : (
                  <h3 className="text-lg sm:text-2xl font-black text-[#17252B] mt-1">
                    Adhan Completed for Today
                  </h3>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-1 text-xs text-[#60757C]">
                  <span className="flex items-center gap-1.5">
                    <span>SLST:</span>
                    <strong className="text-[#0E7490] bg-white/90 px-2 py-0.5 rounded-[6px] border border-[#E8F7F8] font-mono text-xs">
                      {currentTimeStr}
                    </strong>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-white/90 border border-[#E8F7F8] text-[#60757C] font-semibold text-[11px]">
                    <ShieldCheck className="w-3 h-3 text-[#0E7490]" />
                    <span>Official SL Standard</span>
                  </span>
                </div>
              </div>

              {/* Countdown + Audio */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-[#CDEFF1] w-full max-w-xs">
                <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-[10px] border border-[#E8F7F8] shadow-sm flex-1 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
                  <span className="text-[10px] font-extrabold text-[#0E7490] uppercase tracking-wider shrink-0">Remaining:</span>
                  <span className="text-xs font-black font-mono text-[#0E7490] tracking-tight ml-auto shrink-0">
                    {formatCountdown(timeRemainingSeconds)}
                  </span>
                </div>
                <button
                  onClick={handlePlayAdhanPreview}
                  className="no-min-h p-2 rounded-[10px] bg-white/90 border border-[#E8F7F8] text-[#0E7490] hover:bg-[#E8F7F8] active:scale-[0.97] transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
                  title="Preview Adhan Audio"
                >
                  {isPlayingTestAdhan ? <VolumeX className="w-4 h-4 text-[#0E7490]" /> : <Volume2 className="w-4 h-4 text-[#0E7490]" />}
                </button>
              </div>
            </div>

            {/* Progress bar + moving dot */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-[#60757C]">
                <span className="truncate max-w-[30%]">↑ {currentPrayer ? currentPrayer.name : 'Start'}</span>
                <span className="text-[#0E7490] shrink-0">{Math.round(progressPercent)}%</span>
                <span className="truncate max-w-[30%] text-right">{nextPrayer ? nextPrayer.name : 'Tomorrow'} ↑</span>
              </div>
              <div className="relative w-full" style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                <div className="w-full h-1.5 rounded-full bg-[#CDEFF1]/70 border border-[#E8F7F8] overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#67D5DF] to-[#0E7490] rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div
                  className="progress-dot absolute w-4 h-4 rounded-full bg-gradient-to-br from-[#67D5DF] to-[#0E7490] border-2 border-white shadow-[0_0_0_2px_rgba(14,116,144,0.35),0_0_8px_rgba(103,213,223,0.6)] pointer-events-none transition-all duration-1000 ease-linear z-10"
                  style={{ left: dotLeft, top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Portal-rendered district dropdown */}
      {districtDropdown}

      {/* Attention detail modal */}
      {showAttention && (
        <RegionalAttentionModal
          isOpen={attentionModalOpen}
          onClose={() => setAttentionModalOpen(false)}
          selectedDistrict={district}
          onSelectDistrict={onSelectDistrict ?? (() => {})}
        />
      )}
    </>
  );
};
