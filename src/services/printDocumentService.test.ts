import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRINT_DOCUMENT_CATALOG,
  allocateExamSeats,
  buildAttendanceSummaryByClass,
  buildDeterministicQrMatrix,
  buildFeeDueMatrix,
  buildMeritListRows,
  buildMonthlyAttendanceMatrix,
  buildResultSummaryRows,
  buildSubjectAnalysisReport,
  computeClassHighestMarks,
  filterStudentsForPrint,
  generateVerificationCode,
  validatePrintRequest,
  type PrintFilterState,
} from './printDocumentService';
import {
  INITIAL_ATTENDANCE,
  INITIAL_FEES,
  INITIAL_RESULTS,
  INITIAL_STUDENTS,
} from '../lib/mockData';

test('PRINT_DOCUMENT_CATALOG exposes all 23 core document types across 4 categories', () => {
  assert.equal(PRINT_DOCUMENT_CATALOG.length, 23);
  const ids = new Set(PRINT_DOCUMENT_CATALOG.map((d) => d.id));
  assert.equal(ids.size, 23);
  assert.ok(ids.has('student-id-card'));
  assert.ok(ids.has('academic-transcript'));
  assert.ok(ids.has('admit-card'));
  assert.ok(ids.has('exam-seat-card'));
  assert.ok(ids.has('exam-seat-plan'));
  assert.ok(ids.has('individual-result'));
  assert.ok(ids.has('monthly-attendance'));
  assert.ok(ids.has('merit-list'));
  assert.ok(ids.has('fee-receipt'));
  assert.ok(ids.has('fee-due-list'));
  assert.ok(ids.has('teacher-attendance'));
});

test('filterStudentsForPrint filters accurately by class, section, and search query', () => {
  const class10 = filterStudentsForPrint(INITIAL_STUDENTS, {
    session: '2026',
    className: 'Class 10',
    section: 'All',
    searchQuery: '',
  });
  assert.ok(class10.length >= 2);
  assert.ok(class10.every((s) => s.className === 'Class 10'));

  const byId = filterStudentsForPrint(INITIAL_STUDENTS, {
    session: 'All',
    className: 'All',
    section: 'All',
    searchQuery: 'BUTPHS-2026-101',
  });
  assert.equal(byId.length, 1);
  assert.equal(byId[0].studentId, 'BUTPHS-2026-101');
});

test('buildMonthlyAttendanceMatrix excludes Fri/Sat holidays and computes accurate attendance stats', () => {
  const class10 = INITIAL_STUDENTS.filter((s) => s.className === 'Class 10');
  const matrix = buildMonthlyAttendanceMatrix(class10, INITIAL_ATTENDANCE, 2026, 11, {
    fillDemoWorkingDays: true,
  });

  assert.equal(matrix.daysInMonth, 30);
  // November 2026 has 4 Fridays (6,13,20,27) and 4 Saturdays (7,14,21,28) => 22 working days
  assert.equal(matrix.workingDaysCount, 22);
  assert.equal(matrix.rows.length, class10.length);

  for (const row of matrix.rows) {
    assert.equal(row.workingDays, 22);
    assert.equal(row.presentDays + row.absentDays, row.workingDays);
    assert.ok(row.attendancePercent >= 0 && row.attendancePercent <= 100);
  }

  // Verify live attendance record for 2026-11-19 is preserved accurately
  const ashraful = matrix.rows.find((r) => r.student.studentId === 'BUTPHS-2026-101');
  assert.ok(ashraful);
  const nov19 = ashraful!.days.find((d) => d.day === 19);
  assert.equal(nov19?.code, 'P');
  assert.equal(nov19?.isLive, true);
});

test('allocateExamSeats prevents duplicate students and enforces room capacity', () => {
  const dupInput = [
    INITIAL_STUDENTS[0],
    INITIAL_STUDENTS[1],
    INITIAL_STUDENTS[0], // duplicate
    INITIAL_STUDENTS[2],
    INITIAL_STUDENTS[3],
  ];
  const alloc = allocateExamSeats(dupInput, {
    roomName: 'Room 201',
    capacity: 3,
    columns: 2,
    seatsPerBench: 2,
    strategy: 'alternating',
  });

  assert.equal(alloc.duplicateIdsRemoved.length, 1);
  assert.equal(alloc.assignments.length, 3);
  assert.equal(alloc.unassignedStudents.length, 1);
  assert.equal(alloc.capacityExceeded, true);

  const assignedIds = new Set(alloc.assignments.map((a) => a.student.studentId));
  assert.equal(assignedIds.size, 3);
});

test('computeClassHighestMarks, buildMeritListRows, buildResultSummaryRows, and buildSubjectAnalysisReport compute exact academic stats', () => {
  const pretestResults = INITIAL_RESULTS.filter((r) => r.examId === 'ex-2026-pretest');
  const highest = computeClassHighestMarks(pretestResults);
  assert.equal(highest['109'], 94); // Mathematics highest in pretest

  const merit = buildMeritListRows(pretestResults);
  assert.ok(merit.length > 0);
  assert.equal(merit[0].meritRank, 1);
  assert.equal(merit[0].studentId, 'BUTPHS-2026-101');

  const summary = buildResultSummaryRows(INITIAL_STUDENTS, INITIAL_RESULTS, 'ex-2026-pretest');
  const class10Row = summary.find((r) => r.className === 'Class 10');
  assert.ok(class10Row);
  assert.ok(class10Row!.appeared >= 2);
  assert.equal(class10Row!.passed + class10Row!.failed, class10Row!.appeared);

  const mathAnalysis = buildSubjectAnalysisReport(pretestResults, 'Mathematics');
  assert.equal(mathAnalysis.highest, 94);
  assert.ok(mathAnalysis.passRate > 0);
});

test('buildAttendanceSummaryByClass and buildFeeDueMatrix produce structured rows', () => {
  const attSummary = buildAttendanceSummaryByClass(INITIAL_STUDENTS, INITIAL_ATTENDANCE, 2026, 11);
  assert.ok(attSummary.length >= 4);

  const feeMatrix = buildFeeDueMatrix(INITIAL_STUDENTS, INITIAL_FEES);
  assert.equal(feeMatrix.length, INITIAL_STUDENTS.length);
  assert.equal(feeMatrix[0].monthlyDues.length, 12);
});

test('validatePrintRequest flags empty selection and capacity overflow, and QR code matrix is deterministic', () => {
  const baseFilters: PrintFilterState = {
    session: '2026',
    className: 'All',
    section: 'All',
    examId: 'ex-2026-pretest',
    subjectName: 'Mathematics (গণিত)',
    month: 11,
    year: 2026,
    date: '2026-11-19',
    attendanceStatus: 'All',
    searchQuery: '',
    seatRoomName: 'Room 101',
    seatRoomCapacity: 2,
    seatColumns: 2,
    seatsPerBench: 2,
    seatStrategy: 'sequential',
  };

  const emptyIssues = validatePrintRequest('student-id-card', baseFilters, [], []);
  assert.equal(emptyIssues.some((i) => i.level === 'error'), true);

  const code1 = generateVerificationCode('academic-transcript', 'BUTPHS-2026-101', '2026');
  const code2 = generateVerificationCode('academic-transcript', 'BUTPHS-2026-101', '2026');
  assert.equal(code1, code2);
  assert.ok(code1.startsWith('BUTPHS-STU-26-'));

  const qr = buildDeterministicQrMatrix(code1);
  assert.equal(qr.length, 15);
  assert.equal(qr[0].length, 15);
  assert.equal(qr[0][0], true);
});
