import React, { useState } from 'react';
import { District } from '../types/prayer';
import { calculateDailyPrayerSchedule, isSriLankaToday, getSriLankaTimeParts } from '../utils/prayerCalculator';
import { getDistrictFullName, getDistrictExplanationNote } from '../utils/sriLankaDistricts';
import { Calendar, Download, Printer, ChevronLeft, ChevronRight, Info, Share2 } from 'lucide-react';

interface MonthlyCalendarProps {
  district: District;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ district }) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => getSriLankaTimeParts(new Date()).dateObj);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = MONTH_NAMES[month];

  const monthlySchedules = Array.from({ length: daysInMonth }).map((_, i) => {
    const dayDate = new Date(year, month, i + 1);
    return calculateDailyPrayerSchedule(dayDate, district.lat, district.lng, district.id);
  });

  const handlePrevMonth    = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth    = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleCurrentMonth = () => setCurrentDate(getSriLankaTimeParts(new Date()).dateObj);
  const handleSelectMonth  = (mIdx: number) => setCurrentDate(new Date(year, mIdx, 1));

  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    const headers = ['Date', 'Day', 'Hijri Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const rows = monthlySchedules.map(s => [
      s.dateFormatted, s.dayName, `"${s.hijriDate}"`,
      s.prayers.Fajr.time12, s.prayers.Sunrise.time12,
      s.prayers.Dhuhr.time12, s.prayers.Asr.time12,
      s.prayers.Maghrib.time12, s.prayers.Isha.time12,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Prayer_Schedule_${district.name}_${monthName}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    const textHeader = `*Sri Lanka Prayer Timetable - ${monthName} ${year}*\nDistrict: *${getDistrictFullName(district)}*\n\n`;
    const textRows = monthlySchedules
      .slice(0, 7)
      .map(s => `${s.dateFormatted} (${s.dayName.substring(0, 3)}): Fajr ${s.prayers.Fajr.time12} | Dhuhr ${s.prayers.Dhuhr.time12} | Asr ${s.prayers.Asr.time12} | Maghrib ${s.prayers.Maghrib.time12} | Isha ${s.prayers.Isha.time12}`)
      .join('\n');
    const shareText = textHeader + textRows + `\n...\nView full month online at: ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({ title: `Prayer Times - ${district.name}`, text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('7-day sample timetable copied to clipboard! You can paste it into WhatsApp.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 font-['Anek_Tamil',sans-serif]">

      {/* ── Top Header Card ── */}
      <div className="no-print p-4 sm:p-6 rounded-[20px] glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 text-[#0E7490] text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Monthly Prayer Timetable</span>
            <span className="text-[#CDEFF1]">•</span>
            <span className="text-[#60757C]">Sri Lanka</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-[#17252B] mt-1 font-['Anek_Tamil',sans-serif]">
            {monthName} {year} — <span className="text-[#0E7490]">{getDistrictFullName(district)}</span>
          </h2>
          <div className="text-xs text-[#60757C] mt-1 space-y-1">
            <p>
              Official monthly prayer timetable & Hijri dates synced with ACJU Sri Lanka for {getDistrictFullName(district)} ({district.province}).
            </p>
            {getDistrictExplanationNote(district) && (
              <p className="text-[11px] text-[#0E7490] bg-[#E8F7F8] px-2.5 py-1 rounded-[8px] border border-[#CDEFF1] inline-flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
                <span>{getDistrictExplanationNote(district)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Month steppers */}
          <div className="flex items-center bg-white/80 border border-[#E8F7F8] rounded-[12px] p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-[#60757C] hover:text-[#0E7490] hover:bg-[#E8F7F8] rounded-[10px] transition-colors active:scale-[0.97] cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCurrentMonth}
              className="px-2.5 py-1 text-xs font-bold text-[#0E7490] hover:bg-[#E8F7F8] rounded-[10px] transition-colors cursor-pointer"
            >
              Current
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 text-[#60757C] hover:text-[#0E7490] hover:bg-[#E8F7F8] rounded-[10px] transition-colors active:scale-[0.97] cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-[12px] bg-white/90 border border-[#E8F7F8] text-[#17252B] hover:bg-[#E8F7F8] text-xs font-bold transition-all active:scale-[0.97] cursor-pointer shadow-sm"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#0E7490]" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-[12px] bg-white/90 border border-[#E8F7F8] text-[#17252B] hover:bg-[#E8F7F8] text-xs font-bold transition-all active:scale-[0.97] cursor-pointer shadow-sm"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0E7490]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-[12px] bg-gradient-to-b from-[#138BA6] to-[#0E7490] hover:from-[#0E7490] hover:to-[#0F6074] text-white text-xs font-bold transition-all active:scale-[0.97] cursor-pointer shadow-[0_4px_12px_-2px_rgba(14,116,144,0.35)]"
            title="Print / PDF"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* ── Month Pills Bar ── */}
      <div className="no-print flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
        {MONTH_NAMES.map((mName, idx) => (
          <button
            key={mName}
            onClick={() => handleSelectMonth(idx)}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all whitespace-nowrap active:scale-[0.97] cursor-pointer ${
              idx === month
                ? 'bg-gradient-to-b from-[#138BA6] to-[#0E7490] text-white shadow-[0_4px_10px_-2px_rgba(14,116,144,0.35)]'
                : 'bg-white/90 border border-[#E8F7F8] text-[#60757C] hover:bg-[#E8F7F8] hover:text-[#0E7490]'
            }`}
          >
            {mName}
          </button>
        ))}
      </div>

      {/* ── Print Header (only visible on print) ── */}
      <div className="print-title hidden">
        Sri Lanka Official Prayer Timetable — {monthName} {year}
      </div>
      <div className="print-subtitle hidden">
        District: {getDistrictFullName(district)} ({district.province}) &nbsp;|&nbsp;
        Lat {district.lat}°N, Lng {district.lng}°E &nbsp;|&nbsp;
        Source: ACJU Sri Lanka &nbsp;|&nbsp; srilankaprayertimes.lk
      </div>

      {/* ── Monthly Table ── */}
      <div className="print-area overflow-hidden rounded-[20px] glass-card">
        <div className="no-print flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#8CA5AD] py-1.5 border-b border-[#E8F7F8] sm:hidden">
          <ChevronLeft className="w-3 h-3" />
          <span>Swipe to see Asr, Maghrib & Isha</span>
          <ChevronRight className="w-3 h-3" />
        </div>
        <div className="overflow-x-auto scroll-fade-x">
          <table className="w-full text-left border-collapse min-w-[580px] sm:min-w-0 font-['Anek_Tamil',sans-serif]">
            <thead>
              <tr className="bg-[#E8F7F8]/80 text-[#0E7490] text-[11px] sm:text-xs font-extrabold uppercase border-b border-[#CDEFF1]">
                <th className="py-3.5 px-3 sm:px-4">Date</th>
                <th className="py-3.5 px-3 sm:px-4 hidden sm:table-cell text-[#60757C]">Day</th>
                <th className="py-3.5 px-3 sm:px-4 hidden sm:table-cell text-[#60757C]">Hijri Date</th>
                <th className="py-3.5 px-3 sm:px-4 text-[#0E7490] font-black">Fajr</th>
                <th className="py-3.5 px-3 sm:px-4 text-[#8CA5AD]">Sunrise</th>
                <th className="py-3.5 px-3 sm:px-4 text-[#17252B]">Dhuhr</th>
                <th className="py-3.5 px-3 sm:px-4 text-[#17252B]">Asr</th>
                <th className="py-3.5 px-3 sm:px-4 text-[#0E7490] font-black">Maghrib</th>
                <th className="py-3.5 px-3 sm:px-4 text-[#17252B]">Isha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0FAFB] text-xs font-medium text-[#17252B]">
              {monthlySchedules.map((s) => {
                const isToday = isSriLankaToday(s.date);
                return (
                  <tr
                    key={s.dateFormatted}
                    className={`transition-colors hover:bg-[#E8F7F8]/50 ${
                      isToday
                        ? 'today-row bg-[#E8F7F8]/90 font-bold text-[#17252B] border-l-4 border-l-[#0E7490]'
                        : s.date.getDay() === 5
                        ? 'bg-[#F7FBFC]/80 font-semibold'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 sm:px-4 font-bold whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span>{s.dateFormatted}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded-[6px] bg-[#0E7490] text-white font-black uppercase text-[9px]">
                              Today
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#0E7490] font-semibold sm:hidden">{s.hijriDate}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell text-[#8CA5AD] whitespace-nowrap">{s.dayName}</td>
                    <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell text-[#0E7490] font-semibold whitespace-nowrap">{s.hijriDate}</td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0E7490] whitespace-nowrap">{s.prayers.Fajr.time12}</td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono text-[#8CA5AD] whitespace-nowrap">{s.prayers.Sunrise.time12}</td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-semibold text-[#17252B] whitespace-nowrap">{s.prayers.Dhuhr.time12}</td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-semibold text-[#17252B] whitespace-nowrap">{s.prayers.Asr.time12}</td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[#0E7490] whitespace-nowrap">{s.prayers.Maghrib.time12}</td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-semibold text-[#17252B] whitespace-nowrap">{s.prayers.Isha.time12}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
