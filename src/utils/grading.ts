import type { AttendanceRecord, ScanDirection, StudentResult, SubjectMark } from '../types';

export interface GradeEvaluation {
  grade: string;
  gradePoint: number;
  passed: boolean;
}

/**
 * Standard Bangladesh Secondary (NCTB / SSC) 5.00 GPA grading scale.
 */
export function evaluateSubjectMark(obtainedMarks: number, fullMarks = 100): GradeEvaluation {
  const safeFull = fullMarks > 0 ? fullMarks : 100;
  const clamped = Math.max(0, Math.min(obtainedMarks, safeFull));
  const pct = (clamped / safeFull) * 100;

  if (pct >= 80) return { grade: 'A+', gradePoint: 5.0, passed: true };
  if (pct >= 70) return { grade: 'A', gradePoint: 4.0, passed: true };
  if (pct >= 60) return { grade: 'A-', gradePoint: 3.5, passed: true };
  if (pct >= 50) return { grade: 'B', gradePoint: 3.0, passed: true };
  if (pct >= 40) return { grade: 'C', gradePoint: 2.0, passed: true };
  if (pct >= 33) return { grade: 'D', gradePoint: 1.0, passed: true };
  return { grade: 'F', gradePoint: 0.0, passed: false };
}

export function gradeFromGpa(gpa: number, passed: boolean): string {
  if (!passed || gpa < 1.0) return 'F';
  if (gpa >= 5.0) return 'A+';
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.0) return 'C';
  return 'D';
}

export function computeOverallResult(
  rawSubjects: Array<{
    subjectCode: string;
    subjectName: string;
    fullMarks?: number;
    passMarks?: number;
    obtainedMarks: number;
  }>
): {
  marks: SubjectMark[];
  totalMarks: number;
  gpa: number;
  overallGrade: string;
  passed: boolean;
} {
  if (rawSubjects.length === 0) {
    return { marks: [], totalMarks: 0, gpa: 0, overallGrade: 'F', passed: false };
  }

  let totalMarks = 0;
  let totalPoints = 0;
  let allPassed = true;

  const marks: SubjectMark[] = rawSubjects.map((sub) => {
    const fullMarks = sub.fullMarks ?? 100;
    const passMarks = sub.passMarks ?? 33;
    const evalRes = evaluateSubjectMark(sub.obtainedMarks, fullMarks);
    const subjectPassed = evalRes.passed && sub.obtainedMarks >= passMarks;
    if (!subjectPassed) {
      allPassed = false;
    }
    totalMarks += sub.obtainedMarks;
    totalPoints += evalRes.gradePoint;

    return {
      subjectCode: sub.subjectCode,
      subjectName: sub.subjectName,
      fullMarks,
      passMarks,
      obtainedMarks: sub.obtainedMarks,
      grade: subjectPassed ? evalRes.grade : 'F',
      gradePoint: subjectPassed ? evalRes.gradePoint : 0.0,
    };
  });

  const gpa = allPassed ? Number((totalPoints / marks.length).toFixed(2)) : 0.0;
  const overallGrade = gradeFromGpa(gpa, allPassed);

  return {
    marks,
    totalMarks,
    gpa,
    overallGrade,
    passed: allPassed,
  };
}

/**
 * Public and Parent result lookup strictly returns ONLY 'Published' results.
 */
export function filterPublishedResults(
  results: StudentResult[],
  query: { studentId?: string; className?: string; examId?: string; roll?: number }
): StudentResult[] {
  return results.filter((res) => {
    if (res.status !== 'Published') return false;
    if (
      query.studentId &&
      res.studentId.toLowerCase() !== query.studentId.trim().toLowerCase()
    ) {
      return false;
    }
    if (query.className && query.className !== 'All' && res.className !== query.className) {
      return false;
    }
    if (query.examId && query.examId !== 'All' && res.examId !== query.examId) {
      return false;
    }
    if (query.roll !== undefined && !Number.isNaN(query.roll) && res.roll !== query.roll) {
      return false;
    }
    return true;
  });
}

/**
 * Duplicate RFID scan prevention: blocks identical direction scans on the same date
 * or rapid re-scans within the cooldown window (default 5 minutes).
 */
