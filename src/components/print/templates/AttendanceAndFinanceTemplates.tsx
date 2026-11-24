import {
  buildAttendanceSummaryByClass,
  buildDailyAttendanceReport,
  buildFeeDueMatrix,
  buildTeacherMonthlyAttendance,
  generateVerificationCode,
  type MonthlyAttendanceMatrix,
  type PrintFilterState,
} from '../../../services/printDocumentService';
import type {
  AttendanceRecord,
  FeeRecord,
  StaffMember,
  Student,
  Teacher,
} from '../../../types';
import {
  formatCurrencyBdt,
  formatDateReadable,
  toBanglaNumber,
} from '../../../utils/grading';
import {
  InstitutionalLetterhead,
  PaperSheet,
  SignatureBar,
  StudentAvatarBox,
  VerificationQrSvg,
  type PrintRenderContext,
} from '../PrintSharedElements';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------------------------------------------------------------------------
// 1. MONTHLY ATTENDANCE REPORT (LANDSCAPE 1-31 MATRIX)
// ---------------------------------------------------------------------------

export function MonthlyAttendanceMatrixDocument({
  matrix,
  classLabel,
  sectionLabel,
  ctx,
}: {
  matrix: MonthlyAttendanceMatrix;
  classLabel: string;
  sectionLabel: string;
  ctx: PrintRenderContext;
}) {
  const code = generateVerificationCode(
    'monthly-attendance',
    `${classLabel}-${matrix.year}-${matrix.month}`
  );

  const originNote =
    matrix.dataSource === 'verified'
      ? 'Verified Live RFID / Manual Attendance Register'
      : matrix.dataSource === 'mixed'
        ? 'Live Portal Records + Supplementary Working-Day Demo Preview'
        : 'Preview Register (Live RFID logs appear automatically as marked)';

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
        docTitleBn="মাসিক উপস্থিতি প্রতিবেদন (১–৩১)"
        docTitleEn="Monthly Attendance Register"
        subtitle={`${matrix.monthLabelBn} ${toBanglaNumber(matrix.year)} (${matrix.monthLabelEn} ${matrix.year}) · ${classLabel} · শাখা: ${sectionLabel}`}
        serialNo={`ATT-${matrix.year}-${String(matrix.month).padStart(2, '0')}`}
        verificationCode={code}
      />

      {/* Metadata & Legend Strip */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-600 tabular-nums">
        <div className="flex items-center gap-4">
          <span>
            মোট কার্যদিবস: <strong className="text-[#1B2A6B]">{toBanglaNumber(matrix.workingDaysCount)} দিন</strong>
          </span>
          <span>
            মোট শিক্ষার্থী: <strong className="text-[#1B2A6B]">{toBanglaNumber(matrix.rows.length)} জন</strong>
          </span>
          <span>
            গড় উপস্থিতি: <strong className="text-[#1F7A4D]">{matrix.totals.avgPercent}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span><strong className="text-[#1F7A4D]">P</strong> = উপস্থিত (Present)</span>
          <span><strong className="text-red-700">A</strong> = অনুপস্থিত (Absent)</span>
          <span><strong className="text-amber-700">L</strong> = বিলম্ব (Late)</span>
          <span><strong className="text-slate-400">H</strong> = সাপ্তাহিক ছুটি</span>
        </div>
      </div>

      {/* 1-31 Compact Matrix Table */}
      <table className="w-full border-collapse border border-slate-300 text-[8.5px] tabular-nums">
        <thead>
          <tr className="bg-[#1B2A6B] text-white">
            <th className="py-1.5 px-1 border border-[#1B2A6B] w-7 text-center">রোল</th>
            <th className="py-1.5 px-1.5 border border-[#1B2A6B] text-left min-w-[105px]">
              শিক্ষার্থী
            </th>
            {matrix.dayHeaders.map((dh) => (
              <th
                key={dh.day}
                className={`py-1 px-0.5 border border-[#1B2A6B] text-center w-[18px] ${
                  dh.isWeekend ? 'bg-[#2A3B7E] text-[#E6CE8A]' : ''
                }`}
              >
                <span className="block leading-none font-semibold">{dh.day}</span>
                <span className="block text-[7px] font-normal opacity-80 mt-0.5">
                  {dh.weekdayShort[0]}
                </span>
              </th>
            ))}
            <th className="py-1.5 px-1 border border-[#1B2A6B] text-center w-8">দিন</th>
            <th className="py-1.5 px-1 border border-[#1B2A6B] text-center w-8">উপ.</th>
            <th className="py-1.5 px-1 border border-[#1B2A6B] text-center w-8">অনু.</th>
            <th className="py-1.5 px-1 border border-[#1B2A6B] text-center w-7">বিল.</th>
            <th className="py-1.5 px-1 border border-[#1B2A6B] text-center w-11">হার %</th>
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row, rIdx) => (
            <tr key={row.student.id} className={rIdx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
              <td className="py-1 px-1 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                {row.student.roll}
              </td>
              <td className="py-1 px-1.5 border border-slate-200">
                <p className="font-medium text-slate-900 truncate max-w-[125px]">
                  {row.student.nameBn}
                </p>
                <p className="text-[7.5px] text-slate-500">{row.student.studentId}</p>
              </td>
              {row.days.map((d) => {
                const cellClass =
                  d.code === 'H'
                    ? 'bg-slate-100 text-slate-400'
                    : d.code === 'A'
                      ? 'bg-red-50/70 text-red-700 font-semibold'
                      : d.code === 'L'
                        ? 'bg-amber-50/70 text-amber-800 font-semibold'
                        : d.code === 'P'
                          ? 'text-[#1F7A4D] font-medium'
                          : 'text-slate-300';
                return (
                  <td
                    key={d.day}
                    className={`py-1 px-0 text-center border border-slate-200 ${cellClass}`}
                  >
                    {d.code}
                  </td>
                );
              })}
              <td className="py-1 px-1 text-center border border-slate-200 text-slate-600">
                {row.workingDays}
              </td>
              <td className="py-1 px-1 text-center border border-slate-200 font-semibold text-[#1F7A4D]">
                {row.presentDays}
              </td>
              <td
                className={`py-1 px-1 text-center border border-slate-200 ${
                  row.absentDays > 0 ? 'text-red-700 font-semibold' : 'text-slate-400'
                }`}
              >
                {row.absentDays}
              </td>
              <td className="py-1 px-1 text-center border border-slate-200 text-amber-800">
                {row.lateDays}
              </td>
              <td className="py-1 px-1 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                {row.attendancePercent}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[#F7F8FC] font-semibold text-[#1B2A6B]">
            <td colSpan={2 + matrix.daysInMonth} className="py-1.5 px-2 border border-slate-300 text-right">
              শ্রেণি সর্বমোট ও গড় উপস্থিতির হার · Class Subtotal
            </td>
            <td className="py-1.5 px-1 text-center border border-slate-300">
              {matrix.totals.workingDays}
            </td>
            <td className="py-1.5 px-1 text-center border border-slate-300 text-[#1F7A4D]">
              {matrix.totals.present}
            </td>
            <td className="py-1.5 px-1 text-center border border-slate-300 text-red-700">
              {matrix.totals.absent}
            </td>
            <td className="py-1.5 px-1 text-center border border-slate-300 text-amber-800">
              {matrix.totals.late}
            </td>
            <td className="py-1.5 px-1 text-center border border-slate-300">
              {matrix.totals.avgPercent}%
            </td>
          </tr>
        </tfoot>
      </table>

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'শ্রেণি শিক্ষক', labelEn: 'Class Teacher' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
        dataSourceNote={originNote}
      />
    </PaperSheet>
  );
}

// ---------------------------------------------------------------------------
// 2. DAILY ATTENDANCE REPORT
// ---------------------------------------------------------------------------

export function DailyAttendanceDocument({
  students,
  attendanceRecords,
  date,
  statusFilter,
  classLabel,
  ctx,
}: {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  date: string;
  statusFilter: PrintFilterState['attendanceStatus'];
  classLabel: string;
  ctx: PrintRenderContext;
}) {
  const { rows, summary } = buildDailyAttendanceReport(
    students,
    attendanceRecords,
    date,
    statusFilter
  );
  const code = generateVerificationCode('daily-attendance', `${date}-${classLabel}`);

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        docTitleBn="দৈনিক উপস্থিতি প্রতিবেদন"
        docTitleEn="Daily Attendance & RFID Gate Report"
        subtitle={`তারিখ: ${formatDateReadable(date)} · ${classLabel} · ফিল্টার: ${statusFilter}`}
        serialNo={`DA-${date}`}
        verificationCode={code}
      />

      {/* Daily Summary KPIs */}
      <div className="grid grid-cols-5 gap-2.5 mb-4 text-center tabular-nums">
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">মোট শিক্ষার্থী</p>
          <p className="text-base font-semibold text-[#1B2A6B]">{toBanglaNumber(summary.total)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">উপস্থিত</p>
          <p className="text-base font-semibold text-[#1F7A4D]">{toBanglaNumber(summary.present)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">বিলম্বে উপস্থিত</p>
          <p className="text-base font-semibold text-amber-700">{toBanglaNumber(summary.late)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">অনুপস্থিত</p>
          <p className="text-base font-semibold text-red-700">{toBanglaNumber(summary.absent)}</p>
        </div>
        <div className="border border-slate-200 bg-[#F7F8FC] rounded p-2">
          <p className="text-[9.5px] text-slate-500">অনিবন্ধিত</p>
          <p className="text-base font-semibold text-slate-500">{toBanglaNumber(summary.unmarked)}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-slate-300 text-[10.5px] tabular-nums">
        <thead>
          <tr className="bg-[#1B2A6B] text-white">
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-10">রোল</th>
            <th className="py-2 px-2.5 text-left border border-[#1B2A6B] w-24">আইডি</th>
            <th className="py-2 px-2.5 text-left border border-[#1B2A6B]">শিক্ষার্থীর নাম</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-24">শ্রেণি ও শাখা</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">প্রবেশ</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">প্রস্থান</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-20">অবস্থা</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">মাধ্যম</th>
            <th className="py-2 px-2 text-left border border-[#1B2A6B]">মন্তব্য</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.student.id} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
              <td className="py-1.5 px-2 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                {row.student.roll}
              </td>
              <td className="py-1.5 px-2.5 border border-slate-200 text-slate-600">
                {row.student.studentId}
              </td>
              <td className="py-1.5 px-2.5 border border-slate-200 font-medium text-slate-900">
                {row.student.nameBn}
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200 text-[10px]">
                {row.student.className} ({row.student.section})
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200 text-slate-700">
                {row.entryTime}
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200 text-slate-700">
                {row.exitTime}
              </td>
              <td
                className={`py-1.5 px-2 text-center border border-slate-200 font-semibold ${
                  row.status === 'Present' || row.status === 'Exited'
                    ? 'text-[#1F7A4D]'
                    : row.status === 'Late'
                      ? 'text-amber-700'
                      : row.status === 'Absent'
                        ? 'text-red-700'
                        : 'text-slate-400'
                }`}
              >
                {row.status}
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200 text-slate-600">
                {row.source}
              </td>
              <td className="py-1.5 px-2 border border-slate-200 text-[10px] text-slate-600">
                {row.remarks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'দৈনিক হাজিরা দায়িত্বপ্রাপ্ত', labelEn: 'Attendance Officer' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
        dataSourceNote={`Verified Daily Attendance Log · ${date}`}
      />
    </PaperSheet>
  );
}

// ---------------------------------------------------------------------------
// 3. INDIVIDUAL STUDENT ATTENDANCE REPORT
// ---------------------------------------------------------------------------

export function IndividualAttendanceDocument({
  matrix,
  ctx,
}: {
  matrix: MonthlyAttendanceMatrix;
  ctx: PrintRenderContext;
}) {
  return (
    <>
      {matrix.rows.map((row, idx) => {
        const student = row.student;
        const code = generateVerificationCode(
          'student-attendance',
          `${student.studentId}-${matrix.year}-${matrix.month}`
        );

        return (
          <PaperSheet
            key={`stu-att-${student.id}`}
            orientation={ctx.settings.orientation}
            marginMm={ctx.settings.marginMm}
            pageNumber={idx + 1}
            totalPages={matrix.rows.length}
          >
            <InstitutionalLetterhead
              ctx={ctx}
              docTitleBn="শিক্ষার্থীর ব্যক্তিগত মাসিক উপস্থিতি প্রতিবেদন"
              docTitleEn="Individual Student Attendance Dossier"
              subtitle={`${matrix.monthLabelBn} ${toBanglaNumber(matrix.year)} (${matrix.monthLabelEn} ${matrix.year})`}
              serialNo={`SA-${student.studentId}`}
              verificationCode={code}
            />

            {/* Student Card */}
            <div className="mb-4 border border-slate-200 bg-[#F7F8FC] rounded p-3.5 flex items-center gap-4">
              {ctx.settings.showStudentPhotos && <StudentAvatarBox student={student} size="sm" />}
              <dl className="flex-1 grid grid-cols-3 gap-x-4 gap-y-1 text-[11px]">
                <div className="col-span-2">
                  <dt className="text-[9.5px] text-slate-500">শিক্ষার্থীর নাম</dt>
                  <dd className="font-semibold text-[#1B2A6B] text-[13px]">
                    {student.nameBn} ({student.name})
                  </dd>
                </div>
                <div className="tabular-nums">
                  <dt className="text-[9.5px] text-slate-500">আইডি ও রোল</dt>
                  <dd className="font-semibold text-slate-800">
                    {student.studentId} · রোল {toBanglaNumber(student.roll)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[9.5px] text-slate-500">শ্রেণি ও শাখা</dt>
                  <dd className="font-medium text-slate-800">
                    {student.className} · শাখা {student.section}
                  </dd>
                </div>
                <div>
                  <dt className="text-[9.5px] text-slate-500">অভিভাবক</dt>
                  <dd className="font-medium text-slate-800">{student.guardianName}</dd>
                </div>
                {ctx.settings.showGuardianPhone && (
                  <div className="tabular-nums">
                    <dt className="text-[9.5px] text-slate-500">অভিভাবক মোবাইল</dt>
                    <dd className="font-medium text-slate-800">{student.guardianPhone}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* 5 KPI Summary Strip */}
            <div className="grid grid-cols-5 gap-2.5 mb-4 text-center tabular-nums">
              <div className="border border-slate-200 rounded p-2.5 bg-white">
                <p className="text-[9.5px] text-slate-500">কার্যদিবস</p>
                <p className="text-lg font-semibold text-[#1B2A6B]">{toBanglaNumber(row.workingDays)}</p>
              </div>
              <div className="border border-slate-200 rounded p-2.5 bg-white">
                <p className="text-[9.5px] text-slate-500">উপস্থিত দিন</p>
                <p className="text-lg font-semibold text-[#1F7A4D]">{toBanglaNumber(row.presentDays)}</p>
              </div>
              <div className="border border-slate-200 rounded p-2.5 bg-white">
                <p className="text-[9.5px] text-slate-500">অনুপস্থিত দিন</p>
                <p className="text-lg font-semibold text-red-700">{toBanglaNumber(row.absentDays)}</p>
              </div>
              <div className="border border-slate-200 rounded p-2.5 bg-white">
                <p className="text-[9.5px] text-slate-500">বিলম্ব</p>
                <p className="text-lg font-semibold text-amber-700">{toBanglaNumber(row.lateDays)}</p>
              </div>
              <div className="border border-slate-200 rounded p-2.5 bg-[#F7F8FC]">
                <p className="text-[9.5px] text-slate-500">উপস্থিতির হার</p>
                <p className="text-lg font-semibold text-[#1B2A6B]">{row.attendancePercent}%</p>
              </div>
            </div>

            {/* Day-by-Day Calendar Grid */}
            <h3 className="text-[11px] font-semibold text-[#1B2A6B] uppercase tracking-wider mb-2">
              দৈনিক হাজিরা পঞ্জিকা · Day-by-Day Attendance Calendar
            </h3>
            <div className="grid grid-cols-7 gap-2 tabular-nums">
              {row.days.map((d, dIdx) => {
                const header = matrix.dayHeaders[dIdx];
                const style =
                  d.code === 'H'
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : d.code === 'A'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : d.code === 'L'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-white border-slate-200 text-[#1F7A4D]';
                const labelBn =
                  d.code === 'P'
                    ? 'উপস্থিত'
                    : d.code === 'A'
                      ? 'অনুপস্থিত'
                      : d.code === 'L'
                        ? 'বিলম্ব'
                        : 'ছুটি';

                return (
                  <div key={d.day} className={`border rounded p-2 text-center ${style}`}>
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="font-semibold text-slate-700">{d.day}</span>
                      <span>{header?.weekdayShort}</span>
                    </div>
                    <p className="text-[12px] font-semibold mt-1">{d.code}</p>
                    <p className="text-[8.5px] opacity-85">{labelBn}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border border-slate-200 rounded p-3 text-[11px] text-slate-700 bg-[#F7F8FC]">
              <strong className="text-[#1B2A6B]">প্রাতিষ্ঠানিক মন্তব্য: </strong>
              {row.attendancePercent >= 85
                ? 'শিক্ষার্থীর নিয়মিত উপস্থিতি প্রশংসনীয়। বোর্ড পরীক্ষার নীতিমালা অনুযায়ী পর্যাপ্ত উপস্থিতি বজায় রয়েছে।'
                : 'উপস্থিতির হার আরও বৃদ্ধি করা প্রয়োজন। অনুপস্থিতির কারণ অভিভাবকের মাধ্যমে শ্রেণি শিক্ষককে অবহিত করার অনুরোধ রইল।'}
            </div>

            <SignatureBar
              ctx={ctx}
              slots={[
                { labelBn: 'অভিভাবকের স্বাক্ষর', labelEn: "Guardian's Signature" },
                { labelBn: 'শ্রেণি শিক্ষক', labelEn: 'Class Teacher' },
                { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
              ]}
              dataSourceNote={
                matrix.dataSource === 'verified'
                  ? 'Verified Live Portal Attendance'
                  : 'Portal Attendance + Working-Day Preview'
              }
            />
          </PaperSheet>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// 4. CLASS & SECTION ATTENDANCE SUMMARY
// ---------------------------------------------------------------------------

export function AttendanceSummaryDocument({
  students,
  attendanceRecords,
  year,
  month,
  monthLabelBn,
  monthLabelEn,
  ctx,
}: {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  year: number;
  month: number;
  monthLabelBn: string;
  monthLabelEn: string;
  ctx: PrintRenderContext;
}) {
  const rows = buildAttendanceSummaryByClass(students, attendanceRecords, year, month);
  const totalStudents = rows.reduce((s, r) => s + r.studentCount, 0);
  const totalPresent = rows.reduce((s, r) => s + r.totalPresent, 0);
  const totalAbsent = rows.reduce((s, r) => s + r.totalAbsent, 0);
  const totalLate = rows.reduce((s, r) => s + r.totalLate, 0);
  const totalManDays = totalPresent + totalAbsent;
  const overallAvg = totalManDays > 0 ? ((totalPresent / totalManDays) * 100).toFixed(1) : '0.0';

  return (
    <PaperSheet
      orientation={ctx.settings.orientation}
      marginMm={ctx.settings.marginMm}
      pageNumber={1}
      totalPages={1}
    >
      <InstitutionalLetterhead
        ctx={ctx}
        docTitleBn="শ্রেণি ও শাখাভিত্তিক উপস্থিতি সারসংক্ষেপ"
        docTitleEn="Class & Section Monthly Attendance Summary"
        subtitle={`${monthLabelBn} ${toBanglaNumber(year)} (${monthLabelEn} ${year})`}
        serialNo={`AS-${year}-${String(month).padStart(2, '0')}`}
        verificationCode={generateVerificationCode('attendance-summary', `${year}-${month}`)}
      />

      <table className="w-full border-collapse border border-slate-300 text-[11px] tabular-nums">
        <thead>
          <tr className="bg-[#1B2A6B] text-white">
            <th className="py-2 px-3 text-left border border-[#1B2A6B]">শ্রেণি (Class)</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">শাখা</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">শিক্ষার্থী সংখ্যা</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">কার্যদিবস</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">মোট উপস্থিত</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">মোট অনুপস্থিত</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">বিলম্ব</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B]">গড় উপস্থিতি %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={`${r.className}-${r.section}`} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
              <td className="py-2 px-3 border border-slate-200 font-semibold text-[#1B2A6B]">
                {r.className}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200">{r.section}</td>
              <td className="py-2 px-2 text-center border border-slate-200">{r.studentCount}</td>
              <td className="py-2 px-2 text-center border border-slate-200">{r.workingDays}</td>
              <td className="py-2 px-2 text-center border border-slate-200 font-semibold text-[#1F7A4D]">
                {r.totalPresent}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200 text-red-700">
                {r.totalAbsent}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200 text-amber-800">
                {r.totalLate}
              </td>
              <td className="py-2 px-2 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                {r.avgPercent}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[#F7F8FC] font-semibold text-[#1B2A6B]">
            <td colSpan={2} className="py-2 px-3 border border-slate-300">
              সর্বমোট (Institutional Summary)
            </td>
            <td className="py-2 px-2 text-center border border-slate-300">{totalStudents}</td>
            <td className="py-2 px-2 text-center border border-slate-300">
              {rows[0]?.workingDays || 0}
            </td>
            <td className="py-2 px-2 text-center border border-slate-300 text-[#1F7A4D]">
              {totalPresent}
            </td>
            <td className="py-2 px-2 text-center border border-slate-300 text-red-700">
              {totalAbsent}
            </td>
            <td className="py-2 px-2 text-center border border-slate-300 text-amber-800">
              {totalLate}
            </td>
            <td className="py-2 px-2 text-center border border-slate-300">{overallAvg}%</td>
          </tr>
        </tfoot>
      </table>

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'সহকারী প্রধান শিক্ষক', labelEn: 'Assistant Head Teacher' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
      />
    </PaperSheet>
  );
}

// ---------------------------------------------------------------------------
// 5. TEACHER & STAFF MONTHLY ATTENDANCE REPORT (LANDSCAPE)
// ---------------------------------------------------------------------------

export function TeacherAttendanceDocument({
  teachers,
  staff,
  year,
  month,
  monthLabelBn,
  monthLabelEn,
  ctx,
}: {
  teachers: Teacher[];
  staff: StaffMember[];
  year: number;
  month: number;
  monthLabelBn: string;
  monthLabelEn: string;
  ctx: PrintRenderContext;
}) {
  const rows = buildTeacherMonthlyAttendance(teachers, staff, year, month);
  const code = generateVerificationCode('teacher-attendance', `${year}-${month}`);

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
        docTitleBn="শিক্ষক ও কর্মচারী মাসিক হাজিরা প্রতিবেদন"
        docTitleEn="Teacher & Staff Monthly Attendance Register"
        subtitle={`${monthLabelBn} ${toBanglaNumber(year)} (${monthLabelEn} ${year}) · মোট জনবল: ${toBanglaNumber(rows.length)} জন`}
        serialNo={`HR-${year}-${String(month).padStart(2, '0')}`}
        verificationCode={code}
      />

      <table className="w-full border-collapse border border-slate-300 text-[10.5px] tabular-nums">
        <thead>
          <tr className="bg-[#1B2A6B] text-white">
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-10">ক্রম</th>
            <th className="py-2 px-2 text-left border border-[#1B2A6B] w-24">এমপ্লয়ি আইডি</th>
            <th className="py-2 px-2.5 text-left border border-[#1B2A6B]">নাম ও পদবি</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">কার্যদিবস</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">সাপ্তাহিক ছুটি</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">উপস্থিত</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">অনুপস্থিত</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-14">ছুটি</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-14">বিলম্ব</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-20">বেতনযোগ্য দিন</th>
            <th className="py-2 px-2 text-center border border-[#1B2A6B] w-16">হার %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
              <td className="py-1.5 px-2 text-center border border-slate-200 text-slate-500">
                {idx + 1}
              </td>
              <td className="py-1.5 px-2 border border-slate-200 font-medium text-[#1B2A6B]">
                {r.employeeId}
              </td>
              <td className="py-1.5 px-2.5 border border-slate-200">
                <p className="font-semibold text-slate-900">{r.nameBn}</p>
                <p className="text-[9.5px] text-slate-500">{r.designationBn}</p>
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200">{r.workingDays}</td>
              <td className="py-1.5 px-2 text-center border border-slate-200 text-slate-500">
                {r.dayOff}
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200 font-semibold text-[#1F7A4D]">
                {r.present}
              </td>
              <td
                className={`py-1.5 px-2 text-center border border-slate-200 ${
                  r.absent > 0 ? 'text-red-700 font-semibold' : 'text-slate-400'
                }`}
              >
                {r.absent}
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200">{r.leave}</td>
              <td className="py-1.5 px-2 text-center border border-slate-200 text-amber-800">
                {r.late}
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                {r.payableDays}
              </td>
              <td className="py-1.5 px-2 text-center border border-slate-200 font-semibold">
                {r.presentPercent}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'অফিস সহকারী / হিসাব', labelEn: 'Accounts & Office' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
          { labelBn: 'সভাপতি (পরিচালনা পর্ষদ)', labelEn: 'President, Managing Committee' },
        ]}
        dataSourceNote="HR Monthly Payroll & Attendance Summary (Preview Schedule)"
      />
    </PaperSheet>
  );
}

// ---------------------------------------------------------------------------
// 6. OFFICIAL STUDENT FEE RECEIPT / MONEY VOUCHER
// ---------------------------------------------------------------------------

export function FeeReceiptDocument({
  students,
  fees,
  ctx,
}: {
  students: Student[];
  fees: FeeRecord[];
  ctx: PrintRenderContext;
}) {
  return (
    <>
      {students.map((student, idx) => {
        const fee = fees.find((f) => f.studentId === student.studentId);
        const invoiceNo = fee?.invoiceNo || `INV-2026-${student.roll.toString().padStart(3, '0')}`;
        const totalAmount = fee?.totalAmount ?? 1250;
        const paidAmount = fee?.paidAmount ?? 1250;
        const dueAmount = fee?.dueAmount ?? 0;
        const status = fee?.status ?? 'Paid';
        const code = generateVerificationCode('fee-receipt', `${student.studentId}-${invoiceNo}`);

        const lineItems = fee
          ? [
              { head: `মাসিক বেতন ও টিউশন ফি (${fee.monthOrTerm})`, amount: fee.tuitionFee },
              { head: 'পরীক্ষা ফি (Examination Fee)', amount: fee.examFee },
              { head: 'আইসিটি ল্যাব, গ্রন্থাগার ও সহশিক্ষা ফি', amount: fee.labAndActivityFee },
            ].filter((item) => item.amount > 0)
          : [
              { head: 'মাসিক বেতন (Tuition Fee)', amount: 550 },
              { head: 'পরীক্ষা ও একাডেমিক ফি (Exam & Session)', amount: 500 },
              { head: 'গ্রন্থাগার ও আইসিটি ল্যাব ফি', amount: 200 },
            ];

        return (
          <PaperSheet
            key={`fee-rec-${student.id}`}
            orientation={ctx.settings.orientation}
            marginMm={ctx.settings.marginMm}
            pageNumber={idx + 1}
            totalPages={students.length}
          >
            <InstitutionalLetterhead
              ctx={ctx}
              docTitleBn="বেতন ও ফি পরিশোধের অফিসিয়াল রসিদ"
              docTitleEn="Official Fee Payment Receipt / Voucher"
              subtitle={`চালান নং: ${invoiceNo}`}
              serialNo={invoiceNo}
              verificationCode={code}
            />

            {/* Student & Payment Metadata */}
            <div className="mb-5 grid grid-cols-12 gap-4 border border-slate-200 bg-[#F7F8FC] rounded p-4 text-[11px]">
              <div className="col-span-8 flex items-start gap-3">
                {ctx.settings.showStudentPhotos && <StudentAvatarBox student={student} size="sm" />}
                <div className="flex-1 grid grid-cols-2 gap-x-5 gap-y-2">
                  <div className="col-span-2">
                    <p className="text-[9.5px] text-slate-500">শিক্ষার্থীর নাম</p>
                    <p className="text-[13.5px] font-semibold text-[#1B2A6B]">
                      {student.nameBn} <span className="font-normal text-slate-600">({student.name})</span>
                    </p>
                  </div>
                <div className="tabular-nums">
                  <p className="text-[9.5px] text-slate-500">শিক্ষার্থী আইডি ও রোল</p>
                  <p className="font-semibold text-slate-800">
                    {student.studentId} · রোল {toBanglaNumber(student.roll)}
                  </p>
                </div>
                <div>
                  <p className="text-[9.5px] text-slate-500">শ্রেণি ও শাখা</p>
                  <p className="font-medium text-slate-800">
                    {student.className} · শাখা {student.section}
                  </p>
                </div>
                <div>
                  <p className="text-[9.5px] text-slate-500">অভিভাবকের নাম</p>
                  <p className="font-medium text-slate-800">{student.guardianName}</p>
                </div>
                <div className="tabular-nums">
                  <p className="text-[9.5px] text-slate-500">অভিভাবক মোবাইল</p>
                  <p className="font-medium text-slate-800">{student.guardianPhone}</p>
                </div>
                </div>
              </div>

              <div className="col-span-4 border-l border-slate-200 pl-4 space-y-1.5 tabular-nums">
                <div>
                  <p className="text-[9.5px] text-slate-500">রসিদ / চালান নম্বর</p>
                  <p className="font-semibold text-[#1B2A6B]">{invoiceNo}</p>
                </div>
                <div>
                  <p className="text-[9.5px] text-slate-500">পরিশোধের তারিখ</p>
                  <p className="font-medium text-slate-800">
                    {fee?.paidDate ? formatDateReadable(fee.paidDate) : ctx.issueDate}
                  </p>
                </div>
                <div>
                  <p className="text-[9.5px] text-slate-500">পরিশোধ মাধ্যম</p>
                  <p className="font-medium text-slate-800">{fee?.method || 'Office Counter (Cash)'}</p>
                </div>
                <div>
                  <p className="text-[9.5px] text-slate-500">অবস্থা</p>
                  <p
                    className={`font-semibold ${
                      status === 'Paid'
                        ? 'text-[#1F7A4D]'
                        : status === 'Partial'
                          ? 'text-amber-700'
                          : 'text-red-700'
                    }`}
                  >
                    {status === 'Paid' ? 'পরিশোধিত (PAID)' : status === 'Partial' ? 'আংশিক পরিশোধিত' : 'বকেয়া'}
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Breakdown Table */}
            <table className="w-full border-collapse border border-slate-300 text-[11.5px] tabular-nums">
              <thead>
                <tr className="bg-[#1B2A6B] text-white">
                  <th className="py-2.5 px-3 text-center border border-[#1B2A6B] w-14">ক্রম</th>
                  <th className="py-2.5 px-3 text-left border border-[#1B2A6B]">
                    ফি খাতের বিবরণ · Fee Head Description
                  </th>
                  <th className="py-2.5 px-3 text-right border border-[#1B2A6B] w-36">টাকার পরিমাণ (BDT)</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={item.head} className={i % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
                    <td className="py-2.5 px-3 text-center border border-slate-200 text-slate-500">
                      {toBanglaNumber(i + 1)}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-200 font-medium text-slate-900">
                      {item.head}
                    </td>
                    <td className="py-2.5 px-3 text-right border border-slate-200 font-medium text-slate-800">
                      {formatCurrencyBdt(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F7F8FC] font-semibold text-slate-800">
                  <td colSpan={2} className="py-2 px-3 text-right border border-slate-300">
                    মোট প্রদেয় (Total Payable)
                  </td>
                  <td className="py-2 px-3 text-right border border-slate-300">
                    {formatCurrencyBdt(totalAmount)}
                  </td>
                </tr>
                <tr className="bg-white font-semibold text-[#1F7A4D]">
                  <td colSpan={2} className="py-2 px-3 text-right border border-slate-300">
                    জমাকৃত অর্থ (Amount Received)
                  </td>
                  <td className="py-2 px-3 text-right border border-slate-300">
                    {formatCurrencyBdt(paidAmount)}
                  </td>
                </tr>
                <tr className="bg-[#F7F8FC] font-semibold text-[#1B2A6B]">
                  <td colSpan={2} className="py-2 px-3 text-right border border-slate-300">
                    অবশিষ্ট বকেয়া (Balance Due)
                  </td>
                  <td
                    className={`py-2 px-3 text-right border border-slate-300 ${
                      dueAmount > 0 ? 'text-red-700' : 'text-[#1F7A4D]'
                    }`}
                  >
                    {formatCurrencyBdt(dueAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-5 flex items-center justify-between gap-4 border border-slate-200 rounded p-3 text-[10.5px] text-slate-600">
              <p>
                এই রসিদটি বিদ্যালয়ের হিসাব শাখা কর্তৃক প্রদত্ত। ভবিষ্যৎ প্রয়োজনে রসিদটি যত্নসহকারে সংরক্ষণ করুন।
              </p>
              {ctx.settings.showQrVerification && <VerificationQrSvg code={code} size={42} compact />}
            </div>

            <SignatureBar
              ctx={ctx}
              slots={[
                { labelBn: 'জমাদানকারীর স্বাক্ষর', labelEn: 'Depositor Signature' },
                { labelBn: 'হিসাবরক্ষক / ক্যাশিয়ার', labelEn: 'Accountant / Cashier' },
                { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
              ]}
              dataSourceNote={fee ? `Verified Fee Invoice #${fee.invoiceNo}` : 'Standard Fee Voucher Preview'}
            />
          </PaperSheet>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// 7. CLASS MONTHLY FEE DUE LIST (LANDSCAPE JAN-DEC MATRIX)
// ---------------------------------------------------------------------------

export function FeeDueListDocument({
  students,
  fees,
  classLabel,
  sectionLabel,
  ctx,
}: {
  students: Student[];
  fees: FeeRecord[];
  classLabel: string;
  sectionLabel: string;
  ctx: PrintRenderContext;
}) {
  const rows = buildFeeDueMatrix(students, fees);
  const monthTotals = SHORT_MONTHS.map((_, mIdx) =>
    rows.reduce((sum, r) => sum + r.monthlyDues[mIdx], 0)
  );
  const grandTotalDue = rows.reduce((s, r) => s + r.totalDue, 0);
  const code = generateVerificationCode('fee-due-list', `${classLabel}-${sectionLabel}`);

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
        docTitleBn="মাসিক বকেয়া বেতন ও ফি তালিকা"
        docTitleEn="Class Monthly Fee Due Register (Jan–Dec)"
        subtitle={`${classLabel} · শাখা: ${sectionLabel} · মোট বকেয়া: ${formatCurrencyBdt(grandTotalDue)}`}
        serialNo="DUE-2026"
        verificationCode={code}
      />

      <table className="w-full border-collapse border border-slate-300 text-[9.5px] tabular-nums">
        <thead>
          <tr className="bg-[#1B2A6B] text-white">
            <th className="py-1.5 px-1.5 text-center border border-[#1B2A6B] w-9">রোল</th>
            <th className="py-1.5 px-2 text-left border border-[#1B2A6B] min-w-[125px]">
              শিক্ষার্থী ও আইডি
            </th>
            {ctx.settings.showGuardianPhone && (
              <th className="py-1.5 px-1.5 text-left border border-[#1B2A6B] w-24">মোবাইল</th>
            )}
            {SHORT_MONTHS.map((m) => (
              <th key={m} className="py-1.5 px-1 text-right border border-[#1B2A6B] w-12">
                {m}
              </th>
            ))}
            <th className="py-1.5 px-2 text-right border border-[#1B2A6B] w-20">মোট বকেয়া</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.student.id} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
              <td className="py-1.5 px-1.5 text-center border border-slate-200 font-semibold text-[#1B2A6B]">
                {row.student.roll}
              </td>
              <td className="py-1.5 px-2 border border-slate-200">
                <p className="font-medium text-slate-900 leading-tight">{row.student.nameBn}</p>
                <p className="text-[8.5px] text-slate-500">
                  {row.student.studentId} · {row.student.className} ({row.student.section})
                </p>
              </td>
              {ctx.settings.showGuardianPhone && (
                <td className="py-1.5 px-1.5 border border-slate-200 text-slate-600">
                  {row.student.guardianPhone}
                </td>
              )}
              {row.monthlyDues.map((amt, mIdx) => (
                <td
                  key={`${row.student.id}-m-${mIdx}`}
                  className={`py-1.5 px-1 text-right border border-slate-200 ${
                    amt > 0 ? 'text-red-700 font-medium' : 'text-slate-300'
                  }`}
                >
                  {amt > 0 ? amt : '—'}
                </td>
              ))}
              <td
                className={`py-1.5 px-2 text-right border border-slate-200 font-semibold ${
                  row.totalDue > 0 ? 'text-red-700' : 'text-[#1F7A4D]'
                }`}
              >
                {row.totalDue > 0 ? formatCurrencyBdt(row.totalDue) : 'পরিশোধিত'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[#F7F8FC] font-semibold text-[#1B2A6B]">
            <td
              colSpan={ctx.settings.showGuardianPhone ? 3 : 2}
              className="py-2 px-2 border border-slate-300 text-right"
            >
              মাসভিত্তিক সর্বমোট বকেয়া · Monthly Totals
            </td>
            {monthTotals.map((t, i) => (
              <td key={`mt-${i}`} className="py-2 px-1 text-right border border-slate-300">
                {t > 0 ? t : '—'}
              </td>
            ))}
            <td className="py-2 px-2 text-right border border-slate-300 text-red-700">
              {formatCurrencyBdt(grandTotalDue)}
            </td>
          </tr>
        </tfoot>
      </table>

      <SignatureBar
        ctx={ctx}
        slots={[
          { labelBn: 'হিসাবরক্ষক', labelEn: 'Accountant' },
          { labelBn: 'প্রধান শিক্ষক', labelEn: 'Head Teacher', subtext: ctx.headTeacherName },
        ]}
        dataSourceNote="Live Fee Ledger + Standard Monthly Schedule"
      />
    </PaperSheet>
  );
}
