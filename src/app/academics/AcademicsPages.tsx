import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Library,
  Printer,
  Search,
  ShieldCheck,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { NoticePrintModal, OfficialNoticePaper } from '../../components/shared/NoticePrintModal';
import { PrintDocumentView } from '../../components/shared/PrintDocumentView';
import { SCHOOL_INFO } from '../../config/school';
import {
  CURRICULUM_STREAMS,
  LIBRARY_CATEGORIES,
  ROUTINE_CLASS_OPTIONS,
  ROUTINE_PERIODS_AFTER_BREAK,
  ROUTINE_PERIODS_BEFORE_BREAK,
  ROUTINE_SECTION_OPTIONS,
  SMART_SYLLABUS_CATALOG,
  SYLLABUS_EXAM_TERMS,
  SYLLABUS_GROUPS,
  filterLibraryBooks,
  filterSyllabusItems,
  getWeeklyRoutineMatrix,
  type LibraryBook,
  type LibraryCategory,
  type SyllabusExamTerm,
  type SyllabusGroup,
} from '../../data/academicCatalog';
import { useSchoolStore } from '../../store/SchoolStore';
import { downloadNoticeFile } from '../../utils/downloadNotice';
import {
  computeMeritPositions,
  filterPublishedResults,
  toBanglaNumber,
} from '../../utils/grading';
import {
  NOTICE_TABS,
  filterNoticesByTabAndQuery,
  formatBanglaCalendarTile,
  getNoticeCategoryBn,
  getNoticeMemoNo,
  type NoticeTabKey,
} from '../../utils/noticeUtils';
import { printElementById } from '../../utils/printDocument';
import type { Notice } from '../../types';

// ---------------------------------------------------------------------------
// 1. SMART FULL-WEEK CLASS ROUTINE MATRIX
// ---------------------------------------------------------------------------

