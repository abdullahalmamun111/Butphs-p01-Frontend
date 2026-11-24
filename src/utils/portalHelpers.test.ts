import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDailyAttendanceRoster,
  computeAccountantSummary,
  computePendingActionsSummary,
  filterCommitteeMembers,
  filterInquiries,
  validateAndBuildInquiry,
} from './portalHelpers';
import type { CommitteeMember, ContactInquiry } from '../types';

const SAMPLE_COMMITTEE: CommitteeMember[] = [
  {
    id: 'mc-2',
    name: 'Md. Shafiqul Islam',
    nameBn: 'মোঃ শফিকুল ইসলাম',
    role: 'Member Secretary',
    roleBn: 'সদস্য সচিব ও প্রধান শিক্ষক',
    category: 'সভাপতি ও নেতৃত্ব',
    tenure: 'পদাধিকারবলে',
    professionBn: 'প্রধান শিক্ষক',
    educationBn: 'এম.এসসি, বি.এড',
    phone: '01711-000188',
    photoUrl: '/test.jpg',
    bioBn: 'শিক্ষা প্রশাসক',
    responsibilities: ['একাডেমিক সমন্বয়'],
    priorityOrder: 2,
  },
  {
    id: 'mc-1',
    name: 'Alhaj Md. Nazrul Islam Molla',
    nameBn: 'আলহাজ্ব মোঃ নজরুল ইসলাম মোল্লা',
    role: 'Chairman',
    roleBn: 'সভাপতি, বিদ্যালয় পরিচালনা পর্ষদ',
    category: 'সভাপতি ও নেতৃত্ব',
    tenure: '২০২৫–২০২৭',
    professionBn: 'সমাজসেবক ও শিক্ষানুরাগী',
    educationBn: 'স্নাতকোত্তর',
    phone: '01711-000181',
    photoUrl: '/test2.jpg',
    bioBn: 'সভাপতি',
    responsibilities: ['নীতি নির্ধারণ'],
    priorityOrder: 1,
  },
  {
    id: 'mc-3',
    name: 'Md. Abul Kalam Azad',
    nameBn: 'মোঃ আবুল কালাম আজাদ',
    role: 'Guardian Representative',
    roleBn: 'অভিভাবক সদস্য',
    category: 'অভিভাবক প্রতিনিধি',
    tenure: '২০২৫–২০২৭',
    professionBn: 'ব্যবসায়ী ও অভিভাবক',
    educationBn: 'স্নাতক',
    phone: '01712-000301',
    photoUrl: '/test3.jpg',
    bioBn: 'অভিভাবক প্রতিনিধি',
    responsibilities: ['অভিভাবক সমন্বয়'],
    priorityOrder: 3,
  },
];

test('filterCommitteeMembers sorts by priorityOrder and filters by category & query', () => {
  const all = filterCommitteeMembers(SAMPLE_COMMITTEE, 'ALL', '');
  assert.equal(all.length, 3);
  assert.equal(all[0].id, 'mc-1');
  assert.equal(all[1].id, 'mc-2');

  const guardians = filterCommitteeMembers(SAMPLE_COMMITTEE, 'অভিভাবক প্রতিনিধি', '');
  assert.equal(guardians.length, 1);
  assert.equal(guardians[0].id, 'mc-3');

  const byQuery = filterCommitteeMembers(SAMPLE_COMMITTEE, 'ALL', 'নজরুল');
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'mc-1');
});

test('validateAndBuildInquiry enforces required fields and trims values', () => {
  const bad = validateAndBuildInquiry({
    senderName: 'ক',
    phone: '',
    subject: 'ভর্তি',
    message: 'বিস্তারিত জানতে চাই',
    source: 'Public Contact',
  });
  assert.equal(bad.ok, false);

  const ok = validateAndBuildInquiry({
    senderName: ' মোঃ জহিরুল ইসলাম ',
    phone: '01715000111',
    subject: ' ৬ষ্ঠ শ্রেণির ভর্তি ',
    message: ' অনলাইন ভর্তি আবেদন সংক্রান্ত তথ্য জানতে চাই। ',
    source: 'Public Contact',
  });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.inquiry.senderName, 'মোঃ জহিরুল ইসলাম');
    assert.equal(ok.inquiry.status, 'New');
  }
});

