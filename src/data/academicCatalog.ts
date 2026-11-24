import type { RoutineEntry } from '../types';

export interface RoutinePeriodSlot {
  periodNo: number;
  labelBn: string;
  timeBn: string;
  timeEn: string;
}

export interface RoutineCell {
  subjectBn: string;
  subjectCode: string;
  teacherBn: string;
  roomBn: string;
  isLab?: boolean;
}

export interface WeeklyRoutineRow {
  dayBn: string;
  dayEn: string;
  beforeBreak: RoutineCell[]; // Periods 1-4
  afterBreak: RoutineCell[];  // Periods 5-6
}

export const ROUTINE_DAYS: Array<{ bn: string; en: string }> = [
  { bn: 'রবিবার', en: 'Sunday' },
  { bn: 'সোমবার', en: 'Monday' },
  { bn: 'মঙ্গলবার', en: 'Tuesday' },
  { bn: 'বুধবার', en: 'Wednesday' },
  { bn: 'বৃহস্পতিবার', en: 'Thursday' },
];

export const ROUTINE_PERIODS_BEFORE_BREAK: RoutinePeriodSlot[] = [
  { periodNo: 1, labelBn: '১ম পিরিয়ড', timeBn: '১০:০০ – ১০:৪৫', timeEn: '10:00–10:45' },
  { periodNo: 2, labelBn: '২য় পিরিয়ড', timeBn: '১০:৪৫ – ১১:৩০', timeEn: '10:45–11:30' },
  { periodNo: 3, labelBn: '৩য় পিরিয়ড', timeBn: '১১:৩০ – ১২:১৫', timeEn: '11:30–12:15' },
  { periodNo: 4, labelBn: '৪র্থ পিরিয়ড', timeBn: '১২:১৫ – ০১:০০', timeEn: '12:15–01:00' },
];

export const ROUTINE_PERIODS_AFTER_BREAK: RoutinePeriodSlot[] = [
  { periodNo: 5, labelBn: '৫ম পিরিয়ড', timeBn: '০১:৪৫ – ০২:৩০', timeEn: '01:45–02:30' },
  { periodNo: 6, labelBn: '৬ষ্ঠ পিরিয়ড', timeBn: '০২:৩০ – ০৩:১৫', timeEn: '02:30–03:15' },
];

export const ROUTINE_CLASS_OPTIONS = [
  { value: 'Class 6', labelBn: '৬ষ্ঠ শ্রেণি' },
  { value: 'Class 7', labelBn: '৭ম শ্রেণি' },
  { value: 'Class 8', labelBn: '৮ম শ্রেণি' },
  { value: 'Class 9', labelBn: '৯ম শ্রেণি' },
  { value: 'Class 10', labelBn: '১০ম শ্রেণি (এসএসসি)' },
];

export const ROUTINE_SECTION_OPTIONS = [
  { value: 'A (পদ্মা)', labelBn: 'শাখা ক (পদ্মা)' },
  { value: 'B (মেঘনা)', labelBn: 'শাখা খ (মেঘনা)' },
  { value: 'C (যমুনা)', labelBn: 'শাখা গ (যমুনা)' },
];

const ROOM_BY_CLASS_SECTION: Record<string, string> = {
  'Class 6|A (পদ্মা)': 'কক্ষ ১০১',
  'Class 6|B (মেঘনা)': 'কক্ষ ১০২',
  'Class 6|C (যমুনা)': 'কক্ষ ১০৩',
  'Class 7|A (পদ্মা)': 'কক্ষ ১০৪',
  'Class 7|B (মেঘনা)': 'কক্ষ ১০৫',
  'Class 7|C (যমুনা)': 'কক্ষ ১০৬',
  'Class 8|A (পদ্মা)': 'কক্ষ ২০১',
  'Class 8|B (মেঘনা)': 'কক্ষ ২০২',
  'Class 8|C (যমুনা)': 'কক্ষ ২০৩',
  'Class 9|A (পদ্মা)': 'কক্ষ ২০৪',
  'Class 9|B (মেঘনা)': 'কক্ষ ২০৫',
  'Class 9|C (যমুনা)': 'কক্ষ ২০৬',
  'Class 10|A (পদ্মা)': 'কক্ষ ৩০১',
  'Class 10|B (মেঘনা)': 'কক্ষ ৩০২',
  'Class 10|C (যমুনা)': 'কক্ষ ৩০৩',
};

