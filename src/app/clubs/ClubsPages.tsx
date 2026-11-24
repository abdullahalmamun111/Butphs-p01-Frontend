import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Clock, Mic, Palette, Trophy, Users } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SCHOOL_INFO } from '../../config/school';
import { useSchoolStore } from '../../store/SchoolStore';

export type ClubKey = 'sports' | 'debate-speech' | 'cultural';

interface ClubInfo {
  key: ClubKey;
  href: string;
  labelBn: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  image: string;
  advisorBn: string;
  scheduleBn: string;
  membersCountBn: string;
  activitiesBn: string[];
}

const CLUBS_MAP: Record<ClubKey, ClubInfo> = {
  sports: {
    key: 'sports',
    href: '/clubs/sports',
    labelBn: 'ক্রীড়া ক্লাব',
    titleBn: 'বিঝারী উপসী ক্রীড়া ক্লাব',
    titleEn: 'BUTPHS Sports & Athletics Club',
    descriptionBn:
      'দলগত শৃঙ্খলা, শারীরিক সুস্থতা এবং আন্তঃস্কুল ক্রীড়া প্রতিযোগিতায় বিদ্যালয়ের প্রতিনিধিত্ব করতে নিবেদিত শিক্ষার্থী ক্রীড়া ক্লাব।',
    image: SCHOOL_INFO.assets.sportsField,
    advisorBn: 'মোঃ মাহফুজুর রহমান (ক্রীড়া শিক্ষক)',
    scheduleBn: 'রবি ও বুধবার বিকাল ৩:৩০ – ৫:০০',
    membersCountBn: '৯৫+ সক্রিয় সদস্য',
    activitiesBn: [
      'ফুটবল, ক্রিকেট, ভলিবল ও ব্যাডমিন্টন টিম গঠন ও নিয়মিত অনুশীলন',
      'আন্তঃশ্রেণি প্রীতি ম্যাচ এবং বার্ষিক অ্যাথলেটিক্স প্রশিক্ষণ',
      'দাবা ও ইনডোর গেমস প্রতিযোগিতা আয়োজন',
    ],
  },
  'debate-speech': {
    key: 'debate-speech',
    href: '/clubs/debate-speech',
    labelBn: 'বিতর্ক ও বক্তৃতা ক্লাব',
    titleBn: 'যুক্তি ও বিতর্ক ক্লাব',
    titleEn: 'Debate & Public Speaking Club',
    descriptionBn:
      'যুক্তিবাদী চিন্তা, বাংলা ও ইংরেজি উপস্থিত বক্তৃতা এবং সংসদীয় বিতর্ক চর্চার মাধ্যমে শিক্ষার্থীদের বাগ্মিতা ও আত্মবিশ্বাস গড়ে তোলা।',
    image: SCHOOL_INFO.assets.debateCulture,
    advisorBn: 'মোঃ রফিকুল ইসলাম ও ফারজানা আক্তার',
    scheduleBn: 'প্রতি বৃহস্পতিবার দুপুর ২:৩০ – ৪:০০',
    membersCountBn: '৬৫+ সক্রিয় সদস্য',
    activitiesBn: [
      'সাপ্তাহিক সংসদীয় ও সনাতনী বিতর্ক কর্মশালা',
      'উপজেলা ও জেলা পর্যায়ের জাতীয় স্কুল বিতর্ক প্রতিযোগিতায় অংশগ্রহণ',
      'ইংরেজি স্পোকেন ও নির্ধারিত/উপস্থিত বক্তৃতা অনুশীলন',
    ],
  },
  cultural: {
    key: 'cultural',
    href: '/clubs/cultural',
    labelBn: 'সাংস্কৃতিক ক্লাব',
    titleBn: 'সৃজনশীল সাংস্কৃতিক ও সাহিত্য ক্লাব',
    titleEn: 'Cultural, Arts & Literature Club',
    descriptionBn:
      'সংগীত, কবিতা আবৃত্তি, চারুকলা, নাট্যচর্চা এবং দেয়ালিকা প্রকাশনার মাধ্যমে বিদ্যালয়ের সাংস্কৃতিক ঐতিহ্য সমৃদ্ধ করা।',
    image: SCHOOL_INFO.assets.morningAssembly,
    advisorBn: 'নাসরিন সুলতানা (সাংস্কৃতিক উপদেষ্টা)',
    scheduleBn: 'প্রতি মঙ্গলবার বিকাল ৩:১৫ – ৪:১৫',
    membersCountBn: '৮০+ সক্রিয় সদস্য',
    activitiesBn: [
      'দেশাত্মবোধক গান, রবীন্দ্র-নজরুল সংগীত ও দলীয় আবৃত্তি অনুশীলন',
      'চিত্রাঙ্কন, ক্যালিগ্রাফি ও দেয়ালিকা “কিশলয়” অলংকরণ',
      'বার্ষিক সাংস্কৃতিক অনুষ্ঠান ও জাতীয় দিবস মঞ্চ পরিবেশনা',
    ],
  },
};

