import type { CommitteeCategory, CommitteeMember, ContactInquiry } from '../types';

export const COMMITTEE_FILTER_CATEGORIES: Array<'ALL' | CommitteeCategory> = [
  'ALL',
  'সভাপতি ও নেতৃত্ব',
  'অভিভাবক প্রতিনিধি',
  'শিক্ষক প্রতিনিধি',
  'দাতা ও প্রতিষ্ঠাতা',
];

export function filterCommitteeMembers(
  members: CommitteeMember[],
  category: 'ALL' | CommitteeCategory,
  query: string
): CommitteeMember[] {
  const sorted = [...members].sort((a, b) => a.priorityOrder - b.priorityOrder);
  const q = query.trim().toLowerCase();

  return sorted.filter((m) => {
    if (category !== 'ALL' && m.category !== category) return false;
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.nameBn.includes(query.trim()) ||
      m.role.toLowerCase().includes(q) ||
      m.roleBn.includes(query.trim()) ||
      m.professionBn.includes(query.trim())
    );
  });
}

export interface InquiryInput {
  senderName: string;
  phone: string;
  subject: string;
  message: string;
  source: ContactInquiry['source'];
}

export function validateAndBuildInquiry(
  input: InquiryInput
): { ok: true; inquiry: Omit<ContactInquiry, 'id' | 'createdAt'> } | { ok: false; error: string } {
  const senderName = input.senderName.trim();
  const phone = input.phone.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (senderName.length < 2) {
    return { ok: false, error: 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।' };
  }
  if (subject.length < 2) {
    return { ok: false, error: 'অনুগ্রহ করে বার্তার বিষয়টি লিখুন।' };
  }
  if (message.length < 6) {
    return { ok: false, error: 'অনুগ্রহ করে বিস্তারিত বার্তা লিখুন (কমপক্ষে ৬ অক্ষর)।' };
  }

  return {
    ok: true,
    inquiry: {
      senderName,
      phone: phone || 'উল্লেখ করা হয়নি',
      subject,
      message,
      source: input.source,
      status: 'New',
    },
  };
}

export function filterInquiries(
  inquiries: ContactInquiry[],
  status: 'All' | ContactInquiry['status'],
  query: string
): ContactInquiry[] {
  const q = query.trim().toLowerCase();
  return inquiries.filter((item) => {
    if (status !== 'All' && item.status !== status) return false;
    if (!q) return true;
    return (
      item.senderName.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q)
    );
  });
}

export function computePendingActionsSummary(input: {
  admissions?: Array<{ status: string }>;
  inquiries?: Array<{ status: string }>;
  results?: Array<{ status: string }>;
  fees?: Array<{ dueAmount: number }>;
}) {
  return {
    pendingAdmissions: (input.admissions ?? []).filter((a) => a.status === 'Pending' || a.status === 'Under Review').length,
    unreadInquiries: (input.inquiries ?? []).filter((i) => i.status === 'New').length,
    unpublishedResults: (input.results ?? []).filter((r) => r.status !== 'Published').length,
    dueFeeInvoices: (input.fees ?? []).filter((f) => f.dueAmount > 0).length,
  };
}

export interface DailyAttendanceRosterRow {
  studentId: string;
  roll: number;
  nameBn: string;
  name: string;
  className: string;
  section: string;
  guardianPhone: string;
  rfidCardUid?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Exited' | 'Unmarked';
  entryTime?: string;
  exitTime?: string;
  source?: 'RFID' | 'Manual';
  remarks?: string;
}

export function buildDailyAttendanceRoster(params: {
  students: Array<{
    studentId: string;
    roll: number;
    nameBn: string;
    name: string;
    className: string;
    section: string;
    guardianPhone: string;
    rfidCardId?: string;
    status: string;
  }>;
  attendance: Array<{
    studentId: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Exited';
    entryTime?: string;
    exitTime?: string;
    source: 'RFID' | 'Manual';
    remarks?: string;
  }>;
  date: string;
  className: string;
  section: string;
  statusFilter: 'ALL' | 'Present' | 'Late' | 'Absent' | 'Unmarked';
  query: string;
}): {
  rows: DailyAttendanceRosterRow[];
  stats: {
    total: number;
    present: number;
    late: number;
    absent: number;
    unmarked: number;
    ratePct: number;
  };
} {
  const q = params.query.trim().toLowerCase();
  const baseStudents = params.students
    .filter((s) => s.status === 'Active')
    .filter((s) => (params.className === 'ALL' ? true : s.className === params.className))
    .filter((s) => (params.section === 'ALL' ? true : s.section === params.section))
    .sort((a, b) => a.className.localeCompare(b.className) || a.roll - b.roll);

  const byStudent = new Map(
    params.attendance.filter((a) => a.date === params.date).map((a) => [a.studentId, a])
  );

  const allRows: DailyAttendanceRosterRow[] = baseStudents.map((s) => {
    const rec = byStudent.get(s.studentId);
    return {
      studentId: s.studentId,
      roll: s.roll,
      nameBn: s.nameBn,
      name: s.name,
      className: s.className,
      section: s.section,
      guardianPhone: s.guardianPhone,
      rfidCardUid: s.rfidCardId,
      status: rec ? rec.status : 'Unmarked',
      entryTime: rec?.entryTime,
      exitTime: rec?.exitTime,
      source: rec?.source,
      remarks: rec?.remarks,
    };
  });

  const present = allRows.filter((r) => r.status === 'Present' || r.status === 'Exited').length;
  const late = allRows.filter((r) => r.status === 'Late').length;
  const absent = allRows.filter((r) => r.status === 'Absent').length;
  const unmarked = allRows.filter((r) => r.status === 'Unmarked').length;
  const total = allRows.length;
  const ratePct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  const rows = allRows.filter((r) => {
    if (params.statusFilter !== 'ALL') {
      if (params.statusFilter === 'Present') {
        if (r.status !== 'Present' && r.status !== 'Exited') return false;
      } else if (r.status !== params.statusFilter) {
        return false;
      }
    }
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.nameBn.includes(params.query.trim()) ||
      r.studentId.toLowerCase().includes(q) ||
      String(r.roll) === q ||
      (r.rfidCardUid || '').toLowerCase().includes(q)
    );
  });

  return {
    rows,
    stats: { total, present, late, absent, unmarked, ratePct },
  };
}

export function computeAccountantSummary(params: {
  fees: Array<{ totalAmount: number; paidAmount: number; dueAmount: number; status: string }>;
  transactions: Array<{ type: 'Income' | 'Expense'; amount: number }>;
}) {
  const feeBilled = params.fees.reduce((sum, f) => sum + f.totalAmount, 0);
  const feeCollected = params.fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const feeDue = params.fees.reduce((sum, f) => sum + f.dueAmount, 0);
  const otherIncome = params.transactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = params.transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = feeCollected + otherIncome;
  const netBalance = totalIncome - totalExpense;
  const collectionRatePct = feeBilled > 0 ? Math.round((feeCollected / feeBilled) * 100) : 0;
  const dueCount = params.fees.filter((f) => f.dueAmount > 0).length;

  return {
    feeBilled,
    feeCollected,
    feeDue,
    otherIncome,
    totalIncome,
    totalExpense,
    netBalance,
    collectionRatePct,
    dueCount,
  };
}
