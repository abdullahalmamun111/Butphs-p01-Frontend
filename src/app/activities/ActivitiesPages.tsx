import { Link } from 'react-router-dom';
import { Award, Calendar, CheckCircle2, Clock, Compass, HeartHandshake, MapPin, Music, Trophy, Users } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SCHOOL_INFO } from '../../config/school';

export type ActivityKey =
  | 'sports'
  | 'cultural-programs'
  | 'scout'
  | 'girls-guide'
  | 'educational-tours';

interface ActivityInfo {
  key: ActivityKey;
  href: string;
  shortLabelBn: string;
  titleBn: string;
  titleEn: string;
  kicker: string;
  descriptionBn: string;
  image: string;
  scheduleBn: string;
  venueBn: string;
  coordinatorBn: string;
  highlightsBn: string[];
  achievementsBn: string[];
}

const ACTIVITIES_MAP: Record<ActivityKey, ActivityInfo> = {
  sports: {
    key: 'sports',
    href: '/activities/sports',
    shortLabelBn: 'বার্ষিক খেলাধুলা',
    titleBn: 'বার্ষিক ক্রীড়া ও অ্যাথলেটিক্স',
    titleEn: 'Annual Sports & Athletics',
    kicker: 'সহশিক্ষা কার্যক্রম · সুস্থ দেহে সুস্থ মন',
    descriptionBn:
      'বিদ্যালয়ের প্রশস্ত খেলার মাঠে বছরব্যাপী ফুটবল, ক্রিকেট, ভলিবল, ব্যাডমিন্টন এবং বার্ষিক আন্তঃহাউস অ্যাথলেটিক্স প্রতিযোগিতা অনুষ্ঠিত হয়।',
    image: SCHOOL_INFO.assets.sportsField,
    scheduleBn: 'প্রতি রবি ও বুধবার বিকাল ৩:৩০ – ৫:০০',
    venueBn: 'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় কেন্দ্রীয় খেলার মাঠ',
    coordinatorBn: 'মোঃ মাহফুজুর রহমান (ক্রীড়া শিক্ষক)',
    highlightsBn: [
      'আন্তঃহাউস বার্ষিক ক্রীড়া সপ্তাহ (দৌড়, দীর্ঘ লাফ, উচ্চ লাফ ও গোলক নিক্ষেপ)',
      'উপজেলা ও জেলা পর্যায়ের গ্রীষ্মকালীন ও শীতকালীন স্কুল ফুটবল-ক্রিকেট টুর্নামেন্টে নিয়মিত অংশগ্রহণ',
      'ছাত্রীদের জন্য পৃথক ব্যাডমিন্টন, ক্যারম, হ্যান্ডবল ও দাবা অনুশীলন',
      'নিয়মিত প্রাত্যহিক শরীরচর্চা ও ক্রীড়া প্রশিক্ষণ শিবির',
    ],
    achievementsBn: [
      'নড়িয়া উপজেলা আন্তঃস্কুল ফুটবল টুর্নামেন্ট ২০২৫ — চ্যাম্পিয়ন',
      'শরীয়তপুর জেলা ৪০০ মিটার দৌড়ে স্বর্ণপদক অর্জন',
    ],
  },
  'cultural-programs': {
    key: 'cultural-programs',
    href: '/activities/cultural-programs',
    shortLabelBn: 'সাংস্কৃতিক অনুষ্ঠান',
    titleBn: 'সাংস্কৃতিক ও জাতীয় দিবস উদযাপন',
    titleEn: 'Cultural Programs & National Celebrations',
    kicker: 'সহশিক্ষা কার্যক্রম · শুদ্ধ সংস্কৃতি ও মননশীলতা',
    descriptionBn:
      'জাতীয় দিবসসমূহ যথাযোগ্য মর্যাদায় পালনসহ সংগীত, আবৃত্তি, নৃত্য, নাটক ও রচনা-চিত্রাঙ্কন প্রতিযোগিতার মাধ্যমে শিক্ষার্থীদের সৃজনশীল বিকাশ ঘটানো হয়।',
    image: SCHOOL_INFO.assets.debateCulture,
    scheduleBn: 'প্রতি বৃহস্পতিবার ৬ষ্ঠ পিরিয়ড (২:৩০ – ৩:১৫)',
    venueBn: 'বিদ্যালয় মিলনায়তন ও শহীদ মিনার প্রাঙ্গণ',
    coordinatorBn: 'নাসরিন সুলতানা (সাংস্কৃতিক সমন্বয়ক)',
    highlightsBn: [
      '২১ ফেব্রুয়ারি, ২৬ মার্চ, ১৬ ডিসেম্বর ও বাংলা নববর্ষ উপলক্ষে বিশেষ সাংস্কৃতিক অনুষ্ঠান',
      'রবীন্দ্র-নজরুল জয়ন্তী, কবিতা আবৃত্তি, দেশাত্মবোধক গান ও উপস্থিত বক্তৃতা',
      'বিজ্ঞান ও সাহিত্য মেলায় শিক্ষার্থীদের মঞ্চনাটক ও দেয়ালিকা প্রদর্শনী',
      'উপজেলা ও জেলা জাতীয় শিক্ষা সপ্তাহে সাংস্কৃতিক বিভাগে অংশগ্রহণ',
    ],
    achievementsBn: [
      'জাতীয় শিক্ষা সপ্তাহ ২০২৬ (নড়িয়া উপজেলা) — আবৃত্তি ও সংগীতে ১ম স্থান',
      'জেলা পর্যায়ে দেশাত্মবোধক গানে শ্রেষ্ঠ দলীয় পুরস্কার',
    ],
  },
  scout: {
    key: 'scout',
    href: '/activities/scout',
    shortLabelBn: 'স্কাউট দল',
    titleBn: 'বাংলাদেশ স্কাউটস — বিঝারী উপসী ইউনিট',
    titleEn: 'Bangladesh Scouts Unit (BUTPHS)',
    kicker: 'সহশিক্ষা কার্যক্রম · সদা প্রস্তুত (Be Prepared)',
    descriptionBn:
      'শৃঙ্খলা, আত্মনির্ভরতা, প্রাথমিক চিকিৎসা, দুর্যোগ মোকাবিলা এবং সমাজসেবামূলক কার্যক্রমের মাধ্যমে আদর্শ নেতৃত্ব গড়ে তোলার প্রশিক্ষণ।',
    image: SCHOOL_INFO.assets.morningAssembly,
    scheduleBn: 'প্রতি বৃহস্পতিবার বিকাল ৩:১৫ – ৪:৩০',
    venueBn: 'বিদ্যালয় প্রাঙ্গণ ও স্কাউট ডেন',
    coordinatorBn: 'মোঃ রফিকুল ইসলাম (ইউনিট লিডার)',
    highlightsBn: [
      'প্রাত্যহিক সমাবেশ পরিচালনা, কুচকাওয়াজ ও জাতীয় পতাকা উত্তোলন শৃঙ্খলা',
      'উপজেলা ও জেলা স্কাউট ক্যাম্পুরি, হাইকিং এবং তাঁবুবাস প্রশিক্ষণ',
      'প্রাথমিক চিকিৎসা, বৃক্ষরোপণ এবং পরিচ্ছন্ন ক্যাম্পাস স্বেচ্ছাসেবা',
      'প্রেসিডেন্ট’স স্কাউট অ্যাওয়ার্ড প্রস্তুতি ও ব্যাজ মূল্যায়ন',
    ],
    achievementsBn: [
      'শরীয়তপুর জেলা স্কাউট সমাবেশ ২০২৫-এ শ্রেষ্ঠ শৃঙ্খলা ইউনিট সম্মাননা',
      '৩ জন শিক্ষার্থীর শাপলা/প্রেসিডেন্ট স্কাউট প্রাথমিক বাছাইয়ে উত্তীর্ণ',
    ],
  },
  'girls-guide': {
    key: 'girls-guide',
    href: '/activities/girls-guide',
    shortLabelBn: 'গার্লস গাইড',
    titleBn: 'বাংলাদেশ গার্ল গাইডস অ্যাসোসিয়েশন ইউনিট',
    titleEn: 'Girls Guide Unit (BUTPHS)',
    kicker: 'সহশিক্ষা কার্যক্রম · আত্মবিশ্বাস ও মানবিক সেবা',
    descriptionBn:
      'ছাত্রীদের নেতৃত্বগুণ, স্বাস্থ্য সচেতনতা, হস্তশিল্প, সামাজিক দায়িত্ববোধ ও আত্মনির্ভরশীলতা অর্জনে সক্রিয় গার্লস গাইড কার্যক্রম।',
    image: SCHOOL_INFO.assets.campusHero,
    scheduleBn: 'প্রতি মঙ্গলবার বিকাল ৩:১৫ – ৪:১৫',
    venueBn: 'ছাত্রী কমন রুম ও বিদ্যালয় প্রাঙ্গণ',
    coordinatorBn: 'ফারজানা আক্তার (গাইড ক্যাপ্টেন)',
    highlightsBn: [
      'কিশোরী স্বাস্থ্য, পুষ্টি ও প্রাথমিক চিকিৎসা বিষয়ক সচেতনতা কর্মশালা',
      'আত্মরক্ষা, দলগত নেতৃত্ব ও ক্যাম্পিং দক্ষতা প্রশিক্ষণ',
      'বিদ্যালয়ের বার্ষিক অনুষ্ঠান ও অভিভাবক সমাবেশে শৃঙ্খলা ও অভ্যর্থনা সেবা',
      'সামাজিক সচেতনতা ও বৃক্ষরোপণ কর্মসূচিতে সক্রিয় অংশগ্রহণ',
    ],
    achievementsBn: [
      'নড়িয়া উপজেলা গার্লস গাইড বার্ষিক ক্যাম্পে শ্রেষ্ঠ প্রদর্শনী পুরস্কার',
      'বিদ্যালয়ের শতভাগ ছাত্রী স্বাস্থ্য-সুরক্ষা সচেতনতা ক্যাম্পেইন সফল সম্পন্ন',
    ],
  },
  'educational-tours': {
    key: 'educational-tours',
    href: '/activities/educational-tours',
    shortLabelBn: 'শিক্ষা সফর',
    titleBn: 'বার্ষিক শিক্ষা সফর ও বিজ্ঞান ভ্রমণ',
    titleEn: 'Educational Tours & Field Excursions',
    kicker: 'সহশিক্ষা কার্যক্রম · বইয়ের বাইরে বাস্তব অভিজ্ঞতা',
    descriptionBn:
      'ঐতিহাসিক নিদর্শন, জাদুঘর, বিজ্ঞান ও প্রযুক্তি কেন্দ্র এবং প্রাকৃতিক ঐতিহ্য পরিদর্শনের মাধ্যমে শিক্ষার্থীদের ব্যবহারিক জ্ঞান সমৃদ্ধকরণ।',
    image: SCHOOL_INFO.assets.scienceLab,
    scheduleBn: 'প্রতি বছর শীতকালীন অবকাশ (জানুয়ারি–ফেব্রুয়ারি)',
    venueBn: 'সোনারগাঁও, লালবাগ কেল্লা, জাতীয় জাদুঘর ও বঙ্গবন্ধু নভোথিয়েটার',
    coordinatorBn: 'ড. সঞ্জীব কুমার মণ্ডল ও শিক্ষা সফর কমিটি',
    highlightsBn: [
      'অভিভাবকের সম্মতি ও শিক্ষকমণ্ডলীর সার্বিক তত্ত্বাবধানে নিরাপদ শিক্ষা সফর',
      'জাতীয় বিজ্ঞান ও প্রযুক্তি জাদুঘর এবং ঐতিহাসিক স্থাপনা পরিদর্শন',
      'সফর শেষে শিক্ষার্থীদের ভ্রমণ অভিজ্ঞতা নিয়ে প্রতিবেদন ও দেয়ালিকা প্রকাশ',
      'পদ্মা সেতু ও আঞ্চলিক অবকাঠামো উন্নয়ন পর্যবেক্ষণ শিক্ষা কার্যক্রম',
    ],
    achievementsBn: [
      '২০২৬ শিক্ষাবর্ষে ১৮০+ শিক্ষার্থীর অংশগ্রহণে সফল সোনারগাঁও ও বিজ্ঞান জাদুঘর সফর',
      'ভ্রমণ-পরবর্তী সেরা প্রতিবেদন লেখকদের বার্ষিক পুরস্কার প্রদান',
    ],
  },
};

