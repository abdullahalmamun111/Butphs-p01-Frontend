import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Quote,
  Search,
  ShieldCheck,
  Target,
  Users,
  X,
  ZoomIn,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { CLASS_LIST } from '../../constants/navigation';
import {
  INSTITUTION_STARS,
  STAR_FIELD_CATEGORIES,
  filterInstitutionStars,
  type StarFieldCategory,
} from '../../data/institutionStars';
import {
  COMMITTEE_FILTER_CATEGORIES,
  filterCommitteeMembers,
} from '../../utils/portalHelpers';
import type { CommitteeCategory } from '../../types';
import { useSchoolStore } from '../../store/SchoolStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/shared/PageHeader';
import { SafeImage } from '../../components/ui/SafeImage';
import { EmptyState } from '../../components/ui/EmptyState';
import { toBanglaDigits } from '../../utils/noticeUtils';

interface HistoryGalleryPhoto {
  id: string;
  figureNoBn: string;
  titleBn: string;
  captionBn: string;
  src: string;
  imageClassName?: string;
}

const HISTORY_GALLERY_PHOTOS: HistoryGalleryPhoto[] = [
  {
    id: 'gal-1',
    figureNoBn: 'চিত্র ০১',
    titleBn: 'মূল একাডেমিক ভবন ও প্রাঙ্গণ',
    captionBn: '১৮৯৮ সালে প্রতিষ্ঠিত বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের ঐতিহ্যবাহী প্রধান একাডেমিক ভবন ও সবুজ প্রাঙ্গণ।',
    src: SCHOOL_INFO.assets.campusHero,
  },
  {
    id: 'gal-2',
    figureNoBn: 'চিত্র ০২',
    titleBn: 'প্রাত্যহিক সমাবেশ ও জাতীয় পতাকা উত্তোলন',
    captionBn: 'প্রতিদিন সকাল ১০টায় শৃঙ্খলা, জাতীয় সংগীত ও শপথ পাঠের মধ্য দিয়ে বিদ্যালয়ের পাঠদান কার্যক্রম শুরু হয়।',
    src: SCHOOL_INFO.assets.morningAssembly,
  },
  {
    id: 'gal-3',
    figureNoBn: 'চিত্র ০৩',
    titleBn: 'আধুনিক মাল্টিমিডিয়া ও স্মার্ট শ্রেণিকক্ষ',
    captionBn: 'ডিজিটাল প্রজেক্টর ও আলো-বাতাসযুক্ত শ্রেণিকক্ষে অভিজ্ঞ শিক্ষকদের নিবিড় তত্ত্বাবধানে পাঠদান।',
    src: SCHOOL_INFO.assets.classroomStudy,
  },
  {
    id: 'gal-4',
    figureNoBn: 'চিত্র ০৪',
    titleBn: 'বিজ্ঞান ও আইসিটি গবেষণাগার',
    captionBn: 'পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান ও কম্পিউটার ল্যাবে শিক্ষার্থীদের হাতে-কলমে ব্যবহারিক অনুশীলন।',
    src: SCHOOL_INFO.assets.scienceLab,
  },
  {
    id: 'gal-5',
    figureNoBn: 'চিত্র ০৫',
    titleBn: 'বিতর্ক, সাহিত্য ও সহশিক্ষা মঞ্চ',
    captionBn: 'আন্তঃশ্রেণি ও উপজেলা পর্যায়ের বিতর্ক, বক্তৃতা এবং সাংস্কৃতিক প্রতিযোগিতায় শিক্ষার্থীদের স্বতঃস্ফূর্ত অংশগ্রহণ।',
    src: SCHOOL_INFO.assets.debateCulture,
    imageClassName: 'object-bottom scale-[1.22] origin-bottom',
  },
  {
    id: 'gal-6',
    figureNoBn: 'চিত্র ০৬',
    titleBn: 'সমৃদ্ধ পাঠাগার ও সবুজ খেলার মাঠ',
    captionBn: '৩,৫০০+ বইসমৃদ্ধ বিদ্যালয় গ্রন্থাগার ও বার্ষিক ক্রীড়া আয়োজনের প্রশস্ত খেলার মাঠ।',
    src: SCHOOL_INFO.assets.schoolLibrary,
  },
];

const HISTORY_PILLARS = [
  {
    stepBn: '০১ · প্রতিষ্ঠার ইতিহাস',
    titleBn: '১৮৯৮ খ্রিস্টাব্দে নড়িয়া-উপসীতে শিক্ষার আলোকবর্তিকা',
    bodyBn:
      'ঊনবিংশ শতাব্দীর শেষ প্রান্তে ১৮৯৮ খ্রিস্টাব্দে শরীয়তপুর জেলার নড়িয়া উপজেলার উপসী অঞ্চলের বিদ্যানুরাগী ব্যক্তিবর্গের ঐকান্তিক প্রচেষ্টায় বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের গোড়াপত্তন হয়। গ্রামীণ জনপদে মানসম্মত মাধ্যমিক শিক্ষার আলো পৌঁছে দেওয়ার যে অঙ্গীকার নিয়ে এই বিদ্যাপীঠ যাত্রা শুরু করেছিল, ১২৮ বছরেরও বেশি সময় ধরে তা অক্ষুণ্ণ রয়েছে।',
    highlights: [
      'প্রতিষ্ঠাকাল: ১৮৯৮ খ্রিস্টাব্দ · শরীয়তপুরের অন্যতম প্রাচীন উচ্চ বিদ্যালয়',
      'প্রাতিষ্ঠানিক পরিচিতি: EIIN 113585 · বিদ্যালয় কোড 6102',
      'প্রজন্মের পর প্রজন্ম ধরে নৈতিক ও মানসম্মত মাধ্যমিক শিক্ষা বিস্তার',
    ],
    image: SCHOOL_INFO.assets.morningAssembly,
    imageAlt: 'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের প্রাত্যহিক সমাবেশ',
    captionBn: 'প্রাত্যহিক সমাবেশ · শৃঙ্খলা ও দেশপ্রেমের চর্চা',
  },
  {
    stepBn: '০২ · ঐতিহ্য ও সহশিক্ষা',
    titleBn: 'মেধা, সংস্কৃতি, বিতর্ক ও নেতৃত্বের সমন্বিত বিকাশ',
    bodyBn:
      'পাঠ্যবইয়ের শিক্ষার পাশাপাশি শিক্ষার্থীদের সৃজনশীলতা, মানবিক মূল্যবোধ ও নেতৃত্বগুণ বিকাশে বিদ্যালয়টি নিরন্তর কাজ করছে। বার্ষিক ক্রীড়া প্রতিযোগিতা, বিতর্ক ও সাহিত্য আসর, বাংলাদেশ স্কাউটস, গার্লস গাইড এবং জাতীয় দিবস উদযাপনে বিদ্যালয়ের শিক্ষার্থীরা উপজেলা ও জেলা পর্যায়ে নিয়মিত কৃতিত্ব অর্জন করে আসছে।',
    highlights: [
      '৮টি সক্রিয় শিক্ষার্থী ক্লাব, স্কাউট দল ও গার্লস গাইড ইউনিট',
      'বার্ষিক সাহিত্য ম্যাগাজিন “অরুণোদয়” ও দেয়ালিকা প্রকাশনা',
      'আন্তঃবিদ্যালয় বিতর্ক, বিজ্ঞান মেলা ও ক্রীড়া প্রতিযোগিতায় শীর্ষ সাফল্য',
    ],
    image: SCHOOL_INFO.assets.debateCulture,
    imageAlt: 'বিদ্যালয়ের বিতর্ক ও সাহিত্য প্রতিযোগিতা',
    imageClassName: 'object-bottom scale-[1.22] origin-bottom',
    captionBn: 'সহশিক্ষা ও বিতর্ক চর্চা · আত্মবিশ্বাসী প্রজন্ম গঠন',
  },
  {
    stepBn: '০৩ · অবকাঠামো ও আধুনিক ক্যাম্পাস',
    titleBn: 'স্মার্ট শ্রেণিকক্ষ, বিজ্ঞান-আইসিটি ল্যাব ও নিরাপদ পরিবেশ',
    bodyBn:
      'সময়ের চাহিদা অনুযায়ী বিদ্যালয়ে আধুনিক বিজ্ঞান গবেষণাগার, শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব, ৩,৫০০+ বইসমৃদ্ধ গ্রন্থাগার এবং RFID স্মার্ট গেট হাজিরা ব্যবস্থা চালু রয়েছে। সুশৃঙ্খল একাডেমিক ভবন ও সবুজ প্রাঙ্গণ শিক্ষার্থীদের শেখার আদর্শ পরিবেশ নিশ্চিত করে।',
    highlights: [
      '৪টি একাডেমিক ও প্রশাসনিক ভবন · ১৮টি প্রশস্ত শ্রেণিকক্ষ ও ৬টি মাল্টিমিডিয়া কক্ষ',
      'পৃথক পদার্থ-রসায়ন-জীববিজ্ঞান গবেষণাগার ও আধুনিক কম্পিউটার ল্যাব',
      'RFID গেট হাজিরা, অভিভাবক SMS বিজ্ঞপ্তি ও অনলাইন ফলাফল ব্যবস্থা',
    ],
    image: SCHOOL_INFO.assets.classroomStudy,
    imageAlt: 'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের আধুনিক স্মার্ট শ্রেণিকক্ষ',
    captionBn: 'স্মার্ট শ্রেণিকক্ষ · আধুনিক ও আনন্দময় পাঠদান',
  },
];

