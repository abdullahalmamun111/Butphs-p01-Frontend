import type {
  AttendanceRecord,
  Exam,
  FeeRecord,
  StaffMember,
  Student,
  StudentResult,
  Teacher,
} from '../types';
import { computeMeritPositions, evaluateSubjectMark } from '../utils/grading';
import type { PrintOrientation, PrintPaperSize } from '../utils/printDocument';

export type PrintDocumentCategory = 'student' | 'examination' | 'attendance' | 'financial';

export type PrintDocumentTypeId =
  | 'student-id-card'
  | 'student-profile'
  | 'academic-transcript'
  | 'testimonial'
  | 'transfer-certificate'
  | 'student-list'
  | 'admit-card'
  | 'exam-seat-card'
  | 'exam-seat-plan'
  | 'individual-result'
  | 'progress-report'
  | 'class-result'
  | 'tabulation-sheet'
  | 'merit-list'
  | 'result-summary'
  | 'subject-result'
  | 'monthly-attendance'
  | 'daily-attendance'
  | 'student-attendance'
  | 'attendance-summary'
  | 'teacher-attendance'
  | 'fee-receipt'
  | 'fee-due-list';

export interface PrintDocumentMeta {
  id: PrintDocumentTypeId;
  category: PrintDocumentCategory;
  titleEn: string;
  titleBn: string;
  shortDescBn: string;
  defaultOrientation: PrintOrientation;
  defaultPaperSize: PrintPaperSize;
  supportsBulkStudents: boolean;
  needsStudentSelection: boolean;
  needsExam: boolean;
  needsSubject: boolean;
  needsMonthYear: boolean;
  needsDate: boolean;
  needsAttendanceStatus: boolean;
  needsRoomConfig: boolean;
  isTeacherDoc?: boolean;
}

export const PRINT_CATEGORIES: Array<{
  id: PrintDocumentCategory;
  labelEn: string;
  labelBn: string;
}> = [
  { id: 'student', labelEn: 'Student Documents', labelBn: 'শিক্ষার্থী ডকুমেন্ট' },
  { id: 'examination', labelEn: 'Examination & Results', labelBn: 'পরীক্ষা ও ফলাফল' },
  { id: 'attendance', labelEn: 'Attendance Reports', labelBn: 'উপস্থিতি প্রতিবেদন' },
  { id: 'financial', labelEn: 'Fees & Office Records', labelBn: 'বেতন-ফি ও অফিস' },
];

