import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterNoticesByTabAndQuery,
  formatBanglaCalendarTile,
  getNoticeCategoryBreakdown,
  toBanglaDigits,
} from './noticeUtils';
import type { Notice } from '../types';

const SAMPLE_NOTICES: Notice[] = [
  {
    id: 'n1',
    memoNo: 'বিউতপ্রউবি/পরীক্ষা/২০২৬/০৮৪',
    isUrgent: true,
    title: 'Annual Examination 2026 Schedule',
    titleBn: 'বার্ষিক পরীক্ষা ২০২৬ সময়সূচি',
    category: 'Exam',
    date: '2026-11-18',
    summary: 'Exam schedule',
    content: 'Exam instructions',
    attachmentName: 'exam.pdf',
    status: 'Published',
    publishedBy: 'Office',
  },
  {
    id: 'n2',
    memoNo: 'বিউতপ্রউবি/ভর্তি/২০২৬/০৮১',
    isUrgent: false,
    title: 'Admission 2027 Notice',
    titleBn: 'ভর্তি বিজ্ঞপ্তি ২০২৭',
    category: 'Admission',
    date: '2026-11-15',
    summary: 'Online admission',
    content: 'Apply online',
    attachmentName: 'adm.pdf',
    status: 'Published',
    publishedBy: 'Office',
  },
  {
    id: 'n3',
    memoNo: 'বিউতপ্রউবি/একাডেমিক/২০২৬/০৭৪',
    isUrgent: false,
    title: 'Guardian Assembly',
    titleBn: 'অভিভাবক সমাবেশ',
    category: 'Academic',
    date: '2026-11-05',
    summary: 'Guardian meeting',
    content: 'Class 9 and 10 guardians',
    attachmentName: 'meeting.pdf',
    status: 'Published',
    publishedBy: 'Office',
  },
  {
    id: 'n4',
    memoNo: 'বিউতপ্রউবি/সাধারণ/২০২৬/০৯০',
    isUrgent: true,
    title: 'Draft Internal Memo',
    titleBn: 'খসড়া নোটিশ',
    category: 'Exam',
    date: '2026-11-19',
    summary: 'Hidden draft',
    content: 'Draft',
    attachmentName: 'draft.pdf',
    status: 'Draft',
    publishedBy: 'Office',
  },
];

test('toBanglaDigits converts ASCII numerals to Bangla script numerals', () => {
  assert.equal(toBanglaDigits('2026-11-18'), '২০২৬-১১-১৮');
});

test('formatBanglaCalendarTile formats ISO date into Bangla month, day, and year', () => {
  const tile = formatBanglaCalendarTile('2026-11-18');
  assert.equal(tile.monthBn, 'নভেম্বর');
  assert.equal(tile.dayBn, '১৮');
  assert.equal(tile.yearBn, '২০২৬');
  assert.equal(tile.fullBn, '১৮ নভেম্বর ২০২৬');
});

test('filterNoticesByTabAndQuery filters published notices by urgent, exam, admission, and memo search', () => {
  assert.equal(filterNoticesByTabAndQuery(SAMPLE_NOTICES, 'all', '').length, 3);
  assert.equal(filterNoticesByTabAndQuery(SAMPLE_NOTICES, 'urgent', '').length, 1);
  assert.equal(filterNoticesByTabAndQuery(SAMPLE_NOTICES, 'exam', '').length, 1);
  assert.equal(filterNoticesByTabAndQuery(SAMPLE_NOTICES, 'admission', '').length, 2);

  const byMemo = filterNoticesByTabAndQuery(SAMPLE_NOTICES, 'all', '০৮১');
  assert.equal(byMemo.length, 1);
  assert.equal(byMemo[0].id, 'n2');

  const byBanglaWord = filterNoticesByTabAndQuery(SAMPLE_NOTICES, 'all', 'অভিভাবক');
  assert.equal(byBanglaWord.length, 1);
  assert.equal(byBanglaWord[0].id, 'n3');
});

test('getNoticeCategoryBreakdown calculates accurate counts across published notices', () => {
  const stats = getNoticeCategoryBreakdown(SAMPLE_NOTICES);
  const urgent = stats.find((s) => s.key === 'urgent');
  const admission = stats.find((s) => s.key === 'admission');
  assert.equal(urgent?.count, 1);
  assert.equal(admission?.count, 2);
});