const HISTORY_TIMELINE = [
  {
    stepBn: '০১',
    eraBn: '১৮৯৮ খ্রি.',
    titleBn: 'প্রতিষ্ঠালগ্ন ও যাত্রা শুরু',
    descBn:
      'উপসী, নড়িয়া, শরীয়তপুরে স্থানীয় শিক্ষানুরাগী ও সমাজহিতৈষীদের উদ্যোগে বিদ্যালয়ের আনুষ্ঠানিক পথচলা শুরু হয়।',
  },
  {
    stepBn: '০২',
    eraBn: '১৯৫০ – ১৯৮৫',
    titleBn: 'একাডেমিক সম্প্রসারণ ও বোর্ড স্বীকৃতি',
    descBn:
      'মাধ্যমিক শিক্ষা বোর্ডের পূর্ণাঙ্গ স্বীকৃতি অর্জন, বিজ্ঞান ও মানবিক বিভাগ চালু এবং পাকা একাডেমিক ভবন নির্মাণ।',
  },
  {
    stepBn: '০৩',
    eraBn: '১৯৯৫ – ২০১৫',
    titleBn: 'ব্যবসায় শিক্ষা, গবেষণাগার ও সহশিক্ষা সমৃদ্ধি',
    descBn:
      'ব্যবসায় শিক্ষা শাখা সংযোজন, আধুনিক বিজ্ঞান ল্যাব, সমৃদ্ধ পাঠাগার ও স্কাউটিং কার্যক্রম বিস্তৃতি।',
  },
  {
    stepBn: '০৪',
    eraBn: '২০১৬ – বর্তমান',
    titleBn: 'ডিজিটাল শিক্ষা ও স্মার্ট বিদ্যালয় ব্যবস্থাপনা',
    descBn:
      'মাল্টিমিডিয়া শ্রেণিকক্ষ, কম্পিউটার ল্যাব, RFID উপস্থিতি, অনলাইন ভর্তি আবেদন ও ডিজিটাল ফলাফল পোর্টাল প্রবর্তন।',
  },
];

