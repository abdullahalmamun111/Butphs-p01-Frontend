import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getWeeklyRoutineMatrix,
  SMART_SYLLABUS_CATALOG,
  filterSyllabusItems,
  LIBRARY_BOOKS,
  filterLibraryBooks,
} from './academicCatalog';
import { computeMeritPositions, toBanglaOrdinal } from '../utils/grading';
import type { StudentResult } from '../types';

test('getWeeklyRoutineMatrix returns full 5-day timetable with 4 before-break and 2 after-break periods', () => {
  const matrix = getWeeklyRoutineMatrix('Class 9', 'A (পদ্মা)');
  assert.equal(matrix.length, 5);
  assert.equal(matrix[0].dayBn, 'রবিবার');
  assert.equal(matrix[4].dayBn, 'বৃহস্পতিবার');
  for (const row of matrix) {
    assert.equal(row.beforeBreak.length, 4);
    assert.equal(row.afterBreak.length, 2);
    for (const cell of [...row.beforeBreak, ...row.afterBreak]) {
      assert.ok(cell.subjectBn.length > 0);
      assert.ok(cell.teacherBn.length > 0);
      assert.ok(cell.roomBn.length > 0);
    }
  }

  // Section C (যমুনা) includes business & ICT lab subjects
  const secCMatrix = getWeeklyRoutineMatrix('Class 10', 'C (যমুনা)');
  const allSecCSubjects = secCMatrix.flatMap((r) => [...r.beforeBreak, ...r.afterBreak].map((c) => c.subjectBn));
  assert.ok(allSecCSubjects.some((s) => s.includes('হিসাববিজ্ঞান') || s.includes('তথ্য ও যোগাযোগ প্রযুক্তি')));
});

test('filterSyllabusItems filters accurately by class, group, and examTerm', () => {
  const c10Science = filterSyllabusItems(SMART_SYLLABUS_CATALOG, {
    className: 'Class 10',
    group: 'বিজ্ঞান',
    examTerm: 'নির্বাচনি (এসএসসি)',
  });
  assert.ok(c10Science.length >= 2);
  assert.ok(c10Science.every((item) => item.className === 'Class 10' && item.examTerm === 'নির্বাচনি (এসএসসি)'));
  assert.ok(c10Science.some((item) => item.group === 'বিজ্ঞান'));

  const c6Half = filterSyllabusItems(SMART_SYLLABUS_CATALOG, {
    className: 'Class 6',
    group: 'সকল বিভাগ',
    examTerm: 'অর্ধবার্ষিক পরীক্ষা',
  });
  assert.ok(c6Half.length >= 2);
  assert.ok(c6Half.every((item) => item.className === 'Class 6'));
});

test('filterLibraryBooks filters by category, writer/title query, and availability', () => {
  const byWriter = filterLibraryBooks(LIBRARY_BOOKS, {
    category: 'সকল বই',
    query: 'রবীন্দ্রনাথ',
  });
  assert.equal(byWriter.length, 1);
  assert.equal(byWriter[0].authorBn, 'রবীন্দ্রনাথ ঠাকুর');

  const sciAll = filterLibraryBooks(LIBRARY_BOOKS, { category: 'বিজ্ঞান ও গণিত' });
  const sciAvailable = filterLibraryBooks(LIBRARY_BOOKS, {
    category: 'বিজ্ঞান ও গণিত',
    availableOnly: true,
  });
  assert.ok(sciAll.length > sciAvailable.length);
  assert.ok(sciAvailable.every((b) => b.availableCopies > 0));
});

test('computeMeritPositions ranks students per class/exam and formats Bangla ordinals', () => {
  assert.equal(toBanglaOrdinal(1), '১ম স্থান');
  assert.equal(toBanglaOrdinal(2), '২য় স্থান');
  assert.equal(toBanglaOrdinal(3), '৩য় স্থান');
  assert.equal(toBanglaOrdinal(4), '৪র্থ স্থান');

  const mk = (id: string, roll: number, gpa: number, totalMarks: number, passed = true): StudentResult => ({
    id,
    examId: 'ex-1',
    examName: 'Test Exam',
    academicYear: '2026',
    studentId: `BUTPHS-${roll}`,
    studentName: `Student ${roll}`,
    studentNameBn: `শিক্ষার্থী ${roll}`,
    className: 'Class 10',
    section: 'A',
    roll,
    marks: [],
    totalMarks,
    gpa,
    overallGrade: passed ? 'A+' : 'F',
    passed,
    status: 'Published',
    updatedBy: 'Admin',
    updatedAt: '2026-11-12',
  });

  const positions = computeMeritPositions([
    mk('r1', 2, 4.8, 430, true),
    mk('r2', 1, 5.0, 465, true),
    mk('r3', 3, 5.0, 452, true),
    mk('r4', 4, 0.0, 210, false),
  ]);

  assert.equal(positions.get('r2')?.rank, 1);
  assert.equal(positions.get('r2')?.rankBn, '১ম স্থান');
  assert.equal(positions.get('r3')?.rank, 2);
  assert.equal(positions.get('r3')?.rankBn, '২য় স্থান');
  assert.equal(positions.get('r1')?.rank, 3);
  assert.equal(positions.get('r1')?.rankBn, '৩য় স্থান');
  assert.equal(positions.get('r4')?.rank, null);
  assert.equal(positions.get('r4')?.rankBn, 'উত্তীর্ণ নয়');
});
