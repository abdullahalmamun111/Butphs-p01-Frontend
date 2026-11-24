import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  FlaskConical,
  Landmark,
  Layers,
  Library,
  Mail,
  MapPin,
  MonitorPlay,
  Phone,
  Trophy,
} from 'lucide-react';
import { SCHOOL_INFO } from '../config/school';
import { INSTITUTION_STARS } from '../data/institutionStars';
import { useSchoolStore } from '../store/SchoolStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { NoticePrintModal } from '../components/shared/NoticePrintModal';
import { SchoolVisualizations } from '../components/shared/SchoolVisualizations';
import {
  FacultyStaffSliderSection,
  InstitutionStarsSliderSection,
  WhyStudyShowcaseSection,
} from '../components/home/HomeShowcaseSliders';
import {
  filterNoticesByTabAndQuery,
  formatBanglaCalendarTile,
  getNoticeCategoryBn,
  getNoticeMemoNo,
  type NoticeFilterTab,
} from '../utils/noticeUtils';
import { downloadNoticeFile } from '../utils/downloadNotice';
import type { Notice } from '../types';

interface HeroSlide {
  id: string;
  labelBn: string;
  kicker: string;
  headlineBn: string;
  subtitleBn: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  image: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'heritage-campus',
    labelBn: 'ঐতিহ্যবাহী ক্যাম্পাস',
    kicker: `Established ${SCHOOL_INFO.established} · EIIN: ${SCHOOL_INFO.eiin} · School Code: ${SCHOOL_INFO.schoolCode}`,
    headlineBn: '১৮৯৮ সাল থেকে শিক্ষার আলো ছড়াচ্ছে বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়',
    subtitleBn:
      'উপসী, নড়িয়া, শরীয়তপুরে ১২৮ বছরের গৌরবময় ঐতিহ্য, নৈতিক শৃঙ্খলা ও আধুনিক ডিজিটাল শিক্ষাব্যবস্থার নির্ভরযোগ্য বিদ্যাপীঠ।',
    ctaLabel: 'অনলাইন ভর্তি আবেদন ২০২৭',
    ctaHref: '/others/online-admission',
    secondaryLabel: 'ফলাফল দেখুন · Results',
    secondaryHref: '/academics/results',
    image: SCHOOL_INFO.assets.campusHero,
    alt: 'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় প্রধান একাডেমিক ভবন',
  },
  {
    id: 'smart-classroom',
    labelBn: 'স্মার্ট শ্রেণিকক্ষ',
    kicker: 'Smart Classrooms · ৬ষ্ঠ থেকে ১০ম শ্রেণি',
    headlineBn: 'আধুনিক ও শিক্ষার্থী-কেন্দ্রিক পাঠদান ব্যবস্থা',
    subtitleBn:
      'অভিজ্ঞ শিক্ষকদের নিবিড় তত্ত্বাবধান, নিয়মিত মূল্যায়ন ও মাল্টিমিডিয়া শ্রেণিকক্ষে মানসম্মত মাধ্যমিক শিক্ষা।',
    ctaLabel: 'পাঠ্যক্রম ও সিলেবাস',
    ctaHref: '/academics/curriculum',
    secondaryLabel: 'ক্লাস রুটিন দেখুন',
    secondaryHref: '/academics/class-routine',
    image: SCHOOL_INFO.assets.classroomStudy,
    alt: 'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের আধুনিক স্মার্ট শ্রেণিকক্ষ',
  },
  {
    id: 'science-ict-lab',
    labelBn: 'বিজ্ঞান ও আইসিটি ল্যাব',
    kicker: 'Science & ICT Lab · বিজ্ঞান ও আধুনিক তথ্যপ্রযুক্তি শিক্ষা',
    headlineBn: 'সমৃদ্ধ বিজ্ঞান গবেষণাগার ও ডিজিটাল আইসিটি ল্যাব',
    subtitleBn:
      'পদার্থ, রসায়ন ও জীববিজ্ঞানের ব্যবহারিক অনুশীলন এবং আধুনিক কম্পিউটার ল্যাবে হাতে-কলমে দক্ষতা উন্নয়ন।',
    ctaLabel: 'পাঠ্যসূচি ও সিলেবাস',
    ctaHref: '/academics/syllabus',
    secondaryLabel: 'ক্যাম্পাস গ্যালারি',
    secondaryHref: '/others/media',
    image: SCHOOL_INFO.assets.scienceLab,
    alt: 'বিদ্যালয়ের আধুনিক বিজ্ঞান ও আইসিটি গবেষণাগার',
  },
  {
    id: 'sports-cocurricular',
    labelBn: 'ক্রীড়া ও সহশিক্ষা',
    kicker: 'Sports, Scouting & Clubs · সহশিক্ষা ও নেতৃত্ব চর্চা',
    headlineBn: 'খেলাধুলা, স্কাউটিং ও সাংস্কৃতিক চর্চায় পরিপূর্ণ বিকাশ',
    subtitleBn:
      'বিশাল সবুজ খেলার মাঠ, বার্ষিক ক্রীড়া প্রতিযোগিতা, বিতর্ক, স্কাউটিং ও সক্রিয় ক্লাবে মেধার অনুশীলন।',
    ctaLabel: 'সহশিক্ষা ও ক্রীড়া কার্যক্রম',
    ctaHref: '/activities/sports',
    secondaryLabel: 'একাডেমিক ক্যালেন্ডার',
    secondaryHref: '/academics/calendar',
    image: SCHOOL_INFO.assets.sportsField,
    alt: 'বিদ্যালয়ের খেলার মাঠ ও বার্ষিক ক্রীড়া প্রতিযোগিতা',
  },
];

