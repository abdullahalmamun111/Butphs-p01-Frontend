import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Calendar, FileText, Newspaper, Printer, ScrollText, User, X } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SCHOOL_INFO } from '../../config/school';
import { useSchoolStore } from '../../store/SchoolStore';
import { printElementById } from '../../utils/printDocument';

export type PublicationKey = 'school-magazine' | 'wall-magazine' | 'journal';

interface ArticleItem {
  id: string;
  issue: string;
  category: string;
  titleBn: string;
  titleEn: string;
  author: string;
  date: string;
  summary: string;
  body: string[];
}

interface PublicationMeta {
  key: PublicationKey;
  href: string;
  tabLabelBn: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  taglineBn: string;
  bannerImage: string;
  editorBn: string;
  frequencyBn: string;
  articles: ArticleItem[];
}

const PUBLICATIONS_DATA: Record<PublicationKey, PublicationMeta> = {
  'school-magazine': {
    key: 'school-magazine',
    href: '/publications/school-magazine',
    tabLabelBn: 'বিদ্যালয় ম্যাগাজিন “অরুণোদয়”',
    titleBn: 'বিদ্যালয় ম্যাগাজিন — “অরুণোদয়”',
    titleEn: 'Annual School Magazine — Arunodoy',
    subtitleBn: '১৮৯৮ সালের ঐতিহ্যবাহী বিদ্যাপীঠের বার্ষিক সাহিত্য ও সৃজনশীল সংকলন',
    taglineBn: 'শিক্ষক, বর্তমান শিক্ষার্থী এবং প্রাক্তন শিক্ষার্থীদের কবিতা, গল্প, স্মৃতিচারণ ও প্রবন্ধের সমৃদ্ধ বার্ষিক প্রকাশনা।',
    bannerImage: SCHOOL_INFO.assets.schoolLibrary,
    editorBn: 'মোঃ রফিকুল ইসলাম (সিনিয়র শিক্ষক, বাংলা)',
    frequencyBn: 'বার্ষিক প্রকাশনা (বসন্ত সংখ্যা ২০২৬)',
    articles: [
      {
        id: 'mag-1',
        issue: 'সংখ্যা ২০২৬',
        category: 'স্মৃতিচারণ ও ইতিহাস',
        titleBn: 'শতবর্ষী প্রাঙ্গণে শিক্ষার আলো: ১৮৯৮ থেকে ২০২৬',
        titleEn: 'Light of Knowledge in a Century-Old Campus',
        author: 'মোঃ আব্দুর রাজ্জাক (প্রধান শিক্ষক)',
        date: 'ফেব্রুয়ারি ২০২৬',
        summary: 'উপসী-নড়িয়ার জনপদে ১২৮ বছরের শিক্ষাবিস্তার ও বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের গৌরবোজ্জ্বল পথচলা।',
        body: [
          '১৮৯৮ খ্রিস্টাব্দে পদ্মা বিধৌত নড়িয়া অঞ্চলের শিক্ষানুরাগী ব্যক্তিবর্গের আন্তরিক প্রচেষ্টায় বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের ভিত্তি স্থাপিত হয়। সেদিন যে প্রদীপ প্রজ্বালিত হয়েছিল, আজ ১২৮ বছর পরও তা হাজারো শিক্ষার্থীর জীবন আলোকিত করে চলেছে।',
          'সময়ের বিবর্তনে আমাদের শ্রেণিকক্ষ হয়েছে আধুনিক, যুক্ত হয়েছে শেখ রাসেল ডিজিটাল কম্পিউটার ল্যাব, সমৃদ্ধ বিজ্ঞান গবেষণাগার এবং RFID স্মার্ট উপস্থিতি ব্যবস্থা। তবুও আমাদের মূল আদর্শ অপরিবর্তিত—নৈতিকতা, শৃঙ্খলা এবং মানবিক মূল্যবোধসম্পন্ন মানুষ তৈরি করা।',
        ],
      },
      {
        id: 'mag-2',
        issue: 'সংখ্যা ২০২৬',
        category: 'প্রবন্ধ',
        titleBn: 'পদ্মা পাড়ের প্রকৃতি ও আমাদের গ্রামীণ শৈশব',
        titleEn: 'Nature Along the Padma & Our Rural Childhood',
        author: 'নুসরাত জাহান মিম (১০ম শ্রেণি, বিজ্ঞান)',
        date: 'ফেব্রুয়ারি ২০২৬',
        summary: 'নড়িয়া-শরীয়তপুরের নদীমাতৃক প্রকৃতি, বর্ষার কাশফুল এবং বিদ্যালয়ে আসার পথের মধুর স্মৃতিকথা।',
        body: [
          'ভোরের কুয়াশা ভেদ করে যখন সবুজ ধানক্ষেতের আলপথ ধরে বিদ্যালয়ের লাল-সাদা প্রাঙ্গণে এসে দাঁড়াই, তখন মনে হয় প্রকৃতিই আমাদের প্রথম শিক্ষক।',
          'আমাদের বিদ্যালয়ের বিশাল মাঠ, বৃক্ষছায়া এবং সকালের জাতীয় সংগীত আমাদের মনে দেশপ্রেম ও প্রকৃতির প্রতি ভালোবাসা জাগ্রত করে।',
        ],
      },
      {
        id: 'mag-3',
        issue: 'সংখ্যা ২০২৬',
        category: 'কবিতা',
        titleBn: 'আলোর মিছিলে এসো নবীন',
        titleEn: 'Come Youth in the Procession of Light',
        author: 'আশরাফুল আলম (১০ম শ্রেণি, শাখা ক)',
        date: 'ফেব্রুয়ারি ২০২৬',
        summary: 'নবীন শিক্ষার্থীদের স্বাগত জানিয়ে জ্ঞান, সততা ও দেশগড়ার প্রত্যয় নিয়ে রচিত কবিতা।',
        body: [
          '“শিক্ষাই আলো, জ্ঞানই শক্তি”—এই মন্ত্রে দীক্ষিত হয়ে এসো নবীন, হাতে তুলে নাও কলম আর প্রজ্ঞার মশাল।',
          'শতবর্ষী এই বিদ্যাপীঠের আঙিনায় প্রতিদিন রচিত হোক নতুন স্বপ্নের কাব্য, বিজ্ঞান ও মানবতার জয়গান।',
        ],
      },
    ],
  },
  'wall-magazine': {
    key: 'wall-magazine',
    href: '/publications/wall-magazine',
    tabLabelBn: 'দেয়ালিকা “কিশলয়”',
    titleBn: 'দেয়ালিকা প্রকাশনা — “কিশলয়”',
    titleEn: 'Student Wall Magazine — Kisholoy',
    subtitleBn: 'আন্তর্জাতিক মাতৃভাষা দিবস, স্বাধীনতা দিবস ও বিজয় দিবস উপলক্ষে শিক্ষার্থীদের হাতে লেখা দেয়ালিকা',
    taglineBn: 'শিক্ষার্থীদের হাতে আঁকা অলংকরণ, ছড়া, ক্যালিগ্রাফি ও দেশপ্রেমের সৃজনশীল লেখনী নিয়ে প্রকাশিত ত্রৈমাসিক দেয়ালিকা।',
    bannerImage: SCHOOL_INFO.assets.debateCulture,
    editorBn: 'নাসরিন সুলতানা ও শিক্ষার্থী সম্পাদনা পরিষদ',
    frequencyBn: 'বিশেষ জাতীয় দিবস ও ত্রৈমাসিক সংখ্যা',
    articles: [
      {
        id: 'wall-1',
        issue: 'একুশে সংখ্যা ২০২৬',
        category: 'ভাষা আন্দোলন',
        titleBn: 'অমর একুশে: বাংলা ভাষার মর্যাদা ও আমাদের অঙ্গীকার',
        titleEn: 'Immortal Ekushey & Dignity of Bangla',
        author: 'তাসনিম তাবাসসুম (৭ম শ্রেণি)',
        date: '২১ ফেব্রুয়ারি ২০২৬',
        summary: '১৯৫২ সালের ভাষা শহীদদের আত্মত্যাগ এবং শুদ্ধ বাংলা চর্চায় শিক্ষার্থীদের দায়িত্ব।',
        body: [
          'মায়ের ভাষার জন্য জীবন উৎসর্গ করার ইতিহাস বিশ্বে বিরল। সালাম, বরকত, রফিক, জব্বার ও শফিউরের রক্তের বিনিময়ে অর্জিত আমাদের প্রিয় বাংলা ভাষা আজ আন্তর্জাতিক মাতৃভাষা হিসেবে স্বীকৃত।',
          'আমরা প্রতিদিন শুদ্ধ উচ্চারণ, নির্ভুল বানান এবং বাংলা সাহিত্য পাঠের মাধ্যমে ভাষা শহীদদের প্রতি প্রকৃত শ্রদ্ধা জানাব।',
        ],
      },
      {
        id: 'wall-2',
        issue: 'স্বাধীনতা সংখ্যা ২০২৬',
        category: 'চিত্রকলা ও ছড়া',
        titleBn: 'সবুজ ক্যাম্পাস, পরিচ্ছন্ন বাংলাদেশ',
        titleEn: 'Green Campus, Clean Bangladesh',
        author: 'মাহমুদুল হাসান (৯ম শ্রেণি)',
        date: '২৬ মার্চ ২০২৬',
        summary: 'বিদ্যালয় প্রাঙ্গণে বৃক্ষরোপণ এবং প্লাস্টিকমুক্ত পরিবেশ গড়ার অঙ্গীকারনামা।',
        body: [
          'আমাদের স্কাউট ও গার্লস গাইড দলের উদ্যোগে বিদ্যালয়ের চারপাশে ৫০টি ফলদ ও বনজ চারা রোপণ করা হয়েছে।',
          'পরিচ্ছন্ন শ্রেণিকক্ষ এবং সবুজ প্রকৃতি আমাদের মননকে সুস্থ ও সৃজনশীল করে তোলে।',
        ],
      },
      {
        id: 'wall-3',
        issue: 'বিজয় সংখ্যা ২০২৬',
        category: 'কুইজ ও বিজ্ঞান কণিকা',
        titleBn: 'মুক্তিযুদ্ধে শরীয়তপুর ও নড়িয়ার বীরগাথা',
        titleEn: 'Liberation War Heritage of Naria & Shariatpur',
        author: 'সাদিয়া আফরিন (৯ম শ্রেণি, বিজ্ঞান)',
        date: '১৬ ডিসেম্বর ২০২৬',
        summary: 'মহান মুক্তিযুদ্ধে শরীয়তপুর অঞ্চলের বীর মুক্তিযোদ্ধাদের সাহসিকতার সংক্ষিপ্ত ইতিহাস।',
        body: [
          '১৯৭১ সালে নড়িয়া ও শরীয়তপুরের অকুতোভয় মুক্তিযোদ্ধারা অসীম সাহসিকতার সাথে দখলদার বাহিনীর বিরুদ্ধে প্রতিরোধ গড়ে তোলেন।',
          'নতুন প্রজন্মের শিক্ষার্থীদের কাছে এই স্থানীয় ইতিহাস তুলে ধরাই আমাদের দেয়ালিকার মূল লক্ষ্য।',
        ],
      },
    ],
  },
  journal: {
    key: 'journal',
    href: '/publications/journal',
    tabLabelBn: 'জার্নাল ও গবেষণা',
    titleBn: 'একাডেমিক জার্নাল ও বিজ্ঞান গবেষণা',
    titleEn: 'Academic Journal & Student Research Notes',
    subtitleBn: 'বিজ্ঞান প্রজেক্ট, ডিজিটাল উদ্ভাবন এবং শ্রেণিকক্ষ শিক্ষণ-শিখন গবেষণা নিবন্ধ',
    taglineBn: 'বিজ্ঞান ও আইসিটি বিভাগের শিক্ষক-শিক্ষার্থীদের যৌথ প্রবন্ধ, ল্যাব উদ্ভাবন এবং আধুনিক পাঠদান অভিজ্ঞতার সংকলন।',
    bannerImage: SCHOOL_INFO.assets.scienceLab,
    editorBn: 'ড. সঞ্জীব কুমার মণ্ডল (সিনিয়র শিক্ষক, বিজ্ঞান)',
    frequencyBn: 'ষাণ্মাসিক একাডেমিক বুলেটিন',
    articles: [
      {
        id: 'jrn-1',
        issue: 'ভলিউম ০৪ · ২০২৬',
        category: 'ডিজিটাল শিক্ষা ও আইসিটি',
        titleBn: 'গ্রামীণ মাধ্যমিক বিদ্যালয়ে RFID স্মার্ট উপস্থিতি ও অভিভাবক সম্পৃক্ততা',
        titleEn: 'RFID Smart Attendance & Guardian Engagement in Rural High Schools',
        author: 'মোহাম্মদ কামরুজ্জামান (আইসিটি ও কম্পিউটার বিভাগ)',
        date: 'অক্টোবর ২০২৬',
        summary: 'ডিজিটাল হাজিরা কার্ড এবং তাৎক্ষণিক SMS নোটিফিকেশনের মাধ্যমে শিক্ষার্থীদের নিয়মিত উপস্থিতি বৃদ্ধির পর্যবেক্ষণ।',
        body: [
          'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ে RFID স্মার্ট হাজিরা চালুর পর শিক্ষার্থীদের গড় উপস্থিতি ৮৪% থেকে ৯৪.৫%-এ উন্নীত হয়েছে।',
          'অভিভাবকগণ সন্তানের প্রবেশ ও প্রস্থানের সঠিক সময় মোবাইলে জানতে পারায় বিদ্যালয়ের প্রতি আস্থা ও নিরাপত্তা বোধ উল্লেখযোগ্যভাবে বৃদ্ধি পেয়েছে।',
        ],
      },
      {
        id: 'jrn-2',
        issue: 'ভলিউম ০৪ · ২০২৬',
        category: 'বিজ্ঞান প্রজেক্ট',
        titleBn: 'সৌরশক্তি চালিত স্বয়ংক্রিয় কৃষি সেচ ব্যবস্থা (শিক্ষার্থী মডেল)',
        titleEn: 'Solar-Powered Automated Irrigation Prototype',
        author: 'বিজ্ঞান ক্লাব গবেষণা দল (৯ম–১০ম শ্রেণি)',
        date: 'সেপ্টেম্বর ২০২৬',
        summary: 'মাটির আর্দ্রতা সেন্সর ও ক্ষুদ্র সোলার প্যানেল ব্যবহার করে সাশ্রয়ী কৃষি সেচ মডেল—উপজেলা বিজ্ঞান মেলায় ১ম পুরস্কারপ্রাপ্ত।',
        body: [
          'শরীয়তপুরের কৃষিনির্ভর অর্থনীতিকে মাথায় রেখে আমাদের বিজ্ঞান ও আইসিটি ক্লাবের শিক্ষার্থীরা কম খরচে একটি স্বয়ংক্রিয় সেচ মডেল তৈরি করেছে।',
          'মাটির আর্দ্রতা নির্ধারিত মাত্রার নিচে নামলেই পাম্পটি স্বয়ংক্রিয়ভাবে চালু হয় এবং পর্যাপ্ত পানি পেলে বন্ধ হয়ে যায়—যার ফলে প্রায় ৪০% পানি ও বিদ্যুৎ সাশ্রয় হয়।',
        ],
      },
      {
        id: 'jrn-3',
        issue: 'ভলিউম ০৪ · ২০২৬',
        category: 'গণিত ও শিক্ষাবিজ্ঞান',
        titleBn: 'হাতে-কলমে জ্যামিতি ও ভিজ্যুয়াল পাঠদানে শিক্ষার্থীদের গণিতভীতি দূরীকরণ',
        titleEn: 'Overcoming Math Anxiety via Visual & Hands-on Geometry',
        author: 'তাহমিনা ইয়াসমিন (সহকারী প্রধান শিক্ষক)',
        date: 'আগস্ট ২০২৬',
        summary: '৬ষ্ঠ–৮ম শ্রেণিতে কাঠের জ্যামিতিক মডেল ও গ্রাফ বোর্ড ব্যবহারে শিক্ষার্থীদের গাণিতিক দক্ষতা বৃদ্ধির অভিজ্ঞতা।',
        body: [
          'মুখস্থনির্ভর উপপাদ্যের পরিবর্তে বাস্তব মডেল ও দলগত অনুশীলনের মাধ্যমে জ্যামিতি শেখানো হলে শিক্ষার্থীরা সহজেই মূল ধারণা আয়ত্ত করতে পারে।',
          'এই পদ্ধতি প্রয়োগের ফলে অর্ধবার্ষিক পরীক্ষায় গণিত বিষয়ে পাসের হার ও A+ প্রাপ্ত শিক্ষার্থীর সংখ্যা উল্লেখযোগ্য হারে বেড়েছে।',
        ],
      },
    ],
  },
};