export function SchoolHistoryPage() {
  useDocumentTitle('ইতিহাস ও গৌরবময় ঐতিহ্য · School History');
  const { db } = useSchoolStore();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % HISTORY_GALLERY_PHOTOS.length));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) =>
          prev === null
            ? null
            : (prev - 1 + HISTORY_GALLERY_PHOTOS.length) % HISTORY_GALLERY_PHOTOS.length
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIdx]);

  const activePhoto = lightboxIdx !== null ? HISTORY_GALLERY_PHOTOS[lightboxIdx] : null;
  const totalStaffAndTeachers = db.teachers.length + db.staff.length;

  return (
    <div className="bg-[#F7F8FC]">
      {/* Editorial Header Band */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
          {/* Institutional Meta */}
          <div className="space-y-4 max-w-4xl">

            <p className="text-xs sm:text-sm font-semibold text-[#1F7A4D] tracking-wide tabular-nums">
              স্থাপিত: {SCHOOL_INFO.establishedBn} · EIIN: {SCHOOL_INFO.eiin} · বিদ্যালয় কোড:{' '}
              {SCHOOL_INFO.schoolCode} · উপসী, নড়িয়া, শরীয়তপুর
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold text-[#1B2A6B] leading-tight">
              ইতিহাস ও গৌরবময় ঐতিহ্য
            </h1>

            <p className="text-sm sm:text-base text-slate-700 leading-[1.85]">
              ১৮৯৮ খ্রিস্টাব্দে প্রতিষ্ঠিত <strong>{SCHOOL_INFO.nameBn} ({SCHOOL_INFO.shortName})</strong>{' '}
              শরীয়তপুর জেলার নড়িয়া উপজেলার উপসী অঞ্চলের অন্যতম প্রাচীন, ঐতিহ্যবাহী ও সুনামধন্য মাধ্যমিক শিক্ষা প্রতিষ্ঠান।
              ষষ্ঠ থেকে দশম শ্রেণি পর্যন্ত মানসম্মত পাঠদান, নৈতিক শৃঙ্খলা এবং আধুনিক ডিজিটাল শিক্ষাব্যবস্থার সমন্বয়ে আমরা আলোকিত মানুষ গড়ার লক্ষ্যে নিরলসভাবে কাজ করছি।
            </p>

            {/* Institutional Motto Quote */}
            <blockquote className="pt-2 border-t border-slate-100 flex items-start gap-3">
              <Quote className="w-5 h-5 text-[#C9A961] shrink-0 mt-1" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="text-base sm:text-lg font-semibold text-[#1B2A6B]">
                  “{SCHOOL_INFO.mottoBn}”
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  {SCHOOL_INFO.mottoEn} — ১২৮+ বছর ধরে প্রজন্মের পর প্রজন্মকে আলোকিত করার অঙ্গীকার
                </p>
              </div>
            </blockquote>
          </div>

          {/* 4 Summary Institutional Stat Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'প্রতিষ্ঠাকাল', value: '১৮৯৮ খ্রি.', sub: '১২৮+ বছরের ঐতিহ্য' },
              { label: 'শিক্ষা স্তর', value: '৬ষ্ঠ – ১০ম শ্রেণি', sub: 'মাধ্যমিক পর্যায়' },
              { label: 'একাডেমিক বিভাগ', value: '৩টি বিভাগ', sub: 'বিজ্ঞান · মানবিক · ব্যবসায় শিক্ষা' },
              {
                label: 'শিক্ষক ও কর্মচারী',
                value: `${toBanglaDigits(Math.max(28, totalStaffAndTeachers))} জন`,
                sub: 'অভিজ্ঞ ও প্রশিক্ষিত মানবসম্পদ',
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className="bg-[#F7F8FC] border border-slate-200 rounded-xl p-4 sm:p-5 space-y-1"
              >
                <p className="text-xs font-medium text-slate-500">{tile.label}</p>
                <p className="text-lg sm:text-xl font-bold text-[#1B2A6B] tabular-nums">
                  {tile.value}
                </p>
                <p className="text-[11px] text-[#1F7A4D] font-medium">{tile.sub}</p>
              </div>
            ))}
          </div>

          {/* Lead Campus Feature Photograph */}
          <figure className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setLightboxIdx(0)}
              className="group relative block w-full overflow-hidden text-left cursor-pointer"
              aria-label="মূল ক্যাম্পাস আলোকচিত্র বড় করে দেখুন"
            >
              <SafeImage
                src={SCHOOL_INFO.assets.campusHero}
                alt="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের মূল ক্যাম্পাস"
                className="w-full h-[260px] sm:h-[400px] lg:h-[460px] object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1842]/85 text-white text-xs font-medium backdrop-blur-xs">
                <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>বড় করে দেখুন</span>
              </span>
            </button>
            <figcaption className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 bg-white border-t border-slate-100">
              <span className="font-semibold text-[#1B2A6B]">
                চিত্র ০১ · মূল একাডেমিক ভবন ও প্রাঙ্গণ — {SCHOOL_INFO.nameBn}
              </span>
              <span>উপসী, নড়িয়া, শরীয়তপুর · স্থাপিত ১৮৯৮ খ্রি.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Main Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* 3 Alternating Institutional Pillars */}
        <section className="space-y-10">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-semibold text-[#1F7A4D] tracking-wide">
              Institutional Journey · প্রাতিষ্ঠানিক ভিত্তি
            </p>
            <h2 className="text-2xl sm:text-[30px] font-semibold text-[#1B2A6B] leading-snug">
              প্রতিষ্ঠানের পথচলা ও মূল স্তম্ভসমূহ
            </h2>
          </div>

          <div className="space-y-8">
            {HISTORY_PILLARS.map((pillar, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <article
                  key={pillar.stepBn}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
                >
                  <div
                    className={`lg:col-span-6 overflow-hidden bg-slate-100 relative min-h-[250px] ${
                      reversed ? 'lg:order-2' : ''
                    }`}
                  >
                    <SafeImage
                      src={pillar.image}
                      alt={pillar.imageAlt}
                      className={`w-full h-full object-cover ${pillar.imageClassName || 'object-center'}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1842]/85 via-[#0E1842]/30 to-transparent px-5 pt-10 pb-3.5">
                      <p className="text-xs font-medium text-white/95">{pillar.captionBn}</p>
                    </div>
                  </div>

                  <div
                    className={`lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-4 ${
                      reversed ? 'lg:order-1' : ''
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#1F7A4D] tracking-wide">
                      {pillar.stepBn}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#1B2A6B] leading-snug">
                      {pillar.titleBn}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-slate-700 leading-[1.85]">
                      {pillar.bodyBn}
                    </p>
                    <ul className="space-y-2 pt-2 border-t border-slate-100">
                      {pillar.highlights.map((hl) => (
                        <li key={hl} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#1F7A4D] mt-2 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 4-Step Chronological Timeline */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <p className="text-xs font-semibold text-[#1F7A4D] tracking-wide">
                Chronology · ১৮৯৮ থেকে বর্তমান
              </p>
              <h2 className="text-2xl sm:text-[30px] font-semibold text-[#1B2A6B] mt-1 leading-snug">
                ধারাবাহিক অগ্রযাত্রার ধাপসমূহ
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              ১৮৯৮ – ২০২৬ · ১২৮+ বছরের ইতিহাস
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HISTORY_TIMELINE.map((item) => (
              <div
                key={item.stepBn}
                className="bg-white border border-slate-200 border-t-2 border-t-[#1F7A4D] rounded-2xl p-6 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1B2A6B] tabular-nums">ধাপ {item.stepBn}</span>
                    <span className="font-semibold text-[#1F7A4D] tabular-nums">{item.eraBn}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#1B2A6B] leading-snug">
                    {item.titleBn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-[1.75]">{item.descBn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6-Photo Interactive Campus Gallery with Lightbox */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <p className="text-xs font-semibold text-[#1F7A4D] tracking-wide">
                Campus Archive · আলোকচিত্র সংগ্রহ
              </p>
              <h2 className="text-2xl sm:text-[30px] font-semibold text-[#1B2A6B] mt-1 leading-snug">
                ক্যাম্পাস চিত্রশালা
              </h2>
            </div>
            <Link
              to="/others/media"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1B2A6B] hover:text-[#1F7A4D]"
            >
              <span>পূর্ণ মিডিয়া গ্যালারি দেখুন</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HISTORY_GALLERY_PHOTOS.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIdx(idx)}
                className="group text-left bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-md cursor-pointer"
              >
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                  <SafeImage
                    src={photo.src}
                    alt={photo.titleBn}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      photo.imageClassName || 'object-center'
                    }`}
                  />
                  <span className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#0E1842]/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-[11px] font-semibold text-[#1F7A4D] tabular-nums">
                    {photo.figureNoBn}
                  </p>
                  <h3 className="text-sm font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors">
                    {photo.titleBn}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {photo.captionBn}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Bottom 2-Column Institutional Reference & Quick Explore */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <SafeImage
                src={SCHOOL_INFO.assets.logo}
                alt={SCHOOL_INFO.nameBn}
                className="w-16 h-16 object-contain shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1F7A4D]">
                  Institutional Profile · মৌলিক পরিচিতি
                </p>
                <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] leading-snug">
                  প্রতিষ্ঠানের মৌলিক তথ্যপঞ্জি
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{SCHOOL_INFO.nameEn}</p>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 text-sm">
              {[
                ['প্রতিষ্ঠানের নাম', SCHOOL_INFO.nameBn],
                ['প্রতিষ্ঠাকাল', `${SCHOOL_INFO.establishedBn} (${SCHOOL_INFO.established})`],
                ['EIIN নম্বর', SCHOOL_INFO.eiin],
                ['বিদ্যালয় কোড', SCHOOL_INFO.schoolCode],
                ['অবস্থান', SCHOOL_INFO.addressBn],
                ['শিক্ষা স্তর', 'ষষ্ঠ শ্রেণি থেকে দশম শ্রেণি (মাধ্যমিক)'],
                ['একাডেমিক বিভাগ', 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা (ঢাকা শিক্ষা বোর্ড)'],
                ['অফিস সময়', SCHOOL_INFO.officeHoursBn],
              ].map(([dt, dd]) => (
                <div key={dt} className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                  <dt className="sm:col-span-4 text-xs sm:text-sm font-medium text-slate-500">
                    {dt}
                  </dt>
                  <dd className="sm:col-span-8 text-xs sm:text-sm font-semibold text-[#1B2A6B] tabular-nums">
                    {dd}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="lg:col-span-5 bg-[#1B2A6B] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#E8CF8E] tracking-wide">
                  Explore Further · সম্পর্কিত পাতাসমূহ
                </p>
                <h2 className="text-xl font-semibold">আরও জানুন</h2>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের নেতৃত্ব, শিক্ষকমণ্ডলী, কৃতি প্রাক্তন শিক্ষার্থী ও ক্যাম্পাস জীবন সম্পর্কে বিস্তারিত জানুন।
                </p>
              </div>

              <ul className="divide-y divide-white/15">
                {[
                  { label: 'লক্ষ্য, উদ্দেশ্য ও আদর্শ (Mission & Vision)', href: '/about/mission-vision' },
                  { label: 'সভাপতির বাণী (Chairman’s Message)', href: '/about/chairman-message' },
                  { label: 'প্রধান শিক্ষকের বাণী (Head Teacher’s Message)', href: '/about/head-teacher-message' },
                  { label: 'পরিচালনা পর্ষদ (Managing Committee)', href: '/about/management-committee' },
                  { label: 'সকল শিক্ষকের পূর্ণাঙ্গ তালিকা (Teachers)', href: '/about/teachers' },
                  { label: 'আমাদের কৃতি প্রাক্তন শিক্ষার্থী (Our Stars)', href: '/about/stars' },
                  { label: 'ফটো ও মিডিয়া গ্যালারি (Campus Gallery)', href: '/others/media' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="py-3 flex items-center justify-between gap-3 text-sm text-white/95 hover:text-[#E8CF8E] transition-colors group"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/others/online-admission"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#1F7A4D] hover:bg-[#25905B] text-white text-sm font-semibold transition-colors"
            >
              <span>ভর্তি আবেদন ২০২৭</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </aside>
        </section>
      </div>

      {/* Interactive Lightbox Modal */}
      {activePhoto && lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.titleBn}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1F7A4D] tabular-nums">
                  {activePhoto.figureNoBn} · {toBanglaDigits(lightboxIdx + 1)} /{' '}
                  {toBanglaDigits(HISTORY_GALLERY_PHOTOS.length)}
                </p>
                <h3 className="text-sm sm:text-base font-semibold text-[#1B2A6B] truncate">
                  {activePhoto.titleBn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIdx(null)}
                aria-label="বন্ধ করুন"
                className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-slate-950 flex items-center justify-center">
              <SafeImage
                src={activePhoto.src}
                alt={activePhoto.titleBn}
                className="w-full max-h-[65vh] object-contain"
              />
              <button
                type="button"
                onClick={() =>
                  setLightboxIdx(
                    (lightboxIdx - 1 + HISTORY_GALLERY_PHOTOS.length) % HISTORY_GALLERY_PHOTOS.length
                  )
                }
                aria-label="পূর্ববর্তী ছবি"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1B2A6B] flex items-center justify-center shadow-md cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIdx((lightboxIdx + 1) % HISTORY_GALLERY_PHOTOS.length)}
                aria-label="পরবর্তী ছবি"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1B2A6B] flex items-center justify-center shadow-md cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 bg-[#F7F8FC] text-xs sm:text-sm text-slate-700 leading-relaxed">
              {activePhoto.captionBn}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StarsOfInstitutionPage() {
  useDocumentTitle('আমাদের কৃতি প্রাক্তন শিক্ষার্থী · Stars of Our Institution');
  const [category, setCategory] = useState<StarFieldCategory>('ALL');
  const [query, setQuery] = useState('');

  const filtered = filterInstitutionStars(INSTITUTION_STARS, category, query);

  return (
    <div className="bg-[#F7F8FC]">
      <PageHeader
        breadcrumbs={[
          { label: 'About', href: '/about/history' },
          { label: 'Stars of Our Institution' },
        ]}
        kicker="Pride of BUTPHS · ১৮৯৮ সাল থেকে আলোকিত প্রাক্তন শিক্ষার্থী"
        title="Stars of Our Institution"
        titleBn="আমাদের প্রতিষ্ঠানের কৃতি প্রাক্তন শিক্ষার্থী ও গর্বিত নক্ষত্রবৃন্দ"
        description="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের প্রাক্তন শিক্ষার্থীরা আজ চিকিৎসা, প্রকৌশল, জনপ্রশাসন, ব্যাংকিং, বিশ্ববিদ্যালয় শিক্ষকতা ও গবেষণায় দেশ-বিদেশে গৌরবের সাথে নেতৃত্ব দিচ্ছেন।"
        actions={
          <Link
            to="/about/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <span>প্রতিষ্ঠানের ইতিহাস</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Search & Field Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
              <input
                type="search"
                aria-label="নাম, এসএসসি ব্যাচ বা বর্তমান প্রতিষ্ঠান খুঁজুন"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="নাম, ব্যাচ (যেমন ২০১৪), পদবি বা প্রতিষ্ঠান খুঁজুন..."
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>
            <p className="text-xs text-slate-500 tabular-nums">
              মোট প্রদর্শিত:{' '}
              <span className="font-semibold text-[#1B2A6B]">{toBanglaDigits(filtered.length)}</span> /{' '}
              {toBanglaDigits(INSTITUTION_STARS.length)} জন কৃতি শিক্ষার্থী
            </p>
          </div>

          <div
            role="tablist"
            aria-label="পেশাগত ক্ষেত্র অনুযায়ী বাছাই"
            className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100"
          >
            {STAR_FIELD_CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#1F7A4D] text-white'
                      : 'bg-[#F7F8FC] text-slate-700 border border-slate-200 hover:border-[#1B2A6B] hover:text-[#1B2A6B]'
                  }`}
                >
                  {cat === 'ALL' ? 'সকল ক্ষেত্র' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="কোনো কৃতি প্রাক্তন শিক্ষার্থী পাওয়া যায়নি"
            description="অনুসন্ধান শব্দ বা বিভাগ পরিবর্তন করে আবার চেষ্টা করুন।"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((star) => (
              <article
                key={star.id}
                className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[4/5] bg-slate-100 overflow-hidden relative">
                  <SafeImage
                    src={star.photoUrl}
                    alt={`${star.nameBn} — ${star.sscBatchBn}`}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1842]/92 via-[#0E1842]/45 to-transparent px-4 pt-12 pb-3.5">
                    <p className="text-[11px] font-semibold text-[#E8CF8E] tabular-nums">
                      {star.sscBatchBn} · {star.groupBn}
                    </p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1.5">
                    <h2 className="text-base font-semibold text-[#1B2A6B] leading-snug">
                      {star.nameBn}
                    </h2>
                    <p className="text-xs font-semibold text-[#1F7A4D] leading-snug">
                      {star.currentPositionBn}
                    </p>
                    <p className="text-xs text-slate-600 inline-flex items-start gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{star.organizationBn}</span>
                    </p>
                    <p className="text-xs text-slate-500 pt-1.5 inline-flex items-start gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#C9A961] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{star.achievementBn}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                      “{star.quoteBn}”
                    </p>
                    <p className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      <span>{star.locationBn} · {star.fieldCategory}</span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Alumni Callout Banner */}
        <div className="bg-[#1B2A6B] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <p className="text-xs font-semibold text-[#E8CF8E] inline-flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              <span>BUTPHS Alumni Network · প্রাক্তন শিক্ষার্থী নিবন্ধন</span>
            </p>
            <h2 className="text-lg sm:text-xl font-semibold">
              আপনিও কি বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের প্রাক্তন শিক্ষার্থী?
            </h2>
            <p className="text-xs sm:text-sm text-white/80">
              বিদ্যালয়ের প্রাক্তন শিক্ষার্থী আর্কাইভে আপনার তথ্য যুক্ত করতে বিদ্যালয় অফিস বা যোগাযোগ পাতার মাধ্যমে আমাদের জানান।
            </p>
          </div>
          <Link
            to="/others/community"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1F7A4D] hover:bg-[#25905B] text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors"
          >
            <span>যোগাযোগ ও নিবন্ধন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ManagingCommitteePage() {
  useDocumentTitle('পরিচালনা পর্ষদ · Managing Committee');
  const { db } = useSchoolStore();
  const [category, setCategory] = useState<'ALL' | CommitteeCategory>('ALL');
  const [query, setQuery] = useState('');

  const members = db.committeeMembers;
  const executiveMembers = members.filter((m) => m.category === 'সভাপতি ও নেতৃত্ব');
  const filtered = filterCommitteeMembers(members, category, query);

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="প্রাতিষ্ঠানিক নেতৃত্ব ও সুশাসন · ২০২৫–২০২৭ মেয়াদ"
        title="Managing Committee"
        titleBn="বিদ্যালয় পরিচালনা পর্ষদ"
        description="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের সার্বিক উন্নয়ন, নীতি নির্ধারণ, স্বচ্ছতা ও একাডেমিক মানোন্নয়নে নিয়োজিত পরিচালনা পর্ষদের সম্মানিত সদস্যবৃন্দ।"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/about/chairman-message"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg font-bn"
            >
              <span>সভাপতির বাণী</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/about/head-teacher-message"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bn"
            >
              <span>প্রধান শিক্ষকের বাণী</span>
            </Link>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 font-bn">
        {/* Featured Executive Leadership (Chairman & Member Secretary) */}
        {executiveMembers.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <p className="text-xs font-semibold text-[#1F7A4D]">Executive Leadership · শীর্ষ নির্বাহী নেতৃত্ব</p>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#1B2A6B] mt-0.5">
                  সভাপতি ও সদস্য সচিব
                </h2>
              </div>
              <span className="text-xs text-slate-500 tabular-nums">
                বর্তমান পর্ষদ মেয়াদ: ২০২৫–২০২৭ · মোট সদস্য {toBanglaDigits(members.length)} জন
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {executiveMembers.map((exec) => (
                <article
                  key={exec.id}
                  className="bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-12 transition-all hover:shadow-md"
                >
                  <div className="sm:col-span-5 bg-slate-100 aspect-[4/5] sm:aspect-auto relative overflow-hidden">
                    <SafeImage
                      src={exec.photoUrl || SCHOOL_INFO.assets.chairmanPortrait}
                      alt={exec.nameBn}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1842]/90 via-[#0E1842]/40 to-transparent px-4 pt-10 pb-3">
                      <p className="text-[11px] font-semibold text-[#E8CF8E] tabular-nums">
                        {exec.tenure}
                      </p>
                    </div>
                  </div>
                  <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#1F7A4D]">{exec.roleBn}</p>
                      <h3 className="text-lg sm:text-xl font-bold text-[#1B2A6B] leading-snug">
                        {exec.nameBn}
                      </h3>
                      <p className="text-xs text-slate-500 font-sans">{exec.name} · {exec.role}</p>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 line-clamp-3">
                        {exec.bioBn}
                      </p>
                      {exec.quoteBn && (
                        <p className="text-xs text-[#1B2A6B] italic pt-2 border-t border-slate-100 line-clamp-2">
                          “{exec.quoteBn.replace(/^[“"]+|[”"]+$/g, '')}”
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 truncate">{exec.professionBn}</span>
                      <Link
                        to={`/about/management-committee/${exec.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F7A4D] hover:text-[#165B39] shrink-0"
                      >
                        <span>পূর্ণাঙ্গ প্রোফাইল</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Filter & Search Bar */}
        <section className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  type="search"
                  aria-label="পরিচালনা পর্ষদের সদস্য খুঁজুন"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="সদস্যের নাম, পদবি বা পেশা খুঁজুন..."
                  className="w-full h-10 pl-10 pr-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#1F7A4D]"
                />
              </div>
              <p className="text-xs text-slate-500 tabular-nums">
                প্রদর্শিত:{' '}
                <span className="font-semibold text-[#1B2A6B]">{toBanglaDigits(filtered.length)}</span> /{' '}
                {toBanglaDigits(members.length)} জন সদস্য
              </p>
            </div>

            <div
              role="tablist"
              aria-label="সদস্যের ধরন অনুযায়ী ফিল্টার"
              className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100"
            >
              {COMMITTEE_FILTER_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#1F7A4D] text-white'
                        : 'bg-[#F7F8FC] text-slate-700 border border-slate-200 hover:border-[#1B2A6B] hover:text-[#1B2A6B]'
                    }`}
                  >
                    {cat === 'ALL' ? 'সকল সদস্য' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="কোনো সদস্য পাওয়া যায়নি"
              description="অনুসন্ধান শব্দ বা ক্যাটাগরি পরিবর্তন করে আবার চেষ্টা করুন।"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((member) => (
                <Link
                  key={member.id}
                  to={`/about/management-committee/${member.id}`}
                  className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-[4/5] bg-slate-100 overflow-hidden relative">
                    <SafeImage
                      src={member.photoUrl || SCHOOL_INFO.assets.committeeGuardianMale}
                      alt={member.nameBn}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1842]/92 via-[#0E1842]/40 to-transparent px-4 pt-12 pb-3.5">
                      <p className="text-[11px] font-semibold text-[#E8CF8E] truncate">
                        {member.roleBn}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors leading-snug">
                        {member.nameBn}
                      </h3>
                      <p className="text-xs text-slate-500 font-sans">{member.name}</p>
                      <p className="text-xs text-slate-600 pt-1.5 inline-flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" aria-hidden="true" />
                        <span className="truncate">{member.professionBn}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 tabular-nums">{member.tenure}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#1F7A4D]">
                        <span>প্রোফাইল দেখুন</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function TeachersDirectoryPage() {
  useDocumentTitle('সকল শিক্ষকের পূর্ণাঙ্গ তালিকা · Teachers Directory');
  const { db } = useSchoolStore();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('ALL');

  const activeTeachers = db.teachers.filter((t) => t.status === 'Active');
  const departments = [
    'ALL',
    ...Array.from(new Set(activeTeachers.map((t) => t.departmentBn || t.department))),
  ];

  const filtered = activeTeachers.filter((t) => {
    const tDept = t.departmentBn || t.department;
    if (dept !== 'ALL' && tDept !== dept) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.nameBn.includes(query) ||
        t.designation.toLowerCase().includes(q) ||
        t.designationBn.includes(query) ||
        tDept.includes(query)
      );
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'About', href: '/about/history' }, { label: 'শিক্ষকমণ্ডলী' }]}
        kicker="Faculty Directory · একাডেমিক শিক্ষকমণ্ডলী"
        title="Complete Faculty & Teachers Directory"
        titleBn="সকল শিক্ষকের পূর্ণাঙ্গ তালিকা"
        description="বিভাগভিত্তিক দক্ষ ও নিবেদিতপ্রাণ শিক্ষকমণ্ডলীর পূর্ণাঙ্গ তালিকা। যেকোনো শিক্ষকের ব্যক্তিগত প্রোফাইল, শিক্ষাগত যোগ্যতা ও সাপ্তাহিক ক্লাস সূচি দেখতে কার্ডে ক্লিক করুন।"
        actions={
          <Link
            to="/about/staff"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <span>কর্মকর্তা ও কর্মচারীবৃন্দ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Search & Department Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
              <input
                type="search"
                aria-label="শিক্ষকের নাম, বিভাগ বা পদবি খুঁজুন"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="শিক্ষকের নাম, পদবি বা বিভাগ খুঁজুন..."
                className="w-full h-10 pl-10 pr-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>
            <p className="text-xs text-slate-500 tabular-nums">
              মোট প্রদর্শিত: <span className="font-semibold text-[#1B2A6B]">{filtered.length}</span> / {activeTeachers.length} জন শিক্ষক
            </p>
          </div>

          <div
            role="tablist"
            aria-label="বিভাগ অনুযায়ী শিক্ষক বাছাই"
            className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100"
          >
            {departments.map((d) => {
              const active = dept === d;
              return (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDept(d)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#1F7A4D] text-white'
                      : 'bg-[#F7F8FC] text-slate-700 border border-slate-200 hover:border-[#1B2A6B] hover:text-[#1B2A6B]'
                  }`}
                >
                  {d === 'ALL' ? 'সকল বিভাগ' : d}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="কোনো শিক্ষক পাওয়া যায়নি" description="অনুসন্ধান বা বিভাগ ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((t) => (
              <Link
                key={t.id}
                to={`/about/teachers/${t.id}`}
                className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[4/5] bg-slate-100 overflow-hidden relative">
                  <SafeImage
                    src={t.photoUrl || SCHOOL_INFO.assets.headTeacher}
                    alt={t.nameBn}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1842]/90 via-[#0E1842]/40 to-transparent px-4 pt-10 pb-3">
                    <p className="text-[11px] font-medium text-[#E8CF8E] truncate">
                      {t.departmentBn || t.department}
                    </p>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-[15px] font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors leading-snug">
                      {t.nameBn}
                    </h2>
                    <p className="text-xs font-medium text-slate-600">{t.designationBn}</p>
                    <p className="text-xs text-slate-500 pt-1.5 inline-flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" aria-hidden="true" />
                      <span className="truncate">{t.qualificationBn || t.qualification}</span>
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 tabular-nums">
                      {t.experienceYears ? `${t.experienceYears}+ বছর অভিজ্ঞতা` : t.employeeId}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#1F7A4D]">
                      <span>প্রোফাইল</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StaffDirectoryPage() {
  useDocumentTitle('Staff Information');
  const { db } = useSchoolStore();
  const [query, setQuery] = useState('');

  const filtered = db.staff.filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.nameBn.includes(query) ||
      m.role.toLowerCase().includes(q) ||
      m.roleBn.includes(query)
    );
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'About', href: '/about/history' }, { label: 'Staff Information' }]}
        kicker="প্রশাসনিক ও সহায়ক কর্মকর্তা-কর্মচারী"
        title="Office & Support Staff"
        titleBn="কর্মকর্তা ও কর্মচারীবৃন্দ"
        description="প্রশাসন, গ্রন্থাগার, ল্যাব ও ক্যাম্পাস পরিচালনায় নিয়োজিত কর্মকর্তা-কর্মচারীদের ব্যক্তিগত প্রোফাইল।"
        actions={
          <Link
            to="/about/teachers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-bn"
          >
            <span>শিক্ষকমণ্ডলী দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
            <input
              type="search"
              aria-label="কর্মচারীর নাম বা পদবি খুঁজুন"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="নাম বা পদবি খুঁজুন..."
              className="w-full h-10 pl-10 pr-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#1F7A4D] font-bn"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="কোনো কর্মচারী পাওয়া যায়নি" description="অন্য শব্দ দিয়ে অনুসন্ধান করুন।" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((m) => (
              <Link
                key={m.id}
                to={`/about/staff/${m.id}`}
                className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[3/4] bg-slate-100 overflow-hidden relative">
                  <SafeImage
                    src={m.photoUrl || SCHOOL_INFO.assets.staffOffice}
                    alt={m.name}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent p-3.5">
                    <p className="text-xs font-medium text-white/95 font-bn truncate">
                      {m.departmentBn || m.department}
                    </p>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 font-bn">
                  <div>
                    <h2 className="text-base font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors">
                      {m.nameBn}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">{m.roleBn}</p>
                    <p className="text-xs text-slate-500 mt-2 inline-flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" />
                      <span className="tabular-nums">{m.employeeId}</span>
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-[#1F7A4D]">
                    <span>বিস্তারিত প্রোফাইল</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StudentsInfoPage() {
  useDocumentTitle('Student Information');
  const { db } = useSchoolStore();
  const [selectedClass, setSelectedClass] = useState('All');

  const filtered = db.students.filter(
    (s) => selectedClass === 'All' || s.className === selectedClass
  );

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'About', href: '/about/history' }, { label: 'Student Information' }]}
        title="Student Information Overview"
        titleBn="শিক্ষার্থী তথ্য ও শ্রেণিভিত্তিক পরিসংখ্যান"
        description="শ্রেণি ও শাখাভিত্তিক শিক্ষার্থীদের তালিকা ও একাডেমিক তথ্য। অভিভাবকের ব্যক্তিগত যোগাযোগ নম্বর শুধুমাত্র অনুমোদিত পোর্টালে সংরক্ষিত।"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {['All', ...CLASS_LIST].map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                selectedClass === cls
                  ? 'bg-[#1F7A4D] text-white border-[#1F7A4D]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#1F7A4D]'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
                <tr>
                  <th className="py-3 px-4 font-medium">Student ID</th>
                  <th className="py-3 px-4 font-medium">Roll</th>
                  <th className="py-3 px-4 font-medium">Student Name (শিক্ষার্থীর নাম)</th>
                  <th className="py-3 px-4 font-medium">Class & Section</th>
                  <th className="py-3 px-4 font-medium">Stream / Group</th>
                  <th className="py-3 px-4 font-medium">Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((stu) => (
                  <tr key={stu.id} className="hover:bg-[#F7F8FC]/60">
                    <td className="py-3 px-4 tabular-nums font-medium text-[#1B2A6B]">{stu.studentId}</td>
                    <td className="py-3 px-4 tabular-nums">{stu.roll}</td>
                    <td className="py-3 px-4 font-bn">{stu.nameBn} <span className="text-xs text-slate-500">· {stu.name}</span></td>
                    <td className="py-3 px-4 font-bn">{stu.className} · {stu.section}</td>
                    <td className="py-3 px-4 text-slate-600">{stu.group || 'General'}</td>
                    <td className="py-3 px-4 tabular-nums text-slate-600">{stu.session}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MissionVisionPage() {
  useDocumentTitle('লক্ষ্য, উদ্দেশ্য ও আদর্শ · Mission & Vision');
  const { db } = useSchoolStore();

  const coreValues = [
    {
      numBn: '০১',
      titleBn: 'নৈতিকতা ও প্রাতিষ্ঠানিক শৃঙ্খলা',
      titleEn: 'Integrity & Discipline',
      descBn:
        'সততা, সময়ানুবর্তিতা, শিক্ষক-অভিভাবকের প্রতি শ্রদ্ধা এবং প্রাত্যহিক সমাবেশ ও RFID নিয়মিত উপস্থিতির মাধ্যমে সুশৃঙ্খল জীবনবোধ গড়ে তোলা।',
      icon: ShieldCheck,
    },
    {
      numBn: '০২',
      titleBn: 'বিজ্ঞানমনস্কতা ও তথ্যপ্রযুক্তি দক্ষতা',
      titleEn: 'STEM & Digital Excellence',
      descBn:
        'আধুনিক পদার্থ-রসায়ন-জীববিজ্ঞান গবেষণাগার ও শেখ রাসেল ডিজিটাল আইসিটি ল্যাবে হাতে-কলমে ব্যবহারিক শিক্ষার মাধ্যমে দক্ষ মানবসম্পদ তৈরি।',
      icon: Compass,
    },
    {
      numBn: '০৩',
      titleBn: 'সম্মিলিত সহশিক্ষা ও নেতৃত্ব',
      titleEn: 'Leadership & Co-Curriculars',
      descBn:
        'বিতর্ক, স্কাউটিং, গার্লস গাইড, বার্ষিক ক্রীড়া ও সাংস্কৃতিক চর্চার মাধ্যমে শিক্ষার্থীদের আত্মবিশ্বাসী ও সৃজনশীল নাগরিক হিসেবে প্রস্তুত করা।',
      icon: Users,
    },
    {
      numBn: '০৪',
      titleBn: 'অন্তর্ভুক্তিমূলক ও নিরাপদ পরিবেশ',
      titleEn: 'Inclusive & Safe Campus',
      descBn:
        'ছাত্র-ছাত্রী নির্বিশেষে সমান শিক্ষার সুযোগ, বৃত্তি সহায়তা এবং অভিভাবকদের সাথে স্বচ্ছ ডিজিটাল যোগাযোগের মাধ্যমে নিরাপদ ক্যাম্পাস নিশ্চিত করা।',
      icon: HeartHandshake,
    },
  ];

  const roadmapItems = [
    {
      yearBn: '২০২৬',
      titleBn: 'সম্পূর্ণ ডিজিটাল ক্যাম্পাস ও স্মার্ট হাজিরা',
      descBn: 'প্রতিটি শ্রেণিকক্ষে মাল্টিমিডিয়া পাঠদান, RFID গেট হাজিরা ও অভিভাবক পোর্টালের শতভাগ ব্যবহার।',
    },
    {
      yearBn: '২০২৮',
      titleBn: 'বিজ্ঞান ও আইসিটি ল্যাব আধুনিকায়ন',
      descBn: 'রোবোটিক্স, কম্পিউটার প্রোগ্রামিং কর্নার এবং সমৃদ্ধ বিজ্ঞান গবেষণাগার সম্প্রসারণ।',
    },
    {
      yearBn: '২০৩০',
      titleBn: 'শতভাগ এসএসসি সাফল্য ও মডেল বিদ্যাপীঠ',
      descBn: 'জাতীয় ও জেলা পর্যায়ে মেধা, শৃঙ্খলা ও সহশিক্ষায় শরীয়তপুরের শীর্ষ মডেল মাধ্যমিক বিদ্যালয় হিসেবে প্রতিষ্ঠা।',
    },
  ];

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="শিক্ষা দর্শন ও প্রাতিষ্ঠানিক আদর্শ · স্থাপিত ১৮৯৮ খ্রি."
        title="Mission, Vision & Core Values"
        titleBn="লক্ষ্য, উদ্দেশ্য ও মূল আদর্শ"
        description={`${SCHOOL_INFO.mottoBn} — ${SCHOOL_INFO.mottoEn}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 font-bn">
        {/* 1. Editorial Motto & Campus Context Showcase */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-xs">
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-[#1F7A4D] tracking-wide">
                Institutional Philosophy · ১২৮+ বছরের শিক্ষাদর্শন
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A6B] leading-snug">
                “{SCHOOL_INFO.mottoBn}”
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#1F7A4D] font-sans">
                {SCHOOL_INFO.mottoEn}
              </p>
              <p className="text-sm sm:text-[15px] text-slate-700 leading-[1.85]">
                ১৮৯৮ খ্রিস্টাব্দ থেকে {SCHOOL_INFO.nameBn} কেবল পাঠ্যপুস্তকনির্ভর পরীক্ষার্থী নয়, বরং নৈতিক,
                বিজ্ঞানমনস্ক, দেশপ্রেমিক এবং দক্ষ নাগরিক তৈরির ব্রত নিয়ে কাজ করছে। ঐতিহ্যের শিকড় অটুট রেখে আমরা
                প্রতিটি শিক্ষার্থীকে একবিংশ শতাব্দীর আধুনিক চ্যালেঞ্জ মোকাবিলায় প্রস্তুত করে তুলি।
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-100 tabular-nums">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#1B2A6B]">১৮৯৮</p>
                <p className="text-xs text-slate-500 mt-0.5">প্রতিষ্ঠাকাল</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#1F7A4D]">৯৬.৮%</p>
                <p className="text-xs text-slate-500 mt-0.5">এসএসসি সাফল্য</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#1B2A6B]">৬ষ্ঠ–১০ম</p>
                <p className="text-xs text-slate-500 mt-0.5">মাধ্যমিক শিক্ষাস্তর</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] bg-slate-100 overflow-hidden">
            <SafeImage
              src={SCHOOL_INFO.assets.classroomStudy}
              alt="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের পাঠদান পরিবেশ"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1842]/90 via-[#0E1842]/35 to-transparent p-5">
              <p className="text-xs font-semibold text-[#E8CF8E]">উপসী, নড়িয়া, শরীয়তপুর</p>
              <p className="text-sm text-white/95 mt-0.5">
                আনন্দময় শ্রেণিকক্ষ ও নৈতিক মূল্যবোধের সমন্বিত চর্চা
              </p>
            </div>
          </div>
        </section>

        {/* 2. Architectural Equal-Height Mission (White) & Vision (Deep Navy) Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <article className="bg-white border border-slate-200 border-t-4 border-t-[#1F7A4D] rounded-2xl p-7 sm:p-9 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#1F7A4D]">
                  <Target className="w-4 h-4" aria-hidden="true" />
                  <span>OUR MISSION · আমাদের লক্ষ্য</span>
                </span>
                <span className="text-xs font-bold text-slate-300 tabular-nums">০১</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1B2A6B]">আমাদের লক্ষ্য (Mission)</h2>
              <p className="text-sm sm:text-[15px] text-slate-700 leading-[1.9]">
                {db.websiteContent.missionSummary}
              </p>
            </div>

            <ul className="space-y-2.5 pt-5 border-t border-slate-100 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" aria-hidden="true" />
                <span>সকল শিক্ষার্থীর জন্য মানসম্মত ও অন্তর্ভুক্তিমূলক মাধ্যমিক শিক্ষা নিশ্চিত করা।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" aria-hidden="true" />
                <span>ব্যবহারিক বিজ্ঞান ও আধুনিক আইসিটি দক্ষতার মাধ্যমে সৃজনশীল সক্ষমতা বৃদ্ধি।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" aria-hidden="true" />
                <span>অভিভাবক ও শিক্ষকদের নিবিড় সমন্বয়ে শিক্ষার্থীর নিয়মিত অগ্রগতি পর্যবেক্ষণ।</span>
              </li>
            </ul>
          </article>

          <article className="bg-[#1B2A6B] text-white border border-[#1B2A6B] border-t-4 border-t-[#C9A961] rounded-2xl p-7 sm:p-9 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#E8CF8E]">
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  <span>OUR VISION · আমাদের রূপকল্প</span>
                </span>
                <span className="text-xs font-bold text-white/25 tabular-nums">০২</span>
              </div>
              <h2 className="text-2xl font-bold text-white">আমাদের উদ্দেশ্য ও রূপকল্প (Vision)</h2>
              <p className="text-sm sm:text-[15px] text-white/90 leading-[1.9]">
                {db.websiteContent.visionSummary}
              </p>
            </div>

            <ul className="space-y-2.5 pt-5 border-t border-white/15 text-xs sm:text-sm text-white/85">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E8CF8E] shrink-0 mt-0.5" aria-hidden="true" />
                <span>শরীয়তপুর জেলার অন্যতম শ্রেষ্ঠ ডিজিটাল ও আদর্শ মাধ্যমিক বিদ্যাপীঠ হিসেবে নেতৃত্বদান।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E8CF8E] shrink-0 mt-0.5" aria-hidden="true" />
                <span>মানবিক মূল্যবোধ, দেশপ্রেম ও সৃজনশীল চিন্তাসম্পন্ন আগামী প্রজন্ম গড়ে তোলা।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E8CF8E] shrink-0 mt-0.5" aria-hidden="true" />
                <span>শতবর্ষের ঐতিহ্য ও আধুনিক প্রযুক্তির মেলবন্ধনে স্বচ্ছ প্রাতিষ্ঠানিক সুশাসন।</span>
              </li>
            </ul>
          </article>
        </section>

        {/* 3. Four Core Values Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <p className="text-xs font-semibold text-[#1F7A4D]">Core Values · প্রাতিষ্ঠানিক মূল আদর্শ</p>
              <h2 className="text-2xl font-semibold text-[#1B2A6B] mt-0.5">
                আমাদের চারটি মূল স্তম্ভ ও অঙ্গীকার
              </h2>
            </div>
            <p className="text-xs text-slate-500">শিক্ষার্থী, শিক্ষক ও অভিভাবকের সম্মিলিত অঙ্গীকার</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coreValues.map((val) => {
              const Icon = val.icon;
              return (
                <article
                  key={val.numBn}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#1F7A4D] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1F7A4D] flex items-center justify-center">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-bold text-slate-300 tabular-nums">{val.numBn}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1B2A6B] leading-snug">{val.titleBn}</h3>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">{val.titleEn}</p>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-[1.75]">{val.descBn}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 4. Strategic Roadmap 2026–2030 & Next Steps CTA */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-9 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-[#1F7A4D]">Strategic Roadmap · ২০২৬–২০৩০ পরিকল্পনা</p>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1B2A6B] mt-0.5">
                আগামী পাঁচ বছরের উন্নয়ন রোডম্যাপ
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/about/history"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-[#1B2A6B] bg-[#F7F8FC] hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#1F7A4D]" />
                <span>প্রতিষ্ঠানের ইতিহাস</span>
              </Link>
              <Link
                to="/others/online-admission"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors"
              >
                <span>অনলাইন ভর্তি আবেদন ২০২৭</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roadmapItems.map((item) => (
              <div
                key={item.yearBn}
                className="bg-[#F7F8FC] border border-slate-200/80 rounded-xl p-5 space-y-2"
              >
                <p className="text-xs font-bold text-[#1F7A4D] tabular-nums">লক্ষ্যমাত্রা · {item.yearBn}</p>
                <h3 className="text-base font-semibold text-[#1B2A6B]">{item.titleBn}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.descBn}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
