import { z } from 'zod';

const bdMobileRegex = /^01[3-9]\d{8}$/;
const nidRegex = /^(\d{10}|\d{13}|\d{17})$/;
const birthCertRegex = /^\d{17}$/;
const dobMmDdYyyyRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;

const emailOrBdPhone = z
  .string()
  .trim()
  .refine(
    (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || bdMobileRegex.test(val),
    'সঠিক ইমেইল অথবা ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
  );

export const loginSchema = z.object({
  email: emailOrBdPhone,
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
  role: z.enum(['admin', 'teacher', 'parent', 'accountant']),
});

export const admissionStep1Schema = z.object({
  applicantNameBn: z
    .string()
    .trim()
    .min(2, 'শিক্ষার্থীর নাম (বাংলায়) আবশ্যক — উদাহরণ: রাফিউল ইসলাম'),
  applicantName: z
    .string()
    .trim()
    .min(3, 'শিক্ষার্থীর নাম (ইংরেজিতে) আবশ্যক — উদাহরণ: Rafiul Islam')
    .regex(/^[A-Za-z.\-\s]+$/, 'ইংরেজি নামে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন'),
  dateOfBirth: z
    .string()
    .trim()
    .refine(
      (val) => dobMmDdYyyyRegex.test(val) || /^\d{4}-\d{2}-\d{2}$/.test(val),
      'সঠিক ফরম্যাটে জন্ম তারিখ দিন: MM/DD/YYYY (উদাহরণ: 01/15/2014)'
    ),
  birthCertificateNo: z
    .string()
    .trim()
    .regex(
      birthCertRegex,
      'সঠিক ১৭ ডিজিটের ডিজিটাল জন্ম সনদ নম্বর দিন (উদাহরণ: 20148614500012345)'
    ),
  gender: z.enum(['Male', 'Female'], {
    message: 'লিঙ্গ নির্বাচন করুন (ছাত্র / ছাত্রী)',
  }),
  religion: z.string().trim().min(2, 'ধর্ম নির্বাচন করুন'),
});

export const admissionStep2Schema = z.object({
  fatherNameBn: z.string().trim().min(2, 'পিতার নাম (বাংলায়) আবশ্যক'),
  fatherNameEn: z
    .string()
    .trim()
    .min(3, 'পিতার নাম (ইংরেজিতে) আবশ্যক')
    .regex(/^[A-Za-z.\-\s]+$/, 'ইংরেজি নামে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন'),
  fatherOccupation: z.string().trim().min(2, 'পিতার পেশা উল্লেখ করুন'),
  fatherNid: z
    .string()
    .trim()
    .regex(nidRegex, 'পিতার সঠিক এনআইডি (১০, ১৩ বা ১৭ ডিজিট) নম্বর দিন'),
  motherNameBn: z.string().trim().min(2, 'মাতার নাম (বাংলায়) আবশ্যক'),
  motherNameEn: z
    .string()
    .trim()
    .min(3, 'মাতার নাম (ইংরেজিতে) আবশ্যক')
    .regex(/^[A-Za-z.\-\s]+$/, 'ইংরেজি নামে শুধুমাত্র ইংরেজি অক্ষর ব্যবহার করুন'),
  motherOccupation: z.string().trim().min(2, 'মাতার পেশা উল্লেখ করুন'),
  motherNid: z
    .string()
    .trim()
    .regex(nidRegex, 'মাতার সঠিক এনআইডি (১০, ১৩ বা ১৭ ডিজিট) নম্বর দিন'),
  guardianPhone: z
    .string()
    .trim()
    .regex(bdMobileRegex, 'অভিভাবকের ১১ ডিজিটের বৈধ মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'),
  address: z
    .string()
    .trim()
    .min(8, 'বর্তমান ঠিকানা পূর্ণাঙ্গভাবে লিখুন (গ্রাম, ডাকঘর, উপজেলা, জেলা)'),
  permanentAddress: z
    .string()
    .trim()
    .min(8, 'স্থায়ী ঠিকানা পূর্ণাঙ্গভাবে লিখুন (গ্রাম, ডাকঘর, উপজেলা, জেলা)'),
});

export const admissionStep3Schema = z.object({
  previousSchool: z.string().trim().optional().default(''),
  previousClassGrade: z.string().trim().optional().default(''),
  passingYear: z
    .string()
    .trim()
    .refine((val) => !val || /^(20[12]\d)$/.test(val), 'সঠিক ৪ ডিজিটের পাসের সন দিন (যেমন: 2025)')
    .optional()
    .default(''),
  previousRollGpa: z.string().trim().optional().default(''),
  applyingClass: z.string().trim().min(1, 'ভর্তিচ্ছু শ্রেণি নির্বাচন করুন'),
  program: z.enum(['General']),
  admissionType: z.enum(['নতুন ভর্তি', 'বদলি ভর্তি']),
});

export const admissionStep4Schema = z.object({
  undertakingAccepted: z.literal(true, {
    message: 'আবেদন জমা দিতে অঙ্গীকারনামায় সম্মতি দেওয়া বাধ্যতামূলক',
  }),
});

export const admissionSchema = admissionStep1Schema
  .merge(admissionStep2Schema)
  .merge(admissionStep3Schema)
  .merge(admissionStep4Schema);

export const teacherSchema = z.object({
  name: z.string().trim().min(3, 'শিক্ষকের ইংরেজি নাম দিন'),
  nameBn: z.string().trim().min(2, 'শিক্ষকের বাংলা নাম দিন'),
  designation: z.string().trim().min(2, 'পদবি উল্লেখ করুন'),
  department: z.string().trim().min(2, 'বিভাগ উল্লেখ করুন'),
  qualification: z.string().trim().min(2, 'শিক্ষাগত যোগ্যতা উল্লেখ করুন'),
  email: z.string().trim().email('সঠিক ইমেইল ঠিকানা দিন'),
  phone: z.string().trim().regex(bdMobileRegex, '১১ ডিজিটের বৈধ মোবাইল নম্বর দিন (01XXXXXXXXX)'),
});

export const studentSchema = z.object({
  studentId: z.string().trim().min(4, 'শিক্ষার্থী আইডি দিন (যেমন: BUTPHS-2026-109)'),
  roll: z.coerce.number().int().min(1, 'রোল নম্বর কমপক্ষে ১ হতে হবে'),
  name: z.string().trim().min(3, 'শিক্ষার্থীর ইংরেজি নাম দিন'),
  nameBn: z.string().trim().min(2, 'শিক্ষার্থীর বাংলা নাম দিন'),
  className: z.string().min(1, 'শ্রেণি নির্বাচন করুন'),
  section: z.string().min(1, 'শাখা নির্বাচন করুন'),
  guardianName: z.string().trim().min(3, 'অভিভাবকের নাম দিন'),
  guardianPhone: z.string().trim().regex(bdMobileRegex, '১১ ডিজিটের বৈধ মোবাইল নম্বর দিন (01XXXXXXXXX)'),
});

export const noticeSchema = z.object({
  title: z.string().trim().min(5, 'নোটিশের ইংরেজি শিরোনাম দিন'),
  titleBn: z.string().trim().min(4, 'নোটিশের বাংলা শিরোনাম দিন'),
  category: z.enum(['Academic', 'Exam', 'Admission', 'Holiday', 'General', 'Event']),
  summary: z.string().trim().min(10, 'সংক্ষিপ্ত সারসংক্ষেপ দিন'),
  content: z.string().trim().min(15, 'বিস্তারিত বিবরণ লিখুন'),
});

export const smsSchema = z.object({
  recipientGroup: z.enum(['Guardian', 'All Parents', 'Teachers', 'Class Wise']),
  recipientPhone: z.string().trim().min(4, 'প্রাপকের তথ্য দিন'),
  message: z
    .string()
    .trim()
    .min(10, 'বার্তা কমপক্ষে ১০ অক্ষরের হতে হবে')
    .max(320, 'বার্তা ৩২০ অক্ষরের মধ্যে রাখুন'),
});

export const markEntrySchema = z.object({
  obtainedMarks: z.coerce
    .number()
    .min(0, 'নম্বর ০-এর কম হতে পারবে না')
    .max(100, 'নম্বর ১০০-এর বেশি হতে পারবে না'),
});

export const clubInterestSchema = z.object({
  studentName: z.string().trim().min(3, 'শিক্ষার্থীর পূর্ণ নাম লিখুন (কমপক্ষে ৩ অক্ষর)'),
  studentClass: z.string().min(1, 'শ্রেণি নির্বাচন করুন'),
  rollNo: z.string().trim().min(1, 'রোল নম্বর লিখুন'),
  guardianPhone: z
    .string()
    .trim()
    .regex(bdMobileRegex, '১১ ডিজিটের বৈধ মোবাইল নম্বর দিন (017XXXXXXXX)'),
});

export const communityPostSchema = z.object({
  author: z.string().trim().min(3, 'আপনার পূর্ণ নাম লিখুন (কমপক্ষে ৩ অক্ষর)'),
  topic: z.string().trim().min(5, 'বিষয় বা শিরোনাম কমপক্ষে ৫ অক্ষরের হতে হবে'),
  body: z.string().trim().min(12, 'আপনার প্রশ্ন বা মতামত কমপক্ষে ১২ অক্ষরে বিস্তারিত লিখুন'),
});

export const examCreateSchema = z.object({
  name: z.string().trim().min(4, 'পরীক্ষার ইংরেজি নাম দিন'),
  nameBn: z.string().trim().min(3, 'পরীক্ষার বাংলা নাম দিন'),
  className: z.string().min(1, 'শ্রেণি নির্বাচন করুন'),
  startDate: z.string().min(8, 'শুরুর তারিখ দিন'),
  endDate: z.string().min(8, 'শেষের তারিখ দিন'),
});
