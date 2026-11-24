import {
  INITIAL_ADMISSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_AUDIT_LOGS,
  INITIAL_CALENDAR,
  INITIAL_CLASS_NOTES,
  INITIAL_COMMITTEE_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_EXAMS,
  INITIAL_FEES,
  INITIAL_FINANCE_TRANSACTIONS,
  INITIAL_GUARDIANS,
  INITIAL_INQUIRIES,
  INITIAL_NOTICES,
  INITIAL_RESULTS,
  INITIAL_RFID_CARDS,
  INITIAL_ROUTINES,
  INITIAL_SMS_LOGS,
  INITIAL_STAFF,
  INITIAL_STUDENTS,
  INITIAL_SYLLABUS,
  INITIAL_TEACHERS,
  INITIAL_WEBSITE_CONTENT,
} from '../lib/mockData';
import { SCHOOL_INFO } from '../config/school';
import { LIBRARY_BOOKS, type LibraryBook } from '../data/academicCatalog';
import { resolveStudentPhotoUrl } from '../utils/profileHelpers';
export { apiClient, API_ENDPOINTS, buildApiUrl, isRemoteApiConfigured } from './apiClient';
export type { ApiMeta, ApiResponse } from './apiClient';
import type {
  AdmissionApplication,
  AttendanceRecord,
  AuditLog,
  AuthUser,
  CalendarEvent,
  ClassNote,
  CommitteeMember,
  ContactInquiry,
  Exam,
  FeeRecord,
  FinanceTransaction,
  Guardian,
  Notice,
  RfidCard,
  RoutineEntry,
  ScanDirection,
  SchoolEvent,
  SmsLog,
  StaffMember,
  Student,
  StudentResult,
  SyllabusItem,
  Teacher,
  UserRole,
  WebsiteContentConfig,
} from '../types';

export interface SchoolDatabaseSnapshot {
  students: Student[];
  teachers: Teacher[];
  staff: StaffMember[];
  guardians: Guardian[];
  committeeMembers: CommitteeMember[];
  notices: Notice[];
  exams: Exam[];
  results: StudentResult[];
  rfidCards: RfidCard[];
  attendance: AttendanceRecord[];
  smsLogs: SmsLog[];
  admissions: AdmissionApplication[];
  inquiries: ContactInquiry[];
  fees: FeeRecord[];
  financeTransactions: FinanceTransaction[];
  auditLogs: AuditLog[];
  routines: RoutineEntry[];
  syllabus: SyllabusItem[];
  calendar: CalendarEvent[];
  events: SchoolEvent[];
  libraryBooks: LibraryBook[];
  classNotes: ClassNote[];
  websiteContent: WebsiteContentConfig;
}

const STORAGE_KEY = 'butphs_institutional_db_v6';

export interface PortalAccountRecord {
  id: string;
  role: UserRole;
  labelBn: string;
  subLabelBn: string;
  email: string;
  phone?: string;
  password: string;
  user: AuthUser;
}