export function ClassRoutinePage() {
  const { db, addToast } = useSchoolStore();
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedSection, setSelectedSection] = useState<string>('A (পদ্মা)');
  const [teacherHighlight, setTeacherHighlight] = useState<string>('All');

  const matrix = useMemo(
    () => getWeeklyRoutineMatrix(selectedClass, selectedSection, db.routines),
    [selectedClass, selectedSection, db.routines]
  );

  const uniqueTeachers = useMemo(() => {
    const set = new Set<string>();
    matrix.forEach((row) => {
      [...row.beforeBreak, ...row.afterBreak].forEach((c) => set.add(c.teacherBn));
    });
    return Array.from(set);
  }, [matrix]);

  const classLabel =
    ROUTINE_CLASS_OPTIONS.find((c) => c.value === selectedClass)?.labelBn || selectedClass;
  const sectionLabel =
    ROUTINE_SECTION_OPTIONS.find((s) => s.value === selectedSection)?.labelBn || selectedSection;

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="সাপ্তাহিক পাঠদান সময়সূচি · শিক্ষাবর্ষ ২০২৬"
        title="স্মার্ট ক্লাস রুটিন"
        titleBn="Weekly Class Routine & Period Timetable"
        description="শ্রেণি ও শাখা নির্বাচন করে রবিবার থেকে বৃহস্পতিবার পর্যন্ত ৬ পিরিয়ড ও টিফিন বিরতিসহ সম্পূর্ণ সাপ্তাহিক ক্লাস রুটিন দেখুন এবং প্রিন্ট করুন।"
        actions={
          <button
            type="button"
            onClick={() => {
              printElementById(
                'bhs-class-routine-sheet',
                `ক্লাস রুটিন — ${classLabel} (${sectionLabel})`
              );
              addToast('success', 'ক্লাস রুটিন প্রিন্ট প্রিভিউ খোলা হয়েছে।');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
          >
            <Printer className="w-4 h-4" />
            <span>রুটিন প্রিন্ট করুন</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Smart Filter Bar */}
        <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 font-bn">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <p className="text-xs font-semibold text-slate-600 mb-2">শ্রেণি নির্বাচন করুন</p>
              <div className="flex flex-wrap gap-2">
                {ROUTINE_CLASS_OPTIONS.map((cls) => (
                  <button
                    key={cls.value}
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls.value);
                      setTeacherHighlight('All');
                    }}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      selectedClass === cls.value
                        ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                        : 'bg-[#F7F8FC] text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {cls.labelBn}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-4">
              <label htmlFor="routine-section" className="block text-xs font-semibold text-slate-600 mb-2">
                শাখা / ধারা নির্বাচন
              </label>
              <select
                id="routine-section"
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setTeacherHighlight('All');
                }}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              >
                {ROUTINE_SECTION_OPTIONS.map((sec) => (
                  <option key={sec.value} value={sec.value}>
                    {sec.labelBn}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="routine-teacher" className="block text-xs font-semibold text-slate-600 mb-2">
                শিক্ষক হাইলাইট করুন (ঐচ্ছিক)
              </label>
              <select
                id="routine-teacher"
                value={teacherHighlight}
                onChange={(e) => setTeacherHighlight(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              >
                <option value="All">সকল শিক্ষক</option>
                {uniqueTeachers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Printable Weekly Timetable Matrix */}
        <article
          id="bhs-class-routine-sheet"
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs font-bn"
        >
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-[#1B2A6B] to-[#1F7A4D] text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={SCHOOL_INFO.assets.logo}
                alt={SCHOOL_INFO.nameBn}
                className="w-11 h-11 bg-white rounded-lg p-1 object-contain"
              />
              <div>
                <h2 className="text-base sm:text-lg font-bold">
                  {classLabel} · {sectionLabel} — সাপ্তাহিক ক্লাস রুটিন
                </h2>
                <p className="text-xs text-white/85">
                  {SCHOOL_INFO.nameBn} · প্রাত্যহিক সমাবেশ: সকাল ৯:৪৫ – ১০:০০ · ক্লাস শুরু: সকাল ১০:০০
                </p>
              </div>
            </div>
            <div className="text-xs bg-white/15 px-3 py-1.5 rounded-lg tabular-nums">
              কার্যকর: শিক্ষাবর্ষ ২০২৬ · সাপ্তাহিক পিরিয়ড: ৩০টি
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-[13px] border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-[#F7F8FC] text-[#1B2A6B] border-b border-slate-200">
                  <th className="py-3.5 px-4 text-left font-bold border-r border-slate-200 w-28">
                    বার / সময়
                  </th>
                  {ROUTINE_PERIODS_BEFORE_BREAK.map((p) => (
                    <th key={p.periodNo} className="py-3 px-3 text-center border-r border-slate-200">
                      <p className="font-bold text-[#1B2A6B]">{p.labelBn}</p>
                      <p className="text-[11px] font-medium text-slate-500 tabular-nums mt-0.5">{p.timeBn}</p>
                    </th>
                  ))}
                  <th className="py-3 px-2.5 text-center bg-amber-50/70 text-amber-900 border-r border-slate-200 w-24">
                    <p className="font-bold">বিরতি</p>
                    <p className="text-[10px] tabular-nums mt-0.5">০১:০০–০১:৪৫</p>
                  </th>
                  {ROUTINE_PERIODS_AFTER_BREAK.map((p) => (
                    <th key={p.periodNo} className="py-3 px-3 text-center border-r border-slate-200 last:border-r-0">
                      <p className="font-bold text-[#1B2A6B]">{p.labelBn}</p>
                      <p className="text-[11px] font-medium text-slate-500 tabular-nums mt-0.5">{p.timeBn}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {matrix.map((row, rowIdx) => (
                  <tr key={row.dayEn} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-[#1B2A6B] bg-[#F7F8FC]/60 border-r border-slate-200">
                      <p>{row.dayBn}</p>
                      <p className="text-[11px] font-normal text-slate-500 font-sans">{row.dayEn}</p>
                    </td>

                    {row.beforeBreak.map((cell, idx) => {
                      const highlighted = teacherHighlight !== 'All' && cell.teacherBn === teacherHighlight;
                      const dimmed = teacherHighlight !== 'All' && cell.teacherBn !== teacherHighlight;
                      return (
                        <td
                          key={`${row.dayEn}-b-${idx}`}
                          className={`p-3 border-r border-slate-200 align-top transition-opacity ${
                            highlighted
                              ? 'bg-emerald-50 ring-1 ring-inset ring-[#1F7A4D]'
                              : cell.isLab
                              ? 'bg-indigo-50/30'
                              : ''
                          } ${dimmed ? 'opacity-35' : ''}`}
                        >
                          <p className="font-semibold text-[#1B2A6B] leading-snug">{cell.subjectBn}</p>
                          <p className="text-[11px] text-slate-600 mt-1">{cell.teacherBn}</p>
                          <p className="text-[10px] font-medium text-[#1F7A4D] mt-0.5">{cell.roomBn}</p>
                        </td>
                      );
                    })}

                    {rowIdx === 0 && (
                      <td
                        rowSpan={matrix.length}
                        className="bg-amber-50/60 border-r border-slate-200 text-center align-middle px-2"
                      >
                        <div className="space-y-1 text-amber-900">
                          <Clock className="w-4 h-4 mx-auto text-amber-700" />
                          <p className="text-xs font-bold leading-snug">টিফিন ও নামাজ বিরতি</p>
                          <p className="text-[10px] tabular-nums">৪৫ মিনিট</p>
                        </div>
                      </td>
                    )}

                    {row.afterBreak.map((cell, idx) => {
                      const highlighted = teacherHighlight !== 'All' && cell.teacherBn === teacherHighlight;
                      const dimmed = teacherHighlight !== 'All' && cell.teacherBn !== teacherHighlight;
                      return (
                        <td
                          key={`${row.dayEn}-a-${idx}`}
                          className={`p-3 border-r border-slate-200 last:border-r-0 align-top transition-opacity ${
                            highlighted
                              ? 'bg-emerald-50 ring-1 ring-inset ring-[#1F7A4D]'
                              : cell.isLab
                              ? 'bg-indigo-50/30'
                              : ''
                          } ${dimmed ? 'opacity-35' : ''}`}
                        >
                          <p className="font-semibold text-[#1B2A6B] leading-snug">{cell.subjectBn}</p>
                          <p className="text-[11px] text-slate-600 mt-1">{cell.teacherBn}</p>
                          <p className="text-[10px] font-medium text-[#1F7A4D] mt-0.5">{cell.roomBn}</p>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3.5 bg-[#F7F8FC] border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>বিঃদ্রঃ প্রতি বৃহস্পতিবার ৬ষ্ঠ পিরিয়ডে সহশিক্ষা কার্যক্রম (বিতর্ক, স্কাউট ও সাংস্কৃতিক অনুশীলন) পরিচালিত হয়।</span>
            <span className="font-semibold text-[#1B2A6B]">প্রধান শিক্ষক · {SCHOOL_INFO.shortName}</span>
          </div>
        </article>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. SMART SYLLABUS PAGE (Exact 3-Level Smart Filters)
// শ্রেণি নির্বাচন করুন · বিভাগ (৯ম–১০ম) · পরীক্ষার পর্ব
// ---------------------------------------------------------------------------

export function SyllabusPage() {
  const { db, addToast } = useSchoolStore();
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedGroup, setSelectedGroup] = useState<SyllabusGroup>('সকল বিভাগ');
  const [selectedTerm, setSelectedTerm] = useState<SyllabusExamTerm | 'সকল পর্ব'>('সকল পর্ব');
  const [searchQuery, setSearchQuery] = useState('');

  const isSenior = selectedClass === 'Class 9' || selectedClass === 'Class 10';

  const mergedCatalog = useMemo(() => {
    const portalSyllabi = db.syllabus.map((s) => ({
      id: `portal-${s.id}`,
      className: s.className,
      classLabelBn: ROUTINE_CLASS_OPTIONS.find((c) => c.value === s.className)?.labelBn || s.className,
      group: 'সকল বিভাগ' as SyllabusGroup,
      examTerm: (s.term.includes('Annual') || s.term.includes('বার্ষিক')
        ? 'বার্ষিক পরীক্ষা'
        : s.term.includes('Test') || s.term.includes('নির্বাচনি')
        ? 'নির্বাচনি (এসএসসি)'
        : 'অর্ধবার্ষিক পরীক্ষা') as SyllabusExamTerm,
      subjectCode: 'BUTPHS',
      subjectNameBn: s.subject,
      subjectNameEn: s.subject,
      fullMarks: 100,
      marksBreakdownBn: 'সাধারণ মাধ্যমিক ধারা · অফিসিয়াল সিলেবাস',
      chaptersBn: [s.topics],
      teacherNoteBn: `প্রকাশক: বিদ্যালয় একাডেমিক ডেস্ক (${s.term})`,
      updatedAtBn: `আপডেট: ${s.updatedAt}`,
    }));
    return [...portalSyllabi, ...SMART_SYLLABUS_CATALOG];
  }, [db.syllabus]);

  const items = useMemo(
    () =>
      filterSyllabusItems(mergedCatalog, {
        className: selectedClass,
        group: isSenior ? selectedGroup : 'সকল বিভাগ',
        examTerm: selectedTerm,
        query: searchQuery,
      }),
    [mergedCatalog, selectedClass, isSenior, selectedGroup, selectedTerm, searchQuery]
  );

  const classLabel =
    ROUTINE_CLASS_OPTIONS.find((c) => c.value === selectedClass)?.labelBn || selectedClass;

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="পাঠ্যসূচি ও পরীক্ষার প্রস্তুতি · জাতীয় শিক্ষাক্রম (NCTB)"
        title="স্মার্ট সিলেবাস ও পাঠ্যসূচি"
        titleBn="Smart Syllabus & Exam Chapter Outline"
        description="শ্রেণি, বিভাগ (৯ম–১০ম) এবং পরীক্ষার পর্ব নির্বাচন করে বিষয়ভিত্তিক অধ্যায়, মানবণ্টন ও শিক্ষকের দিকনির্দেশনা দেখুন।"
        actions={
          <button
            type="button"
            onClick={() => {
              printElementById('bhs-syllabus-sheet', `সিলেবাস — ${classLabel}`);
              addToast('success', 'সিলেবাস প্রিন্ট প্রিভিউ খোলা হয়েছে।');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
          >
            <Printer className="w-4 h-4" />
            <span>সিলেবাস প্রিন্ট করুন</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Exact 3 Smart Filter Controls */}
        <section
          aria-label="সিলেবাস ফিল্টার"
          className="no-print bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 font-bn"
        >
          {/* Row 1: শ্রেণি নির্বাচন করুন */}
          <div>
            <p className="text-xs font-bold text-[#1B2A6B] mb-2.5">১. শ্রেণি নির্বাচন করুন</p>
            <div className="flex flex-wrap gap-2">
              {ROUTINE_CLASS_OPTIONS.map((cls) => (
                <button
                  key={cls.value}
                  type="button"
                  onClick={() => {
                    setSelectedClass(cls.value);
                    if (cls.value !== 'Class 9' && cls.value !== 'Class 10') {
                      setSelectedGroup('সকল বিভাগ');
                    }
                  }}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                    selectedClass === cls.value
                      ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                      : 'bg-[#F7F8FC] text-slate-700 border-slate-200 hover:bg-white'
                  }`}
                >
                  {cls.labelBn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-slate-100">
            {/* Row 2A: বিভাগ (৯ম–১০ম) */}
            <div className="lg:col-span-5">
              <p className="text-xs font-bold text-[#1B2A6B] mb-2">
                ২. বিভাগ (৯ম–১০ম) {!isSenior && <span className="font-normal text-slate-400">· ৬ষ্ঠ–৮ম সাধারণ ধারা</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {SYLLABUS_GROUPS.map((grp) => {
                  const disabled = !isSenior && grp !== 'সকল বিভাগ';
                  return (
                    <button
                      key={grp}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedGroup(grp)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedGroup === grp
                          ? 'bg-[#1F7A4D] text-white border-[#1F7A4D]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2B: পরীক্ষার পর্ব */}
            <div className="lg:col-span-4">
              <p className="text-xs font-bold text-[#1B2A6B] mb-2">৩. পরীক্ষার পর্ব</p>
              <div className="flex flex-wrap gap-2">
                {(['সকল পর্ব', ...SYLLABUS_EXAM_TERMS] as const).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSelectedTerm(term)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      selectedTerm === term
                        ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-3">
              <label htmlFor="syllabus-search" className="block text-xs font-bold text-[#1B2A6B] mb-2">
                বিষয় বা অধ্যায় খুঁজুন
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="syllabus-search"
                  type="text"
                  placeholder="যেমন: গণিত, পদার্থ, ICT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Printable Syllabus Cards */}
        <section id="bhs-syllabus-sheet" className="space-y-4 font-bn">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-600 px-1">
            <span>
              প্রদর্শিত সিলেবাস: <strong className="text-[#1B2A6B]">{classLabel}</strong> ·{' '}
              <strong className="text-[#1F7A4D]">{isSenior ? selectedGroup : 'সাধারণ ধারা'}</strong> ·{' '}
              <span>{selectedTerm}</span>
            </span>
            <span className="tabular-nums font-medium">মোট {toBanglaNumber(items.length)}টি বিষয়</span>
          </div>

          {items.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-[#1B2A6B]">নির্বাচিত ফিল্টারে কোনো সিলেবাস পাওয়া যায়নি</p>
              <p className="text-xs text-slate-500">অনুগ্রহ করে “সকল পর্ব” বা অন্য পরীক্ষার পর্ব নির্বাচন করে দেখুন।</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedGroup('সকল বিভাগ');
                  setSelectedTerm('সকল পর্ব');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] rounded-lg cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-[#1F7A4D]">
                        {item.examTerm} · {item.group} · কোড {item.subjectCode}
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-[#1B2A6B] mt-0.5">
                        {item.subjectNameBn}
                      </h3>
                      <p className="text-xs text-slate-500 font-sans">{item.subjectNameEn}</p>
                    </div>
                    <div className="text-right shrink-0 bg-[#F7F8FC] border border-slate-200 rounded-lg px-3 py-1.5">
                      <p className="text-[11px] text-slate-500">পূর্ণমান</p>
                      <p className="text-sm font-bold text-[#1B2A6B] tabular-nums">{toBanglaNumber(item.fullMarks)}</p>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                    মানবণ্টন: <span className="font-semibold text-[#1B2A6B]">{item.marksBreakdownBn}</span>
                  </p>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-800">নির্ধারিত অধ্যায় ও পাঠ্যসূচি:</p>
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {item.chaptersBn.map((ch) => (
                        <li key={ch} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
                          <span>{ch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="text-slate-600">{item.teacherNoteBn}</span>
                    <span className="shrink-0 text-[11px]">{item.updatedAtBn}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. SMART ACADEMIC CURRICULUM PAGE
// ---------------------------------------------------------------------------

export function CurriculumPage() {
  const { addToast } = useSchoolStore();
  const [activeStreamId, setActiveStreamId] = useState<string>(CURRICULUM_STREAMS[0].id);

  const activeStream =
    CURRICULUM_STREAMS.find((s) => s.id === activeStreamId) || CURRICULUM_STREAMS[0];

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)"
        title="একাডেমিক কারিকুলাম ও বিভাগসমূহ"
        titleBn="Academic Curriculum & Subject Structure"
        description="নিম্ন মাধ্যমিক (৬ষ্ঠ–৮ম) থেকে মাধ্যমিক বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বিভাগের পূর্ণাঙ্গ বিষয় কাঠামো ও মূল্যায়ন পদ্ধতি।"
        actions={
          <button
            type="button"
            onClick={() => {
              printElementById('bhs-curriculum-sheet', `একাডেমিক কারিকুলাম — ${activeStream.titleBn}`);
              addToast('success', 'কারিকুলাম প্রিন্ট প্রিভিউ খোলা হয়েছে।');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
          >
            <Printer className="w-4 h-4" />
            <span>কারিকুলাম প্রিন্ট করুন</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-bn">
        {/* Stream Selector Tabs */}
        <div className="no-print flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          {CURRICULUM_STREAMS.map((stream) => (
            <button
              key={stream.id}
              type="button"
              onClick={() => setActiveStreamId(stream.id)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                activeStream.id === stream.id
                  ? 'bg-[#1B2A6B] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {stream.tabLabelBn}
            </button>
          ))}
        </div>

        {/* Active Stream Detail Sheet */}
        <article
          id="bhs-curriculum-sheet"
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
        >
          <div className="p-6 sm:p-8 border-b border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <p className="text-xs font-semibold text-[#1F7A4D]">{activeStream.gradesBn}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1B2A6B]">{activeStream.titleBn}</h2>
              <p className="text-xs text-slate-500 font-sans">{activeStream.titleEn}</p>
              <p className="text-sm text-slate-700 leading-relaxed pt-1">{activeStream.summaryBn}</p>
            </div>
            <div className="lg:col-span-4 bg-[#F7F8FC] border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">সাপ্তাহিক মোট ক্লাস</span>
                <span className="font-bold text-[#1B2A6B] tabular-nums">{toBanglaNumber(activeStream.weeklyPeriods)} পিরিয়ড</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="font-semibold text-[#1F7A4D]">ব্যবহারিক ও ল্যাব কার্যক্রম:</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{activeStream.practicalFocusBn}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#F7F8FC] text-[#1B2A6B] border-b border-slate-200">
                  <th className="py-3.5 px-6 font-semibold">বিষয় কোড</th>
                  <th className="py-3.5 px-4 font-semibold">বিষয়ের নাম</th>
                  <th className="py-3.5 px-4 font-semibold">বিষয়ের ধরন</th>
                  <th className="py-3.5 px-4 font-semibold text-right">পূর্ণমান</th>
                  <th className="py-3.5 px-6 font-semibold text-right">সাপ্তাহিক পিরিয়ড</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeStream.subjects.map((sub) => (
                  <tr key={`${activeStream.id}-${sub.code}`} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6 font-semibold text-slate-600 tabular-nums">{sub.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1B2A6B]">{sub.nameBn}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold ${
                          sub.type === 'বিভাগীয়'
                            ? 'text-[#1F7A4D]'
                            : 'text-slate-600'
                        }`}
                      >
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-medium">{toBanglaNumber(sub.marks)}</td>
                    <td className="py-3.5 px-6 text-right tabular-nums font-semibold text-[#1B2A6B]">
                      {toBanglaNumber(sub.periodsPerWeek)}টি
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* NCTB 5.00 GPA Grading Scale Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#1B2A6B] mb-3">
            জাতীয় শিক্ষাক্রম অনুযায়ী মূল্যায়ন ও গ্রেডিং পদ্ধতি (৫.০০ স্কেল)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {[
              { range: '৮০–১০০%', grade: 'A+', gp: '5.00' },
              { range: '৭০–৭৯%', grade: 'A', gp: '4.00' },
              { range: '৬০–৬৯%', grade: 'A-', gp: '3.50' },
              { range: '৫০–৫৯%', grade: 'B', gp: '3.00' },
              { range: '৪০–৪৯%', grade: 'C', gp: '2.00' },
              { range: '৩৩–৩৯%', grade: 'D', gp: '1.00' },
              { range: '০০–৩২%', grade: 'F', gp: '0.00' },
            ].map((g) => (
              <div key={g.grade} className="bg-[#F7F8FC] border border-slate-200 rounded-xl p-3">
                <p className="text-base font-bold text-[#1B2A6B] font-sans">{g.grade}</p>
                <p className="text-xs font-semibold text-[#1F7A4D] tabular-nums">GPA {g.gp}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{g.range}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. NOTICES ARCHIVE & STANDALONE PRINTABLE NOTICE PAGE
// ---------------------------------------------------------------------------

export function NoticesPage() {
  const { db, addToast } = useSchoolStore();
  const [activeTab, setActiveTab] = useState<NoticeTabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewNotice, setPreviewNotice] = useState<Notice | null>(null);

  const headTeacher = db.teachers.find((t) => t.designation.includes('Head Teacher'));
  const filteredNotices = useMemo(
    () => filterNoticesByTabAndQuery(db.notices, activeTab, searchQuery),
    [db.notices, activeTab, searchQuery]
  );

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="অফিসিয়াল ডিজিটাল নোটিশ বোর্ড"
        title="প্রাতিষ্ঠানিক বিজ্ঞপ্তি ও নোটিশ"
        titleBn="Official Notices & Circulars Archive"
        description="বিদ্যালয়ের পরীক্ষা, ভর্তি, ছুটি ও একাডেমিক সকল অফিসিয়াল বিজ্ঞপ্তি অনুসন্ধান করুন, প্রিন্ট ফরম্যাটে দেখুন ও ডাউনলোড করুন।"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-bn">
        {/* Filter Tabs + Search */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {NOTICE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                    : 'bg-[#F7F8FC] text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                {tab.labelBn}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              aria-label="নোটিশ অনুসন্ধান করুন"
              type="text"
              placeholder="বিজ্ঞপ্তি বা স্মারক নং খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#1F7A4D]"
            />
          </div>
        </div>

        {/* Notice List */}
        {filteredNotices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <p className="text-base font-semibold text-[#1B2A6B]">কোনো বিজ্ঞপ্তি পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500">অন্য বিভাগ নির্বাচন করুন বা অনুসন্ধান শব্দ পরিবর্তন করুন।</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-xs overflow-hidden">
            {filteredNotices.map((notice, idx) => {
              const tile = formatBanglaCalendarTile(notice.date);
              const memoNo = getNoticeMemoNo(notice, idx + 1);
              return (
                <article
                  key={notice.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-[#1B2A6B] text-white flex flex-col items-center justify-center shrink-0">
                      <span className="text-xl font-bold leading-none tabular-nums">{tile.dayBn}</span>
                      <span className="text-[11px] mt-1 opacity-90">{tile.monthBn}</span>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {notice.isUrgent && (
                          <span className="font-bold text-red-700">জরুরি বিজ্ঞপ্তি ·</span>
                        )}
                        <span className="font-semibold text-[#1F7A4D]">
                          {getNoticeCategoryBn(notice.category)}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 tabular-nums">{memoNo}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-[#1B2A6B] leading-snug">
                        <button
                          type="button"
                          onClick={() => setPreviewNotice(notice)}
                          className="text-left hover:text-[#1F7A4D] transition-colors cursor-pointer"
                        >
                          {notice.titleBn}
                        </button>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">{notice.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 sm:self-center">
                    <button
                      type="button"
                      onClick={() => setPreviewNotice(notice)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#142054] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>দেখুন ও প্রিন্ট</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`${notice.titleBn} ডাউনলোড`}
                      onClick={() => {
                        downloadNoticeFile(notice);
                        addToast('success', 'অফিসিয়াল নোটিশ কপি ডাউনলোড হয়েছে।');
                      }}
                      className="inline-flex items-center justify-center w-9 h-9 text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <NoticePrintModal
        notice={previewNotice}
        onClose={() => setPreviewNotice(null)}
        headTeacherName={headTeacher?.nameBn || 'মোঃ আব্দুর রাজ্জাক'}
        onDownloadNotify={() => addToast('success', 'অফিসিয়াল নোটিশ কপি ডাউনলোড হয়েছে।')}
      />
    </div>
  );
}

export function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db, addToast } = useSchoolStore();
  const notice = db.notices.find((n) => n.id === id);
  const headTeacher = db.teachers.find((t) => t.designation.includes('Head Teacher'));

  if (!notice) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 font-bn">
        <h1 className="text-xl font-bold text-[#1B2A6B]">বিজ্ঞপ্তিটি খুঁজে পাওয়া যায়নি</h1>
        <Link
          to="/academics/notices"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1F7A4D] rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সকল নোটিশে ফিরে যান</span>
        </Link>
      </div>
    );
  }

  const memoNo = getNoticeMemoNo(notice);
  const dateTile = formatBanglaCalendarTile(notice.date);

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <div className="no-print">
        <PageHeader
          kicker={`স্মারক নং: ${memoNo} · ${dateTile.fullBn}`}
          title={notice.titleBn}
          description={notice.title}
          actions={
            <>
              <Link
                to="/academics/notices"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-bn"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>সকল নোটিশ</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  downloadNoticeFile(notice);
                  addToast('success', 'অফিসিয়াল নোটিশ কপি ডাউনলোড হয়েছে।');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
              >
                <Download className="w-4 h-4" />
                <span>ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  printElementById('standalone-notice-paper', `${notice.titleBn} — ${SCHOOL_INFO.nameBn}`);
                  addToast('success', 'নোটিশ প্রিন্ট প্রিভিউ খোলা হয়েছে।');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1B2A6B] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer font-bn"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>
            </>
          }
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <OfficialNoticePaper
          paperId="standalone-notice-paper"
          notice={notice}
          headTeacherName={headTeacher?.nameBn || 'মোঃ আব্দুর রাজ্জাক'}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. SMART ACADEMIC CALENDAR 2026
// ---------------------------------------------------------------------------

interface CalendarEventItem {
  id: string;
  dateIso: string;
  monthBn: string;
  titleBn: string;
  titleEn: string;
  category: 'পরীক্ষা' | 'জাতীয় দিবস ও ছুটি' | 'সহশিক্ষা ও অনুষ্ঠান' | 'একাডেমিক';
  detailsBn: string;
}

const CALENDAR_EVENTS_2026: CalendarEventItem[] = [
  { id: 'cal-1', dateIso: '2026-01-01', monthBn: 'জানুয়ারি ২০২৬', titleBn: 'বই উৎসব ও নতুন শিক্ষাবর্ষের ক্লাস শুরু', titleEn: 'Textbook Festival & New Session', category: 'একাডেমিক', detailsBn: 'সকল শ্রেণির শিক্ষার্থীদের মাঝে বিনামূল্যে নতুন পাঠ্যবই বিতরণ ও প্রাত্যহিক সমাবেশ।' },
  { id: 'cal-2', dateIso: '2026-02-05', monthBn: 'ফেব্রুয়ারি ২০২৬', titleBn: 'বার্ষিক ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতা', titleEn: 'Annual Sports & Cultural Week', category: 'সহশিক্ষা ও অনুষ্ঠান', detailsBn: '৩ দিনব্যাপী আন্তঃহাউস ক্রীড়া, অ্যাথলেটিক্স ও পুরস্কার বিতরণী অনুষ্ঠান।' },
  { id: 'cal-3', dateIso: '2026-02-21', monthBn: 'ফেব্রুয়ারি ২০২৬', titleBn: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস', titleEn: 'International Mother Language Day', category: 'জাতীয় দিবস ও ছুটি', detailsBn: 'প্রভাতফেরি, শহীদ মিনারে পুষ্পস্তবক অর্পণ, আলোচনা ও আবৃত্তি প্রতিযোগিতা।' },
  { id: 'cal-4', dateIso: '2026-03-26', monthBn: 'মার্চ ২০২৬', titleBn: 'মহান স্বাধীনতা ও জাতীয় দিবস উদযাপন', titleEn: 'Independence & National Day', category: 'জাতীয় দিবস ও ছুটি', detailsBn: 'জাতীয় পতাকা উত্তোলন, কুচকাওয়াজ, রচনা ও চিত্রাঙ্কন প্রতিযোগিতা।' },
  { id: 'cal-5', dateIso: '2026-06-14', monthBn: 'জুন ২০২৬', titleBn: 'অর্ধবার্ষিক পরীক্ষা ২০২৬ আরম্ভ', titleEn: 'Half-Yearly Examination Begins', category: 'পরীক্ষা', detailsBn: '৬ষ্ঠ থেকে ১০ম শ্রেণির অর্ধবার্ষিক ও প্রাক-নির্বাচনী পরীক্ষা (১৪–২৮ জুন)।' },
  { id: 'cal-6', dateIso: '2026-07-12', monthBn: 'জুলাই ২০২৬', titleBn: 'অর্ধবার্ষিক ফলাফল প্রকাশ ও অভিভাবক সভা', titleEn: 'Half-Yearly Result & Guardian Meeting', category: 'একাডেমিক', detailsBn: 'অভিভাবকদের উপস্থিতিতে ফলাফল পর্যালোচনা ও দুর্বল শিক্ষার্থীদের বিশেষ পরিকল্পনা।' },
  { id: 'cal-7', dateIso: '2026-08-20', monthBn: 'আগস্ট ২০২৬', titleBn: 'বিজ্ঞান মেলা ও দেয়ালিকা “কিশলয়” প্রকাশনা', titleEn: 'Science Fair & Wall Magazine', category: 'সহশিক্ষা ও অনুষ্ঠান', detailsBn: 'শিক্ষার্থীদের উদ্ভাবনী বিজ্ঞান প্রজেক্ট প্রদর্শনী ও সাহিত্য দেয়ালিকা উন্মোচন।' },
  { id: 'cal-8', dateIso: '2026-10-04', monthBn: 'অক্টোবর ২০২৬', titleBn: 'এসএসসি নির্বাচনি ও ২য় সাময়িক পরীক্ষা', titleEn: 'SSC Pre-Test & Second Term Exam', category: 'পরীক্ষা', detailsBn: '১০ম শ্রেণির নির্বাচনি পরীক্ষা ও অন্যান্য শ্রেণির ২য় সাময়িক মূল্যায়ন।' },
  { id: 'cal-9', dateIso: '2026-11-15', monthBn: 'নভেম্বর ২০২৬', titleBn: '২০২৭ শিক্ষাবর্ষের অনলাইন ভর্তি আবেদন শুরু', titleEn: 'Session 2027 Online Admission Opens', category: 'একাডেমিক', detailsBn: '৬ষ্ঠ–৯ম শ্রেণিতে অনলাইন ও অফিস ফরম বিতরণ শুরু।' },
  { id: 'cal-10', dateIso: '2026-12-02', monthBn: 'ডিসেম্বর ২০২৬', titleBn: 'বার্ষিক পরীক্ষা ২০২৬ (৬ষ্ঠ–৯ম শ্রেণি)', titleEn: 'Annual Examination 2026', category: 'পরীক্ষা', detailsBn: 'নির্ধারিত সময়সূচি অনুযায়ী সকল শ্রেণির বার্ষিক চূড়ান্ত পরীক্ষা।' },
  { id: 'cal-11', dateIso: '2026-12-16', monthBn: 'ডিসেম্বর ২০২৬', titleBn: 'মহান বিজয় দিবস ও বার্ষিক পুরস্কার বিতরণ', titleEn: 'Victory Day Observance', category: 'জাতীয় দিবস ও ছুটি', detailsBn: 'জাতীয় পতাকা উত্তোলন, মুক্তিযোদ্ধা সংবর্ধনা ও সাংস্কৃতিক অনুষ্ঠান।' },
  { id: 'cal-12', dateIso: '2026-12-28', monthBn: 'ডিসেম্বর ২০২৬', titleBn: 'বার্ষিক পরীক্ষার চূড়ান্ত ফলাফল ও মেধাতালিকা প্রকাশ', titleEn: 'Annual Final Result Publication', category: 'একাডেমিক', detailsBn: 'অনলাইন পোর্টাল ও বিদ্যালয় প্রাঙ্গণে মেধাক্রমসহ ফলাফল প্রকাশ।' },
];

export function AcademicCalendarPage() {
  const { addToast } = useSchoolStore();
  const [catFilter, setCatFilter] = useState<'সকল' | CalendarEventItem['category']>('সকল');

  const filtered = useMemo(
    () => (catFilter === 'সকল' ? CALENDAR_EVENTS_2026 : CALENDAR_EVENTS_2026.filter((e) => e.category === catFilter)),
    [catFilter]
  );

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="শিক্ষাবর্ষ ২০২৬ · বাৎসরিক কর্মপরিকল্পনা"
        title="একাডেমিক ক্যালেন্ডার ২০২৬"
        titleBn="Annual Academic Calendar, Exams & Holidays"
        description="বিদ্যালয়ের সকল পরীক্ষা, সরকারি ও জাতীয় দিবস, ভর্তি কার্যক্রম এবং সহশিক্ষা অনুষ্ঠানের মাসভিত্তিক বাৎসরিক সূচি।"
        actions={
          <button
            type="button"
            onClick={() => {
              printElementById('bhs-calendar-sheet', 'একাডেমিক ক্যালেন্ডার ২০২৬ — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়');
              addToast('success', 'একাডেমিক ক্যালেন্ডার প্রিন্ট প্রিভিউ খোলা হয়েছে।');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
          >
            <Printer className="w-4 h-4" />
            <span>ক্যালেন্ডার প্রিন্ট করুন</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-bn">
        {/* Category Filter Bar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-wrap gap-2">
            {(['সকল', 'পরীক্ষা', 'একাডেমিক', 'জাতীয় দিবস ও ছুটি', 'সহশিক্ষা ও অনুষ্ঠান'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatFilter(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  catFilter === cat
                    ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                    : 'bg-[#F7F8FC] text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            মোট ইভেন্ট: {toBanglaNumber(filtered.length)}টি
          </span>
        </div>

        {/* Printable Calendar Grid */}
        <div id="bhs-calendar-sheet" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ev) => {
            const tile = formatBanglaCalendarTile(ev.dateIso);
            const accent =
              ev.category === 'পরীক্ষা'
                ? 'bg-[#1B2A6B] text-white'
                : ev.category === 'জাতীয় দিবস ও ছুটি'
                ? 'bg-[#1F7A4D] text-white'
                : ev.category === 'সহশিক্ষা ও অনুষ্ঠান'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-white';

            return (
              <article
                key={ev.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 shadow-xs"
              >
                <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 ${accent}`}>
                  <span className="text-xl font-bold leading-none tabular-nums">{tile.dayBn}</span>
                  <span className="text-[11px] mt-1 opacity-90">{tile.monthBn}</span>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-semibold text-[#1F7A4D]">{ev.category} · {ev.monthBn}</p>
                  <h3 className="text-sm sm:text-[15px] font-bold text-[#1B2A6B] leading-snug">{ev.titleBn}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.detailsBn}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. SMART PUBLIC RESULTS LOOKUP WITH MERIT POSITION (মেধাক্রম)
// ---------------------------------------------------------------------------

export function PublicResultsPage() {
  const { db } = useSchoolStore();
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedExamId, setSelectedExamId] = useState<string>('All');
  const [queryInput, setQueryInput] = useState<string>('');
  const [activeResultId, setActiveResultId] = useState<string | null>(null);

  const allPublished = useMemo(
    () => db.results.filter((r) => r.status === 'Published'),
    [db.results]
  );

  // Compute accurate merit positions per (examId, className)
  const meritMap = useMemo(() => computeMeritPositions(allPublished), [allPublished]);

  const filteredList = useMemo(() => {
    const q = queryInput.trim().toLowerCase();
    const base = filterPublishedResults(allPublished, {
      className: selectedClass,
      examId: selectedExamId,
    });
    const searched = q
      ? base.filter(
          (r) =>
            r.studentId.toLowerCase().includes(q) ||
            r.studentName.toLowerCase().includes(q) ||
            r.studentNameBn.toLowerCase().includes(q) ||
            String(r.roll) === q
        )
      : base;

    return [...searched].sort((a, b) => {
      const rankA = meritMap.get(a.id)?.rank ?? 999;
      const rankB = meritMap.get(b.id)?.rank ?? 999;
      return rankA - rankB;
    });
  }, [allPublished, selectedClass, selectedExamId, queryInput, meritMap]);

  const selectedResult = useMemo(() => {
    if (activeResultId) {
      return allPublished.find((r) => r.id === activeResultId) || filteredList[0] || null;
    }
    return filteredList[0] || null;
  }, [activeResultId, allPublished, filteredList]);

  const selectedStudent = selectedResult
    ? db.students.find((s) => s.studentId === selectedResult.studentId)
    : undefined;
  const selectedMerit = selectedResult ? meritMap.get(selectedResult.id) : undefined;

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="অনলাইন ফলাফল ও মেধাক্রম পোর্টাল"
        title="পাবলিক ফলাফল অনুসন্ধান"
        titleBn="Public Result Lookup & Merit Position"
        description="শ্রেণি, পরীক্ষা এবং শিক্ষার্থী আইডি বা রোল নম্বর দিয়ে প্রকাশিত নম্বরপত্র, জিপিএ এবং শ্রেণিতে অর্জিত মেধাক্রম (কততম স্থান) যাচাই ও প্রিন্ট করুন।"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-bn">
        {/* Smart Filter & Search Form */}
        <section
          aria-label="ফলাফল অনুসন্ধান ফিল্টার"
          className="no-print bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
              <label htmlFor="res-class" className="block text-xs font-semibold text-slate-700 mb-1.5">
                শ্রেণি নির্বাচন (Class)
              </label>
              <select
                id="res-class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setActiveResultId(null);
                }}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              >
                <option value="All">সকল শ্রেণি</option>
                {ROUTINE_CLASS_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.labelBn}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4">
              <label htmlFor="res-exam" className="block text-xs font-semibold text-slate-700 mb-1.5">
                পরীক্ষা নির্বাচন (Examination)
              </label>
              <select
                id="res-exam"
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setActiveResultId(null);
                }}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              >
                <option value="All">সকল প্রকাশিত পরীক্ষা</option>
                {db.exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.nameBn}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <label htmlFor="res-query" className="block text-xs font-semibold text-slate-700 mb-1.5">
                শিক্ষার্থী আইডি, রোল বা নাম দিয়ে খুঁজুন
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="res-query"
                  type="text"
                  placeholder="যেমন: BUTPHS-2026-101 অথবা রোল ১ অথবা আশরাফুল..."
                  value={queryInput}
                  onChange={(e) => {
                    setQueryInput(e.target.value);
                    setActiveResultId(null);
                  }}
                  className="w-full h-11 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                />
              </div>
            </div>
          </div>

          {/* Published Merit Leaderboard Quick Selector */}
          {filteredList.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-600 mb-2.5 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#C9A961]" />
                <span>প্রকাশিত মেধাতালিকা থেকে শিক্ষার্থী নির্বাচন করুন ({toBanglaNumber(filteredList.length)} জন):</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredList.map((item) => {
                  const m = meritMap.get(item.id);
                  const isActive = selectedResult?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveResultId(item.id)}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1B2A6B] text-white border-[#1B2A6B] shadow-xs'
                          : 'bg-[#F7F8FC] text-slate-800 border-slate-200 hover:bg-white hover:border-[#1F7A4D]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-[#1B2A6B]'}`}>
                          {item.studentNameBn}
                        </p>
                        <p className={`text-[11px] tabular-nums ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                          {item.studentId} · {item.className} · রোল {toBanglaNumber(item.roll)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-bold ${isActive ? 'text-[#C9A961]' : 'text-[#1F7A4D]'}`}>
                          {m?.rankBn || 'উত্তীর্ণ'}
                        </p>
                        <p className={`text-[11px] tabular-nums ${isActive ? 'text-white/85' : 'text-slate-600'}`}>
                          GPA {item.gpa.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Result Highlight + Printable A4 Marksheet */}
        {selectedResult ? (
          <div className="space-y-6">
            {/* Prominent Merit Position Banner */}
            <div className="no-print bg-gradient-to-r from-[#1B2A6B] to-[#1F7A4D] text-white rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-center shadow-sm">
              <div>
                <p className="text-xs text-white/75">শিক্ষার্থী ও পরীক্ষা</p>
                <p className="text-lg font-bold mt-0.5">{selectedResult.studentNameBn}</p>
                <p className="text-xs text-white/85 font-sans">
                  {selectedResult.studentId} · {selectedResult.examName}
                </p>
              </div>
              <div className="bg-white/12 rounded-xl px-4 py-3">
                <p className="text-xs text-white/80 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#C9A961]" />
                  <span>অর্জিত মেধাক্রম (Merit Position)</span>
                </p>
                <p className="text-2xl font-extrabold text-[#C9A961] mt-0.5">
                  {selectedMerit?.rankBn || 'যাচাইকৃত'}
                </p>
                {selectedMerit && (
                  <p className="text-[11px] text-white/80 tabular-nums">
                    {selectedResult.className}-এ প্রকাশিত {toBanglaNumber(selectedMerit.totalInGroup)} জনের মধ্যে
                  </p>
                )}
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-xs text-white/80">মোট প্রাপ্ত নম্বর</p>
                <p className="text-2xl font-bold tabular-nums mt-0.5">{toBanglaNumber(selectedResult.totalMarks)}</p>
                <p className="text-[11px] text-white/80">পূর্ণমান ৫০০-এর মধ্যে</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-xs text-white/80">সামগ্রিক ফলাফল ও জিপিএ</p>
                <p className="text-2xl font-bold tabular-nums mt-0.5">
                  GPA {selectedResult.gpa.toFixed(2)} ({selectedResult.overallGrade})
                </p>
                <p className="text-[11px] text-emerald-200 font-semibold">
                  {selectedResult.passed ? 'সফলভাবে উত্তীর্ণ (PASSED)' : 'অনুত্তীর্ণ (FAILED)'}
                </p>
              </div>
            </div>

            <PrintDocumentView
              docType="marksheet"
              student={selectedStudent}
              result={selectedResult}
              meritRankBn={selectedMerit?.rankBn}
              totalInClass={selectedMerit?.totalInGroup}
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
            <Award className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-base font-semibold text-[#1B2A6B]">কোনো প্রকাশিত ফলাফল পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500">
              শুধুমাত্র বিদ্যালয় প্রশাসন কর্তৃক চূড়ান্ত প্রকাশিত ফলাফল এখানে প্রদর্শিত হয়। অনুগ্রহ করে আইডি বা ফিল্টার পরিবর্তন করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. NEW PAGE: SCHOOL LIBRARY (গ্রন্থাগার / লাইব্রেরি)
// ---------------------------------------------------------------------------

export function SchoolLibraryPage() {
  const { db } = useSchoolStore();
  const [category, setCategory] = useState<LibraryCategory>('সকল বই');
  const [query, setQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);

  const books = useMemo(
    () => filterLibraryBooks(db.libraryBooks, { category, query, availableOnly }),
    [db.libraryBooks, category, query, availableOnly]
  );

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="কেন্দ্রীয় পাঠাগার · ডিজিটাল বই ক্যাটালগ"
        title="বিদ্যালয় গ্রন্থাগার (লাইব্রেরি)"
        titleBn="School Library & Digital Book Catalog"
        description="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের ৩,৫০০+ গ্রন্থসমৃদ্ধ কেন্দ্রীয় পাঠাগার। বইয়ের নাম, লেখক বা বিভাগ অনুযায়ী অনুসন্ধান করুন।"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-bn">
        {/* Library Hero Banner with Real Campus Library Photo */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[240px]">
            <img
              src={SCHOOL_INFO.assets.schoolLibrary}
              alt="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় গ্রন্থাগার"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#1F7A4D]">জ্ঞানচর্চা ও সৃজনশীল পাঠাভ্যাস কেন্দ্র</p>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1B2A6B]">
                সমৃদ্ধ পাঠাগার ও নিরিবিলি পাঠকক্ষ
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                মুক্তিযুদ্ধ কর্নার, বাংলা ও ইংরেজি চিরায়ত সাহিত্য, গণিত-বিজ্ঞান অলিম্পিয়াড সহায়ক, আইসিটি ও প্রোগ্রামিং গাইড এবং জাতীয় জ্ঞানকোষ নিয়ে আমাদের গ্রন্থাগার প্রতিটি শিক্ষার্থীর জন্য উন্মুক্ত।
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              {[
                { label: 'মোট বইয়ের সংগ্রহ', val: '৩,৫০০+' },
                { label: 'বিষয়ভিত্তিক বিভাগ', val: '১২+ টি' },
                { label: 'বই ইস্যু মেয়াদ', val: '৭ দিন' },
                { label: 'খোলার সময়', val: '১০টা – ৪টা' },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-[#F7F8FC] border border-slate-200/80 rounded-xl p-3">
                  <p className="text-[11px] text-slate-500">{kpi.label}</p>
                  <p className="text-base font-bold text-[#1B2A6B] mt-0.5 tabular-nums">{kpi.val}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Smart Search & Category Filter */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                aria-label="বই বা লেখক খুঁজুন"
                type="text"
                placeholder="বইয়ের নাম, লেখকের নাম (যেমন: রবীন্দ্রনাথ, জাফর ইকবাল) বা শেলফ নম্বর লিখুন..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#1F7A4D]"
              />
              <span>শুধুমাত্র সংগ্রহে থাকা বই (Available)</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {LIBRARY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                    : 'bg-[#F7F8FC] text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Book Catalog Grid */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 px-1">
            মোট <strong className="text-[#1B2A6B] tabular-nums">{toBanglaNumber(books.length)}টি</strong> বই প্রদর্শিত হচ্ছে
          </p>

          {books.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
              <Library className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-[#1B2A6B]">আপনার অনুসন্ধানের সাথে মিলে এমন কোনো বই পাওয়া যায়নি</p>
              <button
                type="button"
                onClick={() => {
                  setCategory('সকল বই');
                  setQuery('');
                  setAvailableOnly(false);
                }}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] rounded-lg cursor-pointer"
              >
                সব বই দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {books.map((book) => {
                const isAvailable = book.availableCopies > 0;
                return (
                  <article
                    key={book.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-[#1F7A4D]/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-[#1F7A4D]">{book.category}</span>
                        <span className="text-slate-500 font-sans tabular-nums">{book.callNo}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#1B2A6B] leading-snug">{book.titleBn}</h3>
                      <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>লেখক: {book.authorBn}</span>
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{book.summaryBn}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-slate-500">{book.shelfNo} · {book.recommendedFor}</p>
                        <p className={`font-semibold tabular-nums ${isAvailable ? 'text-[#1F7A4D]' : 'text-amber-700'}`}>
                          {isAvailable
                            ? `সংগ্রহে আছে: ${toBanglaNumber(book.availableCopies)}/${toBanglaNumber(book.totalCopies)} কপি`
                            : 'বর্তমানে ইস্যুকৃত (অপেক্ষমাণ)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBook(book)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#1B2A6B] bg-[#F7F8FC] hover:bg-[#1B2A6B] hover:text-white border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        বিস্তারিত
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Library Rules Bar */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
          <div>
            <h3 className="font-bold text-[#1B2A6B] mb-1">বই ইস্যু করার নিয়ম</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              প্রতিটি শিক্ষার্থী বিদ্যালয়ের RFID পরিচয়পত্র দেখিয়ে একসাথে সর্বোচ্চ ২টি বই ৭ দিনের জন্য বাসায় নিতে পারবে।
            </p>
          </div>
          <div>
            <h3 className="font-bold text-[#1B2A6B] mb-1">পাঠকক্ষ ব্যবহারের সময়</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              রবিবার থেকে বৃহস্পতিবার সকাল ১০:০০ – বিকাল ৪:০০ এবং টিফিন বিরতিতে সকল শ্রেণির শিক্ষার্থী পাঠকক্ষে বই পড়তে পারবে।
            </p>
          </div>
          <div>
            <h3 className="font-bold text-[#1B2A6B] mb-1">গ্রন্থাগারিক যোগাযোগ</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              নতুন বইয়ের চাহিদা বা রেফারেন্স সহায়তার জন্য ২য় তলার গ্রন্থাগার কক্ষে (কক্ষ নং ২০৮) যোগাযোগ করুন।
            </p>
          </div>
        </section>
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lib-book-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 font-bn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-[#1F7A4D]">
                  {selectedBook.category} · {selectedBook.callNo}
                </p>
                <h2 id="lib-book-title" className="text-lg font-bold text-[#1B2A6B] mt-0.5">
                  {selectedBook.titleBn}
                </h2>
                <p className="text-xs text-slate-500 font-sans">{selectedBook.titleEn}</p>
              </div>
              <button
                type="button"
                aria-label="বন্ধ করুন"
                onClick={() => setSelectedBook(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{selectedBook.summaryBn}</p>

            <dl className="grid grid-cols-2 gap-3 text-xs bg-[#F7F8FC] border border-slate-200 rounded-xl p-4">
              <div>
                <dt className="text-slate-500">লেখক / সম্পাদনা</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">{selectedBook.authorBn}</dd>
              </div>
              <div>
                <dt className="text-slate-500">শেলফ অবস্থান</dt>
                <dd className="font-semibold text-[#1B2A6B] mt-0.5">{selectedBook.shelfNo}</dd>
              </div>
              <div>
                <dt className="text-slate-500">উপযোগী শ্রেণি</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">{selectedBook.recommendedFor}</dd>
              </div>
              <div>
                <dt className="text-slate-500">প্রাপ্যতা</dt>
                <dd className="font-semibold text-[#1F7A4D] mt-0.5 tabular-nums">
                  {toBanglaNumber(selectedBook.availableCopies)} / {toBanglaNumber(selectedBook.totalCopies)} কপি
                </dd>
              </div>
            </dl>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#142054] rounded-lg cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. SMART ACADEMIC GUIDELINES & CODE OF CONDUCT
// ---------------------------------------------------------------------------

interface GuidelineCategory {
  id: string;
  labelBn: string;
  summaryBn: string;
  rules: string[];
}

const GUIDELINE_CATEGORIES: GuidelineCategory[] = [
  {
    id: 'attendance',
    labelBn: 'উপস্থিতি ও RFID বিধিমালা',
    summaryBn: 'নিয়মিত উপস্থিতি ও ডিজিটাল নিরাপত্তা নিশ্চিতকরণের জন্য প্রতিটি শিক্ষার্থীর অনুসরণীয় নির্দেশনা।',
    rules: [
      'প্রতিটি কর্মদিবসে সকাল ৯:৪৫ ঘটিকার মধ্যে বিদ্যালয় প্রাঙ্গণে উপস্থিত হয়ে প্রাত্যহিক সমাবেশে অংশগ্রহণ বাধ্যতামূলক।',
      'প্রধান ফটকে প্রবেশ ও প্রস্থানের সময় RFID স্মার্ট কার্ড পাঞ্চ করা আবশ্যক, যাতে অভিভাবকের মোবাইলে তাৎক্ষণিক SMS পৌঁছায়।',
      'বার্ষিক ও নির্বাচনি পরীক্ষায় অংশগ্রহণের জন্য ন্যূনতম ৮০% শ্রেণি উপস্থিতি থাকা বাধ্যতামূলক।',
      'অসুস্থতা বা জরুরি কারণে অনুপস্থিত থাকলে অভিভাবকের স্বাক্ষরিত ছুটির আবেদন শ্রেণি শিক্ষকের নিকট জমা দিতে হবে।',
    ],
  },
  {
    id: 'uniform',
    labelBn: 'পোশাক ও ইউনিফর্ম বিধি',
    summaryBn: 'পরিচ্ছন্নতা ও প্রাতিষ্ঠানিক শৃঙ্খলা বজায় রাখতে নির্ধারিত বিদ্যালয় পোশাক পরিধান।',
    rules: [
      'ছাত্রদের জন্য: সাদা হাফ/ফুল হাতা শার্ট (বিদ্যালয় মনোগ্রামযুক্ত), নেভি ব্লু প্যান্ট, কালো বেল্ট এবং সাদা কেডস।',
      'ছাত্রীদের জন্য: নেভি ব্লু কামিজ, সাদা সালোয়ার, সাদা ওড়না/স্কার্ফ, সাদা জুতা এবং বিদ্যালয়ের নির্ধারিত ব্যাজ।',
      'শীতকালে নেভি ব্লু সোয়েটার বা কার্ডিগান পরিধান করতে হবে।',
      'প্রতিটি শিক্ষার্থীর গলায় বিদ্যালয়ের RFID পরিচয়পত্র ঝুলানো থাকতে হবে।',
    ],
  },
  {
    id: 'exams',
    labelBn: 'পরীক্ষা ও মূল্যায়ন নিয়মাবলি',
    summaryBn: 'সুষ্ঠু ও নকলমুক্ত পরিবেশে পরীক্ষা পরিচালনা এবং স্বচ্ছ ফলাফল প্রকাশ।',
    rules: [
      'পরীক্ষা শুরুর অন্তত ২০ মিনিট পূর্বে প্রবেশপত্র ও প্রয়োজনীয় কলম-জ্যামিতি বক্সসহ আসন গ্রহণ করতে হবে।',
      'পরীক্ষার হলে মোবাইল ফোন, স্মার্টওয়াচ বা যেকোনো অননুমোদিত কাগজপত্র সম্পূর্ণ নিষিদ্ধ।',
      'অসদুপায় অবলম্বন করলে সংশ্লিষ্ট পরীক্ষা বাতিলসহ কঠোর শাস্তিমূলক ব্যবস্থা গ্রহণ করা হবে।',
      'প্রতিটি সাময়িক ও বার্ষিক পরীক্ষার মূল্যায়িত উত্তরপত্র অভিভাবক সভায় পর্যালোচনার সুযোগ রাখা হয়।',
    ],
  },
  {
    id: 'guardians',
    labelBn: 'অভিভাবকদের প্রতি নির্দেশনা',
    summaryBn: 'শিক্ষার্থীর সার্বিক বিকাশে বিদ্যালয় ও অভিভাবকের সমন্বিত অংশীদারিত্ব।',
    rules: [
      'প্রতিদিন শিক্ষার্থীর হোমওয়ার্ক ডায়েরি ও অভিভাবক পোর্টালের উপস্থিতি-ফলাফল নিয়মিত পর্যবেক্ষণ করুন।',
      'বিদ্যালয় কর্তৃক আয়োজিত অভিভাবক সমাবেশে উপস্থিত থেকে শ্রেণি শিক্ষকের সাথে মতবিনিময় করুন।',
      'শিক্ষার্থীকে কোনো প্রকার মোবাইল ফোন বা মূল্যবান অলংকার নিয়ে বিদ্যালয়ে পাঠানো থেকে বিরত থাকুন।',
      'অভিভাবকের মোবাইল নম্বর পরিবর্তন হলে তাৎক্ষণিক বিদ্যালয় অফিসে হালনাগাদ করুন।',
    ],
  },
  {
    id: 'discipline',
    labelBn: 'ক্যাম্পাস শৃঙ্খলা ও আচরণবিধি',
    summaryBn: 'নৈতিক মূল্যবোধ, পারস্পরিক শ্রদ্ধাবোধ এবং পরিচ্ছন্ন ক্যাম্পাস সংরক্ষণ।',
    rules: [
      'শিক্ষক, কর্মচারী ও সহপাঠীদের প্রতি সর্বদা শালীন ও শ্রদ্ধাশীল আচরণ প্রদর্শন করতে হবে।',
      'শ্রেণিকক্ষ, বিজ্ঞান ল্যাব, কম্পিউটার ল্যাব ও গ্রন্থাগারের আসবাবপত্র ও যন্ত্রপাতি যত্নসহকারে ব্যবহার করতে হবে।',
      'ক্লাস চলাকালীন বিনা অনুমতিতে শ্রেণিকক্ষ বা বিদ্যালয় প্রাঙ্গণের বাইরে যাওয়া সম্পূর্ণ নিষিদ্ধ।',
      'বিদ্যালয় ক্যাম্পাস পলিথিন ও আবর্জনামুক্ত রাখতে নির্ধারিত ডাস্টবিন ব্যবহার করতে হবে।',
    ],
  },
];

export function AcademicGuidelinesPage() {
  const { addToast } = useSchoolStore();
  const [activeTab, setActiveTab] = useState<string>('all');

  const visibleSections =
    activeTab === 'all'
      ? GUIDELINE_CATEGORIES
      : GUIDELINE_CATEGORIES.filter((c) => c.id === activeTab);

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="শৃঙ্খলা ও আচরণবিধি · শিক্ষার্থী ও অভিভাবক নির্দেশিকা"
        title="একাডেমিক নির্দেশিকা ও বিধিমালা"
        titleBn="Academic Guidelines & Institutional Code of Conduct"
        description="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের সুশৃঙ্খল শিক্ষাবান্ধব পরিবেশ বজায় রাখতে সকল শিক্ষার্থী ও অভিভাবকের অনুসরণীয় নিয়মাবলি।"
        actions={
          <button
            type="button"
            onClick={() => {
              printElementById('bhs-guidelines-sheet', 'একাডেমিক নির্দেশিকা — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়');
              addToast('success', 'একাডেমিক নির্দেশিকা প্রিন্ট প্রিভিউ খোলা হয়েছে।');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
          >
            <Printer className="w-4 h-4" />
            <span>নির্দেশিকা প্রিন্ট করুন</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-bn">
        {/* Category Switcher */}
        <div className="no-print flex flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors ${
              activeTab === 'all'
                ? 'bg-[#1B2A6B] text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            সকল বিধিমালা
          </button>
          {GUIDELINE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors ${
                activeTab === cat.id
                  ? 'bg-[#1B2A6B] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat.labelBn}
            </button>
          ))}
        </div>

        {/* Printable Guidelines Content */}
        <div id="bhs-guidelines-sheet" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleSections.map((section, idx) => (
            <article
              key={section.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1F7A4D] font-bold flex items-center justify-center shrink-0 tabular-nums">
                  ০{toBanglaNumber(idx + 1)}
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1B2A6B]">{section.labelBn}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{section.summaryBn}</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
                {section.rules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