// Exactly 4 elevated Quick Links floating over the bottom edge of the Hero Banner
const HERO_QUICK_LINKS = [
  {
    titleBn: 'ভর্তি আবেদন ২০২৭',
    descBn: 'নতুন শিক্ষাবর্ষে অনলাইন ভর্তি আবেদন',
    href: '/others/online-admission',
    icon: ClipboardCheck,
  },
  {
    titleBn: 'অনলাইন ফলাফল',
    descBn: 'রোল ও আইডি দিয়ে তাৎক্ষণিক মার্কশিট',
    href: '/academics/results',
    icon: Award,
  },
  {
    titleBn: 'ক্লাস রুটিন',
    descBn: 'শ্রেণিভিত্তিক সাপ্তাহিক ক্লাস সূচি',
    href: '/academics/class-routine',
    icon: Calendar,
  },
  {
    titleBn: 'সিলেবাস ও পাঠ্যবই',
    descBn: 'পরীক্ষার সিলেবাস ও পাঠ্যবই নির্দেশিকা',
    href: '/academics/syllabus',
    icon: BookOpen,
  },
];

const NOTICE_TABS: Array<{ id: NoticeFilterTab; labelBn: string }> = [
  { id: 'all', labelBn: 'সব' },
  { id: 'urgent', labelBn: 'জরুরি' },
  { id: 'exam', labelBn: 'পরীক্ষা' },
  { id: 'admission_academic', labelBn: 'ভর্তি ও একাডেমিক' },
];


const STRUCTURAL_OVERVIEW = [
  { labelBn: 'পাকা ভবন', valueBn: '৪টি', icon: Building2 },
  { labelBn: 'ক্যাম্পাস জমি', valueBn: '৩.৮৫ একর', icon: Landmark },
  { labelBn: 'শ্রেণিকক্ষ', valueBn: '১৮টি', icon: Layers },
  { labelBn: 'বিজ্ঞান ও আইসিটি ল্যাব', valueBn: '৪টি', icon: FlaskConical },
  { labelBn: 'মাল্টিমিডিয়া কক্ষ', valueBn: '৬টি', icon: MonitorPlay },
  { labelBn: 'গ্রন্থাগারের বই', valueBn: '৩,৫০০+', icon: Library },
];