function getSubjectPool(className: string, section: string): RoutineCell[] {
  const defaultRoom = ROOM_BY_CLASS_SECTION[`${className}|${section}`] || 'কক্ষ ২০১';

  if (section === 'C (যমুনা)' && (className === 'Class 9' || className === 'Class 10')) {
    return [
      { subjectBn: 'বাংলা (১ম ও ২য়)', subjectCode: '১০১', teacherBn: 'মোঃ রফিকুল ইসলাম', roomBn: defaultRoom },
      { subjectBn: 'ইংরেজি (১ম ও ২য়)', subjectCode: '১০৭', teacherBn: 'ফারজানা আক্তার', roomBn: defaultRoom },
      { subjectBn: 'সাধারণ গণিত', subjectCode: '১০৯', teacherBn: 'মোঃ আব্দুর রাজ্জাক', roomBn: defaultRoom },
      { subjectBn: 'হিসাববিজ্ঞান', subjectCode: '১৪৬', teacherBn: 'নাসরিন সুলতানা', roomBn: defaultRoom },
      { subjectBn: 'ফিন্যান্স ও ব্যাংকিং', subjectCode: '১৫২', teacherBn: 'শাহানা পারভীন', roomBn: defaultRoom },
      { subjectBn: 'ব্যবসায় উদ্যোগ', subjectCode: '১৪৩', teacherBn: 'মাহফুজুর রহমান', roomBn: defaultRoom },
      { subjectBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', subjectCode: '১৫৪', teacherBn: 'মোহাম্মদ কামরুজ্জামান', roomBn: 'আইসিটি ল্যাব', isLab: true },
      { subjectBn: 'সাধারণ বিজ্ঞান', subjectCode: '১২৭', teacherBn: 'ড. সঞ্জীব কুমার মণ্ডল', roomBn: 'বিজ্ঞান ল্যাব', isLab: true },
    ];
  }

  if (className === 'Class 9' || className === 'Class 10') {
    if (section === 'A (পদ্মা)') {
      // Science focus
      return [
        { subjectBn: 'বাংলা (১ম ও ২য়)', subjectCode: '১০১', teacherBn: 'মোঃ রফিকুল ইসলাম', roomBn: defaultRoom },
        { subjectBn: 'ইংরেজি (১ম ও ২য়)', subjectCode: '১০৭', teacherBn: 'ফারজানা আক্তার', roomBn: defaultRoom },
        { subjectBn: 'সাধারণ গণিত', subjectCode: '১০৯', teacherBn: 'তাহমিনা ইয়াসমিন', roomBn: defaultRoom },
        { subjectBn: 'পদার্থবিজ্ঞান', subjectCode: '১৩৬', teacherBn: 'ড. সঞ্জীব কুমার মণ্ডল', roomBn: 'বিজ্ঞান ল্যাব', isLab: true },
        { subjectBn: 'রসায়ন', subjectCode: '১৩৭', teacherBn: 'সুমাইয়া রহমান', roomBn: 'রসায়ন ল্যাব', isLab: true },
        { subjectBn: 'জীববিজ্ঞান / উচ্চতর গণিত', subjectCode: '১৩৮', teacherBn: 'মোঃ আব্দুর রাজ্জাক', roomBn: defaultRoom },
        { subjectBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', subjectCode: '১৫৪', teacherBn: 'মোহাম্মদ কামরুজ্জামান', roomBn: 'আইসিটি ল্যাব', isLab: true },
        { subjectBn: 'ধর্ম ও নৈতিক শিক্ষা', subjectCode: '১১১', teacherBn: 'মাহফুজুর রহমান', roomBn: defaultRoom },
      ];
    }
    // Humanities & Business focus
    return [
      { subjectBn: 'বাংলা (১ম ও ২য়)', subjectCode: '১০১', teacherBn: 'মোঃ রফিকুল ইসলাম', roomBn: defaultRoom },
      { subjectBn: 'ইংরেজি (১ম ও ২য়)', subjectCode: '১০৭', teacherBn: 'রুমানা হক', roomBn: defaultRoom },
      { subjectBn: 'সাধারণ গণিত', subjectCode: '১০৯', teacherBn: 'তাহমিনা ইয়াসমিন', roomBn: defaultRoom },
      { subjectBn: 'হিসাববিজ্ঞান / ইতিহাস', subjectCode: '১৪৬', teacherBn: 'নাসরিন সুলতানা', roomBn: defaultRoom },
      { subjectBn: 'ব্যবসায় উদ্যোগ / ভূগোল', subjectCode: '১৪৩', teacherBn: 'শাহানা পারভীন', roomBn: defaultRoom },
      { subjectBn: 'পৌরনীতি / ফিন্যান্স', subjectCode: '১৪০', teacherBn: 'মাহফুজুর রহমান', roomBn: defaultRoom },
      { subjectBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', subjectCode: '১৫৪', teacherBn: 'মোহাম্মদ কামরুজ্জামান', roomBn: 'আইসিটি ল্যাব', isLab: true },
      { subjectBn: 'কৃষি শিক্ষা / সাধারণ বিজ্ঞান', subjectCode: '১৩৪', teacherBn: 'সুমাইয়া রহমান', roomBn: defaultRoom },
    ];
  }

  // Junior Secondary (Classes 6-8)
  return [
    { subjectBn: 'বাংলা', subjectCode: '১০১', teacherBn: 'মোঃ রফিকুল ইসলাম', roomBn: defaultRoom },
    { subjectBn: 'ইংরেজি', subjectCode: '১০৭', teacherBn: 'ফারজানা আক্তার', roomBn: defaultRoom },
    { subjectBn: 'গণিত', subjectCode: '১০৯', teacherBn: 'তাহমিনা ইয়াসমিন', roomBn: defaultRoom },
    { subjectBn: 'সাধারণ বিজ্ঞান', subjectCode: '১২৭', teacherBn: 'ড. সঞ্জীব কুমার মণ্ডল', roomBn: 'বিজ্ঞান ল্যাব', isLab: true },
    { subjectBn: 'বাংলাদেশ ও বিশ্বপরিচয়', subjectCode: '১৫০', teacherBn: 'নাসরিন সুলতানা', roomBn: defaultRoom },
    { subjectBn: 'ডিজিটাল প্রযুক্তি (ICT)', subjectCode: '১৫৪', teacherBn: 'মোহাম্মদ কামরুজ্জামান', roomBn: 'আইসিটি ল্যাব', isLab: true },
    { subjectBn: 'ধর্ম ও নৈতিক শিক্ষা', subjectCode: '১১১', teacherBn: 'মাহফুজুর রহমান', roomBn: defaultRoom },
    { subjectBn: 'কৃষি ও শারীরিক শিক্ষা', subjectCode: '১৩৪', teacherBn: 'শাহানা পারভীন', roomBn: defaultRoom },
  ];
}

/**
 * Generates a full 5-day × 6-period (+ Tiffin break) weekly timetable matrix
 * for any BUTPHS class & section, deterministically rotating subjects and merging
 * any matching admin-saved RoutineItem overrides.
 */
export function getWeeklyRoutineMatrix(
  className: string,
  section: string,
  customRoutines: RoutineEntry[] = []
): WeeklyRoutineRow[] {
  const pool = getSubjectPool(className, section);
  const classOffset = Math.max(0, ROUTINE_CLASS_OPTIONS.findIndex((c) => c.value === className));
  const sectionOffset = Math.max(0, ROUTINE_SECTION_OPTIONS.findIndex((s) => s.value === section));

  const dayPatterns: number[][] = [
    [0, 1, 2, 3, 4, 5],
    [1, 2, 0, 4, 3, 6],
    [2, 0, 1, 5, 6, 7],
    [0, 3, 2, 1, 5, 4],
    [1, 0, 3, 2, 7, 6],
  ];

  return ROUTINE_DAYS.map((day, dayIdx) => {
    const pattern = dayPatterns[dayIdx];
    const cells: RoutineCell[] = pattern.map((slotIdx, periodIdx) => {
      const idx = (slotIdx + classOffset + sectionOffset) % pool.length;
      const baseCell = pool[idx];

      // Check if an admin custom routine matches this class/section/day/period
      const periodMatchStr = String(periodIdx + 1);
      const matchingCustom = customRoutines.find(
        (r) =>
          r.className === className &&
          r.section === section &&
          r.day === day.en &&
          r.period.includes(periodMatchStr)
      );

      if (matchingCustom) {
        return {
          subjectBn: matchingCustom.subject,
          subjectCode: baseCell.subjectCode,
          teacherBn: matchingCustom.teacherName,
          roomBn: matchingCustom.room,
          isLab: matchingCustom.room.toLowerCase().includes('lab') || matchingCustom.room.includes('ল্যাব'),
        };
      }
      return baseCell;
    });

    return {
      dayBn: day.bn,
      dayEn: day.en,
      beforeBreak: cells.slice(0, 4),
      afterBreak: cells.slice(4, 6),
    };
  });
}

// ---------------------------------------------------------------------------
// SMART SYLLABUS CATALOG
// ---------------------------------------------------------------------------

export type SyllabusGroup =
  | 'সকল বিভাগ'
  | 'বিজ্ঞান'
  | 'মানবিক'
  | 'ব্যবসায় শিক্ষা';

export type SyllabusExamTerm =
  | 'অর্ধবার্ষিক পরীক্ষা'
  | 'বার্ষিক পরীক্ষা'
  | 'নির্বাচনি (এসএসসি)';

export interface SmartSyllabusEntry {
  id: string;
  className: string;
  classLabelBn: string;
  group: SyllabusGroup;
  examTerm: SyllabusExamTerm;
  subjectCode: string;
  subjectNameBn: string;
  subjectNameEn: string;
  fullMarks: number;
  marksBreakdownBn: string;
  chaptersBn: string[];
  teacherNoteBn: string;
  updatedAtBn: string;
}

export const SYLLABUS_GROUPS: SyllabusGroup[] = [
  'সকল বিভাগ',
  'বিজ্ঞান',
  'মানবিক',
  'ব্যবসায় শিক্ষা',
];

export const SYLLABUS_EXAM_TERMS: SyllabusExamTerm[] = [
  'অর্ধবার্ষিক পরীক্ষা',
  'বার্ষিক পরীক্ষা',
  'নির্বাচনি (এসএসসি)',
];

export const SMART_SYLLABUS_CATALOG: SmartSyllabusEntry[] = [
  // Class 6
  {
    id: 'syl-c6-bn-h',
    className: 'Class 6',
    classLabelBn: '৬ষ্ঠ শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'অর্ধবার্ষিক পরীক্ষা',
    subjectCode: '১০১',
    subjectNameBn: 'বাংলা (১ম ও ২য় পত্র)',
    subjectNameEn: 'Bangla',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['গদ্য: সততার পুরস্কার, মিনু, নীলনদ আর পিরামিডের দেশ', 'পদ্য: জন্মভূমি, সুখ, মানুষ জাতি', 'ব্যাকরণ: ভাষা ও বাংলা ভাষা, ধ্বনিতত্ত্ব, সন্ধি ও পত্র লিখন'],
    teacherNoteBn: 'প্রতিটি অধ্যায়ের মূলভাব ও বানান শুদ্ধির ওপর বিশেষ গুরুত্ব দিতে হবে।',
    updatedAtBn: 'জানুয়ারি ২০২৬',
  },
  {
    id: 'syl-c6-math-h',
    className: 'Class 6',
    classLabelBn: '৬ষ্ঠ শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'অর্ধবার্ষিক পরীক্ষা',
    subjectCode: '১০৯',
    subjectNameBn: 'সাধারণ গণিত',
    subjectNameEn: 'Mathematics',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['অধ্যায় ১: স্বাভাবিক সংখ্যা ও ভগ্নাংশ', 'অধ্যায় ২: অনুপাত ও শতকরা', 'অধ্যায় ৪: বীজগণিতীয় রাশি ও সরল সমীকরণ', 'অধ্যায় ৬: জ্যামিতির মৌলিক ধারণা'],
    teacherNoteBn: 'প্রতি বৃহস্পতিবার শ্রেণিকক্ষে সাপ্তাহিক অনুশীলনী মূল্যায়ন অনুষ্ঠিত হয়।',
    updatedAtBn: 'জানুয়ারি ২০২৬',
  },
  {
    id: 'syl-c6-eng-a',
    className: 'Class 6',
    classLabelBn: '৬ষ্ঠ শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'বার্ষিক পরীক্ষা',
    subjectCode: '১০৭',
    subjectNameBn: 'ইংরেজি (১ম ও ২য় পত্র)',
    subjectNameEn: 'English',
    fullMarks: 100,
    marksBreakdownBn: 'Reading 40 + Grammar 30 + Writing 30',
    chaptersBn: ['English for Today: Lessons 12–28', 'Grammar: Parts of Speech, Tense, Articles, Prepositions', 'Composition: Paragraph, Formal Letter & Dialogue Writing'],
    teacherNoteBn: 'ইংরেজি রিডিং ও ভোকাবুলারি ডায়েরি নিয়মিত হালনাগাদ করতে হবে।',
    updatedAtBn: 'জুলাই ২০২৬',
  },
  {
    id: 'syl-c6-sci-a',
    className: 'Class 6',
    classLabelBn: '৬ষ্ঠ শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'বার্ষিক পরীক্ষা',
    subjectCode: '১২৭',
    subjectNameBn: 'সাধারণ বিজ্ঞান ও ডিজিটাল প্রযুক্তি',
    subjectNameEn: 'Science & ICT',
    fullMarks: 100,
    marksBreakdownBn: 'লিখিত ৭৫ + ব্যবহারিক/ল্যাব ২৫',
    chaptersBn: ['উদ্ভিদ ও প্রাণীর কোষীয় সংগঠন', 'তাপ, আলো ও শক্তির রূপান্তর', 'পরিবেশ ও প্রাকৃতিক ভারসাম্য', 'ডিজিটাল নিরাপত্তা ও কম্পিউটারের মৌলিক ব্যবহার'],
    teacherNoteBn: 'বিজ্ঞান ল্যাবে হাতে-কলমে অণুবীক্ষণ যন্ত্র পর্যবেক্ষণ বাধ্যতামূলক।',
    updatedAtBn: 'জুলাই ২০২৬',
  },
  // Class 7
  {
    id: 'syl-c7-math-h',
    className: 'Class 7',
    classLabelBn: '৭ম শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'অর্ধবার্ষিক পরীক্ষা',
    subjectCode: '১০৯',
    subjectNameBn: 'সাধারণ গণিত',
    subjectNameEn: 'Mathematics',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['মূলদ ও অমূলদ সংখ্যা', 'সমানুপাত ও লাভ-ক্ষতি', 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ', 'ত্রিভুজের সর্বসমতা ও সম্পাদ্য'],
    teacherNoteBn: 'জ্যামিতি অঙ্কনের সময় কম্পাস ও স্কেলের সঠিক ব্যবহার নিশ্চিত করতে হবে।',
    updatedAtBn: 'জানুয়ারি ২০২৬',
  },
  {
    id: 'syl-c7-sci-a',
    className: 'Class 7',
    classLabelBn: '৭ম শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'বার্ষিক পরীক্ষা',
    subjectCode: '১২৭',
    subjectNameBn: 'সাধারণ বিজ্ঞান',
    subjectNameEn: 'General Science',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['অণুজীব জগৎ ও উদ্ভিদের বাহ্যিক বৈশিষ্ট্য', 'পদার্থের গঠন ও রাসায়নিক পরিবর্তন', 'বিদ্যুৎ ও চুম্বকের ব্যবহার', 'জলবায়ু পরিবর্তন ও প্রাকৃতিক দুর্যোগ'],
    teacherNoteBn: 'প্রতিটি অধ্যায়ের চিত্রসহ ব্যাখ্যা অনুশীলন করতে হবে।',
    updatedAtBn: 'জুলাই ২০২৬',
  },
  // Class 8
  {
    id: 'syl-c8-math-h',
    className: 'Class 8',
    classLabelBn: '৮ম শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'অর্ধবার্ষিক পরীক্ষা',
    subjectCode: '১০৯',
    subjectNameBn: 'গণিত (প্যাটার্ন, মুনাফা ও জ্যামিতি)',
    subjectNameEn: 'Mathematics',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['অধ্যায় ১: প্যাটার্ন', 'অধ্যায় ২: সরল ও চক্রবৃদ্ধি মুনাফা', 'অধ্যায় ৪: বীজগণিতীয় সূত্রাবলি ও উৎপাদকে বিশ্লেষণ', 'অধ্যায় ৮: চতুর্ভুজ ও পিথাগোরাসের উপপাদ্য'],
    teacherNoteBn: '৮ম শ্রেণির বৃত্তি ও সমাপনী প্রস্তুতির জন্য মডেল প্রশ্ন অনুশীলন করা হবে।',
    updatedAtBn: 'জানুয়ারি ২০২৬',
  },
  {
    id: 'syl-c8-ict-a',
    className: 'Class 8',
    classLabelBn: '৮ম শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'বার্ষিক পরীক্ষা',
    subjectCode: '১৫৪',
    subjectNameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    subjectNameEn: 'ICT',
    fullMarks: 50,
    marksBreakdownBn: 'বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫',
    chaptersBn: ['কম্পিউটার নেটওয়ার্ক ও স্যাটেলাইট', 'সাইবার নিরাপত্তা ও নৈতিকতা', 'স্প্রেডশিট (MS Excel) ব্যবহার ও সূত্র প্রয়োগ', 'দৈনন্দিন জীবনে ইন্টারনেট ও ই-সেবা'],
    teacherNoteBn: 'শেখ রাসেল ডিজিটাল ল্যাবে স্প্রেডশিট ব্যবহারিক পরীক্ষা অনুষ্ঠিত হবে।',
    updatedAtBn: 'জুলাই ২০২৬',
  },
  // Class 9 - Science
  {
    id: 'syl-c9-phy-h',
    className: 'Class 9',
    classLabelBn: '৯ম শ্রেণি',
    group: 'বিজ্ঞান',
    examTerm: 'অর্ধবার্ষিক পরীক্ষা',
    subjectCode: '১৩৬',
    subjectNameBn: 'পদার্থবিজ্ঞান',
    subjectNameEn: 'Physics',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫',
    chaptersBn: ['অধ্যায় ১: ভৌত রাশি ও পরিমাপ', 'অধ্যায় ২: গতি ও গতির সমীকরণ', 'অধ্যায় ৩: বল ও নিউটনের সূত্র', 'অধ্যায় ৪: কাজ, ক্ষমতা ও শক্তি'],
    teacherNoteBn: 'স্লাইড ক্যালিপার্স ও স্ক্রু-গজ ব্যবহারিক খাতা জমা দেওয়া আবশ্যক।',
    updatedAtBn: 'ফেব্রুয়ারি ২০২৬',
  },
  {
    id: 'syl-c9-chem-a',
    className: 'Class 9',
    classLabelBn: '৯ম শ্রেণি',
    group: 'বিজ্ঞান',
    examTerm: 'বার্ষিক পরীক্ষা',
    subjectCode: '১৩৭',
    subjectNameBn: 'রসায়ন',
    subjectNameEn: 'Chemistry',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫',
    chaptersBn: ['অধ্যায় ৪: পর্যায় সারণি', 'অধ্যায় ৫: রাসায়নিক বন্ধন', 'অধ্যায় ৬: মোলের ধারণা ও রাসায়নিক গণনা', 'অধ্যায় ৭: রাসায়নিক বিক্রিয়া'],
    teacherNoteBn: 'ল্যাবে অম্ল-ক্ষার প্রশমন বিক্রিয়ার হাতে-কলমে পরীক্ষা নেওয়া হবে।',
    updatedAtBn: 'আগস্ট ২০২৬',
  },
  // Class 9 - Humanities
  {
    id: 'syl-c9-hist-h',
    className: 'Class 9',
    classLabelBn: '৯ম শ্রেণি',
    group: 'মানবিক',
    examTerm: 'অর্ধবার্ষিক পরীক্ষা',
    subjectCode: '১৫৩',
    subjectNameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা',
    subjectNameEn: 'History & World Civilization',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['প্রাচীন বিশ্বসভ্যতা (মিশরীয়, সিন্ধু ও গ্রিক)', 'প্রাচীন বাংলার জনপদ ও শাসনব্যবস্থা', 'মধ্যযুগে বাংলার রাজনৈতিক ইতিহাস', 'বাংলার নবজাগরণ ও মুক্তিযুদ্ধের পটভূমি'],
    teacherNoteBn: 'মানচিত্র চিহ্নিতকরণ ও সৃজনশীল প্রয়োগমূলক উত্তর অনুশীলন করতে হবে।',
    updatedAtBn: 'ফেব্রুয়ারি ২০২৬',
  },
  // Class 9 - Business
  {
    id: 'syl-c9-acc-a',
    className: 'Class 9',
    classLabelBn: '৯ম শ্রেণি',
    group: 'ব্যবসায় শিক্ষা',
    examTerm: 'বার্ষিক পরীক্ষা',
    subjectCode: '১৪৬',
    subjectNameBn: 'হিসাববিজ্ঞান',
    subjectNameEn: 'Accounting',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['লেনদেন ও হিসাব সমীকরণ', 'দুতরফা দাখিলা পদ্ধতি', 'জাবেদা, খতিয়ান ও নগদান বই', 'রেওয়ামিল ও আর্থিক বিবরণী (প্রাথমিক)'],
    teacherNoteBn: 'ছক আঁকা ও হিসাব মেলানোর নির্ভুলতার ওপর বিশেষ নম্বর বরাদ্দ রয়েছে।',
    updatedAtBn: 'আগস্ট ২০২৬',
  },
  // Class 9 - ICT (Compulsory)
  {
    id: 'syl-c9-ict-h',
    className: 'Class 9',
    classLabelBn: '৯ম শ্রেণি',
    group: 'সকল বিভাগ',
    examTerm: 'অর্ধবার্ষিক পরীক্ষা',
    subjectCode: '১৫৪',
    subjectNameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (আইসিটি)',
    subjectNameEn: 'Information & Communication Technology',
    fullMarks: 50,
    marksBreakdownBn: 'বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫',
    chaptersBn: ['তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ', 'কম্পিউটার ও কম্পিউটার ব্যবহারকারীর নিরাপত্তা', 'আমার শিক্ষায় ইন্টারনেট ও ডিজিটাল কনটেন্ট', 'ওয়ার্ড প্রসেসিং ও স্প্রেডশিট বিশ্লেষণ'],
    teacherNoteBn: 'শেখ রাসেল ডিজিটাল ল্যাবে প্রতি সপ্তাহে নিয়মিত ব্যবহারিক অনুশীলন অনুষ্ঠিত হয়।',
    updatedAtBn: 'ফেব্রুয়ারি ২০২৬',
  },
  // Class 10 - SSC Pre-Test / Selection
  {
    id: 'syl-c10-comp-t',
    className: 'Class 10',
    classLabelBn: '১০ম শ্রেণি (এসএসসি ব্যাচ)',
    group: 'সকল বিভাগ',
    examTerm: 'নির্বাচনি (এসএসসি)',
    subjectCode: '১০৯',
    subjectNameBn: 'সাধারণ গণিত (পূর্ণাঙ্গ এসএসসি সিলেবাস)',
    subjectNameEn: 'General Mathematics (SSC)',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['বীজগণিত: সেট-ফাংশন, সূচক-লগারিদম, ধারা ও অনুপাত', 'জ্যামিতি: বৃত্ত সংক্রান্ত উপপাদ্য ও সম্পাদ্য', 'ত্রিকোণমিতি ও পরিমিতি (অধ্যায় ৯, ১০, ১৬)', 'পরিসংখ্যান: গড়, মধ্যক, প্রচুরক ও অজিভ রেখা'],
    teacherNoteBn: 'নির্বাচনি পরীক্ষায় উত্তীর্ণ শিক্ষার্থীদের এসএসসি ফরম পূরণের অনুমতি দেওয়া হবে।',
    updatedAtBn: 'সেপ্টেম্বর ২০২৬',
  },
  {
    id: 'syl-c10-sci-t',
    className: 'Class 10',
    classLabelBn: '১০ম শ্রেণি (এসএসসি ব্যাচ)',
    group: 'বিজ্ঞান',
    examTerm: 'নির্বাচনি (এসএসসি)',
    subjectCode: '১৩৬-১৩৮',
    subjectNameBn: 'পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞান (সমন্বিত)',
    subjectNameEn: 'Physics, Chemistry & Biology (SSC)',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৫০ + বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫ (প্রতি বিষয়)',
    chaptersBn: ['পদার্থ: আলোর প্রতিফলন-প্রতিসরণ, চলতড়িৎ ও আধুনিক পদার্থবিজ্ঞান', 'রসায়ন: খনিজ সম্পদ, জৈব যৌগ ও আমাদের জীবনে রসায়ন', 'জীববিজ্ঞান: জীবনীশক্তি, জিনতত্ত্ব ও জীবের বংশগতি', 'বোর্ড নির্ধারিত ব্যবহারিক খাতা ও মৌখিক পরীক্ষা'],
    teacherNoteBn: 'প্রতি রবিবার ও বুধবার বিকাল ৩:৩০ টায় বিশেষ এসএসসি মডেল টেস্ট অনুষ্ঠিত হয়।',
    updatedAtBn: 'সেপ্টেম্বর ২০২৬',
  },
  {
    id: 'syl-c10-hum-t',
    className: 'Class 10',
    classLabelBn: '১০ম শ্রেণি (এসএসসি ব্যাচ)',
    group: 'মানবিক',
    examTerm: 'নির্বাচনি (এসএসসি)',
    subjectCode: '১৪০',
    subjectNameBn: 'পৌরনীতি ও নাগরিকতা এবং ভূগোল',
    subjectNameEn: 'Civics & Geography (SSC)',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['বাংলাদেশের সংবিধান ও সরকারের অঙ্গসমূহ', 'স্থানীয় সরকার ও গণতান্ত্রিক মূল্যবোধ', 'বাংলাদেশের ভূ-প্রকৃতি, নদ-নদী ও জলবায়ু', 'আন্তর্জাতিক সংস্থা ও জাতিসংঘে বাংলাদেশের ভূমিকা'],
    teacherNoteBn: 'গত ৫ বছরের ঢাকা বোর্ডের প্রশ্নপত্র বিশ্লেষণসহ উত্তর অনুশীলন।',
    updatedAtBn: 'সেপ্টেম্বর ২০২৬',
  },
  {
    id: 'syl-c10-bus-t',
    className: 'Class 10',
    classLabelBn: '১০ম শ্রেণি (এসএসসি ব্যাচ)',
    group: 'ব্যবসায় শিক্ষা',
    examTerm: 'নির্বাচনি (এসএসসি)',
    subjectCode: '১৪৬-১৫২',
    subjectNameBn: 'হিসাববিজ্ঞান, ফিন্যান্স ও ব্যবসায় উদ্যোগ',
    subjectNameEn: 'Accounting, Finance & Business (SSC)',
    fullMarks: 100,
    marksBreakdownBn: 'সৃজনশীল ৭০ + বহুনির্বাচনি ৩০',
    chaptersBn: ['পূর্ণাঙ্গ আর্থিক বিবরণী ও সমন্বয় দাখিলা', 'মূলধন বাজেটিং ও অর্থের সময়মূল্য', 'আত্মকর্মসংস্থান ও ব্যবসায় পরিকল্পনা প্রণয়ন', 'ব্যাংকিং ব্যবস্থা ও চেক লেনদেন'],
    teacherNoteBn: 'আর্থিক বিবরণীর বাধ্যতামূলক ২টি সৃজনশীল প্রশ্নে পূর্ণ নম্বর অর্জনে বিশেষ ক্লাস।',
    updatedAtBn: 'সেপ্টেম্বর ২০২৬',
  },
  {
    id: 'syl-c10-ict-t',
    className: 'Class 10',
    classLabelBn: '১০ম শ্রেণি (এসএসসি ব্যাচ)',
    group: 'সকল বিভাগ',
    examTerm: 'নির্বাচনি (এসএসসি)',
    subjectCode: '১৫৪',
    subjectNameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (পূর্ণাঙ্গ এসএসসি)',
    subjectNameEn: 'ICT (SSC)',
    fullMarks: 50,
    marksBreakdownBn: 'বহুনির্বাচনি ২৫ + ব্যবহারিক ২৫',
    chaptersBn: ['মাল্টিমিডিয়া ও গ্রাফিক্স পরিচিতি', 'ডেটাবেস ম্যানেজমেন্ট ও কুয়েরি', 'কম্পিউটার ট্রাবলশুটিং ও সাইবার নিরাপত্তা', 'বোর্ড চূড়ান্ত ব্যবহারিক ল্যাব মূল্যায়ন'],
    teacherNoteBn: 'ঢাকা শিক্ষা বোর্ডের নির্দেশিকা অনুযায়ী ব্যবহারিক খাতা ও ল্যাব টেস্ট সম্পন্ন করতে হবে।',
    updatedAtBn: 'সেপ্টেম্বর ২০২৬',
  },
];

export function filterSyllabusItems(
  items: SmartSyllabusEntry[],
  filters: {
    className?: string;
    group?: SyllabusGroup;
    examTerm?: SyllabusExamTerm | 'সকল পর্ব';
    query?: string;
  }
): SmartSyllabusEntry[] {
  const q = (filters.query || '').trim().toLowerCase();
  const isJunior =
    filters.className === 'Class 6' ||
    filters.className === 'Class 7' ||
    filters.className === 'Class 8';

  return items.filter((item) => {
    if (filters.className && filters.className !== 'All' && item.className !== filters.className) {
      return false;
    }
    if (filters.group && filters.group !== 'সকল বিভাগ' && !isJunior) {
      // Include compulsory ('সকল বিভাগ') + selected group's subjects
      if (item.group !== filters.group && item.group !== 'সকল বিভাগ') {
        return false;
      }
    }
    if (filters.examTerm && filters.examTerm !== 'সকল পর্ব' && item.examTerm !== filters.examTerm) {
      return false;
    }
    if (q) {
      const hay = `${item.subjectNameBn} ${item.subjectNameEn} ${item.subjectCode} ${item.chaptersBn.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// CURRICULUM STREAMS CATALOG
// ---------------------------------------------------------------------------

export interface CurriculumStream {
  id: string;
  tabLabelBn: string;
  titleBn: string;
  titleEn: string;
  gradesBn: string;
  summaryBn: string;
  weeklyPeriods: number;
  practicalFocusBn: string;
  subjects: Array<{
    code: string;
    nameBn: string;
    type: 'বাধ্যতামূলক' | 'বিভাগীয়' | 'ঐচ্ছিক / ৪র্থ';
    marks: number;
    periodsPerWeek: number;
  }>;
}

export const CURRICULUM_STREAMS: CurriculumStream[] = [
  {
    id: 'junior',
    tabLabelBn: 'নিম্ন মাধ্যমিক (৬ষ্ঠ–৮ম)',
    titleBn: 'নিম্ন মাধ্যমিক সাধারণ শিক্ষাক্রম',
    titleEn: 'Junior Secondary Curriculum (Classes 6–8)',
    gradesBn: '৬ষ্ঠ, ৭ম ও ৮ম শ্রেণি',
    summaryBn:
      'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) প্রণীত ভিত্তিমূলক পাঠ্যক্রম। ভাষা দক্ষতা, গাণিতিক যুক্তি, প্রাথমিক বিজ্ঞান অনুসন্ধান এবং ডিজিটাল সাক্ষরতা গঠনে গুরুত্বারোপ করা হয়।',
    weeklyPeriods: 30,
    practicalFocusBn: 'বিজ্ঞান ল্যাব পর্যবেক্ষণ ও শেখ রাসেল ডিজিটাল ল্যাবে হাতে-কলমে কম্পিউটার অনুশীলন।',
    subjects: [
      { code: '১০১', nameBn: 'বাংলা (সাহিত্য ও ব্যাকরণ)', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 5 },
      { code: '১০৭', nameBn: 'ইংরেজি (Reading, Grammar & Composition)', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 5 },
      { code: '১০৯', nameBn: 'সাধারণ গণিত', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 5 },
      { code: '১২৭', nameBn: 'সাধারণ বিজ্ঞান', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 4 },
      { code: '১৫০', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 4 },
      { code: '১৫৪', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', type: 'বাধ্যতামূলক', marks: 50, periodsPerWeek: 3 },
      { code: '১১১', nameBn: 'ধর্ম ও নৈতিক শিক্ষা (ইসলাম/হিন্দু)', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 2 },
      { code: '১৩৪', nameBn: 'কৃষি শিক্ষা / গার্হস্থ্য বিজ্ঞান', type: 'ঐচ্ছিক / ৪র্থ', marks: 100, periodsPerWeek: 2 },
    ],
  },
  {
    id: 'science',
    tabLabelBn: 'বিজ্ঞান (৯ম–১০ম)',
    titleBn: 'মাধ্যমিক বিজ্ঞান বিভাগ (এসএসসি)',
    titleEn: 'Secondary Science Group (Classes 9–10)',
    gradesBn: '৯ম ও ১০ম শ্রেণি (ঢাকা বোর্ড)',
    summaryBn:
      'প্রকৌশল, চিকিৎসা ও উচ্চতর বিজ্ঞান শিক্ষার ভিত্তি গঠনে পদার্থ, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিতের তাত্ত্বিক ও সমৃদ্ধ ল্যাবরেটরি পাঠদান।',
    weeklyPeriods: 32,
    practicalFocusBn: 'পদার্থ, রসায়ন ও জীববিজ্ঞান ল্যাবে পৃথকভাবে ২৫ নম্বরের ব্যবহারিক পরীক্ষা ও ল্যাব নোটবুক মূল্যায়ন।',
    subjects: [
      { code: '১০১-১০২', nameBn: 'বাংলা ১ম ও ২য় পত্র', type: 'বাধ্যতামূলক', marks: 200, periodsPerWeek: 5 },
      { code: '১০৭-১০৮', nameBn: 'ইংরেজি ১ম ও ২য় পত্র', type: 'বাধ্যতামূলক', marks: 200, periodsPerWeek: 5 },
      { code: '১০৯', nameBn: 'সাধারণ গণিত', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 5 },
      { code: '১৩৬', nameBn: 'পদার্থবিজ্ঞান (তাত্ত্বিক + ব্যবহারিক)', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 4 },
      { code: '১৩৭', nameBn: 'রসায়ন (তাত্ত্বিক + ব্যবহারিক)', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 4 },
      { code: '১৩৮', nameBn: 'জীববিজ্ঞান (তাত্ত্বিক + ব্যবহারিক)', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 4 },
      { code: '১২৬', nameBn: 'উচ্চতর গণিত / কৃষি শিক্ষা', type: 'ঐচ্ছিক / ৪র্থ', marks: 100, periodsPerWeek: 3 },
      { code: '১৫৪', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', type: 'বাধ্যতামূলক', marks: 50, periodsPerWeek: 2 },
    ],
  },
  {
    id: 'humanities',
    tabLabelBn: 'মানবিক (৯ম–১০ম)',
    titleBn: 'মাধ্যমিক মানবিক বিভাগ (এসএসসি)',
    titleEn: 'Secondary Humanities Group (Classes 9–10)',
    gradesBn: '৯ম ও ১০ম শ্রেণি (ঢাকা বোর্ড)',
    summaryBn:
      'ইতিহাস, সমাজবিজ্ঞান, রাষ্ট্রচিন্তা, ভূগোল ও অর্থনীতির গভীর অনুধাবনের মাধ্যমে সচেতন নাগরিক ও নেতৃত্বগুণ সম্পন্ন শিক্ষার্থী গড়ে তোলা।',
    weeklyPeriods: 30,
    practicalFocusBn: 'ভূগোল মানচিত্র অঙ্কন, গ্রন্থাগার পাঠচক্র এবং বিতর্ক-বক্তৃতা অনুশীলন।',
    subjects: [
      { code: '১০১-১০২', nameBn: 'বাংলা ১ম ও ২য় পত্র', type: 'বাধ্যতামূলক', marks: 200, periodsPerWeek: 5 },
      { code: '১০৭-১০৮', nameBn: 'ইংরেজি ১ম ও ২য় পত্র', type: 'বাধ্যতামূলক', marks: 200, periodsPerWeek: 5 },
      { code: '১০৯', nameBn: 'সাধারণ গণিত', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 4 },
      { code: '১৫৩', nameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 4 },
      { code: '১১০', nameBn: 'ভূগোল ও পরিবেশ', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 4 },
      { code: '১৪০', nameBn: 'পৌরনীতি ও নাগরিকতা', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 4 },
      { code: '১২৭', nameBn: 'সাধারণ বিজ্ঞান', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 2 },
      { code: '১৩৪', nameBn: 'কৃষি শিক্ষা / গার্হস্থ্য অর্থনীতি', type: 'ঐচ্ছিক / ৪র্থ', marks: 100, periodsPerWeek: 2 },
    ],
  },
  {
    id: 'business',
    tabLabelBn: 'ব্যবসায় শিক্ষা (৯ম–১০ম)',
    titleBn: 'মাধ্যমিক ব্যবসায় শিক্ষা বিভাগ (এসএসসি)',
    titleEn: 'Secondary Business Studies Group (Classes 9–10)',
    gradesBn: '৯ম ও ১০ম শ্রেণি (ঢাকা বোর্ড)',
    summaryBn:
      'আধুনিক হিসাববিজ্ঞান, ফিন্যান্স, ব্যাংকিং এবং উদ্যোক্তা দক্ষতা অর্জনের মাধ্যমে অর্থনৈতিক ও বাণিজ্যিক ক্ষেত্রে দক্ষ মানবসম্পদ তৈরি।',
    weeklyPeriods: 30,
    practicalFocusBn: 'আর্থিক বিবরণী ও হিসাব খাতা প্রস্তুত এবং স্প্রেডশিট সফটওয়্যার অনুশীলন।',
    subjects: [
      { code: '১০১-১০২', nameBn: 'বাংলা ১ম ও ২য় পত্র', type: 'বাধ্যতামূলক', marks: 200, periodsPerWeek: 5 },
      { code: '১০৭-১০৮', nameBn: 'ইংরেজি ১ম ও ২য় পত্র', type: 'বাধ্যতামূলক', marks: 200, periodsPerWeek: 5 },
      { code: '১০৯', nameBn: 'সাধারণ গণিত', type: 'বাধ্যতামূলক', marks: 100, periodsPerWeek: 4 },
      { code: '১৪৬', nameBn: 'হিসাববিজ্ঞান', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 5 },
      { code: '১৫২', nameBn: 'ফিন্যান্স ও ব্যাংকিং', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 4 },
      { code: '১৪৩', nameBn: 'ব্যবসায় উদ্যোগ', type: 'বিভাগীয়', marks: 100, periodsPerWeek: 3 },
      { code: '১২৭', nameBn: 'সাধারণ বিজ্ঞান ও আইসিটি', type: 'বাধ্যতামূলক', marks: 150, periodsPerWeek: 2 },
      { code: '১৩৪', nameBn: 'কৃষি শিক্ষা / কম্পিউটার শিক্ষা', type: 'ঐচ্ছিক / ৪র্থ', marks: 100, periodsPerWeek: 2 },
    ],
  },
];

// ---------------------------------------------------------------------------
// SCHOOL LIBRARY CATALOG (গ্রন্থাগার)
// ---------------------------------------------------------------------------

export type LibraryCategory =
  | 'সকল বই'
  | 'বাংলা সাহিত্য'
  | 'মুক্তিযুদ্ধ ও ইতিহাস'
  | 'বিজ্ঞান ও গণিত'
  | 'ইংরেজি ও ব্যাকরণ'
  | 'আইসিটি ও কম্পিউটার'
  | 'রেফারেন্স ও সাধারণ জ্ঞান';

export interface LibraryBook {
  id: string;
  callNo: string;
  titleBn: string;
  titleEn: string;
  authorBn: string;
  category: Exclude<LibraryCategory, 'সকল বই'>;
  shelfNo: string;
  totalCopies: number;
  availableCopies: number;
  recommendedFor: string;
  publishedYear: string;
  summaryBn: string;
}

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  'সকল বই',
  'বাংলা সাহিত্য',
  'মুক্তিযুদ্ধ ও ইতিহাস',
  'বিজ্ঞান ও গণিত',
  'ইংরেজি ও ব্যাকরণ',
  'আইসিটি ও কম্পিউটার',
  'রেফারেন্স ও সাধারণ জ্ঞান',
];

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'lib-01',
    callNo: 'BUTPHS-LIT-101',
    titleBn: 'গীতাঞ্জলি ও নির্বাচিত কাব্যসংকলন',
    titleEn: 'Gitanjali & Selected Poems',
    authorBn: 'রবীন্দ্রনাথ ঠাকুর',
    category: 'বাংলা সাহিত্য',
    shelfNo: 'শেলফ ক-০১',
    totalCopies: 8,
    availableCopies: 5,
    recommendedFor: '৬ষ্ঠ–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২২',
    summaryBn: 'বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের নোবেল বিজয়ী কাব্যগ্রন্থ ও শিক্ষার্থীদের উপযোগী নির্বাচিত কবিতাসমূহ।',
  },
  {
    id: 'lib-02',
    callNo: 'BUTPHS-LIT-104',
    titleBn: 'অগ্নিবীণা ও সঞ্চিতা',
    titleEn: 'Agnibina & Sanchita',
    authorBn: 'কাজী নজরুল ইসলাম',
    category: 'বাংলা সাহিত্য',
    shelfNo: 'শেলফ ক-০২',
    totalCopies: 6,
    availableCopies: 4,
    recommendedFor: '৭ম–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২৩',
    summaryBn: 'জাতীয় কবি কাজী নজরুল ইসলামের উদ্দীপনামূলক কবিতা ও সাম্যবাদী রচনার সমৃদ্ধ সংকলন।',
  },
  {
    id: 'lib-03',
    callNo: 'BUTPHS-LIT-112',
    titleBn: 'পথের পাঁচালী (কিশোর সংস্করণ)',
    titleEn: 'Pather Panchali (Youth Edition)',
    authorBn: 'বিভূতিভূষণ বন্দ্যোপাধ্যায়',
    category: 'বাংলা সাহিত্য',
    shelfNo: 'শেলফ ক-০৪',
    totalCopies: 7,
    availableCopies: 3,
    recommendedFor: '৬ষ্ঠ–৯ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২১',
    summaryBn: 'গ্রামবাংলার প্রকৃতি, অপু-দুর্গার শৈশব ও মানবিক সংগ্রামের চিরায়ত উপন্যাস।',
  },
  {
    id: 'lib-04',
    callNo: 'BUTPHS-LIT-119',
    titleBn: 'নকশী কাঁথার মাঠ',
    titleEn: 'Nakshi Kanthar Math',
    authorBn: 'পল্লীকবি জসীমউদ্‌দীন',
    category: 'বাংলা সাহিত্য',
    shelfNo: 'শেলফ ক-০৫',
    totalCopies: 5,
    availableCopies: 5,
    recommendedFor: '৬ষ্ঠ–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২২',
    summaryBn: 'বাংলা লোকসাহিত্যের অমূল্য কাব্যগাথা—গ্রামবাংলার মানুষের আবেগ ও ঐতিহ্যের অনন্য দলিল।',
  },
  {
    id: 'lib-05',
    callNo: 'BUTPHS-HIS-201',
    titleBn: 'অসমাপ্ত আত্মজীবনী',
    titleEn: 'The Unfinished Memoirs',
    authorBn: 'শেখ মুজিবুর রহমান',
    category: 'মুক্তিযুদ্ধ ও ইতিহাস',
    shelfNo: 'শেলফ খ-০১',
    totalCopies: 10,
    availableCopies: 6,
    recommendedFor: '৮ম–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২৩',
    summaryBn: 'বাংলার রাজনৈতিক ইতিহাস, ভাষা আন্দোলন ও স্বাধিকার সংগ্রামের প্রামাণ্য ঐতিহাসিক স্মৃতিকথা।',
  },
  {
    id: 'lib-06',
    callNo: 'BUTPHS-HIS-205',
    titleBn: 'একাত্তরের দিনগুলি',
    titleEn: 'Ekattorer Dinguli',
    authorBn: 'জাহানারা ইমাম',
    category: 'মুক্তিযুদ্ধ ও ইতিহাস',
    shelfNo: 'শেলফ খ-০২',
    totalCopies: 8,
    availableCopies: 4,
    recommendedFor: '৭ম–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২২',
    summaryBn: '১৯৭১ সালের মহান মুক্তিযুদ্ধকালীন অবরুদ্ধ ঢাকার বাস্তব অভিজ্ঞতা ও ত্যাগের দিনলিপি।',
  },
  {
    id: 'lib-07',
    callNo: 'BUTPHS-HIS-210',
    titleBn: 'মুক্তিযুদ্ধের ইতিহাস (কিশোর পাঠ)',
    titleEn: 'History of Liberation War',
    authorBn: 'মুহম্মদ জাফর ইকবাল',
    category: 'মুক্তিযুদ্ধ ও ইতিহাস',
    shelfNo: 'শেলফ খ-০৩',
    totalCopies: 12,
    availableCopies: 9,
    recommendedFor: '৬ষ্ঠ–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২৪',
    summaryBn: 'সহজ ভাষায় ১৯৭১-এর মুক্তিযুদ্ধ, সেক্টর ভিত্তিক যুদ্ধ ও বিজয়ের গৌরবগাথা।',
  },
  {
    id: 'lib-08',
    callNo: 'BUTPHS-HIS-214',
    titleBn: 'শরীয়তপুর ও পদ্মা অববাহিকার ঐতিহ্য',
    titleEn: 'Heritage of Shariatpur & Padma Basin',
    authorBn: 'ড. শামসুল আলম',
    category: 'মুক্তিযুদ্ধ ও ইতিহাস',
    shelfNo: 'শেলফ খ-০৫',
    totalCopies: 4,
    availableCopies: 2,
    recommendedFor: '৮ম–১০ম ও গবেষক',
    publishedYear: 'সংস্করণ ২০২১',
    summaryBn: 'বিক্রমপুর-শরীয়তপুর অঞ্চলের প্রাচীন শিক্ষা প্রতিষ্ঠান, সংস্কৃতি ও সামাজিক বিবর্তনের ইতিহাস।',
  },
  {
    id: 'lib-09',
    callNo: 'BUTPHS-SCI-301',
    titleBn: 'গণিত অলিম্পিয়াড প্রস্তুতি ও মজার গণিত',
    titleEn: 'Math Olympiad Preparation',
    authorBn: 'মুনির হাসান',
    category: 'বিজ্ঞান ও গণিত',
    shelfNo: 'শেলফ গ-০১',
    totalCopies: 9,
    availableCopies: 5,
    recommendedFor: '৬ষ্ঠ–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২৪',
    summaryBn: 'সংখ্যার জাদু, জ্যামিতিক ধাঁধা এবং জাতীয় গণিত অলিম্পিয়াডের নির্বাচিত সমস্যার সমাধান।',
  },
  {
    id: 'lib-10',
    callNo: 'BUTPHS-SCI-306',
    titleBn: 'পদার্থবিজ্ঞানের প্রথম পাঠ ও ব্যবহারিক নির্দেশিকা',
    titleEn: 'First Lessons in Physics',
    authorBn: 'ড. আলী আসগর',
    category: 'বিজ্ঞান ও গণিত',
    shelfNo: 'শেলফ গ-০২',
    totalCopies: 7,
    availableCopies: 4,
    recommendedFor: '৯ম–১০ম (বিজ্ঞান)',
    publishedYear: 'সংস্করণ ২০২৩',
    summaryBn: 'গতি, আলো, তড়িৎ ও শক্তির মৌলিক সূত্রগুলোর বাস্তব উদাহরণসহ সহজবোধ্য ব্যাখ্যা।',
  },
  {
    id: 'lib-11',
    callNo: 'BUTPHS-SCI-312',
    titleBn: 'বিজ্ঞানের একশ মজার পরীক্ষা',
    titleEn: '100 Fun Science Experiments',
    authorBn: 'আবদুল্লাহ আল-মুতী',
    category: 'বিজ্ঞান ও গণিত',
    shelfNo: 'শেলফ গ-০৪',
    totalCopies: 8,
    availableCopies: 0,
    recommendedFor: '৬ষ্ঠ–৯ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২২',
    summaryBn: 'বিদ্যালয়ের ল্যাব ও ঘরোয়া উপকরণে হাতে-কলমে বিজ্ঞান শেখার জনপ্রিয় গ্রন্থ।',
  },
  {
    id: 'lib-12',
    callNo: 'BUTPHS-ENG-401',
    titleBn: 'Oxford Advanced Learner’s Dictionary (10th Ed.)',
    titleEn: 'Oxford Advanced Learner Dictionary',
    authorBn: 'A. S. Hornby',
    category: 'ইংরেজি ও ব্যাকরণ',
    shelfNo: 'শেলফ ঘ-০১',
    totalCopies: 6,
    availableCopies: 4,
    recommendedFor: '৬ষ্ঠ–১০ম শ্রেণি',
    publishedYear: 'Edition 2023',
    summaryBn: 'ইংরেজি শব্দভান্ডার, সঠিক উচ্চারণ এবং বাক্য গঠনের জন্য প্রামাণ্য অভিধান।',
  },
  {
    id: 'lib-13',
    callNo: 'BUTPHS-ENG-406',
    titleBn: 'High School English Grammar & Composition',
    titleEn: 'Wren & Martin English Grammar',
    authorBn: 'P. C. Wren & H. Martin',
    category: 'ইংরেজি ও ব্যাকরণ',
    shelfNo: 'শেলফ ঘ-০২',
    totalCopies: 10,
    availableCopies: 7,
    recommendedFor: '৭ম–১০ম শ্রেণি',
    publishedYear: 'Edition 2024',
    summaryBn: 'মাধ্যমিক পর্যায়ের ইংরেজি ব্যাকরণ, রূপান্তর ও রচনা অনুশীলনের আন্তর্জাতিক মানের সহায়ক বই।',
  },
  {
    id: 'lib-14',
    callNo: 'BUTPHS-ENG-411',
    titleBn: 'বাংলা একাডেমি আধুনিক বাংলা অভিধান',
    titleEn: 'Bangla Academy Modern Bengali Dictionary',
    authorBn: 'বাংলা একাডেমি',
    category: 'ইংরেজি ও ব্যাকরণ',
    shelfNo: 'শেলফ ঘ-০৪',
    totalCopies: 5,
    availableCopies: 3,
    recommendedFor: 'সকল শ্রেণি',
    publishedYear: 'সংস্করণ ২০২৩',
    summaryBn: 'প্রমিত বাংলা বানান, ব্যুৎপত্তি ও অর্থ জানার জন্য বিদ্যালয়ের প্রধান রেফারেন্স অভিধান।',
  },
  {
    id: 'lib-15',
    callNo: 'BUTPHS-ICT-501',
    titleBn: 'কম্পিউটার প্রোগ্রামিং (১ম খণ্ড — সি ও পাইথন)',
    titleEn: 'Computer Programming Vol. 1',
    authorBn: 'তামিম শাহরিয়ার সুবিন',
    category: 'আইসিটি ও কম্পিউটার',
    shelfNo: 'শেলফ ঙ-০১',
    totalCopies: 9,
    availableCopies: 6,
    recommendedFor: '৮ম–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২৪',
    summaryBn: 'বাংলা ভাষায় প্রোগ্রামিংয়ের হাতেখড়ি, লজিক গঠন ও অ্যালগরিদম চর্চার জনপ্রিয় গ্রন্থ।',
  },
  {
    id: 'lib-16',
    callNo: 'BUTPHS-ICT-508',
    titleBn: 'ডিজিটাল প্রযুক্তি, ওয়েব ডিজাইন ও ডেটাবেস পরিচিতি',
    titleEn: 'Digital Technology, Web Design & Database Basics',
    authorBn: 'প্রকৌশলী মোঃ কামরুল হাসান',
    category: 'আইসিটি ও কম্পিউটার',
    shelfNo: 'শেলফ ঙ-০৩',
    totalCopies: 6,
    availableCopies: 4,
    recommendedFor: '৯ম–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২৩',
    summaryBn: 'মাধ্যমিক শিক্ষার্থীদের জন্য এইচটিএমএল, স্প্রেডশিট ও নিরাপদ ইন্টারনেট ব্যবহারের সহায়ক গ্রন্থ।',
  },
  {
    id: 'lib-17',
    callNo: 'BUTPHS-REF-601',
    titleBn: 'বাংলাপিডিয়া — বাংলাদেশের জাতীয় জ্ঞানকোষ (সংক্ষিপ্ত)',
    titleEn: 'Banglapedia National Encyclopedia',
    authorBn: 'বাংলাদেশ এশিয়াটিক সোসাইটি',
    category: 'রেফারেন্স ও সাধারণ জ্ঞান',
    shelfNo: 'শেলফ চ-০১',
    totalCopies: 4,
    availableCopies: 4,
    recommendedFor: 'সকল শিক্ষার্থী ও শিক্ষক',
    publishedYear: 'সংস্করণ ২০২২',
    summaryBn: 'বাংলাদেশের ভূগোল, ইতিহাস, ঐতিহ্য, বিজ্ঞান ও সংস্কৃতির নির্ভরযোগ্য বিশ্বকোষ।',
  },
  {
    id: 'lib-18',
    callNo: 'BUTPHS-REF-609',
    titleBn: 'বিশ্ব মানচিত্র ও সাধারণ জ্ঞান সমগ্র — ২০২৬',
    titleEn: 'World Atlas & General Knowledge 2026',
    authorBn: 'সম্পাদনা পরিষদ',
    category: 'রেফারেন্স ও সাধারণ জ্ঞান',
    shelfNo: 'শেলফ চ-০৩',
    totalCopies: 7,
    availableCopies: 5,
    recommendedFor: '৬ষ্ঠ–১০ম শ্রেণি',
    publishedYear: 'সংস্করণ ২০২৬',
    summaryBn: 'কুইজ, বিতর্ক এবং সাধারণ জ্ঞান প্রতিযোগিতার জন্য হালনাগাদ মানচিত্র ও তথ্যভাণ্ডার।',
  },
];

export function filterLibraryBooks(
  books: LibraryBook[],
  options: {
    category?: LibraryCategory;
    query?: string;
    availableOnly?: boolean;
  }
): LibraryBook[] {
  const q = (options.query || '').trim().toLowerCase();
  return books.filter((book) => {
    if (options.category && options.category !== 'সকল বই' && book.category !== options.category) {
      return false;
    }
    if (options.availableOnly && book.availableCopies <= 0) {
      return false;
    }
    if (q) {
      const hay = `${book.titleBn} ${book.titleEn} ${book.authorBn} ${book.callNo} ${book.shelfNo} ${book.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
