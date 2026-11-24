import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateToGateTime,
  parseScanTimeToMinutes,
  resolveAutoGateDirection,
} from './rfidGateHelpers';
import type { AttendanceRecord } from '../types';

const sampleAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: '2026-10-001',
    studentName: 'Md. Rafiul Islam',
    className: 'Class 10',
    section: 'A (পদ্মা)',
    date: '2026-11-20',
    entryTime: '09:55 AM',
    status: 'Present',
    source: 'RFID',
    cardUid: 'RFID-1001',
  },
  {
    id: 'att-2',
    studentId: '2026-10-002',
    studentName: 'Nusrat Jahan',
    className: 'Class 10',
    section: 'A (পদ্মা)',
    date: '2026-11-20',
    entryTime: '09:50 AM',
    exitTime: '04:05 PM',
    status: 'Exited',
    source: 'RFID',
    cardUid: 'RFID-1002',
  },
];

test('resolveAutoGateDirection detects ENTRY for unrecorded student and EXIT for present student', () => {
  const newStudent = resolveAutoGateDirection(sampleAttendance, '2026-09-001', '2026-11-20', 'AUTO');
  assert.equal(newStudent.direction, 'ENTRY');
  assert.equal(newStudent.isAutoDetected, true);

  const presentStudent = resolveAutoGateDirection(sampleAttendance, '2026-10-001', '2026-11-20', 'AUTO');
  assert.equal(presentStudent.direction, 'EXIT');
  assert.equal(presentStudent.isAutoDetected, true);

  const forcedEntry = resolveAutoGateDirection(sampleAttendance, '2026-10-001', '2026-11-20', 'ENTRY');
  assert.equal(forcedEntry.direction, 'ENTRY');
  assert.equal(forcedEntry.isAutoDetected, false);
});

test('parseScanTimeToMinutes converts 12-hour AM/PM labels accurately', () => {
  assert.equal(parseScanTimeToMinutes('09:55 AM'), 595);
  assert.equal(parseScanTimeToMinutes('10:15 AM'), 615);
  assert.equal(parseScanTimeToMinutes('12:00 PM'), 720);
  assert.equal(parseScanTimeToMinutes('04:05 PM'), 965);
  assert.equal(parseScanTimeToMinutes('12:05 AM'), 5);
});

test('formatDateToGateTime formats 24h Date to 12h clock and minutes', () => {
  const morning = new Date(2026, 10, 20, 9, 45, 8);
  const formatted = formatDateToGateTime(morning);
  assert.equal(formatted.label, '09:45 AM');
  assert.equal(formatted.minutes, 585);
  assert.equal(formatted.clockWithSeconds, '09:45:08 AM');
});
