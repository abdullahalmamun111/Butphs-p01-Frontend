import React from 'react';
import { SCHOOL_INFO } from '../../../config/school';
import {
  buildMeritListRows,
  buildResultSummaryRows,
  buildSubjectAnalysisReport,
  computeClassHighestMarks,
  generateVerificationCode,
  type MonthlyAttendanceMatrix,
  type SeatAllocationResult,
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

function chunkArray<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function getDefaultSubjectsForClass(className: string): Array<{ code: string; name: string }> {
  const isSenior = className === 'Class 9' || className === 'Class 10';
  if (isSenior) {
    return [
      { code: '101', name: 'বাংলা ১ম ও ২য় পত্র (Bangla)' },
      { code: '107', name: 'ইংরেজি ১ম ও ২য় পত্র (English)' },
      { code: '109', name: 'সাধারণ গণিত (Mathematics)' },
      { code: '136', name: 'পদার্থবিজ্ঞান (Physics)' },
      { code: '137', name: 'রসায়ন (Chemistry)' },
      { code: '126', name: 'উচ্চতর গণিত (Higher Math)' },
      { code: '154', name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)' },
      { code: '111', name: 'ধর্ম ও নৈতিক শিক্ষা (Religion)' },
    ];
  }
  return [
    { code: '101', name: 'বাংলা (Bangla)' },
    { code: '107', name: 'ইংরেজি (English)' },
    { code: '109', name: 'গণিত (Mathematics)' },
    { code: '127', name: 'বিজ্ঞান (General Science)' },
    { code: '150', name: 'বাংলাদেশ ও বিশ্বপরিচয় (BGS)' },
    { code: '154', name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)' },
    { code: '111', name: 'ধর্ম ও নৈতিক শিক্ষা (Religion)' },
    { code: '134', name: 'কৃষিশিক্ষা / গার্হস্থ্য বিজ্ঞান' },
  ];
}

// ---------------------------------------------------------------------------
// 1. EXAMINATION ADMIT CARD (2-PER-A4 PORTRAIT BULK SHEET)
// ---------------------------------------------------------------------------

export function AdmitCardDocument({
  students,
  exam,
  ctx,
}: {
  students: Student[];
  exam?: Exam;
  ctx: PrintRenderContext;
}) {
  const pages = chunkArray(students, 2);
  const examTitleBn = exam?.nameBn || 'বার্ষিক পরীক্ষা ২০২৬';
  const examTitleEn = exam?.name || 'Annual Examination 2026';

  return (
    <>
      {pages.map((batch, pageIdx) => (
        <PaperSheet
          key={`admit-p-${pageIdx}`}
          orientation={ctx.settings.orientation}
          marginMm={ctx.settings.marginMm}
          pageNumber={pageIdx + 1}
          totalPages={pages.length}
        >
          <div className="flex-1 flex flex-col justify-between gap-5">
            {batch.map((student, slotIdx) => {
              const subjects = getDefaultSubjectsForClass(student.className);
              const code = generateVerificationCode(
                'admit-card',
                `${student.studentId}-${exam?.id || 'ex'}`,
                student.session
              );

              return (
                <div key={student.id} className="doc-keep-together flex flex-col">
                  {slotIdx === 1 && (
                    <div className="flex items-center gap-2 my-1 text-[9.5px] text-slate-400">
                      <span className="flex-1 border-t border-dashed border-slate-300" />
                      <span>✂ কাটার রেখা · Cut Line</span>
                      <span className="flex-1 border-t border-dashed border-slate-300" />
                    </div>
                  )}

                  <article className="border border-[#1B2A6B]/85 rounded-[4px] p-4 bg-white">
                    <div className="h-[2px] bg-[#C9A961] -mt-4 -mx-4 mb-3" />

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-200">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {ctx.settings.showBranding && (
                          <img
                            src={SCHOOL_INFO.assets.logo}
                            alt={SCHOOL_INFO.shortName}
                            className="w-11 h-11 object-contain shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <h2 className="text-[14px] font-semibold text-[#1B2A6B] leading-tight">
                            {SCHOOL_INFO.nameBn}
                          </h2>
                          <p className="text-[11px] font-medium text-slate-700 leading-tight">
                            {SCHOOL_INFO.nameEn}
                          </p>
                          <p className="text-[9.5px] text-slate-500 mt-0.5 tabular-nums">
                            EIIN: {SCHOOL_INFO.eiin} · কোড: {SCHOOL_INFO.schoolCode} · {ctx.schoolAddressBn}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-semibold text-[#1F7A4D] uppercase tracking-wider">
                          ADMIT CARD
                        </p>
                        <p className="text-[11px] font-semibold text-[#1B2A6B]">পরীক্ষার প্রবেশপত্র</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                          {examTitleBn}
                        </p>
                      </div>
                    </div>

                    {/* Student Meta + Photo + QR */}
                    <div className="mt-3 flex items-start justify-between gap-4">
                      <dl className="flex-1 grid grid-cols-2 gap-x-5 gap-y-1.5 text-[11px]">
                        <div className="col-span-2 flex items-baseline gap-2 border-b border-slate-100 pb-1">
                          <dt className="text-slate-500 w-28 shrink-0">শিক্ষার্থীর নাম</dt>
                          <dd className="font-semibold text-[#1B2A6B]">
                            {student.nameBn}{' '}
                            <span className="font-normal text-slate-600">({student.name})</span>
                          </dd>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <dt className="text-slate-500 w-28 shrink-0">আইডি নম্বর</dt>
                          <dd className="font-semibold text-slate-900 tabular-nums">{student.studentId}</dd>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <dt className="text-slate-500 w-24 shrink-0">রোল নম্বর</dt>
                          <dd className="font-semibold text-[#1F7A4D] tabular-nums">
                            {toBanglaNumber(student.roll)} ({student.roll})
                          </dd>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <dt className="text-slate-500 w-28 shrink-0">শ্রেণি ও শাখা</dt>
                          <dd className="font-medium text-slate-800">
                            {student.className} · শাখা {student.section}
                          </dd>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <dt className="text-slate-500 w-24 shrink-0">শিক্ষাবর্ষ</dt>
                          <dd className="font-medium text-slate-800 tabular-nums">{student.session}</dd>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <dt className="text-slate-500 w-28 shrink-0">পরীক্ষার নাম</dt>
                          <dd className="font-medium text-slate-800 truncate">{examTitleEn}</dd>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <dt className="text-slate-500 w-24 shrink-0">পরীক্ষার সময়কাল</dt>
                          <dd className="text-slate-700 tabular-nums">
                            {exam ? `${exam.startDate} – ${exam.endDate}` : 'বিদ্যালয় রুটিন অনুযায়ী'}
                          </dd>
                        </div>
                      </dl>

                      <div className="flex items-start gap-2 shrink-0">
                        {ctx.settings.showStudentPhotos && (
                          <StudentAvatarBox student={student} size="sm" />
                        )}
                        {ctx.settings.showQrVerification && (
                          <VerificationQrSvg code={code} size={40} compact />
                        )}
                      </div>
                    </div>

                    {/* Registered Subjects Grid */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200">
                      <p className="text-[10px] font-semibold text-[#1B2A6B] uppercase tracking-wider mb-1.5">
                        নিবন্ধিত পরীক্ষাসমূহ · Registered Examination Subjects
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-700">
                        {subjects.map((sub) => (
                          <div key={sub.code} className="flex items-center gap-1.5 tabular-nums">
                            <span className="font-semibold text-[#1B2A6B] w-7">{sub.code}</span>
                            <span className="truncate">{sub.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions + Signatures */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-end justify-between gap-4">
                      <ul className="text-[9.5px] text-slate-600 space-y-0.5 max-w-[60%]">
                        <li>১. পরীক্ষা শুরুর অন্তত ১৫ মিনিট পূর্বে প্রবেশপত্রসহ কক্ষে উপস্থিত হতে হবে।</li>
                        <li>২. মোবাইল ফোন, স্মার্টওয়াচ বা অননুমোদিত কাগজপত্র কক্ষে আনা সম্পূর্ণ নিষিদ্ধ।</li>
                        <li>৩. নির্ধারিত আসন নম্বর অনুযায়ী বসতে হবে এবং পরিদর্শকের নির্দেশনা মানতে হবে।</li>
                      </ul>

                      {ctx.settings.showSignatures && (
                        <div className="flex items-end gap-6 text-center shrink-0 pt-4">
                          <div className="w-28 border-t border-slate-400 pt-1">
                            <p className="text-[10px] font-semibold text-[#1B2A6B]">শ্রেণি শিক্ষক</p>
                            <p className="text-[8.5px] text-slate-500">Class Teacher</p>
                          </div>
                          <div className="w-32 border-t border-slate-400 pt-1">
                            <p className="text-[10px] font-semibold text-[#1B2A6B]">প্রধান শিক্ষক</p>
                            <p className="text-[8.5px] text-slate-500 truncate">{ctx.headTeacherName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </PaperSheet>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// 2. EXAMINATION SEAT CARD (8-PER-A4 CUT-OUT DESK SLIPS)
// ---------------------------------------------------------------------------

export function ExamSeatCardDocument({
  allocation,
  exam,
  ctx,
}: {
  allocation: SeatAllocationResult;
  exam?: Exam;
  ctx: PrintRenderContext;
}) {
  const pages = chunkArray(allocation.assignments, 8);
  const examTitleBn = exam?.nameBn || 'বার্ষিক পরীক্ষা ২০২৬';

  return (
    <>
      {pages.map((batch, pageIdx) => (
        <PaperSheet
          key={`seat-card-p-${pageIdx}`}
          orientation={ctx.settings.orientation}
          marginMm={ctx.settings.marginMm}
          pageNumber={pageIdx + 1}
          totalPages={pages.length}
        >
          <div className="pb-2 mb-3 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-semibold text-[#1B2A6B]">
              পরীক্ষার আসন কার্ড (ডেস্ক স্লিপ) · Exam Seat Desk Cards (8-up)
            </span>
            <span className="tabular-nums">
              {examTitleBn} · কক্ষ: {allocation.roomName} · মোট আসন:{' '}
              {toBanglaNumber(allocation.assignments.length)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 flex-1 content-start">
            {batch.map((seat) => (
              <article
                key={seat.student.id}
                className="doc-keep-together border border-dashed border-slate-300 p-1.5 bg-white"
              >
                <div className="border border-[#1B2A6B]/85 rounded-[4px] overflow-hidden bg-white">
                  <div className="bg-[#1B2A6B] text-white px-3 py-1.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10.5px] font-semibold truncate">{SCHOOL_INFO.nameBn}</p>
                      <p className="text-[8.5px] text-[#E6CE8A] truncate">{examTitleBn}</p>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      <p className="text-[8px] uppercase tracking-wider text-slate-300">SEAT NO</p>
                      <p className="text-[14px] font-semibold leading-none text-white">
                        {String(seat.seatNumber).padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                  <div className="h-[2px] bg-[#C9A961]" />

                  <div className="p-3 flex items-start justify-between gap-2.5">
                    {ctx.settings.showStudentPhotos && (
                      <StudentAvatarBox student={seat.student} size="sm" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[12.5px] font-semibold text-[#1B2A6B] truncate">
                        {seat.student.nameBn}
                      </p>
                      <p className="text-[10px] text-slate-600 truncate">{seat.student.name}</p>
                      <div className="pt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] tabular-nums">
                        <p className="text-slate-500">
                          শ্রেণি: <strong className="text-slate-800">{seat.student.className}</strong>
                        </p>
                        <p className="text-slate-500">
                          শাখা: <strong className="text-slate-800">{seat.student.section}</strong>
                        </p>
                        <p className="text-slate-500">
                          আইডি: <strong className="text-slate-800">{seat.student.studentId}</strong>
                        </p>
                        <p className="text-slate-500">
                          কক্ষ: <strong className="text-[#1F7A4D]">{seat.roomName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-center border border-slate-200 bg-[#F7F8FC] rounded px-2.5 py-1.5 min-w-[54px]">
                      <p className="text-[8.5px] uppercase tracking-wider text-slate-500">ROLL</p>
                      <p className="text-[18px] font-semibold text-[#1B2A6B] leading-tight tabular-nums">
                        {String(seat.student.roll).padStart(2, '0')}
                      </p>
                      <p className="text-[8.5px] text-slate-500 tabular-nums">
                        B-{seat.benchNumber} ({seat.benchPosition === 'Left' ? 'L' : seat.benchPosition === 'Right' ? 'R' : 'S'})
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PaperSheet>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// 3. EXAMINATION ROOM SEAT PLAN (LANDSCAPE VISUAL BENCH-GRID LAYOUT)
// ---------------------------------------------------------------------------

export function ExamSeatPlanDocument({
  allocation,
  exam,
  date,
  ctx,
}: {
  allocation: SeatAllocationResult;
  exam?: Exam;
  date: string;
  ctx: PrintRenderContext;
}) {
  const columns = allocation.columns;
  const maxRow = allocation.assignments.reduce((m, a) => Math.max(m, a.rowIndex), 0);
  const rowCount = allocation.assignments.length > 0 ? maxRow + 1 : 0;

  // Group assignments by columnIndex -> rowIndex
  const getBenchSeats = (colIdx: number, rowIdx: number) =>
    allocation.assignments.filter((a) => a.columnIndex === colIdx && a.rowIndex === rowIdx);

  const code = generateVerificationCode(
    'exam-seat-plan',
    `${allocation.roomName}-${exam?.id || 'ex'}-${date}`
  );

  const classDistribution = Array.from(
    allocation.assignments.reduce((acc, a) => {
      const key = `${a.student.className} (${a.student.section})`;
      acc.set(key, (acc.get(key) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  );

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        variant="compact"
        docTitleBn="পরীক্ষার কক্ষ আসন বিন্যাস"
        docTitleEn="Examination Room Seat Plan"
        subtitle={`${exam?.nameBn || 'বার্ষিক পরীক্ষা ২০২৬'} · কক্ষ: ${allocation.roomName}`}
        serialNo={`SP-${allocation.roomName.split('—')[0].trim().replace(/\s+/g, '')}`}
        verificationCode={code}
      />

      {/* Room Meta Strip */}
      <div className="grid grid-cols-5 gap-2.5 mb-3 text-[10.5px] tabular-nums">
        <div className="border border-slate-200 bg-[#F7F8FC] px-3 py-1.5 rounded">
          <p className="text-[9px] text-slate-500 uppercase">পরীক্ষার কক্ষ / Room</p>
          <p className="font-semibold text-[#1B2A6B]">{allocation.roomName}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] px-3 py-1.5 rounded">
          <p className="text-[9px] text-slate-500 uppercase">পরীক্ষার তারিখ</p>
          <p className="font-semibold text-slate-800">{formatDateReadable(date)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] px-3 py-1.5 rounded">
          <p className="text-[9px] text-slate-500 uppercase">কক্ষের ধারণক্ষমতা</p>
          <p className="font-semibold text-slate-800">{toBanglaNumber(allocation.capacity)} আসন</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] px-3 py-1.5 rounded">
          <p className="text-[9px] text-slate-500 uppercase">বরাদ্দকৃত পরীক্ষার্থী</p>
          <p className="font-semibold text-[#1F7A4D]">
            {toBanglaNumber(allocation.assignments.length)} জন ({toBanglaNumber(allocation.totalBenches)} বেঞ্চ)
          </p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] px-3 py-1.5 rounded">
          <p className="text-[9px] text-slate-500 uppercase">বিন্যাস কাঠামো</p>
          <p className="font-semibold text-slate-800">
            {columns} সারি × প্রতি বেঞ্চে {allocation.seatsPerBench} জন
          </p>
        </div>
      </div>

      {/* Invigilator Podium / Blackboard Indicator */}
      <div className="mb-3 border border-[#1B2A6B]/40 bg-[#1B2A6B] text-white text-center py-1.5 rounded text-[10.5px] font-medium tracking-wider uppercase">
        ব্ল্যাকবোর্ড ও পরিদর্শকের ডেস্ক · Invigilator Desk & Front of Examination Hall
      </div>

      {/* Visual Column x Row Bench Grid */}
      <div
        className="grid gap-3 flex-1 content-start"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, colIdx) => (
          <div key={`col-${colIdx}`} className="space-y-2">
            <div className="text-center text-[10px] font-semibold text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 py-1 rounded">
              কলাম {toBanglaNumber(colIdx + 1)} · Column {colIdx + 1}
            </div>

            {Array.from({ length: rowCount }, (_, rowIdx) => {
              const seats = getBenchSeats(colIdx, rowIdx);
              if (seats.length === 0) return null;
              const benchNo = seats[0].benchNumber;

              return (
                <div
                  key={`b-${colIdx}-${rowIdx}`}
                  className="doc-keep-together border border-slate-300 rounded overflow-hidden bg-white"
                >
                  <div className="bg-slate-50 border-b border-slate-200 px-2 py-0.5 flex items-center justify-between text-[9px] text-slate-500 tabular-nums">
                    <span className="font-semibold text-[#1B2A6B]">বেঞ্চ #{benchNo}</span>
                    <span>Row {rowIdx + 1}</span>
                  </div>
                  <div
                    className={`grid divide-x divide-slate-200 ${
                      allocation.seatsPerBench === 2 ? 'grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {seats.map((seat) => (
                      <div key={seat.student.id} className="p-2 text-[9.5px] min-w-0">
                        <div className="flex items-center justify-between gap-1 tabular-nums">
                          <span className="font-semibold text-[#1F7A4D]">
                            Seat {String(seat.seatNumber).padStart(2, '0')}
                          </span>
                          <span className="font-semibold text-[#1B2A6B]">
                            Roll {seat.student.roll}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 truncate mt-0.5">
                          {seat.student.nameBn}
                        </p>
                        <p className="text-[8.5px] text-slate-500 truncate tabular-nums">
                          {seat.student.className} ({seat.student.section}) · {seat.student.studentId}
                        </p>
                      </div>
                    ))}
                    {allocation.seatsPerBench === 2 && seats.length === 1 && (
                      <div className="p-2 text-[9px] text-slate-400 flex items-center justify-center italic">
                        খালি আসন
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Distribution Summary + Overflow Notice */}
      <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex flex-wrap items-center gap-3 text-slate-700 tabular-nums">
          <span className="font-semibold text-[#1B2A6B]">শ্রেণিভিত্তিক বণ্টন:</span>
          {classDistribution.map(([cls, cnt]) => (
            <span key={cls}>
              {cls}: <strong>{toBanglaNumber(cnt)}</strong>
            </span>
          ))}
        </div>
        {allocation.capacityExceeded && (
          <span className="text-amber-800 font-semibold">
            সতর্কতা: ধারণক্ষমতা অতিক্রম করায় {toBanglaNumber(allocation.unassignedStudents.length)} জন শিক্ষার্থী
            পরবর্তী কক্ষে স্থানান্তরযোগ্য।
          </span>
        )}
      </div>

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'কক্ষ পরিদর্শক', labelEn: 'Room Invigilator' },
          { labelBn: 'পরীক্ষা নিয়ন্ত্রক', labelEn: 'Examination Controller' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
        dataSourceNote={`Duplicate-free Room Allocation · Capacity ${allocation.capacity}`}
      />
    </PaperSheet>
  );
}

// ---------------------------------------------------------------------------
// 4. INDIVIDUAL RESULT SHEET (SIGNATURE ORIGINAL MARKS SHEET)
// ---------------------------------------------------------------------------

export function IndividualResultSheetDocument({
  students,
  results,
  allClassResults,
  exam,
  attendanceMatrix,
  ctx,
}: {
  students: Student[];
  results: StudentResult[];
  allClassResults: StudentResult[];
  exam?: Exam;
  attendanceMatrix?: MonthlyAttendanceMatrix;
  ctx: PrintRenderContext;
}) {
  const highestBySubject = computeClassHighestMarks(allClassResults);
  const meritRows = buildMeritListRows(allClassResults);

  return (
    <>
      {students.map((student, idx) => {
        const res = results.find((r) => r.studentId === student.studentId);
        const merit = meritRows.find((m) => m.studentId === student.studentId);
        const attRow = attendanceMatrix?.rows.find((r) => r.student.studentId === student.studentId);
        const totalFull = res ? res.marks.reduce((s, m) => s + m.fullMarks, 0) : 0;
        const failedCount = res
          ? res.marks.filter((m) => m.grade === 'F' || m.obtainedMarks < m.passMarks).length
          : 0;
        const code = generateVerificationCode(
          'individual-result',
          `${student.studentId}-${exam?.id || 'ex'}`,
          student.session
        );

        return (
          <PaperSheet
            key={`ind-res-${student.id}`}
            orientation={ctx.settings.orientation}
            marginMm={ctx.settings.marginMm}
            pageNumber={idx + 1}
            totalPages={students.length}
          >
            <InstitutionalLetterhead
              ctx={ctx}
              docTitleBn="শিক্ষার্থীর ব্যক্তিগত নম্বরপত্র"
              docTitleEn="Official Result Sheet · Marks Sheet"
              subtitle={exam?.nameBn || res?.examName || 'পরীক্ষার ফলাফল'}
              serialNo={`MS-${student.studentId}`}
              rightSlot={<GradingScaleTable compact />}
            />

            {/* Student Identity Header Box */}
            <div className="mb-4 border border-slate-200 bg-[#F7F8FC] rounded p-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {ctx.settings.showStudentPhotos && <StudentAvatarBox student={student} size="md" />}
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] flex-1">
                  <div className="col-span-2">
                    <dt className="text-[9.5px] uppercase tracking-wider text-slate-500">
                      শিক্ষার্থীর নাম · Student Name
                    </dt>
                    <dd className="text-[13.5px] font-semibold text-[#1B2A6B] leading-snug">
                      {student.nameBn}{' '}
                      <span className="font-normal text-slate-600 text-[12px]">({student.name})</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[9.5px] text-slate-500">পিতা / অভিভাবক</dt>
                    <dd className="font-medium text-slate-800">{student.guardianName}</dd>
                  </div>
                  <div>
                    <dt className="text-[9.5px] text-slate-500">শিক্ষার্থী আইডি</dt>
                    <dd className="font-semibold text-slate-900 tabular-nums">{student.studentId}</dd>
                  </div>
                  <div>
                    <dt className="text-[9.5px] text-slate-500">শ্রেণি ও শাখা</dt>
                    <dd className="font-medium text-slate-800">
                      {student.className} · শাখা {student.section}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[9.5px] text-slate-500">রোল নম্বর ও শিক্ষাবর্ষ</dt>
                    <dd className="font-semibold text-[#1F7A4D] tabular-nums">
                      রোল {toBanglaNumber(student.roll)} · সেশন {student.session}
                    </dd>
                  </div>
                </dl>
              </div>
              {ctx.settings.showQrVerification && <VerificationQrSvg code={code} size={48} />}
            </div>

            {/* Subject Marks Table */}
            {res ? (
              <>
                <table className="w-full border-collapse border border-slate-300 text-[11px] tabular-nums">
                  <thead>
                    <tr className="bg-[#1B2A6B] text-white">
                      <th className="py-2 px-2.5 text-center border border-[#1B2A6B] w-12">কোড</th>
                      <th className="py-2 px-3 text-left border border-[#1B2A6B]">
                        বিষয়ের নাম · Subject Name
                      </th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">পূর্ণমান</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">পাশ নম্বর</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">সর্বোচ্চ</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B] w-20">প্রাপ্ত নম্বর</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">গ্রেড</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">জিপি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.marks.map((m, rIdx) => {
                      const isFail = m.grade === 'F' || m.obtainedMarks < m.passMarks;
                      return (
                        <tr
                          key={m.subjectCode}
                          className={rIdx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}
                        >
                          <td className="py-2 px-2.5 text-center border border-slate-200 text-slate-600">
                            {m.subjectCode}
                          </td>
                          <td className="py-2 px-3 border border-slate-200 font-medium text-slate-900">
                            {m.subjectName}
                          </td>
                          <td className="py-2 px-2 text-center border border-slate-200 text-slate-600">
                            {m.fullMarks}
                          </td>
                          <td className="py-2 px-2 text-center border border-slate-200 text-slate-500">
                            {m.passMarks}
                          </td>
                          <td className="py-2 px-2 text-center border border-slate-200 text-slate-700">
                            {highestBySubject[m.subjectCode] ?? m.obtainedMarks}
                          </td>
                          <td
                            className={`py-2 px-2 text-center border border-slate-200 font-semibold ${
                              isFail ? 'text-red-700' : 'text-[#1B2A6B]'
                            }`}
                          >
                            {m.obtainedMarks.toFixed(1)}
                          </td>
                          <td
                            className={`py-2 px-2 text-center border border-slate-200 font-semibold ${
                              isFail ? 'text-red-700' : 'text-[#1F7A4D]'
                            }`}
                          >
                            {m.grade}
                          </td>
                          <td className="py-2 px-2 text-center border border-slate-200 text-slate-800">
                            {m.gradePoint.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F7F8FC] font-semibold text-[#1B2A6B]">
                      <td colSpan={2} className="py-2 px-3 border border-slate-300 text-right">
                        সর্বমোট নম্বর ও চূড়ান্ত ফলাফল · Total & GPA
                      </td>
                      <td className="py-2 px-2 text-center border border-slate-300">{totalFull}</td>
                      <td className="py-2 px-2 text-center border border-slate-300">—</td>
                      <td className="py-2 px-2 text-center border border-slate-300">—</td>
                      <td className="py-2 px-2 text-center border border-slate-300 text-[12px]">
                        {res.totalMarks.toFixed(1)}
                      </td>
                      <td
                        className={`py-2 px-2 text-center border border-slate-300 ${
                          res.passed ? 'text-[#1F7A4D]' : 'text-red-700'
                        }`}
                      >
                        {res.overallGrade}
                      </td>
                      <td className="py-2 px-2 text-center border border-slate-300 text-[12px]">
                        {res.gpa.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Structured Summary + Attendance + Remarks Grid */}
                <div className="mt-4 grid grid-cols-12 gap-3.5">
                  <div className="col-span-5 border border-slate-300 rounded overflow-hidden text-[10.5px] tabular-nums">
                    <div className="bg-[#F7F8FC] px-3 py-1.5 border-b border-slate-200 font-semibold text-[#1B2A6B]">
                      ফলাফল ও উপস্থিতি সারসংক্ষেপ
                    </div>
                    <dl className="divide-y divide-slate-200">
                      <div className="px-3 py-1.5 flex justify-between">
                        <dt className="text-slate-600">ফলাফলের অবস্থা</dt>
                        <dd className={`font-semibold ${res.passed ? 'text-[#1F7A4D]' : 'text-red-700'}`}>
                          {res.passed ? 'উত্তীর্ণ (Passed)' : 'অকৃতকার্য (Failed)'}
                        </dd>
                      </div>
                      <div className="px-3 py-1.5 flex justify-between">
                        <dt className="text-slate-600">শ্রেণিতে মেধাক্রম</dt>
                        <dd className="font-semibold text-[#1B2A6B]">{merit?.meritRankBn || '—'}</dd>
                      </div>
                      <div className="px-3 py-1.5 flex justify-between">
                        <dt className="text-slate-600">অকৃতকার্য বিষয়</dt>
                        <dd className="font-semibold text-slate-800">{toBanglaNumber(failedCount)} টি</dd>
                      </div>
                      <div className="px-3 py-1.5 flex justify-between">
                        <dt className="text-slate-600">কার্যদিবস / উপস্থিত</dt>
                        <dd className="font-medium text-slate-800">
                          {attRow
                            ? `${toBanglaNumber(attRow.workingDays)} দিন / ${toBanglaNumber(attRow.presentDays)} দিন (${attRow.attendancePercent}%)`
                            : 'রেকর্ড প্রক্রিয়াধীন'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="col-span-7 border border-slate-300 rounded p-3 flex flex-col justify-between text-[11px]">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1B2A6B] mb-1">
                        শ্রেণি শিক্ষকের মন্তব্য · Class Teacher&apos;s Remarks
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        {res.gpa >= 4.5
                          ? 'অসাধারণ একাডেমিক কৃতিত্ব ও শৃঙ্খলাবোধ। নিয়মিত অধ্যবসায় অব্যাহত রাখলে আরও উজ্জ্বল ফলাফল অর্জন করবে।'
                          : res.passed
                            ? 'সন্তোষজনক ফলাফল। গণিত ও ইংরেজিতে অতিরিক্ত অনুশীলন করলে পরবর্তী পরীক্ষায় জিপিএ আরও উন্নত হবে।'
                            : 'অকৃতকার্য বিষয়ে নিবিড় তত্ত্বাবধান ও অভিভাবকের সাথে পরামর্শক্রমে পুনরায় প্রস্তুতি নেওয়া আবশ্যক।'}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9.5px] text-slate-500">
                      <span>
                        প্রকাশনা অবস্থা:{' '}
                        {res.status === 'Published'
                          ? 'প্রকাশিত (Published)'
                          : res.status === 'Verified'
                            ? 'যাচাইকৃত (Verified)'
                            : 'খসড়া (Draft)'}
                      </span>
                      <span className="tabular-nums">ফলাফল আইডি: {res.id}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="my-8 border border-dashed border-slate-300 rounded p-8 text-center text-xs text-slate-600">
                <p className="font-semibold text-[#1B2A6B] text-sm">
                  নির্বাচিত পরীক্ষার নম্বরপত্র এখনো নথিভুক্ত হয়নি
                </p>
                <p className="mt-1">
                  {student.nameBn} ({student.studentId}) এর জন্য {exam?.nameBn || 'নির্বাচিত পরীক্ষায়'} কোনো
                  নম্বর এন্ট্রি পাওয়া যায়নি।
                </p>
              </div>
            )}

            <SignatureBar
              ctx={ctx}
              slots={[
                { labelBn: 'অভিভাবকের স্বাক্ষর', labelEn: "Guardian's Signature" },
                { labelBn: 'শ্রেণি শিক্ষক', labelEn: 'Class Teacher' },
                { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
              ]}
              dataSourceNote={`Academic Result Ledger · Exam ${exam?.name || res?.examName || 'N/A'}`}
            />
          </PaperSheet>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// 5. MULTI-TERM PROGRESS REPORT (TERM COMPARISON CARD)
// ---------------------------------------------------------------------------

export function ProgressReportDocument({
  students,
  allResults,
  exams,
  attendanceMatrix,
  ctx,
}: {
  students: Student[];
  allResults: StudentResult[];
  exams: Exam[];
  attendanceMatrix?: MonthlyAttendanceMatrix;
  ctx: PrintRenderContext;
}) {
  const term1 = exams[0];
  const term2 = exams[1] || exams[0];

  return (
    <>
      {students.map((student, idx) => {
        const studentResList = allResults.filter((r) => r.studentId === student.studentId);
        const r1 = studentResList.find((r) => r.examId === term1?.id) || studentResList[0];
        const r2 =
          studentResList.find((r) => r.examId === term2?.id && r.id !== r1?.id) || undefined;
        const primary = r2 || r1;
        const attRow = attendanceMatrix?.rows.find((r) => r.student.studentId === student.studentId);
        const code = generateVerificationCode('progress-report', student.studentId, student.session);

        const subjectCodes = Array.from(
          new Set([
            ...(r1?.marks.map((m) => m.subjectCode) || []),
            ...(r2?.marks.map((m) => m.subjectCode) || []),
          ])
        );

        const progressBand = !primary
          ? 'pending'
          : primary.gpa >= 4.0
            ? 'good'
            : primary.passed
              ? 'improve'
              : 'attention';

        return (
          <PaperSheet
            key={`prog-${student.id}`}
            orientation={ctx.settings.orientation}
            marginMm={ctx.settings.marginMm}
            pageNumber={idx + 1}
            totalPages={students.length}
          >
            <InstitutionalLetterhead
              ctx={ctx}
              docTitleBn="সাময়িক ও বার্ষিক একাডেমিক অগ্রগতি প্রতিবেদন"
              docTitleEn="Academic Progress Report Card"
              subtitle={`শিক্ষাবর্ষ ${student.session} · ${student.className} (${student.section})`}
              serialNo={`PR-${student.studentId}`}
              verificationCode={code}
            />

            {/* Student Banner */}
            <div className="mb-4 grid grid-cols-12 gap-3 border border-slate-200 bg-[#F7F8FC] rounded p-3 text-[11px] items-center">
              <div className="col-span-6 flex items-center gap-3 min-w-0">
                {ctx.settings.showStudentPhotos && <StudentAvatarBox student={student} size="sm" />}
                <div className="min-w-0">
                  <p className="text-[9.5px] text-slate-500">শিক্ষার্থীর নাম</p>
                  <p className="font-semibold text-[#1B2A6B] text-[13px] truncate">{student.nameBn}</p>
                  <p className="text-[10.5px] text-slate-600 truncate">{student.name}</p>
                </div>
              </div>
              <div className="col-span-3 tabular-nums">
                <p className="text-[9.5px] text-slate-500">শ্রেণি · শাখা · রোল</p>
                <p className="font-semibold text-slate-800">
                  {student.className} ({student.section}) · রোল {toBanglaNumber(student.roll)}
                </p>
                <p className="text-[10px] text-slate-500">আইডি: {student.studentId}</p>
              </div>
              <div className="col-span-3">
                <p className="text-[9.5px] text-slate-500">অভিভাবক ও যোগাযোগ</p>
                <p className="font-medium text-slate-800 truncate">{student.guardianName}</p>
                {ctx.settings.showGuardianPhone && (
                  <p className="text-[10px] text-slate-600 tabular-nums">{student.guardianPhone}</p>
                )}
              </div>
            </div>

            {primary ? (
              <>
                <table className="w-full border-collapse border border-slate-300 text-[10.5px] tabular-nums">
                  <thead>
                    <tr className="bg-[#1B2A6B] text-white">
                      <th className="py-2 px-2.5 text-left border border-[#1B2A6B]">বিষয় (Subject)</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B]">পূর্ণমান</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B]">
                        {r1?.examName || term1?.nameBn || '১ম পর্ব'}
                      </th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B]">
                        {r2?.examName || term2?.nameBn || '২য় পর্ব'}
                      </th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B]">সর্বশেষ গ্রেড</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B]">জিপি</th>
                      <th className="py-2 px-2 text-center border border-[#1B2A6B]">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectCodes.map((sCode, i) => {
                      const m1 = r1?.marks.find((m) => m.subjectCode === sCode);
                      const m2 = r2?.marks.find((m) => m.subjectCode === sCode);
                      const active = m2 || m1!;
                      const isFail = active.grade === 'F' || active.obtainedMarks < active.passMarks;

                      return (
                        <tr key={sCode} className={i % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
                          <td className="py-1.5 px-2.5 border border-slate-200 font-medium text-slate-800">
                            {active.subjectName}
                          </td>
                          <td className="py-1.5 px-2 text-center border border-slate-200 text-slate-600">
                            {active.fullMarks}
                          </td>
                          <td className="py-1.5 px-2 text-center border border-slate-200 font-medium text-slate-800">
                            {m1 ? m1.obtainedMarks : '—'}
                          </td>
                          <td className="py-1.5 px-2 text-center border border-slate-200 font-medium text-[#1B2A6B]">
                            {m2 ? m2.obtainedMarks : '—'}
                          </td>
                          <td
                            className={`py-1.5 px-2 text-center border border-slate-200 font-semibold ${
                              isFail ? 'text-red-700' : 'text-[#1F7A4D]'
                            }`}
                          >
                            {active.grade}
                          </td>
                          <td className="py-1.5 px-2 text-center border border-slate-200">
                            {active.gradePoint.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-2 text-center border border-slate-200 text-[10px]">
                            {isFail ? (
                              <span className="text-red-700 font-medium">পুনঃপ্রস্তুতি</span>
                            ) : (
                              <span className="text-[#1F7A4D]">উত্তীর্ণ</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F7F8FC] font-semibold text-[#1B2A6B]">
                      <td colSpan={2} className="py-2 px-2.5 border border-slate-300 text-right">
                        পর্বভিত্তিক মোট ও জিপিএ
                      </td>
                      <td className="py-2 px-2 text-center border border-slate-300">
                        {r1 ? `${r1.totalMarks} (GPA ${r1.gpa.toFixed(2)})` : '—'}
                      </td>
                      <td className="py-2 px-2 text-center border border-slate-300">
                        {r2 ? `${r2.totalMarks} (GPA ${r2.gpa.toFixed(2)})` : '—'}
                      </td>
                      <td className="py-2 px-2 text-center border border-slate-300 text-[#1F7A4D]">
                        {primary.overallGrade}
                      </td>
                      <td className="py-2 px-2 text-center border border-slate-300">
                        {primary.gpa.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center border border-slate-300">
                        {primary.passed ? 'উত্তীর্ণ' : 'অকৃতকার্য'}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Progress Checklist + Attendance */}
                <div className="mt-4 grid grid-cols-2 gap-3.5 text-[10.5px]">
                  <div className="border border-slate-300 rounded p-3">
                    <p className="font-semibold text-[#1B2A6B] mb-2">
                      সামগ্রিক অগ্রগতি মূল্যায়ন · Progress Assessment
                    </p>
                    <div className="space-y-1.5 text-slate-700">
                      <p>
                        [{progressBand === 'good' ? '✓' : ' '}] উত্তম ও ধারাবাহিক অগ্রগতি (Good / Consistent)
                      </p>
                      <p>
                        [{progressBand === 'improve' ? '✓' : ' '}] আরও উন্নতির সুযোগ রয়েছে (Needs Improvement)
                      </p>
                      <p>
                        [{progressBand === 'attention' ? '✓' : ' '}] বিশেষ তত্ত্বাবধান প্রয়োজন (Attention Required)
                      </p>
                    </div>
                  </div>
                  <div className="border border-slate-300 rounded p-3 tabular-nums">
                    <p className="font-semibold text-[#1B2A6B] mb-2">
                      মাসিক উপস্থিতি ও আচরণ · Attendance & Conduct
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#F7F8FC] border border-slate-200 rounded py-1.5">
                        <p className="text-[9px] text-slate-500">উপস্থিত</p>
                        <p className="font-semibold text-[#1F7A4D]">
                          {attRow ? toBanglaNumber(attRow.presentDays) : '—'}
                        </p>
                      </div>
                      <div className="bg-[#F7F8FC] border border-slate-200 rounded py-1.5">
                        <p className="text-[9px] text-slate-500">অনুপস্থিত</p>
                        <p className="font-semibold text-red-700">
                          {attRow ? toBanglaNumber(attRow.absentDays) : '—'}
                        </p>
                      </div>
                      <div className="bg-[#F7F8FC] border border-slate-200 rounded py-1.5">
                        <p className="text-[9px] text-slate-500">উপস্থিতির হার</p>
                        <p className="font-semibold text-[#1B2A6B]">
                          {attRow ? `${attRow.attendancePercent}%` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="my-8 border border-dashed border-slate-300 rounded p-8 text-center text-xs text-slate-600">
                এই শিক্ষার্থীর কোনো পরীক্ষার ফলাফল এখনো সংরক্ষিত হয়নি।
              </div>
            )}

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
// 6. CLASS / SECTION RESULT SHEET (LANDSCAPE TABLE)
// ---------------------------------------------------------------------------

export function ClassResultSheetDocument({
  results,
  exam,
  classLabel,
  sectionLabel,
  ctx,
}: {
  results: StudentResult[];
  exam?: Exam;
  classLabel: string;
  sectionLabel: string;
  ctx: PrintRenderContext;
}) {
  const meritRows = buildMeritListRows(results).sort((a, b) => a.roll - b.roll);
  const subjects = Array.from(
    new Map(
      results.flatMap((r) => r.marks.map((m) => [m.subjectCode, m.subjectName.split('(')[0].trim()]))
    ).entries()
  );
  const code = generateVerificationCode('class-result', `${classLabel}-${exam?.id || 'ex'}`);

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        variant="compact"
        docTitleBn="শ্রেণি ও শাখাভিত্তিক ফলাফল শিট"
        docTitleEn="Class / Section Result Sheet"
        subtitle={`${exam?.nameBn || 'সকল পরীক্ষা'} · ${classLabel} · শাখা: ${sectionLabel}`}
        serialNo={`CR-${classLabel.replace(/\s+/g, '')}`}
        verificationCode={code}
      />

      {meritRows.length === 0 ? (
        <div className="my-10 border border-dashed border-slate-300 rounded p-8 text-center text-xs text-slate-600">
          নির্বাচিত শ্রেণি ও পরীক্ষার জন্য কোনো ফলাফল পাওয়া যায়নি।
        </div>
      ) : (
        <table className="w-full border-collapse border border-slate-300 text-[10px] tabular-nums">
          <thead>
            <tr className="bg-[#1B2A6B] text-white">
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-10">রোল</th>
              <th className="py-2 px-2 text-left border border-[#1B2A6B] w-24">আইডি</th>
              <th className="py-2 px-2.5 text-left border border-[#1B2A6B] min-w-[130px]">
                শিক্ষার্থীর নাম
              </th>
              {subjects.map(([sCode, sName]) => (
                <th
                  key={sCode}
                  className="py-2 px-1.5 text-center border border-[#1B2A6B] font-medium"
                >
                  <span className="block truncate max-w-[68px]" title={sName}>
                    {sName}
                  </span>
                </th>
              ))}
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-14">মোট</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-12">গ্রেড</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-12">জিপিএ</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">মেধাক্রম</th>
              <th className="py-2 px-2 text-left border border-[#1B2A6B] w-20">মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            {meritRows.map((row, idx) => (
              <tr key={row.result.id} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
                <td className="py-1.5 px-2 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                  {row.roll}
                </td>
                <td className="py-1.5 px-2 border border-slate-200 text-slate-600">
                  {row.studentId}
                </td>
                <td className="py-1.5 px-2.5 border border-slate-200 font-medium text-slate-900">
                  {row.studentNameBn}
                </td>
                {subjects.map(([sCode]) => {
                  const mk = row.result.marks.find((m) => m.subjectCode === sCode);
                  const isFail = mk && (mk.grade === 'F' || mk.obtainedMarks < mk.passMarks);
                  return (
                    <td
                      key={sCode}
                      className={`py-1.5 px-1.5 text-center border border-slate-200 ${
                        isFail ? 'text-red-700 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      {mk ? mk.obtainedMarks : '—'}
                    </td>
                  );
                })}
                <td className="py-1.5 px-2 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                  {row.totalMarks}
                </td>
                <td
                  className={`py-1.5 px-2 text-center border border-slate-200 font-semibold ${
                    row.passed ? 'text-[#1F7A4D]' : 'text-red-700'
                  }`}
                >
                  {row.overallGrade}
                </td>
                <td className="py-1.5 px-2 text-center border border-slate-200 font-semibold">
                  {row.gpa.toFixed(2)}
                </td>
                <td className="py-1.5 px-2 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                  {row.meritRankBn}
                </td>
                <td className="py-1.5 px-2 border border-slate-200 text-[9.5px] text-slate-600">
                  {row.passed ? 'উত্তীর্ণ' : `অকৃতকার্য (${row.failedSubjects.length})`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'শ্রেণি শিক্ষক', labelEn: 'Class Teacher' },
          { labelBn: 'পরীক্ষা নিয়ন্ত্রক', labelEn: 'Exam Controller' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
      />
    </PaperSheet>
  );
}

// ---------------------------------------------------------------------------
// 7. FULL LANDSCAPE TABULATION SHEET (MARKS + GRADE POINT PER SUBJECT)
// ---------------------------------------------------------------------------

export function TabulationSheetDocument({
  results,
  exam,
  classLabel,
  ctx,
}: {
  results: StudentResult[];
  exam?: Exam;
  classLabel: string;
  ctx: PrintRenderContext;
}) {
  const meritRows = buildMeritListRows(results).sort((a, b) => a.roll - b.roll);
  const subjects = Array.from(
    new Map(
      results.flatMap((r) => r.marks.map((m) => [m.subjectCode, m.subjectName.split('(')[0].trim()]))
    ).entries()
  );
  const highestBySub = computeClassHighestMarks(results);
  const passCount = meritRows.filter((r) => r.passed).length;
  const passRate = meritRows.length > 0 ? ((passCount / meritRows.length) * 100).toFixed(1) : '0.0';

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        variant="compact"
        docTitleBn="পরীক্ষার পূর্ণাঙ্গ টেবুলেশন শিট"
        docTitleEn="Examination Tabulation Sheet"
        subtitle={`${exam?.nameBn || 'সকল পরীক্ষা'} · ${classLabel}`}
        serialNo={`TAB-${classLabel.replace(/\s+/g, '')}`}
      />

      {meritRows.length === 0 ? (
        <div className="my-10 border border-dashed border-slate-300 rounded p-8 text-center text-xs text-slate-600">
          নির্বাচিত পরীক্ষার জন্য টেবুলেশন তথ্য পাওয়া যায়নি।
        </div>
      ) : (
        <table className="w-full border-collapse border border-slate-300 text-[9.5px] tabular-nums">
          <thead>
            <tr className="bg-[#1B2A6B] text-white">
              <th rowSpan={2} className="py-1.5 px-1.5 border border-[#1B2A6B] w-9">রোল</th>
              <th rowSpan={2} className="py-1.5 px-2 border border-[#1B2A6B] text-left min-w-[120px]">
                শিক্ষার্থী ও আইডি
              </th>
              {subjects.map(([sCode, sName]) => (
                <th key={sCode} colSpan={2} className="py-1 px-1 border border-[#1B2A6B] text-center">
                  <span className="block truncate max-w-[82px] mx-auto" title={sName}>
                    {sName}
                  </span>
                </th>
              ))}
              <th rowSpan={2} className="py-1.5 px-1.5 border border-[#1B2A6B] w-12">মোট</th>
              <th rowSpan={2} className="py-1.5 px-1.5 border border-[#1B2A6B] w-11">জিপিএ</th>
              <th rowSpan={2} className="py-1.5 px-1.5 border border-[#1B2A6B] w-11">গ্রেড</th>
              <th rowSpan={2} className="py-1.5 px-1.5 border border-[#1B2A6B] w-14">মেধাক্রম</th>
            </tr>
            <tr className="bg-[#27397E] text-slate-100 text-[8.5px]">
              {subjects.map(([sCode]) => (
                <React.Fragment key={`subh-${sCode}`}>
                  <th className="py-0.5 px-1 border border-[#1B2A6B]">নম্বর</th>
                  <th className="py-0.5 px-1 border border-[#1B2A6B]">জিপি</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {meritRows.map((row, idx) => (
              <tr key={row.result.id} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
                <td className="py-1.5 px-1.5 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                  {row.roll}
                </td>
                <td className="py-1.5 px-2 border border-slate-200">
                  <p className="font-semibold text-slate-900 leading-tight">{row.studentNameBn}</p>
                  <p className="text-[8.5px] text-slate-500">
                    {row.studentId} · {row.className} ({row.section})
                  </p>
                </td>
                {subjects.map(([sCode]) => {
                  const mk = row.result.marks.find((m) => m.subjectCode === sCode);
                  const isFail = mk && (mk.grade === 'F' || mk.obtainedMarks < mk.passMarks);
                  return (
                    <React.Fragment key={`${row.result.id}-${sCode}`}>
                      <td
                        className={`py-1.5 px-1 text-center border border-slate-200 ${
                          isFail ? 'text-red-700 font-semibold' : 'text-slate-800'
                        }`}
                      >
                        {mk ? mk.obtainedMarks : '—'}
                      </td>
                      <td className="py-1.5 px-1 text-center border border-slate-200 text-slate-600">
                        {mk ? mk.gradePoint.toFixed(1) : '—'}
                      </td>
                    </React.Fragment>
                  );
                })}
                <td className="py-1.5 px-1.5 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                  {row.totalMarks}
                </td>
                <td className="py-1.5 px-1.5 text-center border border-slate-200 font-semibold">
                  {row.gpa.toFixed(2)}
                </td>
                <td
                  className={`py-1.5 px-1.5 text-center border border-slate-200 font-semibold ${
                    row.passed ? 'text-[#1F7A4D]' : 'text-red-700'
                  }`}
                >
                  {row.overallGrade}
                </td>
                <td className="py-1.5 px-1.5 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                  {row.meritRankBn}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#F7F8FC] font-semibold text-[#1B2A6B]">
              <td colSpan={2} className="py-1.5 px-2 border border-slate-300 text-right">
                বিষয়ভিত্তিক সর্বোচ্চ নম্বর · Highest
              </td>
              {subjects.map(([sCode]) => (
                <td key={`hi-${sCode}`} colSpan={2} className="py-1.5 px-1 text-center border border-slate-300 text-[#1F7A4D]">
                  {highestBySub[sCode] ?? '—'}
                </td>
              ))}
              <td colSpan={4} className="py-1.5 px-2 border border-slate-300 text-center">
                পাসের হার: {passRate}% ({passCount}/{meritRows.length})
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'টেবুলেটর', labelEn: 'Tabulator' },
          { labelBn: 'পরীক্ষা নিয়ন্ত্রক', labelEn: 'Exam Controller' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
      />
    </PaperSheet>
  );
}



// ---------------------------------------------------------------------------
// 8. EXAMINATION MERIT LIST (RANKED HONOR LEDGER)
// ---------------------------------------------------------------------------

export function MeritListDocument({
  results,
  exam,
  classLabel,
  ctx,
}: {
  results: StudentResult[];
  exam?: Exam;
  classLabel: string;
  ctx: PrintRenderContext;
}) {
  const rows = buildMeritListRows(results);
  const code = generateVerificationCode('merit-list', `${classLabel}-${exam?.id || 'ex'}`);

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        docTitleBn="পরীক্ষার মেধাতালিকা"
        docTitleEn="Examination Merit List"
        subtitle={`${exam?.nameBn || 'সকল পরীক্ষা'} · ${classLabel}`}
        serialNo={`ML-${classLabel.replace(/\s+/g, '')}`}
        verificationCode={code}
      />

      {rows.length === 0 ? (
        <div className="my-10 border border-dashed border-slate-300 rounded p-8 text-center text-xs text-slate-600">
          মেধাতালিকা তৈরির জন্য কোনো ফলাফল পাওয়া যায়নি।
        </div>
      ) : (
        <table className="w-full border-collapse border border-slate-300 text-[11px] tabular-nums">
          <thead>
            <tr className="bg-[#1B2A6B] text-white">
              <th className="py-2 px-2.5 text-center border border-[#1B2A6B] w-16">মেধাক্রম</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-12">রোল</th>
              <th className="py-2 px-2.5 text-left border border-[#1B2A6B] w-28">আইডি</th>
              <th className="py-2 px-3 text-left border border-[#1B2A6B]">শিক্ষার্থীর নাম</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-24">শ্রেণি ও শাখা</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-20">মোট নম্বর</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-14">জিপিএ</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-14">গ্রেড</th>
              <th className="py-2 px-2.5 text-left border border-[#1B2A6B]">অবস্থা / অকৃতকার্য</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.result.id} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
                <td className="py-2 px-2.5 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                  {row.meritRank ? row.meritRankBn : '—'}
                </td>
                <td className="py-2 px-2 text-center border border-slate-200">{row.roll}</td>
                <td className="py-2 px-2.5 border border-slate-200 text-slate-600">{row.studentId}</td>
                <td className="py-2 px-3 border border-slate-200">
                  <p className="font-semibold text-slate-900">{row.studentNameBn}</p>
                  <p className="text-[9.5px] text-slate-500">{row.studentName}</p>
                </td>
                <td className="py-2 px-2 text-center border border-slate-200 text-[10.5px]">
                  {row.className} ({row.section})
                </td>
                <td className="py-2 px-2 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                  {row.totalMarks}/{row.fullMarks}
                </td>
                <td className="py-2 px-2 text-center border border-slate-200 font-semibold">
                  {row.gpa.toFixed(2)}
                </td>
                <td
                  className={`py-2 px-2 text-center border border-slate-200 font-semibold ${
                    row.passed ? 'text-[#1F7A4D]' : 'text-red-700'
                  }`}
                >
                  {row.overallGrade}
                </td>
                <td className="py-2 px-2.5 border border-slate-200 text-[10px]">
                  {row.passed ? (
                    <span className="text-[#1F7A4D] font-medium">উত্তীর্ণ</span>
                  ) : (
                    <span className="text-red-700">
                      অকৃতকার্য: {row.failedSubjects.join(', ') || 'হ্যাঁ'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'পরীক্ষা কমিটির আহ্বায়ক', labelEn: 'Exam Committee Convenor' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
      />
    </PaperSheet>
  );
}

// ---------------------------------------------------------------------------
// 9. RESULT SUMMARY & GRADE DISTRIBUTION (LANDSCAPE INSTITUTIONAL ANALYSIS)
// ---------------------------------------------------------------------------

export function ResultSummaryDocument({
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
  const rows = buildResultSummaryRows(students, results, exam?.id || 'All');
  const totals = rows.reduce(
    (acc, r) => ({
      totalStudents: acc.totalStudents + r.totalStudents,
      appeared: acc.appeared + r.appeared,
      absent: acc.absent + r.absent,
      passed: acc.passed + r.passed,
      failed: acc.failed + r.failed,
      grades: {
        'A+': acc.grades['A+'] + r.grades['A+'],
        A: acc.grades.A + r.grades.A,
        'A-': acc.grades['A-'] + r.grades['A-'],
        B: acc.grades.B + r.grades.B,
        C: acc.grades.C + r.grades.C,
        D: acc.grades.D + r.grades.D,
        F: acc.grades.F + r.grades.F,
      },
    }),
    {
      totalStudents: 0,
      appeared: 0,
      absent: 0,
      passed: 0,
      failed: 0,
      grades: { 'A+': 0, A: 0, 'A-': 0, B: 0, C: 0, D: 0, F: 0 },
    }
  );
  const overallPassRate =
    totals.appeared > 0 ? ((totals.passed / totals.appeared) * 100).toFixed(1) : '0.0';
  const code = generateVerificationCode('result-summary', exam?.id || 'all');

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        variant="compact"
        docTitleBn="ফলাফল সারসংক্ষেপ ও গ্রেড বিশ্লেষণ"
        docTitleEn="Institutional Result Summary & Grade Distribution"
        subtitle={exam?.nameBn || 'সকল পরীক্ষার সমন্বিত সারসংক্ষেপ'}
        serialNo="RS-2026"
        verificationCode={code}
      />

      {/* Executive KPI Strip */}
      <div className="grid grid-cols-5 gap-3 mb-4 text-center tabular-nums">
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2.5">
          <p className="text-[10px] text-slate-500">মোট নিবন্ধিত</p>
          <p className="text-lg font-semibold text-[#1B2A6B]">{toBanglaNumber(totals.totalStudents)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2.5">
          <p className="text-[10px] text-slate-500">অংশগ্রহণকারী</p>
          <p className="text-lg font-semibold text-slate-800">{toBanglaNumber(totals.appeared)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2.5">
          <p className="text-[10px] text-slate-500">মোট উত্তীর্ণ</p>
          <p className="text-lg font-semibold text-[#1F7A4D]">{toBanglaNumber(totals.passed)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2.5">
          <p className="text-[10px] text-slate-500">মোট জিপিএ-৫ (A+)</p>
          <p className="text-lg font-semibold text-[#1F7A4D]">{toBanglaNumber(totals.grades['A+'])}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2.5">
          <p className="text-[10px] text-slate-500">গড় পাসের হার</p>
          <p className="text-lg font-semibold text-[#1B2A6B]">{overallPassRate}%</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-slate-300 text-[11px] tabular-nums">
        <thead>
          <tr className="bg-[#1B2A6B] text-white">
            <th className="py-2 px-3 text-left border border-[#1B2A6B]">শ্রেণি (Class)</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">মোট শিক্ষার্থী</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">অংশগ্রহণ</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">অনুপস্থিত</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">A+</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">A</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">A-</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">B</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">C</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">D</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">F</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">উত্তীর্ণ</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">পাসের হার</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.className} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
              <td className="py-2 px-3 border border-slate-200 font-semibold text-[#1B2A6B]">
                {row.className}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200">{row.totalStudents}</td>
              <td className="py-2 px-2 text-center border border-slate-200">{row.appeared}</td>
              <td className="py-2 px-2 text-center border border-slate-200 text-slate-500">
                {row.absent}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200 font-semibold text-[#1F7A4D]">
                {row.grades['A+']}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200">{row.grades.A}</td>
              <td className="py-2 px-2 text-center border border-slate-200">{row.grades['A-']}</td>
              <td className="py-2 px-2 text-center border border-slate-200">{row.grades.B}</td>
              <td className="py-2 px-2 text-center border border-slate-200">{row.grades.C}</td>
              <td className="py-2 px-2 text-center border border-slate-200">{row.grades.D}</td>
              <td
                className={`py-2 px-2 text-center border border-slate-200 ${
                  row.grades.F > 0 ? 'text-red-700 font-semibold' : 'text-slate-400'
                }`}
              >
                {row.grades.F}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200 font-semibold text-[#1F7A4D]">
                {row.passed}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                {row.passRate.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[#F7F8FC] font-semibold text-[#1B2A6B]">
            <td className="py-2 px-3 border border-slate-300">সর্বমোট (Institutional Total)</td>
            <td className="py-2 px-2 text-center border border-slate-300">{totals.totalStudents}</td>
            <td className="py-2 px-2 text-center border border-slate-300">{totals.appeared}</td>
            <td className="py-2 px-2 text-center border border-slate-300">{totals.absent}</td>
            <td className="py-2 px-2 text-center border border-slate-300 text-[#1F7A4D]">
              {totals.grades['A+']}
            </td>
            <td className="py-2 px-2 text-center border border-slate-300">{totals.grades.A}</td>
            <td className="py-2 px-2 text-center border border-slate-300">{totals.grades['A-']}</td>
            <td className="py-2 px-2 text-center border border-slate-300">{totals.grades.B}</td>
            <td className="py-2 px-2 text-center border border-slate-300">{totals.grades.C}</td>
            <td className="py-2 px-2 text-center border border-slate-300">{totals.grades.D}</td>
            <td className="py-2 px-2 text-center border border-slate-300 text-red-700">
              {totals.grades.F}
            </td>
            <td className="py-2 px-2 text-center border border-slate-300 text-[#1F7A4D]">
              {totals.passed}
            </td>
            <td className="py-2 px-2 text-center border border-slate-300">{overallPassRate}%</td>
          </tr>
        </tfoot>
      </table>

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'পরীক্ষা নিয়ন্ত্রক', labelEn: 'Exam Controller' },
          { labelBn: 'সহকারী প্রধান শিক্ষক', labelEn: 'Assistant Head Teacher' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
      />
    </PaperSheet>
  );
}

// ---------------------------------------------------------------------------
// 10. SUBJECT-WISE RESULT ANALYSIS REPORT
// ---------------------------------------------------------------------------

export function SubjectResultDocument({
  results,
  subjectName,
  exam,
  ctx,
}: {
  results: StudentResult[];
  subjectName: string;
  exam?: Exam;
  ctx: PrintRenderContext;
}) {
  const report = buildSubjectAnalysisReport(results, subjectName);
  const code = generateVerificationCode('subject-result', `${subjectName}-${exam?.id || 'ex'}`);

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        docTitleBn="বিষয়ভিত্তিক ফলাফল ও মূল্যায়ন প্রতিবেদন"
        docTitleEn="Subject-Wise Result Analysis Report"
        subtitle={`বিষয়: ${report.subjectName} · ${exam?.nameBn || 'সকল পরীক্ষা'}`}
        serialNo="SUB-2026"
        verificationCode={code}
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-2.5 mb-3 text-center tabular-nums">
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">মোট পরীক্ষার্থী</p>
          <p className="text-base font-semibold text-[#1B2A6B]">{toBanglaNumber(report.totalExamined)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">সর্বোচ্চ নম্বর</p>
          <p className="text-base font-semibold text-[#1F7A4D]">{report.highest}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">সর্বনিম্ন নম্বর</p>
          <p className="text-base font-semibold text-slate-800">{report.lowest}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">গড় নম্বর</p>
          <p className="text-base font-semibold text-[#1B2A6B]">{report.average}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">পাসের হার</p>
          <p className="text-base font-semibold text-[#1F7A4D]">{report.passRate}%</p>
        </div>
      </div>

      {/* Grade Distribution Strip */}
      <div className="mb-4 border border-slate-200 rounded px-3 py-2 flex items-center justify-between text-[10.5px] tabular-nums bg-white">
        <span className="font-semibold text-[#1B2A6B]">গ্রেড বিন্যাস:</span>
        {(['A+', 'A', 'A-', 'B', 'C', 'D', 'F'] as const).map((g) => (
          <span key={g} className={g === 'F' ? 'text-red-700' : 'text-slate-700'}>
            <strong>{g}:</strong> {report.gradeCounts[g]}
          </span>
        ))}
      </div>

      {report.entries.length === 0 ? (
        <div className="my-10 border border-dashed border-slate-300 rounded p-8 text-center text-xs text-slate-600">
          নির্বাচিত বিষয়ের ({report.subjectName}) কোনো নম্বর এন্ট্রি পাওয়া যায়নি।
        </div>
      ) : (
        <table className="w-full border-collapse border border-slate-300 text-[11px] tabular-nums">
          <thead>
            <tr className="bg-[#1B2A6B] text-white">
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-10">ক্রম</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-12">রোল</th>
              <th className="py-2 px-2.5 text-left border border-[#1B2A6B] w-28">আইডি</th>
              <th className="py-2 px-3 text-left border border-[#1B2A6B]">শিক্ষার্থীর নাম</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-24">শ্রেণি ও শাখা</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">পূর্ণমান</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-20">প্রাপ্ত নম্বর</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-14">গ্রেড</th>
              <th className="py-2 px-2 text-center border border-[#1B2A6B] w-14">জিপি</th>
            </tr>
          </thead>
          <tbody>
            {report.entries.map((entry, idx) => (
              <tr key={`${entry.studentId}-${idx}`} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
                <td className="py-1.5 px-2 text-center border border-slate-200 text-slate-500">
                  {idx + 1}
                </td>
                <td className="py-1.5 px-2 text-center border border-slate-200 font-medium">
                  {entry.roll}
                </td>
                <td className="py-1.5 px-2.5 border border-slate-200 text-slate-600">
                  {entry.studentId}
                </td>
                <td className="py-1.5 px-3 border border-slate-200 font-medium text-slate-900">
                  {entry.studentNameBn}
                </td>
                <td className="py-1.5 px-2 text-center border border-slate-200 text-[10.5px]">
                  {entry.className} ({entry.section})
                </td>
                <td className="py-1.5 px-2 text-center border border-slate-200 text-slate-600">
                  {entry.fullMarks}
                </td>
                <td
                  className={`py-1.5 px-2 text-center border border-slate-200 font-semibold ${
                    entry.passed ? 'text-[#1B2A6B]' : 'text-red-700'
                  }`}
                >
                  {entry.obtainedMarks}
                </td>
                <td
                  className={`py-1.5 px-2 text-center border border-slate-200 font-semibold ${
                    entry.passed ? 'text-[#1F7A4D]' : 'text-red-700'
                  }`}
                >
                  {entry.grade}
                </td>
                <td className="py-1.5 px-2 text-center border border-slate-200">
                  {entry.gradePoint.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'বিষয় শিক্ষক', labelEn: 'Subject Teacher' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
      />
    </PaperSheet>
  );
}
