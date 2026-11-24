import { useId } from 'react';
import { Award, Download, Printer } from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { toBanglaNumber } from '../../utils/grading';
import { downloadElementAsPrintableHtml, printElementById } from '../../utils/printDocument';
import type { AttendanceRecord, Student, StudentResult } from '../../types';

export type PrintableDocType =
  | 'marksheet'
  | 'admit-card'
  | 'student-id'
  | 'testimonial'
  | 'certificate'
  | 'attendance-report';

interface PrintDocumentViewProps {
  docType: PrintableDocType;
  student?: Student;
  result?: StudentResult;
  attendanceRecords?: AttendanceRecord[];
  examName?: string;
  meritRankBn?: string;
  totalInClass?: number;
  onClose?: () => void;
}

export function PrintDocumentView({
  docType,
  student,
  result,
  attendanceRecords = [],
  examName = 'বার্ষিক পরীক্ষা ২০২৬',
  meritRankBn,
  totalInClass,
  onClose,
}: PrintDocumentViewProps) {
  const uniqueSuffix = useId().replace(/:/g, '');
  const sheetId = `bhs-doc-sheet-${docType}-${uniqueSuffix}`;
  const docTitles: Record<PrintableDocType, { en: string; bn: string }> = {
    marksheet: { en: 'Academic Transcript / Marksheet', bn: 'একাডেমিক ট্রান্সক্রিপ্ট / নম্বরপত্র' },
    'admit-card': { en: 'Examination Admit Card', bn: 'পরীক্ষার প্রবেশপত্র' },
    'student-id': { en: 'Student Identity Card', bn: 'শিক্ষার্থী পরিচয়পত্র' },
    testimonial: { en: 'Character & Study Testimonial', bn: 'প্রশংসাপত্র (Testimonial)' },
    certificate: { en: 'Studentship / Transfer Certificate', bn: 'প্রত্যয়নপত্র (Certificate)' },
    'attendance-report': { en: 'Student Attendance Report', bn: 'শিক্ষার্থী উপস্থিতি প্রতিবেদন' },
  };

  const titleObj = docTitles[docType];

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-[#F7F8FC] border border-slate-200 rounded-lg p-3.5">
        <div>
          <p className="text-sm font-medium text-[#1B2A6B] font-bn">
            {titleObj.en} · {titleObj.bn}
          </p>
          <p className="text-xs text-slate-600">
            A4 print-ready layout · Navigation and buttons are hidden automatically on print.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
            >
              Close Preview
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              downloadElementAsPrintableHtml(
                sheetId,
                `BUTPHS-${docType}-${student?.studentId || result?.studentId || 'record'}.html`,
                `${titleObj.bn} — ${SCHOOL_INFO.nameBn}`
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer font-bn"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>প্রিন্ট কপি সংরক্ষণ</span>
          </button>
          <button
            type="button"
            onClick={() => printElementById(sheetId, `${titleObj.bn} — ${SCHOOL_INFO.nameBn}`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors whitespace-nowrap cursor-pointer font-bn"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>প্রিন্ট করুন (A4)</span>
          </button>
        </div>
      </div>

      <article id={sheetId} className="print-document-sheet bg-white border border-slate-300 rounded-lg p-6 sm:p-8 max-w-[210mm] mx-auto text-slate-900">
        {/* School Letterhead */}
        <header className="flex flex-col sm:flex-row items-center gap-4 pb-5 border-b-2 border-[#1B2A6B]">
          <img
            src={SCHOOL_INFO.assets.logo}
            alt="Bijhari Upashi Tara Prasanna High School Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] font-bn leading-tight">
              {SCHOOL_INFO.nameBn}
            </h2>
            <p className="text-sm sm:text-base font-medium text-slate-800 mt-0.5">
              {SCHOOL_INFO.nameEn}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {SCHOOL_INFO.addressEn} · EIIN: {SCHOOL_INFO.eiin} · School Code: {SCHOOL_INFO.schoolCode} · Est. {SCHOOL_INFO.established}
            </p>
          </div>
          <div className="text-center sm:text-right text-xs text-slate-500 shrink-0">
            <p className="font-medium text-[#1F7A4D]">OFFICIAL RECORD</p>
            <p className="tabular-nums">Date: {new Date().toISOString().slice(0, 10)}</p>
          </div>
        </header>

        {/* Document Banner */}
        <div className="text-center py-4 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-semibold text-[#1B2A6B] font-bn">
            {titleObj.bn}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5">{titleObj.en}</p>
        </div>

        {/* Student Details Grid */}
        {student && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 py-4 text-sm border-b border-slate-200">
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Student Name:</span>
              <span className="font-medium text-slate-900 font-bn">{student.name} / {student.nameBn}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Student ID:</span>
              <span className="font-medium tabular-nums">{student.studentId}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Class & Section:</span>
              <span className="font-medium font-bn">{student.className} · {student.section}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Class Roll / Session:</span>
              <span className="font-medium tabular-nums">Roll {student.roll} · {student.session}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">Guardian:</span>
              <span className="font-medium">{student.guardianName}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-600">RFID Card / Group:</span>
              <span className="font-medium tabular-nums">
                {student.rfidCardId || 'Unassigned'} · {student.group || 'General'}
              </span>
            </div>
          </div>
        )}

        {/* Body by Document Type */}
        {docType === 'marksheet' && result && (
          <div className="py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F7F8FC] border border-slate-200 rounded-lg p-3.5 text-sm">
              <div>
                <p className="text-[11px] text-slate-500 font-bn">পরীক্ষার নাম (Examination)</p>
                <p className="font-semibold text-[#1B2A6B] mt-0.5">{result.examName}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-bn">ফলাফল ও জিপিএ (Result & GPA)</p>
                <p className="font-semibold text-[#1F7A4D] tabular-nums mt-0.5">
                  {result.passed ? 'উত্তীর্ণ (PASSED)' : 'অনুত্তীর্ণ (FAILED)'} · GPA {result.gpa.toFixed(2)} ({result.overallGrade})
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] text-slate-500 font-bn">শ্রেণিতে মেধাক্রম (Merit Position)</p>
                <p className="inline-flex items-center gap-1.5 font-bold text-[#1B2A6B] font-bn mt-0.5">
                  <Award className="w-4 h-4 text-[#C9A961]" aria-hidden="true" />
                  <span>{meritRankBn || 'যাচাইকৃত'}</span>
                  {totalInClass ? (
                    <span className="text-xs font-normal text-slate-500 tabular-nums">
                      ({toBanglaNumber(totalInClass)} জনের মধ্যে)
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-300">
                <thead>
                  <tr className="bg-[#F7F8FC] text-[#1B2A6B] text-left">
                    <th className="py-2 px-3 border border-slate-300 font-medium">Code</th>
                    <th className="py-2 px-3 border border-slate-300 font-medium">Subject (বিষয়)</th>
                    <th className="py-2 px-3 border border-slate-300 font-medium text-right">Full</th>
                    <th className="py-2 px-3 border border-slate-300 font-medium text-right">Obtained</th>
                    <th className="py-2 px-3 border border-slate-300 font-medium text-center">Grade</th>
                    <th className="py-2 px-3 border border-slate-300 font-medium text-right">GP</th>
                  </tr>
                </thead>
                <tbody>
                  {result.marks.map((m) => (
                    <tr key={m.subjectCode}>
                      <td className="py-2 px-3 border border-slate-300 tabular-nums">{m.subjectCode}</td>
                      <td className="py-2 px-3 border border-slate-300 font-bn">{m.subjectName}</td>
                      <td className="py-2 px-3 border border-slate-300 text-right tabular-nums">{m.fullMarks}</td>
                      <td className="py-2 px-3 border border-slate-300 text-right font-medium tabular-nums">{m.obtainedMarks}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-medium">{m.grade}</td>
                      <td className="py-2 px-3 border border-slate-300 text-right tabular-nums">{m.gradePoint.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#F7F8FC] font-medium">
                    <td colSpan={3} className="py-2.5 px-3 border border-slate-300 text-right">
                      Total Marks & Overall GPA
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-right tabular-nums">{result.totalMarks}</td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center text-[#1F7A4D]">{result.overallGrade}</td>
                    <td className="py-2.5 px-3 border border-slate-300 text-right tabular-nums text-[#1F7A4D]">
                      {result.gpa.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {docType === 'admit-card' && student && (
          <div className="py-5 space-y-4 text-sm">
            <p className="font-medium text-[#1B2A6B] font-bn">
              Examination: {examName} · Center: Bijhari Upashi Tara Prasanna High School Campus
            </p>
            <div className="border border-slate-200 rounded p-4 bg-[#F7F8FC] space-y-1.5 font-bn">
              <p className="font-medium text-[#1B2A6B]">পরীক্ষার্থীদের জন্য নির্দেশাবলি (Instructions):</p>
              <p>১. পরীক্ষা শুরুর অন্তত ৩০ মিনিট পূর্বে পরীক্ষার কক্ষে প্রবেশ করতে হবে।</p>
              <p>২. প্রবেশপত্র এবং বিদ্যালয়ের RFID পরিচয়পত্র সঙ্গে রাখা বাধ্যতামূলক।</p>
              <p>৩. পরীক্ষার কক্ষে মোবাইল ফোন বা অননুমোদিত ইলেকট্রনিক ডিভাইস সম্পূর্ণ নিষিদ্ধ।</p>
            </div>
          </div>
        )}

        {docType === 'student-id' && student && (
          <div className="py-6 flex justify-center">
            <div className="w-80 border-2 border-[#1B2A6B] rounded-lg overflow-hidden">
              <div className="bg-[#1B2A6B] text-white p-3 flex items-center gap-2.5">
                <img
                  src={SCHOOL_INFO.assets.logo}
                  alt="BUTPHS Logo"
                  className="w-10 h-10 object-contain bg-white rounded p-0.5"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold font-bn leading-tight">{SCHOOL_INFO.nameBn}</p>
                  <p className="text-[11px] text-white/80">EIIN: {SCHOOL_INFO.eiin} · Est. {SCHOOL_INFO.established}</p>
                </div>
              </div>
              <div className="p-4 text-xs space-y-1.5 bg-white">
                <p className="text-sm font-semibold text-[#1B2A6B] font-bn">{student.nameBn}</p>
                <p className="font-medium text-slate-800">{student.name}</p>
                <div className="pt-2 border-t border-slate-200 space-y-1 tabular-nums">
                  <p><span className="text-slate-500">ID:</span> {student.studentId}</p>
                  <p><span className="text-slate-500">Class:</span> {student.className} · {student.section} · Roll {student.roll}</p>
                  <p><span className="text-slate-500">Blood Group:</span> {student.bloodGroup}</p>
                  <p><span className="text-slate-500">RFID Card:</span> {student.rfidCardId || 'N/A'}</p>
                  <p><span className="text-slate-500">Guardian:</span> {student.guardianName}</p>
                </div>
              </div>
              <div className="bg-[#1F7A4D] text-white text-[11px] text-center py-1.5">
                {SCHOOL_INFO.addressEn}
              </div>
            </div>
          </div>
        )}

        {(docType === 'testimonial' || docType === 'certificate') && student && (
          <div className="py-6 space-y-4 text-sm leading-relaxed font-bn">
            <p>
              এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <strong>{student.nameBn}</strong> ({student.name}), শিক্ষার্থী আইডি{' '}
              <strong className="tabular-nums">{student.studentId}</strong>, অভিভাবক: <strong>{student.guardianName}</strong>,
              ঠিকানা: {student.address} — {SCHOOL_INFO.nameBn}-এর {student.className} ({student.section}, রোল{' '}
              <span className="tabular-nums">{student.roll}</span>, শিক্ষাবর্ষ {student.session})-এর একজন নিয়মিত শিক্ষার্থী।
            </p>
            <p>
              This is to certify that <strong>{student.name}</strong> (Student ID: {student.studentId}) is a bona fide
              student of {SCHOOL_INFO.nameEn}, Upashi, Naria, Shariatpur. To the best of our knowledge, the student bears
              a good moral character and has maintained satisfactory academic conduct.
            </p>
            <p>আমরা তাঁর জীবনের সর্বাঙ্গীণ মঙ্গল ও উজ্জ্বল ভবিষ্যৎ কামনা করি।</p>
          </div>
        )}

        {docType === 'attendance-report' && (
          <div className="py-5">
            <table className="w-full text-xs sm:text-sm border border-slate-300">
              <thead>
                <tr className="bg-[#F7F8FC] text-[#1B2A6B] text-left">
                  <th className="py-2 px-3 border border-slate-300">Date</th>
                  <th className="py-2 px-3 border border-slate-300">Student</th>
                  <th className="py-2 px-3 border border-slate-300">Class</th>
                  <th className="py-2 px-3 border border-slate-300">Entry</th>
                  <th className="py-2 px-3 border border-slate-300">Exit</th>
                  <th className="py-2 px-3 border border-slate-300">Status</th>
                  <th className="py-2 px-3 border border-slate-300">Source</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td className="py-2 px-3 border border-slate-300 tabular-nums">{rec.date}</td>
                    <td className="py-2 px-3 border border-slate-300">{rec.studentName} ({rec.studentId})</td>
                    <td className="py-2 px-3 border border-slate-300">{rec.className}</td>
                    <td className="py-2 px-3 border border-slate-300 tabular-nums">{rec.entryTime || '—'}</td>
                    <td className="py-2 px-3 border border-slate-300 tabular-nums">{rec.exitTime || '—'}</td>
                    <td className="py-2 px-3 border border-slate-300 font-medium">{rec.status}</td>
                    <td className="py-2 px-3 border border-slate-300">{rec.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signature Block */}
        <footer className="mt-10 pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
          <div>
            <div className="border-t border-slate-400 pt-2">Class Teacher Signature</div>
            <div className="text-[11px] text-slate-500 font-bn">শ্রেণি শিক্ষক</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2">Exam / Office Seal</div>
            <div className="text-[11px] text-slate-500 font-bn">অফিস সিলমোহর</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-2 font-medium text-[#1B2A6B]">Head Teacher</div>
            <div className="text-[11px] text-slate-500 font-bn">প্রধান শিক্ষক · {SCHOOL_INFO.shortName}</div>
          </div>
        </footer>
      </article>
    </div>
  );
}
