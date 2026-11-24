import type { CommitteeCategory, CommitteeMember, Student } from '../types';

export interface StudentWizardFormState {
  // Step 1
  nameBn: string;
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  // Step 2
  birthCertificateNo: string;
  boardRegistrationNo: string;
  address: string;
  permanentAddress: string;
  // Step 3
  guardianName: string;
  guardianNameBn: string;
  guardianPhone: string;
  guardianOccupation: string;
  // Step 4
  previousSchool: string;
  previousGpa: string;
  // Step 5
  className: string;
  section: string;
  roll: string;
  group: 'General' | 'Science' | 'Business Studies' | 'Humanities';
  bloodGroup: string;
  rfidCardId: string;
}

export function normalizeBdPhone(raw: string): string {
  return raw.replace(/[\s-]/g, '').trim();
}

export function validateStudentWizardStep(
  step: number,
  data: StudentWizardFormState,
  existingStudents: Pick<Student, 'className' | 'section' | 'roll'>[]
): string | null {
  if (step === 1) {
    if (data.nameBn.trim().length < 2) {
      return 'শিক্ষার্থীর বাংলা নাম আবশ্যক (কমপক্ষে ২ অক্ষর)।';
    }
    if (data.name.trim().length < 3) {
      return 'শিক্ষার্থীর ইংরেজি নাম আবশ্যক (কমপক্ষে ৩ অক্ষর)।';
    }
    if (!data.dateOfBirth.trim()) {
      return 'শিক্ষার্থীর জন্ম তারিখ প্রদান করুন।';
    }
    return null;
  }

  if (step === 2) {
    const bcn = data.birthCertificateNo.replace(/\s+/g, '').trim();
    if (bcn && !/^\d{17}$/.test(bcn)) {
      return 'জন্ম সনদ নম্বর প্রদান করলে তা অবশ্যই ১৭ ডিজিটের সংখ্যা হতে হবে।';
    }
    if (!data.address.trim()) {
      return 'বর্তমান ঠিকানা প্রদান করুন।';
    }
    return null;
  }

  if (step === 3) {
    if (data.guardianName.trim().length < 3) {
      return 'অভিভাবকের নাম (ইংরেজি) আবশ্যক।';
    }
    const cleanPhone = normalizeBdPhone(data.guardianPhone);
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(cleanPhone)) {
      return 'সঠিক ১১ ডিজিটের অভিভাবকের মোবাইল নম্বর দিন (যেমন: 01711998877)।';
    }
    return null;
  }

  if (step === 4) {
    const gpaStr = data.previousGpa.trim();
    if (gpaStr) {
      const num = Number(gpaStr);
      if (Number.isNaN(num) || num < 0 || num > 5) {
        return 'পূর্ববর্তী জিপিএ অবশ্যই ০.০০ থেকে ৫.০০-এর মধ্যে হতে হবে।';
      }
    }
    return null;
  }

  if (step === 5) {
    const rollNum = Number(data.roll);
    if (!data.roll.trim() || !Number.isInteger(rollNum) || rollNum <= 0) {
      return 'সঠিক রোল নম্বর (ইউনিক ধনাত্মক সংখ্যা) দিন।';
    }
    const duplicate = existingStudents.some(
      (s) => s.className === data.className && s.section === data.section && s.roll === rollNum
    );
    if (duplicate) {
      return `${data.className} (${data.section}) শাখায় রোল নম্বর ${rollNum} ইতিমধ্যে নিবন্ধিত আছে। অনুগ্রহ করে ভিন্ন ইউনিক রোল দিন।`;
    }
    return null;
  }

  return null;
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3;
  labelBn: string;
  valid: boolean;
  errorBn?: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const trimmed = password.trim();
  if (trimmed.length < 6) {
    return {
      score: 0,
      labelBn: 'অপর্যাপ্ত (কমপক্ষে ৬ অক্ষর)',
      valid: false,
      errorBn: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
    };
  }
  let score = 1;
  if (/[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed) && /\d/.test(trimmed)) {
    score = 2;
  }
  if (trimmed.length >= 8 && /[^A-Za-z0-9]/.test(trimmed) && /\d/.test(trimmed)) {
    score = 3;
  }
  const labels: Record<number, string> = {
    1: 'সাধারণ',
    2: 'মাঝারি (ভালো)',
    3: 'শক্তিশালী',
  };
  return {
    score: score as 1 | 2 | 3,
    labelBn: labels[score],
    valid: true,
  };
}

export function filterCommitteeTable(
  members: CommitteeMember[],
  options: {
    query: string;
    category: 'all' | CommitteeCategory;
    sortBy: 'priority' | 'name';
  }
): CommitteeMember[] {
  const q = options.query.trim().toLowerCase();
  const filtered = members.filter((m) => {
    if (options.category !== 'all' && m.category !== options.category) return false;
    if (!q) return true;
    return (
      m.nameBn.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.roleBn.toLowerCase().includes(q) ||
      m.professionBn.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.tenure.toLowerCase().includes(q)
    );
  });

  return [...filtered].sort((a, b) => {
    if (options.sortBy === 'name') {
      return a.nameBn.localeCompare(b.nameBn, 'bn');
    }
    return a.priorityOrder - b.priorityOrder;
  });
}
