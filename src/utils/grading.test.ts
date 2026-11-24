import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSubjectMark,
  computeOverallResult,
  filterPublishedResults,
  checkRfidDuplicateScan,
  parseTimeToMinutes,
} from './grading';
import {
  admissionSchema,
  clubInterestSchema,
  communityPostSchema,
  loginSchema,
} from '../validations/schemas';
import type { AttendanceRecord, StudentResult } from '../types';

test('evaluateSubjectMark follows Bangladesh 5.00 GPA scale', () => {
  assert.deepEqual(evaluateSubjectMark(85), { grade: 'A+', gradePoint: 5.0, passed: true });
  assert.deepEqual(evaluateSubjectMark(72), { grade: 'A', gradePoint: 4.0, passed: true });
  assert.deepEqual(evaluateSubjectMark(63), { grade: 'A-', gradePoint: 3.5, passed: true });
  assert.deepEqual(evaluateSubjectMark(55), { grade: 'B', gradePoint: 3.0, passed: true });
  assert.deepEqual(evaluateSubjectMark(42), { grade: 'C', gradePoint: 2.0, passed: true });
  assert.deepEqual(evaluateSubjectMark(33), { grade: 'D', gradePoint: 1.0, passed: true });
  assert.deepEqual(evaluateSubjectMark(32), { grade: 'F', gradePoint: 0.0, passed: false });
});

test('computeOverallResult returns 0.0 GPA and F if any subject fails', () => {
  const passedRes = computeOverallResult([
    { subjectCode: '101', subjectName: 'Bangla', obtainedMarks: 82 },
    { subjectCode: '107', subjectName: 'English', obtainedMarks: 74 },
  ]);
  assert.equal(passedRes.passed, true);
  assert.equal(passedRes.gpa, 4.5);
  assert.equal(passedRes.overallGrade, 'A');

  const failedRes = computeOverallResult([
    { subjectCode: '101', subjectName: 'Bangla', obtainedMarks: 90 },
    { subjectCode: '109', subjectName: 'Math', obtainedMarks: 28 },
  ]);
  assert.equal(failedRes.passed, false);
  assert.equal(failedRes.gpa, 0.0);
  assert.equal(failedRes.overallGrade, 'F');
});

test('filterPublishedResults hides Draft and Verified results from public lookup', () => {
  const sample: StudentResult[] = [
    {
      id: 'r1',
      examId: 'ex1',
      examName: 'Annual Exam',
      academicYear: '2026',
      studentId: 'BUTPHS-2026-101',
      studentName: 'Student 1',
      studentNameBn: 'শিক্ষার্থী ১',
      className: 'Class 10',
      section: 'A',
      roll: 1,
      marks: [],
      totalMarks: 450,
      gpa: 5.0,
      overallGrade: 'A+',
      passed: true,
      status: 'Published',
      updatedBy: 'Admin',
      updatedAt: '2026-11-01',
    },
    {
      id: 'r2',
      examId: 'ex1',
      examName: 'Annual Exam',
      academicYear: '2026',
      studentId: 'BUTPHS-2026-102',
      studentName: 'Student 2',
      studentNameBn: 'শিক্ষার্থী ২',
      className: 'Class 10',
      section: 'A',
      roll: 2,
      marks: [],
      totalMarks: 410,
      gpa: 4.5,
      overallGrade: 'A',
      passed: true,
      status: 'Draft',
      updatedBy: 'Teacher',
      updatedAt: '2026-11-01',
    },
  ];

  const publicAll = filterPublishedResults(sample, {});
  assert.equal(publicAll.length, 1);
  assert.equal(publicAll[0].studentId, 'BUTPHS-2026-101');

  const draftQuery = filterPublishedResults(sample, { studentId: 'BUTPHS-2026-102' });
  assert.equal(draftQuery.length, 0);
});

