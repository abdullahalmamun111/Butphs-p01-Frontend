export type NavIconKey =
  | 'history'
  | 'chairman'
  | 'headteacher'
  | 'committee'
  | 'teachers'
  | 'staff'
  | 'students'
  | 'mission'
  | 'routine'
  | 'syllabus'
  | 'curriculum'
  | 'notices'
  | 'calendar'
  | 'results'
  | 'library'
  | 'guidelines'
  | 'sports'
  | 'cultural'
  | 'scout'
  | 'girlsguide'
  | 'tour'
  | 'sportsclub'
  | 'debate'
  | 'culturalclub'
  | 'magazine'
  | 'wallmag'
  | 'journal'
  | 'admission'
  | 'form'
  | 'fees'
  | 'media'
  | 'community';

export interface NavChild {
  label: string;
  labelBn: string;
  href: string;
  description: string;
  icon: NavIconKey;
}

export interface NavGroup {
  id: string;
  label: string;
  labelBn: string;
  taglineBn: string;
  href?: string;
  children?: NavChild[];
}

export const PUBLIC_NAV_GROUPS: NavGroup[] = [
  {
    id: 'about',
    label: 'About',
    labelBn: 'পরিচিতি',
    taglineBn: '১৮৯৮ সাল থেকে ঐতিহ্য, নেতৃত্ব ও মানবসম্পদ',
    children: [
      {
        label: 'School History',
        labelBn: 'প্রতিষ্ঠানের ইতিহাস',
        href: '/about/history',
        description: '১২৮ বছরের প্রতিষ্ঠা ও অগ্রযাত্রা',
        icon: 'history',
      },
      {
        label: "Chairman's Message",
        labelBn: 'সভাপতির বাণী',
        href: '/about/chairman-message',
        description: 'পরিচালনা পর্ষদের সভাপতির দিকনির্দেশনা',
        icon: 'chairman',
      },
      {
        label: "Head Teacher's Message",
        labelBn: 'প্রধান শিক্ষকের বাণী',
        href: '/about/head-teacher-message',
        description: 'একাডেমিক লক্ষ্য ও প্রধান শিক্ষকের বক্তব্য',
        icon: 'headteacher',
      },
      {
        label: 'Managing Committee',
        labelBn: 'পরিচালনা পর্ষদ',
        href: '/about/management-committee',
        description: 'বিদ্যালয় পরিচালনা কমিটির সদস্যবৃন্দ',
        icon: 'committee',
      },
      {
        label: 'Teacher Directory',
        labelBn: 'শিক্ষকমণ্ডলী ও প্রোফাইল',
        href: '/about/teachers',
        description: 'প্রতিটি শিক্ষকের ব্যক্তিগত পরিচিতি ও রুটিন',
        icon: 'teachers',
      },
      {
        label: 'Staff Directory',
        labelBn: 'কর্মকর্তা ও কর্মচারী',
        href: '/about/staff',
        description: 'অফিস, লাইব্রেরি ও ল্যাব কর্মীবৃন্দ',
        icon: 'staff',
      },
      {
        label: 'Student Overview',
        labelBn: 'শিক্ষার্থী তথ্য',
        href: '/about/students',
        description: 'শ্রেণি ও বিভাগভিত্তিক শিক্ষার্থী তালিকা',
        icon: 'students',
      },
      {
        label: 'Mission & Vision',
        labelBn: 'লক্ষ্য ও উদ্দেশ্য',
        href: '/about/mission-vision',
        description: 'শিক্ষার মানোন্নয়ন ও ভবিষ্যৎ পরিকল্পনা',
        icon: 'mission',
      },
      {
        label: 'Our Stars (Alumni)',
        labelBn: 'কৃতি প্রাক্তন শিক্ষার্থী',
        href: '/about/stars',
        description: 'দেশ-বিদেশে প্রতিষ্ঠিত আমাদের গর্বিত নক্ষত্রবৃন্দ',
        icon: 'students',
      },
    ],
  },
  {
    id: 'academics',
    label: 'Academics',
    labelBn: 'একাডেমিক',
    taglineBn: 'পাঠদান, পরীক্ষা, রুটিন ও ফলাফল সেবা',
    children: [
      {
        label: 'Academic Notices',
        labelBn: 'প্রাতিষ্ঠানিক নোটিশ',
        href: '/academics/notices',
        description: 'প্রিন্ট ফরম্যাট বিজ্ঞপ্তি ও আর্কাইভ',
        icon: 'notices',
      },
      {
        label: 'Public Results',
        labelBn: 'অনলাইন ফলাফল',
        href: '/academics/results',
        description: 'শিক্ষার্থী আইডি দিয়ে মার্কশিট অনুসন্ধান',
        icon: 'results',
      },
      {
        label: 'Class Routine',
        labelBn: 'ক্লাস রুটিন',
        href: '/academics/class-routine',
        description: '৬ষ্ঠ থেকে ১০ম শ্রেণির সাপ্তাহিক সূচি',
        icon: 'routine',
      },
      {
        label: 'Syllabus',
        labelBn: 'পাঠ্যসূচি ও সিলেবাস',
        href: '/academics/syllabus',
        description: 'শ্রেণি ও বিভাগভিত্তিক বিষয়ের অধ্যায়সমূহ',
        icon: 'syllabus',
      },
      {
        label: 'Curriculum',
        labelBn: 'কারিকুলাম ও বিভাগ',
        href: '/academics/curriculum',
        description: '৬ষ্ঠ–১০ম শ্রেণি: বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা',
        icon: 'curriculum',
      },
      {
        label: 'Academic Calendar',
        labelBn: 'একাডেমিক ক্যালেন্ডার',
        href: '/academics/calendar',
        description: 'পরীক্ষা, ছুটি ও বার্ষিক অনুষ্ঠানের তালিকা',
        icon: 'calendar',
      },
      {
        label: 'School Library',
        labelBn: 'গ্রন্থাগার (লাইব্রেরি)',
        href: '/academics/library',
        description: '৩,৫০০+ বইয়ের ডিজিটাল তালিকা ও অনুসন্ধান',
        icon: 'library',
      },
      {
        label: 'Academic Guidelines',
        labelBn: 'একাডেমিক নির্দেশিকা',
        href: '/academics/guidelines',
        description: 'ইউনিফর্ম, উপস্থিতি ও শৃঙ্খলা বিধিমালা',
        icon: 'guidelines',
      },
    ],
  },
  {
    id: 'activities',
    label: 'Co-Curricular',
    labelBn: 'সহশিক্ষা',
    taglineBn: 'ক্রীড়া, সংস্কৃতি, স্কাউট ও শিক্ষার্থী ক্লাব',
    children: [
      {
        label: 'Sports & Athletics',
        labelBn: 'বার্ষিক খেলাধুলা',
        href: '/activities/sports',
        description: 'আন্তঃহাউস ক্রীড়া ও অ্যাথলেটিক্স',
        icon: 'sports',
      },
      {
        label: 'Cultural Programs',
        labelBn: 'সাংস্কৃতিক অনুষ্ঠান',
        href: '/activities/cultural-programs',
        description: 'জাতীয় দিবস, সংগীত ও নাট্যচর্চা',
        icon: 'cultural',
      },
      {
        label: 'Bangladesh Scouts',
        labelBn: 'স্কাউট দল',
        href: '/activities/scout',
        description: 'সেবা, শৃঙ্খলা ও নেতৃত্ব প্রশিক্ষণ',
        icon: 'scout',
      },
      {
        label: 'Girls Guide',
        labelBn: 'গার্লস গাইড',
        href: '/activities/girls-guide',
        description: 'আত্মনির্ভরতা ও সামাজিক কার্যক্রম',
        icon: 'girlsguide',
      },
      {
        label: 'Educational Tours',
        labelBn: 'শিক্ষা সফর',
        href: '/activities/educational-tours',
        description: 'ঐতিহাসিক ও বিজ্ঞানভিত্তিক ভ্রমণ',
        icon: 'tour',
      },
      {
        label: 'Sports Club',
        labelBn: 'ক্রীড়া ক্লাব',
        href: '/clubs/sports',
        description: 'ফুটবল, ক্রিকেট ও ব্যাডমিন্টন অনুশীলন',
        icon: 'sportsclub',
      },
      {
        label: 'Debate & Speech Club',
        labelBn: 'বিতর্ক ও বক্তৃতা ক্লাব',
        href: '/clubs/debate-speech',
        description: 'উপজেলা ও জেলা পর্যায়ের বিতর্ক চর্চা',
        icon: 'debate',
      },
      {
        label: 'Cultural Club',
        labelBn: 'সাংস্কৃতিক ক্লাব',
        href: '/clubs/cultural',
        description: 'আবৃত্তি, চিত্রাঙ্কন ও সংগীত দল',
        icon: 'culturalclub',
      },
    ],
  },
  {
    id: 'publications',
    label: 'Publications',
    labelBn: 'প্রকাশনা',
    taglineBn: 'সৃজনশীল সাহিত্য, দেয়ালিকা ও শিক্ষামূলক নিবন্ধ',
    children: [
      {
        label: 'School Magazine',
        labelBn: 'বিদ্যালয় ম্যাগাজিন',
        href: '/publications/school-magazine',
        description: 'বার্ষিক সাহিত্য সংকলন “অরুণোদয়”',
        icon: 'magazine',
      },
      {
        label: 'Wall Magazine',
        labelBn: 'দেয়ালিকা প্রকাশনা',
        href: '/publications/wall-magazine',
        description: 'বিশেষ দিবসে শিক্ষার্থীদের হাতে লেখা দেয়ালিকা',
        icon: 'wallmag',
      },
      {
        label: 'Academic Journal',
        labelBn: 'জার্নাল ও গবেষণা',
        href: '/publications/journal',
        description: 'বিজ্ঞান প্রকল্প ও শিক্ষক-শিক্ষার্থীর প্রবন্ধ',
        icon: 'journal',
      },
    ],
  },
  {
    id: 'others',
    label: 'Admission & Info',
    labelBn: 'ভর্তি ও অন্যান্য',
    taglineBn: 'অনলাইন ভর্তি আবেদন, ফি কাঠামো ও যোগাযোগ',
    children: [
      {
        label: 'Online Admission',
        labelBn: 'অনলাইন ভর্তি আবেদন',
        href: '/others/online-admission',
        description: '৬ষ্ঠ–৯ম শ্রেণিতে অনলাইন আবেদন ফরম',
        icon: 'admission',
      },
      {
        label: 'Printable Form',
        labelBn: 'ভর্তি ফরম (প্রিন্ট)',
        href: '/others/admission-form',
        description: 'অফিসিয়াল A4 ভর্তি ফরম ডাউনলোড ও প্রিন্ট',
        icon: 'form',
      },
      {
        label: 'Fees & Tuition',
        labelBn: 'বেতন ও ফি কাঠামো',
        href: '/others/fees',
        description: 'শ্রেণিভিত্তিক মাসিক বেতন ও পরীক্ষার ফি',
        icon: 'fees',
      },
      {
        label: 'Media Gallery',
        labelBn: 'ফটো ও মিডিয়া গ্যালারি',
        href: '/others/media',
        description: 'ক্যাম্পাস, ল্যাব ও অনুষ্ঠানের আলোকচিত্র',
        icon: 'media',
      },
      {
        label: 'Community & Contact',
        labelBn: 'যোগাযোগ ও জিজ্ঞাসা',
        href: '/others/community',
        description: 'অফিস সময়, মানচিত্র ও অভিভাবক সহায়তা',
        icon: 'community',
      },
    ],
  },
];

