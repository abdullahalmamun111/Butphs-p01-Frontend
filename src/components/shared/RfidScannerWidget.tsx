import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  LogIn,
  LogOut,
  MessageSquare,
  Play,
  Radio,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import { useSchoolStore } from '../../store/SchoolStore';
import { useAuth } from '../../providers/AuthProvider';
import {
  formatDateToGateTime,
  parseScanTimeToMinutes,
  resolveAutoGateDirection,
  type GateScanMode,
} from '../../utils/rfidGateHelpers';
import { toBanglaDigits } from '../../utils/noticeUtils';
import type { AttendanceRecord, ScanDirection, SmsLog } from '../../types';

interface RfidScannerWidgetProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

interface GatePassFeedback {
  ok: boolean;
  message: string;
  cardUid: string;
  studentNameBn?: string;
  studentId?: string;
  classLabel?: string;
  direction?: 'ENTRY' | 'EXIT';
  timeLabel?: string;
  record?: AttendanceRecord;
  sms?: SmsLog;
}

const TIME_PRESETS = [
  { id: '09:55 AM', labelBn: '০৯:৫৫ AM (সময়মতো প্রবেশ)', minutes: 595 },
  { id: '10:15 AM', labelBn: '১০:১৫ AM (বিলম্বে প্রবেশ)', minutes: 615 },
  { id: '04:05 PM', labelBn: '০৪:০৫ PM (ছুটি / প্রস্থান)', minutes: 965 },
  { id: 'LIVE', labelBn: 'বর্তমান সময় (লাইভ ঘড়ি)', minutes: -1 },
] as const;