export const PRINT_DOCUMENT_CATALOG: PrintDocumentMeta[] = [
  // STUDENT DOCUMENTS
  {
    id: 'student-id-card',
    category: 'student',
    titleEn: 'Student ID Card',
    titleBn: 'শিক্ষার্থী পরিচয়পত্র',
    shortDescBn: 'CR80 ফরম্যাট পরিচয়পত্র (একক বা শ্রেণি/শাখাভিত্তিক বাল্ক ৪/৮-আপ শিট)',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'student-profile',
    category: 'student',
    titleEn: 'Student Information Sheet',
    titleBn: 'শিক্ষার্থী প্রোফাইল ও তথ্যপত্র',
    shortDescBn: 'ব্যক্তিগত, অভিভাবক, ঠিকানা, RFID ও একাডেমিক পূর্ণাঙ্গ ডসিয়ার',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'academic-transcript',
    category: 'student',
    titleEn: 'Academic Transcript',
    titleBn: 'একাডেমিক ট্রান্সক্রিপ্ট',
    shortDescBn: 'বোর্ড মানের আনুষ্ঠানিক ট্রান্সক্রিপ্ট, গ্রেড স্কেল ও ঐচ্ছিক বিষয়সহ জিপিএ',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'testimonial',
    category: 'student',
    titleEn: 'Character Testimonial',
    titleBn: 'প্রশংসাপত্র (Testimonial)',
    shortDescBn: 'ফলাফল, রোল, জন্ম তারিখ ও চারিত্রিক সনদসহ আনুষ্ঠানিক প্রশংসাপত্র',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'transfer-certificate',
    category: 'student',
    titleEn: 'Transfer Certificate (TC)',
    titleBn: 'ছাড়পত্র / ট্রান্সফার সার্টিফিকেট',
    shortDescBn: 'ভর্তি রেজিস্টার অনুযায়ী জন্ম তারিখ ও বকেয়া পরিশোধের প্রত্যয়নসহ টিসি',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'student-list',
    category: 'student',
    titleEn: 'Class & Section Student List',
    titleBn: 'শ্রেণি ও শাখাভিত্তিক শিক্ষার্থী তালিকা',
    shortDescBn: 'রোল, আইডি, অভিভাবকের মোবাইল, রক্তের গ্রুপ ও RFID সহ রেজিস্টার',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },

  // EXAMINATION DOCUMENTS
  {
    id: 'admit-card',
    category: 'examination',
    titleEn: 'Examination Admit Card',
    titleBn: 'পরীক্ষার প্রবেশপত্র',
    shortDescBn: 'প্রতি A4 পৃষ্ঠায় ২টি করে প্রবেশপত্র, বিষয়ের তালিকা ও নির্দেশাবলি',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'exam-seat-card',
    category: 'examination',
    titleEn: 'Examination Seat Card',
    titleBn: 'পরীক্ষার আসন কার্ড (ডেস্ক স্লিপ)',
    shortDescBn: 'প্রতি A4 পৃষ্ঠায় ৮টি কাট-আউট সিট কার্ড (কক্ষ ও আসন নম্বরসহ)',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: true,
  },
  {
    id: 'exam-seat-plan',
    category: 'examination',
    titleEn: 'Examination Room Seat Plan',
    titleBn: 'পরীক্ষার কক্ষ আসন বিন্যাস',
    shortDescBn: 'ভিজ্যুয়াল কক্ষ ও বেঞ্চ-গ্রিড আসন বিন্যাস (ডুপ্লিকেট প্রতিরোধ ও ক্যাপাসিটি যাচাই)',
    defaultOrientation: 'landscape',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: true,
    needsAttendanceStatus: false,
    needsRoomConfig: true,
  },
  {
    id: 'individual-result',
    category: 'examination',
    titleEn: 'Individual Result Sheet',
    titleBn: 'ব্যক্তিগত নম্বরপত্র (Marks Sheet)',
    shortDescBn: 'বিষয়ভিত্তিক নম্বর, সর্বোচ্চ নম্বর, গ্রেড, জিপিএ, মেধাক্রম ও উপস্থিতিসহ মার্কশিট',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'progress-report',
    category: 'examination',
    titleEn: 'Multi-Term Progress Report',
    titleBn: 'সাময়িক ও বার্ষিক অগ্রগতি প্রতিবেদন',
    shortDescBn: 'অর্ধবার্ষিক ও চূড়ান্ত পরীক্ষার তুলনামূলক নম্বর, সর্বোচ্চ নম্বর ও অগ্রগতি মূল্যায়ন',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'class-result',
    category: 'examination',
    titleEn: 'Class / Section Result Sheet',
    titleBn: 'শ্রেণি ও শাখাভিত্তিক ফলাফল শিট',
    shortDescBn: 'রোল অনুযায়ী সকল শিক্ষার্থীর বিষয়ভিত্তিক নম্বর, মোট, গ্রেড, জিপিএ ও মেধাক্রম',
    defaultOrientation: 'landscape',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'tabulation-sheet',
    category: 'examination',
    titleEn: 'Examination Tabulation Sheet',
    titleBn: 'পরীক্ষার পূর্ণাঙ্গ টেবুলেশন শিট',
    shortDescBn: 'ল্যান্ডস্কেপ বিস্তারিত টেবুলেশন: বিষয়ভিত্তিক নম্বর ও গ্রেড পয়েন্টসহ সারসংক্ষেপ',
    defaultOrientation: 'landscape',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'merit-list',
    category: 'examination',
    titleEn: 'Examination Merit List',
    titleBn: 'পরীক্ষার মেধাতালিকা (Merit List)',
    shortDescBn: 'মেধাক্রম অনুযায়ী সাজানো শীর্ষ শিক্ষার্থীদের তালিকা, মোট নম্বর ও গ্রেড',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'result-summary',
    category: 'examination',
    titleEn: 'Result Summary & Grade Analysis',
    titleBn: 'ফলাফল সারসংক্ষেপ ও গ্রেড বিশ্লেষণ',
    shortDescBn: 'শ্রেণিভিত্তিক মোট পরীক্ষার্থী, উপস্থিতি ও A+ থেকে F গ্রেডের পরিসংখ্যান',
    defaultOrientation: 'landscape',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: false,
    needsExam: true,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'subject-result',
    category: 'examination',
    titleEn: 'Subject-wise Result Report',
    titleBn: 'বিষয়ভিত্তিক ফলাফল প্রতিবেদন',
    shortDescBn: 'নির্দিষ্ট বিষয়ের সর্বোচ্চ, সর্বনিম্ন, গড় নম্বর, পাসের হার ও শিক্ষার্থী তালিকা',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: true,
    needsExam: true,
    needsSubject: true,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },

  // ATTENDANCE DOCUMENTS
  {
    id: 'monthly-attendance',
    category: 'attendance',
    titleEn: 'Monthly Attendance Report',
    titleBn: 'মাসিক উপস্থিতি প্রতিবেদন (১–৩১)',
    shortDescBn: 'ল্যান্ডস্কেপ ৩১ দিনের ম্যাট্রিক্স, কার্যদিবস, উপস্থিত/অনুপস্থিত/বিলম্ব ও শতকরা হার',
    defaultOrientation: 'landscape',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: true,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'daily-attendance',
    category: 'attendance',
    titleEn: 'Daily Attendance Report',
    titleBn: 'দৈনিক উপস্থিতি প্রতিবেদন',
    shortDescBn: 'নির্দিষ্ট তারিখের শ্রেণি/শাখাভিত্তিক উপস্থিতি, RFID প্রবেশ-প্রস্থান ও মন্তব্য',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: true,
    needsAttendanceStatus: true,
    needsRoomConfig: false,
  },
  {
    id: 'student-attendance',
    category: 'attendance',
    titleEn: 'Individual Student Attendance',
    titleBn: 'শিক্ষার্থীর ব্যক্তিগত উপস্থিতি',
    shortDescBn: 'নির্বাচিত শিক্ষার্থীর মাসিক উপস্থিতির বিস্তারিত খতিয়ান ও অভিভাবক অবগতি',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: true,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'attendance-summary',
    category: 'attendance',
    titleEn: 'Class Attendance Summary',
    titleBn: 'শ্রেণি ও শাখা উপস্থিতি সারসংক্ষেপ',
    shortDescBn: 'সকল শ্রেণি ও শাখার মাসিক গড় উপস্থিতি, অনুপস্থিতি ও বিলম্ব পরিসংখ্যান',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: false,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: true,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'teacher-attendance',
    category: 'attendance',
    titleEn: 'Teacher & Staff Attendance',
    titleBn: 'শিক্ষক ও কর্মচারী মাসিক হাজিরা',
    shortDescBn: 'কার্যদিবস, ছুটি, উপস্থিত, অনুপস্থিত, বিলম্ব ও বেতনযোগ্য দিনের বিস্তারিত হিসাব',
    defaultOrientation: 'landscape',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: false,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: true,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
    isTeacherDoc: true,
  },

  // FINANCIAL & ADMINISTRATIVE
  {
    id: 'fee-receipt',
    category: 'financial',
    titleEn: 'Student Fee Receipt',
    titleBn: 'বেতন ও ফি পরিশোধের রসিদ',
    shortDescBn: 'চালান নম্বর, খাতওয়ারি ফি, পরিশোধিত ও বকেয়া বিবরণীসহ মানি রসিদ',
    defaultOrientation: 'portrait',
    defaultPaperSize: 'A4',
    supportsBulkStudents: true,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
  {
    id: 'fee-due-list',
    category: 'financial',
    titleEn: 'Class Monthly Fee Due List',
    titleBn: 'মাসিক বকেয়া ফি তালিকা',
    shortDescBn: 'জানুয়ারি–ডিসেম্বর শ্রেণিভিত্তিক বকেয়া ফি ম্যাট্রিক্স ও অভিভাবক মোবাইল',
    defaultOrientation: 'landscape',
    defaultPaperSize: 'A4',
    supportsBulkStudents: false,
    needsStudentSelection: true,
    needsExam: false,
    needsSubject: false,
    needsMonthYear: false,
    needsDate: false,
    needsAttendanceStatus: false,
    needsRoomConfig: false,
  },
];

export const BANGLA_MONTHS = [
  { value: 1, labelEn: 'January', labelBn: 'জানুয়ারি' },
  { value: 2, labelEn: 'February', labelBn: 'ফেব্রুয়ারি' },
  { value: 3, labelEn: 'March', labelBn: 'মার্চ' },
  { value: 4, labelEn: 'April', labelBn: 'এপ্রিল' },
  { value: 5, labelEn: 'May', labelBn: 'মে' },
  { value: 6, labelEn: 'June', labelBn: 'জুন' },
  { value: 7, labelEn: 'July', labelBn: 'জুলাই' },
  { value: 8, labelEn: 'August', labelBn: 'আগস্ট' },
  { value: 9, labelEn: 'September', labelBn: 'সেপ্টেম্বর' },
  { value: 10, labelEn: 'October', labelBn: 'অক্টোবর' },
  { value: 11, labelEn: 'November', labelBn: 'নভেম্বর' },
  { value: 12, labelEn: 'December', labelBn: 'ডিসেম্বর' },
];

export interface PrintFilterState {
  session: string;
  className: string;
  section: string;
  examId: string;
  subjectName: string;
  month: number;
  year: number;
  date: string;
  attendanceStatus: 'All' | 'Present' | 'Absent' | 'Late' | 'Exited';
  searchQuery: string;
  seatRoomName: string;
  seatRoomCapacity: number;
  seatColumns: number;
  seatsPerBench: 1 | 2;
  seatStrategy: 'sequential' | 'alternating';
}

export interface PrintDisplaySettings {
  paperSize: PrintPaperSize;
  orientation: PrintOrientation;
  marginMm: number;
  copies: number;
  showBranding: boolean;
  showStudentPhotos: boolean;
  showSignatures: boolean;
  showQrVerification: boolean;
  showGuardianPhone: boolean;
  showRfidColumn: boolean;
  showDataOriginNote: boolean;
  idCardsPerPage: 4 | 8;
}

export interface SavedPrintPreset {
  id: string;
  name: string;
  docType: PrintDocumentTypeId;
  settings: PrintDisplaySettings;
  createdAt: string;
}

export const DEFAULT_PRINT_SETTINGS: PrintDisplaySettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  marginMm: 10,
  copies: 1,
  showBranding: true,
  showStudentPhotos: true,
  showSignatures: true,
  showQrVerification: true,
  showGuardianPhone: true,
  showRfidColumn: true,
  showDataOriginNote: true,
  idCardsPerPage: 8,
};