const CLUB_TABS: Array<{ key: ClubKey; href: string; labelBn: string; icon: typeof Trophy }> = [
  { key: 'sports', href: '/clubs/sports', labelBn: 'ক্রীড়া ক্লাব', icon: Trophy },
  { key: 'debate-speech', href: '/clubs/debate-speech', labelBn: 'বিতর্ক ও বক্তৃতা ক্লাব', icon: Mic },
  { key: 'cultural', href: '/clubs/cultural', labelBn: 'সাংস্কৃতিক ক্লাব', icon: Palette },
];

export function ClubDetailPage({ clubKey }: { clubKey: ClubKey }) {
  const { addToast } = useSchoolStore();
  const club = CLUBS_MAP[clubKey];
  const isDebatePhoto = club.image.includes('bhs_debate_culture');

  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('Class 8');
  const [rollNo, setRollNo] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [registered, setRegistered] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !rollNo.trim()) {
      addToast('error', 'অনুগ্রহ করে শিক্ষার্থীর নাম এবং শ্রেণি রোল নম্বর লিখুন।');
      return;
    }
    setRegistered(true);
    addToast('success', `${club.titleBn}-এ আপনার সদস্য নিবন্ধন গৃহীত হয়েছে!`);
    setStudentName('');
    setRollNo('');
    setGuardianPhone('');
  };

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="শিক্ষার্থী ক্লাব ও নেতৃত্ব বিকাশ"
        title={club.titleBn}
        titleBn={club.titleEn}
        description={club.descriptionBn}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-bn">
        {/* Club Switcher */}
        <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          {CLUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === clubKey;
            return (
              <Link
                key={tab.key}
                to={tab.href}
                onClick={() => setRegistered(false)}
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

        {/* Main 2-Column Layout: Left = Club Showcase, Right = Member Registration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                <img
                  src={club.image}
                  alt={club.titleBn}
                  className={`w-full h-full object-cover ${
                    isDebatePhoto ? 'object-bottom scale-[1.22] origin-bottom' : 'object-center'
                  }`}
                />
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 text-xs">
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-500">সদস্য সংখ্যা</p>
                    <p className="font-bold text-[#1B2A6B] mt-0.5">{club.membersCountBn}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-500">সাপ্তাহিক অনুশীলন</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{club.scheduleBn}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-500">উপদেষ্টা শিক্ষক</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{club.advisorBn}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-[#1B2A6B]">ক্লাবের নিয়মিত কার্যক্রম</h2>
              <ul className="space-y-3 text-sm text-slate-700">
                {club.activitiesBn.map((act) => (
                  <li key={act} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#1B2A6B]">ক্লাব সদস্য নিবন্ধন ফরম</h2>
              <p className="text-xs text-slate-500 mt-1">
                ৬ষ্ঠ থেকে ১০ম শ্রেণির যেকোনো শিক্ষার্থী বিনামূল্যে ক্লাবে যোগদান করতে পারবে।
              </p>
            </div>

            {registered ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#1F7A4D] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>নিবন্ধন সফল হয়েছে!</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  আপনার আবেদন {club.titleBn}-এর উপদেষ্টা শিক্ষকের নিকট সংরক্ষিত হয়েছে। পরবর্তী অনুশীলন সেশনে ({club.scheduleBn}) উপস্থিত থাকার অনুরোধ রইল।
                </p>
                <button
                  type="button"
                  onClick={() => setRegistered(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#1B2A6B] bg-white border border-slate-300 rounded-lg cursor-pointer"
                >
                  আরেকজন শিক্ষার্থীর নিবন্ধন করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoin} noValidate className="space-y-4">
                <div>
                  <label htmlFor="club-student" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    শিক্ষার্থীর নাম *
                  </label>
                  <input
                    id="club-student"
                    type="text"
                    placeholder="যেমন: রাফিউল ইসলাম"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="club-class" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      শ্রেণি
                    </label>
                    <select
                      id="club-class"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                    >
                      <option value="Class 6">৬ষ্ঠ শ্রেণি</option>
                      <option value="Class 7">৭ম শ্রেণি</option>
                      <option value="Class 8">৮ম শ্রেণি</option>
                      <option value="Class 9">৯ম শ্রেণি</option>
                      <option value="Class 10">১০ম শ্রেণি</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="club-roll" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      শ্রেণি রোল *
                    </label>
                    <input
                      id="club-roll"
                      type="text"
                      placeholder="যেমন: ১২"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-[#1F7A4D]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="club-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    অভিভাবকের মোবাইল নম্বর
                  </label>
                  <input
                    id="club-phone"
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm border border-slate-300 rounded-lg font-sans tabular-nums focus:outline-none focus:border-[#1F7A4D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors cursor-pointer"
                >
                  সদস্য হিসেবে আবেদন করুন
                </button>
              </form>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