test('checkRfidDuplicateScan prevents duplicate ENTRY and enforces cooldown', () => {
  const records: AttendanceRecord[] = [
    {
      id: 'att-1',
      studentId: 'BUTPHS-2026-101',
      studentName: 'Student 1',
      className: 'Class 10',
      section: 'A',
      date: '2026-11-20',
      entryTime: '09:50 AM',
      status: 'Present',
      source: 'RFID',
      cardUid: 'RFID-1001',
    },
  ];

  const dupEntry = checkRfidDuplicateScan(records, 'BUTPHS-2026-101', '2026-11-20', 'ENTRY', 595);
  assert.equal(dupEntry.allowed, false);

  const earlyExit = checkRfidDuplicateScan(records, 'BUTPHS-2026-101', '2026-11-20', 'EXIT', 592);
  assert.equal(earlyExit.allowed, false);

  const validExit = checkRfidDuplicateScan(records, 'BUTPHS-2026-101', '2026-11-20', 'EXIT', 960);
  assert.equal(validExit.allowed, true);

  const exitWithoutEntry = checkRfidDuplicateScan(records, 'BUTPHS-2026-999', '2026-11-20', 'EXIT', 960);
  assert.equal(exitWithoutEntry.allowed, false);
});

test('parseTimeToMinutes parses 12-hour and 24-hour times accurately', () => {
  assert.equal(parseTimeToMinutes('09:50 AM'), 590);
  assert.equal(parseTimeToMinutes('04:15 PM'), 975);
  assert.equal(parseTimeToMinutes('12:00 PM'), 720);
});

test('Zod validation enforces 4-step online admission, login, club, and community rules', () => {
  const badLogin = loginSchema.safeParse({ email: 'not-an-email', password: '123', role: 'admin' });
  assert.equal(badLogin.success, false);

  const validAdmissionPayload = {
    applicantNameBn: 'রাফিউল ইসলাম',
    applicantName: 'Rafiul Islam',
    dateOfBirth: '01/15/2014',
    birthCertificateNo: '20148614500012345',
    gender: 'Male' as const,
    religion: 'ইসলাম',
    fatherNameBn: 'মোঃ কামাল উদ্দিন',
    fatherNameEn: 'Md. Kamal Uddin',
    fatherOccupation: 'ব্যবসা',
    fatherNid: '1980861450001',
    motherNameBn: 'সালমা বেগম',
    motherNameEn: 'Salma Begum',
    motherOccupation: 'গৃহিণী',
    motherNid: '1985861450002',
    guardianPhone: '01715223344',
    address: 'উপসী, উপসী, নড়িয়া, শরীয়তপুর',
    permanentAddress: 'উপসী, উপসী, নড়িয়া, শরীয়তপুর',
    previousSchool: 'উপসী সরকারি প্রাথমিক বিদ্যালয়',
    previousClassGrade: '৫ম শ্রেণি, A+',
    passingYear: '2025',
    previousRollGpa: 'রোল ০৫ / A+',
    applyingClass: 'Class 6',
    program: 'General' as const,
    admissionType: 'নতুন ভর্তি' as const,
    undertakingAccepted: true as const,
  };

  assert.equal(admissionSchema.safeParse(validAdmissionPayload).success, true);

  // Rejects 16-digit birth certificate
  assert.equal(
    admissionSchema.safeParse({ ...validAdmissionPayload, birthCertificateNo: '2014861450001234' }).success,
    false
  );

  // Rejects unchecked undertaking
  assert.equal(
    admissionSchema.safeParse({ ...validAdmissionPayload, undertakingAccepted: false }).success,
    false
  );

  // Club & Community validation
  assert.equal(
    clubInterestSchema.safeParse({
      studentName: 'রাফিউল ইসলাম',
      studentClass: 'Class 8',
      rollNo: '12',
      guardianPhone: '01712345678',
    }).success,
    true
  );
  assert.equal(
    clubInterestSchema.safeParse({
      studentName: 'A',
      studentClass: 'Class 8',
      rollNo: '',
      guardianPhone: '12345',
    }).success,
    false
  );
  assert.equal(
    communityPostSchema.safeParse({
      author: 'মোঃ জহিরুল ইসলাম',
      topic: 'ভর্তি পরীক্ষার সিলেবাস',
      body: '৬ষ্ঠ শ্রেণির ভর্তি পরীক্ষার সিলেবাস কোথা থেকে ডাউনলোড করা যাবে?',
    }).success,
    true
  );
});
