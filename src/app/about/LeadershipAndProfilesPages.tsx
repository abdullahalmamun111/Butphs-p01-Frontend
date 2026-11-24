import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  Mail,
  Phone,
  Quote,
  Users,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { useSchoolStore } from '../../store/SchoolStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageHeader } from '../../components/shared/PageHeader';
import { SafeImage } from '../../components/ui/SafeImage';
import { EmptyState } from '../../components/ui/EmptyState';
import { toBanglaDigits } from '../../utils/noticeUtils';

export function ChairmanMessagePage() {
  useDocumentTitle('সভাপতির বাণী · Chairman Message');
  const { db } = useSchoolStore();
  const content = db.websiteContent;
  const paragraphs = content.chairmanFullMessage || [content.chairmanMessage || ''];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'About', href: '/about/history' },
          { label: 'সভাপতির বাণী (Chairman Message)' },
        ]}
        kicker={`নেতৃত্বের বাণী · স্থাপিত ${SCHOOL_INFO.establishedBn}`}
        title="Message from the Chairman"
        titleBn="সভাপতির বাণী"
        description="বিদ্যালয় পরিচালনা পর্ষদের সভাপতির পূর্ণাঙ্গ বাণী ও ভবিষ্যৎ দিকনির্দেশনা।"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Portrait & Identity Column */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="aspect-[3/4] bg-slate-100 overflow-hidden">
                <SafeImage
                  src={SCHOOL_INFO.assets.chairmanPortrait}
                  alt={content.chairmanName || 'Managing Committee Chairman'}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-5 space-y-1.5 font-bn">
                <p className="text-xs font-semibold text-[#1F7A4D]">সভাপতির বাণী · পরিচালনা পর্ষদ</p>
                <h2 className="text-lg font-semibold text-[#1B2A6B]">
                  {content.chairmanName || 'সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ'}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {content.chairmanTitle || 'সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ'}
                </p>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {SCHOOL_INFO.nameBn} · EIIN: {SCHOOL_INFO.eiin}
                </p>
              </div>
            </div>

            {/* Cross-link to Head Teacher's Message */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-medium text-slate-500 font-bn">অন্যান্য নেতৃত্বের বাণী</p>
              <Link
                to="/about/head-teacher-message"
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F8FC] hover:bg-[#1F7A4D]/10 transition-colors"
              >
                <div className="min-w-0 font-bn">
                  <p className="text-sm font-semibold text-[#1B2A6B] truncate">
                    প্রধান শিক্ষকের বাণী
                  </p>
                  <p className="text-xs text-slate-500 truncate">{content.headTeacherName}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#1F7A4D] shrink-0" />
              </Link>
              <Link
                to="/about/management-committee"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1F7A4D] hover:underline font-bn"
              >
                <span>বিদ্যালয় পরিচালনা পর্ষদ দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Full Message Body */}
          <article className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6 font-bn">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-11 h-11 rounded-xl bg-[#1F7A4D]/10 text-[#1F7A4D] flex items-center justify-center shrink-0">
                <Quote className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#1B2A6B]">
                  শতবর্ষের ঐতিহ্য ও আধুনিক শিক্ষার সম্মিলিত অগ্রযাত্রা
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {SCHOOL_INFO.nameBn} · {SCHOOL_INFO.addressBn}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-[15px] sm:text-base text-slate-700 leading-[1.9] text-justify">
              {paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-[#1B2A6B]">{content.chairmanName}</p>
                <p className="text-xs text-slate-600">{content.chairmanTitle}</p>
              </div>
              <Link
                to="/about/history"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors whitespace-nowrap"
              >
                <span>১২৮ বছরের ইতিহাস পড়ুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export function HeadTeacherMessagePage() {
  useDocumentTitle('প্রধান শিক্ষকের বাণী · Head Teacher Message');
  const { db } = useSchoolStore();
  const content = db.websiteContent;
  const headTeacher = db.teachers.find((t) => t.isHeadTeacher) || db.teachers[0];
  const paragraphs = content.headTeacherFullMessage || [content.headTeacherMessage];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'About', href: '/about/history' },
          { label: 'প্রধান শিক্ষকের বাণী (Head Teacher Message)' },
        ]}
        kicker={`একাডেমিক নেতৃত্ব · EIIN ${SCHOOL_INFO.eiin}`}
        title="Message from the Head Teacher"
        titleBn="প্রধান শিক্ষকের বাণী"
        description="প্রধান শিক্ষকের পূর্ণাঙ্গ একাডেমিক বার্তা, শিক্ষা দর্শন ও শিক্ষার্থীদের প্রতি নির্দেশনা।"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Portrait & Credentials Column */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="aspect-[3/4] bg-slate-100 overflow-hidden">
                <SafeImage
                  src={headTeacher?.photoUrl || SCHOOL_INFO.assets.headTeacher}
                  alt={content.headTeacherName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-5 space-y-1.5 font-bn">
                <p className="text-xs font-semibold text-[#1F7A4D]">প্রধান শিক্ষকের বাণী</p>
                <h2 className="text-lg font-semibold text-[#1B2A6B]">{content.headTeacherName}</h2>
                <p className="text-xs text-slate-600">{content.headTeacherTitle}</p>
                {headTeacher && (
                  <p className="text-xs text-slate-500 pt-1">{headTeacher.qualificationBn || headTeacher.qualification}</p>
                )}
                {headTeacher && (
                  <div className="pt-3 mt-2 border-t border-slate-100">
                    <Link
                      to={`/about/teachers/${headTeacher.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1F7A4D] hover:underline"
                    >
                      <span>ব্যক্তিগত শিক্ষক প্রোফাইল দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Cross-link to Chairman's Message */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-medium text-slate-500 font-bn">অন্যান্য নেতৃত্বের বাণী</p>
              <Link
                to="/about/chairman-message"
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F8FC] hover:bg-[#1F7A4D]/10 transition-colors"
              >
                <div className="min-w-0 font-bn">
                  <p className="text-sm font-semibold text-[#1B2A6B] truncate">সভাপতির বাণী</p>
                  <p className="text-xs text-slate-500 truncate">{content.chairmanName}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#1F7A4D] shrink-0" />
              </Link>
              <Link
                to="/about/teachers"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1F7A4D] hover:underline font-bn"
              >
                <span>সকল শিক্ষকমণ্ডলী দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Full Message Body */}
          <article className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6 font-bn">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-11 h-11 rounded-xl bg-[#1B2A6B]/10 text-[#1B2A6B] flex items-center justify-center shrink-0">
                <Quote className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#1B2A6B]">
                  মানসম্মত শিক্ষা, নৈতিকতা ও স্মার্ট বিদ্যালয় গড়ার অঙ্গীকার
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {SCHOOL_INFO.nameBn} · EIIN: {SCHOOL_INFO.eiin} · কোড: {SCHOOL_INFO.schoolCode}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-[15px] sm:text-base text-slate-700 leading-[1.9] text-justify">
              {paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-[#1B2A6B]">{content.headTeacherName}</p>
                <p className="text-xs text-slate-600">{content.headTeacherTitle}</p>
              </div>
              <Link
                to="/academics/curriculum"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1B2A6B] hover:bg-[#121D4D] rounded-lg transition-colors whitespace-nowrap"
              >
                <span>একাডেমিক পাঠ্যক্রম দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export function TeacherProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db } = useSchoolStore();
  const teacher = db.teachers.find((t) => t.id === id);

  useDocumentTitle(teacher ? `${teacher.nameBn} · শিক্ষক প্রোফাইল` : 'শিক্ষক প্রোফাইল');

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="শিক্ষক প্রোফাইল পাওয়া যায়নি"
          description="অনুরোধকৃত শিক্ষকের তথ্য তালিকায় পাওয়া যায়নি।"
          action={
            <Link
              to="/about/teachers"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1F7A4D] rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>সকল শিক্ষক তালিকায় ফিরুন</span>
            </Link>
          }
        />
      </div>
    );
  }

  const teacherRoutines = db.routines.filter(
    (r) =>
      r.teacherName.toLowerCase().includes(teacher.name.toLowerCase()) ||
      r.teacherName === teacher.name ||
      r.teacherName === teacher.nameBn
  );
  const colleagues = db.teachers.filter((t) => t.id !== teacher.id && t.status === 'Active').slice(0, 4);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'About', href: '/about/history' },
          { label: 'শিক্ষকমণ্ডলী', href: '/about/teachers' },
          { label: teacher.nameBn },
        ]}
        kicker={`${teacher.departmentBn || teacher.department} · ID: ${teacher.employeeId}`}
        title={teacher.name}
        titleBn={teacher.nameBn}
        description={`${teacher.designationBn} (${teacher.designation}) · ${teacher.qualificationBn || teacher.qualification}`}
        actions={
          <Link
            to="/about/teachers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-bn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল শিক্ষক</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Portrait & Quick Facts */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="aspect-[3/4] bg-slate-100 overflow-hidden relative">
                <SafeImage
                  src={teacher.photoUrl || SCHOOL_INFO.assets.headTeacher}
                  alt={teacher.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4">
                  <p className="text-xs font-medium text-white/95 font-bn">
                    {teacher.departmentBn || teacher.department}
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-3 text-xs font-bn">
                <dl className="divide-y divide-slate-100">
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#1F7A4D]" />
                      আইডি নম্বর
                    </dt>
                    <dd className="font-semibold text-[#1B2A6B] tabular-nums">{teacher.employeeId}</dd>
                  </div>
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1F7A4D]" />
                      যোগদানের তারিখ
                    </dt>
                    <dd className="font-medium text-slate-800 tabular-nums">{teacher.joiningDate}</dd>
                  </div>
                  {teacher.experienceYears && (
                    <div className="py-2 flex items-center justify-between gap-2">
                      <dt className="text-slate-500 inline-flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#1F7A4D]" />
                        শিক্ষকতার অভিজ্ঞতা
                      </dt>
                      <dd className="font-medium text-slate-800 tabular-nums">
                        {toBanglaDigits(teacher.experienceYears)}+ বছর
                      </dd>
                    </div>
                  )}
                  <div className="py-2 flex items-start justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5 shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-[#1F7A4D]" />
                      কক্ষ
                    </dt>
                    <dd className="font-medium text-slate-800 text-right">
                      {teacher.officeRoom || 'শিক্ষক মিলনায়তন'}
                    </dd>
                  </div>
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#1F7A4D]" />
                      ইমেইল
                    </dt>
                    <dd className="font-medium text-slate-700 font-sans truncate">{teacher.email}</dd>
                  </div>
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-slate-500 inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1F7A4D]" />
                      যোগাযোগ
                    </dt>
                    <dd className="text-slate-600 font-sans">{teacher.phone}</dd>
                  </div>
                </dl>

                {teacher.isHeadTeacher && (
                  <Link
                    to="/about/head-teacher-message"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors"
                  >
                    <span>প্রধান শিক্ষকের সম্পূর্ণ বাণী পড়ুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* Main Profile Content */}
          <div className="lg:col-span-8 space-y-6 font-bn">
            {/* Bio & Motto */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-semibold text-[#1B2A6B] pb-3 border-b border-slate-100">
                পরিচিতি ও একাডেমিক অভিজ্ঞতা
              </h2>
              <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                {teacher.bio ||
                  `${teacher.nameBn} বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের ${teacher.departmentBn || teacher.department}-এ নিষ্ঠার সাথে পাঠদান ও শিক্ষার্থীদের একাডেমিক পরিচর্যায় নিয়োজিত রয়েছেন।`}
              </p>

              {teacher.personalMotto && (
                <div className="bg-[#F7F8FC] border border-slate-200 rounded-xl p-4 text-sm text-[#1B2A6B] italic">
                  {teacher.personalMotto}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#F7F8FC] space-y-1.5">
                  <p className="text-xs font-semibold text-[#1F7A4D] inline-flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    শিক্ষাগত যোগ্যতা
                  </p>
                  <p className="text-sm font-medium text-[#1B2A6B]">
                    {teacher.qualificationBn || teacher.qualification}
                  </p>
                  <p className="text-xs text-slate-500 font-sans">{teacher.qualification}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F7F8FC] space-y-1.5">
                  <p className="text-xs font-semibold text-[#1F7A4D] inline-flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    পাঠদানের শ্রেণি ও বিষয়
                  </p>
                  <p className="text-sm font-medium text-[#1B2A6B]">
                    {teacher.assignedSubjects.join(' · ')}
                  </p>
                  <p className="text-xs text-slate-600 font-sans">
                    শ্রেণি: {teacher.assignedClasses.join(', ')}
                  </p>
                </div>
              </div>

              {teacher.specialties && teacher.specialties.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-[#1B2A6B] mb-2">
                    বিশেষ দক্ষতা ও সহশিক্ষা দায়িত্ব
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 list-disc pl-5">
                    {teacher.specialties.map((sp) => (
                      <li key={sp}>{sp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Weekly Class Schedule */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-[#1B2A6B] inline-flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#1F7A4D]" />
                  <span>সাপ্তাহিক পাঠদান সূচি</span>
                </h2>
                <Link
                  to="/academics/class-routine"
                  className="text-xs font-medium text-[#1F7A4D] hover:underline"
                >
                  পূর্ণ রুটিন →
                </Link>
              </div>

              {teacherRoutines.length === 0 ? (
                <p className="text-sm text-slate-600">
                  বর্তমান সাপ্তাহিক রুটিনে এই শিক্ষকের নির্ধারিত পিরিয়ড তালিকাভুক্ত নেই।
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="bg-[#F7F8FC] text-[#1B2A6B] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-medium">বার</th>
                        <th className="py-2.5 px-3 font-medium">পিরিয়ড ও সময়</th>
                        <th className="py-2.5 px-3 font-medium">শ্রেণি ও শাখা</th>
                        <th className="py-2.5 px-3 font-medium">বিষয়</th>
                        <th className="py-2.5 px-3 font-medium">কক্ষ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teacherRoutines.map((r) => (
                        <tr key={r.id}>
                          <td className="py-2.5 px-3 font-medium text-[#1B2A6B] font-sans">{r.day}</td>
                          <td className="py-2.5 px-3 tabular-nums text-slate-600 font-sans">
                            {r.period} · {r.time}
                          </td>
                          <td className="py-2.5 px-3">
                            {r.className} · {r.section}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{r.subject}</td>
                          <td className="py-2.5 px-3 text-slate-600 font-sans">{r.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Colleagues Quick Switcher */}
        <section className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1F7A4D]" />
              <span>অন্যান্য শিক্ষকমণ্ডলীর প্রোফাইল</span>
            </h2>
            <Link to="/about/teachers" className="text-xs font-medium text-[#1F7A4D] hover:underline font-bn">
              সকল শিক্ষক দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {colleagues.map((col) => (
              <Link
                key={col.id}
                to={`/about/teachers/${col.id}`}
                className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-4 flex items-center gap-3 transition-colors"
              >
                <SafeImage
                  src={col.photoUrl || SCHOOL_INFO.assets.headTeacher}
                  alt={col.name}
                  className="w-12 h-12 rounded-lg object-cover object-top shrink-0 border border-slate-200"
                />
                <div className="min-w-0 font-bn">
                  <p className="text-sm font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] truncate">
                    {col.nameBn}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{col.designationBn}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function StaffProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db } = useSchoolStore();
  const member = db.staff.find((s) => s.id === id);

  useDocumentTitle(member ? `${member.nameBn} · কর্মকর্তা-কর্মচারী প্রোফাইল` : 'কর্মচারী প্রোফাইল');

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="কর্মচারীর প্রোফাইল পাওয়া যায়নি"
          description="অনুরোধকৃত কর্মকর্তা বা কর্মচারীর তথ্য তালিকায় পাওয়া যায়নি।"
          action={
            <Link
              to="/about/staff"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1F7A4D] rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>কর্মচারী তালিকায় ফিরুন</span>
            </Link>
          }
        />
      </div>
    );
  }

  const otherStaff = db.staff.filter((s) => s.id !== member.id);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: 'About', href: '/about/history' },
          { label: 'কর্মকর্তা ও কর্মচারীবৃন্দ', href: '/about/staff' },
          { label: member.nameBn },
        ]}
        kicker={`${member.departmentBn || member.department} · ID: ${member.employeeId}`}
        title={member.name}
        titleBn={member.nameBn}
        description={`${member.roleBn} (${member.role}) · ${SCHOOL_INFO.nameBn}`}
        actions={
          <Link
            to="/about/staff"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-bn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল কর্মচারী</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="aspect-[3/4] bg-slate-100 overflow-hidden relative">
                <SafeImage
                  src={member.photoUrl || SCHOOL_INFO.assets.staffOffice}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4">
                  <p className="text-xs font-medium text-white/95 font-bn">
                    {member.departmentBn || member.department}
                  </p>
                </div>
              </div>
              <div className="p-5 text-xs font-bn">
                <dl className="divide-y divide-slate-100">
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">কর্মচারী আইডি</dt>
                    <dd className="font-semibold text-[#1B2A6B] tabular-nums">{member.employeeId}</dd>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">যোগদানের তারিখ</dt>
                    <dd className="font-medium text-slate-800 tabular-nums">{member.joiningDate}</dd>
                  </div>
                  {member.qualification && (
                    <div className="py-2 flex justify-between gap-2">
                      <dt className="text-slate-500">যোগ্যতা</dt>
                      <dd className="font-medium text-slate-800 text-right">{member.qualification}</dd>
                    </div>
                  )}
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">অফিস কক্ষ</dt>
                    <dd className="font-medium text-slate-800 text-right">
                      {member.officeRoom || 'প্রশাসনিক ভবন'}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">অফিস সময়</dt>
                    <dd className="text-slate-700 text-right">
                      {member.workingHours || SCHOOL_INFO.officeHoursBn}
                    </dd>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <dt className="text-slate-500">যোগাযোগ</dt>
                    <dd className="text-slate-600 font-sans">{member.phone}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-6 font-bn">
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
              <h2 className="text-lg font-semibold text-[#1B2A6B] pb-3 border-b border-slate-100">
                দাপ্তরিক পরিচিতি ও দায়িত্বসমূহ
              </h2>
              <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                {member.bio ||
                  `${member.nameBn} বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের ${member.departmentBn || member.department}-এ নিষ্ঠা ও দক্ষতার সাথে দায়িত্ব পালন করছেন।`}
              </p>

              {member.responsibilities && member.responsibilities.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-[#1F7A4D]">মূল কার্যাবলি ও সেবা</h3>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    {member.responsibilities.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F8FC] border border-slate-100"
                      >
                        <Briefcase className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Other Staff Switcher */}
        <section className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1B2A6B] font-bn">
              অন্যান্য কর্মকর্তা ও কর্মচারীবৃন্দ
            </h2>
            <Link to="/about/staff" className="text-xs font-medium text-[#1F7A4D] hover:underline font-bn">
              সকল কর্মচারী দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otherStaff.map((s) => (
              <Link
                key={s.id}
                to={`/about/staff/${s.id}`}
                className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-4 flex items-center gap-3 transition-colors"
              >
                <SafeImage
                  src={s.photoUrl || SCHOOL_INFO.assets.staffOffice}
                  alt={s.name}
                  className="w-12 h-12 rounded-lg object-cover object-top shrink-0 border border-slate-200"
                />
                <div className="min-w-0 font-bn">
                  <p className="text-sm font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] truncate">
                    {s.nameBn}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{s.roleBn}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function CommitteeMemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { db } = useSchoolStore();
  const member = db.committeeMembers.find((m) => m.id === id);

  useDocumentTitle(
    member ? `${member.nameBn} · পরিচালনা পর্ষদ প্রোফাইল` : 'পরিচালনা পর্ষদ সদস্য প্রোফাইল'
  );

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="পরিচালনা পর্ষদ সদস্যের প্রোফাইল পাওয়া যায়নি"
          description="অনুরোধকৃত সদস্যের তথ্য পরিচালনা পর্ষদের তালিকায় পাওয়া যায়নি।"
          action={
            <Link
              to="/about/management-committee"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1F7A4D] rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পরিচালনা পর্ষদ তালিকায় ফিরুন</span>
            </Link>
          }
        />
      </div>
    );
  }

  const otherMembers = db.committeeMembers.filter((m) => m.id !== member.id);
  const isChairman = member.role.toLowerCase().includes('chairman');
  const isSecretary = member.role.toLowerCase().includes('secretary');

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker={`পরিচালনা পর্ষদ · ${member.tenure}`}
        title={member.name}
        titleBn={member.nameBn}
        description={`${member.roleBn} (${member.role}) · ${SCHOOL_INFO.nameBn}`}
        actions={
          <Link
            to="/about/management-committee"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-bn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল সদস্য</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-bn">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Portrait & Official Details */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="aspect-[3/4] bg-slate-100 overflow-hidden relative">
                <SafeImage
                  src={member.photoUrl || SCHOOL_INFO.assets.committeeGuardianMale}
                  alt={member.nameBn}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0E1842]/90 via-[#0E1842]/35 to-transparent p-4">
                  <p className="text-xs font-semibold text-[#E8CF8E]">{member.roleBn}</p>
                </div>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <dl className="divide-y divide-slate-100">
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-slate-500">পর্ষদের মেয়াদ</dt>
                    <dd className="font-semibold text-[#1B2A6B] tabular-nums">{member.tenure}</dd>
                  </div>
                  <div className="py-2 flex items-start justify-between gap-2">
                    <dt className="text-slate-500 shrink-0">পেশাগত পরিচয়</dt>
                    <dd className="font-medium text-slate-800 text-right">{member.professionBn}</dd>
                  </div>
                  {member.educationBn && (
                    <div className="py-2 flex items-start justify-between gap-2">
                      <dt className="text-slate-500 shrink-0">শিক্ষাগত যোগ্যতা</dt>
                      <dd className="font-medium text-slate-800 text-right">{member.educationBn}</dd>
                    </div>
                  )}
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-slate-500">যোগাযোগ</dt>
                    <dd className="text-slate-700 font-sans tabular-nums">{member.phone}</dd>
                  </div>
                  {member.email && (
                    <div className="py-2 flex items-center justify-between gap-2">
                      <dt className="text-slate-500">ইমেইল</dt>
                      <dd className="text-slate-700 font-sans truncate">{member.email}</dd>
                    </div>
                  )}
                </dl>

                {isChairman && (
                  <Link
                    to="/about/chairman-message"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors"
                  >
                    <span>সভাপতির পূর্ণাঙ্গ বাণী পড়ুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {isSecretary && (
                  <Link
                    to="/about/head-teacher-message"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#142054] rounded-lg transition-colors"
                  >
                    <span>প্রধান শিক্ষকের পূর্ণাঙ্গ বাণী পড়ুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* Main Bio & Governance Responsibilities */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="pb-4 border-b border-slate-100">
                <p className="text-xs font-semibold text-[#1F7A4D]">পরিচিতি ও প্রাতিষ্ঠানিক ভূমিকা</p>
                <h2 className="text-xl font-bold text-[#1B2A6B] mt-0.5">{member.nameBn}</h2>
              </div>

              <p className="text-sm sm:text-[15px] text-slate-700 leading-[1.85]">{member.bioBn}</p>

              {member.quoteBn && (
                <blockquote className="bg-[#F7F8FC] border border-slate-200 rounded-xl p-5 flex items-start gap-3">
                  <Quote className="w-5 h-5 text-[#C9A961] shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-[#1B2A6B] italic leading-relaxed">
                    “{member.quoteBn.replace(/^[“"]+|[”"]+$/g, '')}”
                  </p>
                </blockquote>
              )}

              {member.responsibilities && member.responsibilities.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-[#1B2A6B]">পর্ষদে মূল দায়িত্ব ও তদারকি</h3>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    {member.responsibilities.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F7F8FC] border border-slate-100"
                      >
                        <Award className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Other Managing Committee Members Quick Switcher */}
        <section className="pt-4 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1B2A6B] inline-flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1F7A4D]" aria-hidden="true" />
              <span>পরিচালনা পর্ষদের অন্যান্য সদস্যবৃন্দ</span>
            </h2>
            <Link
              to="/about/management-committee"
              className="text-xs font-medium text-[#1F7A4D] hover:underline"
            >
              সকল সদস্য দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherMembers.slice(0, 4).map((m) => (
              <Link
                key={m.id}
                to={`/about/management-committee/${m.id}`}
                className="group bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-4 flex items-center gap-3 transition-colors"
              >
                <SafeImage
                  src={m.photoUrl || SCHOOL_INFO.assets.committeeGuardianMale}
                  alt={m.nameBn}
                  className="w-12 h-12 rounded-lg object-cover object-top shrink-0 border border-slate-200"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] truncate">
                    {m.nameBn}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{m.roleBn}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