export function checkRfidDuplicateScan(
  existingRecords: AttendanceRecord[],
  studentId: string,
  date: string,
  direction: ScanDirection,
  nowMinutesFromMidnight: number,
  cooldownMinutes = 5
): { allowed: boolean; reason?: string } {
  const todayRecord = existingRecords.find(
    (r) => r.studentId === studentId && r.date === date
  );

  if (!todayRecord) {
    if (direction === 'EXIT') {
      return {
        allowed: false,
        reason: 'প্রবেশ (Entry) রেকর্ড ছাড়া প্রস্থান (Exit) স্ক্যান গ্রহণযোগ্য নয়। আগে Entry স্ক্যান করুন।',
      };
    }
    return { allowed: true };
  }

  if (direction === 'ENTRY' && todayRecord.entryTime) {
    return {
      allowed: false,
      reason: `ডুপ্লিকেট স্ক্যান প্রতিরোধ করা হয়েছে: এই শিক্ষার্থীর আজকের প্রবেশ (Entry) ইতিমধ্যে ${todayRecord.entryTime} টায় নথিভুক্ত হয়েছে।`,
    };
  }

  if (direction === 'EXIT' && todayRecord.exitTime) {
    return {
      allowed: false,
      reason: `ডুপ্লিকেট স্ক্যান প্রতিরোধ করা হয়েছে: এই শিক্ষার্থীর আজকের প্রস্থান (Exit) ইতিমধ্যে ${todayRecord.exitTime} টায় নথিভুক্ত হয়েছে।`,
    };
  }

  if (direction === 'EXIT' && todayRecord.entryTime) {
    const entryMins = parseTimeToMinutes(todayRecord.entryTime);
    if (entryMins !== null && Math.abs(nowMinutesFromMidnight - entryMins) < cooldownMinutes) {
      return {
        allowed: false,
        reason: `কুলডাউন সতর্কতা: Entry এবং Exit স্ক্যানের মধ্যে অন্তত ${cooldownMinutes} মিনিট ব্যবধান থাকতে হবে।`,
      };
    }
  }

  return { allowed: true };
}

export function parseTimeToMinutes(timeStr: string): number | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export function formatCurrencyBdt(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

export function formatDateReadable(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

/**
 * Formats a positive rank integer into standard Bangla ordinal (e.g. ১ম স্থান, ২য় স্থান, ৩য় স্থান, ৪র্থ স্থান).
 */
export function toBanglaOrdinal(rank: number): string {
  if (rank <= 0 || !Number.isFinite(rank)) return '—';
  if (rank === 1) return '১ম স্থান';
  if (rank === 2) return '২য় স্থান';
  if (rank === 3) return '৩য় স্থান';
  if (rank === 4) return '৪র্থ স্থান';
  if (rank === 6) return '৬ষ্ঠ স্থান';
  if (rank === 5 || rank === 7 || rank === 8 || rank === 9 || rank === 10) {
    return `${toBanglaNumber(rank)}ম স্থান`;
  }
  return `${toBanglaNumber(rank)}তম স্থান`;
}

export interface MeritPositionInfo {
  rank: number | null;
  totalInGroup: number;
  rankBn: string;
  rankEn: string;
}

/**
 * Computes merit positions per (examId, className) among published (or provided) results.
 * Passing students are ranked by GPA descending, then totalMarks descending, then roll ascending.
 */
export function computeMeritPositions(
  results: StudentResult[]
): Map<string, MeritPositionInfo> {
  const groups = new Map<string, StudentResult[]>();
  for (const res of results) {
    const key = `${res.examId}::${res.className}`;
    const list = groups.get(key) || [];
    list.push(res);
    groups.set(key, list);
  }

  const map = new Map<string, MeritPositionInfo>();

  for (const [, list] of groups.entries()) {
    const sorted = [...list].sort((a, b) => {
      if (a.passed !== b.passed) return a.passed ? -1 : 1;
      if (b.gpa !== a.gpa) return b.gpa - a.gpa;
      if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks;
      return a.roll - b.roll;
    });

    const totalInGroup = sorted.length;
    let currentRank = 0;

    sorted.forEach((item) => {
      if (!item.passed) {
        map.set(item.id, {
          rank: null,
          totalInGroup,
          rankBn: 'উত্তীর্ণ নয়',
          rankEn: 'Not Ranked',
        });
        return;
      }
      currentRank += 1;
      const suffix =
        currentRank === 1 ? 'st' : currentRank === 2 ? 'nd' : currentRank === 3 ? 'rd' : 'th';
      map.set(item.id, {
        rank: currentRank,
        totalInGroup,
        rankBn: toBanglaOrdinal(currentRank),
        rankEn: `${currentRank}${suffix} Place`,
      });
    });
  }

  return map;
}

