import React from 'react';
import { createPortal } from 'react-dom';
import { District } from '../types/prayer';
import { SRI_LANKA_DISTRICTS } from '../utils/sriLankaDistricts';
import { AlertTriangle, X, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

interface RegionalAttentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: District;
  onSelectDistrict: (district: District) => void;
}

export const RegionalAttentionModal: React.FC<RegionalAttentionModalProps> = ({
  isOpen,
  onClose,
  selectedDistrict,
  onSelectDistrict,
}) => {
  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  const badullaDistrict    = SRI_LANKA_DISTRICTS.find((d) => d.id === 'badulla');
  const jaffnaDistrict     = SRI_LANKA_DISTRICTS.find((d) => d.id === 'jaffna');
  const amparaDistrict     = SRI_LANKA_DISTRICTS.find((d) => d.id === 'ampara');
  const mullaitivuDistrict = SRI_LANKA_DISTRICTS.find((d) => d.id === 'mullaitivu');

  const isBadullaActive    = selectedDistrict.id === 'badulla';
  const isJaffnaActive     = selectedDistrict.id === 'jaffna';
  const isMullaitivuActive = selectedDistrict.id === 'mullaitivu';
  const isAmparaActive     = selectedDistrict.id === 'ampara';

  const handleSwitchAndClose = (district: District) => {
    onSelectDistrict(district);
    onClose();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 dark:bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-[28px] bg-white dark:bg-[#0C1E2E] backdrop-blur-xl border-2 border-red-300 dark:border-red-800/60 shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col font-['Anek_Tamil',sans-serif]">

        {/* ── Sticky Top Header — Always on top, close button always visible & clickable ── */}
        <div className="sticky top-0 z-20 bg-white/98 dark:bg-[#0C1E2E]/98 backdrop-blur-md px-4 sm:px-7 pt-4 sm:pt-6 pb-3.5 border-b border-slate-100 dark:border-[rgba(14,116,144,0.18)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700/40 shrink-0 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white bg-red-600 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap inline-block">
                ACJU Official Zone Guidance
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-[#E8F7F8] mt-0.5 font-['Anek_Tamil',sans-serif] leading-tight truncate">
                Attention for Nallur, Padiyatalawa &amp; Dehiattakandiya
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-slate-100 dark:bg-[rgba(14,116,144,0.15)] text-slate-600 dark:text-[#8ECFD8] hover:text-slate-900 dark:hover:text-[#E8F7F8] hover:bg-slate-200 dark:hover:bg-[rgba(14,116,144,0.30)] transition-all active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto px-4 sm:px-7 py-4 space-y-4 sm:space-y-5 flex-1">

          {/* Intro paragraph */}
          <p className="text-xs text-slate-700 dark:text-[#8ECFD8] leading-relaxed font-medium">
            According to the All Ceylon Jamiyyathul Ulama (ACJU) official Sri Lanka prayer timetable guidance, residents
            in specific divisional secretariats must use designated district timetables for accurate adhan calculation.
            <span className="block mt-1 text-[#0E7490] dark:text-[#67D5DF] font-['Anek_Tamil',sans-serif]">
              அகில இலங்கை ஜமய்யத்துல் உலமா (ACJU) அதிகாரப்பூர்வ தொழுகை நேர வழிகாட்டலின்படி, குறிப்பிட்ட பிரதேச
              செயலகப் பிரிவுகளைச் சேர்ந்தவர்கள் துல்லியமான தொழுகை நேரத்திற்கு குறிப்பிட்ட மாவட்ட
              அட்டவணைகளைப் பயன்படுத்த வேண்டும்.
            </span>
          </p>

          {/* Region Cards */}
          <div className="space-y-3.5">
            {/* Card 1: Padiyatalawa & Dehiattakandiya */}
            <div className={`p-3.5 sm:p-4 rounded-[22px] border-2 transition-all ${
              isBadullaActive
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700/50'
                : 'bg-slate-50 dark:bg-[rgba(14,116,144,0.07)] border-slate-200 dark:border-[rgba(14,116,144,0.18)] hover:border-red-200 dark:hover:border-red-700/40'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-[#E8F7F8]">Padiyatalawa &amp; Dehiattakandiya</h4>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-red-500 dark:text-red-400 font-bold font-tamil mt-0.5">
                    படியத்தலாவ மற்றும் தெஹியத்தகண்டிய பகுதிகள்
                  </p>
                </div>
                {isBadullaActive && (
                  <span className="text-[9px] sm:text-[10px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-white" /> Active / செயலில்
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-700 dark:text-[#8ECFD8] mt-2 leading-relaxed space-y-1">
                <p>
                  These divisions are in Ampara District geographically, but <strong>ACJU specifies following the Badulla / Uva Zone timetable</strong>.
                </p>
                <p className="text-[#0E7490] dark:text-[#67D5DF] font-['Anek_Tamil',sans-serif]">
                  இப்பகுதிகள் புவியியல் ரீதியாக அம்பாறை மாவட்டத்தில் அமைந்திருந்தாலும், <strong>ACJU வழிகாட்டலின்படி பதுளை / ஊவா பிராந்திய தொழுகை அட்டவணையையே பின்பற்ற வேண்டும்</strong>.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-[rgba(14,116,144,0.18)] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] sm:text-xs text-slate-600 dark:text-[#8ECFD8]">
                  Official Timetable: <strong className="text-red-600 dark:text-red-400">Badulla District (பதுளை)</strong>
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {badullaDistrict && (
                    <button
                      onClick={() => handleSwitchAndClose(badullaDistrict)}
                      className={`px-3 py-1.5 rounded-[12px] text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isBadullaActive
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-600 text-red-700 dark:text-red-400 hover:text-white'
                      }`}
                    >
                      <span>{isBadullaActive ? 'Active (Badulla)' : 'Switch to Badulla Schedule'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {amparaDistrict && (
                    <button
                      onClick={() => handleSwitchAndClose(amparaDistrict)}
                      className={`px-2.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                        isAmparaActive
                          ? 'bg-slate-200 dark:bg-[rgba(14,116,144,0.25)] text-slate-900 dark:text-[#E8F7F8]'
                          : 'bg-slate-100 dark:bg-[rgba(14,116,144,0.10)] hover:bg-slate-200 dark:hover:bg-[rgba(14,116,144,0.18)] text-slate-700 dark:text-[#8ECFD8]'
                      }`}
                    >
                      Ampara District
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Nallur Division */}
            <div className={`p-3.5 sm:p-4 rounded-[22px] border-2 transition-all ${
              isJaffnaActive || isMullaitivuActive
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700/50'
                : 'bg-slate-50 dark:bg-[rgba(14,116,144,0.07)] border-slate-200 dark:border-[rgba(14,116,144,0.18)] hover:border-red-200 dark:hover:border-red-700/40'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-[#E8F7F8]">Nallur Division (Mullaitivu District)</h4>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-red-500 dark:text-red-400 font-bold font-tamil mt-0.5">
                    நல்லூர் பிரிவு (முல்லைத்தீவு மாவட்டம்)
                  </p>
                </div>
                {(isJaffnaActive || isMullaitivuActive) && (
                  <span className="text-[9px] sm:text-[10px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-white" /> Active / செயலில்
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-700 dark:text-[#8ECFD8] mt-2 leading-relaxed space-y-1">
                <p>
                  Nallur Division is part of Mullaitivu District, but <strong>ACJU guidelines specify that Nallur Division follows the Jaffna District timetable</strong>.
                </p>
                <p className="text-[#0E7490] dark:text-[#67D5DF] font-['Anek_Tamil',sans-serif]">
                  நல்லூர் பிரிவு முல்லைத்தீவு மாவட்டத்திற்குட்பட்ட பகுதியாகும். எனினும் <strong>ACJU வழிகாட்டலின்படி நல்லூர் பிரிவு யாழ்ப்பாண மாவட்ட தொழுகை அட்டவணையையே பின்பற்ற வேண்டும்</strong>.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-[rgba(14,116,144,0.18)] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] sm:text-xs text-slate-600 dark:text-[#8ECFD8]">
                  Official Timetables: <strong className="text-red-600 dark:text-red-400">Jaffna (for Nallur)</strong> &amp; <strong className="text-red-600 dark:text-red-400">Mullaitivu</strong>
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {jaffnaDistrict && (
                    <button
                      onClick={() => handleSwitchAndClose(jaffnaDistrict)}
                      className={`px-3 py-1.5 rounded-[12px] text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isJaffnaActive
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-600 text-red-700 dark:text-red-400 hover:text-white'
                      }`}
                    >
                      <span>{isJaffnaActive ? 'Active (Jaffna/Nallur)' : 'Jaffna & Nallur Schedule'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {mullaitivuDistrict && (
                    <button
                      onClick={() => handleSwitchAndClose(mullaitivuDistrict)}
                      className={`px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                        isMullaitivuActive
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 dark:bg-[rgba(14,116,144,0.10)] hover:bg-slate-200 dark:hover:bg-[rgba(14,116,144,0.18)] text-slate-700 dark:text-[#8ECFD8]'
                      }`}
                    >
                      <span>{isMullaitivuActive ? 'Active (Mullaitivu)' : 'Mullaitivu District'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick District Jump */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-[rgba(14,116,144,0.18)] space-y-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider block">
              Directly Switch To Any District:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SRI_LANKA_DISTRICTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSwitchAndClose(d)}
                  className={`px-2.5 py-1 rounded-[10px] text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                    selectedDistrict.id === d.id
                      ? 'bg-red-600 text-white font-black'
                      : 'bg-slate-100 dark:bg-[rgba(14,116,144,0.10)] hover:bg-red-100 dark:hover:bg-red-900/25 text-slate-700 dark:text-[#8ECFD8] hover:text-red-700 dark:hover:text-red-400'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-4 sm:px-7 py-3 border-t border-slate-100 dark:border-[rgba(14,116,144,0.18)] bg-slate-50/80 dark:bg-[#0C1E2E]/80 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 sm:px-6 py-2 rounded-[14px] bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all active:scale-95 cursor-pointer"
          >
            Done &amp; Close View
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
