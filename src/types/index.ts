export type UserRole = 'admin' | 'teacher' | 'parent' | 'accountant';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  nameBn: string;
  role: UserRole;
  designation?: string;
  phone?: string;
  address?: string;
  bio?: string;
  photoUrl?: string;
  linkedTeacherId?: string;
  linkedStaffId?: string;
  linkedGuardianId?: string;
  linkedStudentIds?: string[];
  avatarInitials: string;
}

export interface Student {
  id: string;
  studentId: string;
  roll: number;
  name: string;
  nameBn: string;
  className: string;
  section: string;
  group?: 'General' | 'Science' | 'Business Studies' | 'Humanities';
  session: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  bloodGroup: string;
  guardianId: string;
  guardianName: string;
  guardianNameBn?: string;
  guardianPhone: string;
  guardianOccupation?: string;
  address: string;
  permanentAddress?: string;
  birthCertificateNo?: string;
  boardRegistrationNo?: string;
  previousSchool?: string;
  previousGpa?: string;
  rfidCardId?: string;
  photoUrl?: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  isStarStudent?: boolean;
  achievementNote?: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  nameBn: string;
  designation: string;
  designationBn: string;
  department: string;
  departmentBn?: string;
  qualification: string;
  qualificationBn?: string;
  joiningDate: string;
  experienceYears?: number;
  officeRoom?: string;
  email: string;
  phone: string;
  assignedClasses: string[];
  assignedSubjects: string[];
  status: 'Active' | 'Inactive';
  isHeadTeacher?: boolean;
  photoUrl?: string;
  bio?: string;
  personalMotto?: string;
  specialties?: string[];
}

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  department: string;
  departmentBn?: string;
  qualification?: string;
  joiningDate: string;
  officeRoom?: string;
  workingHours?: string;
  phone: string;
  status: 'Active' | 'Inactive';
  photoUrl?: string;
  bio?: string;
  responsibilities?: string[];
}

export interface Guardian {
  id: string;
  name: string;
  nameBn: string;
  relation: string;
  phone: string;
  email: string;
  occupation: string;
  address: string;
  photoUrl?: string;
  studentIds: string[];
}

export interface Notice {
  id: string;
  memoNo?: string;
  isUrgent?: boolean;
  title: string;
  titleBn: string;
  category: 'Academic' | 'Exam' | 'Admission' | 'Holiday' | 'General' | 'Event';
  date: string;
  summary: string;
  content: string;
  instructions?: string[];
  distributionList?: string[];
  attachmentName: string;
  status: 'Published' | 'Draft' | 'Archived';
  publishedBy: string;
}

export interface Exam {
  id: string;
  name: string;
  nameBn: string;
  academicYear: string;
  className: string;
  startDate: string;
  endDate: string;
  subjects: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export interface SubjectMark {
  subjectCode: string;
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  obtainedMarks: number;
  grade: string;
  gradePoint: number;
}

export interface StudentResult {
  id: string;
  examId: string;
  examName: string;
  academicYear: string;
  studentId: string;
  studentName: string;
  studentNameBn: string;
  className: string;
  section: string;
  roll: number;
  marks: SubjectMark[];
  totalMarks: number;
  gpa: number;
  overallGrade: string;
  passed: boolean;
  status: 'Draft' | 'Verified' | 'Published';
  updatedBy: string;
  updatedAt: string;
}

export interface RfidCard {
  id: string;
  cardUid: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  issuedDate: string;
  status: 'Active' | 'Lost' | 'Inactive';
  lastScannedAt?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Exited';
export type ScanDirection = 'ENTRY' | 'EXIT';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  date: string;
  entryTime?: string;
  exitTime?: string;
  status: AttendanceStatus;
  source: 'RFID' | 'Manual';
  cardUid?: string;
  remarks?: string;
}

export interface SmsLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  recipientGroup: 'Guardian' | 'All Parents' | 'Teachers' | 'Class Wise';
  message: string;
  trigger: 'RFID_ENTRY' | 'RFID_EXIT' | 'MANUAL_NOTICE';
  timestamp: string;
  deliveryStatus: 'Delivered' | 'Queued' | 'Simulated Delivered';
}