const INSTITUTIONAL_ACHIEVEMENTS = [
  {
    yearBn: 'এসএসসি ২০২৫',
    metricBn: '৯৬.৮% পাস · ৫১ জিপিএ-৫',
    titleBn: 'উপজেলার শীর্ষ মাধ্যমিক বিদ্যালয়গুলোর অন্যতম হিসেবে বোর্ড ফলাফলে সাফল্য',
  },
  {
    yearBn: 'জেলা পর্যায় ২০২৫',
    metricBn: 'চ্যাম্পিয়ন',
    titleBn: 'শরীয়তপুর জেলা বিজ্ঞান মেলা ও আন্তঃবিদ্যালয় বিতর্ক প্রতিযোগিতা',
  },
  {
    yearBn: 'ক্রীড়া ও স্কাউট',
    metricBn: '৩টি পদক',
    titleBn: 'উপজেলা আন্তঃস্কুল অ্যাথলেটিক্স ও বাংলাদেশ স্কাউটস সম্মাননা',
  },
];

export function HomePage() {
  useDocumentTitle('মূল পাতা');
  const { db, addToast } = useSchoolStore();

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);
  const [noticeTab, setNoticeTab] = useState<NoticeFilterTab>('all');
  const [viewerNotice, setViewerNotice] = useState<Notice | null>(null);

  const wc = db.websiteContent;
  const heroSlides = useMemo(
    () => (wc.heroSlides && wc.heroSlides.length > 0 ? wc.heroSlides : HERO_SLIDES),
    [wc.heroSlides]
  );

  useEffect(() => {
    if (activeSlideIdx >= heroSlides.length) {
      setActiveSlideIdx(0);
    }
  }, [activeSlideIdx, heroSlides.length]);

  useEffect(() => {
    if (sliderPaused || heroSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [sliderPaused, heroSlides.length]);

  const publishedNotices = useMemo(
    () => db.notices.filter((n) => n.status === 'Published'),
    [db.notices]
  );

  const filteredNotices = useMemo(
    () => filterNoticesByTabAndQuery(publishedNotices, noticeTab, ''),
    [publishedNotices, noticeTab]
  );

  const marqueeNotices = useMemo(() => {
    const items: Array<{ key: string; text: string; notice?: Notice }> = [];
    if (wc.announcementBanner) {
      items.push({ key: 'banner-msg', text: wc.announcementBanner });
    }
    publishedNotices.slice(0, 6).forEach((n) => {
      items.push({ key: n.id, text: n.titleBn, notice: n });
    });
    return items;
  }, [wc.announcementBanner, publishedNotices]);

  const shouldScrollNoticesVertically = filteredNotices.length >= 3;

  const activeTeachers = useMemo(
    () => db.teachers.filter((t) => t.status === 'Active'),
    [db.teachers]
  );

  const activeStaff = useMemo(
    () => db.staff.filter((s) => s.status === 'Active'),
    [db.staff]
  );

  const headTeacherPhoto = useMemo(
    () =>
      db.teachers.find((t) => t.isHeadTeacher)?.photoUrl ||
      SCHOOL_INFO.assets.headTeacher,
    [db.teachers]
  );

  const activeSlide = heroSlides[activeSlideIdx] || heroSlides[0];

  const handlePrevSlide = () => {
    setActiveSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setActiveSlideIdx((prev) => (prev + 1) % heroSlides.length);
  };

  const renderNoticeRow = (notice: Notice, keyPrefix: string) => {
    const dateTile = formatBanglaCalendarTile(notice.date);
    const memoNo = getNoticeMemoNo(notice);
    return (
      <div
        key={`${keyPrefix}-${notice.id}`}
        className="px-4 py-3 border-b border-slate-100 hover:bg-[#F7F8FC] transition-colors flex items-center justify-between gap-3"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-12 shrink-0 rounded-lg bg-[#F7F8FC] border border-slate-200 py-1.5 px-1 text-center">
            <span className="block text-sm font-bold text-[#1B2A6B] leading-none tabular-nums">
              {dateTile.dayBn}
            </span>
            <span className="block text-[10px] text-[#1F7A4D] font-medium mt-0.5">
              {dateTile.monthBn}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 text-[11px]">
              {notice.isUrgent && <span className="font-semibold text-red-700">জরুরি</span>}
              <span className="font-medium text-[#1F7A4D]">
                {getNoticeCategoryBn(notice.category)}
              </span>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <span className="text-slate-500 tabular-nums">{memoNo}</span>
            </div>
            <button
              type="button"
              onClick={() => setViewerNotice(notice)}
              className="text-left text-xs sm:text-sm font-semibold text-[#1B2A6B] hover:text-[#1F7A4D] transition-colors leading-snug line-clamp-2 mt-0.5 cursor-pointer"
            >
              {notice.titleBn}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setViewerNotice(notice)}
            aria-label={`${notice.titleBn} দেখুন`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#1B2A6B] hover:bg-[#1F7A4D] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">দেখুন</span>
          </button>
          <button
            type="button"
            onClick={() => {
              downloadNoticeFile(notice);
              addToast('success', 'বিজ্ঞপ্তি ডাউনলোড হয়েছে', notice.titleBn);
            }}
            aria-label={`${notice.titleBn} ডাউনলোড করুন`}
            className="inline-flex items-center justify-center w-8 h-8 text-slate-600 hover:text-[#1F7A4D] bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F7F8FC] text-slate-900">
      {/* =====================================================================
          TOP SCROLLING LATEST NOTICE MARQUEE (ZERO BULLET POINTS)
      ====================================================================== */}
      <div className="bg-[#142254] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8CF8E] shrink-0 whitespace-nowrap pr-3 border-r border-white/15">
            <Bell className="w-3.5 h-3.5" aria-hidden="true" />
            <span>সাম্প্রতিক নোটিশ</span>
          </span>

          <div className="flex-1 overflow-hidden relative" aria-label="সাম্প্রতিক বিজ্ঞপ্তি স্ক্রল">
            <div className="bhs-ticker-track items-center gap-8 text-xs">
              {[0, 1].map((dupIdx) => (
                <div key={dupIdx} className="flex items-center gap-8 shrink-0 pr-8">
                  {marqueeNotices.map((item) =>
                    item.notice ? (
                      <button
                        key={`${dupIdx}-${item.key}`}
                        type="button"
                        onClick={() => setViewerNotice(item.notice || null)}
                        className="text-white/95 hover:text-[#E8CF8E] transition-colors whitespace-nowrap cursor-pointer font-medium"
                      >
                        {item.text}
                      </button>
                    ) : (
                      <span
                        key={`${dupIdx}-${item.key}`}
                        className="text-[#F4DDA0] font-medium whitespace-nowrap"
                      >
                        {item.text}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          <a
            href="#notice-board"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-[#E8CF8E] hover:underline shrink-0 whitespace-nowrap pl-3 border-l border-white/15"
          >
            <span>সব নোটিশ</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* =====================================================================
          FULL-BLEED HERO BANNER + 4 FLOATING QUICK LINK CARDS OVERLAPPING EDGE
      ====================================================================== */}
      <div className="relative">
        <div
          className="relative bg-[#0E1842] overflow-hidden min-h-[400px] sm:min-h-[450px] lg:min-h-[490px] flex items-center"
          onMouseEnter={() => setSliderPaused(true)}
          onMouseLeave={() => setSliderPaused(false)}
        >
          {/* Crossfading 4-Slide Background Photography */}
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              aria-hidden={idx !== activeSlideIdx}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                idx === activeSlideIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}

          {/* Lighter Architectural Scrim so Campus Photography Shines Clearly */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#0C163B]/60 via-[#0F1D4A]/32 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0C163B]/55 via-transparent to-[#0C163B]/10"
            aria-hidden="true"
          />

          {/* Slide Foreground Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 sm:pt-12 sm:pb-24 lg:pt-14 lg:pb-28">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs sm:text-[13px] font-semibold text-[#F4DDA0] tracking-wide tabular-nums drop-shadow-xs">
                {activeSlide.kicker}
              </p>

              <div className="space-y-2.5">
                <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-semibold text-white leading-[1.3] drop-shadow-sm">
                  {activeSlide.headlineBn}
                </h1>
                <p className="text-sm sm:text-[15px] text-white/95 leading-[1.7] max-w-xl drop-shadow-xs">
                  {activeSlide.subtitleBn}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={activeSlide.ctaHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#196540] rounded-xl transition-colors shadow-lg shadow-slate-950/25 whitespace-nowrap"
                >
                  <span>{activeSlide.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to={activeSlide.secondaryHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#1B2A6B] bg-white hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                >
                  <span>{activeSlide.secondaryLabel}</span>
                </Link>
              </div>
            </div>

            {/* Bottom Slider Controls Row */}
            <div className="mt-8 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="হিরো ব্যানার স্লাইড নির্বাচন"
                className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-5"
              >
                {heroSlides.map((slide, idx) => {
                  const isActive = idx === activeSlideIdx;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`group text-left py-1 transition-colors cursor-pointer ${
                        isActive ? 'text-white' : 'text-white/65 hover:text-white/95'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs font-medium whitespace-nowrap">
                        <span className="tabular-nums text-[11px] text-[#E8CF8E]">
                          0{idx + 1}
                        </span>
                        <span>{slide.labelBn}</span>
                      </span>
                      <span
                        className={`block h-0.5 mt-1 rounded-full transition-all duration-300 ${
                          isActive ? 'w-full bg-[#E8CF8E]' : 'w-8 bg-white/25 group-hover:bg-white/45'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="পূর্ববর্তী স্লাইড"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="পরবর্তী স্লাইড"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Floating Elevated Quick Links Overlapping Banner Bottom Edge */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14">
          <nav
            aria-label="দ্রুত প্রবেশ লিংক"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
          >
            {HERO_QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#1F7A4D] shadow-md shadow-slate-900/5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 p-4 sm:p-5 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#1F7A4D]/10 border border-[#1F7A4D]/20 text-[#1F7A4D] group-hover:bg-[#1F7A4D] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-[15px] font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors leading-snug">
                        {item.titleBn}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-1">
                        {item.descBn}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1F7A4D]">
                    <span>প্রবেশ করুন</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* =====================================================================
          MAIN HOMEPAGE CONTENT SECTIONS (COMPACT, SCANNABLE, MOBILE-FRIENDLY)
      ====================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 sm:space-y-12">
        {/* SECTION 1: COMPACT AUTO-SCROLLING NOTICE BOARD + CHAIRMAN & HEAD TEACHER MESSAGES (NO EXTRA TITLE) */}
        <section id="notice-board" className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left 7 Columns: Compact Height Vertically Auto-Scrolling Notice Board */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 bg-white">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
                  <h2 className="text-base sm:text-lg font-semibold text-[#1B2A6B]">
                    ডিজিটাল নোটিশ বোর্ড
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <div role="tablist" aria-label="নোটিশ বিভাগ" className="inline-flex bg-slate-100 p-0.5 rounded-lg">
                    {NOTICE_TABS.map((tab) => {
                      const active = noticeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setNoticeTab(tab.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#1F7A4D] text-white'
                              : 'text-slate-600 hover:text-[#1B2A6B]'
                          }`}
                        >
                          {tab.labelBn}
                        </button>
                      );
                    })}
                  </div>
                  <Link
                    to="/academics/notices"
                    className="text-xs font-semibold text-[#1B2A6B] hover:text-[#1F7A4D] inline-flex items-center gap-0.5 pl-1 whitespace-nowrap"
                  >
                    <span>সব</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Compact Fixed-Height Smooth Vertical Scrolling Viewport */}
              {filteredNotices.length === 0 ? (
                <div className="h-[320px] flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <p className="text-sm text-slate-600">এই বিভাগে কোনো প্রকাশিত বিজ্ঞপ্তি নেই।</p>
                  <button
                    type="button"
                    onClick={() => setNoticeTab('all')}
                    className="text-xs font-semibold text-[#1F7A4D] hover:underline cursor-pointer"
                  >
                    সব বিজ্ঞপ্তি দেখুন
                  </button>
                </div>
              ) : (
                <div
                  className="relative h-[320px] sm:h-[348px] overflow-hidden bg-white"
                  aria-label="চলমান বিজ্ঞপ্তি তালিকা"
                >
                  <div className={shouldScrollNoticesVertically ? 'bhs-notice-vertical-track' : 'flex flex-col'}>
                    <div>{filteredNotices.map((n) => renderNoticeRow(n, 'a'))}</div>
                    {shouldScrollNoticesVertically && (
                      <div aria-hidden="true">{filteredNotices.map((n) => renderNoticeRow(n, 'b'))}</div>
                    )}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            {/* Right 5 Columns: Chairman & Head Teacher Messages (Directly Paired, Zero Title Header) */}
            <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
              {/* Chairman Message Card */}
              <article className="flex-1 bg-white border border-slate-200 border-t-2 border-t-[#C9A961] rounded-2xl p-4 sm:p-5 flex gap-4 items-start">
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={SCHOOL_INFO.assets.chairmanPortrait}
                    alt={`${wc.chairmanName || 'সভাপতি'} — পরিচালনা পর্ষদ`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2">
                  <div>
                    <p className="text-[11px] font-semibold text-[#1F7A4D]">সভাপতির বাণী</p>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#1B2A6B] leading-snug truncate">
                      {wc.chairmanName}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">{wc.chairmanTitle}</p>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    “{(wc.chairmanMessage || '').replace(/^["“”'‘’\s]+|["“”'‘’\s]+$/g, '')}”
                  </p>
                  <div className="pt-1">
                    <Link
                      to="/about/chairman-message"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B2A6B] hover:text-[#1F7A4D] transition-colors"
                    >
                      <span>সম্পূর্ণ বাণী পড়ুন</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>

              {/* Head Teacher Message Card */}
              <article className="flex-1 bg-white border border-slate-200 border-t-2 border-t-[#1F7A4D] rounded-2xl p-4 sm:p-5 flex gap-4 items-start">
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={headTeacherPhoto}
                    alt={`${wc.headTeacherName} — প্রধান শিক্ষক`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-2">
                  <div>
                    <p className="text-[11px] font-semibold text-[#1F7A4D]">প্রধান শিক্ষকের বাণী</p>
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#1B2A6B] leading-snug truncate">
                      {wc.headTeacherName}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">{wc.headTeacherTitle}</p>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    “{(wc.headTeacherMessage || '').replace(/^["“”'‘’\s]+|["“”'‘’\s]+$/g, '')}”
                  </p>
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <Link
                      to="/about/head-teacher-message"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B2A6B] hover:text-[#1F7A4D] transition-colors"
                    >
                      <span>সম্পূর্ণ বাণী পড়ুন</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/about/management-committee"
                      className="text-[11px] font-medium text-slate-500 hover:text-[#1F7A4D] transition-colors"
                    >
                      পরিচালনা পর্ষদ →
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* SECTION 2: ASYMMETRIC VISUAL HERITAGE & WHY STUDY SHOWCASE */}
        <WhyStudyShowcaseSection />

        {/* SECTION 3: COMPACT STRUCTURAL OVERVIEW BAR (NO BULKY 6-CARD GRID) */}
        <section id="structural-info" className="scroll-mt-24">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] leading-snug">
                  ভবন, জমি, শ্রেণিকক্ষ, ল্যাব, মাল্টিমিডিয়া কক্ষ ও গ্রন্থাগার
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <Link
                  to="/others/media"
                  className="text-[#1B2A6B] hover:text-[#1F7A4D] inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <span>ক্যাম্পাস গ্যালারি</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <Link
                  to="/academics/library"
                  className="text-[#1F7A4D] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <span>গ্রন্থাগার দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {STRUCTURAL_OVERVIEW.map((spec) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={spec.labelBn}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#F7F8FC] border border-slate-200/70"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#1B2A6B] text-[#E8CF8E] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1B2A6B] tabular-nums leading-tight">
                        {spec.valueBn}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{spec.labelBn}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 4: COMPACT ACADEMIC & ENROLLMENT STATISTICS (TOP 5 KPI CARDS REMOVED) */}
        <section id="school-calculation" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] leading-snug">
                শ্রেণি, শিক্ষার্থী ও বোর্ড ফলাফল পরিসংখ্যান
              </h2>
            </div>
            <Link
              to="/about/students"
              className="text-xs sm:text-sm font-semibold text-[#1F7A4D] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>শ্রেণিভিত্তিক শিক্ষার্থী তথ্য</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <SchoolVisualizations />
        </section>

        {/* SECTION 5: MODERN FACULTY & STAFF HORIZONTAL SLIDER */}
        <FacultyStaffSliderSection teachers={activeTeachers} staff={activeStaff} />

        {/* SECTION 6: COMPACT EVENTS, ACHIEVEMENTS & ACADEMIC CALENDAR */}
        <section id="events-achievements" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] leading-snug">
              প্রাতিষ্ঠানিক অর্জন, সাম্প্রতিক অনুষ্ঠান ও একাডেমিক সূচি
            </h2>
            <Link
              to="/academics/calendar"
              className="text-xs sm:text-sm font-semibold text-[#1F7A4D] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>সম্পূর্ণ ক্যালেন্ডার</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {INSTITUTIONAL_ACHIEVEMENTS.map((ach) => (
              <article
                key={ach.titleBn}
                className="bg-white border border-slate-200 border-l-4 border-l-[#C9A961] rounded-xl p-4 space-y-1"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#1F7A4D] inline-flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-[#C9A961]" aria-hidden="true" />
                    <span>{ach.yearBn}</span>
                  </span>
                  <span className="font-bold text-[#1B2A6B] tabular-nums">{ach.metricBn}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#1B2A6B] leading-snug">
                  {ach.titleBn}
                </h3>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {db.events.slice(0, 2).map((ev, idx) => (
                <article
                  key={ev.id}
                  className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl overflow-hidden flex flex-col transition-all"
                >
                  <div className="h-36 overflow-hidden bg-slate-100">
                    <img
                      src={idx === 1 ? SCHOOL_INFO.assets.debateCulture : ev.imageUrl}
                      alt={ev.titleBn}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        idx === 1
                          ? 'object-bottom scale-[1.18] origin-bottom group-hover:scale-[1.22]'
                          : 'object-center group-hover:scale-[1.03]'
                      }`}
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-[#1F7A4D] tabular-nums">
                        {formatBanglaCalendarTile(ev.date).fullBn}
                      </p>
                      <h3 className="text-sm font-semibold text-[#1B2A6B] leading-snug line-clamp-2">
                        {ev.titleBn}
                      </h3>
                    </div>
                    <Link
                      to={idx === 1 ? '/clubs/debate-speech' : '/activities/sports'}
                      className="text-xs font-semibold text-[#1B2A6B] hover:text-[#1F7A4D] inline-flex items-center gap-1 pt-1.5 border-t border-slate-100"
                    >
                      <span>বিস্তারিত দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-[#1B2A6B]">আসন্ন একাডেমিক সূচি</h3>
                <Calendar className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
              </div>
              <ul className="divide-y divide-slate-100 flex-1">
                {db.calendar.slice(0, 4).map((cal) => {
                  const tile = formatBanglaCalendarTile(cal.date);
                  return (
                    <li key={cal.id} className="py-2 flex items-center gap-3">
                      <div className="w-11 shrink-0 text-center bg-[#F7F8FC] border border-slate-200 rounded-lg py-1">
                        <span className="block text-xs font-bold text-[#1B2A6B] tabular-nums leading-none">
                          {tile.dayBn}
                        </span>
                        <span className="block text-[10px] text-[#1F7A4D] mt-0.5">{tile.monthBn}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13px] font-semibold text-[#1B2A6B] truncate">
                          {cal.titleBn}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{cal.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 7: MODERN OUR STARS / NOTABLE ALUMNI HORIZONTAL SLIDER */}
        <InstitutionStarsSliderSection stars={INSTITUTION_STARS} />

        {/* SECTION 8: COMPACT ADMISSION CALLOUT, CONTACT & CAMPUS LOCATION MAP */}
        <section id="contact-location" className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="bg-[#1B2A6B] text-white rounded-2xl p-5 sm:p-6 space-y-3">
                <p className="text-xs font-semibold tracking-wide text-[#E8CF8E]">
                  ভর্তি কার্যক্রম ২০২৭ শিক্ষাবর্ষ
                </p>
                <h2 className="text-xl font-semibold leading-snug">
                  {wc.admissionHeadline || '৬ষ্ঠ থেকে ৯ম শ্রেণিতে ২০২৭ শিক্ষাবর্ষে ভর্তি চলছে'}
                </h2>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  {wc.admissionSubtitle ||
                    'অনলাইনে প্রাথমিক আবেদন সম্পন্ন করুন অথবা বিদ্যালয় অফিস থেকে প্রিন্টেড ফরম সংগ্রহ করুন।'}
                </p>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <Link
                    to="/others/online-admission"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#25905B] rounded-xl transition-colors"
                  >
                    <span>অনলাইন আবেদন করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/others/admission-form"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <span>ভর্তি ফরম প্রিন্ট</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5 text-xs sm:text-sm flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-[#1B2A6B]">যোগাযোগ ও অফিস সময়</h3>
                <p className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{wc.addressBn || SCHOOL_INFO.addressBn}</span>
                </p>
                <p className="flex items-start gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{wc.officeHoursBn || SCHOOL_INFO.officeHoursBn}</span>
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1 text-slate-700 tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#1F7A4D]" aria-hidden="true" />
                    {wc.contactPhone || SCHOOL_INFO.contactPlaceholders.officePhone}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1F7A4D]" aria-hidden="true" />
                    {wc.contactEmail || SCHOOL_INFO.contactPlaceholders.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col min-h-[300px]">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#1B2A6B]">
                  বিদ্যালয়ের অবস্থান (উপসী, নড়িয়া, শরীয়তপুর)
                </span>
                <a
                  href={SCHOOL_INFO.mapCoordinates.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#1F7A4D] hover:underline whitespace-nowrap"
                >
                  গুগল ম্যাপে দেখুন →
                </a>
              </div>
              <iframe
                title="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় মানচিত্র"
                src={SCHOOL_INFO.mapCoordinates.embedUrl}
                className="w-full flex-1 min-h-[250px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Institutional A4 Notice Print Viewer Modal */}
      <NoticePrintModal
        notice={viewerNotice}
        onClose={() => setViewerNotice(null)}
        onDownloadNotify={(n) => addToast('success', 'বিজ্ঞপ্তি ডাউনলোড সম্পন্ন হয়েছে', n.titleBn)}
        headTeacherName={wc.headTeacherName}
      />
    </div>
  );
}