const ACTIVITY_TABS: Array<{ key: ActivityKey; href: string; labelBn: string; icon: typeof Trophy }> = [
  { key: 'sports', href: '/activities/sports', labelBn: 'খেলাধুলা', icon: Trophy },
  { key: 'cultural-programs', href: '/activities/cultural-programs', labelBn: 'সাংস্কৃতিক', icon: Music },
  { key: 'scout', href: '/activities/scout', labelBn: 'স্কাউট দল', icon: Compass },
  { key: 'girls-guide', href: '/activities/girls-guide', labelBn: 'গার্লস গাইড', icon: HeartHandshake },
  { key: 'educational-tours', href: '/activities/educational-tours', labelBn: 'শিক্ষা সফর', icon: MapPin },
];

export function ActivityDetailPage({ activityKey }: { activityKey: ActivityKey }) {
  const info = ACTIVITIES_MAP[activityKey];
  const isDebatePhoto = info.image.includes('bhs_debate_culture');

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker={info.kicker}
        title={info.titleBn}
        titleBn={info.titleEn}
        description={info.descriptionBn}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-bn">
        {/* Quick Activity Switcher */}
        <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          {ACTIVITY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === activityKey;
            return (
              <Link
                key={tab.key}
                to={tab.href}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors ${
                  active ? 'bg-[#1B2A6B] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.labelBn}</span>
              </Link>
            );
          })}
        </div>

        {/* Hero Photo + Key Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
              <img
                src={info.image}
                alt={info.titleBn}
                className={`w-full h-full object-cover ${
                  isDebatePhoto ? 'object-bottom scale-[1.22] origin-bottom' : 'object-center'
                }`}
              />
            </div>
          </div>

          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-xs">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1B2A6B] pb-3 border-b border-slate-100">
                কার্যক্রম ও অনুশীলনের তথ্য
              </h2>
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">নির্ধারিত সময়সূচি</p>
                    <p className="font-semibold text-slate-800">{info.scheduleBn}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">স্থান</p>
                    <p className="font-semibold text-slate-800">{info.venueBn}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500">দায়িত্বপ্রাপ্ত শিক্ষক</p>
                    <p className="font-semibold text-slate-800">{info.coordinatorBn}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#1F7A4D] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>সাম্প্রতিক অর্জনসমূহ</span>
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {info.achievementsBn.map((a) => (
                  <li key={a} className="flex items-start gap-1.5">
                    <span className="text-[#1F7A4D] font-bold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Program Highlights */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#1B2A6B] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1F7A4D]" />
            <span>প্রধান কার্যক্রম ও প্রশিক্ষণ সূচি</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {info.highlightsBn.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/80 text-sm text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
