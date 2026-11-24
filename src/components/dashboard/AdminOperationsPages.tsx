import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  KeyRound,
  Lock,
  Printer,
  RotateCcw,
  Search,
  Send,
  Settings,
  Shield,
} from 'lucide-react';
import { CLASS_LIST } from '../../constants/navigation';
import { SCHOOL_INFO } from '../../config/school';
import { authService, PORTAL_ACCOUNTS } from '../../services';
import { useSchoolStore } from '../../store/SchoolStore';
import { useAuth } from '../../providers/AuthProvider';
import { examCreateSchema, smsSchema } from '../../validations/schemas';
import { computeMeritPositions, formatCurrencyBdt } from '../../utils/grading';
import { evaluatePasswordStrength } from '../../utils/adminFormHelpers';
import { toBanglaDigits } from '../../utils/noticeUtils';
import { PrintDocumentView } from '../shared/PrintDocumentView';
import { PrintManagementCenter } from '../print/PrintManagementCenter';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { printElementById } from '../../utils/printDocument';
import { AdminNoticesPage } from './AdminAcademicPages';
import type { AdmissionApplication, SmsLog, StudentResult } from '../../types';

export function AdminResultsPage() {
  const { db, updateResultStatus } = useSchoolStore();
  const { user } = useAuth();
  const [printResult, setPrintResult] = useState<StudentResult | null>(null);
  const meritMap = computeMeritPositions(db.results);

  return (
    <div className="space-y-6">
      {printResult ? (
        <PrintDocumentView
          docType="marksheet"
          student={db.students.find((s) => s.studentId === printResult.studentId)}
          result={printResult}
          onClose={() => setPrintResult(null)}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-medium text-[#1B2A6B] font-bn">
              ফলাফল যাচাই ও প্রকাশনা নিয়ন্ত্রণ (Result Verification & Publishing)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only results marked &ldquo;Published&rdquo; are visible on the Public Result Search and Parent Portal.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
                <tr>
                  <th className="py-3 px-4 font-medium">Student</th>
                  <th className="py-3 px-4 font-medium">Exam</th>
                  <th className="py-3 px-4 font-medium text-right">Total</th>
                  <th className="py-3 px-4 font-medium text-right">GPA / Grade</th>
                  <th className="py-3 px-4 font-medium">Merit Rank</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.results.map((r) => {
                  const merit = meritMap.get(r.id);
                  return (
                  <tr key={r.id}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#1B2A6B] font-bn">{r.studentNameBn}</p>
                      <p className="text-xs text-slate-500 tabular-nums">{r.studentId} · {r.className}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">{r.examName}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{r.totalMarks}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {r.gpa.toFixed(2)} ({r.overallGrade})
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-[#1B2A6B] font-bn">
                      {merit?.rankBn || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium">
                      <span
                        className={
                          r.status === 'Published'
                            ? 'text-[#1F7A4D]'
                            : r.status === 'Verified'
                              ? 'text-[#1B2A6B]'
                              : 'text-amber-700'
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === 'Draft' && (
                          <button
                            type="button"
                            onClick={() => updateResultStatus(r.id, 'Verified', user?.name || 'Admin')}
                            className="px-2.5 py-1 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded hover:border-[#1B2A6B] cursor-pointer"
                          >
                            Verify
                          </button>
                        )}
                        {r.status !== 'Published' && (
                          <button
                            type="button"
                            onClick={() => updateResultStatus(r.id, 'Published', user?.name || 'Admin')}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-[#1F7A4D] rounded hover:bg-[#165B39] cursor-pointer"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPrintResult(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Marksheet</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminExamsPage() {
  const { db, addExam } = useSchoolStore();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [className, setClassName] = useState('Class 9');
  const [startDate, setStartDate] = useState('2026-12-05');
  const [endDate, setEndDate] = useState('2026-12-18');
  const [formErr, setFormErr] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = examCreateSchema.safeParse({
      name,
      nameBn: nameBn.trim() || name.trim(),
      className,
      startDate,
      endDate,
    });
    if (!parsed.success) {
      setFormErr(parsed.error.issues[0]?.message || 'পরীক্ষার সকল তথ্য সঠিকভাবে দিন');
      return;
    }
    setFormErr(null);
    addExam(
      {
        name: parsed.data.name,
        nameBn: parsed.data.nameBn,
        academicYear: '2026',
        className: parsed.data.className,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        subjects: ['Bangla (বাংলা)', 'English (ইংরেজি)', 'Mathematics (গণিত)', 'General Science (বিজ্ঞান)', 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)'],
        status: 'Upcoming',
      },
      user?.name || 'Admin'
    );
    setName('');
    setNameBn('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} noValidate className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        {formErr && (
          <div role="alert" className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {formErr}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <input aria-label="Exam name English" placeholder="Exam Name (English) *" value={name} onChange={(e) => setName(e.target.value)} className="lg:col-span-2 h-9 px-3 text-sm border border-slate-300 rounded-lg" />
          <input aria-label="Exam name Bangla" placeholder="পরীক্ষার নাম (বাংলা)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
          <select aria-label="Exam class" value={className} onChange={(e) => setClassName(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
            {CLASS_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input aria-label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 px-2 text-xs border border-slate-300 rounded-lg tabular-nums" />
          <button type="submit" className="h-9 px-4 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">Create Exam</button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {db.exams.map((ex) => (
          <article key={ex.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <p className="text-xs font-medium text-[#1F7A4D]">{ex.status} · {ex.className}</p>
            <h3 className="text-base font-medium text-[#1B2A6B]">{ex.nameBn}</h3>
            <p className="text-xs text-slate-600">{ex.name}</p>
            <p className="text-xs text-slate-500 tabular-nums">{ex.startDate} to {ex.endDate}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminAdmissionsPage() {
  const { db, updateAdmissionStatus } = useSchoolStore();
  const { user } = useAuth();
  const [inspectApp, setInspectApp] = useState<AdmissionApplication | null>(null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#1B2A6B]">নতুন ভর্তি আবেদনসমূহ (New Admission Queue)</h2>
        <span className="text-xs text-slate-500 tabular-nums">মোট আবেদন: {db.admissions.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
            <tr>
              <th className="py-3 px-4 font-medium">App No</th>
              <th className="py-3 px-4 font-medium">Applicant & Birth Cert</th>
              <th className="py-3 px-4 font-medium">Class & Stream</th>
              <th className="py-3 px-4 font-medium">Guardian & Mobile</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {db.admissions.map((a) => (
              <tr key={a.id}>
                <td className="py-3 px-4 tabular-nums text-xs font-medium text-[#1B2A6B]">{a.applicationNo}</td>
                <td className="py-3 px-4">
                  <p className="font-medium text-[#1B2A6B]">{a.applicantNameBn}</p>
                  <p className="text-xs text-slate-500">{a.applicantName}</p>
                  {a.birthCertificateNo && (
                    <p className="text-[11px] text-slate-400 tabular-nums">জন্ম সনদ: {a.birthCertificateNo}</p>
                  )}
                </td>
                <td className="py-3 px-4 text-xs">
                  <p className="font-medium">{a.applyingClass} · {a.program}</p>
                  {a.admissionType && <p className="text-slate-500">{a.admissionType}</p>}
                </td>
                <td className="py-3 px-4 text-xs">
                  <p>{a.guardianName}</p>
                  <p className="text-[#1F7A4D] tabular-nums">{a.guardianPhone}</p>
                </td>
                <td className="py-3 px-4 text-xs font-medium">
                  <span className={a.status === 'Approved' ? 'text-[#1F7A4D]' : a.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'}>
                    {a.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInspectApp(a)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded hover:border-[#1B2A6B] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>বিস্তারিত</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAdmissionStatus(a.id, 'Approved', 'প্রাথমিক যাচাই শেষে অনুমোদিত', user?.nameBn || 'Admin')}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-[#1F7A4D] rounded cursor-pointer"
                    >
                      অনুমোদন
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAdmissionStatus(a.id, 'Rejected', 'কাগজপত্র অসম্পূর্ণ থাকায় বাতিল', user?.nameBn || 'Admin')}
                      className="px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200 rounded hover:bg-red-50 cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(inspectApp)}
        onClose={() => setInspectApp(null)}
        title={inspectApp ? `ভর্তি আবেদন বিবরণী · ${inspectApp.applicationNo}` : ''}
        subtitle={inspectApp ? `${inspectApp.applicantNameBn} (${inspectApp.applicantName})` : ''}
      >
        {inspectApp && (
          <div className="space-y-4 text-xs">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F7F8FC] border border-slate-200 rounded-xl p-4">
              <div><dt className="text-slate-500">জন্ম তারিখ</dt><dd className="font-medium text-slate-800 tabular-nums">{inspectApp.dateOfBirth}</dd></div>
              <div><dt className="text-slate-500">১৭ ডিজিটের জন্ম সনদ নং</dt><dd className="font-semibold text-[#1B2A6B] tabular-nums">{inspectApp.birthCertificateNo || '—'}</dd></div>
              <div><dt className="text-slate-500">লিঙ্গ ও ধর্ম</dt><dd className="font-medium text-slate-800">{inspectApp.gender || '—'} · {inspectApp.religion || '—'}</dd></div>
              <div><dt className="text-slate-500">ভর্তিচ্ছু শ্রেণি ও ধরন</dt><dd className="font-medium text-slate-800">{inspectApp.applyingClass} ({inspectApp.program}) · {inspectApp.admissionType || 'নতুন ভর্তি'}</dd></div>
              <div><dt className="text-slate-500">পিতার তথ্য</dt><dd className="font-medium text-slate-800">{inspectApp.fatherNameBn || inspectApp.guardianName} {inspectApp.fatherOccupation ? `(${inspectApp.fatherOccupation})` : ''}</dd><dd className="text-slate-500 tabular-nums">NID: {inspectApp.fatherNid || '—'}</dd></div>
              <div><dt className="text-slate-500">মাতার তথ্য</dt><dd className="font-medium text-slate-800">{inspectApp.motherNameBn || '—'} {inspectApp.motherOccupation ? `(${inspectApp.motherOccupation})` : ''}</dd><dd className="text-slate-500 tabular-nums">NID: {inspectApp.motherNid || '—'}</dd></div>
              <div><dt className="text-slate-500">অভিভাবকের মোবাইল</dt><dd className="font-semibold text-[#1F7A4D] tabular-nums">{inspectApp.guardianPhone}</dd></div>
              <div><dt className="text-slate-500">পূর্ববর্তী বিদ্যালয় ও গ্রেড</dt><dd className="font-medium text-slate-800">{inspectApp.previousSchool || '—'} {inspectApp.previousClassGrade ? `· ${inspectApp.previousClassGrade}` : ''}</dd></div>
              <div className="sm:col-span-2"><dt className="text-slate-500">বর্তমান ঠিকানা</dt><dd className="font-medium text-slate-800">{inspectApp.address}</dd></div>
              {inspectApp.permanentAddress && (
                <div className="sm:col-span-2"><dt className="text-slate-500">স্থায়ী ঠিকানা</dt><dd className="font-medium text-slate-800">{inspectApp.permanentAddress}</dd></div>
              )}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}

function downloadCsvFile(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (val: string | number) => {
    const str = String(val ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = ['\uFEFF' + headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminReportsPage() {
  const { db } = useSchoolStore();
  const [reportTab, setReportTab] = useState<'attendance' | 'results' | 'admissions' | 'students' | 'finance' | 'staff'>('attendance');
  const [classFilter, setClassFilter] = useState('All');

  const filteredStudents = db.students.filter((s) => classFilter === 'All' || s.className === classFilter);
  const filteredResults = db.results.filter((r) => classFilter === 'All' || r.className === classFilter);
  const filteredAttendance = db.attendance.filter((a) => classFilter === 'All' || a.className === classFilter);
  const totalIncome = db.financeTransactions.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = db.financeTransactions.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const totalFeeCollected = db.fees.reduce((s, f) => s + f.paidAmount, 0);
  const totalFeeDue = db.fees.reduce((s, f) => s + f.dueAmount, 0);

  const handleExportCsv = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (reportTab === 'attendance') {
      downloadCsvFile(
        `BUTPHS-attendance-${today}.csv`,
        ['Date', 'Student ID', 'Name', 'Class', 'Section', 'Entry', 'Exit', 'Status', 'Source'],
        filteredAttendance.map((a) => [a.date, a.studentId, a.studentName, a.className, a.section, a.entryTime || '', a.exitTime || '', a.status, a.source])
      );
    } else if (reportTab === 'results') {
      downloadCsvFile(
        `BUTPHS-results-${today}.csv`,
        ['Student ID', 'Name', 'Class', 'Exam', 'Total Marks', 'GPA', 'Grade', 'Status'],
        filteredResults.map((r) => [r.studentId, r.studentNameBn, r.className, r.examName, r.totalMarks, r.gpa.toFixed(2), r.overallGrade, r.status])
      );
    } else if (reportTab === 'admissions') {
      downloadCsvFile(
        `BUTPHS-admissions-${today}.csv`,
        ['App No', 'Applicant', 'Class', 'Guardian', 'Phone', 'Submitted', 'Status'],
        db.admissions.map((a) => [a.applicationNo, a.applicantNameBn, a.applyingClass, a.guardianName, a.guardianPhone, a.submittedDate, a.status])
      );
    } else if (reportTab === 'students') {
      downloadCsvFile(
        `BUTPHS-students-${today}.csv`,
        ['Student ID', 'Roll', 'Name (Bn)', 'Name (En)', 'Class', 'Section', 'Guardian', 'Phone', 'RFID'],
        filteredStudents.map((s) => [s.studentId, s.roll, s.nameBn, s.name, s.className, s.section, s.guardianName, s.guardianPhone, s.rfidCardId || ''])
      );
    } else if (reportTab === 'finance') {
      downloadCsvFile(
        `BUTPHS-finance-${today}.csv`,
        ['Voucher', 'Date', 'Type', 'Category', 'Description', 'Amount (BDT)'],
        db.financeTransactions.map((t) => [t.voucherNo, t.date, t.type, t.category, t.descriptionBn, t.amount])
      );
    } else {
      downloadCsvFile(
        `BUTPHS-teachers-staff-${today}.csv`,
        ['Employee ID', 'Name', 'Role', 'Department', 'Phone', 'Status'],
        [
          ...db.teachers.map((t) => [t.employeeId, t.nameBn, t.designationBn, t.departmentBn || t.department, t.phone, t.status]),
          ...db.staff.map((m) => [m.employeeId, m.nameBn, m.roleBn, m.departmentBn || m.department, m.phone, m.status]),
        ]
      );
    }
  };

  const REPORT_TABS: Array<{ id: typeof reportTab; label: string }> = [
    { id: 'attendance', label: 'উপস্থিতি প্রতিবেদন' },
    { id: 'results', label: 'ফলাফল ও মেধাতালিকা' },
    { id: 'students', label: 'শিক্ষার্থী তালিকা' },
    { id: 'admissions', label: 'ভর্তি আবেদন' },
    { id: 'finance', label: 'আর্থিক ও বেতন-ফি' },
    { id: 'staff', label: 'শিক্ষক ও কর্মচারী' },
  ];

  return (
    <div className="space-y-5 font-bn">
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {REPORT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                reportTab === tab.id ? 'bg-[#1B2A6B] text-white' : 'bg-[#F7F8FC] text-slate-700 hover:text-[#1B2A6B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(reportTab === 'attendance' || reportTab === 'results' || reportTab === 'students') && (
            <select
              aria-label="রিপোর্ট শ্রেণি ফিল্টার"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="All">সকল শ্রেণি</option>
              {CLASS_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1B2A6B] bg-[#F7F8FC] border border-slate-300 hover:border-[#1B2A6B] rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV ডাউনলোড</span>
          </button>
          <button
            type="button"
            onClick={() => printElementById('admin-report-sheet', `BUTPHS ${reportTab} Report`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      <div id="admin-report-sheet">
        {reportTab === 'attendance' && (
          <PrintDocumentView docType="attendance-report" attendanceRecords={filteredAttendance} />
        )}
        {reportTab !== 'attendance' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-[#1B2A6B]">
                  {REPORT_TABS.find((t) => t.id === reportTab)?.label} — {SCHOOL_INFO.nameBn}
                </h2>
                <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                  EIIN: {SCHOOL_INFO.eiin} · শিক্ষাবর্ষ: {db.websiteContent.academicSession} · তারিখ: {new Date().toISOString().slice(0, 10)}
                </p>
              </div>
              {reportTab === 'finance' && (
                <div className="flex flex-wrap gap-3 text-xs tabular-nums">
                  <span className="text-[#1F7A4D] font-semibold">মোট আয়: {formatCurrencyBdt(totalIncome)}</span>
                  <span className="text-red-700 font-semibold">মোট ব্যয়: {formatCurrencyBdt(totalExpense)}</span>
                  <span className="text-[#1B2A6B] font-semibold">আদায় ফি: {formatCurrencyBdt(totalFeeCollected)} · বকেয়া: {formatCurrencyBdt(totalFeeDue)}</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              {reportTab === 'results' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F8FC] border-b border-slate-200 text-[#1B2A6B]">
                    <tr>
                      <th className="py-2.5 px-3">শিক্ষার্থী আইডি</th>
                      <th className="py-2.5 px-3">নাম</th>
                      <th className="py-2.5 px-3">শ্রেণি ও পরীক্ষা</th>
                      <th className="py-2.5 px-3 text-right">মোট নম্বর</th>
                      <th className="py-2.5 px-3 text-right">GPA / গ্রেড</th>
                      <th className="py-2.5 px-3">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{r.studentId}</td>
                        <td className="py-2.5 px-3 font-medium text-[#1B2A6B]">{r.studentNameBn}</td>
                        <td className="py-2.5 px-3">{r.className} · {r.examName}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-sans">{r.totalMarks}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-sans font-semibold">{r.gpa.toFixed(2)} ({r.overallGrade})</td>
                        <td className="py-2.5 px-3 font-sans">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportTab === 'students' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F8FC] border-b border-slate-200 text-[#1B2A6B]">
                    <tr>
                      <th className="py-2.5 px-3">আইডি</th>
                      <th className="py-2.5 px-3">রোল</th>
                      <th className="py-2.5 px-3">শিক্ষার্থীর নাম</th>
                      <th className="py-2.5 px-3">শ্রেণি ও শাখা</th>
                      <th className="py-2.5 px-3">অভিভাবক ও মোবাইল</th>
                      <th className="py-2.5 px-3">RFID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => (
                      <tr key={s.id}>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{s.studentId}</td>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{s.roll}</td>
                        <td className="py-2.5 px-3 font-medium text-[#1B2A6B]">{s.nameBn}</td>
                        <td className="py-2.5 px-3">{s.className} · {s.section}</td>
                        <td className="py-2.5 px-3">{s.guardianNameBn || s.guardianName} (<span className="tabular-nums font-sans">{s.guardianPhone}</span>)</td>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{s.rfidCardId || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportTab === 'admissions' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F8FC] border-b border-slate-200 text-[#1B2A6B]">
                    <tr>
                      <th className="py-2.5 px-3">আবেদন নং</th>
                      <th className="py-2.5 px-3">আবেদনকারী</th>
                      <th className="py-2.5 px-3">ভর্তিচ্ছু শ্রেণি</th>
                      <th className="py-2.5 px-3">অভিভাবক ও মোবাইল</th>
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {db.admissions.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{a.applicationNo}</td>
                        <td className="py-2.5 px-3 font-medium text-[#1B2A6B]">{a.applicantNameBn}</td>
                        <td className="py-2.5 px-3">{a.applyingClass}</td>
                        <td className="py-2.5 px-3">{a.guardianName} (<span className="tabular-nums font-sans">{a.guardianPhone}</span>)</td>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{a.submittedDate}</td>
                        <td className="py-2.5 px-3 font-sans">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportTab === 'finance' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F8FC] border-b border-slate-200 text-[#1B2A6B]">
                    <tr>
                      <th className="py-2.5 px-3">ভাউচার নং</th>
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3">খাত ও বিবরণ</th>
                      <th className="py-2.5 px-3">ধরন</th>
                      <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {db.financeTransactions.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{t.voucherNo}</td>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{t.date}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-slate-800">{t.category}</span> — {t.descriptionBn}
                        </td>
                        <td className={`py-2.5 px-3 font-semibold ${t.type === 'Income' ? 'text-[#1F7A4D]' : 'text-red-700'}`}>
                          {t.type === 'Income' ? 'আয়' : 'ব্যয়'}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-sans font-semibold">
                          {formatCurrencyBdt(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {reportTab === 'staff' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F8FC] border-b border-slate-200 text-[#1B2A6B]">
                    <tr>
                      <th className="py-2.5 px-3">আইডি</th>
                      <th className="py-2.5 px-3">নাম</th>
                      <th className="py-2.5 px-3">পদবি</th>
                      <th className="py-2.5 px-3">বিভাগ</th>
                      <th className="py-2.5 px-3">মোবাইল</th>
                      <th className="py-2.5 px-3">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {db.teachers.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{t.employeeId}</td>
                        <td className="py-2.5 px-3 font-medium text-[#1B2A6B]">{t.nameBn}</td>
                        <td className="py-2.5 px-3">{t.designationBn}</td>
                        <td className="py-2.5 px-3">{t.departmentBn || t.department}</td>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{t.phone}</td>
                        <td className="py-2.5 px-3 font-sans">{t.status}</td>
                      </tr>
                    ))}
                    {db.staff.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{m.employeeId}</td>
                        <td className="py-2.5 px-3 font-medium text-[#1B2A6B]">{m.nameBn}</td>
                        <td className="py-2.5 px-3">{m.roleBn}</td>
                        <td className="py-2.5 px-3">{m.departmentBn || m.department}</td>
                        <td className="py-2.5 px-3 tabular-nums font-sans">{m.phone}</td>
                        <td className="py-2.5 px-3 font-sans">{m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminAuditLogsPage() {
  const { db } = useSchoolStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  const modules = useMemo(
    () => Array.from(new Set(db.auditLogs.map((l) => l.module))).sort(),
    [db.auditLogs]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.auditLogs.filter((log) => {
      if (roleFilter !== 'all' && log.role !== roleFilter) return false;
      if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
      if (!q) return true;
      return (
        log.user.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    });
  }, [db.auditLogs, search, roleFilter, moduleFilter]);

  return (
    <div className="space-y-4 font-bn">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="search"
            aria-label="অডিট লগ খুঁজুন"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ব্যবহারকারী, মডিউল বা কার্যক্রম খুঁজুন..."
            className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="রোল ফিল্টার"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">সকল রোল</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="accountant">Accountant</option>
            <option value="parent">Parent</option>
          </select>
          <select
            aria-label="মডিউল ফিল্টার"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white font-sans"
          >
            <option value="all">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              downloadCsvFile(
                `BUTPHS-audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
                ['Timestamp', 'User', 'Role', 'Module', 'Action'],
                filtered.map((l) => [l.timestamp, l.user, l.role, l.module, l.action])
              )
            }
            className="h-10 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B2A6B] bg-[#F7F8FC] border border-slate-300 hover:border-[#1B2A6B] rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1B2A6B]">প্রশাসনিক অডিট লগ ({toBanglaDigits(filtered.length)} টি রেকর্ড)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
              <tr>
                <th className="py-3 px-4 font-medium">সময়কাল</th>
                <th className="py-3 px-4 font-medium">ব্যবহারকারী ও রোল</th>
                <th className="py-3 px-4 font-medium">মডিউল</th>
                <th className="py-3 px-4 font-medium">কার্যক্রম বিবরণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F8FC]/60">
                  <td className="py-3 px-4 tabular-nums text-xs text-slate-600 font-sans whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[#1B2A6B]">
                    {log.user} <span className="text-slate-400 font-sans">({log.role})</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#1F7A4D] font-semibold font-sans">{log.module}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminSmsPage() {
  const { db, sendSimulatedSms } = useSchoolStore();
  const { user } = useAuth();
  const [recipientGroup, setRecipientGroup] = useState<SmsLog['recipientGroup']>('All Parents');
  const [recipientPhone, setRecipientPhone] = useState('সকল নিবন্ধিত অভিভাবক');
  const [message, setMessage] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = smsSchema.safeParse({ recipientGroup, recipientPhone, message });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message || 'অনুগ্রহ করে বার্তা লিখুন।');
      return;
    }
    sendSimulatedSms(
      {
        recipientName: `${recipientGroup} বিজ্ঞপ্তি`,
        recipientPhone: parsed.data.recipientPhone,
        recipientGroup: parsed.data.recipientGroup,
        message: `${parsed.data.message} — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়`,
      },
      user?.nameBn || 'Admin'
    );
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSend} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4" noValidate>
        <div>
          <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">অভিভাবক ও শিক্ষক SMS বিজ্ঞপ্তি প্রেরণ</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-bn">শ্রেণিভিত্তিক বা সকল অভিভাবকের মোবাইলে জরুরি ঘোষণা ও উপস্থিতি বার্তা পাঠান।</p>
        </div>
        {err && <div role="alert" className="p-2.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg font-bn">{err}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="sms-group" className="block text-xs font-medium text-slate-700 mb-1 font-bn">প্রাপক গ্রুপ</label>
            <select id="sms-group" value={recipientGroup} onChange={(e) => setRecipientGroup(e.target.value as SmsLog['recipientGroup'])} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
              {(['All Parents', 'Class Wise', 'Teachers', 'Guardian'] as SmsLog['recipientGroup'][]).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sms-target" className="block text-xs font-medium text-slate-700 mb-1 font-bn">প্রাপক নম্বর / শ্রেণি</label>
            <input id="sms-target" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-bn" />
          </div>
        </div>
        <div>
          <label htmlFor="sms-body" className="block text-xs font-medium text-slate-700 mb-1 font-bn">বার্তার বিষয়বস্তু (বাংলা / ইংরেজি)</label>
          <textarea id="sms-body" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="বিদ্যালয়ের জরুরি SMS বার্তা লিখুন..." className="w-full p-3 text-sm border border-slate-300 rounded-lg font-bn" />
        </div>
        <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1F7A4D] rounded-lg cursor-pointer font-bn">
          <Send className="w-4 h-4" />
          <span>SMS বিজ্ঞপ্তি পাঠান</span>
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn">প্রেরিত SMS বার্তার ইতিহাস ({db.smsLogs.length})</h3>
        <div className="divide-y divide-slate-100">
          {db.smsLogs.map((log) => (
            <div key={log.id} className="py-3 text-xs space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-[#1B2A6B]">{log.recipientName} · {log.recipientPhone}</span>
                <span className="text-[#1F7A4D] font-medium tabular-nums">{log.deliveryStatus} · {log.timestamp}</span>
              </div>
              <p className="text-slate-700 font-bn">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminPrintDocumentsPage() {
  return <PrintManagementCenter />;
}

export function AdminSettingsPage() {
  const { db, updateWebsiteContent, resetDemoData } = useSchoolStore();
  const { user } = useAuth();
  const [session, setSession] = useState(db.websiteContent.academicSession);
  const defaultSys = db.websiteContent.systemSettings || {
    admissionOpen: true,
    currentExamTerm: 'বার্ষিক পরীক্ষা ২০২৬',
    lateArrivalTime: '09:30 AM',
    passMarksPercent: 33,
    autoSmsOnRfidEntry: true,
    autoSmsOnRfidExit: true,
    autoSmsOnAbsent: true,
    autoSmsOnFeePayment: true,
  };
  const [sys, setSys] = useState(defaultSys);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent(
      {
        academicSession: session,
        systemSettings: sys,
      },
      user?.nameBn || 'Admin'
    );
  };

  const handleExportBackup = () => {
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BUTPHS-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl font-bn">
      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-[#1B2A6B]">প্রাতিষ্ঠানিক ও একাডেমিক সেটিংস</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              শিক্ষাবর্ষ, পরীক্ষা পর্ব, RFID বিলম্ব সময়সীমা এবং স্বয়ংক্রিয় SMS নীতিমালা নির্ধারণ করুন।
            </p>
          </div>
          <span className="text-xs text-slate-500 tabular-nums font-sans">
            EIIN: {SCHOOL_INFO.eiin} · Code: {SCHOOL_INFO.schoolCode}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="set-session" className="block text-xs font-medium text-slate-700 mb-1">সক্রিয় শিক্ষাবর্ষ</label>
            <input id="set-session" value={session} onChange={(e) => setSession(e.target.value)} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
          </div>
          <div>
            <label htmlFor="set-term" className="block text-xs font-medium text-slate-700 mb-1">চলমান পরীক্ষা পর্ব</label>
            <input id="set-term" value={sys.currentExamTerm} onChange={(e) => setSys({ ...sys, currentExamTerm: e.target.value })} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label htmlFor="set-late" className="block text-xs font-medium text-slate-700 mb-1">RFID গেট বিলম্ব সময়সীমা (Late Cutoff)</label>
            <input id="set-late" value={sys.lateArrivalTime} onChange={(e) => setSys({ ...sys, lateArrivalTime: e.target.value })} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
          </div>
          <div>
            <label htmlFor="set-pass" className="block text-xs font-medium text-slate-700 mb-1">ন্যূনতম পাস নম্বর (%)</label>
            <input id="set-pass" type="number" min={20} max={50} value={sys.passMarksPercent} onChange={(e) => setSys({ ...sys, passMarksPercent: Number(e.target.value) })} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <p className="text-xs font-semibold text-[#1B2A6B]">স্বয়ংক্রিয় বিজ্ঞপ্তি ও ভর্তি নিয়ন্ত্রণ</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(
              [
                { key: 'admissionOpen', label: 'অনলাইন ভর্তি আবেদন চালু রাখুন' },
                { key: 'autoSmsOnRfidEntry', label: 'RFID প্রবেশে অভিভাবককে স্বয়ংক্রিয় SMS' },
                { key: 'autoSmsOnRfidExit', label: 'RFID প্রস্থানে অভিভাবককে স্বয়ংক্রিয় SMS' },
                { key: 'autoSmsOnAbsent', label: 'অনুপস্থিত শিক্ষার্থীদের অভিভাবককে SMS' },
                { key: 'autoSmsOnFeePayment', label: 'বেতন ও ফি পরিশোধে ডিজিটাল রসিদ SMS' },
              ] as const
            ).map((item) => (
              <label key={item.key} className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F7F8FC] border border-slate-200/80 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={sys[item.key]}
                  onChange={(e) => setSys({ ...sys, [item.key]: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#1F7A4D]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>সেটিংস সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1B2A6B]">ডেটাবেস ব্যাকআপ (JSON ডাউনলোড)</h3>
            <p className="text-xs text-slate-500 mt-1">
              সকল শিক্ষার্থী, শিক্ষক, হাজিরা, ফলাফল, আর্থিক ভাউচার ও ওয়েবসাইট কনটেন্টের পূর্ণাঙ্গ ব্যাকআপ সংরক্ষণ করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportBackup}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1B2A6B] bg-[#F7F8FC] border border-slate-300 hover:border-[#1B2A6B] rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ব্যাকআপ ডাউনলোড করুন</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1B2A6B]">প্রাতিষ্ঠানিক ডেটা রিসেট</h3>
            <p className="text-xs text-slate-500 mt-1">
              সকল পরিবর্তন বাতিল করে সিস্টেমকে প্রাথমিক সংরক্ষিত অবস্থায় ফিরিয়ে আনুন।
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>তথ্য রিসেট করুন</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="প্রাতিষ্ঠানিক ডেটাবেস রিসেট করবেন?"
        message="নিশ্চিত করলে আপনার সাম্প্রতিক সংযোজনসমূহ মুছে গিয়ে সিস্টেম প্রাথমিক অবস্থায় ফিরে যাবে।"
        confirmLabel="রিসেট নিশ্চিত করুন"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          setConfirmReset(false);
        }}
      />
    </div>
  );
}

export function AdminPasswordSecurityPage() {
  const { addToast, logAudit } = useSchoolStore();
  const { user } = useAuth();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  // Per-account quick password update state for Admin
  const [accountDrafts, setAccountDrafts] = useState<Record<string, string>>({});
  const [refreshTick, setRefreshTick] = useState(0);

  const strength = evaluatePasswordStrength(newPwd);

  const handleChangeOwnPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdFeedback(null);
    if (!currentPwd.trim()) {
      setPwdFeedback({ ok: false, message: 'বর্তমান পাসওয়ার্ড প্রদান করুন।' });
      return;
    }
    if (!strength.valid) {
      setPwdFeedback({ ok: false, message: strength.errorBn || 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdFeedback({ ok: false, message: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।' });
      return;
    }

    const res = authService.changePassword(user?.email || 'admin@butphs.edu.bd', currentPwd, newPwd);
    setPwdFeedback(res);
    if (res.ok) {
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setRefreshTick((t) => t + 1);
      logAudit(user?.nameBn || 'Admin', user?.role || 'admin', 'Security', `নিজস্ব অ্যাকাউন্ট (${user?.email}) পাসওয়ার্ড পরিবর্তন করা হয়েছে`);
      addToast('success', 'পাসওয়ার্ড পরিবর্তন সম্পন্ন', 'পরবর্তী লগইনে নতুন পাসওয়ার্ড কার্যকর হবে।');
    }
  };

  const handleAdminUpdateAccount = (email: string) => {
    const draft = (accountDrafts[email] || '').trim();
    const res = authService.adminSetAccountPassword(email, draft);
    if (!res.ok) {
      addToast('error', 'পাসওয়ার্ড হালনাগাদ ব্যর্থ', res.message);
      return;
    }
    setAccountDrafts((prev) => ({ ...prev, [email]: '' }));
    setRefreshTick((t) => t + 1);
    logAudit(user?.nameBn || 'Admin', 'admin', 'Security', `পোর্টাল অ্যাকাউন্ট (${email}) পাসওয়ার্ড হালনাগাদ করা হয়েছে`);
    addToast('success', 'পাসওয়ার্ড হালনাগাদ সম্পন্ন', res.message);
  };

  const handleAdminResetAccount = (email: string) => {
    const res = authService.adminResetAccountPassword(email);
    setRefreshTick((t) => t + 1);
    logAudit(user?.nameBn || 'Admin', 'admin', 'Security', `পোর্টাল অ্যাকাউন্ট (${email}) পাসওয়ার্ড ডিফল্টে রিসেট`);
    addToast('info', 'পাসওয়ার্ড রিসেট হয়েছে', res.message);
  };

  return (
    <div className="space-y-6 max-w-4xl font-bn" data-security-refresh={refreshTick}>
      {/* Change Own Password Card */}
      <form onSubmit={handleChangeOwnPassword} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4" noValidate>
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-[#1B2A6B] inline-flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#1F7A4D]" />
              <span>নিজস্ব পাসওয়ার্ড পরিবর্তন করুন</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              বর্তমান সক্রিয় অ্যাকাউন্ট: <span className="font-sans font-medium text-[#1B2A6B]">{user?.email || 'admin@butphs.edu.bd'}</span>
            </p>
          </div>
        </div>

        {pwdFeedback && (
          <div
            role="alert"
            className={`flex items-start gap-2 p-3 rounded-lg text-xs border ${
              pwdFeedback.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {pwdFeedback.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{pwdFeedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="pwd-current" className="block text-xs font-medium text-slate-700 mb-1">বর্তমান পাসওয়ার্ড *</label>
            <div className="relative">
              <input
                id="pwd-current"
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="বর্তমান পাসওয়ার্ড"
                className="w-full h-10 pl-3 pr-9 text-sm border border-slate-300 rounded-lg font-sans"
                required
              />
              <button
                type="button"
                aria-label={showCurrent ? 'বর্তমান পাসওয়ার্ড লুকান' : 'বর্তমান পাসওয়ার্ড দেখুন'}
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="pwd-new" className="block text-xs font-medium text-slate-700 mb-1">নতুন পাসওয়ার্ড *</label>
            <div className="relative">
              <input
                id="pwd-new"
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষর"
                className="w-full h-10 pl-3 pr-9 text-sm border border-slate-300 rounded-lg font-sans"
                required
              />
              <button
                type="button"
                aria-label={showNew ? 'নতুন পাসওয়ার্ড লুকান' : 'নতুন পাসওয়ার্ড দেখুন'}
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPwd.length > 0 && (
              <div className="mt-1.5 space-y-1">
                <div className="grid grid-cols-3 gap-1 h-1">
                  {[1, 2, 3].map((lvl) => (
                    <span
                      key={lvl}
                      className={`rounded-full ${
                        strength.score >= lvl
                          ? strength.score === 3
                            ? 'bg-[#1F7A4D]'
                            : strength.score === 2
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-600">শক্তিমাত্রা: {strength.labelBn}</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="pwd-confirm" className="block text-xs font-medium text-slate-700 mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন *</label>
            <input
              id="pwd-confirm"
              type={showNew ? 'text' : 'password'}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="পুনরায় লিখুন"
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg font-sans"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>পাসওয়ার্ড পরিবর্তন করুন</span>
          </button>
        </div>
      </form>

      {/* Portal Accounts Password Control Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-[#1B2A6B]">পোর্টাল অ্যাকাউন্ট পাসওয়ার্ড ব্যবস্থাপনা</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রশাসন, শিক্ষক, হিসাবরক্ষক ও অভিভাবক পোর্টাল অ্যাকাউন্টের পাসওয়ার্ড এখান থেকে সরাসরি হালনাগাদ বা রিসেট করুন।
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-[#1B2A6B]">
              <tr>
                <th className="py-3 px-4 font-medium">পোর্টাল ও ব্যবহারকারী</th>
                <th className="py-3 px-4 font-medium">লগইন ইমেইল</th>
                <th className="py-3 px-4 font-medium">অবস্থা</th>
                <th className="py-3 px-4 font-medium">নতুন পাসওয়ার্ড সেট করুন</th>
                <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PORTAL_ACCOUNTS.map((acc) => {
                const isCustom = authService.hasCustomPassword(acc.email);
                return (
                  <tr key={acc.id}>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1B2A6B]">{acc.labelBn}</p>
                      <p className="text-slate-500">{acc.user.nameBn}</p>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">{acc.email}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${isCustom ? 'text-[#1F7A4D]' : 'text-slate-500'}`}>
                        {isCustom ? 'কাস্টম পাসওয়ার্ড' : 'ডিফল্ট'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="password"
                        aria-label={`New password for ${acc.email}`}
                        value={accountDrafts[acc.email] || ''}
                        onChange={(e) => setAccountDrafts((prev) => ({ ...prev, [acc.email]: e.target.value }))}
                        placeholder="নতুন পাসওয়ার্ড (৬+ অক্ষর)"
                        className="w-44 h-8 px-2.5 text-xs border border-slate-300 rounded-md font-sans"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdminUpdateAccount(acc.email)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#121D4D] rounded-md cursor-pointer"
                        >
                          আপডেট
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleAdminResetAccount(acc.email)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-md cursor-pointer"
                          >
                            রিসেট
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminNoticesAndSmsPage({ defaultTab = 'notices' }: { defaultTab?: 'notices' | 'sms' }) {
  const { db } = useSchoolStore();
  const [tab, setTab] = useState<'notices' | 'sms'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-5">
      <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('notices')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'notices' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>ডিজিটাল নোটিশ বোর্ড ({db.notices.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('sms')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'sms' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>অভিভাবক ও শিক্ষক SMS ({db.smsLogs.length})</span>
        </button>
      </div>

      {tab === 'notices' ? <AdminNoticesPage /> : <AdminSmsPage />}
    </div>
  );
}

export function AdminExamsAndResultsPage({ defaultTab = 'results' }: { defaultTab?: 'results' | 'exams' }) {
  const { db } = useSchoolStore();
  const [tab, setTab] = useState<'results' | 'exams'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-5">
      <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('results')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'results' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          ফলাফল যাচাই ও প্রকাশনা ({db.results.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('exams')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'exams' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          পরীক্ষা ও সময়সূচি ({db.exams.length})
        </button>
      </div>

      {tab === 'results' ? <AdminResultsPage /> : <AdminExamsPage />}
    </div>
  );
}

export function AdminSettingsHubPage({
  defaultTab = 'settings',
}: {
  defaultTab?: 'settings' | 'security' | 'reports' | 'audit';
}) {
  const [tab, setTab] = useState<'settings' | 'security' | 'reports' | 'audit'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-5">
      <div className="no-print inline-flex flex-wrap bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('settings')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'settings' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>প্রাতিষ্ঠানিক সেটিংস</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('security')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'security' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>পাসওয়ার্ড ও নিরাপত্তা</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('reports')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'reports' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>রিপোর্ট ও প্রিন্ট</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('audit')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'audit' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>অডিট লগ</span>
        </button>
      </div>

      {tab === 'settings' && <AdminSettingsPage />}
      {tab === 'security' && <AdminPasswordSecurityPage />}
      {tab === 'reports' && <AdminReportsPage />}
      {tab === 'audit' && <AdminAuditLogsPage />}
    </div>
  );
}

