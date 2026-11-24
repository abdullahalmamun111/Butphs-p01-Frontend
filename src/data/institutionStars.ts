import { SCHOOL_INFO } from '../config/school';

export type StarFieldCategory = 'ALL' | 'চিকিৎসা ও গবেষণা' | 'প্রকৌশল ও প্রযুক্তি' | 'প্রশাসন ও ব্যাংকিং' | 'শিক্ষা ও একাডেমিয়া';

export interface InstitutionStar {
  id: string;
  nameBn: string;
  nameEn: string;
  sscBatch: string;
  sscBatchBn: string;
  groupBn: string;
  currentPositionBn: string;
  organizationBn: string;
  locationBn: string;
  fieldCategory: Exclude<StarFieldCategory, 'ALL'>;
  achievementBn: string;
  quoteBn: string;
  photoUrl: string;
  featured: boolean;
}

export const INSTITUTION_STARS: InstitutionStar[] = [
  {
    id: 'star-1',
    nameBn: 'ডা. তানভীর আহমেদ খান',
    nameEn: 'Dr. Tanvir Ahmed Khan',
    sscBatch: '2011',
    sscBatchBn: 'এসএসসি ২০১১',
    groupBn: 'বিজ্ঞান বিভাগ',
    currentPositionBn: 'সহকারী অধ্যাপক (মেডিসিন)',
    organizationBn: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
    locationBn: 'ঢাকা',
    fieldCategory: 'চিকিৎসা ও গবেষণা',
    achievementBn: 'এসএসসি ২০১১-এ গোল্ডেন জিপিএ-৫ ও ঢাকা বোর্ডে বৃত্তি অর্জন',
    quoteBn: 'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের শিক্ষকদের শৃঙ্খলা ও অনুপ্রেরণাই আমাকে চিকিৎসা সেবায় আসার পথ দেখিয়েছে।',
    photoUrl: SCHOOL_INFO.assets.starDoctor,
    featured: true,
  },
  {
    id: 'star-2',
    nameBn: 'প্রকৌশলী ফারজানা ইয়াসমিন মিম',
    nameEn: 'Engr. Farzana Yasmin Mim',
    sscBatch: '2014',
    sscBatchBn: 'এসএসসি ২০১৪',
    groupBn: 'বিজ্ঞান বিভাগ',
    currentPositionBn: 'সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার',
    organizationBn: 'গ্লোবাল ফিনটেক সলিউশনস, ঢাকা',
    locationBn: 'ঢাকা',
    fieldCategory: 'প্রকৌশল ও প্রযুক্তি',
    achievementBn: 'বুয়েট সিএসই স্নাতক · জাতীয় গণিত অলিম্পিয়াড বিজয়ী',
    quoteBn: 'স্কুলের বিজ্ঞান ল্যাব ও আইসিটি ক্লাসেই প্রথম প্রোগ্রামিং ও সমস্যা সমাধানের ভালোবাসা জন্মেছিল।',
    photoUrl: SCHOOL_INFO.assets.starEngineer,
    featured: true,
  },
  {
    id: 'star-3',
    nameBn: 'মো. রাশেদুল ইসলাম (বিসিএস)',
    nameEn: 'Md. Rashedul Islam (BCS)',
    sscBatch: '2009',
    sscBatchBn: 'এসএসসি ২০০৯',
    groupBn: 'মানবিক বিভাগ',
    currentPositionBn: 'উপজেলা নির্বাহী কর্মকর্তা (বিসিএস প্রশাসন)',
    organizationBn: 'বাংলাদেশ সিভিল সার্ভিস',
    locationBn: 'বাংলাদেশ',
    fieldCategory: 'প্রশাসন ও ব্যাংকিং',
    achievementBn: '৩৭তম বিসিএস (প্রশাসন) ক্যাডারে মেধাতালিকায় উত্তীর্ণ',
    quoteBn: 'আমাদের প্রিয় বিদ্যালয়ের “শিক্ষাই আলো · জ্ঞানই শক্তি” আদর্শ আজও জনপ্রশাসনে দায়িত্ব পালনে অনুপ্রাণিত করে।',
    photoUrl: SCHOOL_INFO.assets.starBcsOfficer,
    featured: true,
  },
  {
    id: 'star-4',
    nameBn: 'নুসরাত জাহান চৌধুরী',
    nameEn: 'Nusrat Jahan Chowdhury',
    sscBatch: '2012',
    sscBatchBn: 'এসএসসি ২০১২',
    groupBn: 'বিজ্ঞান বিভাগ',
    currentPositionBn: 'সহকারী অধ্যাপক, বাংলা বিভাগ',
    organizationBn: 'ঢাকা বিশ্ববিদ্যালয়',
    locationBn: 'ঢাকা',
    fieldCategory: 'শিক্ষা ও একাডেমিয়া',
    achievementBn: 'ডিনস অ্যাওয়ার্ড ও স্নাতকোত্তরে প্রথম শ্রেণিতে প্রথম',
    quoteBn: 'বিদ্যালয়ের গ্রন্থাগার ও বার্ষিক বিতর্ক প্রতিযোগিতা আমার গবেষণা ও সাহিত্যচর্চার ভিত গড়ে দিয়েছে।',
    photoUrl: SCHOOL_INFO.assets.starProfessor,
    featured: true,
  },
  {
    id: 'star-5',
    nameBn: 'প্রকৌশলী মাহমুদুল হাসান',
    nameEn: 'Engr. Mahmudul Hasan',
    sscBatch: '2015',
    sscBatchBn: 'এসএসসি ২০১৫',
    groupBn: 'বিজ্ঞান বিভাগ',
    currentPositionBn: 'সহকারী প্রকৌশলী (পাওয়ার গ্রিড)',
    organizationBn: 'পাওয়ার গ্রিড বাংলাদেশ পিএলসি',
    locationBn: 'ঢাকা',
    fieldCategory: 'প্রকৌশল ও প্রযুক্তি',
    achievementBn: 'এসএসসি ২০১৫-এ বিজ্ঞান বিভাগে জিপিএ-৫ ও রুয়েট তড়িৎ কৌশল স্নাতক',
    quoteBn: 'বিদ্যালয়ের বিজ্ঞান ও পদার্থবিজ্ঞান ল্যাবে হাতে-কলমে শেখার অভিজ্ঞতা আমার প্রকৌশল জীবনের শ্রেষ্ঠ সম্পদ।',
    photoUrl: SCHOOL_INFO.assets.teacherMaleScience,
    featured: false,
  },
  {
    id: 'star-6',
    nameBn: 'সাদিয়া আফরিন তৃষা',
    nameEn: 'Sadia Afrin Trisha',
    sscBatch: '2016',
    sscBatchBn: 'এসএসসি ২০১৬',
    groupBn: 'ব্যবসায় শিক্ষা বিভাগ',
    currentPositionBn: 'সিনিয়র অফিসার (অর্থনীতি ও গবেষণা)',
    organizationBn: 'বাংলাদেশ ব্যাংক',
    locationBn: 'ঢাকা',
    fieldCategory: 'প্রশাসন ও ব্যাংকিং',
    achievementBn: 'ঢাকা বিশ্ববিদ্যালয় ফিন্যান্স বিভাগ · এসএসসি-তে জিপিএ-৫',
    quoteBn: 'শিক্ষকদের আন্তরিক দিকনির্দেশনা ও নিয়মিত মডেল টেস্ট আমাকে আত্মবিশ্বাসী করে তুলেছে।',
    photoUrl: SCHOOL_INFO.assets.teacherFemaleEnglish,
    featured: false,
  },
  {
    id: 'star-7',
    nameBn: 'ডা. শামীমা সুলতানা',
    nameEn: 'Dr. Shamima Sultana',
    sscBatch: '2010',
    sscBatchBn: 'এসএসসি ২০১০',
    groupBn: 'বিজ্ঞান বিভাগ',
    currentPositionBn: 'কনসালটেন্ট (গাইনি ও অবস)',
    organizationBn: 'শরীয়তপুর সদর হাসপাতাল',
    locationBn: 'শরীয়তপুর',
    fieldCategory: 'চিকিৎসা ও গবেষণা',
    achievementBn: 'এফসিপিএস (গাইনি) · জেলা স্বাস্থ্যসেবায় বিশেষ সম্মাননা',
    quoteBn: 'নিজের জেলার মানুষের সেবায় নিজেকে নিয়োজিত করতে পেরে আমি বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের কাছে চিরকৃতজ্ঞ।',
    photoUrl: SCHOOL_INFO.assets.teacherFemaleSenior,
    featured: false,
  },
  {
    id: 'star-8',
    nameBn: 'আরিফুল ইসলাম সাগর',
    nameEn: 'Ariful Islam Sagar',
    sscBatch: '2017',
    sscBatchBn: 'এসএসসি ২০১৭',
    groupBn: 'বিজ্ঞান বিভাগ',
    currentPositionBn: 'গবেষক ও লেকচারার (পদার্থবিজ্ঞান)',
    organizationBn: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়',
    locationBn: 'সাভার, ঢাকা',
    fieldCategory: 'শিক্ষা ও একাডেমিয়া',
    achievementBn: 'জাতীয় বিজ্ঞান মেলায় বিভাগীয় চ্যাম্পিয়ন ও জিপিএ-৫',
    quoteBn: 'বিদ্যালয়ের শিক্ষামূলক সফর, বিজ্ঞান মেলা ও স্কাউটিং আমাকে নেতৃত্ব ও অনুসন্ধিৎসু হতে শিখিয়েছে।',
    photoUrl: SCHOOL_INFO.assets.staffOffice,
    featured: false,
  },
];

export const STAR_FIELD_CATEGORIES: StarFieldCategory[] = [
  'ALL',
  'চিকিৎসা ও গবেষণা',
  'প্রকৌশল ও প্রযুক্তি',
  'প্রশাসন ও ব্যাংকিং',
  'শিক্ষা ও একাডেমিয়া',
];

export function filterInstitutionStars(
  stars: InstitutionStar[],
  category: StarFieldCategory,
  query: string
): InstitutionStar[] {
  const normalized = query.trim().toLowerCase();
  return stars.filter((star) => {
    if (category !== 'ALL' && star.fieldCategory !== category) {
      return false;
    }
    if (!normalized) return true;
    return (
      star.nameBn.toLowerCase().includes(normalized) ||
      star.nameEn.toLowerCase().includes(normalized) ||
      star.sscBatch.includes(normalized) ||
      star.sscBatchBn.toLowerCase().includes(normalized) ||
      star.currentPositionBn.toLowerCase().includes(normalized) ||
      star.organizationBn.toLowerCase().includes(normalized) ||
      star.achievementBn.toLowerCase().includes(normalized) ||
      star.groupBn.toLowerCase().includes(normalized)
    );
  });
}
