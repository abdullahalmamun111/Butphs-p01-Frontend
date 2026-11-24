import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { databaseRepository, rfidService, type SchoolDatabaseSnapshot } from '../services';
import { checkRfidDuplicateScan, computeOverallResult } from '../utils/grading';
import { resolveStudentPhotoUrl } from '../utils/profileHelpers';
import type {
  AdmissionApplication,
  AttendanceRecord,
  AttendanceStatus,
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
  ToastMessage,
  UserRole,
  WebsiteContentConfig,
} from '../types';
import type { LibraryBook } from '../data/academicCatalog';

interface SchoolStoreContextValue {
  db: SchoolDatabaseSnapshot;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, description?: string) => void;
  dismissToast: (id: string) => void;
  logAudit: (user: string, role: UserRole, module: string, action: string) => void;

  // Teachers CRUD
  addTeacher: (teacher: Omit<Teacher, 'id'>, actor: string) => void;
  updateTeacher: (id: string, patch: Partial<Teacher>, actor: string) => void;
  deleteTeacher: (id: string, actor: string) => void;

  // Students CRUD
  addStudent: (student: Omit<Student, 'id'>, actor: string) => void;
  updateStudent: (id: string, patch: Partial<Student>, actor: string) => void;
  deleteStudent: (id: string, actor: string) => void;

  // Staff & Guardians CRUD
  addStaff: (member: Omit<StaffMember, 'id'>, actor: string) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>, actor: string) => void;
  deleteStaff: (id: string, actor: string) => void;
  toggleStaffStatus: (id: string, actor: string) => void;
  updateGuardian: (id: string, patch: Partial<Guardian>, actor: string) => void;

  // Notices CRUD
  addNotice: (notice: Omit<Notice, 'id'>, actor: string) => void;
  updateNoticeStatus: (id: string, status: Notice['status'], actor: string) => void;
  deleteNotice: (id: string, actor: string) => void;

  // Syllabus & Exams
  addSyllabus: (item: Omit<SyllabusItem, 'id'>, actor: string) => void;
  addExam: (exam: Omit<Exam, 'id'>, actor: string) => void;

  // RFID & Attendance
  assignRfidCard: (cardUid: string, studentId: string, actor: string) => { ok: boolean; message: string };
  updateRfidCardStatus: (cardId: string, status: RfidCard['status'], actor: string) => void;
  simulateRfidScan: (
    cardUid: string,
    direction: ScanDirection,
    scanTimeLabel: string,
    scanMinutes: number,
    date: string,
    actor: string
  ) => { ok: boolean; message: string; record?: AttendanceRecord; sms?: SmsLog };
  saveManualAttendance: (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    remarks: string,
    actor: string
  ) => void;

  // Results workflow
  saveStudentResult: (
    payload: {
      examId: string;
      studentId: string;
      scores: Array<{ subjectCode: string; subjectName: string; obtainedMarks: number }>;
      status: StudentResult['status'];
    },
    actor: string,
    role: UserRole
  ) => void;
  updateResultStatus: (resultId: string, status: StudentResult['status'], actor: string) => void;

  // Admissions
  submitAdmission: (app: Omit<AdmissionApplication, 'id' | 'applicationNo' | 'submittedDate' | 'status' | 'documentsStatus'>) => AdmissionApplication;
  updateAdmissionStatus: (id: string, status: AdmissionApplication['status'], note: string, actor: string) => void;

  // Fees (Simulated Payment)
  simulateFeePayment: (feeId: string, actor: string) => void;

  // SMS Notice
  sendSimulatedSms: (
    payload: {
      recipientName: string;
      recipientPhone: string;
      recipientGroup: SmsLog['recipientGroup'];
      message: string;
    },
    actor: string
  ) => void;

  // Website Content & Settings
  updateWebsiteContent: (patch: Partial<WebsiteContentConfig>, actor: string) => void;

  // Managing Committee CRUD
  addCommitteeMember: (member: Omit<CommitteeMember, 'id'>, actor: string) => void;
  updateCommitteeMember: (id: string, patch: Partial<CommitteeMember>, actor: string) => void;
  deleteCommitteeMember: (id: string, actor: string) => void;

  // Contact Inquiries (Public Contact + Parent Portal -> Admin Inbox)
  addInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt'>) => void;
  updateInquiryStatus: (id: string, status: ContactInquiry['status'], replyNote: string, actor: string) => void;
  deleteInquiry: (id: string, actor: string) => void;

  // Routine, Syllabus, Calendar, Library, Events, Class Notes
  addRoutineEntry: (entry: Omit<RoutineEntry, 'id'>, actor: string) => void;
  deleteRoutineEntry: (id: string, actor: string) => void;
  deleteSyllabus: (id: string, actor: string) => void;
  addCalendarEvent: (ev: Omit<CalendarEvent, 'id'>, actor: string) => void;
  deleteCalendarEvent: (id: string, actor: string) => void;
  addLibraryBook: (book: Omit<LibraryBook, 'id'>, actor: string) => void;
  toggleLibraryBookAvailability: (id: string, actor: string) => void;
  deleteLibraryBook: (id: string, actor: string) => void;
  addSchoolEvent: (ev: Omit<SchoolEvent, 'id'>, actor: string) => void;
  deleteSchoolEvent: (id: string, actor: string) => void;
  addClassNote: (note: Omit<ClassNote, 'id'>, actor: string) => void;
  deleteClassNote: (id: string, actor: string) => void;
  enrollApprovedAdmission: (admissionId: string, actor: string) => void;

  // Smart RFID / Attendance & Accountant Finance
  bulkMarkClassAttendance: (studentIds: string[], date: string, status: AttendanceStatus, actor: string) => void;
  sendAbsentGuardiansSms: (studentIds: string[], date: string, actor: string) => number;
  createFeeInvoice: (
    payload: {
      studentId: string;
      monthOrTerm: string;
      tuitionFee: number;
      examFee: number;
      labAndActivityFee: number;
      dueDate: string;
    },
    actor: string
  ) => void;
  addFinanceTransaction: (tx: Omit<FinanceTransaction, 'id' | 'voucherNo'>, actor: string) => void;
  deleteFinanceTransaction: (id: string, actor: string) => void;

  resetDemoData: () => void;
}