export const PORTAL_ACCOUNTS: PortalAccountRecord[] = [
  {
    id: 'acc-admin',
    role: 'admin',
    labelBn: 'সুপার অ্যাডমিন',
    subLabelBn: 'admin@butphs.edu.bd',
    email: 'admin@butphs.edu.bd',
    phone: '01711000189',
    password: 'Admin123!',
    user: {
      id: 'usr-admin-1',
      email: 'admin@butphs.edu.bd',
      name: 'Md. Mahfuzur Rahman',
      nameBn: 'মোঃ মাহফুজুর রহমান',
      role: 'admin',
      designation: 'প্রশাসনিক সমন্বয়কারী ও সিস্টেম অ্যাডমিন',
      phone: '01711-000189',
      address: 'উপসী, নড়িয়া, শরীয়তপুর',
      bio: 'বিদ্যালয়ের ডিজিটাল ক্যাম্পাস, RFID হাজিরা, ওয়েবসাইট ও একাডেমিক প্রশাসনিক সমন্বয়কারী।',
      photoUrl: SCHOOL_INFO.assets.staffOffice,
      avatarInitials: 'MR',
    },
  },
  {
    id: 'acc-principal',
    role: 'admin',
    labelBn: 'প্রধান শিক্ষক',
    subLabelBn: 'principal@butphs.edu.bd',
    email: 'principal@butphs.edu.bd',
    phone: '01711000188',
    password: 'Admin123!',
    user: {
      id: 'usr-principal-1',
      email: 'principal@butphs.edu.bd',
      name: 'Md. Shafiqul Islam',
      nameBn: 'মোঃ শফিকুল ইসলাম',
      role: 'admin',
      designation: 'প্রধান শিক্ষক, বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়',
      phone: '01711-000188',
      address: 'প্রধান শিক্ষকের কার্যালয়, উপসী, নড়িয়া, শরীয়তপুর',
      bio: '২২ বছরের বেশি মাধ্যমিক শিক্ষাদানের অভিজ্ঞতাসম্পন্ন প্রধান শিক্ষক।',
      photoUrl: SCHOOL_INFO.assets.headTeacher,
      linkedTeacherId: 'tch-1',
      avatarInitials: 'SI',
    },
  },
  {
    id: 'acc-teacher',
    role: 'teacher',
    labelBn: 'শিক্ষক পোর্টাল',
    subLabelBn: 'teacher@butphs.edu.bd',
    email: 'teacher@butphs.edu.bd',
    phone: '01712000202',
    password: 'Teacher123!',
    user: {
      id: 'usr-teacher-1',
      email: 'teacher@butphs.edu.bd',
      name: 'Tahmina Yasmin',
      nameBn: 'তাহমিনা ইয়াসমিন',
      role: 'teacher',
      designation: 'সহকারী প্রধান শিক্ষক · বাংলা বিভাগ',
      phone: '01712-000202',
      address: 'উপসী, নড়িয়া, শরীয়তপুর',
      bio: 'বাংলা সাহিত্য ও ব্যাকরণে অভিজ্ঞ শিক্ষিকা এবং বিতর্ক ও সাহিত্য ক্লাবের প্রধান উপদেষ্টা।',
      photoUrl: SCHOOL_INFO.assets.teacherFemaleSenior,
      linkedTeacherId: 'tch-2',
      avatarInitials: 'TY',
    },
  },
  {
    id: 'acc-accountant',
    role: 'accountant',
    labelBn: 'হিসাবরক্ষক পোর্টাল',
    subLabelBn: 'accountant@butphs.edu.bd',
    email: 'accountant@butphs.edu.bd',
    phone: '01714000303',
    password: 'Accountant123!',
    user: {
      id: 'usr-accountant-1',
      email: 'accountant@butphs.edu.bd',
      name: 'Md. Kamal Hossain',
      nameBn: 'মোঃ কামাল হোসেন',
      role: 'accountant',
      designation: 'প্রধান হিসাবরক্ষক · অর্থ ও হিসাব শাখা',
      phone: '01714-000303',
      address: 'প্রশাসনিক ভবন, উপসী, নড়িয়া, শরীয়তপুর',
      bio: 'শিক্ষার্থী বেতন-ফি আদায়, ভাউচার নিবন্ধন, বকেয়া ব্যবস্থাপনা ও বার্ষিক অডিট সমন্বয়কারী।',
      photoUrl: SCHOOL_INFO.assets.staffOffice,
      linkedStaffId: 'stf-1',
      avatarInitials: 'KH',
    },
  },
  {
    id: 'acc-parent',
    role: 'parent',
    labelBn: 'অভিভাবক পোর্টাল',
    subLabelBn: '01715223344 (২ সন্তান)',
    email: 'parent@butphs.edu.bd',
    phone: '01715223344',
    password: 'Parent123!',
    user: {
      id: 'usr-parent-1',
      email: 'parent@butphs.edu.bd',
      name: 'Md. Rezaul Karim',
      nameBn: 'মোঃ রেজাউল করিম',
      role: 'parent',
      designation: 'অভিভাবক · ২ শিক্ষার্থী সংযুক্ত',
      phone: '01715223344',
      address: 'উপসী বাজার, নড়িয়া, শরীয়তপুর',
      bio: 'আশরাফুল আলম (১০ম শ্রেণি) ও তাসনিম তাবাসসুম (৭ম শ্রেণি)-এর পিতা ও অভিভাবক।',
      photoUrl: SCHOOL_INFO.assets.committeeGuardianMale,
      linkedGuardianId: 'grd-1',
      linkedStudentIds: ['BUTPHS-2026-101', 'BUTPHS-2026-205'],
      avatarInitials: 'RK',
    },
  },
];

