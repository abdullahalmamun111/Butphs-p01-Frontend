import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, CheckCheck, CheckCircle2, ClipboardCheck, ExternalLink, Eye, FileText, Plus, Save, Trash2, Users } from 'lucide-react';
import { SUBJECT_LIST } from '../../constants/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useSchoolStore } from '../../store/SchoolStore';
import { computeOverallResult } from '../../utils/grading';
import { toBanglaDigits } from '../../utils/noticeUtils';
import { EmptyState } from '../ui/EmptyState';
import { NoticePrintModal } from '../shared/NoticePrintModal';
import type { AttendanceStatus, Notice } from '../../types';

function useAssignedTeacherScope() {
  const { user } = useAuth();
  const { db } = useSchoolStore();

  const teacher = useMemo(
    () => db.teachers.find((t) => t.id === user?.linkedTeacherId) || db.teachers[1] || db.teachers[0],
    [db.teachers, user?.linkedTeacherId]
  );

  const assignedStudents = useMemo(
    () => db.students.filter((s) => teacher?.assignedClasses.includes(s.className)),
    [db.students, teacher]
  );

  const assignedAttendance = useMemo(() => {
    const ids = new Set(assignedStudents.map((s) => s.studentId));
    return db.attendance.filter((a) => ids.has(a.studentId));
  }, [db.attendance, assignedStudents]);

  const assignedRoutine = useMemo(
    () => db.routines.filter((r) => teacher?.assignedClasses.includes(r.className)),
    [db.routines, teacher]
  );

  return { teacher, assignedStudents, assignedAttendance, assignedRoutine };
}