export function getDocumentMeta(id: PrintDocumentTypeId): PrintDocumentMeta {
  return PRINT_DOCUMENT_CATALOG.find((d) => d.id === id) || PRINT_DOCUMENT_CATALOG[0];
}

// ---------------------------------------------------------------------------
// 1. STUDENT FILTERING
// ---------------------------------------------------------------------------

export function filterStudentsForPrint(
  students: Student[],
  filters: Pick<PrintFilterState, 'session' | 'className' | 'section' | 'searchQuery'>
): Student[] {
  const q = filters.searchQuery.trim().toLowerCase();
  return students
    .filter((s) => {
      if (filters.session && filters.session !== 'All' && s.session !== filters.session) {
        return false;
      }
      if (filters.className && filters.className !== 'All' && s.className !== filters.className) {
        return false;
      }
      if (filters.section && filters.section !== 'All' && s.section !== filters.section) {
        return false;
      }
      if (q) {
        const hay = `${s.name} ${s.nameBn} ${s.studentId} ${s.roll} ${s.guardianPhone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.className !== b.className) return a.className.localeCompare(b.className);
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.roll - b.roll;
    });
}

// ---------------------------------------------------------------------------
// 2. ATTENDANCE MATRIX & REPORTS (PURE DETERMINISTIC COMPUTATION)
// ---------------------------------------------------------------------------

export type DayAttendanceCode = 'P' | 'A' | 'L' | 'H' | '-';

export interface MonthlyAttendanceStudentRow {
  student: Student;
  days: Array<{ day: number; isoDate: string; code: DayAttendanceCode; isLive: boolean }>;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercent: number;
}

export interface MonthlyAttendanceMatrix {
  year: number;
  month: number;
  monthLabelEn: string;
  monthLabelBn: string;
  daysInMonth: number;
  dayHeaders: Array<{ day: number; weekdayShort: string; isWeekend: boolean }>;
  workingDaysCount: number;
  rows: MonthlyAttendanceStudentRow[];
  totals: {
    workingDays: number;
    present: number;
    absent: number;
    late: number;
    avgPercent: number;
  };
  dataSource: 'verified' | 'mixed' | 'demo';
}

function stableHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function buildMonthlyAttendanceMatrix(
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  year: number,
  month: number,
  options: { fillDemoWorkingDays?: boolean } = { fillDemoWorkingDays: true }
): MonthlyAttendanceMatrix {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthMeta = BANGLA_MONTHS.find((m) => m.value === month) || BANGLA_MONTHS[0];

  const dayHeaders = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = idx + 1;
    const d = new Date(year, month - 1, day);
    const dow = d.getDay();
    // Bangladesh schools: Friday (5) and Saturday (6) are weekly holidays
    const isWeekend = dow === 5 || dow === 6;
    return {
      day,
      weekdayShort: WEEKDAY_SHORT[dow],
      isWeekend,
    };
  });

  const workingDaysCount = dayHeaders.filter((d) => !d.isWeekend).length;

  // Map live records by `${studentId}::${YYYY-MM-DD}`
  const liveMap = new Map<string, AttendanceRecord>();
  for (const rec of attendanceRecords) {
    liveMap.set(`${rec.studentId}::${rec.date}`, rec);
  }

  let liveCount = 0;
  let demoCount = 0;

  const rows: MonthlyAttendanceStudentRow[] = students.map((student) => {
    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;

    const days = dayHeaders.map((dh) => {
      const mm = String(month).padStart(2, '0');
      const dd = String(dh.day).padStart(2, '0');
      const isoDate = `${year}-${mm}-${dd}`;

      if (dh.isWeekend) {
        return { day: dh.day, isoDate, code: 'H' as DayAttendanceCode, isLive: true };
      }

      const live = liveMap.get(`${student.studentId}::${isoDate}`);
      if (live) {
        liveCount += 1;
        const code: DayAttendanceCode =
          live.status === 'Absent' ? 'A' : live.status === 'Late' ? 'L' : 'P';
        if (code === 'P') presentDays += 1;
        else if (code === 'L') {
          lateDays += 1;
          presentDays += 1;
        } else if (code === 'A') absentDays += 1;
        return { day: dh.day, isoDate, code, isLive: true };
      }

      if (!options.fillDemoWorkingDays) {
        return { day: dh.day, isoDate, code: '-' as DayAttendanceCode, isLive: false };
      }

      demoCount += 1;
      const hash = stableHash(`${student.studentId}:${isoDate}`) % 100;
      let code: DayAttendanceCode = 'P';
      if (hash < 7) {
        code = 'A';
        absentDays += 1;
      } else if (hash < 13) {
        code = 'L';
        lateDays += 1;
        presentDays += 1;
      } else {
        code = 'P';
        presentDays += 1;
      }
      return { day: dh.day, isoDate, code, isLive: false };
    });

    const denom = workingDaysCount || 1;
    const attendancePercent = Number(((presentDays / denom) * 100).toFixed(1));

    return {
      student,
      days,
      workingDays: workingDaysCount,
      presentDays,
      absentDays,
      lateDays,
      attendancePercent,
    };
  });

  const totalWorking = rows.reduce((s, r) => s + r.workingDays, 0);
  const totalPresent = rows.reduce((s, r) => s + r.presentDays, 0);
  const totalAbsent = rows.reduce((s, r) => s + r.absentDays, 0);
  const totalLate = rows.reduce((s, r) => s + r.lateDays, 0);
  const avgPercent = totalWorking > 0 ? Number(((totalPresent / totalWorking) * 100).toFixed(1)) : 0;

  const dataSource: 'verified' | 'mixed' | 'demo' =
    demoCount === 0 ? 'verified' : liveCount > 0 ? 'mixed' : 'demo';

  return {
    year,
    month,
    monthLabelEn: monthMeta.labelEn,
    monthLabelBn: monthMeta.labelBn,
    daysInMonth,
    dayHeaders,
    workingDaysCount,
    rows,
    totals: {
      workingDays: totalWorking,
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      avgPercent,
    },
    dataSource,
  };
}

export interface DailyAttendanceReportRow {
  student: Student;
  status: 'Present' | 'Absent' | 'Late' | 'Exited' | 'Not Marked';
  entryTime: string;
  exitTime: string;
  source: string;
  remarks: string;
  isLive: boolean;
}

export function buildDailyAttendanceReport(
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  date: string,
  statusFilter: PrintFilterState['attendanceStatus']
): {
  rows: DailyAttendanceReportRow[];
  summary: { total: number; present: number; late: number; absent: number; unmarked: number };
} {
  const byStudent = new Map<string, AttendanceRecord>();
  for (const r of attendanceRecords) {
    if (r.date === date) byStudent.set(r.studentId, r);
  }

  const allRows: DailyAttendanceReportRow[] = students.map((student) => {
    const rec = byStudent.get(student.studentId);
    if (!rec) {
      return {
        student,
        status: 'Not Marked',
        entryTime: '—',
        exitTime: '—',
        source: '—',
        remarks: 'হাজিরা নথিভুক্ত হয়নি',
        isLive: false,
      };
    }
    return {
      student,
      status: rec.status,
      entryTime: rec.entryTime || '—',
      exitTime: rec.exitTime || '—',
      source: rec.source,
      remarks: rec.remarks || '—',
      isLive: true,
    };
  });

  const summary = {
    total: allRows.length,
    present: allRows.filter((r) => r.status === 'Present' || r.status === 'Exited').length,
    late: allRows.filter((r) => r.status === 'Late').length,
    absent: allRows.filter((r) => r.status === 'Absent').length,
    unmarked: allRows.filter((r) => r.status === 'Not Marked').length,
  };

  const rows =
    statusFilter === 'All'
      ? allRows
      : allRows.filter((r) => {
          if (statusFilter === 'Present') return r.status === 'Present' || r.status === 'Exited';
          return r.status === statusFilter;
        });

  return { rows, summary };
}

export interface ClassAttendanceSummaryRow {
  className: string;
  section: string;
  studentCount: number;
  workingDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  avgPercent: number;
}

export function buildAttendanceSummaryByClass(
  students: Student[],
  attendanceRecords: AttendanceRecord[],
  year: number,
  month: number
): ClassAttendanceSummaryRow[] {
  const groups = new Map<string, Student[]>();
  for (const s of students) {
    const key = `${s.className}::${s.section}`;
    const arr = groups.get(key) || [];
    arr.push(s);
    groups.set(key, arr);
  }

  const rows: ClassAttendanceSummaryRow[] = [];
  for (const [, grpStudents] of groups.entries()) {
    const matrix = buildMonthlyAttendanceMatrix(grpStudents, attendanceRecords, year, month, {
      fillDemoWorkingDays: true,
    });
    rows.push({
      className: grpStudents[0].className,
      section: grpStudents[0].section,
      studentCount: grpStudents.length,
      workingDays: matrix.workingDaysCount,
      totalPresent: matrix.totals.present,
      totalAbsent: matrix.totals.absent,
      totalLate: matrix.totals.late,
      avgPercent: matrix.totals.avgPercent,
    });
  }

  return rows.sort((a, b) =>
    a.className !== b.className
      ? a.className.localeCompare(b.className)
      : a.section.localeCompare(b.section)
  );
}

export interface TeacherMonthlyAttendanceRow {
  id: string;
  employeeId: string;
  name: string;
  nameBn: string;
  designationBn: string;
  workingDays: number;
  dayOff: number;
  present: number;
  absent: number;
  leave: number;
  late: number;
  payableDays: number;
  presentPercent: number;
}

export function buildTeacherMonthlyAttendance(
  teachers: Teacher[],
  staff: StaffMember[],
  year: number,
  month: number
): TeacherMonthlyAttendanceRow[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 5 && dow !== 6) workingDays += 1;
  }
  const dayOff = daysInMonth - workingDays;

  const combined = [
    ...teachers
      .filter((t) => t.status === 'Active')
      .map((t) => ({
        id: t.id,
        employeeId: t.employeeId,
        name: t.name,
        nameBn: t.nameBn,
        designationBn: t.designationBn,
      })),
    ...staff
      .filter((s) => s.status === 'Active')
      .map((s) => ({
        id: s.id,
        employeeId: s.employeeId,
        name: s.name,
        nameBn: s.nameBn,
        designationBn: s.roleBn,
      })),
  ];

  return combined.map((person) => {
    const h = stableHash(`${person.employeeId}:${year}-${month}`);
    const absent = h % 11 === 0 ? 2 : h % 5 === 0 ? 1 : 0;
    const leave = h % 7 === 0 ? 1 : 0;
    const late = h % 4;
    const present = Math.max(0, workingDays - absent - leave);
    const payableDays = Math.max(0, daysInMonth - absent);
    const presentPercent = workingDays > 0 ? Math.round((present / workingDays) * 100) : 100;
    return {
      ...person,
      workingDays,
      dayOff,
      present,
      absent,
      leave,
      late,
      payableDays,
      presentPercent,
    };
  });
}

// ---------------------------------------------------------------------------
// 3. EXAMINATION SEAT ALLOCATION ENGINE (WITH DUPLICATE & CAPACITY GUARDS)
// ---------------------------------------------------------------------------

export interface SeatAssignment {
  seatNumber: number;
  roomName: string;
  columnIndex: number;
  rowIndex: number;
  benchNumber: number;
  benchPosition: 'Left' | 'Right' | 'Single';
  student: Student;
}

export interface SeatAllocationResult {
  roomName: string;
  capacity: number;
  columns: number;
  seatsPerBench: 1 | 2;
  totalBenches: number;
  assignments: SeatAssignment[];
  unassignedStudents: Student[];
  duplicateIdsRemoved: string[];
  capacityExceeded: boolean;
}

export function allocateExamSeats(
  students: Student[],
  config: {
    roomName: string;
    capacity: number;
    columns: number;
    seatsPerBench: 1 | 2;
    strategy: 'sequential' | 'alternating';
  }
): SeatAllocationResult {
  const safeCapacity = Math.max(1, config.capacity);
  const safeColumns = Math.max(1, Math.min(4, config.columns));
  const seatsPerBench = config.seatsPerBench;

  // Strict duplicate prevention by studentId
  const seen = new Set<string>();
  const uniqueStudents: Student[] = [];
  const duplicateIdsRemoved: string[] = [];

  for (const s of students) {
    if (seen.has(s.studentId)) {
      duplicateIdsRemoved.push(s.studentId);
      continue;
    }
    seen.add(s.studentId);
    uniqueStudents.push(s);
  }

  let ordered: Student[] = [...uniqueStudents];
  if (config.strategy === 'alternating') {
    // Interleave by class/section so adjacent benchmates are from different classes/sections where possible
    const buckets = new Map<string, Student[]>();
    for (const s of uniqueStudents) {
      const k = `${s.className}::${s.section}`;
      const list = buckets.get(k) || [];
      list.push(s);
      buckets.set(k, list);
    }
    const keys = Array.from(buckets.keys()).sort();
    const interleaved: Student[] = [];
    let remaining = true;
    while (remaining) {
      remaining = false;
      for (const k of keys) {
        const list = buckets.get(k)!;
        if (list.length > 0) {
          interleaved.push(list.shift()!);
          if (list.length > 0) remaining = true;
        }
      }
    }
    ordered = interleaved;
  } else {
    ordered.sort((a, b) =>
      a.className !== b.className
        ? a.className.localeCompare(b.className)
        : a.roll - b.roll
    );
  }

  const assignedPool = ordered.slice(0, safeCapacity);
  const unassignedStudents = ordered.slice(safeCapacity);
  const totalBenches = Math.ceil(Math.max(assignedPool.length, 1) / seatsPerBench);

  const assignments: SeatAssignment[] = assignedPool.map((student, idx) => {
    const benchZero = Math.floor(idx / seatsPerBench);
    const columnIndex = benchZero % safeColumns;
    const rowIndex = Math.floor(benchZero / safeColumns);
    const benchPosition: 'Left' | 'Right' | 'Single' =
      seatsPerBench === 1 ? 'Single' : idx % 2 === 0 ? 'Left' : 'Right';

    return {
      seatNumber: idx + 1,
      roomName: config.roomName.trim() || 'Room 101',
      columnIndex,
      rowIndex,
      benchNumber: benchZero + 1,
      benchPosition,
      student,
    };
  });

  return {
    roomName: config.roomName.trim() || 'Room 101',
    capacity: safeCapacity,
    columns: safeColumns,
    seatsPerBench,
    totalBenches,
    assignments,
    unassignedStudents,
    duplicateIdsRemoved,
    capacityExceeded: unassignedStudents.length > 0,
  };
}

// ---------------------------------------------------------------------------
// 4. RESULTS, MERIT LIST, GRADE SUMMARY & SUBJECT ANALYSIS
// ---------------------------------------------------------------------------

export function computeClassHighestMarks(results: StudentResult[]): Record<string, number> {
  const highest: Record<string, number> = {};
  for (const res of results) {
    for (const m of res.marks) {
      const prev = highest[m.subjectCode] ?? 0;
      if (m.obtainedMarks > prev) {
        highest[m.subjectCode] = m.obtainedMarks;
      }
    }
  }
  return highest;
}

export interface MeritListRow {
  meritRank: number | null;
  meritRankBn: string;
  studentId: string;
  roll: number;
  studentName: string;
  studentNameBn: string;
  className: string;
  section: string;
  totalMarks: number;
  fullMarks: number;
  gpa: number;
  overallGrade: string;
  passed: boolean;
  failedSubjects: string[];
  result: StudentResult;
}

export function buildMeritListRows(results: StudentResult[]): MeritListRow[] {
  const meritMap = computeMeritPositions(results);
  const sorted = [...results].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? -1 : 1;
    if (b.gpa !== a.gpa) return b.gpa - a.gpa;
    if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
    return a.roll - b.roll;
  });

  return sorted.map((res) => {
    const info = meritMap.get(res.id);
    const fullMarks = res.marks.reduce((sum, m) => sum + m.fullMarks, 0);
    const failedSubjects = res.marks
      .filter((m) => m.grade === 'F' || m.obtainedMarks < m.passMarks)
      .map((m) => m.subjectName);

    return {
      meritRank: info?.rank ?? null,
      meritRankBn: info?.rankBn || '—',
      studentId: res.studentId,
      roll: res.roll,
      studentName: res.studentName,
      studentNameBn: res.studentNameBn,
      className: res.className,
      section: res.section,
      totalMarks: res.totalMarks,
      fullMarks,
      gpa: res.gpa,
      overallGrade: res.overallGrade,
      passed: res.passed,
      failedSubjects,
      result: res,
    };
  });
}

export interface ClassResultSummaryRow {
  className: string;
  totalStudents: number;
  appeared: number;
  absent: number;
  passed: number;
  failed: number;
  passRate: number;
  grades: Record<'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F', number>;
}

export function buildResultSummaryRows(
  students: Student[],
  results: StudentResult[],
  examId: string
): ClassResultSummaryRow[] {
  const classes = Array.from(new Set(students.map((s) => s.className))).sort();
  const filteredResults =
    examId && examId !== 'All' ? results.filter((r) => r.examId === examId) : results;

  return classes.map((className) => {
    const classStudents = students.filter((s) => s.className === className);
    const classResults = filteredResults.filter((r) => r.className === className);
    const grades: Record<'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F', number> = {
      'A+': 0,
      A: 0,
      'A-': 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    for (const r of classResults) {
      const g = r.overallGrade as keyof typeof grades;
      if (g in grades) grades[g] += 1;
    }

    const appeared = classResults.length;
    const absent = Math.max(0, classStudents.length - appeared);
    const passed = classResults.filter((r) => r.passed).length;
    const failed = appeared - passed;
    const passRate = appeared > 0 ? Number(((passed / appeared) * 100).toFixed(1)) : 0;

    return {
      className,
      totalStudents: classStudents.length,
      appeared,
      absent,
      passed,
      failed,
      passRate,
      grades,
    };
  });
}

export interface SubjectAnalysisReport {
  subjectName: string;
  totalExamined: number;
  passedCount: number;
  failedCount: number;
  passRate: number;
  highest: number;
  lowest: number;
  average: number;
  gradeCounts: Record<'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F', number>;
  entries: Array<{
    studentId: string;
    studentName: string;
    studentNameBn: string;
    className: string;
    section: string;
    roll: number;
    fullMarks: number;
    obtainedMarks: number;
    grade: string;
    gradePoint: number;
    passed: boolean;
  }>;
}

export function buildSubjectAnalysisReport(
  results: StudentResult[],
  subjectName: string
): SubjectAnalysisReport {
  const gradeCounts: Record<'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F', number> = {
    'A+': 0,
    A: 0,
    'A-': 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  const entries: SubjectAnalysisReport['entries'] = [];

  for (const res of results) {
    const mark = res.marks.find(
      (m) =>
        m.subjectName === subjectName ||
        m.subjectName.toLowerCase().includes(subjectName.toLowerCase())
    );
    if (!mark) continue;
    const evalMark = evaluateSubjectMark(mark.obtainedMarks, mark.fullMarks);
    const passed = evalMark.passed && mark.obtainedMarks >= mark.passMarks;
    const g = (passed ? evalMark.grade : 'F') as keyof typeof gradeCounts;
    if (g in gradeCounts) gradeCounts[g] += 1;

    entries.push({
      studentId: res.studentId,
      studentName: res.studentName,
      studentNameBn: res.studentNameBn,
      className: res.className,
      section: res.section,
      roll: res.roll,
      fullMarks: mark.fullMarks,
      obtainedMarks: mark.obtainedMarks,
      grade: g,
      gradePoint: passed ? evalMark.gradePoint : 0,
      passed,
    });
  }

  entries.sort((a, b) => b.obtainedMarks - a.obtainedMarks || a.roll - b.roll);

  const totalExamined = entries.length;
  const passedCount = entries.filter((e) => e.passed).length;
  const failedCount = totalExamined - passedCount;
  const passRate = totalExamined > 0 ? Number(((passedCount / totalExamined) * 100).toFixed(1)) : 0;
  const highest = totalExamined > 0 ? Math.max(...entries.map((e) => e.obtainedMarks)) : 0;
  const lowest = totalExamined > 0 ? Math.min(...entries.map((e) => e.obtainedMarks)) : 0;
  const average =
    totalExamined > 0
      ? Number((entries.reduce((s, e) => s + e.obtainedMarks, 0) / totalExamined).toFixed(1))
      : 0;

  return {
    subjectName,
    totalExamined,
    passedCount,
    failedCount,
    passRate,
    highest,
    lowest,
    average,
    gradeCounts,
    entries,
  };
}

// ---------------------------------------------------------------------------
// 5. FEE DUE MATRIX
// ---------------------------------------------------------------------------

export interface FeeDueMatrixRow {
  student: Student;
  monthlyDues: number[]; // length 12 (Jan..Dec)
  totalDue: number;
  isLiveLinked: boolean;
}

export function buildFeeDueMatrix(students: Student[], fees: FeeRecord[]): FeeDueMatrixRow[] {
  return students.map((student) => {
    const stuFees = fees.filter((f) => f.studentId === student.studentId);
    const liveDue = stuFees.reduce((sum, f) => sum + f.dueAmount, 0);
    const baseMonthly = student.className === 'Class 10' || student.className === 'Class 9' ? 600 : 450;

    // Distribute live due into recent months cleanly, or show 0 if fully paid
    const monthlyDues = Array.from({ length: 12 }, (_, idx) => {
      if (stuFees.length > 0) {
        if (liveDue <= 0) return 0;
        // Assign live due to November (10) / December (11)
        if (idx === 10) return Math.min(liveDue, baseMonthly);
        if (idx === 11) return Math.max(0, liveDue - baseMonthly);
        return 0;
      }
      // Deterministic demo monthly status for students without invoice rows
      const h = stableHash(`${student.studentId}:fee:${idx}`) % 10;
      return idx >= 9 && h < 5 ? baseMonthly : 0;
    });

    const totalDue = monthlyDues.reduce((s, v) => s + v, 0);
    return {
      student,
      monthlyDues,
      totalDue,
      isLiveLinked: stuFees.length > 0,
    };
  });
}

// ---------------------------------------------------------------------------
// 6. VALIDATION & VERIFICATION CODE + DETERMINISTIC QR MATRIX
// ---------------------------------------------------------------------------

export interface PrintValidationIssue {
  level: 'error' | 'warning';
  messageBn: string;
}

export function validatePrintRequest(
  docType: PrintDocumentTypeId,
  filters: PrintFilterState,
  selectedStudents: Student[],
  resultsForSelection: StudentResult[],
  seatAllocation?: SeatAllocationResult
): PrintValidationIssue[] {
  const meta = getDocumentMeta(docType);
  const issues: PrintValidationIssue[] = [];

  if (meta.needsStudentSelection && selectedStudents.length === 0) {
    issues.push({
      level: 'error',
      messageBn: 'ডকুমেন্ট তৈরি করতে কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন অথবা ফিল্টার পরিবর্তন করুন।',
    });
  }

  if (meta.needsExam && !filters.examId) {
    issues.push({
      level: 'error',
      messageBn: 'পরীক্ষাভিত্তিক ডকুমেন্টের জন্য একটি পরীক্ষা নির্বাচন করুন।',
    });
  }

  if (
    (docType === 'individual-result' ||
      docType === 'academic-transcript' ||
      docType === 'class-result' ||
      docType === 'tabulation-sheet' ||
      docType === 'merit-list' ||
      docType === 'subject-result') &&
    selectedStudents.length > 0 &&
    resultsForSelection.length === 0
  ) {
    issues.push({
      level: 'warning',
      messageBn:
        'নির্বাচিত শিক্ষার্থী ও পরীক্ষার জন্য এখনো নম্বর এন্ট্রি পাওয়া যায়নি। অন্য পরীক্ষা বা শ্রেণি নির্বাচন করুন।',
    });
  }

  if (docType === 'exam-seat-plan' && seatAllocation) {
    if (seatAllocation.capacityExceeded) {
      issues.push({
        level: 'warning',
        messageBn: `কক্ষের ধারণক্ষমতা (${seatAllocation.capacity} জন) অতিক্রম করেছে — ${seatAllocation.unassignedStudents.length} জন শিক্ষার্থী বরাদ্দ বাকি রয়েছে। কক্ষের ধারণক্ষমতা বাড়ান।`,
      });
    }
    if (seatAllocation.duplicateIdsRemoved.length > 0) {
      issues.push({
        level: 'warning',
        messageBn: `${seatAllocation.duplicateIdsRemoved.length}টি ডুপ্লিকেট শিক্ষার্থী আইডি স্বয়ংক্রিয়ভাবে বাদ দেওয়া হয়েছে।`,
      });
    }
  }

  return issues;
}

export function generateVerificationCode(
  docType: PrintDocumentTypeId,
  refId: string,
  session = '2026'
): string {
  const prefixMap: Record<PrintDocumentCategory, string> = {
    student: 'STU',
    examination: 'EXM',
    attendance: 'ATT',
    financial: 'FIN',
  };
  const meta = getDocumentMeta(docType);
  const hash = stableHash(`${docType}:${refId}:${session}`).toString(36).toUpperCase().slice(0, 6);
  return `BUTPHS-${prefixMap[meta.category]}-${session.slice(-2)}-${hash.padEnd(6, '0')}`;
}

/**
 * Generates a deterministic 15x15 visual verification matrix (with standard 3 corner finder patterns)
 * for crisp offline vector SVG rendering on printed transcripts, marksheets, and ID cards.
 */
export function buildDeterministicQrMatrix(code: string): boolean[][] {
  const size = 15;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 5; r += 1) {
      for (let c = 0; c < 5; c += 1) {
        const border = r === 0 || r === 4 || c === 0 || c === 4;
        const center = r === 2 && c === 2;
        grid[r0 + r][c0 + c] = border || center;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 5);
  placeFinder(size - 5, 0);

  let seed = stableHash(code);
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const inTopLeft = r < 6 && c < 6;
      const inTopRight = r < 6 && c >= size - 6;
      const inBottomLeft = r >= size - 6 && c < 6;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      grid[r][c] = seed % 5 < 2;
    }
  }

  return grid;
}

// ---------------------------------------------------------------------------
// 7. SAVED PRINT PRESETS (LOCALSTORAGE PERSISTENCE)
// ---------------------------------------------------------------------------

const PRESETS_STORAGE_KEY = 'butphs_print_presets_v1';

export function loadSavedPrintPresets(): SavedPrintPreset[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePrintPreset(preset: Omit<SavedPrintPreset, 'id' | 'createdAt'>): SavedPrintPreset[] {
  const existing = loadSavedPrintPresets();
  const next: SavedPrintPreset[] = [
    {
      ...preset,
      id: `preset-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    },
    ...existing.filter((p) => p.name.toLowerCase() !== preset.name.toLowerCase()),
  ].slice(0, 12);

  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

export function deletePrintPreset(id: string): SavedPrintPreset[] {
  const next = loadSavedPrintPresets().filter((p) => p.id !== id);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // Ignore storage errors
  }
  return next;
}

export function getExamByIdOrFirst(exams: Exam[], examId: string): Exam | undefined {
  return exams.find((e) => e.id === examId) || exams[0];
}
