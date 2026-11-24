import type { Notice } from '../types';

export type NoticeTabKey = 'all' | 'urgent' | 'exam' | 'admission' | 'admission_academic';
export type NoticeFilterTab = NoticeTabKey;

export const NOTICE_TABS: Array<{ key: NoticeTabKey; labelBn: string; labelEn: string }> = [
  { key: 'all', labelBn: 'সব বিজ্ঞপ্তি', labelEn: 'All' },
  { key: 'urgent', labelBn: 'জরুরি', labelEn: 'Urgent' },
  { key: 'exam', labelBn: 'পরীক্ষা ও ফলাফল', labelEn: 'Exam & Result' },
  { key: 'admission', labelBn: 'ভর্তি ও একাডেমিক', labelEn: 'Admission & Academic' },
];

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function formatBanglaCalendarTile(isoDate: string): {
  monthBn: string;
  dayBn: string;
  yearBn: string;
  fullBn: string;
} {
  const parts = isoDate.split('-');
  if (parts.length !== 3) {
    return {
      monthBn: 'বিজ্ঞপ্তি',
      dayBn: '--',
      yearBn: '২০২৬',
      fullBn: isoDate,
    };
  }
  const year = Number(parts[0]);
  const monthIdx = Math.max(0, Math.min(11, Number(parts[1]) - 1));
  const day = Number(parts[2]);

  const monthBn = BN_MONTHS[monthIdx] || 'নভেম্বর';
  const dayBn = toBanglaDigits(day);
  const yearBn = toBanglaDigits(year);

  return {
    monthBn,
    dayBn,
    yearBn,
    fullBn: `${dayBn} ${monthBn} ${yearBn}`,
  };
}

export function getNoticeMemoNo(notice: Notice, fallbackIndex = 1): string {
  if (notice.memoNo && notice.memoNo.trim()) {
    return notice.memoNo;
  }
  const catMap: Record<Notice['category'], string> = {
    Exam: 'পরীক্ষা',
    Admission: 'ভর্তি',
    Academic: 'একাডেমিক',
    Event: 'অনুষ্ঠান',
    Holiday: 'ছুটি',
    General: 'সাধারণ',
  };
  const seq = toBanglaDigits(String(70 + fallbackIndex).padStart(3, '0'));
  return `বিউতপ্রউবি/${catMap[notice.category]}/২০২৬/${seq}`;
}

export function getNoticeCategoryBn(category: Notice['category']): string {
  const catMap: Record<Notice['category'], string> = {
    Exam: 'পরীক্ষা ও ফলাফল',
    Admission: 'ভর্তি সংক্রান্ত',
    Academic: 'একাডেমিক',
    Event: 'অনুষ্ঠান',
    Holiday: 'ছুটি',
    General: 'সাধারণ',
  };
  return catMap[category] || 'সাধারণ';
}

export function filterNoticesByTabAndQuery(
  notices: Notice[],
  tab: NoticeTabKey,
  query: string
): Notice[] {
  const normalizedQuery = query.trim().toLowerCase();

  return notices.filter((notice) => {
    if (notice.status !== 'Published') return false;

    if (tab === 'urgent' && !notice.isUrgent) {
      return false;
    }
    if (tab === 'exam' && notice.category !== 'Exam') {
      return false;
    }
    if (
      (tab === 'admission' || tab === 'admission_academic') &&
      notice.category !== 'Admission' &&
      notice.category !== 'Academic'
    ) {
      return false;
    }

    if (normalizedQuery) {
      const memo = (notice.memoNo || '').toLowerCase();
      const matches =
        notice.title.toLowerCase().includes(normalizedQuery) ||
        notice.titleBn.toLowerCase().includes(normalizedQuery) ||
        notice.summary.toLowerCase().includes(normalizedQuery) ||
        notice.content.toLowerCase().includes(normalizedQuery) ||
        memo.includes(normalizedQuery);
      if (!matches) return false;
    }

    return true;
  });
}

export function getNoticeCategoryBreakdown(notices: Notice[]): Array<{
  key: NoticeTabKey;
  labelBn: string;
  count: number;
  percentage: number;
}> {
  const published = notices.filter((n) => n.status === 'Published');
  const total = Math.max(1, published.length);

  const urgentCount = published.filter((n) => n.isUrgent).length;
  const examCount = published.filter((n) => n.category === 'Exam').length;
  const admissionAcademicCount = published.filter(
    (n) => n.category === 'Admission' || n.category === 'Academic'
  ).length;
  const otherCount = published.filter(
    (n) => n.category === 'Event' || n.category === 'Holiday' || n.category === 'General'
  ).length;

  return [
    {
      key: 'urgent',
      labelBn: 'জরুরি বিজ্ঞপ্তি',
      count: urgentCount,
      percentage: Math.round((urgentCount / total) * 100),
    },
    {
      key: 'exam',
      labelBn: 'পরীক্ষা ও ফলাফল',
      count: examCount,
      percentage: Math.round((examCount / total) * 100),
    },
    {
      key: 'admission',
      labelBn: 'ভর্তি ও একাডেমিক',
      count: admissionAcademicCount,
      percentage: Math.round((admissionAcademicCount / total) * 100),
    },
    {
      key: 'all',
      labelBn: 'অনুষ্ঠান ও সাধারণ',
      count: otherCount,
      percentage: Math.round((otherCount / total) * 100),
    },
  ];
}