const SchoolStoreContext = createContext<SchoolStoreContextValue | null>(null);

let uniqueIdSeq = 0;

function nextUniqueId(prefix: string): string {
  uniqueIdSeq += 1;
  return `${prefix}-${Date.now()}-${uniqueIdSeq}`;
}

function makeTimestamp(): string {
  const now = new Date();
  return now.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function SchoolStoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SchoolDatabaseSnapshot>(() => databaseRepository.load());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    databaseRepository.save(db);
  }, [db]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const appendAudit = (
    prev: SchoolDatabaseSnapshot,
    user: string,
    role: UserRole,
    module: string,
    action: string
  ) => [
    {
      id: nextUniqueId('aud'),
      user,
      role,
      module,
      action,
      timestamp: makeTimestamp(),
    },
    ...prev.auditLogs,
  ];

  const logAudit = useCallback((user: string, role: UserRole, module: string, action: string) => {
    setDb((prev) => ({ ...prev, auditLogs: appendAudit(prev, user, role, module, action) }));
  }, []);

  const addTeacher = useCallback(
    (teacher: Omit<Teacher, 'id'>, actor: string) => {
      const id = `tch-${Date.now()}`;
      setDb((prev) => ({
        ...prev,
        teachers: [{ ...teacher, id }, ...prev.teachers],
        auditLogs: appendAudit(prev, actor, 'admin', 'Teachers', `নতুন শিক্ষক যুক্ত হয়েছে: ${teacher.nameBn}`),
      }));
      addToast('success', 'শিক্ষক যুক্ত হয়েছে', teacher.nameBn);
    },
    [addToast]
  );

  const updateTeacher = useCallback(
    (id: string, patch: Partial<Teacher>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        teachers: prev.teachers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        auditLogs: appendAudit(prev, actor, 'admin', 'Teachers', `শিক্ষকের তথ্য হালনাগাদ (${id})`),
      }));
      addToast('success', 'তথ্য হালনাগাদ হয়েছে');
    },
    [addToast]
  );

  const deleteTeacher = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        teachers: prev.teachers.filter((t) => t.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Teachers', `শিক্ষক রেকর্ড মুছে ফেলা হয়েছে (${id})`),
      }));
      addToast('info', 'শিক্ষক রেকর্ড মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const addStudent = useCallback(
    (student: Omit<Student, 'id'>, actor: string) => {
      const id = `stu-${Date.now()}`;
      setDb((prev) => {
        const cleanPhone = student.guardianPhone.replace(/\D/g, '');
        const existingGuardian = prev.guardians.find(
          (g) => g.phone.replace(/\D/g, '') === cleanPhone && cleanPhone.length >= 10
        );
        const guardianId = existingGuardian ? existingGuardian.id : student.guardianId || `grd-${Date.now()}`;
        const nextGuardians = existingGuardian
          ? prev.guardians.map((g) =>
              g.id === existingGuardian.id
                ? {
                    ...g,
                    studentIds: g.studentIds.includes(student.studentId)
                      ? g.studentIds
                      : [...g.studentIds, student.studentId],
                  }
                : g
            )
          : [
              {
                id: guardianId,
                name: student.guardianName,
                nameBn: student.guardianNameBn || student.guardianName,
                relation: 'অভিভাবক',
                phone: student.guardianPhone,
                email: '',
                occupation: student.guardianOccupation || 'অভিভাবক',
                address: student.address,
                studentIds: [student.studentId],
              },
              ...prev.guardians,
            ];

        const cleanRfid = student.rfidCardId?.trim().toUpperCase();
        const nextRfidCards =
          cleanRfid && !prev.rfidCards.some((c) => c.cardUid.toUpperCase() === cleanRfid)
            ? [
                {
                  id: `rfid-${Date.now()}`,
                  cardUid: cleanRfid,
                  studentId: student.studentId,
                  studentName: student.nameBn,
                  className: student.className,
                  section: student.section,
                  issuedDate: new Date().toISOString().slice(0, 10),
                  status: 'Active' as const,
                },
                ...prev.rfidCards,
              ]
            : prev.rfidCards;

        return {
          ...prev,
          students: [
            {
              ...student,
              id,
              guardianId,
              rfidCardId: cleanRfid || undefined,
              photoUrl: resolveStudentPhotoUrl(student),
            },
            ...prev.students,
          ],
          guardians: nextGuardians,
          rfidCards: nextRfidCards,
          auditLogs: appendAudit(
            prev,
            actor,
            'admin',
            'Students',
            `নতুন শিক্ষার্থী ভর্তি ও নিবন্ধন: ${student.nameBn} (${student.studentId}, ${student.className} রোল ${student.roll})`
          ),
        };
      });
      addToast('success', 'নতুন শিক্ষার্থী সংরক্ষিত হয়েছে', `${student.nameBn} (${student.studentId})`);
    },
    [addToast]
  );

  const updateStudent = useCallback(
    (id: string, patch: Partial<Student>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        students: prev.students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        auditLogs: appendAudit(prev, actor, 'admin', 'Students', `শিক্ষার্থীর তথ্য হালনাগাদ (${id})`),
      }));
      addToast('success', 'শিক্ষার্থীর তথ্য হালনাগাদ হয়েছে');
    },
    [addToast]
  );

  const deleteStudent = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Students', `শিক্ষার্থী রেকর্ড মুছে ফেলা হয়েছে (${id})`),
      }));
      addToast('info', 'শিক্ষার্থী রেকর্ড মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const addStaff = useCallback(
    (member: Omit<StaffMember, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        staff: [{ ...member, id: `stf-${Date.now()}` }, ...prev.staff],
        auditLogs: appendAudit(prev, actor, 'admin', 'Staff', `নতুন কর্মকর্তা/কর্মচারী যুক্ত: ${member.nameBn}`),
      }));
      addToast('success', 'কর্মকর্তা/কর্মচারী যুক্ত হয়েছে', member.nameBn);
    },
    [addToast]
  );

  const updateStaff = useCallback(
    (id: string, patch: Partial<StaffMember>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        staff: prev.staff.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        auditLogs: appendAudit(prev, actor, 'admin', 'Staff', `কর্মকর্তা/কর্মচারীর তথ্য হালনাগাদ (${id})`),
      }));
      addToast('success', 'কর্মকর্তা/কর্মচারীর তথ্য হালনাগাদ হয়েছে');
    },
    [addToast]
  );

  const deleteStaff = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        staff: prev.staff.filter((m) => m.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Staff', `কর্মকর্তা/কর্মচারী রেকর্ড অপসারণ (${id})`),
      }));
      addToast('info', 'কর্মকর্তা/কর্মচারী তালিকা থেকে অপসারণ করা হয়েছে');
    },
    [addToast]
  );

  const toggleStaffStatus = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        staff: prev.staff.map((m) =>
          m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
        ),
        auditLogs: appendAudit(prev, actor, 'admin', 'Staff', `কর্মচারীর অবস্থা পরিবর্তন (${id})`),
      }));
      addToast('info', 'স্ট্যাটাস পরিবর্তন করা হয়েছে');
    },
    [addToast]
  );

  const updateGuardian = useCallback(
    (id: string, patch: Partial<Guardian>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        guardians: prev.guardians.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        auditLogs: appendAudit(prev, actor, 'parent', 'Profile', `অভিভাবক প্রোফাইল হালনাগাদ (${id})`),
      }));
      addToast('success', 'অভিভাবক প্রোফাইল হালনাগাদ হয়েছে');
    },
    [addToast]
  );

  const addNotice = useCallback(
    (notice: Omit<Notice, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        notices: [{ ...notice, id: `not-${Date.now()}` }, ...prev.notices],
        auditLogs: appendAudit(prev, actor, 'admin', 'Notices', `Created notice: ${notice.title}`),
      }));
      addToast('success', 'নতুন নোটিশ প্রকাশ হয়েছে', notice.titleBn);
    },
    [addToast]
  );

  const updateNoticeStatus = useCallback(
    (id: string, status: Notice['status'], actor: string) => {
      setDb((prev) => ({
        ...prev,
        notices: prev.notices.map((n) => (n.id === id ? { ...n, status } : n)),
        auditLogs: appendAudit(prev, actor, 'admin', 'Notices', `Changed notice ${id} to ${status}`),
      }));
      addToast('success', `নোটিশ স্ট্যাটাস: ${status}`);
    },
    [addToast]
  );

  const deleteNotice = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        notices: prev.notices.filter((n) => n.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Notices', `Deleted notice (${id})`),
      }));
      addToast('info', 'নোটিশ মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const addSyllabus = useCallback(
    (item: Omit<SyllabusItem, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        syllabus: [{ ...item, id: `syl-${Date.now()}` }, ...prev.syllabus],
        auditLogs: appendAudit(prev, actor, 'admin', 'Syllabus', `Added syllabus for ${item.className} - ${item.subject}`),
      }));
      addToast('success', 'সিলেবাস সংরক্ষণ করা হয়েছে');
    },
    [addToast]
  );

  const addExam = useCallback(
    (exam: Omit<Exam, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        exams: [{ ...exam, id: `ex-${Date.now()}` }, ...prev.exams],
        auditLogs: appendAudit(prev, actor, 'admin', 'Exams', `Created exam: ${exam.name}`),
      }));
      addToast('success', 'নতুন পরীক্ষা যুক্ত হয়েছে', exam.nameBn);
    },
    [addToast]
  );

  const assignRfidCard = useCallback(
    (cardUid: string, studentId: string, actor: string): { ok: boolean; message: string } => {
      const cleanUid = cardUid.trim().toUpperCase();
      if (!cleanUid) return { ok: false, message: 'সঠিক RFID কার্ড আইডি দিন।' };
      const student = db.students.find((s) => s.studentId === studentId);
      if (!student) return { ok: false, message: 'শিক্ষার্থী খুঁজে পাওয়া যায়নি।' };
      const exists = db.rfidCards.find((c) => c.cardUid.toUpperCase() === cleanUid && c.studentId !== studentId);
      if (exists) {
        return { ok: false, message: `কার্ড ${cleanUid} ইতিমধ্যে ${exists.studentName}-এর নামে নিবন্ধিত।` };
      }

      const newCard: RfidCard = {
        id: `rfid-${Date.now()}`,
        cardUid: cleanUid,
        studentId: student.studentId,
        studentName: student.name,
        className: student.className,
        section: student.section,
        issuedDate: new Date().toISOString().slice(0, 10),
        status: 'Active',
      };

      setDb((prev) => ({
        ...prev,
        rfidCards: [newCard, ...prev.rfidCards.filter((c) => c.studentId !== studentId)],
        students: prev.students.map((s) =>
          s.studentId === studentId ? { ...s, rfidCardId: cleanUid } : s
        ),
        auditLogs: appendAudit(prev, actor, 'admin', 'RFID', `Assigned RFID ${cleanUid} to ${studentId}`),
      }));
      addToast('success', 'RFID কার্ড বরাদ্দ সম্পন্ন', `${cleanUid} → ${student.name}`);
      return { ok: true, message: 'কার্ড সফলভাবে বরাদ্দ করা হয়েছে।' };
    },
    [db.students, db.rfidCards, addToast]
  );

  const updateRfidCardStatus = useCallback(
    (cardId: string, status: RfidCard['status'], actor: string) => {
      setDb((prev) => ({
        ...prev,
        rfidCards: prev.rfidCards.map((c) => (c.id === cardId ? { ...c, status } : c)),
        auditLogs: appendAudit(prev, actor, 'admin', 'RFID', `Updated card ${cardId} status to ${status}`),
      }));
      addToast('info', `RFID কার্ড স্ট্যাটাস: ${status}`);
    },
    [addToast]
  );

  const simulateRfidScan = useCallback(
    (
      cardUid: string,
      direction: ScanDirection,
      scanTimeLabel: string,
      scanMinutes: number,
      date: string,
      actor: string
    ) => {
      const cleanUid = cardUid.trim().toUpperCase();
      const card = db.rfidCards.find((c) => c.cardUid.toUpperCase() === cleanUid);
      if (!card) {
        return { ok: false, message: `অনিবন্ধিত কার্ড (${cleanUid})। অনুগ্রহ করে আগে শিক্ষার্থীকে কার্ড বরাদ্দ করুন।` };
      }
      if (card.status !== 'Active') {
        return { ok: false, message: `কার্ড ${cleanUid} বর্তমানে "${card.status}" অবস্থায় আছে। সক্রিয় কার্ড ব্যবহার করুন।` };
      }

      const student = db.students.find((s) => s.studentId === card.studentId);
      if (!student) {
        return { ok: false, message: 'কার্ডের সাথে যুক্ত শিক্ষার্থী রেকর্ড পাওয়া যায়নি।' };
      }

      const check = checkRfidDuplicateScan(db.attendance, student.studentId, date, direction, scanMinutes);
      if (!check.allowed) {
        return { ok: false, message: check.reason || 'ডুপ্লিকেট স্ক্যান প্রতিরোধ করা হয়েছে।' };
      }

      const existing = db.attendance.find((a) => a.studentId === student.studentId && a.date === date);
      const isLate = direction === 'ENTRY' && scanMinutes > 605; // after 10:05 AM
      const updatedRecord: AttendanceRecord = existing
        ? {
            ...existing,
            exitTime: direction === 'EXIT' ? scanTimeLabel : existing.exitTime,
            status: direction === 'EXIT' ? 'Exited' : existing.status,
            source: 'RFID',
            cardUid: cleanUid,
          }
        : {
            id: nextUniqueId(`att-${student.studentId}`),
            studentId: student.studentId,
            studentName: student.name,
            className: student.className,
            section: student.section,
            date,
            entryTime: scanTimeLabel,
            status: isLate ? 'Late' : 'Present',
            source: 'RFID',
            cardUid: cleanUid,
          };

      const smsMessage = rfidService.formatSmsMessage(student, direction, scanTimeLabel);
      const smsLog: SmsLog = {
        id: nextUniqueId(`sms-${student.studentId}`),
        recipientName: student.guardianName,
        recipientPhone: student.guardianPhone,
        recipientGroup: 'Guardian',
        message: smsMessage,
        trigger: direction === 'ENTRY' ? 'RFID_ENTRY' : 'RFID_EXIT',
        timestamp: `${date} ${scanTimeLabel}`,
        deliveryStatus: 'Delivered',
      };

      setDb((prev) => ({
        ...prev,
        attendance: existing
          ? prev.attendance.map((a) => (a.id === existing.id ? updatedRecord : a))
          : [updatedRecord, ...prev.attendance],
        rfidCards: prev.rfidCards.map((c) =>
          c.id === card.id ? { ...c, lastScannedAt: `${date} ${scanTimeLabel}` } : c
        ),
        smsLogs: [smsLog, ...prev.smsLogs],
        auditLogs: appendAudit(
          prev,
          actor,
          'admin',
          'RFID Attendance',
          `RFID ${direction} স্ক্যান: ${student.studentId} (${cleanUid}) ও অভিভাবক SMS প্রেরিত`
        ),
      }));

      addToast(
        'success',
        `RFID ${direction} সফল হয়েছে`,
        `${student.nameBn} · ${scanTimeLabel} · অভিভাবককে SMS পাঠানো হয়েছে`
      );
      return {
        ok: true,
        message: `${student.nameBn} (${student.studentId})-এর ${direction} সফলভাবে নথিভুক্ত হয়েছে।`,
        record: updatedRecord,
        sms: smsLog,
      };
    },
    [db.rfidCards, db.students, db.attendance, addToast]
  );

  const saveManualAttendance = useCallback(
    (studentId: string, date: string, status: AttendanceStatus, remarks: string, actor: string) => {
      const student = db.students.find((s) => s.studentId === studentId);
      if (!student) return;
      setDb((prev) => {
        const existing = prev.attendance.find((a) => a.studentId === studentId && a.date === date);
        const rec: AttendanceRecord = existing
          ? { ...existing, status, remarks, source: 'Manual' }
          : {
              id: nextUniqueId(`att-${student.studentId}`),
              studentId: student.studentId,
              studentName: student.name,
              className: student.className,
              section: student.section,
              date,
              entryTime: status === 'Present' || status === 'Late' ? '10:00 AM' : undefined,
              status,
              source: 'Manual',
              remarks,
            };
        return {
          ...prev,
          attendance: existing
            ? prev.attendance.map((a) => (a.id === existing.id ? rec : a))
            : [rec, ...prev.attendance],
          auditLogs: appendAudit(prev, actor, 'admin', 'Attendance', `Manual correction: ${studentId} -> ${status}`),
        };
      });
      addToast('success', 'উপস্থিতি হালনাগাদ হয়েছে', `${student.name} → ${status}`);
    },
    [db.students, addToast]
  );

  const saveStudentResult = useCallback(
    (
      payload: {
        examId: string;
        studentId: string;
        scores: Array<{ subjectCode: string; subjectName: string; obtainedMarks: number }>;
        status: StudentResult['status'];
      },
      actor: string,
      role: UserRole
    ) => {
      const student = db.students.find((s) => s.studentId === payload.studentId);
      const exam = db.exams.find((e) => e.id === payload.examId);
      if (!student || !exam) return;

      const computed = computeOverallResult(
        payload.scores.map((s) => ({
          subjectCode: s.subjectCode,
          subjectName: s.subjectName,
          fullMarks: 100,
          passMarks: 33,
          obtainedMarks: s.obtainedMarks,
        }))
      );

      setDb((prev) => {
        const existing = prev.results.find(
          (r) => r.examId === payload.examId && r.studentId === payload.studentId
        );
        const record: StudentResult = {
          id: existing?.id || `res-${Date.now()}`,
          examId: exam.id,
          examName: exam.name,
          academicYear: exam.academicYear,
          studentId: student.studentId,
          studentName: student.name,
          studentNameBn: student.nameBn,
          className: student.className,
          section: student.section,
          roll: student.roll,
          marks: computed.marks,
          totalMarks: computed.totalMarks,
          gpa: computed.gpa,
          overallGrade: computed.overallGrade,
          passed: computed.passed,
          status: payload.status,
          updatedBy: actor,
          updatedAt: new Date().toISOString().slice(0, 10),
        };

        return {
          ...prev,
          results: existing
            ? prev.results.map((r) => (r.id === existing.id ? record : r))
            : [record, ...prev.results],
          auditLogs: appendAudit(
            prev,
            actor,
            role,
            'Results',
            `Saved result (${payload.status}) for ${student.studentId} in ${exam.name} (GPA ${computed.gpa.toFixed(2)})`
          ),
        };
      });

      addToast(
        'success',
        payload.status === 'Draft' ? 'নম্বর ড্রাফট সংরক্ষিত হয়েছে' : `ফলাফল সংরক্ষিত (${payload.status})`,
        `${student.nameBn} · GPA ${computed.gpa.toFixed(2)} (${computed.overallGrade})`
      );
    },
    [db.students, db.exams, addToast]
  );

  const updateResultStatus = useCallback(
    (resultId: string, status: StudentResult['status'], actor: string) => {
      setDb((prev) => ({
        ...prev,
        results: prev.results.map((r) =>
          r.id === resultId ? { ...r, status, updatedBy: actor, updatedAt: new Date().toISOString().slice(0, 10) } : r
        ),
        auditLogs: appendAudit(prev, actor, 'admin', 'Results', `Marked result ${resultId} as ${status}`),
      }));
      addToast('success', `ফলাফল স্ট্যাটাস: ${status}`);
    },
    [addToast]
  );

  const submitAdmission = useCallback(
    (
      app: Omit<AdmissionApplication, 'id' | 'applicationNo' | 'submittedDate' | 'status' | 'documentsStatus'>
    ) => {
      const appNo = `BUTPHS-ADM-2027-${String(db.admissions.length + 1).padStart(3, '0')}`;
      const created: AdmissionApplication = {
        ...app,
        id: `adm-${Date.now()}`,
        applicationNo: appNo,
        documentsStatus: 'সংযুক্ত',
        submittedDate: new Date().toISOString().slice(0, 10),
        status: 'Pending',
      };
      setDb((prev) => ({
        ...prev,
        admissions: [created, ...prev.admissions],
        auditLogs: appendAudit(prev, 'অনলাইন আবেদনকারী', 'parent', 'Admissions', `অনলাইন ভর্তি আবেদন জমা: ${appNo}`),
      }));
      addToast('success', 'অনলাইন ভর্তি আবেদন জমা হয়েছে', `আবেদন নম্বর: ${appNo}`);
      return created;
    },
    [db.admissions.length, addToast]
  );

  const updateAdmissionStatus = useCallback(
    (id: string, status: AdmissionApplication['status'], note: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        admissions: prev.admissions.map((a) =>
          a.id === id ? { ...a, status, reviewNote: note || a.reviewNote } : a
        ),
        auditLogs: appendAudit(prev, actor, 'admin', 'Admissions', `ভর্তি আবেদন স্ট্যাটাস আপডেট (${id}) → ${status}`),
      }));
      addToast('success', `ভর্তি আবেদন স্ট্যাটাস: ${status}`);
    },
    [addToast]
  );

  const simulateFeePayment = useCallback(
    (feeId: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        fees: prev.fees.map((f) =>
          f.id === feeId
            ? {
                ...f,
                paidAmount: f.totalAmount,
                dueAmount: 0,
                status: 'Paid',
                paidDate: new Date().toISOString().slice(0, 10),
                method: 'অনলাইন ব্যাংকিং (সোনালী ই-সেবা)',
              }
            : f
        ),
        auditLogs: appendAudit(prev, actor, 'parent', 'Fees', `বেতন ও ফি পরিশোধ সম্পন্ন (${feeId})`),
      }));
      addToast('success', 'ফি পরিশোধ সফল হয়েছে', 'ডিজিটাল রসিদ হালনাগাদ করা হয়েছে।');
    },
    [addToast]
  );

  const sendSimulatedSms = useCallback(
    (
      payload: {
        recipientName: string;
        recipientPhone: string;
        recipientGroup: SmsLog['recipientGroup'];
        message: string;
      },
      actor: string
    ) => {
      const log: SmsLog = {
        id: `sms-${Date.now()}`,
        recipientName: payload.recipientName,
        recipientPhone: payload.recipientPhone,
        recipientGroup: payload.recipientGroup,
        message: payload.message,
        trigger: 'MANUAL_NOTICE',
        timestamp: makeTimestamp(),
        deliveryStatus: 'Delivered',
      };
      setDb((prev) => ({
        ...prev,
        smsLogs: [log, ...prev.smsLogs],
        auditLogs: appendAudit(prev, actor, 'admin', 'SMS Notice', `SMS বিজ্ঞপ্তি প্রেরিত: ${payload.recipientGroup}`),
      }));
      addToast('success', 'SMS বিজ্ঞপ্তি প্রেরিত হয়েছে', `${payload.recipientGroup} · সফলভাবে প্রেরিত`);
    },
    [addToast]
  );

  const updateWebsiteContent = useCallback(
    (patch: Partial<WebsiteContentConfig>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        websiteContent: { ...prev.websiteContent, ...patch },
        auditLogs: appendAudit(prev, actor, 'admin', 'Website Content', 'ওয়েবসাইটের হোমপেজ ও প্রাতিষ্ঠানিক তথ্য হালনাগাদ'),
      }));
      addToast('success', 'ওয়েবসাইট কনটেন্ট সংরক্ষণ করা হয়েছে');
    },
    [addToast]
  );

  const addCommitteeMember = useCallback(
    (member: Omit<CommitteeMember, 'id'>, actor: string) => {
      const id = `mc-${Date.now()}`;
      setDb((prev) => ({
        ...prev,
        committeeMembers: [...prev.committeeMembers, { ...member, id }],
        auditLogs: appendAudit(prev, actor, 'admin', 'Managing Committee', `নতুন পরিচালনা পর্ষদ সদস্য যুক্ত: ${member.nameBn}`),
      }));
      addToast('success', 'পরিচালনা পর্ষদ সদস্য যুক্ত হয়েছে', member.nameBn);
    },
    [addToast]
  );

  const updateCommitteeMember = useCallback(
    (id: string, patch: Partial<CommitteeMember>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        committeeMembers: prev.committeeMembers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        auditLogs: appendAudit(prev, actor, 'admin', 'Managing Committee', `পরিচালনা পর্ষদ সদস্যের তথ্য হালনাগাদ (${id})`),
      }));
      addToast('success', 'সদস্যের তথ্য হালনাগাদ হয়েছে');
    },
    [addToast]
  );

  const deleteCommitteeMember = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        committeeMembers: prev.committeeMembers.filter((m) => m.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Managing Committee', `পরিচালনা পর্ষদ সদস্য অপসারণ (${id})`),
      }));
      addToast('info', 'সদস্য তালিকা থেকে অপসারণ করা হয়েছে');
    },
    [addToast]
  );

  const addInquiry = useCallback(
    (inquiry: Omit<ContactInquiry, 'id' | 'createdAt'>) => {
      const created: ContactInquiry = {
        ...inquiry,
        id: `inq-${Date.now()}`,
        createdAt: makeTimestamp(),
      };
      setDb((prev) => ({
        ...prev,
        inquiries: [created, ...prev.inquiries],
        auditLogs: appendAudit(prev, inquiry.senderName, 'parent', 'Contact Helpdesk', `নতুন জিজ্ঞাসা জমা: ${inquiry.subject}`),
      }));
      addToast('success', 'আপনার বার্তা সফলভাবে বিদ্যালয় অফিসে পাঠানো হয়েছে');
    },
    [addToast]
  );

  const updateInquiryStatus = useCallback(
    (id: string, status: ContactInquiry['status'], replyNote: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        inquiries: prev.inquiries.map((inq) =>
          inq.id === id ? { ...inq, status, replyNote: replyNote || inq.replyNote, repliedBy: actor } : inq
        ),
        auditLogs: appendAudit(prev, actor, 'admin', 'Contact Helpdesk', `অভিভাবক জিজ্ঞাসা হালনাগাদ (${id}) → ${status}`),
      }));
      addToast('success', `জিজ্ঞাসার অবস্থা হালনাগাদ: ${status}`);
    },
    [addToast]
  );

  const deleteInquiry = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        inquiries: prev.inquiries.filter((i) => i.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Contact Helpdesk', `জিজ্ঞাসা রেকর্ড মুছে ফেলা হয়েছে (${id})`),
      }));
      addToast('info', 'জিজ্ঞাসা মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const addRoutineEntry = useCallback(
    (entry: Omit<RoutineEntry, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        routines: [{ ...entry, id: `rt-${Date.now()}` }, ...prev.routines],
        auditLogs: appendAudit(prev, actor, 'admin', 'Class Routine', `নতুন রুটিন পিরিয়ড যুক্ত: ${entry.className} · ${entry.subject}`),
      }));
      addToast('success', 'ক্লাস রুটিন হালনাগাদ হয়েছে', `${entry.className} · ${entry.subject}`);
    },
    [addToast]
  );

  const deleteRoutineEntry = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        routines: prev.routines.filter((r) => r.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Class Routine', `রুটিন পিরিয়ড অপসারণ (${id})`),
      }));
      addToast('info', 'রুটিন পিরিয়ড মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const deleteSyllabus = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        syllabus: prev.syllabus.filter((s) => s.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Syllabus', `সিলেবাস অপসারণ (${id})`),
      }));
      addToast('info', 'সিলেবাস মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const addCalendarEvent = useCallback(
    (ev: Omit<CalendarEvent, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        calendar: [...prev.calendar, { ...ev, id: `cal-${Date.now()}` }].sort((a, b) => a.date.localeCompare(b.date)),
        auditLogs: appendAudit(prev, actor, 'admin', 'Calendar', `একাডেমিক ক্যালেন্ডার ইভেন্ট যুক্ত: ${ev.titleBn}`),
      }));
      addToast('success', 'ক্যালেন্ডার ইভেন্ট যুক্ত হয়েছে', ev.titleBn);
    },
    [addToast]
  );

  const deleteCalendarEvent = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        calendar: prev.calendar.filter((c) => c.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Calendar', `ক্যালেন্ডার ইভেন্ট মুছে ফেলা হয়েছে (${id})`),
      }));
      addToast('info', 'ক্যালেন্ডার ইভেন্ট মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const addLibraryBook = useCallback(
    (book: Omit<LibraryBook, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        libraryBooks: [{ ...book, id: `lib-${Date.now()}` }, ...prev.libraryBooks],
        auditLogs: appendAudit(prev, actor, 'admin', 'Library', `গ্রন্থাগারে নতুন বই যুক্ত: ${book.titleBn}`),
      }));
      addToast('success', 'গ্রন্থাগারে বই যুক্ত হয়েছে', book.titleBn);
    },
    [addToast]
  );

  const toggleLibraryBookAvailability = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        libraryBooks: prev.libraryBooks.map((b) =>
          b.id === id
            ? { ...b, availableCopies: b.availableCopies > 0 ? b.availableCopies - 1 : b.totalCopies }
            : b
        ),
        auditLogs: appendAudit(prev, actor, 'admin', 'Library', `বইয়ের প্রাপ্যতা হালনাগাদ (${id})`),
      }));
      addToast('info', 'বইয়ের স্টক সংখ্যা হালনাগাদ হয়েছে');
    },
    [addToast]
  );

  const deleteLibraryBook = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        libraryBooks: prev.libraryBooks.filter((b) => b.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Library', `গ্রন্থাগার থেকে বই অপসারণ (${id})`),
      }));
      addToast('info', 'বইটি তালিকা থেকে অপসারণ করা হয়েছে');
    },
    [addToast]
  );

  const addSchoolEvent = useCallback(
    (ev: Omit<SchoolEvent, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        events: [{ ...ev, id: `evt-${Date.now()}` }, ...prev.events],
        auditLogs: appendAudit(prev, actor, 'admin', 'Media & Events', `নতুন ক্যাম্পাস ইভেন্ট যুক্ত: ${ev.titleBn}`),
      }));
      addToast('success', 'নতুন ইভেন্ট ও গ্যালারি আইটেম প্রকাশ হয়েছে', ev.titleBn);
    },
    [addToast]
  );

  const deleteSchoolEvent = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== id),
        auditLogs: appendAudit(prev, actor, 'admin', 'Media & Events', `ইভেন্ট অপসারণ (${id})`),
      }));
      addToast('info', 'ইভেন্ট মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const addClassNote = useCallback(
    (note: Omit<ClassNote, 'id'>, actor: string) => {
      setDb((prev) => ({
        ...prev,
        classNotes: [{ ...note, id: `cn-${Date.now()}` }, ...prev.classNotes],
        auditLogs: appendAudit(prev, actor, 'teacher', 'Class Notes', `নতুন পাঠ-নির্দেশনা প্রকাশ: ${note.className} · ${note.titleBn}`),
      }));
      addToast('success', 'শ্রেণি পাঠ-নির্দেশনা প্রকাশ হয়েছে', `${note.className} · ${note.subject}`);
    },
    [addToast]
  );

  const deleteClassNote = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        classNotes: prev.classNotes.filter((n) => n.id !== id),
        auditLogs: appendAudit(prev, actor, 'teacher', 'Class Notes', `পাঠ-নির্দেশনা মুছে ফেলা হয়েছে (${id})`),
      }));
      addToast('info', 'পাঠ-নির্দেশনা মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const enrollApprovedAdmission = useCallback(
    (admissionId: string, actor: string) => {
      const app = db.admissions.find((a) => a.id === admissionId);
      if (!app) return;
      const newStudentId = `BUTPHS-2027-${String(db.students.length + 101)}`;
      const newStudent: Student = {
        id: `stu-${Date.now()}`,
        studentId: newStudentId,
        roll: db.students.filter((s) => s.className === app.applyingClass).length + 1,
        name: app.applicantName,
        nameBn: app.applicantNameBn,
        className: app.applyingClass,
        section: 'A (পদ্মা)',
        group: 'General',
        session: '2027',
        gender: app.gender || 'Male',
        dateOfBirth: app.dateOfBirth,
        bloodGroup: 'O+',
        guardianId: `grd-${Date.now()}`,
        guardianName: app.guardianName,
        guardianPhone: app.guardianPhone,
        address: app.address,
        photoUrl: resolveStudentPhotoUrl({ gender: app.gender || 'Male', className: app.applyingClass }),
        status: 'Active',
      };
      setDb((prev) => ({
        ...prev,
        students: [newStudent, ...prev.students],
        admissions: prev.admissions.map((a) =>
          a.id === admissionId
            ? { ...a, status: 'Approved', reviewNote: `শিক্ষার্থী হিসেবে ভর্তি সম্পন্ন (${newStudentId})` }
            : a
        ),
        auditLogs: appendAudit(prev, actor, 'admin', 'Admissions', `ভর্তি আবেদন ${app.applicationNo} থেকে শিক্ষার্থী নিবন্ধন (${newStudentId})`),
      }));
      addToast('success', 'শিক্ষার্থী হিসেবে চূড়ান্ত ভর্তি সম্পন্ন', `${app.applicantNameBn} · আইডি: ${newStudentId}`);
    },
    [db.admissions, db.students, addToast]
  );

  const bulkMarkClassAttendance = useCallback(
    (studentIds: string[], date: string, status: AttendanceStatus, actor: string) => {
      if (studentIds.length === 0) return;
      const nowTime = status === 'Present' ? '09:50 AM' : status === 'Late' ? '10:15 AM' : undefined;
      setDb((prev) => {
        let updated = [...prev.attendance];
        studentIds.forEach((stuId) => {
          const student = prev.students.find((s) => s.studentId === stuId);
          if (!student) return;
          const idx = updated.findIndex((a) => a.studentId === stuId && a.date === date);
          if (idx >= 0) {
            updated[idx] = {
              ...updated[idx],
              status,
              entryTime: updated[idx].entryTime || nowTime,
              source: 'Manual',
            };
          } else {
            updated.unshift({
              id: nextUniqueId(`att-${stuId}`),
              studentId: student.studentId,
              studentName: student.nameBn,
              className: student.className,
              section: student.section,
              date,
              entryTime: nowTime,
              status,
              source: 'Manual',
            });
          }
        });
        return {
          ...prev,
          attendance: updated,
          auditLogs: appendAudit(
            prev,
            actor,
            'admin',
            'Attendance',
            `${date} তারিখে ${studentIds.length} জন শিক্ষার্থীর হাজিরা "${status}" হিসেবে হালনাগাদ`
          ),
        };
      });
      addToast('success', 'একযোগে হাজিরা হালনাগাদ সম্পন্ন', `${studentIds.length} জন শিক্ষার্থী (${date})`);
    },
    [addToast]
  );

  const sendAbsentGuardiansSms = useCallback(
    (studentIds: string[], date: string, actor: string) => {
      if (studentIds.length === 0) return 0;
      const targets = db.students.filter((s) => studentIds.includes(s.studentId));
      if (targets.length === 0) return 0;
      const timestamp = makeTimestamp();
      const logs: SmsLog[] = targets.map((stu, idx) => ({
        id: `sms-abs-${Date.now()}-${idx}`,
        recipientName: stu.guardianName,
        recipientPhone: stu.guardianPhone,
        recipientGroup: 'Guardian',
        message: `প্রিয় অভিভাবক, আপনার সন্তান ${stu.nameBn} (${stu.className}, রোল ${stu.roll}) আজ (${date}) বিদ্যালয়ে অনুপস্থিত রয়েছে। অনুগ্রহ করে শ্রেণি শিক্ষকের সাথে যোগাযোগ করুন। — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়`,
        trigger: 'MANUAL_NOTICE',
        timestamp,
        deliveryStatus: 'Simulated Delivered',
      }));
      setDb((prev) => ({
        ...prev,
        smsLogs: [...logs, ...prev.smsLogs],
        auditLogs: appendAudit(prev, actor, 'admin', 'Attendance SMS', `${targets.length} জন অনুপস্থিত শিক্ষার্থীর অভিভাবককে SMS পাঠানো হয়েছে`),
      }));
      addToast('success', 'অনুপস্থিতির SMS পাঠানো হয়েছে', `${targets.length} জন অভিভাবককে তাৎক্ষণিক বার্তা প্রেরিত`);
      return targets.length;
    },
    [db.students, addToast]
  );

  const createFeeInvoice = useCallback(
    (
      payload: {
        studentId: string;
        monthOrTerm: string;
        tuitionFee: number;
        examFee: number;
        labAndActivityFee: number;
        dueDate: string;
      },
      actor: string
    ) => {
      const stu = db.students.find((s) => s.studentId === payload.studentId);
      if (!stu) return;
      const total = payload.tuitionFee + payload.examFee + payload.labAndActivityFee;
      const invoiceNo = `INV-2026-${String(db.fees.length + 101)}`;
      const record: FeeRecord = {
        id: `fee-${Date.now()}`,
        invoiceNo,
        studentId: stu.studentId,
        studentName: stu.nameBn,
        className: stu.className,
        monthOrTerm: payload.monthOrTerm,
        tuitionFee: payload.tuitionFee,
        examFee: payload.examFee,
        labAndActivityFee: payload.labAndActivityFee,
        totalAmount: total,
        paidAmount: 0,
        dueAmount: total,
        dueDate: payload.dueDate,
        status: 'Due',
      };
      setDb((prev) => ({
        ...prev,
        fees: [record, ...prev.fees],
        auditLogs: appendAudit(prev, actor, 'accountant', 'Fees', `নতুন ফি চালান তৈরি: ${invoiceNo} (${stu.nameBn}, ৳${total})`),
      }));
      addToast('success', 'নতুন ফি চালান তৈরি হয়েছে', `${invoiceNo} · ${stu.nameBn}`);
    },
    [db.students, db.fees.length, addToast]
  );

  const addFinanceTransaction = useCallback(
    (tx: Omit<FinanceTransaction, 'id' | 'voucherNo'>, actor: string) => {
      const voucherNo = `${tx.type === 'Income' ? 'INC' : 'EXP'}-2026-${String(db.financeTransactions.length + 101)}`;
      const entry: FinanceTransaction = {
        ...tx,
        id: `fin-${Date.now()}`,
        voucherNo,
      };
      setDb((prev) => ({
        ...prev,
        financeTransactions: [entry, ...prev.financeTransactions],
        auditLogs: appendAudit(prev, actor, 'accountant', 'Accounts', `${tx.type === 'Income' ? 'আয়' : 'ব্যয়'} ভাউচার যুক্ত: ${voucherNo} (৳${tx.amount})`),
      }));
      addToast('success', 'ভাউচার সংরক্ষিত হয়েছে', `${voucherNo} · ${tx.category}`);
    },
    [db.financeTransactions.length, addToast]
  );

  const deleteFinanceTransaction = useCallback(
    (id: string, actor: string) => {
      setDb((prev) => ({
        ...prev,
        financeTransactions: prev.financeTransactions.filter((t) => t.id !== id),
        auditLogs: appendAudit(prev, actor, 'accountant', 'Accounts', `ভাউচার (${id}) অপসারণ করা হয়েছে`),
      }));
      addToast('info', 'ভাউচার তালিকা থেকে মুছে ফেলা হয়েছে');
    },
    [addToast]
  );

  const resetDemoData = useCallback(() => {
    const fresh = databaseRepository.reset();
    setDb(fresh);
    addToast('info', 'প্রাতিষ্ঠানিক ডেটাবেস পুনরায় লোড করা হয়েছে');
  }, [addToast]);

  return (
    <SchoolStoreContext.Provider
      value={{
        db,
        toasts,
        addToast,
        dismissToast,
        logAudit,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addStudent,
        updateStudent,
        deleteStudent,
        addStaff,
        updateStaff,
        deleteStaff,
        toggleStaffStatus,
        updateGuardian,
        addNotice,
        updateNoticeStatus,
        deleteNotice,
        addSyllabus,
        addExam,
        assignRfidCard,
        updateRfidCardStatus,
        simulateRfidScan,
        saveManualAttendance,
        saveStudentResult,
        updateResultStatus,
        submitAdmission,
        updateAdmissionStatus,
        simulateFeePayment,
        sendSimulatedSms,
        updateWebsiteContent,
        addCommitteeMember,
        updateCommitteeMember,
        deleteCommitteeMember,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        addRoutineEntry,
        deleteRoutineEntry,
        deleteSyllabus,
        addCalendarEvent,
        deleteCalendarEvent,
        addLibraryBook,
        toggleLibraryBookAvailability,
        deleteLibraryBook,
        addSchoolEvent,
        deleteSchoolEvent,
        addClassNote,
        deleteClassNote,
        enrollApprovedAdmission,
        bulkMarkClassAttendance,
        sendAbsentGuardiansSms,
        createFeeInvoice,
        addFinanceTransaction,
        deleteFinanceTransaction,
        resetDemoData,
      }}
    >
      {children}
    </SchoolStoreContext.Provider>
  );
}

export function useSchoolStore() {
  const ctx = useContext(SchoolStoreContext);
  if (!ctx) throw new Error('useSchoolStore must be used inside SchoolStoreProvider');
  return ctx;
}