test('filterInquiries filters by status and search text', () => {
  const list: ContactInquiry[] = [
    {
      id: 'inq-1',
      senderName: 'মোঃ সাইফুল ইসলাম',
      phone: '01715223344',
      subject: 'ভর্তি পরীক্ষা',
      message: '৬ষ্ঠ শ্রেণির ভর্তি পরীক্ষা কবে?',
      source: 'Public Contact',
      createdAt: '2026-11-20',
      status: 'New',
    },
    {
      id: 'inq-2',
      senderName: 'সালমা খাতুন',
      phone: '01718990011',
      subject: 'টিসি আবেদন',
      message: 'ছাড়পত্রের নিয়ম জানতে চাই।',
      source: 'Parent Portal',
      createdAt: '2026-11-19',
      status: 'Resolved',
    },
  ];

  assert.equal(filterInquiries(list, 'New', '').length, 1);
  assert.equal(filterInquiries(list, 'All', 'টিসি').length, 1);
});

test('computePendingActionsSummary counts pending items accurately', () => {
  const summary = computePendingActionsSummary({
    admissions: [{ status: 'Pending' }, { status: 'Approved' }, { status: 'Under Review' }],
    inquiries: [{ status: 'New' }, { status: 'Resolved' }],
    results: [{ status: 'Draft' }, { status: 'Published' }, { status: 'Verified' }],
    fees: [{ dueAmount: 450 }, { dueAmount: 0 }],
  });

  assert.deepEqual(summary, {
    pendingAdmissions: 2,
    unreadInquiries: 1,
    unpublishedResults: 2,
    dueFeeInvoices: 1,
  });
});

test('buildDailyAttendanceRoster filters by date, class, section, status and computes stats', () => {
  const res = buildDailyAttendanceRoster({
    students: [
      { studentId: 'S1', roll: 1, nameBn: 'রাফিউল', name: 'Rafiul', className: 'Class 10', section: 'A (পদ্মা)', guardianPhone: '01711', rfidCardId: 'RFID-1', status: 'Active' },
      { studentId: 'S2', roll: 2, nameBn: 'নুসরাত', name: 'Nusrat', className: 'Class 10', section: 'A (পদ্মা)', guardianPhone: '01712', rfidCardId: 'RFID-2', status: 'Active' },
      { studentId: 'S3', roll: 3, nameBn: 'তানভীর', name: 'Tanvir', className: 'Class 9', section: 'B (মেঘনা)', guardianPhone: '01713', status: 'Active' },
    ],
    attendance: [
      { studentId: 'S1', date: '2026-11-20', status: 'Present', entryTime: '09:45 AM', source: 'RFID' },
      { studentId: 'S2', date: '2026-11-20', status: 'Absent', source: 'Manual' },
    ],
    date: '2026-11-20',
    className: 'Class 10',
    section: 'A (পদ্মা)',
    statusFilter: 'ALL',
    query: '',
  });
  assert.equal(res.rows.length, 2);
  assert.equal(res.stats.total, 2);
  assert.equal(res.stats.present, 1);
  assert.equal(res.stats.absent, 1);
  assert.equal(res.stats.ratePct, 50);
});

test('computeAccountantSummary computes collection rate, total income, expense and net balance', () => {
  const fin = computeAccountantSummary({
    fees: [
      { totalAmount: 1000, paidAmount: 1000, dueAmount: 0, status: 'Paid' },
      { totalAmount: 1000, paidAmount: 500, dueAmount: 500, status: 'Partial' },
    ],
    transactions: [
      { type: 'Income', amount: 5000 },
      { type: 'Expense', amount: 2500 },
    ],
  });
  assert.equal(fin.feeCollected, 1500);
  assert.equal(fin.feeDue, 500);
  assert.equal(fin.collectionRatePct, 75);
  assert.equal(fin.totalIncome, 6500);
  assert.equal(fin.totalExpense, 2500);
  assert.equal(fin.netBalance, 4000);
  assert.equal(fin.dueCount, 1);
});
