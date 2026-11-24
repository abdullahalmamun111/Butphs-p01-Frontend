import type { AttendanceRecord, ScanDirection } from '../types';

export type GateScanMode = 'AUTO' | 'ENTRY' | 'EXIT';

export interface GateDirectionResolution {
  direction: ScanDirection;
  isAutoDetected: boolean;
  statusHintBn: string;
}

/**
 * Resolves whether an RFID tap should be recorded as ENTRY or EXIT.
 * In AUTO mode:
 * - If student has no attendance record for the date -> ENTRY
 * - If student already entered (Present or Late) and has not exited yet -> EXIT
 * - If student already exited -> EXIT (duplicate guard will catch repeated exit)
 */
export function resolveAutoGateDirection(
  attendance: AttendanceRecord[],
  studentId: string,
  date: string,
  mode: GateScanMode
): GateDirectionResolution {
  if (mode === 'ENTRY') {
    return { direction: 'ENTRY', isAutoDetected: false, statusHintBn: 'ম্যানুয়াল প্রবেশ মোড' };
  }
  if (mode === 'EXIT') {
    return { direction: 'EXIT', isAutoDetected: false, statusHintBn: 'ম্যানুয়াল প্রস্থান মোড' };
  }

  const existing = attendance.find((a) => a.studentId === studentId && a.date === date);
  if (!existing || existing.status === 'Absent') {
    return { direction: 'ENTRY', isAutoDetected: true, statusHintBn: 'স্বয়ংক্রিয় শনাক্তকরণ: প্রবেশ' };
  }
  if (existing.status === 'Present' || existing.status === 'Late') {
    return { direction: 'EXIT', isAutoDetected: true, statusHintBn: 'স্বয়ংক্রিয় শনাক্তকরণ: প্রস্থান' };
  }
  return { direction: 'EXIT', isAutoDetected: true, statusHintBn: 'ইতিমধ্যে প্রস্থান নথিভুক্ত' };
}

/**
 * Converts a 12-hour time string (e.g. "09:55 AM", "04:05 PM") into minutes since midnight.
 */
export function parseScanTimeToMinutes(timeLabel: string): number {
  const match = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 595; // 09:55 AM fallback
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Formats a Date into a 12-hour gate terminal clock label (e.g., "09:55 AM") and minutes since midnight.
 */
export function formatDateToGateTime(now: Date): { label: string; minutes: number; clockWithSeconds: string } {
  const h24 = now.getHours();
  const mins = now.getMinutes();
  const secs = now.getSeconds();
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const hh = String(h12).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return {
    label: `${hh}:${mm} ${meridiem}`,
    minutes: h24 * 60 + mins,
    clockWithSeconds: `${hh}:${mm}:${ss} ${meridiem}`,
  };
}
