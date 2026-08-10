import React, { useState } from 'react';
import { ISLAMIC_DUAS } from '../utils/duasData';
import { Copy, Check, Search } from 'lucide-react';
import { DuaIcon } from './IslamicIcons';

export const DuasModal: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery]           = useState<string>('');
  const [copiedId, setCopiedId]                 = useState<string | null>(null);

  const filteredDuas = ISLAMIC_DUAS.filter(dua => {
    const matchesCategory = selectedCategory === 'all' || dua.category === selectedCategory;
    const matchesQuery =
      dua.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleCopy = (duaId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(duaId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 font-['Anek_Tamil',sans-serif]">

      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-[20px] glass-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#0E7490] text-xs font-bold uppercase tracking-wider">
              <DuaIcon className="w-4 h-4 text-[#0E7490]" />
              <span>Islamic Duas & Supplications</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#17252B] mt-1 font-['Anek_Tamil',sans-serif]">
              Daily Azkar & Adhan Duas
            </h2>
            <p className="text-xs text-[#60757C] mt-1">
              Authentic supplications for Adhan, Wudu, and after daily prayers with Arabic & English translations.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8CA5AD]" />
            <input
              type="text"
              placeholder="Search supplications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-[#F7FBFC] border border-[#E8F7F8] text-xs text-[#17252B] focus:outline-none focus:border-[#0E7490] font-medium placeholder-[#8CA5AD] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 no-scrollbar scroll-fade-x">
        {['all', 'adhan', 'prayer', 'wudu'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-[12px] text-xs font-bold capitalize transition-all whitespace-nowrap active:scale-[0.97] cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-b from-[#138BA6] to-[#0E7490] text-white shadow-[0_4px_12px_-2px_rgba(14,116,144,0.35)]'
                : 'bg-white/90 border border-[#E8F7F8] text-[#60757C] hover:bg-[#E8F7F8] hover:text-[#0E7490]'
            }`}
          >
            {cat === 'all' ? 'All Duas' : `${cat} Duas`}
          </button>
        ))}
      </div>

      {/* Dua Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredDuas.map((dua) => (
          <div
            key={dua.id}
            className="p-5 sm:p-6 rounded-[20px] glass-card flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-6px_rgba(14,116,144,0.16)] transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-wider bg-[#E8F7F8] border border-[#CDEFF1] text-[#0E7490]">
                  {dua.category}
                </span>
                <button
                  onClick={() => handleCopy(dua.id, `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}`)}
                  className="p-1.5 rounded-[10px] bg-[#F7FBFC] border border-[#E8F7F8] text-[#60757C] hover:text-[#0E7490] hover:bg-[#E8F7F8] transition-colors active:scale-[0.97] cursor-pointer"
                  title="Copy Dua"
                >
                  {copiedId === dua.id
                    ? <Check className="w-4 h-4 text-[#0E7490]" />
                    : <Copy className="w-4 h-4" />
                  }
                </button>
              </div>

              <h3 className="text-base font-extrabold text-[#17252B] font-['Anek_Tamil',sans-serif]">
                {dua.title}
              </h3>

              {/* Arabic */}
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-[#E8F7F8] to-[#F0FAFB] border border-[#CDEFF1] font-arabic text-xl sm:text-2xl text-[#0E7490] text-right leading-loose dir-rtl">
                {dua.arabic}
              </div>

              {/* Transliteration */}
              <div className="text-xs text-[#0E7490] font-medium italic leading-relaxed">
                {dua.transliteration}
              </div>

              {/* Translation */}
              <div className="text-xs text-[#60757C] leading-relaxed">
                "{dua.translation}"
              </div>
            </div>

            {/* Reference */}
            <div className="pt-3 border-t border-[#E8F7F8] text-[10px] text-[#8CA5AD] font-medium">
              Reference: {dua.reference}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