const PUB_TABS: Array<{ key: PublicationKey; href: string; labelBn: string; icon: typeof BookMarked }> = [
  { key: 'school-magazine', href: '/publications/school-magazine', labelBn: 'বিদ্যালয় ম্যাগাজিন', icon: BookMarked },
  { key: 'wall-magazine', href: '/publications/wall-magazine', labelBn: 'দেয়ালিকা প্রকাশনা', icon: Newspaper },
  { key: 'journal', href: '/publications/journal', labelBn: 'জার্নাল ও গবেষণা', icon: ScrollText },
];

export function PublicationPage({ pubKey }: { pubKey: PublicationKey }) {
  const { addToast } = useSchoolStore();
  const data = PUBLICATIONS_DATA[pubKey];
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);
  const isDebateBanner = data.bannerImage.includes('bhs_debate_culture');

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="প্রকাশনা ও সাহিত্য চর্চা · বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়"
        title={data.titleBn}
        titleBn={data.titleEn}
        description={data.taglineBn}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-bn">
        {/* Publication Type Switcher */}
        <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          {PUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === pubKey;
            return (
              <Link
                key={tab.key}
                to={tab.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors ${
                  active
                    ? 'bg-[#1B2A6B] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.labelBn}</span>
              </Link>
            );
          })}
        </div>

        {/* Featured Editorial Banner */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[220px] overflow-hidden bg-slate-100">
            <img
              src={data.bannerImage}
              alt={data.titleBn}
              className={`w-full h-full object-cover ${
                isDebateBanner ? 'object-bottom scale-[1.22] origin-bottom' : 'object-center'
              }`}
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#1F7A4D]">{data.frequencyBn}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1B2A6B]">{data.subtitleBn}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{data.taglineBn}</p>
            </div>
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F7F8FC] border border-slate-200/80 rounded-xl p-3">
                <p className="text-slate-500">সম্পাদনা ও তত্ত্বাবধান</p>
                <p className="font-semibold text-[#1B2A6B] mt-0.5">{data.editorBn}</p>
              </div>
              <div className="bg-[#F7F8FC] border border-slate-200/80 rounded-xl p-3">
                <p className="text-slate-500">লেখা জমাদানের ঠিকানা</p>
                <p className="font-semibold text-[#1F7A4D] mt-0.5">বাংলা বিভাগ / গ্রন্থাগার কক্ষ (রবি–বৃহঃ)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Curated Articles Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.articles.map((art) => (
            <article
              key={art.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-xs hover:border-[#1F7A4D]/50 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#1F7A4D]">{art.category}</span>
                  <span className="text-slate-400">{art.issue}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1B2A6B] leading-snug">
                  {art.titleBn}
                </h3>
                <p className="text-xs text-slate-500 font-sans">{art.titleEn}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{art.summary}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {art.author}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {art.date}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveArticle(art)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#142054] rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>সম্পূর্ণ লেখা পড়ুন ও প্রিন্ট করুন</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Article Reader & Print Modal */}
      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pub-article-title"
          className="fixed inset-0 z-50 bg-slate-950/65 flex items-center justify-center p-4"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 font-bn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-[#F7F8FC]">
              <p className="text-xs font-semibold text-[#1F7A4D]">
                {data.titleBn} · {activeArticle.issue}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    printElementById('bhs-publication-article-sheet', activeArticle.titleBn);
                    addToast('success', 'প্রবন্ধ প্রিন্ট প্রিভিউ খোলা হয়েছে।');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  aria-label="বন্ধ করুন"
                  onClick={() => setActiveArticle(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200/70 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <article id="bhs-publication-article-sheet" className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <div className="pb-4 border-b border-slate-200 space-y-1.5">
                <p className="text-xs font-semibold text-[#1F7A4D]">{activeArticle.category} · {activeArticle.date}</p>
                <h2 id="pub-article-title" className="text-xl sm:text-2xl font-bold text-[#1B2A6B] leading-snug">
                  {activeArticle.titleBn}
                </h2>
                <p className="text-xs text-slate-500 font-sans">{activeArticle.titleEn}</p>
                <p className="text-xs font-semibold text-slate-700 pt-1">লেখক: {activeArticle.author}</p>
              </div>

              <div className="space-y-4 text-sm sm:text-[15px] text-slate-800 leading-[1.9]">
                {activeArticle.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 text-xs text-slate-500">
                প্রকাশক: {SCHOOL_INFO.nameBn} · {SCHOOL_INFO.addressBn}
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
