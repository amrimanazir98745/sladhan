import React, { useState } from 'react';
import { District } from '../types/prayer';
import { RegionalAttentionModal } from './RegionalAttentionModal';
import { AlertTriangle, ChevronRight, Eye } from 'lucide-react';

interface RegionalAttentionBannerProps {
  selectedDistrict: District;
  onSelectDistrict: (district: District) => void;
}

const ATTENTION_DISTRICT_IDS = ['ampara', 'jaffna', 'mullaitivu', 'badulla'];

export const RegionalAttentionBanner: React.FC<RegionalAttentionBannerProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Attention banner only shows if the selected district is Ampara, Jaffna, Mullaitivu, or Badulla
  const isAttentionDistrict = ATTENTION_DISTRICT_IDS.includes(
    selectedDistrict.id.toLowerCase()
  );

  if (!isAttentionDistrict) {
    return null;
  }

  // Customize dynamic label and subtext based on selected district (Bilingual English & Tamil)
  let districtNoticeTitleEn = 'Nallur, Padiyatalawa & Dehiattakandiya Note';
  let districtNoticeTitleTa = 'நல்லூர், படியத்தலாவ & தெஹியத்தகண்டிய குறிப்பு';
  let districtNoticeDetailEn = 'ACJU Official Schedule Note for this region. Click to view or switch schedule.';
  let districtNoticeDetailTa = 'இப்பிராந்தியத்திற்கான ACJU அதிகாரப்பூர்வ தொழுகை நேர வழிகாட்டல்.';

  if (selectedDistrict.id === 'ampara') {
    districtNoticeTitleEn = 'Ampara: Padiyatalawa & Dehiattakandiya Note';
    districtNoticeTitleTa = 'படியத்தலாவ & தெஹியத்தகண்டிய பிராந்திய குறிப்பு';
    districtNoticeDetailEn = 'Residents in Padiyatalawa & Dehiattakandiya follow Badulla schedule per ACJU.';
    districtNoticeDetailTa = 'படியத்தலாவ, தெஹியத்தகண்டிய வாசிகள் ACJU வழிகாட்டலின்படி பதுளை அட்டவணையைப் பின்பற்றவும்.';
  } else if (selectedDistrict.id === 'jaffna') {
    districtNoticeTitleEn = 'Nallur Division (Mullaitivu District) & Jaffna Note';
    districtNoticeTitleTa = 'நல்லூர் பிரிவு (முல்லைத்தீவு) & யாழ்ப்பாண நேரம்';
    districtNoticeDetailEn = 'Nallur Division in Mullaitivu District follows Jaffna schedule per ACJU.';
    districtNoticeDetailTa = 'முல்லைத்தீவு மாவட்ட நல்லூர் பிரிவு ACJU வழிகாட்டலின்படி யாழ்ப்பாண அட்டவணையைப் பின்பற்றும்.';
  } else if (selectedDistrict.id === 'mullaitivu') {
    districtNoticeTitleEn = 'Nallur Division (Mullaitivu District) Note';
    districtNoticeTitleTa = 'நல்லூர் பிரிவு (முல்லைத்தீவு மாவட்டம்) குறிப்பு';
    districtNoticeDetailEn = 'Mullaitivu schedule applies to Mullaitivu except Nallur Division (which follows Jaffna).';
    districtNoticeDetailTa = 'நல்லூர் பிரிவு தவிர ஏனைய முல்லைத்தீவு பகுதிகள் முல்லைத்தீவு அட்டவணையைப் பின்பற்றும்.';
  } else if (selectedDistrict.id === 'badulla') {
    districtNoticeTitleEn = 'Badulla & Uva Regional Schedule';
    districtNoticeTitleTa = 'பதுளை & ஊவா பிராந்திய தொழுகை அட்டவணை';
    districtNoticeDetailEn = 'Badulla schedule covers Badulla, Monaragala, Padiyatalawa & Dehiattakandiya divisions.';
    districtNoticeDetailTa = 'பதுளை அட்டவணை பதுளை, மொணராகலை, படியத்தலாவ, தெஹியத்தகண்டிய பகுதிகளை உள்ளடக்கியது.';
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="w-full rounded-[20px] bg-red-50/90 border-2 border-red-200 p-3 sm:p-4 flex items-start sm:items-center justify-between gap-3 transition-all hover:border-red-300 hover:shadow-sm cursor-pointer overflow-hidden"
      >
        <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
          {/* Pulsing Red Attention Icon */}
          <div className="relative shrink-0 mt-0.5 sm:mt-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-100 border border-red-200 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 animate-bounce [animation-duration:2s]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
          </div>

          <div className="text-left min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap">
                ATTENTION / கவனம்
              </span>
              <span className="text-xs sm:text-sm text-red-700 font-black leading-tight">
                {districtNoticeTitleEn}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 font-medium leading-tight">
              {districtNoticeDetailEn}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Eye className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="hidden sm:inline">View Guidance</span>
          <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />
        </button>
      </div>

      <RegionalAttentionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={onSelectDistrict}
      />
    </>
  );
};