export interface AdmissionApplication {
  id: string;
  applicationNo: string;
  applicantName: string;
  applicantNameBn: string;
  dateOfBirth: string;
  birthCertificateNo?: string;
  gender?: 'Male' | 'Female';
  religion?: string;
  fatherNameBn?: string;
  fatherNameEn?: string;
  fatherOccupation?: string;
  fatherNid?: string;
  motherNameBn?: string;
  motherNameEn?: string;
  motherOccupation?: string;
  motherNid?: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  permanentAddress?: string;
  previousSchool?: string;
  previousClassGrade?: string;
  passingYear?: string;
  previousRollGpa?: string;
  applyingClass: string;
  program: 'General';
  admissionType?: 'নতুন ভর্তি' | 'বদলি ভর্তি';
  undertakingAccepted?: boolean;
  documentsStatus: 'সংযুক্ত' | 'যাচাইকৃত' | 'Pending Verification';
  submittedDate: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  reviewNote?: string;
}

export interface FeeRecord {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  className: string;
  monthOrTerm: string;
  tuitionFee: number;
  examFee: number;
  labAndActivityFee: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Due' | 'Partial';
  method?: string;
}

export interface FinanceTransaction {
  id: string;
  voucherNo: string;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  descriptionBn: string;
  amount: number;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  user: string;
  role: UserRole;
  module: string;
  action: string;
  timestamp: string;
}

export interface RoutineEntry {
  id: string;
  className: string;
  section: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  period: string;
  time: string;
  subject: string;
  teacherName: string;
  room: string;
}

export interface SyllabusItem {
  id: string;
  className: string;
  program: 'General';
  subject: string;
  term: string;
  topics: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  titleBn: string;
  category: 'Exam' | 'Holiday' | 'Academic' | 'Activity';
  description: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  titleBn: string;
  date: string;
  category: 'Sports' | 'Cultural' | 'Academic' | 'Achievement';
  summary: string;
  imageUrl: string;
}

export interface HeroSlideConfig {
  id: string;
  labelBn: string;
  kicker: string;
  headlineBn: string;
  subtitleBn: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  image: string;
  alt: string;
}

export interface SystemSettingsConfig {
  currentExamTerm: string;
  admissionOpen: boolean;
  lateArrivalTime: string;
  passMarksPercent: number;
  autoSmsOnRfidEntry: boolean;
  autoSmsOnRfidExit: boolean;
  autoSmsOnAbsent: boolean;
  autoSmsOnFeePayment: boolean;
}

export interface WebsiteContentConfig {
  heroHeadline: string;
  heroSubheadline: string;
  heroSlides?: HeroSlideConfig[];
  mottoBn?: string;
  mottoEn?: string;
  chairmanName?: string;
  chairmanTitle?: string;
  chairmanMessage?: string;
  chairmanFullMessage?: string[];
  headTeacherName: string;
  headTeacherTitle: string;
  headTeacherMessage: string;
  headTeacherFullMessage?: string[];
  historySummary: string;
  missionSummary: string;
  visionSummary: string;
  announcementBanner: string;
  admissionHeadline?: string;
  admissionSubtitle?: string;
  addressBn?: string;
  officeHoursBn?: string;
  contactPhone?: string;
  academicPhone?: string;
  contactEmail?: string;
  academicSession: string;
  systemSettings?: SystemSettingsConfig;
  demoStats: {
    classesCount: number;
    studentsCount: number;
    teachersCount: number;
    staffCount: number;
    newAdmissionsCount: number;
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export type CommitteeCategory =
  | 'সভাপতি ও নেতৃত্ব'
  | 'অভিভাবক প্রতিনিধি'
  | 'শিক্ষক প্রতিনিধি'
  | 'দাতা ও প্রতিষ্ঠাতা';

export interface CommitteeMember {
  id: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  category: CommitteeCategory;
  tenure: string;
  professionBn: string;
  educationBn: string;
  phone: string;
  email?: string;
  photoUrl: string;
  bioBn: string;
  quoteBn?: string;
  responsibilities: string[];
  linkedMessagePath?: string;
  priorityOrder: number;
}

export interface ContactInquiry {
  id: string;
  senderName: string;
  phone: string;
  subject: string;
  message: string;
  source: 'Public Contact' | 'Parent Portal';
  createdAt: string;
  status: 'New' | 'Replied' | 'Resolved';
  replyNote?: string;
  repliedBy?: string;
}

export interface ClassNote {
  id: string;
  className: string;
  subject: string;
  titleBn: string;
  detailsBn: string;
  teacherName: string;
  date: string;
  dueDate?: string;
}