export const CLASS_LIST = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
export const SECTION_LIST = ['A (পদ্মা)', 'B (মেঘনা)', 'C (যমুনা)'];
export const SUBJECT_LIST = [
  { code: '101', name: 'Bangla (বাংলা)' },
  { code: '107', name: 'English (ইংরেজি)' },
  { code: '109', name: 'Mathematics (গণিত)' },
  { code: '127', name: 'General Science (বিজ্ঞান)' },
  { code: '154', name: 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)' },
  { code: '150', name: 'Bangladesh & Global Studies' },
];

export const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', labelBn: 'ড্যাশবোর্ড', href: '/admin', groupBn: 'দৈনন্দিন পরিচালনা' },
  { id: 'admissions', label: 'New Admission', labelBn: 'নতুন ভর্তি ও জিজ্ঞাসা', href: '/admin/admissions', groupBn: 'দৈনন্দিন পরিচালনা' },
  { id: 'rfid', label: 'RFID Card', labelBn: 'RFID কার্ড ও গেট', href: '/admin/rfid', groupBn: 'দৈনন্দিন পরিচালনা' },
  { id: 'attendance', label: 'Attendance', labelBn: 'দৈনিক হাজিরা', href: '/admin/attendance', groupBn: 'দৈনন্দিন পরিচালনা' },
  { id: 'notices', label: 'Notices Management', labelBn: 'নোটিশ ব্যবস্থাপনা', href: '/admin/notices', groupBn: 'দৈনন্দিন পরিচালনা' },
  { id: 'sms', label: 'SMS Notice', labelBn: 'SMS নোটিশ ও লগ', href: '/admin/sms', groupBn: 'দৈনন্দিন পরিচালনা' },

  { id: 'students', label: 'Students Management', labelBn: 'শিক্ষার্থী ব্যবস্থাপনা', href: '/admin/students', groupBn: 'মানবসম্পদ ও পর্ষদ' },
  { id: 'guardians', label: 'Guardians Management', labelBn: 'অভিভাবক ব্যবস্থাপনা', href: '/admin/guardians', groupBn: 'মানবসম্পদ ও পর্ষদ' },
  { id: 'teachers', label: 'Teachers Management', labelBn: 'শিক্ষক ব্যবস্থাপনা', href: '/admin/teachers', groupBn: 'মানবসম্পদ ও পর্ষদ' },
  { id: 'staff', label: 'Staffs Management', labelBn: 'কর্মকর্তা-কর্মচারী', href: '/admin/staff', groupBn: 'মানবসম্পদ ও পর্ষদ' },
  { id: 'committee', label: 'Managing Committee', labelBn: 'পরিচালনা পর্ষদ', href: '/admin/committee', groupBn: 'মানবসম্পদ ও পর্ষদ' },

  { id: 'syllabus', label: 'Syllabus & Curriculum', labelBn: 'সিলেবাস ও কারিকুলাম', href: '/admin/syllabus', groupBn: 'একাডেমিক ও পরীক্ষা' },
  { id: 'exams', label: 'Exam Management', labelBn: 'পরীক্ষা ব্যবস্থাপনা', href: '/admin/exams', groupBn: 'একাডেমিক ও পরীক্ষা' },
  { id: 'results', label: 'Result Management', labelBn: 'ফলাফল ব্যবস্থাপনা', href: '/admin/results', groupBn: 'একাডেমিক ও পরীক্ষা' },
  { id: 'print', label: 'Print Academic Documents', labelBn: 'একাডেমিক ডকুমেন্ট প্রিন্ট', href: '/admin/print', groupBn: 'একাডেমিক ও পরীক্ষা' },

  { id: 'website', label: 'Website Content', labelBn: 'ওয়েবসাইট কনটেন্ট (CMS)', href: '/admin/website', groupBn: 'ওয়েবসাইট ও সিস্টেম' },
  { id: 'reports', label: 'Reports', labelBn: 'রিপোর্ট ও বিশ্লেষণ', href: '/admin/reports', groupBn: 'ওয়েবসাইট ও সিস্টেম' },
  { id: 'audit', label: 'Audit Logs', labelBn: 'অডিট লগ', href: '/admin/audit-logs', groupBn: 'ওয়েবসাইট ও সিস্টেম' },
  { id: 'settings', label: 'Settings', labelBn: 'সেটিংস', href: '/admin/settings', groupBn: 'ওয়েবসাইট ও সিস্টেম' },
  { id: 'profile', label: 'My Profile', labelBn: 'আমার প্রোফাইল', href: '/admin/profile', groupBn: 'ওয়েবসাইট ও সিস্টেম' },
];

