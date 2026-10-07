import React from 'react';
import { COSTUMES_DATA, Costume } from '../data/costumes';
import cardMatchImg from '../assets/pngtree-probability-and-statistics-concept-icon-data-ability-database-vector-png-image_12771720.png';
import cardAiImg from '../assets/gemini_aurora_thumbnail_4g_e74822ff0ca4259beb718.png';
import cardExploreImg from '../assets/images/ao_dai_lang_bac_1791262534667.jpg';
import { TRANSLATIONS, Language } from '../i18n/translations';

// HẰNG SỐ (CONST) HÌNH ẢNH CỐ ĐỊNH CHO 3 THẺ TÍNH NĂNG - KHÔNG THAY ĐỔI
export const CONST_CARD_01_EXPLORE_IMAGE: string = cardExploreImg;
export const CONST_CARD_02_MATCH_IMAGE: string = cardMatchImg;
export const CONST_CARD_03_AI_IMAGE: string = cardAiImg;

interface HomePageProps {
  onNavigate: (tab: 'home' | 'explore' | 'match' | 'ai') => void;
  onOpenCostumeModal?: (costume: Costume) => void;
  lang?: Language;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  lang = 'vi',
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.vi;
  return (
    <div className="space-y-10 md:space-y-14 animate-fadeIn pb-8">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: ẤN PHẨM KHẢO CỨU ĐẶC BIỆT                                 */}
      {/* ========================================================================= */}
      <section className="relative bg-[#111927] text-white rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 overflow-hidden shadow-2xl border border-[#D97706]/35">
        {/* L-Shaped Gold Corner Ornaments (Bốn góc hoa văn mạ vàng) */}
        <div className="absolute top-3 left-3 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-[#E5A93C] pointer-events-none"></div>
        <div className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-[#E5A93C] pointer-events-none"></div>
        <div className="absolute bottom-3 left-3 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-[#E5A93C] pointer-events-none"></div>
        <div className="absolute bottom-3 right-3 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-[#E5A93C] pointer-events-none"></div>

        {/* Subtle royal background watermark pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#E5A93C_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Publication / Contest Badge */}
          <div className="inline-block bg-[#E15A20] text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest px-4 py-1.5 rounded shadow-sm">
            {t.hero_badge}
          </div>

          {/* Display Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-[#F8F3E6] leading-tight tracking-wide uppercase">
            {t.hero_title_line1} <br className="hidden sm:inline" />
            <span className="text-[#F8F3E6]">{t.hero_title_line2}</span>
          </h1>

          {/* Editorial Quote */}
          <p className="font-serif italic text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl">
            {t.hero_quote}
          </p>

          {/* Three Quick-Launch CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Button 1: Khám phá văn hóa */}
            <button
              onClick={() => onNavigate('explore')}
              className="px-5 py-3 rounded-lg bg-[#8B1E1E] hover:bg-[#6c1717] text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2.5 transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <i className="fa-solid fa-book-open text-amber-300"></i>
              <span>{t.btn_explore_culture}</span>
            </button>

            {/* Button 2: Gợi ý phối đồ */}
            <button
              onClick={() => onNavigate('match')}
              className="px-5 py-3 rounded-lg bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2.5 transition-all shadow-md hover:scale-102 cursor-pointer"
            >
              <i className="fa-solid fa-scale-balanced text-amber-100"></i>
              <span>{t.btn_match_outfit}</span>
            </button>

            {/* Button 3: Thử đồ với AI */}
            <button
              onClick={() => onNavigate('ai')}
              className="px-5 py-3 rounded-lg bg-white hover:bg-slate-100 text-[#0F172A] font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2.5 transition-all shadow-md hover:scale-102 cursor-pointer border border-slate-200"
            >
              <i className="fa-solid fa-expand text-[#8B1E1E]"></i>
              <span>{t.btn_try_on_ai}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STATS & KEY NUMBERS BAR (54 Dân Tộc | 30+ Trang Phục | 9 Nhóm)           */}
      {/* ========================================================================= */}
      <section className="bg-[#F8F5EE] border border-[#D97706]/20 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Stat 1 */}
          <div className="flex items-center gap-4 px-2 sm:px-6">
            <div className="w-13 h-13 rounded-full bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1E293B] leading-none mb-1">
                {t.stat_ethnicities_count}
              </div>
              <div className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1E293B] uppercase mb-0.5">
                {t.stat_ethnicities_title}
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                {t.stat_ethnicities_desc}
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-4 px-2 sm:px-6 pt-4 md:pt-0">
            <div className="w-13 h-13 rounded-full bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
              <i className="fa-solid fa-shirt"></i>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1E293B] leading-none mb-1">
                {t.stat_costumes_count}
              </div>
              <div className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1E293B] uppercase mb-0.5">
                {t.stat_costumes_title}
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                {t.stat_costumes_desc}
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-4 px-2 sm:px-6 pt-4 md:pt-0">
            <div className="w-13 h-13 rounded-full bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1E293B] leading-none mb-1">
                {t.stat_regions_count}
              </div>
              <div className="text-xs sm:text-sm font-extrabold tracking-wider text-[#1E293B] uppercase mb-0.5">
                {t.stat_regions_title}
              </div>
              <p className="text-xs text-slate-600 leading-tight">
                {t.stat_regions_desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. BA TÍNH NĂNG CỐT LÕI NỀN TẢNG (3 CORE FEATURE CARDS)                   */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        {/* Section Heading */}
        <div className="space-y-1">
          <div className="text-xs sm:text-sm font-bold tracking-widest text-[#8B1E1E] uppercase flex items-center gap-2">
            <span className="w-5 h-0.5 bg-[#8B1E1E] inline-block"></span>
            <span>HỆ THỐNG TRẢI NGHIỆM DI SẢN</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#1E293B] uppercase tracking-wide">
            BA TÍNH NĂNG CỐT LÕI NỀN TẢNG
          </h2>
        </div>

        {/* 3 Core Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* ---------------- CARD 01: TÌM HIỂU VĂN HOÁ ---------------- */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            <div className="p-5 sm:p-6 space-y-4">
              {/* Card Top: Number 01 & Category Tag */}
              <div className="flex items-center justify-between">
                <span className="font-serif font-black text-4xl sm:text-5xl text-slate-300 leading-none select-none">
                  01
                </span>
                <span className="px-3 py-1 rounded bg-[#F1E8DC] text-[#78350F] text-xs font-bold uppercase tracking-wider">
                  {t.card1_tag}
                </span>
              </div>

              {/* Graphic Preview 01: Áo Dài Truyền Thống / Tư liệu sử học */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner group-hover:border-[#8B1E1E]/50 transition-colors">
                <div className="w-full h-full relative">
                  <img
                    src={CONST_CARD_01_EXPLORE_IMAGE}
                    alt={t.card1_title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 pt-1">
                <h3 className="font-serif font-black text-xl sm:text-2xl text-[#8B1E1E] uppercase">
                  {t.card1_title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.card1_desc}
                </p>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-5 sm:p-6 pt-0">
              <button
                onClick={() => onNavigate('explore')}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-800 font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{t.card1_btn}</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>

          {/* ---------------- CARD 02: GỢI Ý PHỐI ĐỒ ---------------- */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            <div className="p-5 sm:p-6 space-y-4">
              {/* Card Top: Number 02 & Category Tag */}
              <div className="flex items-center justify-between">
                <span className="font-serif font-black text-4xl sm:text-5xl text-slate-300 leading-none select-none">
                  02
                </span>
                <span className="px-3 py-1 rounded bg-[#FEF3C7] text-[#92400E] text-xs font-bold uppercase tracking-wider">
                  {t.card2_tag}
                </span>
              </div>

              {/* Graphic Preview 02: Costume Matching Preview (Const) */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
                <div className="w-full h-full relative">
                  <img
                    src={CONST_CARD_02_MATCH_IMAGE}
                    alt={t.card2_title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 pt-1">
                <h3 className="font-serif font-black text-xl sm:text-2xl text-[#1E293B] uppercase">
                  {t.card2_title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.card2_desc}
                </p>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-5 sm:p-6 pt-0">
              <button
                onClick={() => onNavigate('match')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>{t.card2_btn}</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>

          {/* ---------------- CARD 03: THỬ ĐỒ AI ---------------- */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            <div className="p-5 sm:p-6 space-y-4">
              {/* Card Top: Number 03 & Category Tag */}
              <div className="flex items-center justify-between">
                <span className="font-serif font-black text-4xl sm:text-5xl text-slate-300 leading-none select-none">
                  03
                </span>
                <span className="px-3 py-1 rounded bg-[#7F1D1D] text-white text-xs font-bold uppercase tracking-wider">
                  {t.card3_tag}
                </span>
              </div>

              {/* Graphic Preview 03: Virtual Try-On Studio Mockup (Const) */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
                <div className="w-full h-full relative">
                  <img
                    src={CONST_CARD_03_AI_IMAGE}
                    alt={t.card3_title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 pt-1">
                <h3 className="font-serif font-black text-xl sm:text-2xl text-[#1E293B] uppercase">
                  {t.card3_title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t.card3_desc}
                </p>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-5 sm:p-6 pt-0">
              <button
                onClick={() => onNavigate('ai')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#8B1E1E] hover:bg-[#6c1717] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>{t.card3_btn}</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