export function RfidScannerWidget({ selectedDate, onDateChange }: RfidScannerWidgetProps) {
  const { db, simulateRfidScan } = useSchoolStore();
  const { user } = useAuth();
  const uidInputRef = useRef<HTMLInputElement>(null);

  const [internalDate, setInternalDate] = useState(selectedDate || '2026-11-20');
  const activeDate = selectedDate ?? internalDate;

  const [cardUidInput, setCardUidInput] = useState(db.rfidCards[0]?.cardUid || 'RFID-1001');
  const [scanMode, setScanMode] = useState<GateScanMode>('AUTO');
  const [timePreset, setTimePreset] = useState<(typeof TIME_PRESETS)[number]['id']>('09:55 AM');
  const [liveClock, setLiveClock] = useState(() => formatDateToGateTime(new Date()));
  const [feedback, setFeedback] = useState<GatePassFeedback | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveClock(formatDateToGateTime(new Date()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleDateUpdate = (nextDate: string) => {
    setInternalDate(nextDate);
    onDateChange?.(nextDate);
  };

  // Map student current gate status on activeDate for the tactile quick-tap deck
  const cardDeck = useMemo(() => {
    return db.rfidCards.slice(0, 8).map((card) => {
      const rec = db.attendance.find((a) => a.studentId === card.studentId && a.date === activeDate);
      const stu = db.students.find((s) => s.studentId === card.studentId);
      const gateState: 'waiting' | 'inside' | 'exited' =
        !rec || rec.status === 'Absent'
          ? 'waiting'
          : rec.status === 'Exited'
            ? 'exited'
            : 'inside';
      return {
        card,
        student: stu,
        record: rec,
        gateState,
      };
    });
  }, [db.rfidCards, db.attendance, db.students, activeDate]);

  const executeCardPunch = (rawUid: string, overrideTime?: string) => {
    const cleanUid = rawUid.trim().toUpperCase();
    if (!cleanUid) return;

    const card = db.rfidCards.find((c) => c.cardUid.toUpperCase() === cleanUid);
    const student = card ? db.students.find((s) => s.studentId === card.studentId) : undefined;

    const resolution = student
      ? resolveAutoGateDirection(db.attendance, student.studentId, activeDate, scanMode)
      : {
          direction: (scanMode === 'EXIT' ? 'EXIT' : 'ENTRY') as ScanDirection,
          isAutoDetected: false,
          statusHintBn: '',
        };

    const effectiveDirection = resolution.direction;
    let effectiveTimeLabel: string;
    let effectiveMinutes: number;

    if (overrideTime) {
      effectiveTimeLabel = overrideTime;
      effectiveMinutes = parseScanTimeToMinutes(overrideTime);
    } else if (timePreset === 'LIVE') {
      const nowTime = formatDateToGateTime(new Date());
      effectiveTimeLabel = nowTime.label;
      effectiveMinutes = nowTime.minutes;
    } else if (scanMode === 'AUTO' && effectiveDirection === 'EXIT' && timePreset !== '04:05 PM') {
      effectiveTimeLabel = '04:05 PM';
      effectiveMinutes = 965;
    } else {
      effectiveTimeLabel = timePreset;
      effectiveMinutes = parseScanTimeToMinutes(timePreset);
    }

    const res = simulateRfidScan(
      cleanUid,
      effectiveDirection,
      effectiveTimeLabel,
      effectiveMinutes,
      activeDate,
      user?.nameBn || user?.name || 'প্রশাসনিক কর্মকর্তা'
    );

    setCardUidInput(cleanUid);
    setFeedback({
      ok: res.ok,
      message: res.message,
      cardUid: cleanUid,
      studentNameBn: student?.nameBn || card?.studentName,
      studentId: student?.studentId || card?.studentId,
      classLabel: student ? `${student.className} · ${student.section} · রোল ${toBanglaDigits(student.roll)}` : card?.className,
      direction: effectiveDirection,
      timeLabel: effectiveTimeLabel,
      record: res.record,
      sms: res.sms,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCardPunch(cardUidInput);
    uidInputRef.current?.select();
  };

  // Realistic Morning Gate Arrival Wave using registered active mock cards
  const handleSimulateGateWave = () => {
    const waitingCards = cardDeck.filter(
      (item) => item.card.status === 'Active' && item.gateState === 'waiting'
    );
    const batch = waitingCards.slice(0, 3);
    if (batch.length === 0) {
      setFeedback({
        ok: false,
        cardUid: 'GATE-WAVE',
        message: 'নির্বাচিত তারিখে সকল ডেমো কার্ডের প্রবেশ ইতিমধ্যে সম্পন্ন হয়েছে। অন্য তারিখ নির্বাচন করুন বা প্রস্থান পাঞ্চ করুন।',
      });
      return;
    }
    const waveTimes = ['09:50 AM', '09:56 AM', '10:12 AM'];
    let lastResult: GatePassFeedback | null = null;
    batch.forEach((item, idx) => {
      const t = waveTimes[idx] || '09:58 AM';
      const res = simulateRfidScan(
        item.card.cardUid,
        'ENTRY',
        t,
        parseScanTimeToMinutes(t),
        activeDate,
        user?.nameBn || user?.name || 'প্রশাসনিক কর্মকর্তা'
      );
      lastResult = {
        ok: res.ok,
        message: `${toBanglaDigits(batch.length)} জন শিক্ষার্থীর গেট প্রবেশ সিমুলেশন সম্পন্ন (সর্বশেষ: ${item.student?.nameBn || item.card.studentName})।`,
        cardUid: item.card.cardUid,
        studentNameBn: item.student?.nameBn || item.card.studentName,
        studentId: item.card.studentId,
        classLabel: item.student
          ? `${item.student.className} · ${item.student.section} · রোল ${toBanglaDigits(item.student.roll)}`
          : item.card.className,
        direction: 'ENTRY',
        timeLabel: t,
        record: res.record,
        sms: res.sms,
      };
    });
    if (lastResult) setFeedback(lastResult);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden font-bn">
      {/* Terminal Top Hardware Status Bar */}
      <div className="px-5 py-4 bg-[#F7F8FC] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-[#1F7A4D] text-white flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-[#1B2A6B] leading-snug">
              লাইভ RFID গেট টার্মিনাল · Main Gate Reader #01
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              USB রিডার থেকে কার্ড স্ক্যান করুন অথবা নিচের নিবন্ধিত শিক্ষার্থী কার্ডে ট্যাপ করুন।
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 pl-13 sm:pl-0">
          <p className="text-sm font-bold text-[#1B2A6B] tabular-nums leading-none whitespace-nowrap">
            {liveClock.clockWithSeconds}
          </p>
          <p className="text-[11px] font-medium text-[#1F7A4D] inline-flex items-center gap-1 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>রিডার সংযুক্ত · SMS অটো</span>
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Hardware Card Scanner Input + Mode Controls */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          {/* Row 1: Spacious Card UID Reader Input + Primary Punch CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-8">
              <label htmlFor="rfid-hardware-uid" className="block text-xs font-semibold text-[#1B2A6B] mb-1">
                কার্ড UID স্ক্যান ইনপুট (USB Reader / Enter)
              </label>
              <div className="relative">
                <ScanLine className="w-4 h-4 text-[#1F7A4D] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  ref={uidInputRef}
                  id="rfid-hardware-uid"
                  value={cardUidInput}
                  onChange={(e) => setCardUidInput(e.target.value)}
                  placeholder="যেমন: RFID-1001 লিখে Enter চাপুন..."
                  className="w-full h-10 pl-9 pr-3 text-sm font-semibold text-[#1B2A6B] bg-white border border-slate-300 focus:border-[#1F7A4D] focus:outline-none rounded-lg tabular-nums"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <button
                type="submit"
                className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Radio className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>কার্ড পাঞ্চ করুন</span>
              </button>
            </div>
          </div>

          {/* Row 2: Unclipped Time Preset + Date Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="rfid-time-preset" className="block text-xs font-medium text-slate-600 mb-1">
                পাঞ্চ সময়
              </label>
              <select
                id="rfid-time-preset"
                value={timePreset}
                onChange={(e) => setTimePreset(e.target.value as (typeof TIME_PRESETS)[number]['id'])}
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg tabular-nums"
              >
                {TIME_PRESETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.labelBn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rfid-terminal-date" className="block text-xs font-medium text-slate-600 mb-1">
                তারিখ
              </label>
              <input
                id="rfid-terminal-date"
                type="date"
                value={activeDate}
                onChange={(e) => handleDateUpdate(e.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg tabular-nums"
              />
            </div>
          </div>

          {/* Mode Toggle Strip + Realistic Wave Demo Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div role="radiogroup" aria-label="গেট স্ক্যান মোড" className="inline-flex bg-slate-100 p-1 rounded-lg">
              {(
                [
                  { id: 'AUTO', label: 'স্বয়ংক্রিয় (Auto)' },
                  { id: 'ENTRY', label: 'প্রবেশ (Entry)' },
                  { id: 'EXIT', label: 'প্রস্থান (Exit)' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setScanMode(m.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    scanMode === m.id
                      ? 'bg-[#1B2A6B] text-white'
                      : 'text-slate-600 hover:text-[#1B2A6B]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSimulateGateWave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1B2A6B] bg-[#F7F8FC] hover:bg-slate-200/70 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#1F7A4D]" aria-hidden="true" />
              <span>গেট আগমন সিমুলেট করুন (৩ জন)</span>
            </button>
          </div>
        </form>

        {/* Instant Scanned Student Gate Pass Result */}
        {feedback && (
          <div
            role="status"
            data-testid="rfid-gate-pass-result"
            className={`rounded-xl border p-4 space-y-3 ${
              feedback.ok
                ? 'bg-emerald-50/50 border-[#1F7A4D]/35 text-slate-800'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                    feedback.ok ? 'bg-[#1F7A4D] text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {feedback.ok ? (
                    feedback.direction === 'EXIT' ? (
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <LogIn className="w-5 h-5" aria-hidden="true" />
                    )
                  ) : (
                    <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1B2A6B] leading-snug">
                    {feedback.studentNameBn ? `${feedback.studentNameBn} · ${feedback.cardUid}` : feedback.cardUid}
                  </p>
                  {feedback.classLabel && (
                    <p className="text-xs text-slate-600 mt-0.5 tabular-nums">
                      {feedback.classLabel} · আইডি: {feedback.studentId}
                    </p>
                  )}
                  <p className="text-xs font-medium mt-1 flex items-center gap-1.5">
                    {feedback.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                  </p>
                </div>
              </div>

              {feedback.ok && feedback.timeLabel && (
                <div className="text-right shrink-0 tabular-nums">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                      feedback.record?.status === 'Late'
                        ? 'bg-amber-100 text-amber-800'
                        : feedback.direction === 'EXIT'
                          ? 'bg-slate-200 text-[#1B2A6B]'
                          : 'bg-[#1F7A4D] text-white'
                    }`}
                  >
                    {feedback.direction === 'EXIT'
                      ? 'প্রস্থান নিশ্চিত'
                      : feedback.record?.status === 'Late'
                        ? 'বিলম্বে প্রবেশ'
                        : 'সময়মতো উপস্থিত'}
                  </span>
                  <p className="text-xs text-slate-600 mt-1 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    <span>{feedback.timeLabel}</span>
                  </p>
                </div>
              )}
            </div>

            {feedback.sms && (
              <div className="pt-2.5 border-t border-slate-200/80 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[#1B2A6B] font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#1F7A4D]" aria-hidden="true" />
                    <span>
                      অভিভাবক SMS প্রেরিত · {feedback.sms.recipientName} ({feedback.sms.recipientPhone})
                    </span>
                  </span>
                  <span className="text-[#1F7A4D] font-semibold">Delivered ✓</span>
                </div>
                <p className="text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
                  {feedback.sms.message}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick-Tap Registered Mock Student RFID Card Deck */}
        <div className="space-y-2.5 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-[#1B2A6B] inline-flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#1F7A4D]" aria-hidden="true" />
              <span>দ্রুত ট্যাপ কার্ড ডেক (নিবন্ধিত শিক্ষার্থী কার্ড)</span>
            </h3>
            <span className="text-[11px] text-slate-500">যেকোনো কার্ডে ক্লিক করে সরাসরি পাঞ্চ করুন</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cardDeck.map(({ card, student, gateState }) => {
              const isBlocked = card.status !== 'Active';
              const statusText = isBlocked
                ? 'ব্লকড'
                : gateState === 'waiting'
                  ? 'প্রবেশ অপেক্ষমান'
                  : gateState === 'inside'
                    ? 'ক্যাম্পাসে আছে → প্রস্থান'
                    : 'প্রস্থান সম্পন্ন';
              const statusColor = isBlocked
                ? 'text-rose-700 bg-rose-50'
                : gateState === 'waiting'
                  ? 'text-[#1B2A6B] bg-slate-100'
                  : gateState === 'inside'
                    ? 'text-[#1F7A4D] bg-emerald-50'
                    : 'text-slate-500 bg-slate-100';

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => executeCardPunch(card.cardUid)}
                  className="group text-left p-3 rounded-xl border border-slate-200 hover:border-[#1F7A4D] hover:bg-[#F7F8FC] transition-all flex items-center justify-between gap-2.5 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[#1B2A6B] tabular-nums">
                        {card.cardUid}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-500 truncate">{card.className}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-[#1F7A4D] truncate mt-0.5">
                      {student?.nameBn || card.studentName}
                    </p>
                  </div>
                  <span className={`text-[10.5px] font-semibold px-2 py-1 rounded-md shrink-0 ${statusColor}`}>
                    {statusText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