export const TEACHER_NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', labelBn: 'ড্যাশবোর্ড', href: '/teacher', groupBn: 'শিক্ষক কর্মক্ষেত্র' },
  { id: 'attendance', label: 'Daily Attendance', labelBn: 'দৈনিক হাজিরা গ্রহণ', href: '/teacher/attendance', groupBn: 'শিক্ষক কর্মক্ষেত্র' },
  { id: 'results', label: 'Result Entry', labelBn: 'নম্বর এন্ট্রি ও খসড়া', href: '/teacher/results', groupBn: 'শিক্ষক কর্মক্ষেত্র' },
  { id: 'classes', label: 'Classes & Students', labelBn: 'শ্রেণি ও শিক্ষার্থী', href: '/teacher/classes', groupBn: 'একাডেমিক ও প্রোফাইল' },
  { id: 'routine', label: 'Routine & Class Notes', labelBn: 'রুটিন, নোট ও সিলেবাস', href: '/teacher/routine', groupBn: 'একাডেমিক ও প্রোফাইল' },
  { id: 'profile', label: 'My Profile', labelBn: 'আমার প্রোফাইল', href: '/teacher/profile', groupBn: 'একাডেমিক ও প্রোফাইল' },
];

export const PARENT_NAV_ITEMS = [
  { id: 'overview', label: 'Child Overview', labelBn: 'সন্তান পরিচিতি ও সারসংক্ষেপ', href: '/parent', groupBn: 'শিক্ষার্থী পর্যবেক্ষণ' },
  { id: 'attendance', label: 'Attendance & RFID', labelBn: 'উপস্থিতি ক্যালেন্ডার ও RFID', href: '/parent/attendance', groupBn: 'শিক্ষার্থী পর্যবেক্ষণ' },
  { id: 'results', label: 'Results & Marksheet', labelBn: 'ফলাফল ও মার্কশিট প্রিন্ট', href: '/parent/results', groupBn: 'শিক্ষার্থী পর্যবেক্ষণ' },
  { id: 'fees', label: 'Fees & Payment', labelBn: 'বেতন ও ফি পরিশোধ', href: '/parent/fees', groupBn: 'হিসাব ও যোগাযোগ' },
  { id: 'academics', label: 'Routine, Notes & Exams', labelBn: 'রুটিন, ক্লাস নোট ও পরীক্ষা', href: '/parent/academics', groupBn: 'হিসাব ও যোগাযোগ' },
  { id: 'notices', label: 'Notices, SMS & Helpdesk', labelBn: 'নোটিশ, SMS ও অফিস সহায়তা', href: '/parent/notices', groupBn: 'হিসাব ও যোগাযোগ' },
  { id: 'profile', label: 'My Profile', labelBn: 'আমার প্রোফাইল', href: '/parent/profile', groupBn: 'হিসাব ও যোগাযোগ' },
];