export function TeacherOverviewPage() {
  const { db } = useSchoolStore();
  const { teacher, assignedStudents, assignedAttendance, assignedRoutine } = useAssignedTeacherScope();
  const [viewerNotice, setViewerNotice] = useState<Notice | null>(null);

  const draftResults = db.results.filter(
    (r) => teacher?.assignedClasses.includes(r.className) && r.status === 'Draft'
  ).length;
  const myNotesCount = db.classNotes.filter((n) => teacher?.assignedClasses.includes(n.className)).length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {teacher?.photoUrl ? (
            <img
              src={teacher.photoUrl}
              alt={teacher.nameBn}
              className="w-14 h-14 rounded-xl object-cover object-top border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#1B2A6B] text-white flex items-center justify-center text-base font-bold shrink-0">
              {teacher?.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="font-bn min-w-0">
            <p className="text-xs text-[#1F7A4D] font-semibold">শিক্ষক পোর্টাল · নির্ধারিত শ্রেণি ও বিষয়</p>
            <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] mt-0.5 truncate">
              স্বাগতম, {teacher?.nameBn}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {teacher?.designationBn} · নির্ধারিত শ্রেণি: {teacher?.assignedClasses.join(', ')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-center shrink-0">
          {teacher && (
            <Link
              to={`/about/teachers/${teacher.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 hover:border-[#1B2A6B] rounded-lg whitespace-nowrap font-bn"
            >
              <span>পাবলিক প্রোফাইল</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            to="/teacher/attendance"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1B2A6B] hover:bg-[#132056] rounded-lg whitespace-nowrap font-bn"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>হাজিরা গ্রহণ</span>
          </Link>
          <Link
            to="/teacher/results"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg whitespace-nowrap font-bn"
          >
            <span>নম্বর এন্ট্রি →</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-bn">
        {[
          { label: 'নির্ধারিত শ্রেণি', value: toBanglaDigits(teacher?.assignedClasses.length || 0), href: '/teacher/classes' },
          { label: 'নির্ধারিত শিক্ষার্থী', value: toBanglaDigits(assignedStudents.length), href: '/teacher/students' },
          { label: 'ক্লাস নোট ও বাড়ির কাজ', value: toBanglaDigits(myNotesCount), href: '/teacher/routine' },
          { label: 'খসড়া নম্বরপত্র', value: toBanglaDigits(draftResults), href: '/teacher/results' },
        ].map((card) => (
          <Link key={card.label} to={card.href} className="bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-5 transition-colors">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p className="text-2xl font-bold text-[#1B2A6B] tabular-nums mt-1">{card.value}</p>
            <p className="text-[11px] text-[#1F7A4D] mt-1">বিস্তারিত দেখুন →</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Class Schedule */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1F7A4D]" />
              <span>নির্ধারিত ক্লাস সূচি ({toBanglaDigits(assignedAttendance.length)} টি হাজিরা লগ)</span>
            </h3>
            <Link to="/teacher/routine" className="text-xs text-[#1F7A4D] hover:underline font-bn">
              রুটিন ও নোট →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 text-xs font-bn">
            {assignedRoutine.slice(0, 5).map((r) => (
              <li key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#1B2A6B]">{r.subject}</p>
                  <p className="text-slate-500">{r.className} · {r.section} · {r.room}</p>
                </div>
                <span className="tabular-nums text-[#1F7A4D] font-medium shrink-0">{r.day} · {r.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* School Notices with Print Viewer */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#1B2A6B] pb-2 border-b border-slate-100 font-bn">
            সাম্প্রতিক বিদ্যালয় বিজ্ঞপ্তি
          </h3>
          <ul className="divide-y divide-slate-100 text-sm">
            {db.notices
              .filter((n) => n.status === 'Published')
              .slice(0, 4)
              .map((n) => (
                <li key={n.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bn text-slate-800 truncate">{n.titleBn}</p>
                    <p className="text-xs text-slate-500 tabular-nums">{n.date}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewerNotice(n)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 hover:border-[#1F7A4D] rounded-lg cursor-pointer font-bn shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>দেখুন</span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <NoticePrintModal
        notice={viewerNotice}
        onClose={() => setViewerNotice(null)}
        headTeacherName={db.websiteContent.headTeacherName}
      />
    </div>
  );
}

export function TeacherProfilePage() {
  const { teacher } = useAssignedTeacherScope();
  if (!teacher) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          {teacher.photoUrl && (
            <img
              src={teacher.photoUrl}
              alt={teacher.nameBn}
              className="w-16 h-16 rounded-xl object-cover object-top border border-slate-200"
            />
          )}
          <div className="font-bn">
            <h2 className="text-base font-semibold text-[#1B2A6B]">{teacher.nameBn}</h2>
            <p className="text-xs text-slate-500">{teacher.designationBn} · {teacher.departmentBn || teacher.department}</p>
          </div>
        </div>
        <Link
          to={`/about/teachers/${teacher.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F7A4D] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-bn"
        >
          <span>পাবলিক প্রোফাইল দেখুন</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
      <dl className="divide-y divide-slate-100 text-sm">
        <div className="py-2.5 flex justify-between"><dt className="text-slate-500">নাম</dt><dd className="font-medium font-bn">{teacher.nameBn} · {teacher.name}</dd></div>
        <div className="py-2.5 flex justify-between"><dt className="text-slate-500">কর্মচারী আইডি</dt><dd className="tabular-nums">{teacher.employeeId}</dd></div>
        <div className="py-2.5 flex justify-between"><dt className="text-slate-500">পদবি</dt><dd className="font-bn">{teacher.designationBn}</dd></div>
        <div className="py-2.5 flex justify-between"><dt className="text-slate-500">বিভাগ</dt><dd className="font-bn">{teacher.departmentBn || teacher.department}</dd></div>
        <div className="py-2.5 flex justify-between"><dt className="text-slate-500">শিক্ষাগত যোগ্যতা</dt><dd>{teacher.qualification}</dd></div>
        <div className="py-2.5 flex justify-between"><dt className="text-slate-500">নির্ধারিত শ্রেণি</dt><dd className="font-medium text-[#1F7A4D]">{teacher.assignedClasses.join(', ')}</dd></div>
        <div className="py-2.5 flex justify-between"><dt className="text-slate-500">পাঠদানকৃত বিষয়</dt><dd>{teacher.assignedSubjects.join(', ')}</dd></div>
      </dl>
    </div>
  );
}

export function TeacherStudentsPage() {
  const { teacher, assignedStudents } = useAssignedTeacherScope();
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">
          নির্ধারিত শ্রেণির শিক্ষার্থী তালিকা ({teacher?.assignedClasses.join(', ')})
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-bn">
          আপনার দায়িত্বপ্রাপ্ত শ্রেণিসমূহের নিয়মিত শিক্ষার্থীবৃন্দ।
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
            <tr>
              <th className="py-3 px-4 font-medium">আইডি</th>
              <th className="py-3 px-4 font-medium">রোল</th>
              <th className="py-3 px-4 font-medium">শিক্ষার্থীর নাম</th>
              <th className="py-3 px-4 font-medium">শ্রেণি ও শাখা</th>
              <th className="py-3 px-4 font-medium">অভিভাবক ও মোবাইল</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignedStudents.map((s) => (
              <tr key={s.id}>
                <td className="py-3 px-4 tabular-nums font-medium text-[#1B2A6B]">{s.studentId}</td>
                <td className="py-3 px-4 tabular-nums">{s.roll}</td>
                <td className="py-3 px-4 font-bn">{s.nameBn} <span className="text-xs text-slate-500">· {s.name}</span></td>
                <td className="py-3 px-4 font-bn">{s.className} · {s.section}</td>
                <td className="py-3 px-4 text-xs text-slate-600 font-bn">{s.guardianName} · <span className="tabular-nums">{s.guardianPhone}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TeacherClassesPage({ defaultTab = 'classes' }: { defaultTab?: 'classes' | 'students' }) {
  const { teacher, assignedStudents } = useAssignedTeacherScope();
  const [tab, setTab] = useState<'classes' | 'students'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  if (!teacher) return null;

  return (
    <div className="space-y-5">
      <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('classes')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'classes' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>নির্ধারিত শ্রেণি ({toBanglaDigits(teacher.assignedClasses.length)})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('students')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'students' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>শিক্ষার্থী তালিকা ({toBanglaDigits(assignedStudents.length)})</span>
        </button>
      </div>

      {tab === 'classes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teacher.assignedClasses.map((cls) => {
            const count = assignedStudents.filter((s) => s.className === cls).length;
            return (
              <article key={cls} className="bg-white border border-slate-200 rounded-xl p-6 space-y-2.5">
                <p className="text-xs font-semibold text-[#1F7A4D] font-bn">নির্ধারিত শ্রেণি</p>
                <h2 className="text-lg font-semibold text-[#1B2A6B]">{cls}</h2>
                <p className="text-sm text-slate-600 tabular-nums font-bn">নিবন্ধিত শিক্ষার্থী: {toBanglaDigits(count)} জন</p>
                <p className="text-xs text-slate-600 font-bn">বিষয়সমূহ: {teacher.assignedSubjects.join(', ')}</p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium font-bn">
                  <Link to="/teacher/attendance" className="text-[#1F7A4D] hover:underline">হাজিরা গ্রহণ →</Link>
                  <button type="button" onClick={() => setTab('students')} className="text-[#1B2A6B] hover:underline cursor-pointer">
                    শিক্ষার্থী তালিকা →
                  </button>
                  <Link to="/teacher/results" className="text-[#1B2A6B] hover:underline">নম্বর এন্ট্রি →</Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <TeacherStudentsPage />
      )}
    </div>
  );
}

export function TeacherAttendancePage() {
  const { assignedStudents, assignedAttendance } = useAssignedTeacherScope();
  const { saveManualAttendance, addToast } = useSchoolStore();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('2026-11-20');
  const [selectedClass, setSelectedClass] = useState('All');

  const classOptions = Array.from(new Set(assignedStudents.map((s) => s.className)));
  const visibleStudents = assignedStudents.filter(
    (s) => selectedClass === 'All' || s.className === selectedClass
  );

  const getStatusForDate = (studentId: string): AttendanceStatus | null => {
    const rec = assignedAttendance.find((a) => a.studentId === studentId && a.date === selectedDate);
    return rec ? rec.status : null;
  };

  const handleMarkAllPresent = () => {
    visibleStudents.forEach((stu) => {
      saveManualAttendance(
        stu.studentId,
        selectedDate,
        'Present',
        'একত্রে উপস্থিতি গৃহীত',
        user?.nameBn || 'শিক্ষক'
      );
    });
    addToast('success', `${toBanglaDigits(visibleStudents.length)} জন শিক্ষার্থীকে উপস্থিত চিহ্নিত করা হয়েছে`);
  };

  return (
    <div className="space-y-6">
      {/* Live Daily Attendance Marking Sheet */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="font-bn">
            <h2 className="text-base font-semibold text-[#1B2A6B] inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A4D]" />
              <span>দৈনিক শ্রেণি হাজিরা গ্রহণ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              শিক্ষার্থীর পাশে উপস্থিত / বিলম্ব / অনুপস্থিত বাটনে ক্লিক করে সরাসরি হাজিরা সংরক্ষণ করুন।
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="শ্রেণি নির্বাচন"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">সব নির্ধারিত শ্রেণি</option>
              {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              aria-label="হাজিরার তারিখ"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 px-2.5 text-xs border border-slate-300 rounded-lg tabular-nums"
            />
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="h-9 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>সবাই উপস্থিত</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
              <tr>
                <th className="py-3 px-4 font-medium">রোল ও আইডি</th>
                <th className="py-3 px-4 font-medium">শিক্ষার্থীর নাম</th>
                <th className="py-3 px-4 font-medium">শ্রেণি</th>
                <th className="py-3 px-4 font-medium text-right">হাজিরা চিহ্নিত করুন ({selectedDate})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStudents.map((stu) => {
                const current = getStatusForDate(stu.studentId);
                return (
                  <tr key={stu.id}>
                    <td className="py-3 px-4 tabular-nums text-xs">
                      <span className="font-semibold text-[#1B2A6B]">রোল {stu.roll}</span> · {stu.studentId}
                    </td>
                    <td className="py-3 px-4 font-bn font-medium text-slate-800">{stu.nameBn}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-bn">{stu.className} · {stu.section}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5 font-bn">
                        {(
                          [
                            { status: 'Present', label: 'উপস্থিত', activeCls: 'bg-[#1F7A4D] text-white border-[#1F7A4D]' },
                            { status: 'Late', label: 'বিলম্ব', activeCls: 'bg-amber-600 text-white border-amber-600' },
                            { status: 'Absent', label: 'অনুপস্থিত', activeCls: 'bg-red-600 text-white border-red-600' },
                          ] as const
                        ).map((btn) => {
                          const isSelected = current === btn.status || (btn.status === 'Present' && current === 'Exited');
                          return (
                            <button
                              key={btn.status}
                              type="button"
                              onClick={() =>
                                saveManualAttendance(
                                  stu.studentId,
                                  selectedDate,
                                  btn.status,
                                  'শ্রেণি শিক্ষক কর্তৃক গৃহীত',
                                  user?.nameBn || 'শিক্ষক'
                                )
                              }
                              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                                isSelected
                                  ? btn.activeCls
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History Log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn">নির্ধারিত শ্রেণির উপস্থিতি ইতিহাস</h3>
        </div>
        {assignedAttendance.length === 0 ? (
          <EmptyState title="কোনো উপস্থিতি লগ নেই" description="RFID বা শ্রেণি হাজিরা রেকর্ড এখানে দেখা যাবে।" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
                <tr>
                  <th className="py-3 px-4 font-medium">তারিখ</th>
                  <th className="py-3 px-4 font-medium">শিক্ষার্থী</th>
                  <th className="py-3 px-4 font-medium">শ্রেণি</th>
                  <th className="py-3 px-4 font-medium">প্রবেশ / প্রস্থান</th>
                  <th className="py-3 px-4 font-medium">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedAttendance.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 tabular-nums text-xs">{r.date}</td>
                    <td className="py-3 px-4 font-bn">{r.studentName} ({r.studentId})</td>
                    <td className="py-3 px-4 text-xs">{r.className}</td>
                    <td className="py-3 px-4 tabular-nums text-xs">{r.entryTime || '—'} / {r.exitTime || '—'}</td>
                    <td className="py-3 px-4 text-xs font-medium text-[#1F7A4D]">{r.status}</td>
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

export function TeacherResultEntryPage() {
  const { db, saveStudentResult } = useSchoolStore();
  const { user } = useAuth();
  const { teacher, assignedStudents } = useAssignedTeacherScope();

  const [examId, setExamId] = useState(db.exams[1]?.id || db.exams[0]?.id || '');
  const [studentId, setStudentId] = useState(assignedStudents[0]?.studentId || '');
  const [marksMap, setMarksMap] = useState<Record<string, number>>({
    '101': 82,
    '107': 76,
    '109': 85,
    '127': 79,
    '154': 88,
  });
  const [err, setErr] = useState<string | null>(null);

  const subjects = SUBJECT_LIST.slice(0, 5);
  const assignedResults = db.results.filter((r) => teacher?.assignedClasses.includes(r.className));

  const preview = computeOverallResult(
    subjects.map((sub) => ({
      subjectCode: sub.code,
      subjectName: sub.name,
      obtainedMarks: Number(marksMap[sub.code] ?? 0),
    }))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    for (const sub of subjects) {
      const val = Number(marksMap[sub.code]);
      if (Number.isNaN(val) || val < 0 || val > 100) {
        setErr(`${sub.name} বিষয়ের নম্বর অবশ্যই ০ থেকে ১০০-এর মধ্যে হতে হবে।`);
        return;
      }
    }

    saveStudentResult(
      {
        examId,
        studentId,
        scores: subjects.map((sub) => ({
          subjectCode: sub.code,
          subjectName: sub.name,
          obtainedMarks: Number(marksMap[sub.code] ?? 0),
        })),
        status: 'Draft',
      },
      user?.nameBn || user?.name || 'শিক্ষক',
      'teacher'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5" noValidate>
        <div className="font-bn">
          <h2 className="text-base font-semibold text-[#1B2A6B]">
            বিষয়ভিত্তিক নম্বর এন্ট্রি ও খসড়া সংরক্ষণ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            শিক্ষক কর্তৃক সংরক্ষিত নম্বর খসড়া হিসেবে জমা হয়; প্রধান শিক্ষক ও প্রশাসন যাচাই করে চূড়ান্ত ফলাফল প্রকাশ করবেন।
          </p>
        </div>

        {err && <div role="alert" className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg font-bn">{err}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="te-exam" className="block text-xs font-medium text-slate-700 mb-1 font-bn">পরীক্ষা নির্বাচন করুন</label>
            <select id="te-exam" value={examId} onChange={(e) => setExamId(e.target.value)} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white font-bn">
              {db.exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.nameBn}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="te-stu" className="block text-xs font-medium text-slate-700 mb-1 font-bn">শিক্ষার্থী নির্বাচন করুন</label>
            <select id="te-stu" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white font-bn">
              {assignedStudents.map((s) => <option key={s.id} value={s.studentId}>{s.studentId} — {s.nameBn} ({s.className})</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
          {subjects.map((sub) => {
            const m = preview.marks.find((x) => x.subjectCode === sub.code);
            return (
              <div key={sub.code} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor={`mark-${sub.code}`} className="text-sm font-medium text-slate-800 font-bn">
                  {sub.code} · {sub.name}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`mark-${sub.code}`}
                    type="number"
                    min={0}
                    max={100}
                    value={marksMap[sub.code] ?? 0}
                    onChange={(e) => setMarksMap({ ...marksMap, [sub.code]: Number(e.target.value) })}
                    className="w-24 h-9 px-2.5 text-sm text-right border border-slate-300 rounded-lg tabular-nums"
                  />
                  <span className="w-20 text-xs text-slate-600 tabular-nums">
                    {m?.grade} ({m?.gradePoint.toFixed(1)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="text-sm tabular-nums text-[#1B2A6B] font-bn">
            স্বয়ংক্রিয় গণনা: মোট নম্বর <strong>{preview.totalMarks}</strong> · GPA <strong>{preview.gpa.toFixed(2)}</strong> ({preview.overallGrade})
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
          >
            <Save className="w-4 h-4" />
            <span>খসড়া নম্বর সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>

      {/* Saved Results Overview for Assigned Classes */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn">
            সংরক্ষিত ফলাফল তালিকা — নির্ধারিত শ্রেণি ({toBanglaDigits(assignedResults.length)})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
              <tr>
                <th className="py-3 px-4 font-medium">শিক্ষার্থী</th>
                <th className="py-3 px-4 font-medium">পরীক্ষা</th>
                <th className="py-3 px-4 font-medium text-right">মোট ও GPA</th>
                <th className="py-3 px-4 font-medium">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignedResults.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 font-bn">
                    <span className="font-medium text-[#1B2A6B]">{r.studentNameBn}</span>
                    <span className="text-xs text-slate-500 ml-1.5 tabular-nums">({r.className} · {r.studentId})</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">{r.examName}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-xs font-semibold text-[#1B2A6B]">
                    {r.totalMarks} · {r.gpa.toFixed(2)} ({r.overallGrade})
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold">
                    <span className={r.status === 'Published' ? 'text-[#1F7A4D]' : r.status === 'Verified' ? 'text-[#1B2A6B]' : 'text-amber-700'}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function TeacherAcademicsPage() {
  const { db } = useSchoolStore();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">পাঠ্যসূচি ও সিলেবাস</h2>
        {db.syllabus.map((s) => (
          <div key={s.id} className="pt-3 border-t border-slate-100 text-xs space-y-1">
            <p className="font-medium text-[#1F7A4D]">{s.className} · {s.subject}</p>
            <p className="text-slate-700 font-bn">{s.topics}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">একাডেমিক ক্যালেন্ডার (২০২৬)</h2>
        {db.calendar.map((c) => (
          <div key={c.id} className="pt-3 border-t border-slate-100 text-xs space-y-0.5">
            <p className="font-medium text-[#1B2A6B] tabular-nums font-bn">{c.date} · {c.titleBn}</p>
            <p className="text-slate-600 font-bn">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeacherRoutinePage({ defaultTab = 'routine' }: { defaultTab?: 'routine' | 'notes' | 'academics' }) {
  const { db, addClassNote, deleteClassNote } = useSchoolStore();
  const { user } = useAuth();
  const { teacher, assignedRoutine } = useAssignedTeacherScope();
  const [tab, setTab] = useState<'routine' | 'notes' | 'academics'>(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const [noteClass, setNoteClass] = useState(teacher?.assignedClasses[0] || 'Class 9');
  const [noteSubject, setNoteSubject] = useState(teacher?.assignedSubjects[0] || 'গণিত');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDetails, setNoteDetails] = useState('');
  const [noteDueDate, setNoteDueDate] = useState('2026-11-28');

  const assignedNotes = db.classNotes.filter((n) => !teacher || teacher.assignedClasses.includes(n.className));

  const handlePublishNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteDetails.trim()) return;
    addClassNote(
      {
        className: noteClass,
        subject: noteSubject.trim(),
        titleBn: noteTitle.trim(),
        detailsBn: noteDetails.trim(),
        teacherName: teacher?.nameBn || user?.nameBn || 'শিক্ষক',
        date: new Date().toISOString().slice(0, 10),
        dueDate: noteDueDate || undefined,
      },
      user?.nameBn || 'শিক্ষক'
    );
    setNoteTitle('');
    setNoteDetails('');
  };

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
          <span>সাপ্তাহিক রুটিন</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('notes')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'notes' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ক্লাস নোট ও বাড়ির কাজ ({toBanglaDigits(assignedNotes.length)})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('academics')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'academics' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>সিলেবাস ও ক্যালেন্ডার</span>
        </button>
      </div>

      {tab === 'routine' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">সাপ্তাহিক ক্লাস রুটিন</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
                <tr>
                  <th className="py-3 px-4 font-medium">বার</th>
                  <th className="py-3 px-4 font-medium">সময়</th>
                  <th className="py-3 px-4 font-medium">শ্রেণি ও শাখা</th>
                  <th className="py-3 px-4 font-medium">বিষয়</th>
                  <th className="py-3 px-4 font-medium">কক্ষ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedRoutine.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 font-medium text-[#1B2A6B]">{r.day}</td>
                    <td className="py-3 px-4 tabular-nums text-xs">{r.time}</td>
                    <td className="py-3 px-4 font-bn">{r.className} · {r.section}</td>
                    <td className="py-3 px-4 font-bn">{r.subject}</td>
                    <td className="py-3 px-4 text-slate-600">{r.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-6">
          <form onSubmit={handlePublishNote} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">নতুন ক্লাস নোট / বাড়ির কাজ প্রকাশ করুন</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-bn">এখানে যুক্ত করা বাড়ির কাজ ও পাঠ নির্দেশনা সরাসরি অভিভাবক পোর্টালে প্রদর্শিত হবে।</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select aria-label="Class" value={noteClass} onChange={(e) => setNoteClass(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {(teacher?.assignedClasses || ['Class 9', 'Class 10']).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input aria-label="Subject" required placeholder="বিষয় *" value={noteSubject} onChange={(e) => setNoteSubject(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg font-bn" />
              <input aria-label="Due date" type="date" value={noteDueDate} onChange={(e) => setNoteDueDate(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
            </div>
            <input aria-label="Note title" required placeholder="শিরোনাম (যেমন: অধ্যায় ৪ অনুশীলনী সমাধান) *" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-bn" />
            <textarea aria-label="Note details" rows={2} required placeholder="বিস্তারিত নির্দেশনা লিখুন..." value={noteDetails} onChange={(e) => setNoteDetails(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg font-bn" />
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn">
              <Plus className="w-4 h-4" />
              <span>নোট প্রকাশ করুন</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedNotes.map((note) => (
              <article key={note.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-3 font-bn">
                <div className="space-y-1.5 min-w-0">
                  <p className="text-xs font-semibold text-[#1F7A4D] tabular-nums">
                    {note.className} · {note.subject} {note.dueDate ? `· জমাদানের তারিখ: ${note.dueDate}` : ''}
                  </p>
                  <h3 className="text-sm font-semibold text-[#1B2A6B]">{note.titleBn}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{note.detailsBn}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Delete note ${note.titleBn}`}
                  onClick={() => deleteClassNote(note.id, user?.nameBn || 'শিক্ষক')}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      )}

      {tab === 'academics' && <TeacherAcademicsPage />}
    </div>
  );
}

