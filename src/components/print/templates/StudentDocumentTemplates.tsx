import { SCHOOL_INFO } from '../../../config/school';
import {
  generateVerificationCode,
  type MonthlyAttendanceMatrix,
} from '../../../services/printDocumentService';
import type { Exam, Student, StudentResult } from '../../../types';
import { formatDateReadable, toBanglaNumber } from '../../../utils/grading';
import {
  GradingScaleTable,
  InstitutionalLetterhead,
  PaperSheet,
  SignatureBar,
  StudentAvatarBox,
  VerificationQrSvg,
  type PrintRenderContext,
} from '../PrintSharedElements';

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (items.length === 0) return [];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    out.push(items.slice(i, i + chunkSize));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. STUDENT ID CARD (ORIGINAL CR80 VERTICAL INSTITUTIONAL BADGE — 4-UP / 8-UP BULK)
// ---------------------------------------------------------------------------

export function StudentIdCardDocument({
  students,
  ctx,
}: {
  students: Student[];
  ctx: PrintRenderContext;
}) {
  const perPage = ctx.settings.idCardsPerPage === 4 ? 4 : 8;
  const pages = chunkArray(students, perPage);

  return (
    <>
      {pages.map((batch, pageIdx) => (
        <PaperSheet
          key={`id-page-${pageIdx}`}
          orientation={ctx.settings.orientation}
          marginMm={ctx.settings.marginMm}
          pageNumber={pageIdx + 1}
          totalPages={pages.length}
        >
          {/* Quiet production header for bulk sheet */}
          <div className="pb-2.5 mb-4 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-semibold text-[#1B2A6B]">
              শিক্ষার্থী পরিচয়পত্র শিট · Student ID Card Production Sheet ({perPage}-up CR80)
            </span>
            <span className="tabular-nums">
              মোট কার্ড: {toBanglaNumber(students.length)} টি · শিট {toBanglaNumber(pageIdx + 1)}/
              {toBanglaNumber(pages.length)}
            </span>
          </div>

          <div
            className={`grid gap-4 flex-1 content-start ${
              perPage === 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {batch.map((student) => {
              const code = generateVerificationCode('student-id-card', student.studentId, student.session);
              const isCompact = perPage === 8;

              return (
                <article
                  key={student.id}
                  className="doc-keep-together border border-dashed border-slate-300 p-1.5 bg-white flex flex-col"
                >
                  {/* Actual CR80 Card Face */}
                  <div className="border border-[#1B2A6B]/80 rounded-[6px] overflow-hidden bg-white flex flex-col h-full">
                    {/* Architectural Navy + Brass Header */}
                    <div className="bg-[#1B2A6B] text-white px-2.5 py-2 flex items-center gap-2">
                      <img
                        src={SCHOOL_INFO.assets.logo}
                        alt={SCHOOL_INFO.shortName}
                        className={`${isCompact ? 'w-7 h-7' : 'w-9 h-9'} object-contain bg-white rounded p-0.5 shrink-0`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`${
                            isCompact ? 'text-[9.5px]' : 'text-[11px]'
                          } font-semibold leading-tight truncate`}
                        >
                          {SCHOOL_INFO.nameBn}
                        </p>
                        <p className="text-[8px] text-[#E6CE8A] tracking-wide truncate mt-0.5">
                          STUDENT IDENTITY CARD · {student.session}
                        </p>
                      </div>
                    </div>
                    <div className="h-[2px] bg-[#C9A961]" />

                    {/* Card Body */}
                    <div
                      className={`${
                        isCompact ? 'p-2.5 space-y-2' : 'p-3.5 space-y-3'
                      } flex-1 flex flex-col items-center text-center`}
                    >
                      {ctx.settings.showStudentPhotos && (
                        <StudentAvatarBox student={student} size={isCompact ? 'sm' : 'md'} />
                      )}

                      <div className="space-y-0.5 w-full">
                        <h3
                          className={`${
                            isCompact ? 'text-[11px]' : 'text-[13px]'
                          } font-semibold text-[#1B2A6B] leading-tight truncate`}
                        >
                          {student.nameBn}
                        </h3>
                        <p
                          className={`${
                            isCompact ? 'text-[9.5px]' : 'text-[11px]'
                          } font-medium text-slate-700 truncate`}
                        >
                          {student.name}
                        </p>
                      </div>

                      {/* Structured Info Grid */}
                      <dl
                        className={`w-full text-left border-t border-slate-200 pt-2 space-y-1 tabular-nums ${
                          isCompact ? 'text-[9px]' : 'text-[10.5px]'
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">ID No</dt>
                          <dd className="font-semibold text-[#1B2A6B]">{student.studentId}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Class / Roll</dt>
                          <dd className="font-medium text-slate-800">
                            {student.className} · রোল {toBanglaNumber(student.roll)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Section</dt>
                          <dd className="font-medium text-slate-800 truncate">{student.section}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-slate-500">Blood / DOB</dt>
                          <dd className="font-medium text-slate-800">
                            <span className="text-red-700 font-semibold">{student.bloodGroup}</span> ·{' '}
                            {student.dateOfBirth}
                          </dd>
                        </div>
                        {ctx.settings.showGuardianPhone && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500">Emergency</dt>
                            <dd className="font-medium text-[#1F7A4D]">{student.guardianPhone}</dd>
                          </div>
                        )}
                        {ctx.settings.showRfidColumn && student.rfidCardId && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-500">RFID Tag</dt>
                            <dd className="font-mono text-slate-700">{student.rfidCardId}</dd>
                          </div>
                        )}
                      </dl>

                      {/* Card Footer Auth + Mini QR */}
                      <div className="mt-auto w-full pt-2 border-t border-slate-100 flex items-end justify-between gap-2">
                        {ctx.settings.showQrVerification ? (
                          <VerificationQrSvg code={code} size={isCompact ? 26 : 34} compact />
                        ) : (
                          <span className="text-[8px] text-slate-400">EIIN {SCHOOL_INFO.eiin}</span>
                        )}
                        {ctx.settings.showSignatures && (
                          <div className="text-right">
                            <div className="w-20 border-t border-slate-400 pt-0.5 text-[8.5px] font-medium text-[#1B2A6B]">
                              প্রধান শিক্ষক
                            </div>
                            <p className="text-[7.5px] text-slate-400">Head Teacher</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Institutional Footer Strip */}
                    <div className="bg-[#1F7A4D] text-white px-2 py-1 text-center text-[8px] tracking-wide">
                      উপসী, নড়িয়া, শরীয়তপুর · {ctx.schoolPhone}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between text-[9.5px] text-slate-500">
            <span>কাট-লাইন বরাবর ল্যামিনেশন ও পিভিসি প্রিন্টের জন্য প্রস্তুত</span>
            <span>{SCHOOL_INFO.nameEn} · EIIN {SCHOOL_INFO.eiin}</span>
          </div>
        </PaperSheet>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// 2. STUDENT PROFILE & INFORMATION SHEET (INSTITUTIONAL DOSSIER)
// ---------------------------------------------------------------------------

export function StudentProfileDocument({
  students,
  results,
  attendanceMatrix,
  ctx,
}: {
  students: Student[];
  results: StudentResult[];
  attendanceMatrix?: MonthlyAttendanceMatrix;
  ctx: PrintRenderContext;
}) {
  return (
    <>
      {students.map((student, idx) => {
        const stuResults = results.filter((r) => r.studentId === student.studentId);
        const attRow = attendanceMatrix?.rows.find((r) => r.student.studentId === student.studentId);
        const verifyCode = generateVerificationCode('student-profile', student.studentId, student.session);

        return (
          <PaperSheet
            key={student.id}
            orientation={ctx.settings.orientation}
            marginMm={ctx.settings.marginMm}
            pageNumber={idx + 1}
            totalPages={students.length}
          >
            <InstitutionalLetterhead
              ctx={ctx}
              docTitleEn="Student Information Dossier"
              docTitleBn="শিক্ষার্থী পরিচিতি ও পূর্ণাঙ্গ তথ্যপত্র"
              subtitle={`শিক্ষাবর্ষ: ${student.session}`}
              serialNo={student.studentId}
              verificationCode={verifyCode}
            />

            {/* Identity Header Band */}
            <div className="bg-[#F7F8FC] border border-slate-200 rounded-md p-4 flex items-center justify-between gap-5 mb-5">
              <div className="flex items-center gap-4 min-w-0">
                {ctx.settings.showStudentPhotos && <StudentAvatarBox student={student} size="md" />}
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#1F7A4D] uppercase tracking-wider">
                    {student.className} · {student.section} · {student.group || 'General'}
                  </p>
                  <h2 className="text-lg font-semibold text-[#1B2A6B] leading-snug">
                    {student.nameBn}
                  </h2>
                  <p className="text-sm text-slate-700">{student.name}</p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    Student ID: <strong className="text-slate-800">{student.studentId}</strong> ·
                    রোল নম্বর: <strong className="text-slate-800">{toBanglaNumber(student.roll)}</strong> ·
                    অবস্থা: <strong className="text-[#1F7A4D]">{student.status}</strong>
                  </p>
                </div>
              </div>
              <div className="text-right text-xs space-y-1 shrink-0 tabular-nums">
                <p className="text-slate-500">রক্তের গ্রুপ</p>
                <p className="text-base font-bold text-red-700">{student.bloodGroup}</p>
                <p className="text-[11px] text-slate-500">
                  RFID: {student.rfidCardId || 'Unassigned'}
                </p>
              </div>
            </div>

            {/* Structured 2-Column Sections */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-[#1B2A6B] text-white px-3.5 py-2 text-xs font-semibold">
                  ব্যক্তিগত ও নিবন্ধন তথ্য · Personal Particulars
                </div>
                <dl className="divide-y divide-slate-100 text-xs">
                  {[
                    ['জন্ম তারিখ (DOB)', formatDateReadable(student.dateOfBirth)],
                    ['লিঙ্গ (Gender)', student.gender === 'Male' ? 'ছাত্র (Male)' : 'ছাত্রী (Female)'],
                    ['জন্ম সনদ নং', student.birthCertificateNo || 'অফিস রেজিস্টারে সংরক্ষিত'],
                    ['বোর্ড রেজিস্ট্রেশন', student.boardRegistrationNo || 'প্রযোজ্য নয় / চলমান'],
                    ['বর্তমান ঠিকানা', student.address],
                    ['স্থায়ী ঠিকানা', student.permanentAddress || student.address],
                  ].map(([k, v]) => (
                    <div key={k} className="px-3.5 py-2 flex justify-between gap-3">
                      <dt className="text-slate-500 shrink-0">{k}</dt>
                      <dd className="font-medium text-slate-800 text-right tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-[#1F7A4D] text-white px-3.5 py-2 text-xs font-semibold">
                  অভিভাবক ও পূর্ববর্তী শিক্ষা · Guardian & Prior Record
                </div>
                <dl className="divide-y divide-slate-100 text-xs">
                  {[
                    ['অভিভাবকের নাম', student.guardianNameBn || student.guardianName],
                    ['Guardian (English)', student.guardianName],
                    ['মোবাইল (SMS)', student.guardianPhone],
                    ['পেশা', student.guardianOccupation || 'তথ্য সংরক্ষিত'],
                    ['পূর্ববর্তী বিদ্যালয়', student.previousSchool || 'অভ্যন্তরীণ পদোন্নতি'],
                    ['পূর্ববর্তী জিপিএ', student.previousGpa || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="px-3.5 py-2 flex justify-between gap-3">
                      <dt className="text-slate-500 shrink-0">{k}</dt>
                      <dd className="font-medium text-slate-800 text-right tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Academic & Attendance Snapshot */}
            <div className="space-y-4">
              {attRow && (
                <div className="border border-slate-200 rounded-md p-3.5 bg-[#F7F8FC]">
                  <p className="text-xs font-semibold text-[#1B2A6B] mb-2">
                    মাসিক উপস্থিতি সারসংক্ষেপ ({attendanceMatrix?.monthLabelBn} {attendanceMatrix?.year})
                  </p>
                  <div className="grid grid-cols-5 gap-3 text-center tabular-nums text-xs">
                    <div className="bg-white border border-slate-200 rounded p-2">
                      <p className="text-slate-500 text-[10px]">কার্যদিবস</p>
                      <p className="font-bold text-[#1B2A6B] text-sm">{attRow.workingDays}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2">
                      <p className="text-slate-500 text-[10px]">উপস্থিত</p>
                      <p className="font-bold text-[#1F7A4D] text-sm">{attRow.presentDays}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2">
                      <p className="text-slate-500 text-[10px]">অনুপস্থিত</p>
                      <p className="font-bold text-red-700 text-sm">{attRow.absentDays}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2">
                      <p className="text-slate-500 text-[10px]">বিলম্ব</p>
                      <p className="font-bold text-amber-700 text-sm">{attRow.lateDays}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded p-2">
                      <p className="text-slate-500 text-[10px]">হার (%)</p>
                      <p className="font-bold text-[#1B2A6B] text-sm">{attRow.attendancePercent}%</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-[#1B2A6B] mb-2">
                  একাডেমিক পরীক্ষার ইতিহাস · Examination Record
                </h3>
                {stuResults.length === 0 ? (
                  <p className="text-xs text-slate-500 border border-slate-200 rounded p-3 bg-[#F7F8FC]">
                    এই শিক্ষার্থীর জন্য এখনো প্রকাশিত পরীক্ষার রেকর্ড সংযুক্ত হয়নি।
                  </p>
                ) : (
                  <table className="w-full text-xs border border-slate-300 tabular-nums">
                    <thead>
                      <tr className="bg-[#F7F8FC] text-[#1B2A6B] text-left">
                        <th className="py-1.5 px-3 border border-slate-300 font-semibold">পরীক্ষার নাম</th>
                        <th className="py-1.5 px-3 border border-slate-300 font-semibold text-right">মোট নম্বর</th>
                        <th className="py-1.5 px-3 border border-slate-300 font-semibold text-center">গ্রেড</th>
                        <th className="py-1.5 px-3 border border-slate-300 font-semibold text-right">জিপিএ</th>
                        <th className="py-1.5 px-3 border border-slate-300 font-semibold text-center">ফলাফল</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stuResults.map((r) => (
                        <tr key={r.id}>
                          <td className="py-1.5 px-3 border border-slate-200">{r.examName}</td>
                          <td className="py-1.5 px-3 border border-slate-200 text-right font-medium">
                            {r.totalMarks}
                          </td>
                          <td className="py-1.5 px-3 border border-slate-200 text-center font-semibold text-[#1B2A6B]">
                            {r.overallGrade}
                          </td>
                          <td className="py-1.5 px-3 border border-slate-200 text-right font-semibold text-[#1F7A4D]">
                            {r.gpa.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-3 border border-slate-200 text-center">
                            {r.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <SignatureBar
              ctx={ctx}
              slots={[
                { labelBn: 'অভিভাবকের স্বাক্ষর', labelEn: "Guardian's Signature" },
                { labelBn: 'শ্রেণি শিক্ষক', labelEn: 'Class Teacher' },
                { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
              ]}
            />
          </PaperSheet>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// 3. OFFICIAL ACADEMIC TRANSCRIPT (BOARD-GRADE FORMAL TRANSCRIPT)
// ---------------------------------------------------------------------------

export function AcademicTranscriptDocument({
  students,
  results,
  exam,
  ctx,
}: {
  students: Student[];
  results: StudentResult[];
  exam?: Exam;
  ctx: PrintRenderContext;
}) {
  return (
    <>
      {students.map((student, idx) => {
        const res =
          results.find((r) => r.studentId === student.studentId && (!exam || r.examId === exam.id)) ||
          results.find((r) => r.studentId === student.studentId);

        const verifyCode = generateVerificationCode(
          'academic-transcript',
          `${student.studentId}-${exam?.id || 'latest'}`,
          student.session
        );

        const coreSubjects = res ? res.marks.slice(0, Math.max(1, res.marks.length - 1)) : [];
        const additionalSubject = res && res.marks.length > 4 ? res.marks[res.marks.length - 1] : null;
        const gpaWithoutAdd =
          coreSubjects.length > 0 && res?.passed
            ? Number(
                (coreSubjects.reduce((s, m) => s + m.gradePoint, 0) / coreSubjects.length).toFixed(2)
              )
            : res?.gpa || 0;
        const additionalBonus = additionalSubject
          ? Math.max(0, Number((additionalSubject.gradePoint - 2).toFixed(2)))
          : 0;

        return (
          <PaperSheet
            key={student.id}
            orientation="portrait"
            marginMm={ctx.settings.marginMm}
            pageNumber={idx + 1}
            totalPages={students.length}
            ceremonialFrame
          >
            {/* Formal Board-Inspired Top Header */}
            <header className="pb-4 mb-4 border-b border-slate-300">
              <div className="flex items-start justify-between gap-4">
                <div className="text-[10.5px] text-slate-600 tabular-nums space-y-0.5 pt-1">
                  <p>
                    Serial No: <strong className="text-[#1B2A6B]">{student.studentId}</strong>
                  </p>
                  <p>EIIN: {SCHOOL_INFO.eiin} · Code: {SCHOOL_INFO.schoolCode}</p>
                  <p>Board: Dhaka</p>
                </div>

                <div className="text-center flex-1">
                  <img
                    src={SCHOOL_INFO.assets.logo}
                    alt={SCHOOL_INFO.nameEn}
                    className="w-14 h-14 object-contain mx-auto mb-1.5"
                  />
                  <h1 className="text-[16px] font-semibold text-[#1B2A6B] tracking-tight">
                    {SCHOOL_INFO.nameEn.toUpperCase()}
                  </h1>
                  <p className="text-xs text-slate-700">{SCHOOL_INFO.nameBn}</p>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">{SCHOOL_INFO.addressEn}</p>
                  <div className="mt-2 inline-block border-y border-[#C9A961] px-4 py-0.5">
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#1F7A4D]">
                      Academic Transcript · একাডেমিক ট্রান্সক্রিপ্ট
                    </p>
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 mt-1">
                    {res?.examName || exam?.name || 'Annual Examination'} — Session {student.session}
                  </p>
                </div>

                <GradingScaleTable compact />
              </div>
            </header>

            {/* Student Identification Block */}
            <div className="grid grid-cols-12 gap-4 mb-5 text-xs">
              <dl className="col-span-9 grid grid-cols-2 gap-x-6 gap-y-2 border border-slate-200 rounded p-3.5 bg-[#F7F8FC]">
                <div>
                  <dt className="text-[10px] text-slate-500">Name of Student</dt>
                  <dd className="font-semibold text-[#1B2A6B]">{student.name}</dd>
                  <dd className="text-[11px] text-slate-600">{student.nameBn}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500">Guardian / Father's Name</dt>
                  <dd className="font-medium text-slate-800">{student.guardianName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500">Class & Section</dt>
                  <dd className="font-medium text-slate-800">
                    {student.className} · {student.section}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500">Group / Stream</dt>
                  <dd className="font-medium text-slate-800">{student.group || 'General'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500">Roll No. & Registration No.</dt>
                  <dd className="font-semibold text-slate-900 tabular-nums">
                    Roll {student.roll} · Reg {student.boardRegistrationNo || student.studentId}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-500">Date of Birth & Type</dt>
                  <dd className="font-medium text-slate-800 tabular-nums">
                    {formatDateReadable(student.dateOfBirth)} · Regular
                  </dd>
                </div>
              </dl>

              <div className="col-span-3 flex flex-col items-center justify-center gap-2 border border-slate-200 rounded p-2.5 bg-white">
                {ctx.settings.showStudentPhotos && <StudentAvatarBox student={student} size="sm" />}
                {ctx.settings.showQrVerification && (
                  <VerificationQrSvg code={verifyCode} size={44} />
                )}
              </div>
            </div>

            {/* Formal Grade Table */}
            {!res ? (
              <div className="border border-amber-200 bg-amber-50 rounded p-4 text-xs text-amber-900 text-center my-4">
                এই শিক্ষার্থীর নির্বাচিত পরীক্ষার ফলাফল রেকর্ড এখনো এন্ট্রি করা হয়নি।
              </div>
            ) : (
              <table className="w-full text-xs border border-slate-400 tabular-nums mb-5">
                <thead>
                  <tr className="bg-[#1B2A6B] text-white">
                    <th className="py-2 px-2.5 border border-slate-400 w-10 text-center font-medium">
                      SL
                    </th>
                    <th className="py-2 px-2.5 border border-slate-400 w-16 text-center font-medium">
                      Code
                    </th>
                    <th className="py-2 px-3 border border-slate-400 text-left font-medium">
                      Name of Subjects (বিষয়ের নাম)
                    </th>
                    <th className="py-2 px-2.5 border border-slate-400 text-center font-medium w-20">
                      Letter Grade
                    </th>
                    <th className="py-2 px-2.5 border border-slate-400 text-center font-medium w-20">
                      Grade Point
                    </th>
                    <th className="py-2 px-2.5 border border-slate-400 text-center font-medium w-24">
                      GPA (w/o Addl.)
                    </th>
                    <th className="py-2 px-2.5 border border-slate-400 text-center font-medium w-20">
                      Final GPA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(additionalSubject ? coreSubjects : res.marks).map((m, mIdx) => (
                    <tr key={m.subjectCode} className={mIdx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
                      <td className="py-2 px-2.5 border border-slate-300 text-center">
                        {mIdx + 1}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-300 text-center text-slate-600">
                        {m.subjectCode}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-medium text-slate-800">
                        {m.subjectName}
                      </td>
                      <td
                        className={`py-2 px-2.5 border border-slate-300 text-center font-semibold ${
                          m.grade === 'F' ? 'text-red-700' : 'text-[#1B2A6B]'
                        }`}
                      >
                        {m.grade}
                      </td>
                      <td className="py-2 px-2.5 border border-slate-300 text-center">
                        {m.gradePoint.toFixed(2)}
                      </td>
                      {mIdx === 0 && (
                        <td
                          rowSpan={(additionalSubject ? coreSubjects : res.marks).length}
                          className="py-2 px-2.5 border border-slate-300 text-center font-semibold text-sm text-[#1B2A6B] bg-white align-middle"
                        >
                          {gpaWithoutAdd.toFixed(2)}
                        </td>
                      )}
                      {mIdx === 0 && (
                        <td
                          rowSpan={res.marks.length + (additionalSubject ? 1 : 0)}
                          className="py-2 px-2.5 border border-slate-300 text-center font-bold text-base text-[#1F7A4D] bg-[#F7F8FC] align-middle"
                        >
                          <div>{res.gpa.toFixed(2)}</div>
                          <div className="text-[11px] font-semibold text-[#1B2A6B] mt-0.5">
                            ({res.overallGrade})
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}

                  {additionalSubject && (
                    <>
                      <tr className="bg-slate-100">
                        <td
                          colSpan={6}
                          className="py-1.5 px-3 border border-slate-300 text-[11px] font-semibold text-[#1B2A6B]"
                        >
                          Additional / Elective Subject (ঐচ্ছিক / ৪র্থ বিষয়)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 border border-slate-300 text-center">
                          {coreSubjects.length + 1}
                        </td>
                        <td className="py-2 px-2.5 border border-slate-300 text-center text-slate-600">
                          {additionalSubject.subjectCode}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 font-medium text-slate-800">
                          {additionalSubject.subjectName}
                        </td>
                        <td className="py-2 px-2.5 border border-slate-300 text-center font-semibold text-[#1B2A6B]">
                          {additionalSubject.grade}
                        </td>
                        <td className="py-2 px-2.5 border border-slate-300 text-center">
                          {additionalSubject.gradePoint.toFixed(2)}
                        </td>
                        <td className="py-1.5 px-2 border border-slate-300 text-center text-[10px]">
                          <div className="text-slate-500 border-b border-slate-200 pb-0.5">
                            GP Above 2.0
                          </div>
                          <div className="font-semibold text-[#1F7A4D] pt-0.5">
                            {additionalBonus.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            )}

            <div className="text-xs text-slate-600 flex justify-between items-center pt-1">
              <span>
                Date of Publication of Results:{' '}
                <strong className="text-slate-800 tabular-nums">{res?.updatedAt || ctx.issueDate}</strong>
              </span>
              <span>
                Result Status:{' '}
                <strong className={res?.passed ? 'text-[#1F7A4D]' : 'text-red-700'}>
                  {res ? (res.passed ? 'PASSED' : 'NOT PROMOTED') : 'PENDING'}
                </strong>
              </span>
            </div>

            <SignatureBar
              ctx={ctx}
              slots={[
                { labelBn: 'প্রস্তুতকারী', labelEn: 'Prepared & Written By' },
                { labelBn: 'নিরীক্ষক', labelEn: 'Compared & Verified By' },
                {
                  labelBn: 'প্রধান শিক্ষক / পরীক্ষা নিয়ন্ত্রক',
                  labelEn: 'Head Teacher / Controller',
                  subtext: ctx.headTeacherName,
                },
              ]}
            />
          </PaperSheet>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// 4. CHARACTER TESTIMONIAL (প্রশংসাপত্র) & 5. TRANSFER CERTIFICATE (ছাড়পত্র / TC)
// ---------------------------------------------------------------------------

export function TestimonialDocument({
  students,
  results,
  exam,
  ctx,
}: {
  students: Student[];
  results: StudentResult[];
  exam?: Exam;
  ctx: PrintRenderContext;
}) {
  return (
    <>
      {students.map((student, idx) => {
        const res =
          results.find((r) => r.studentId === student.studentId && (!exam || r.examId === exam.id)) ||
          results.find((r) => r.studentId === student.studentId);
        const serial = `BUTPHS/TEST/${student.session}/${String(student.roll).padStart(3, '0')}`;
        const verifyCode = generateVerificationCode('testimonial', student.studentId, student.session);

        return (
          <PaperSheet
            key={student.id}
            orientation="portrait"
            marginMm={ctx.settings.marginMm}
            pageNumber={idx + 1}
            totalPages={students.length}
            ceremonialFrame
          >
            <InstitutionalLetterhead
              ctx={ctx}
              docTitleEn="Character & Study Testimonial"
              docTitleBn="প্রশংসাপত্র"
              variant="ceremonial"
            />

            <div className="flex items-start justify-between gap-4 text-xs text-slate-600 tabular-nums mb-6">
              <div className="space-y-1">
                <p>
                  স্মারক নং / Serial No: <strong className="text-[#1B2A6B]">{serial}</strong>
                </p>
                <p>
                  ইস্যু তারিখ / Date: <strong className="text-slate-800">{ctx.issueDate}</strong>
                </p>
              </div>
              {ctx.settings.showStudentPhotos && <StudentAvatarBox student={student} size="sm" />}
            </div>

            <div className="space-y-5 text-[14px] leading-[1.95] text-slate-800 max-w-[162mm] mx-auto">
              <p className="text-justify">
                এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,{' '}
                <strong className="text-[#1B2A6B]">{student.nameBn}</strong> ({student.name}),
                পিতা/অভিভাবক:{' '}
                <strong>{student.guardianNameBn || student.guardianName}</strong>, ঠিকানা:{' '}
                {student.address}, অত্র{' '}
                <strong>{SCHOOL_INFO.nameBn}</strong>-এর{' '}
                <strong>
                  {student.className} ({student.section})
                </strong>
                -এর একজন নিয়মিত শিক্ষার্থী। তাঁর শিক্ষার্থী আইডি{' '}
                <strong className="tabular-nums">{student.studentId}</strong>, শ্রেণি রোল{' '}
                <strong className="tabular-nums">{toBanglaNumber(student.roll)}</strong> এবং ভর্তি
                রেজিস্টার অনুযায়ী জন্ম তারিখ{' '}
                <strong className="tabular-nums">{formatDateReadable(student.dateOfBirth)}</strong>।
                {res
                  ? ` সে ${res.examName} পরীক্ষায় অংশগ্রহণ করে জিপিএ ${res.gpa.toFixed(2)} (গ্রেড ${res.overallGrade}) অর্জন করে সফলতার সাথে উত্তীর্ণ হয়েছে।`
                  : ''}
              </p>

              <p className="text-justify text-[13.5px] text-slate-700">
                This is to certify that <strong>{student.name}</strong> (ID:{' '}
                <span className="tabular-nums">{student.studentId}</span>, Roll:{' '}
                <span className="tabular-nums">{student.roll}</span>), ward of{' '}
                <strong>{student.guardianName}</strong>, was a regular student of{' '}
                <strong>{student.className}</strong> ({student.section}, Session {student.session})
                of <strong>{SCHOOL_INFO.nameEn}</strong>.
                {res
                  ? ` The student appeared in ${res.examName} and passed obtaining Letter Grade ${res.overallGrade} with GPA ${res.gpa.toFixed(2)} out of 5.00.`
                  : ''}{' '}
                To the best of our knowledge, the student bears a good moral character and took no
                part in any activity subversive to the discipline of the institution or the state.
              </p>

              <p className="text-justify">
                আমরা তাঁর জীবনের সর্বাঙ্গীণ উন্নতি, সুস্বাস্থ্য ও উজ্জ্বল ভবিষ্যৎ কামনা করি।
              </p>
            </div>

            <div className="mt-8 flex items-end justify-between">
              {ctx.settings.showQrVerification ? (
                <VerificationQrSvg code={verifyCode} size={52} />
              ) : (
                <div />
              )}
              {ctx.settings.showSignatures && (
                <div className="text-center w-60 pt-10">
                  <div className="border-t border-slate-500 pt-2">
                    <p className="text-xs font-semibold text-[#1B2A6B]">{ctx.headTeacherName}</p>
                    <p className="text-[11px] text-slate-600">প্রধান শিক্ষক · Head Teacher</p>
                    <p className="text-[10px] text-slate-500">{SCHOOL_INFO.nameBn}</p>
                  </div>
                </div>
              )}
            </div>
          </PaperSheet>
        );
      })}
    </>
  );
}

export function TransferCertificateDocument({
  students,
  ctx,
}: {
  students: Student[];
  ctx: PrintRenderContext;
}) {
  return (
    <>
      {students.map((student, idx) => {
        const serial = `BUTPHS/TC/${student.session}/${String(student.roll).padStart(3, '0')}`;
        const verifyCode = generateVerificationCode(
          'transfer-certificate',
          student.studentId,
          student.session
        );

        return (
          <PaperSheet
            key={student.id}
            orientation="portrait"
            marginMm={ctx.settings.marginMm}
            pageNumber={idx + 1}
            totalPages={students.length}
            ceremonialFrame
          >
            <InstitutionalLetterhead
              ctx={ctx}
              docTitleEn="Transfer Certificate"
              docTitleBn="বিদ্যালয় ছাড়পত্র (টিসি)"
              variant="ceremonial"
            />

            <div className="flex items-start justify-between gap-4 text-xs text-slate-600 tabular-nums mb-5">
              <div className="space-y-1">
                <p>
                  টিসি ক্রমিক নং / TC Serial: <strong className="text-[#1B2A6B]">{serial}</strong>
                </p>
                <p>
                  ইস্যু তারিখ / Date: <strong className="text-slate-800">{ctx.issueDate}</strong>
                </p>
              </div>
              {ctx.settings.showStudentPhotos && <StudentAvatarBox student={student} size="sm" />}
            </div>

            {/* Structured Registry Summary Table */}
            <table className="w-full text-xs border border-slate-300 mb-6 tabular-nums">
              <tbody>
                {[
                  ['শিক্ষার্থীর নাম (বাংলা ও ইংরেজি)', `${student.nameBn} (${student.name})`],
                  ['শিক্ষার্থী আইডি ও শ্রেণি রোল', `${student.studentId} · রোল ${toBanglaNumber(student.roll)}`],
                  ['পিতা / অভিভাবকের নাম', `${student.guardianNameBn || student.guardianName} (${student.guardianName})`],
                  ['অধ্যয়নরত শ্রেণি, শাখা ও শিক্ষাবর্ষ', `${student.className} · ${student.section} · শিক্ষাবর্ষ ${student.session}`],
                  ['ভর্তি রেজিস্টার অনুযায়ী জন্ম তারিখ', formatDateReadable(student.dateOfBirth)],
                  ['স্থায়ী ঠিকানা', student.permanentAddress || student.address],
                  ['বিদ্যালয়ের যাবতীয় বকেয়া নিষ্পত্তি', 'সম্পূর্ণ পরিশোধিত (All School Dues Cleared)'],
                  ['চারিত্রিক ও আচরণগত মূল্যায়ন', 'সন্তোষজনক ও উত্তম (Good Moral Character)'],
                ].map(([label, val], rowIdx) => (
                  <tr key={label} className={rowIdx % 2 === 0 ? 'bg-[#F7F8FC]' : 'bg-white'}>
                    <td className="py-2 px-3 border border-slate-200 font-medium text-slate-600 w-[44%]">
                      {label}
                    </td>
                    <td className="py-2 px-3 border border-slate-200 font-semibold text-slate-900">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-4 text-[13.5px] leading-[1.85] text-slate-800">
              <p className="text-justify">
                এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, উপরিউক্ত শিক্ষার্থী{' '}
                <strong>{student.nameBn}</strong> ({student.name}) অত্র বিদ্যালয়ের সকল পাওনা
                পরিশোধপূর্বক অভিভাবকের আবেদনের প্রেক্ষিতে বিদ্যালয় ত্যাগের অনুমতি (ছাড়পত্র) প্রাপ্ত
                হয়েছে। তাঁর চরিত্র উত্তম এবং অন্যত্র উচ্চতর বা সমমানের শ্রেণিতে ভর্তিতে আমাদের
                কোনো আপত্তি নেই।
              </p>
              <p className="text-justify text-xs text-slate-600">
                Certified that the above particulars correspond accurately to the official Admission
                Register of {SCHOOL_INFO.nameEn}. All institutional dues have been settled in full,
                and the student leaves with good conduct.
              </p>
            </div>

            <div className="mt-auto pt-8 flex items-end justify-between gap-4">
              {ctx.settings.showQrVerification ? (
                <VerificationQrSvg code={verifyCode} size={50} />
              ) : (
                <div />
              )}
              {ctx.settings.showSignatures && (
                <div className="grid grid-cols-2 gap-12 text-center">
                  <div className="w-40 border-t border-slate-400 pt-1.5">
                    <p className="text-[11px] font-semibold text-[#1B2A6B]">অফিস সহকারী</p>
                    <p className="text-[10px] text-slate-500">Office Clerk / Registrar</p>
                  </div>
                  <div className="w-48 border-t border-slate-500 pt-1.5">
                    <p className="text-[11px] font-semibold text-[#1B2A6B]">{ctx.headTeacherName}</p>
                    <p className="text-[10px] text-slate-500">প্রধান শিক্ষক · Head Teacher</p>
                  </div>
                </div>
              )}
            </div>
          </PaperSheet>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// 6. CLASS & SECTION STUDENT DIRECTORY LIST
// ---------------------------------------------------------------------------

export function StudentDirectoryDocument({
  students,
  classLabel,
  sectionLabel,
  session,
  ctx,
}: {
  students: Student[];
  classLabel: string;
  sectionLabel: string;
  session: string;
  ctx: PrintRenderContext;
}) {
  const verifyCode = generateVerificationCode('student-list', `${classLabel}-${sectionLabel}`, session);

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        docTitleEn="Student Directory Register"
        docTitleBn="শ্রেণি ও শাখাভিত্তিক শিক্ষার্থী তালিকা"
        subtitle={`শ্রেণি: ${classLabel} · শাখা: ${sectionLabel} · শিক্ষাবর্ষ: ${session} · মোট: ${toBanglaNumber(students.length)} জন`}
        verificationCode={verifyCode}
        variant="compact"
      />

      <table className="w-full text-[11px] border border-slate-300 tabular-nums">
        <thead>
          <tr className="bg-[#1B2A6B] text-white text-left">
            <th className="py-2 px-2 border border-[#1B2A6B] text-center w-10">রোল</th>
            <th className="py-2 px-2.5 border border-[#1B2A6B]">শিক্ষার্থী আইডি</th>
            <th className="py-2 px-2.5 border border-[#1B2A6B]">শিক্ষার্থীর নাম (বাংলা ও ইংরেজি)</th>
            <th className="py-2 px-2 border border-[#1B2A6B]">শ্রেণি ও শাখা</th>
            <th className="py-2 px-2 border border-[#1B2A6B] text-center">রক্ত</th>
            <th className="py-2 px-2.5 border border-[#1B2A6B]">অভিভাবক</th>
            {ctx.settings.showGuardianPhone && (
              <th className="py-2 px-2.5 border border-[#1B2A6B]">মোবাইল</th>
            )}
            {ctx.settings.showRfidColumn && (
              <th className="py-2 px-2 border border-[#1B2A6B]">RFID কার্ড</th>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={s.id} className={i % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
              <td className="py-1.5 px-2 border border-slate-200 text-center font-semibold text-[#1B2A6B]">
                {toBanglaNumber(s.roll)}
              </td>
              <td className="py-1.5 px-2.5 border border-slate-200 font-mono text-[10.5px]">
                {s.studentId}
              </td>
              <td className="py-1.5 px-2.5 border border-slate-200">
                <div className="flex items-center gap-2">
                  {ctx.settings.showStudentPhotos && <StudentAvatarBox student={s} size="xs" />}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 leading-tight">{s.nameBn}</p>
                    <p className="text-[10px] text-slate-500">{s.name}</p>
                  </div>
                </div>
              </td>
              <td className="py-1.5 px-2 border border-slate-200">
                {s.className} · {s.section}
              </td>
              <td className="py-1.5 px-2 border border-slate-200 text-center font-semibold text-red-700">
                {s.bloodGroup}
              </td>
              <td className="py-1.5 px-2.5 border border-slate-200">
                {s.guardianNameBn || s.guardianName}
              </td>
              {ctx.settings.showGuardianPhone && (
                <td className="py-1.5 px-2.5 border border-slate-200 text-[#1F7A4D] font-medium">
                  {s.guardianPhone}
                </td>
              )}
              {ctx.settings.showRfidColumn && (
                <td className="py-1.5 px-2 border border-slate-200 font-mono text-[10px]">
                  {s.rfidCardId || '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'শ্রেণি শিক্ষক', labelEn: 'Class Teacher' },
          { labelBn: 'অফিস সহকারী', labelEn: 'Academic Office' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
      />
    </PaperSheet>
  );
}