export const ACCOUNTANT_NAV_ITEMS = [
  { id: 'overview', label: 'Finance Overview', labelBn: 'হিসাব ওভারভিউ', href: '/accountant', groupBn: 'আর্থিক ব্যবস্থাপনা' },
  { id: 'fees', label: 'Fee Collection', labelBn: 'বেতন ও ফি আদায়', href: '/accountant/fees', groupBn: 'আর্থিক ব্যবস্থাপনা' },
  { id: 'dues', label: 'Dues & Reminders', labelBn: 'বকেয়া ও তাগাদা SMS', href: '/accountant/dues', groupBn: 'আর্থিক ব্যবস্থাপনা' },
  { id: 'ledger', label: 'Income & Expense', labelBn: 'আয়-ব্যয় ও ভাউচার খাতা', href: '/accountant/ledger', groupBn: 'খাতা ও প্রতিবেদন' },
  { id: 'reports', label: 'Reports & Receipts', labelBn: 'আর্থিক রিপোর্ট ও রসিদ', href: '/accountant/reports', groupBn: 'খাতা ও প্রতিবেদন' },
  { id: 'profile', label: 'My Profile', labelBn: 'আমার প্রোফাইল', href: '/accountant/profile', groupBn: 'খাতা ও প্রতিবেদন' },
];
