import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import type { InstitutionStar } from '../../data/institutionStars';
import type { StaffMember, Teacher } from '../../types';
import { toBanglaDigits } from '../../utils/noticeUtils';

const WHY_STUDY_FEATURES = [
  {
    codeBn: '১৮৯৮',
    labelBn: 'ঐতিহ্য ও ভিত্তি',
    titleBn: '১২৮+ বছরের গৌরবময় ঐতিহ্য ও নির্ভরযোগ্যতা',
    descBn:
      '১৮৯৮ সাল থেকে উপসী, নড়িয়া ও শরীয়তপুর অঞ্চলে মানসম্মত, শৃঙ্খলাবদ্ধ ও নৈতিক মাধ্যমিক শিক্ষার নিরবচ্ছিন্ন ধারা।',
    icon: Landmark,
  },
  {
    codeBn: '২৪+ জন',
    labelBn: 'দক্ষ শিক্ষকমণ্ডলী',
    titleBn: 'বিষয়ভিত্তিক অভিজ্ঞ শিক্ষক ও নিবিড় মূল্যায়ন',
    descBn:
      'স্নাতকোত্তর ও বি.এড প্রশিক্ষিত শিক্ষকদের প্রত্যক্ষ তত্ত্বাবধান, সাপ্তাহিক পরীক্ষা ও বোর্ড পরীক্ষার বিশেষ প্রস্তুতি।',
    icon: GraduationCap,
  },
  {
    codeBn: 'ল্যাব ও স্মার্ট',
    labelBn: 'আধুনিক অবকাঠামো',
    titleBn: 'সমৃদ্ধ বিজ্ঞান গবেষণাগার, আইসিটি ল্যাব ও গ্রন্থাগার',
    descBn:
      'পদার্থ, রসায়ন ও জীববিজ্ঞানের ব্যবহারিক ক্লাস, ডিজিটাল কম্পিউটার ল্যাব, মাল্টিমিডিয়া শ্রেণিকক্ষ ও ৩,৫০০+ বইয়ের লাইব্রেরি।',
    icon: FlaskConical,
  },
  {
    codeBn: 'RFID স্মার্ট',
    labelBn: 'ডিজিটাল নিরাপত্তা',
    titleBn: 'RFID গেট হাজিরা, তাৎক্ষণিক SMS ও অভিভাবক পোর্টাল',
    descBn:
      'প্রবেশ ও প্রস্থানে স্বয়ংক্রিয় অভিভাবক SMS, অনলাইন ফলাফল ও নিরাপদ সহশিক্ষা পরিবেশে পূর্ণাঙ্গ বিকাশ।',
    icon: ShieldCheck,
  },
];

