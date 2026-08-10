import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, CheckCircle, Flame } from 'lucide-react';
import { TasbihIcon } from './IslamicIcons';
import { playTasbihClickSound } from '../utils/audioSynthesizer';

interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  target: number;
}

const PRESETS: DhikrPreset[] = [
  { id: 'subhanallah',    arabic: 'سُبْحَانَ اللَّهِ',             transliteration: 'SubhanAllah',       translation: 'Glory be to Allah',                              target: 33 },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ',             transliteration: 'Alhamdulillah',     translation: 'Praise be to Allah',                             target: 33 },
  { id: 'allahuakbar',   arabic: 'اللَّهُ أَكْبَرُ',              transliteration: 'Allahu Akbar',      translation: 'Allah is the Greatest',                          target: 33 },
  { id: 'astaghfirullah',arabic: 'أَسْتَغْفِرُ اللَّهَ',         transliteration: 'Astaghfirullah',    translation: 'I seek forgiveness from Allah',                  target: 100 },
  { id: 'lailahaillallah',arabic:'لَا إِلٰهَ إِلَّا اللَّهُ',    transliteration: 'La Ilaha Illallah', translation: 'There is no deity worthy of worship except Allah', target: 100 },
];

export const TasbihCounter: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<DhikrPreset>(PRESETS[0]);
  const [count, setCount]                   = useState<number>(0);
  const [soundEnabled, setSoundEnabled]     = useState<boolean>(true);
  const [totalToday, setTotalToday]         = useState<number>(0);
  const [isCompleted, setIsCompleted]       = useState<boolean>(false);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    setTotalToday(prev => prev + 1);
    if (soundEnabled) playTasbihClickSound();
    try { if ('vibrate' in navigator) navigator.vibrate(28); } catch (_) {}
    if (newCount >= selectedPreset.target) setIsCompleted(true);
  };

  const handleReset = () => { setCount(0); setIsCompleted(false); };

  const handleSelectPreset = (preset: DhikrPreset) => {
    setSelectedPreset(preset);
    setCount(0);
    setIsCompleted(false);
  };

  const progressPercent = Math.min(100, (count / selectedPreset.target) * 100);

  // SVG circle progress
  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 font-['Anek_Tamil',sans-serif]">

      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-[20px] glass-card text-center">
        <div className="inline-flex items-center space-x-2 text-[#0E7490] dark:text-[#67D5DF] text-xs font-bold uppercase tracking-wider mb-1">
          <TasbihIcon className="w-4 h-4 text-[#0E7490] dark:text-[#67D5DF]" />
          <span>Digital Tasbih &amp; Dhikr Counter</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#17252B] dark:text-[#E8F7F8] font-['Anek_Tamil',sans-serif]">
          Daily Remembrance of Allah
        </h2>
        <p className="text-xs text-[#60757C] dark:text-[#8ECFD8] mt-1">
          Tap the counter ring to count your dhikr with gentle sound &amp; vibration feedback.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar scroll-fade-x">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all whitespace-nowrap active:scale-[0.97] cursor-pointer ${
              selectedPreset.id === preset.id
                ? 'bg-gradient-to-b from-[#138BA6] to-[#0E7490] text-white shadow-[0_4px_12px_-2px_rgba(14,116,144,0.38)]'
                : 'bg-white/90 dark:bg-[#0C1E2E] border border-[#E8F7F8] dark:border-[rgba(14,116,144,0.25)] text-[#60757C] dark:text-[#8ECFD8] hover:bg-[#E8F7F8] dark:hover:bg-[rgba(14,116,144,0.18)] hover:text-[#0E7490] dark:hover:text-[#67D5DF]'
            }`}
          >
            <span>{preset.transliteration}</span>
            <span className="ml-1.5 opacity-70">({preset.target})</span>
          </button>
        ))}
      </div>

      {/* Main Dhikr Card */}
      <div className="p-6 sm:p-8 rounded-[20px] glass-card flex flex-col items-center justify-center space-y-5 text-center relative overflow-hidden">

        {/* Audio + Reset */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center space-x-2 z-20">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-[12px] bg-white/80 dark:bg-[#0C1E2E] border border-[#E8F7F8] dark:border-[rgba(14,116,144,0.25)] text-[#60757C] dark:text-[#8ECFD8] hover:bg-[#E8F7F8] dark:hover:bg-[rgba(14,116,144,0.18)] transition-all active:scale-[0.97] cursor-pointer shadow-sm"
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          >
            {soundEnabled
              ? <Volume2 className="w-4 h-4 text-[#0E7490] dark:text-[#67D5DF]" />
              : <VolumeX className="w-4 h-4 text-[#8CA5AD] dark:text-[#5A8D9A]" />
            }
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-[12px] bg-white/80 dark:bg-[#0C1E2E] border border-[#E8F7F8] dark:border-[rgba(14,116,144,0.25)] text-[#60757C] dark:text-[#8ECFD8] hover:text-[#0E7490] dark:hover:text-[#67D5DF] hover:bg-[#E8F7F8] dark:hover:bg-[rgba(14,116,144,0.18)] transition-all active:scale-[0.97] cursor-pointer shadow-sm"
            title="Reset Count"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Dhikr phrase */}
        <div className="space-y-2 pt-2">
          <div className="font-arabic text-3xl sm:text-4xl text-[#0E7490] dark:text-[#67D5DF] font-bold tracking-wide leading-relaxed">
            {selectedPreset.arabic}
          </div>
          <div className="text-lg font-black text-[#17252B] dark:text-[#E8F7F8] font-['Anek_Tamil',sans-serif]">
            {selectedPreset.transliteration}
          </div>
          <div className="text-xs text-[#60757C] dark:text-[#8ECFD8] italic">
            "{selectedPreset.translation}"
          </div>
        </div>

        {/* SVG Ring + Tap Button — Perfectly Centered Container */}
        <div className="relative my-2 w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 240 240"
          >
            <circle
              cx="120" cy="120" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-[#E8F7F8] dark:text-[rgba(14,116,144,0.18)]"
            />
            <circle
              cx="120" cy="120" r={radius}
              fill="none"
              stroke={isCompleted ? '#0E7490' : '#67D5DF'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>

          <button
            onClick={handleIncrement}
            className={`w-[190px] h-[190px] sm:w-[220px] sm:h-[220px] rounded-full flex flex-col items-center justify-center transition-all duration-150 active:scale-[0.96] cursor-pointer relative z-10 ${
              isCompleted
                ? 'bg-gradient-to-b from-[#E8F7F8] to-[#CDEFF1] dark:from-[#0E7490]/40 dark:to-[#0E7490]/20 shadow-[0_8px_24px_-4px_rgba(14,116,144,0.35)] border-2 border-[#0E7490]'
                : 'bg-white/95 dark:bg-[#0C1E2E] shadow-[0_8px_24px_-4px_rgba(14,116,144,0.14)] hover:shadow-[0_10px_28px_-4px_rgba(14,116,144,0.22)] hover:-translate-y-0.5 border border-[#E8F7F8] dark:border-[rgba(14,116,144,0.25)]'
            }`}
          >
            <span className={`text-5xl sm:text-6xl font-mono font-black tracking-tight ${
              isCompleted ? 'text-[#0E7490] dark:text-[#67D5DF]' : 'text-[#17252B] dark:text-[#E8F7F8]'
            }`}>
              {count}
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest mt-1 ${
              isCompleted ? 'text-[#0E7490] dark:text-[#67D5DF]' : 'text-[#60757C] dark:text-[#8ECFD8]'
            }`}>
              / {selectedPreset.target}
            </span>
            <span className="text-[10px] uppercase font-extrabold mt-2 text-[#0E7490] dark:text-[#67D5DF] tracking-widest">
              TAP TO COUNT
            </span>
          </button>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#138BA6] to-[#0E7490] text-white font-black text-xs uppercase tracking-wider shadow-[0_6px_20px_-4px_rgba(14,116,144,0.45)] animate-bounce">
            <CheckCircle className="w-4 h-4 text-white" />
            <span>MashaAllah! Goal Completed ({selectedPreset.target})</span>
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t border-[#E8F7F8] dark:border-[rgba(14,116,144,0.18)] w-full flex justify-around text-xs text-[#60757C] dark:text-[#8ECFD8] font-medium">
          <div className="flex items-center space-x-1.5">
            <Flame className="w-4 h-4 text-[#0E7490] dark:text-[#67D5DF]" />
            <span>Total Today: <strong className="text-[#17252B] dark:text-[#E8F7F8] font-mono">{totalToday}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
