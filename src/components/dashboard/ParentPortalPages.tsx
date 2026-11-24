import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Printer,
  Radio,
  Send,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useSchoolStore } from '../../store/SchoolStore';
import { computeMeritPositions, filterPublishedResults, formatCurrencyBdt } from '../../utils/grading';
import { downloadNoticeFile } from '../../utils/downloadNotice';
import { toBanglaDigits } from '../../utils/noticeUtils';
import { validateAndBuildInquiry } from '../../utils/portalHelpers';
import { EmptyState } from '../ui/EmptyState';
import { PrintDocumentView } from '../shared/PrintDocumentView';
import { NoticePrintModal } from '../shared/NoticePrintModal';
import type { Notice, Student, StudentResult } from '../../types';

interface ParentChildContextValue {
  linkedChildren: Student[];
  activeChild: Student | null;
  setActiveChildId: (studentId: string) => void;
}

const ParentChildContext = createContext<ParentChildContextValue | null>(null);

export function ParentChildProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { db } = useSchoolStore();

  const linkedChildren = useMemo(() => {
    const allowedIds = new Set(user?.linkedStudentIds || []);
    return db.students.filter((s) => allowedIds.has(s.studentId));
  }, [db.students, user?.linkedStudentIds]);

  const [selectedId, setSelectedIdState] = useState<string>(() => {
    try {
      const saved = window.sessionStorage.getItem('bhs_parent_active_child');
      if (saved && linkedChildren.some((c) => c.studentId === saved)) {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return linkedChildren[0]?.studentId || '';
  });

  const setSelectedId = (id: string) => {
    setSelectedIdState(id);
    try {
      window.sessionStorage.setItem('bhs_parent_active_child', id);
    } catch {
      // ignore storage errors
    }
  };

  const activeChild =
    linkedChildren.find((c) => c.studentId === selectedId) || linkedChildren[0] || null;

  return (
    <ParentChildContext.Provider
      value={{
        linkedChildren,
        activeChild,
        setActiveChildId: setSelectedId,
      }}
    >
      <div className="space-y-5">
        {linkedChildren.length > 1 && (
          <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="font-bn">
              <p className="text-xs font-semibold text-[#1F7A4D]">আপনার সন্তান নির্বাচন করুন</p>
              <p className="text-xs text-slate-500">
                নির্বাচিত শিক্ষার্থীর হাজিরা, ফলাফল, SMS ও বেতনের তথ্য প্রদর্শিত হচ্ছে।
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {linkedChildren.map((child) => (
                <button
                  key={child.studentId}
                  type="button"
                  onClick={() => setSelectedId(child.studentId)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer font-bn ${
                    activeChild?.studentId === child.studentId
                      ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                      : 'bg-[#F7F8FC] text-slate-700 border-slate-200 hover:border-[#1B2A6B]'
                  }`}
                >
                  <span>{child.nameBn}</span> · {child.className}
                </button>
              ))}
            </div>
          </div>
        )}
        {children}
      </div>
    </ParentChildContext.Provider>
  );
}

function useActiveChild() {
  const ctx = useContext(ParentChildContext);
  if (!ctx) throw new Error('Must be used within ParentChildProvider');
  return ctx;
}

export function ParentOverviewPage() {
  const { activeChild } = useActiveChild();
  const { db } = useSchoolStore();

  if (!activeChild) {
    return <EmptyState title="কোনো সংযুক্ত শিক্ষার্থী পাওয়া যায়নি" description="সন্তানের অ্যাকাউন্ট সংযুক্ত করতে বিদ্যালয় অফিসে যোগাযোগ করুন।" />;
  }

  const attendance = db.attendance.filter((a) => a.studentId === activeChild.studentId);
  const presentDays = attendance.filter((a) => a.status !== 'Absent').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 96;
  const publishedResults = filterPublishedResults(db.results, { studentId: activeChild.studentId });
  const latestResult = publishedResults[0];
  const meritMap = computeMeritPositions(db.results.filter((r) => r.status === 'Published'));
  const latestMerit = latestResult ? meritMap.get(latestResult.id) : undefined;
  const dueAmount = db.fees
    .filter((f) => f.studentId === activeChild.studentId)
    .reduce((sum, f) => sum + f.dueAmount, 0);

  const childSms = db.smsLogs.filter(
    (s) => s.message.includes(activeChild.studentId) || s.recipientPhone === activeChild.guardianPhone
  );

  return (
    <div className="space-y-6">
      {/* Child Identity Dossier */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <p className="text-xs font-semibold text-[#1F7A4D] font-bn">শিক্ষার্থী পরিচিতি</p>
            <h2 className="text-xl font-semibold text-[#1B2A6B] font-bn mt-0.5">
              {activeChild.nameBn} <span className="text-sm font-normal text-slate-500">({activeChild.name})</span>
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#1B2A6B] tabular-nums bg-[#F7F8FC] border border-slate-200 px-3 py-1.5 rounded-lg">
            ID: {activeChild.studentId} · রোল {toBanglaDigits(activeChild.roll)}
          </span>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm font-bn">
          <div><dt className="text-xs text-slate-500">শ্রেণি ও শাখা</dt><dd className="font-semibold text-[#1B2A6B] mt-0.5">{activeChild.className} · {activeChild.section}</dd></div>
          <div><dt className="text-xs text-slate-500">বিভাগ</dt><dd className="font-medium mt-0.5">{activeChild.group || 'General'}</dd></div>
          <div><dt className="text-xs text-slate-500">RFID কার্ড</dt><dd className="font-medium tabular-nums mt-0.5">{activeChild.rfidCardId || '—'}</dd></div>
          <div><dt className="text-xs text-slate-500">শিক্ষাবর্ষ</dt><dd className="font-medium tabular-nums mt-0.5">{activeChild.session}</dd></div>
          <div><dt className="text-xs text-slate-500">রক্তের গ্রুপ</dt><dd className="font-medium mt-0.5">{activeChild.bloodGroup}</dd></div>
          <div><dt className="text-xs text-slate-500">অবস্থা</dt><dd className="font-semibold text-[#1F7A4D] mt-0.5">নিয়মিত ({activeChild.status})</dd></div>
        </dl>
      </div>

      {/* 4 Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-bn">
        <Link to="/parent/attendance" className="bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-5 transition-colors">
          <p className="text-xs text-slate-500">উপস্থিতির হার</p>
          <p className="text-2xl font-bold text-[#1F7A4D] tabular-nums mt-1">{toBanglaDigits(attendanceRate)}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{toBanglaDigits(attendance.length)} কর্মদিবস নথিভুক্ত</p>
        </Link>
        <Link to="/parent/results" className="bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-5 transition-colors">
          <p className="text-xs text-slate-500">সর্বশেষ প্রকাশিত GPA</p>
          <p className="text-2xl font-bold text-[#1B2A6B] tabular-nums mt-1">
            {latestResult ? `${latestResult.gpa.toFixed(2)} (${latestResult.overallGrade})` : 'প্রক্রিয়াধীন'}
          </p>
          <p className="text-[11px] text-[#1F7A4D] font-medium mt-0.5 truncate">
            {latestMerit?.rankBn ? `শ্রেণিতে মেধাক্রম: ${latestMerit.rankBn}` : latestResult?.examName || 'ফলাফল প্রকাশিত হলে দেখা যাবে'}
          </p>
        </Link>
        <Link to="/parent/fees" className="bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-5 transition-colors">
          <p className="text-xs text-slate-500">বর্তমান বকেয়া ফি</p>
          <p className={`text-2xl font-bold tabular-nums mt-1 ${dueAmount > 0 ? 'text-amber-700' : 'text-[#1F7A4D]'}`}>
            {formatCurrencyBdt(dueAmount)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{dueAmount > 0 ? 'অনলাইনে পরিশোধযোগ্য' : 'সকল বেতন পরিশোধিত'}</p>
        </Link>
        <Link to="/parent/notices" className="bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-5 transition-colors">
          <p className="text-xs text-slate-500">RFID ও SMS সতর্কতা</p>
          <p className="text-2xl font-bold text-[#1B2A6B] tabular-nums mt-1">{toBanglaDigits(childSms.length)} টি</p>
          <p className="text-[11px] text-slate-500 mt-0.5">প্রবেশ ও প্রস্থান বার্তা</p>
        </Link>
      </div>

      {/* Bottom 2-Column Activity Grid: RFID Gate SMS Feed + Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#1F7A4D]" />
              <span>সাম্প্রতিক RFID গেট প্রবেশ/প্রস্থান SMS বার্তা</span>
            </h3>
            <Link to="/parent/notices" className="text-xs text-[#1F7A4D] hover:underline font-bn">সব বার্তা →</Link>
          </div>
          {childSms.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 font-bn">এই শিক্ষার্থীর জন্য এখনো কোনো SMS লগ জমা হয়নি।</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {childSms.slice(0, 4).map((sms) => (
                <li key={sms.id} className="py-3 space-y-1 font-bn">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#1F7A4D]">
                      {sms.trigger === 'RFID_ENTRY' ? 'গেট প্রবেশ (ENTRY)' : sms.trigger === 'RFID_EXIT' ? 'গেট প্রস্থান (EXIT)' : 'প্রাতিষ্ঠানিক বার্তা'}
                    </span>
                    <span className="text-slate-500 tabular-nums">{sms.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{sms.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1F7A4D]" />
              <span>পরীক্ষা সূচি ও অবস্থা</span>
            </h3>
            <Link to="/parent/academics" className="text-xs text-[#1F7A4D] hover:underline font-bn">বিস্তারিত →</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {db.exams.map((ex) => (
              <li key={ex.id} className="py-2.5 flex items-start justify-between gap-2 font-bn">
                <div>
                  <p className="text-xs font-semibold text-[#1B2A6B]">{ex.nameBn}</p>
                  <p className="text-[11px] text-slate-500 tabular-nums">{ex.startDate} থেকে {ex.endDate}</p>
                </div>
                <span className={`text-[11px] font-semibold shrink-0 ${ex.status === 'Completed' ? 'text-[#1F7A4D]' : ex.status === 'Ongoing' ? 'text-amber-700' : 'text-[#1B2A6B]'}`}>
                  {ex.status === 'Completed' ? 'সম্পন্ন' : ex.status === 'Ongoing' ? 'চলমান' : 'আসন্ন'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ParentRoutinePage() {
  const { activeChild } = useActiveChild();
  const { db } = useSchoolStore();
  if (!activeChild) return null;

  const routine = db.routines.filter((r) => r.className === activeChild.className);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">
          সাপ্তাহিক ক্লাস রুটিন · {activeChild.className} ({activeChild.section})
        </h2>
      </div>
      {routine.length === 0 ? (
        <EmptyState title="রুটিন পাওয়া যায়নি" description="এই শ্রেণির ক্লাস রুটিন শীঘ্রই প্রকাশ করা হবে।" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
              <tr>
                <th className="py-3 px-4 font-medium">বার</th>
                <th className="py-3 px-4 font-medium">পিরিয়ড ও সময়</th>
                <th className="py-3 px-4 font-medium">বিষয়</th>
                <th className="py-3 px-4 font-medium">শিক্ষক</th>
                <th className="py-3 px-4 font-medium">কক্ষ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routine.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-medium text-[#1B2A6B]">{r.day}</td>
                  <td className="py-3 px-4 tabular-nums text-xs">{r.period} · {r.time}</td>
                  <td className="py-3 px-4 font-bn">{r.subject}</td>
                  <td className="py-3 px-4 text-xs text-slate-600 font-bn">{r.teacherName}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{r.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ParentAttendancePage() {
  const { activeChild } = useActiveChild();
  const { db } = useSchoolStore();
  if (!activeChild) return null;

  const records = db.attendance.filter((a) => a.studentId === activeChild.studentId);
  const recordByDate = new Map(records.map((r) => [r.date, r]));

  // Visual Calendar for November 2026 (Days 1..30)
  const novDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-11-${String(dayNum).padStart(2, '0')}`;
    const dObj = new Date(`${dateStr}T00:00:00`);
    const weekday = dObj.getDay(); // 5=Fri, 6=Sat
    const isWeekend = weekday === 5 || weekday === 6;
    const rec = recordByDate.get(dateStr);
    return { dayNum, dateStr, isWeekend, rec };
  });

  return (
    <div className="space-y-6">
      {/* Visual Monthly Attendance Calendar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1F7A4D]" />
            <span>মাসিক উপস্থিতি ক্যালেন্ডার (নভেম্বর ২০২৬) — {activeChild.nameBn}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bn">
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#1F7A4D]" />উপস্থিত</span>
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />বিলম্ব</span>
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-red-500" />অনুপস্থিত</span>
            <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-slate-200" />সাপ্তাহিক ছুটি</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center font-bn">
          {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'].map((wd) => (
            <div key={wd} className="text-[11px] font-semibold text-slate-500 py-1">{wd}</div>
          ))}
          {novDays.map((cell) => {
            let tone = 'bg-[#F7F8FC] text-slate-700 border-slate-200/70';
            let statusNote = '';
            if (cell.isWeekend) {
              tone = 'bg-slate-100 text-slate-400 border-slate-200/60';
              statusNote = 'ছুটি';
            } else if (cell.rec) {
              if (cell.rec.status === 'Present' || cell.rec.status === 'Exited') {
                tone = 'bg-[#1F7A4D] text-white border-[#1F7A4D]';
                statusNote = 'উপস্থিত';
              } else if (cell.rec.status === 'Late') {
                tone = 'bg-amber-500 text-white border-amber-500';
                statusNote = 'বিলম্ব';
              } else {
                tone = 'bg-red-500 text-white border-red-500';
                statusNote = 'অনুপস্থিত';
              }
            }
            return (
              <div key={cell.dateStr} className={`rounded-lg border p-2 min-h-[54px] flex flex-col items-center justify-center ${tone}`}>
                <span className="text-xs font-bold tabular-nums">{toBanglaDigits(cell.dayNum)}</span>
                {statusNote && <span className="text-[10px] leading-tight mt-0.5 opacity-95">{statusNote}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn">
            RFID গেট প্রবেশ ও প্রস্থানের বিস্তারিত লগ
          </h3>
        </div>
        {records.length === 0 ? (
          <EmptyState title="কোনো উপস্থিতি লগ পাওয়া যায়নি" description="গেট RFID স্ক্যান ও দৈনিক হাজিরা এখানে দেখা যাবে।" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
                <tr>
                  <th className="py-3 px-4 font-medium">তারিখ</th>
                  <th className="py-3 px-4 font-medium">প্রবেশের সময়</th>
                  <th className="py-3 px-4 font-medium">প্রস্থানের সময়</th>
                  <th className="py-3 px-4 font-medium">অবস্থা</th>
                  <th className="py-3 px-4 font-medium">মাধ্যম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 tabular-nums">{r.date}</td>
                    <td className="py-3 px-4 tabular-nums text-xs">{r.entryTime || '—'}</td>
                    <td className="py-3 px-4 tabular-nums text-xs">{r.exitTime || '—'}</td>
                    <td className="py-3 px-4 text-xs font-medium text-[#1F7A4D]">{r.status}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function ParentResultsPage() {
  const { activeChild } = useActiveChild();
  const { db } = useSchoolStore();
  const [printing, setPrinting] = useState<StudentResult | null>(null);

  if (!activeChild) return null;
  const published = filterPublishedResults(db.results, { studentId: activeChild.studentId });
  const meritMap = computeMeritPositions(db.results.filter((r) => r.status === 'Published'));

  if (printing) {
    return <PrintDocumentView docType="marksheet" student={activeChild} result={printing} onClose={() => setPrinting(null)} />;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-600 font-bn">
        <strong>{activeChild.nameBn}</strong>-এর আনুষ্ঠানিকভাবে প্রকাশিত পরীক্ষার ফলাফল ও নম্বরপত্র।
      </p>
      {published.length === 0 ? (
        <EmptyState title="কোনো প্রকাশিত ফলাফল নেই" description="পরীক্ষার ফলাফল প্রকাশিত হলে এখানে দেখতে ও প্রিন্ট করতে পারবেন।" />
      ) : (
        published.map((res) => {
          const merit = meritMap.get(res.id);
          return (
          <article key={res.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="font-bn">
                <h2 className="text-base font-semibold text-[#1B2A6B]">{res.examName}</h2>
                <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                  মোট নম্বর: {res.totalMarks} · GPA: <strong className="text-[#1F7A4D]">{res.gpa.toFixed(2)} ({res.overallGrade})</strong>
                  {merit?.rankBn && (
                    <span className="ml-2 font-semibold text-[#1B2A6B]">· শ্রেণিতে মেধাক্রম: {merit.rankBn}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrinting(res)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
              >
                <Printer className="w-4 h-4" />
                <span>মার্কশিট প্রিন্ট করুন</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-[#F7F8FC] text-[#1B2A6B] font-bn">
                  <tr>
                    <th className="py-2 px-3 font-medium">বিষয়</th>
                    <th className="py-2 px-3 font-medium text-right">প্রাপ্ত নম্বর</th>
                    <th className="py-2 px-3 font-medium text-center">গ্রেড</th>
                    <th className="py-2 px-3 font-medium text-right">GP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {res.marks.map((m) => (
                    <tr key={m.subjectCode}>
                      <td className="py-2 px-3 font-bn">{m.subjectName}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{m.obtainedMarks} / {m.fullMarks}</td>
                      <td className="py-2 px-3 text-center font-medium">{m.grade}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{m.gradePoint.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          );
        })
      )}
    </div>
  );
}

export function ParentNoticesPage() {
  const { activeChild } = useActiveChild();
  const { user } = useAuth();
  const { db, addInquiry, addToast } = useSchoolStore();
  const [tab, setTab] = useState<'notices' | 'sms' | 'helpdesk'>('notices');
  const [viewerNotice, setViewerNotice] = useState<Notice | null>(null);
  const [helpSubject, setHelpSubject] = useState('');
  const [helpMessage, setHelpMessage] = useState('');

  const notices = db.notices.filter((n) => n.status === 'Published');
  const smsHistory = db.smsLogs.filter(
    (s) => !activeChild || s.recipientPhone === activeChild.guardianPhone || s.recipientGroup === 'All Parents' || s.recipientGroup === 'Class Wise'
  );
  const myInquiries = db.inquiries.filter(
    (inq) => inq.source === 'Parent Portal' || (activeChild && inq.phone === activeChild.guardianPhone)
  );

  const handleSendHelpdesk = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAndBuildInquiry({
      senderName: user?.nameBn || activeChild?.guardianName || 'অভিভাবক',
      phone: activeChild?.guardianPhone || '01715-000301',
      subject: helpSubject,
      message: helpMessage,
      source: 'Parent Portal',
    });
    if (!validation.ok) {
      addToast('error', validation.error);
      return;
    }
    addInquiry(validation.inquiry);
    setHelpSubject('');
    setHelpMessage('');
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('notices')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'notices' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          প্রাতিষ্ঠানিক বিজ্ঞপ্তি ({toBanglaDigits(notices.length)})
        </button>
        <button
          type="button"
          onClick={() => setTab('sms')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'sms' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>RFID ও SMS বার্তা ({toBanglaDigits(smsHistory.length)})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('helpdesk')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'helpdesk' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>অফিস হেল্পডেস্ক ({toBanglaDigits(myInquiries.length)})</span>
        </button>
      </div>

      {tab === 'notices' && (
        <div className="space-y-3">
          {notices.map((n) => (
            <article key={n.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500 tabular-nums">{n.category} · {n.date}</p>
                  <h2 className="text-base font-semibold text-[#1B2A6B] font-bn mt-0.5">{n.titleBn}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewerNotice(n)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#1B2A6B] hover:bg-[#1F7A4D] rounded-lg cursor-pointer font-bn"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>দেখুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadNoticeFile(n);
                      addToast('success', 'নোটিশ ডাউনলোড হয়েছে');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded-lg cursor-pointer font-bn"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-700 font-bn">{n.summary}</p>
            </article>
          ))}
        </div>
      )}

      {tab === 'sms' && (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {smsHistory.map((sms) => (
            <div key={sms.id} className="p-4 space-y-1 font-bn">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#1F7A4D]">
                  {sms.trigger === 'RFID_ENTRY' ? 'RFID প্রবেশ' : sms.trigger === 'RFID_EXIT' ? 'RFID প্রস্থান' : 'বিদ্যালয় বিজ্ঞপ্তি'}
                </span>
                <span className="text-slate-500 tabular-nums">{sms.timestamp} · প্রেরিত</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{sms.message}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'helpdesk' && (
        <div className="space-y-5">
          <form onSubmit={handleSendHelpdesk} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 font-bn">
            <div>
              <h2 className="text-base font-semibold text-[#1B2A6B]">বিদ্যালয় অফিসে সরাসরি বার্তা পাঠান</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ছুটির আবেদন, প্রশংসাপত্র, হাজিরা কিংবা বেতন সংক্রান্ত যেকোনো জিজ্ঞাসা পাঠান — অ্যাডমিন ডেস্ক উত্তর প্রদান করবে।
              </p>
            </div>
            <input
              aria-label="Helpdesk subject"
              placeholder="বিষয় (যেমন: অসুস্থতাজনিত ছুটির আবেদন / RFID কার্ড) *"
              value={helpSubject}
              onChange={(e) => setHelpSubject(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg"
            />
            <textarea
              aria-label="Helpdesk message"
              rows={3}
              placeholder="বিস্তারিত বার্তা লিখুন *"
              value={helpMessage}
              onChange={(e) => setHelpMessage(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-lg"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>অফিসে বার্তা পাঠান</span>
            </button>
          </form>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 font-bn">
            {myInquiries.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">আপনার পাঠানো কোনো বার্তা এখনো নেই।</div>
            ) : (
              myInquiries.map((inq) => (
                <div key={inq.id} className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#1B2A6B]">{inq.subject}</span>
                    <span className={`font-semibold tabular-nums ${inq.status === 'Resolved' ? 'text-[#1F7A4D]' : inq.status === 'Replied' ? 'text-[#1B2A6B]' : 'text-amber-700'}`}>
                      {inq.status === 'Resolved' ? 'নিষ্পন্ন' : inq.status === 'Replied' ? 'উত্তর প্রদত্ত' : 'অপেক্ষমাণ'} · {inq.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{inq.message}</p>
                  {inq.replyNote && (
                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950">
                      <span className="font-semibold">অফিস উত্তর ({inq.repliedBy || 'প্রশাসন'}): </span>
                      {inq.replyNote}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <NoticePrintModal
        notice={viewerNotice}
        onClose={() => setViewerNotice(null)}
        headTeacherName={db.websiteContent.headTeacherName}
      />
    </div>
  );
}

export function ParentFeesPage() {
  const { activeChild } = useActiveChild();
  const { db, simulateFeePayment } = useSchoolStore();
  const { user } = useAuth();
  if (!activeChild) return null;

  const fees = db.fees.filter((f) => f.studentId === activeChild.studentId);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 font-bn flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0" />
        <span>
          সোনালী ব্যাংক নড়িয়া শাখা ও ডিজিটাল ফি ব্যবস্থার মাধ্যমে পরিশোধিত এবং বকেয়া বেতনের বিবরণী।
        </span>
      </div>

      {fees.length === 0 ? (
        <EmptyState title="কোনো বেতন চালান পাওয়া যায়নি" description="এই শিক্ষার্থীর বেতন ও পরীক্ষার ফি চালান এখানে দেখা যাবে।" />
      ) : (
        <div className="space-y-4">
          {fees.map((f) => (
            <article key={f.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 tabular-nums">{f.invoiceNo} · শেষ তারিখ: {f.dueDate}</p>
                  <h2 className="text-base font-semibold text-[#1B2A6B] mt-0.5 font-bn">{f.monthOrTerm}</h2>
                </div>
                <span className={`text-xs font-semibold font-bn ${f.status === 'Paid' ? 'text-[#1F7A4D]' : 'text-amber-700'}`}>
                  অবস্থা: {f.status === 'Paid' ? 'পরিশোধিত' : 'বকেয়া'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs tabular-nums font-bn">
                <div><span className="text-slate-500 block">মাসিক বেতন</span><strong>{formatCurrencyBdt(f.tuitionFee)}</strong></div>
                <div><span className="text-slate-500 block">পরীক্ষার ফি</span><strong>{formatCurrencyBdt(f.examFee)}</strong></div>
                <div><span className="text-slate-500 block">ল্যাব ও সহশিক্ষা</span><strong>{formatCurrencyBdt(f.labAndActivityFee)}</strong></div>
                <div><span className="text-slate-500 block">পরিশোধিত</span><strong className="text-[#1F7A4D]">{formatCurrencyBdt(f.paidAmount)}</strong></div>
                <div><span className="text-slate-500 block">বকেয়া</span><strong className="text-red-700">{formatCurrencyBdt(f.dueAmount)}</strong></div>
              </div>

              {f.dueAmount > 0 && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => simulateFeePayment(f.id, user?.nameBn || 'অভিভাবক')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>অনলাইন ফি পরিশোধ করুন ({formatCurrencyBdt(f.dueAmount)})</span>
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function ParentAcademicsPage({ defaultTab = 'routine' }: { defaultTab?: 'routine' | 'notes' | 'resources' }) {
  const { activeChild } = useActiveChild();
  const { db } = useSchoolStore();
  const [tab, setTab] = useState<'routine' | 'notes' | 'resources'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  if (!activeChild) return null;

  const syllabus = db.syllabus.filter((s) => s.className === activeChild.className);
  const classNotes = db.classNotes.filter((n) => n.className === activeChild.className);

  return (
    <div className="space-y-5">
      <div className="inline-flex flex-wrap bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('routine')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'routine' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>সাপ্তাহিক ক্লাস রুটিন</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('notes')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'notes' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ক্লাস নোট ও বাড়ির কাজ ({toBanglaDigits(classNotes.length)})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('resources')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'resources' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>সিলেবাস, পরীক্ষা ও ক্যালেন্ডার</span>
        </button>
      </div>

      {tab === 'routine' && <ParentRoutinePage />}

      {tab === 'notes' && (
        <div className="space-y-3 font-bn">
          {classNotes.length === 0 ? (
            <EmptyState
              title="এখনো কোনো ক্লাস নোট প্রকাশিত হয়নি"
              description={`${activeChild.className}-এর শ্রেণি শিক্ষক বাড়ির কাজ বা পাঠ নির্দেশনা প্রকাশ করলে এখানে দেখা যাবে।`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classNotes.map((note) => (
                <article key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#1F7A4D]">{note.subject}</span>
                    <span className="text-slate-500 tabular-nums">{note.date}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#1B2A6B]">{note.titleBn}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{note.detailsBn}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>শিক্ষক: {note.teacherName}</span>
                    {note.dueDate && <span className="font-semibold text-amber-700 tabular-nums">জমাদান: {note.dueDate}</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'resources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <h2 className="text-base font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1F7A4D]" />
                <span>{activeChild.className} পাঠ্যসূচি ও সিলেবাস</span>
              </h2>
              {syllabus.length === 0 ? (
                <p className="text-xs text-slate-500 font-bn">জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) নির্ধারিত পাঠ্যসূচি অনুসরণ করা হচ্ছে।</p>
              ) : (
                syllabus.map((s) => (
                  <div key={s.id} className="pt-3 border-t border-slate-100 text-xs space-y-1 font-bn">
                    <p className="font-semibold text-[#1F7A4D]">{s.subject} · {s.term}</p>
                    <p className="text-slate-700 leading-relaxed">{s.topics}</p>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <h2 className="text-base font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1F7A4D]" />
                <span>একাডেমিক ক্যালেন্ডার (২০২৬)</span>
              </h2>
              {db.calendar.map((c) => (
                <div key={c.id} className="pt-3 border-t border-slate-100 text-xs font-bn">
                  <p className="font-semibold text-[#1B2A6B] tabular-nums">{c.date} · {c.titleBn}</p>
                  <p className="text-slate-600 mt-0.5">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">
              পরীক্ষা সূচি ও সহায়ক পাঠ্য উপকরণ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bn">
              {db.exams.map((ex) => (
                <div key={ex.id} className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200 space-y-1">
                  <p className="text-xs font-semibold text-[#1F7A4D]">{ex.className} · {ex.status}</p>
                  <p className="text-sm font-semibold text-[#1B2A6B]">{ex.nameBn}</p>
                  <p className="text-xs text-slate-600 tabular-nums">{ex.startDate} – {ex.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