export function WhyStudyShowcaseSection() {
  return (
    <section id="why-study-bhs" className="scroll-mt-24 space-y-5">
      {/* Clean Institutional Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#1F7A4D] tabular-nums">
            স্থাপিত: ১৮৯৮ খ্রি. · EIIN: {SCHOOL_INFO.eiin} · কোড: {SCHOOL_INFO.schoolCode}
          </p>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1B2A6B] leading-snug">
            কেন বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ে পড়বেন?
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold">
          <Link
            to="/about/history"
            className="text-[#1B2A6B] hover:text-[#1F7A4D] inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>ইতিহাস ও ঐতিহ্য</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link
            to="/about/mission-vision"
            className="text-[#1F7A4D] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>লক্ষ্য ও উদ্দেশ্য</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Asymmetric 2-Column Visual Showcase (Photo + 3 Heritage Metrics Left, Stacked Feature Cards Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 5 Columns: Framed Campus Photography + 3 Compact Heritage Stat Tiles */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          <div className="relative flex-1 min-h-[260px] lg:min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 bg-[#0E1842] shadow-xs">
            <img
              src={SCHOOL_INFO.assets.classroomStudy}
              alt="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় স্মার্ট শ্রেণিকক্ষ ও ক্যাম্পাস"
              className="w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0C163B]/90 via-[#0C163B]/35 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 space-y-1.5 text-white">
              <p className="inline-block px-2.5 py-1 rounded-md bg-[#1F7A4D] text-[11px] font-semibold tracking-wide">
                মূল ক্যাম্পাস ও স্মার্ট শ্রেণিকক্ষ
              </p>
              <h3 className="text-base sm:text-lg font-semibold leading-snug">
                {SCHOOL_INFO.nameBn}
              </h3>
              <p className="text-xs text-white/85 leading-relaxed">
                উপসী, নড়িয়া, শরীয়তপুরে সুপরিসর ক্যাম্পাস, সবুজ খেলার মাঠ ও আধুনিক শিক্ষার সমন্বয়
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-center">
              <p className="text-base sm:text-lg font-bold text-[#1F7A4D] tabular-nums leading-tight">
                ১৮৯৮
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">প্রতিষ্ঠা সন</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-center">
              <p className="text-base sm:text-lg font-bold text-[#1B2A6B] tabular-nums leading-tight">
                ১১৩৫৮৫
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">EIIN নম্বর</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-center">
              <p className="text-base sm:text-lg font-bold text-[#1F7A4D] tabular-nums leading-tight">
                ১২৮+ বছর
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">শিক্ষা ঐতিহ্য</p>
            </div>
          </div>
        </div>

        {/* Right 7 Columns: Stacked Elevated Feature Cards */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3">
          {WHY_STUDY_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <article
                key={feat.titleBn}
                className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl p-4 sm:p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-sm"
              >
                <div className="w-16 h-16 rounded-xl bg-[#1F7A4D]/[0.08] border border-[#1F7A4D]/20 text-[#1F7A4D] group-hover:bg-[#1F7A4D] group-hover:text-white flex flex-col items-center justify-center shrink-0 transition-colors px-1 text-center">
                  <Icon className="w-4 h-4 mb-1" aria-hidden="true" />
                  <span className="text-[10.5px] font-bold leading-none tabular-nums">
                    {feat.codeBn}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <h3 className="text-sm sm:text-[15px] font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors leading-snug">
                      {feat.titleBn}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#1F7A4D] whitespace-nowrap">
                      {feat.labelBn}
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                    {feat.descBn}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   MODERN HORIZONTAL CARD SLIDER — FACULTY & STAFF
============================================================================ */

export function FacultyStaffSliderSection({
  teachers,
  staff,
}: {
  teachers: Teacher[];
  staff: StaffMember[];
}) {
  const [peopleTab, setPeopleTab] = useState<'teachers' | 'staff'>('teachers');
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = railRef.current;
    if (el) {
      el.scrollTo({ left: 0, behavior: 'auto' });
      window.setTimeout(updateScrollButtons, 50);
    }
  }, [peopleTab, teachers.length, staff.length]);

  const scrollRail = (direction: 'prev' | 'next') => {
    const el = railRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.78));
    el.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  return (
    <section id="faculty-staff" className="scroll-mt-24 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-[#1F7A4D]">মানবসম্পদ ও পাঠদান নেতৃত্ব</p>
          <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] leading-snug mt-0.5">
            শিক্ষকমণ্ডলী ও কর্মকর্তা-কর্মচারীবৃন্দ
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Segmented Switcher */}
          <div className="inline-flex bg-white border border-slate-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setPeopleTab('teachers')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                peopleTab === 'teachers'
                  ? 'bg-[#1B2A6B] text-white'
                  : 'text-slate-600 hover:text-[#1B2A6B]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>শিক্ষকমণ্ডলী ({toBanglaDigits(teachers.length)})</span>
            </button>
            <button
              type="button"
              onClick={() => setPeopleTab('staff')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                peopleTab === 'staff'
                  ? 'bg-[#1B2A6B] text-white'
                  : 'text-slate-600 hover:text-[#1B2A6B]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
              <span>কর্মকর্তা-কর্মচারী ({toBanglaDigits(staff.length)})</span>
            </button>
          </div>

          {/* Slider Prev / Next Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollRail('prev')}
              disabled={!canScrollLeft}
              aria-label="পূর্ববর্তী শিক্ষক ও কর্মচারী দেখুন"
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#1B2A6B] hover:border-[#1F7A4D] hover:text-[#1F7A4D] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail('next')}
              disabled={!canScrollRight}
              aria-label="পরবর্তী শিক্ষক ও কর্মচারী দেখুন"
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#1B2A6B] hover:border-[#1F7A4D] hover:text-[#1F7A4D] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={peopleTab === 'teachers' ? '/about/teachers' : '/about/staff'}
            className="text-xs font-semibold text-[#1F7A4D] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>সকল তালিকা</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll-Snap Showcase Slider */}
      <div
        ref={railRef}
        onScroll={updateScrollButtons}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {peopleTab === 'teachers'
          ? teachers.map((teacher) => (
              <Link
                key={teacher.id}
                to={`/about/teachers/${teacher.id}`}
                className="group snap-start shrink-0 w-[260px] sm:w-[276px] lg:w-[292px] bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-slate-900/5"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={teacher.photoUrl || SCHOOL_INFO.assets.teacherMaleScience}
                    alt={teacher.nameBn}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0C163B]/75 to-transparent"
                    aria-hidden="true"
                  />
                  <p className="absolute bottom-2.5 left-3 right-3 text-[11px] font-medium text-[#F4DDA0] truncate">
                    {teacher.departmentBn || teacher.department}
                  </p>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors leading-snug truncate">
                      {teacher.nameBn}
                    </h3>
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {teacher.designationBn}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {teacher.qualificationBn || teacher.qualification}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1F7A4D]">
                    <span className="text-[11px] font-normal text-slate-500 tabular-nums">
                      {teacher.experienceYears
                        ? `অভিজ্ঞতা: ${toBanglaDigits(teacher.experienceYears)} বছর`
                        : teacher.employeeId}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span>প্রোফাইল</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          : staff.map((member) => (
              <Link
                key={member.id}
                to={`/about/staff/${member.id}`}
                className="group snap-start shrink-0 w-[260px] sm:w-[276px] lg:w-[292px] bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-slate-900/5"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={member.photoUrl || SCHOOL_INFO.assets.staffOffice}
                    alt={member.nameBn}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0C163B]/75 to-transparent"
                    aria-hidden="true"
                  />
                  <p className="absolute bottom-2.5 left-3 right-3 text-[11px] font-medium text-[#F4DDA0] truncate">
                    {member.departmentBn || member.department}
                  </p>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors leading-snug truncate">
                      {member.nameBn}
                    </h3>
                    <p className="text-xs font-medium text-slate-700 truncate">{member.roleBn}</p>
                    <p className="text-[11px] text-slate-500 tabular-nums truncate">
                      আইডি: {member.employeeId}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1F7A4D]">
                    <span className="text-[11px] font-normal text-slate-500 truncate">
                      {member.officeRoom || 'প্রশাসনিক কার্যালয়'}
                    </span>
                    <span className="inline-flex items-center gap-1 shrink-0">
                      <span>প্রোফাইল</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

/* ============================================================================
   MODERN HORIZONTAL CARD SLIDER — OUR STARS / NOTABLE ALUMNI (NO SPARKLES ICON)
============================================================================ */

export function InstitutionStarsSliderSection({ stars }: { stars: InstitutionStar[] }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [stars.length]);

  const scrollRail = (direction: 'prev' | 'next') => {
    const el = railRef.current;
    if (!el) return;
    const step = Math.max(280, Math.round(el.clientWidth * 0.78));
    el.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  return (
    <section id="our-stars" className="scroll-mt-24 space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-[#1F7A4D] tracking-wide">
            Our Stars · Stars of Our Institution
          </p>
          <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] mt-0.5 leading-snug">
            আমাদের প্রতিষ্ঠানের গর্বিত নক্ষত্রবৃন্দ (কৃতি প্রাক্তন শিক্ষার্থী)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollRail('prev')}
              disabled={!canScrollLeft}
              aria-label="পূর্ববর্তী কৃতি প্রাক্তন শিক্ষার্থী দেখুন"
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#1B2A6B] hover:border-[#1F7A4D] hover:text-[#1F7A4D] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail('next')}
              disabled={!canScrollRight}
              aria-label="পরবর্তী কৃতি প্রাক্তন শিক্ষার্থী দেখুন"
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-[#1B2A6B] hover:border-[#1F7A4D] hover:text-[#1F7A4D] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/about/stars"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1F7A4D] hover:underline whitespace-nowrap"
          >
            <span>সকল নক্ষত্র দেখুন</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll-Snap Alumni Showcase Slider */}
      <div
        ref={railRef}
        onScroll={updateScrollButtons}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stars.map((star) => (
          <Link
            key={star.id}
            to="/about/stars"
            className="group snap-start shrink-0 w-[264px] sm:w-[280px] lg:w-[296px] bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-slate-900/5"
          >
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src={star.photoUrl}
                alt={`${star.nameBn} — ${star.sscBatchBn}`}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0C163B]/80 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 text-[11px] text-white">
                <span className="font-semibold text-[#F4DDA0] tabular-nums">{star.sscBatchBn}</span>
                <span className="text-white/85 truncate">{star.groupBn}</span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-[#1F7A4D] truncate">
                  {star.fieldCategory}
                </p>
                <h3 className="text-[15px] font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] transition-colors leading-snug truncate">
                  {star.nameBn}
                </h3>
                <p className="text-xs font-medium text-slate-700 truncate">
                  {star.currentPositionBn}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{star.organizationBn}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-600">
                <Award className="w-3.5 h-3.5 text-[#C9A961] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="line-clamp-2 leading-relaxed">{star.achievementBn}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