// Backward-compatible alias for legacy imports
export const DEMO_ACCOUNTS = PORTAL_ACCOUNTS;

const PASSWORD_STORAGE_KEY = 'butphs_portal_passwords_v1';
const PROFILE_STORAGE_KEY = 'butphs_portal_profiles_v1';

function readProfileOverrides(): Record<string, Partial<AuthUser>> {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, Partial<AuthUser>>) : {};
  } catch {
    return {};
  }
}

function writeProfileOverrides(overrides: Record<string, Partial<AuthUser>>): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore storage quota errors in private mode
  }
}

function readPasswordOverrides(): Record<string, string> {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writePasswordOverrides(overrides: Record<string, string>): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // Ignore storage quota errors in private mode
  }
}

export const authService = {
  getEffectivePassword(account: PortalAccountRecord): string {
    const overrides = readPasswordOverrides();
    return overrides[account.email.toLowerCase()] || account.password;
  },

  hasCustomPassword(email: string): boolean {
    const overrides = readPasswordOverrides();
    return Boolean(overrides[email.toLowerCase()]);
  },

  getEffectiveUser(baseUser: AuthUser): AuthUser {
    const overrides = readProfileOverrides();
    const patch = overrides[baseUser.email.toLowerCase()];
    return patch ? { ...baseUser, ...patch } : baseUser;
  },

  saveProfileOverride(email: string, patch: Partial<AuthUser>): void {
    const key = email.trim().toLowerCase();
    const overrides = readProfileOverrides();
    overrides[key] = { ...(overrides[key] || {}), ...patch };
    writeProfileOverrides(overrides);
  },

  async login(identifier: string, password: string, expectedRole?: UserRole): Promise<AuthUser> {
    await new Promise((r) => setTimeout(r, 220));
    const normalized = identifier.trim().toLowerCase();

    const match = PORTAL_ACCOUNTS.find((acc) => {
      const idMatches =
        acc.email.toLowerCase() === normalized || (acc.phone && acc.phone === identifier.trim());
      if (!idMatches) return false;
      return this.getEffectivePassword(acc) === password;
    });

    if (!match) {
      throw new Error('ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }

    if (expectedRole && match.role !== expectedRole) {
      throw new Error(
        `এই অ্যাকাউন্টটি "${match.labelBn}" পোর্টালের জন্য নির্ধারিত। সঠিক রোল নির্বাচন করে লগইন করুন।`
      );
    }

    return this.getEffectiveUser(match.user);
  },

  changePassword(
    email: string,
    currentPassword: string,
    newPassword: string
  ): { ok: boolean; message: string } {
    const account = PORTAL_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!account) {
      return { ok: false, message: 'ব্যবহারকারী অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
    }
    const effective = this.getEffectivePassword(account);
    if (currentPassword !== effective) {
      return { ok: false, message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে আবার যাচাই করুন।' };
    }
    if (newPassword.trim().length < 6) {
      return { ok: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }
    if (newPassword === effective) {
      return { ok: false, message: 'নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ড থেকে ভিন্ন হতে হবে।' };
    }
    const overrides = readPasswordOverrides();
    overrides[account.email.toLowerCase()] = newPassword;
    writePasswordOverrides(overrides);
    return { ok: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' };
  },

  adminSetAccountPassword(email: string, newPassword: string): { ok: boolean; message: string } {
    const account = PORTAL_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!account) {
      return { ok: false, message: 'অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' };
    }
    if (newPassword.trim().length < 6) {
      return { ok: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }
    const overrides = readPasswordOverrides();
    overrides[account.email.toLowerCase()] = newPassword;
    writePasswordOverrides(overrides);
    return { ok: true, message: `${account.labelBn}-এর পাসওয়ার্ড হালনাগাদ করা হয়েছে।` };
  },

  adminResetAccountPassword(email: string): { ok: boolean; message: string } {
    const key = email.trim().toLowerCase();
    const overrides = readPasswordOverrides();
    delete overrides[key];
    writePasswordOverrides(overrides);
    return { ok: true, message: 'পাসওয়ার্ড ডিফল্ট মান অনুযায়ী রিসেট করা হয়েছে।' };
  },
};

export interface RfidHardwareAdapter {
  readonly mode: 'SIMULATED_FRONTEND' | 'HARDWARE_API';
  formatSmsMessage(student: Student, direction: ScanDirection, scanTime: string): string;
}

export const rfidService: RfidHardwareAdapter = {
  mode: 'SIMULATED_FRONTEND',
  formatSmsMessage(student: Student, direction: ScanDirection, scanTime: string): string {
    if (direction === 'ENTRY') {
      return `প্রিয় অভিভাবক, আপনার সন্তান ${student.nameBn} (আইডি: ${student.studentId}, ${student.className}) সকাল ${scanTime} টায় RFID কার্ডের মাধ্যমে নিরাপদে বিদ্যালয়ে প্রবেশ করেছে। — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়`;
    }
    return `প্রিয় অভিভাবক, আপনার সন্তান ${student.nameBn} (আইডি: ${student.studentId}, ${student.className}) ${scanTime} টায় বিদ্যালয় থেকে প্রস্থান করেছে। — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়`;
  },
};

export const databaseRepository = {
  getDefaultSnapshot(): SchoolDatabaseSnapshot {
    return {
      students: INITIAL_STUDENTS,
      teachers: INITIAL_TEACHERS,
      staff: INITIAL_STAFF,
      guardians: INITIAL_GUARDIANS,
      committeeMembers: INITIAL_COMMITTEE_MEMBERS,
      notices: INITIAL_NOTICES,
      exams: INITIAL_EXAMS,
      results: INITIAL_RESULTS,
      rfidCards: INITIAL_RFID_CARDS,
      attendance: INITIAL_ATTENDANCE,
      smsLogs: INITIAL_SMS_LOGS,
      admissions: INITIAL_ADMISSIONS,
      inquiries: INITIAL_INQUIRIES,
      fees: INITIAL_FEES,
      financeTransactions: INITIAL_FINANCE_TRANSACTIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      routines: INITIAL_ROUTINES,
      syllabus: INITIAL_SYLLABUS,
      calendar: INITIAL_CALENDAR,
      events: INITIAL_EVENTS,
      libraryBooks: LIBRARY_BOOKS,
      classNotes: INITIAL_CLASS_NOTES,
      websiteContent: INITIAL_WEBSITE_CONTENT,
    };
  },

  load(): SchoolDatabaseSnapshot {
    try {
      const defaults = this.getDefaultSnapshot();
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<SchoolDatabaseSnapshot>;
      const mergedWebsiteContent = {
        ...defaults.websiteContent,
        ...(parsed.websiteContent || {}),
        demoStats: {
          ...defaults.websiteContent.demoStats,
          ...(parsed.websiteContent?.demoStats || {}),
        },
        heroSlides:
          parsed.websiteContent?.heroSlides && parsed.websiteContent.heroSlides.length > 0
            ? parsed.websiteContent.heroSlides
            : defaults.websiteContent.heroSlides,
        systemSettings: {
          ...(defaults.websiteContent.systemSettings || {
            admissionOpen: true,
            currentExamTerm: 'বার্ষিক পরীক্ষা ২০২৬',
            lateArrivalTime: '09:30 AM',
            passMarksPercent: 33,
            autoSmsOnRfidEntry: true,
            autoSmsOnRfidExit: true,
            autoSmsOnAbsent: true,
            autoSmsOnFeePayment: true,
          }),
          ...(parsed.websiteContent?.systemSettings || {}),
        },
      };
      const mergedStudents = (parsed.students && parsed.students.length > 0 ? parsed.students : defaults.students).map(
        (stu) => ({
          ...stu,
          photoUrl: resolveStudentPhotoUrl(stu),
        })
      );
      return {
        ...defaults,
        ...parsed,
        students: mergedStudents,
        websiteContent: mergedWebsiteContent,
      };
    } catch {
      return this.getDefaultSnapshot();
    }
  },

  save(snapshot: SchoolDatabaseSnapshot): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage quota errors in private mode
    }
  },

  reset(): SchoolDatabaseSnapshot {
    const fresh = this.getDefaultSnapshot();
    this.save(fresh);
    return fresh;
  },
};
