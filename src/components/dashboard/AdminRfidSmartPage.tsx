import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Printer,
  Radio,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import { CLASS_LIST, SECTION_LIST } from '../../constants/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useSchoolStore } from '../../store/SchoolStore';
import { toBanglaDigits } from '../../utils/noticeUtils';
import { buildDailyAttendanceRoster } from '../../utils/portalHelpers';
import { printElementById } from '../../utils/printDocument';
import { RfidScannerWidget } from '../shared/RfidScannerWidget';
import { EmptyState } from '../ui/EmptyState';
import type { AttendanceStatus } from '../../types';

export function AdminRfidSmartPage({
  defaultTab = 'attendance',
}: {
  defaultTab?: 'attendance' | 'rfid' | 'cards';
}) {
  const {
    db,
    saveManualAttendance,
    bulkMarkClassAttendance,
    sendAbsentGuardiansSms,
    assignRfidCard,
    updateRfidCardStatus,
    addToast,
  } = useSchoolStore();
  const { user } = useAuth();

  const [tab, setTab] = useState<'attendance' | 'rfid' | 'cards'>(defaultTab);
  useEffect(() => setTab(defaultTab), [defaultTab]);

  // Unified Smart Filter State (Date · Class · Section · Status · Search)
  const [selectedDate, setSelectedDate] = useState('2026-11-20');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Present' | 'Late' | 'Absent' | 'Unmarked'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // RFID Card Assign State
  const [cardUid, setCardUid] = useState('');
  const [assignStudentId, setAssignStudentId] = useState(db.students[0]?.studentId || '');
  const [cardSearch, setCardSearch] = useState('');

  const { rows, stats } = useMemo(
    () =>
      buildDailyAttendanceRoster({
        students: db.students,
        attendance: db.attendance,
        date: selectedDate,
        className: selectedClass,
        section: selectedSection,
        statusFilter,
        query: searchQuery,
      }),
    [db.students, db.attendance, selectedDate, selectedClass, selectedSection, statusFilter, searchQuery]
  );

  const absentIds = useMemo(
    () => rows.filter((r) => r.status === 'Absent').map((r) => r.studentId),
    [rows]
  );

  const todayRfidFeed = useMemo(
    () => db.attendance.filter((a) => a.date === selectedDate && a.source === 'RFID').slice(0, 8),
    [db.attendance, selectedDate]
  );

  const filteredCards = useMemo(() => {
    const q = cardSearch.trim().toLowerCase();
    return db.rfidCards.filter((c) => {
      if (selectedClass !== 'ALL' && c.className !== selectedClass) return false;
      if (selectedSection !== 'ALL' && c.section !== selectedSection) return false;
      if (!q) return true;
      return (
        c.cardUid.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.studentId.toLowerCase().includes(q)
      );
    });
  }, [db.rfidCards, selectedClass, selectedSection, cardSearch]);

  const handleQuickStatus = (studentId: string, status: AttendanceStatus) => {
    saveManualAttendance(studentId, selectedDate, status, '', user?.nameBn || 'Admin');
  };

  const handleBulkPresent = () => {
    const targetIds = rows.map((r) => r.studentId);
    bulkMarkClassAttendance(targetIds, selectedDate, 'Present', user?.nameBn || 'Admin');
  };

  const handleAbsentSms = () => {
    if (absentIds.length === 0) {
      addToast('info', 'কোনো অনুপস্থিত শিক্ষার্থী নেই', 'বর্তমান ফিল্টারে কোনো অনুপস্থিত শিক্ষার্থী পাওয়া যায়নি।');
      return;
    }
    sendAbsentGuardiansSms(absentIds, selectedDate, user?.nameBn || 'Admin');
  };

  const handleExportCsv = () => {
    const header = ['Date', 'StudentID', 'Roll', 'Name', 'Class', 'Section', 'RFID_UID', 'Entry', 'Exit', 'Status', 'Source'];
    const lines = rows.map((r) =>
      [
        selectedDate,
        r.studentId,
        r.roll,
        `"${r.nameBn}"`,
        r.className,
        `"${r.section}"`,
        r.rfidCardUid || '',
        r.entryTime || '',
        r.exitTime || '',
        r.status,
        r.source || '',
      ].join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `butphs-attendance-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'হাজিরা শিট CSV ডাউনলোড হয়েছে', `butphs-attendance-${selectedDate}.csv`);
  };

  const handleAssignCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardUid.trim() || !assignStudentId) return;
    const res = assignRfidCard(cardUid.trim(), assignStudentId, user?.nameBn || 'Admin');
    if (res.ok) setCardUid('');
  };

  return (
    <div className="space-y-5 font-bn">
      {/* Unified Smart Filter Bar (Date · Class · Section · Status · Search) */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap bg-slate-100 p-1 rounded-lg">
            {(
              [
                { id: 'attendance', label: 'দৈনিক হাজিরা শিট', icon: Calendar },
                { id: 'rfid', label: 'লাইভ RFID গেট স্ক্যান', icon: Radio },
                { id: 'cards', label: 'RFID কার্ড রেজিস্ট্রি', icon: CreditCard },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    active ? 'bg-white text-[#1B2A6B] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV এক্সপোর্ট</span>
            </button>
            <button
              type="button"
              onClick={() => printElementById('butphs-attendance-sheet-print', `দৈনিক হাজিরা শিট — ${selectedDate}`)}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>
          </div>
        </div>

        {/* Date, Class, Section, Status & Search Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100">
          <div>
            <label htmlFor="rfid-filter-date" className="block text-[11px] font-medium text-slate-500 mb-1">তারিখ</label>
            <input
              id="rfid-filter-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-9 px-3 text-xs sm:text-sm border border-slate-300 rounded-lg tabular-nums bg-white"
            />
          </div>
          <div>
            <label htmlFor="rfid-filter-class" className="block text-[11px] font-medium text-slate-500 mb-1">শ্রেণি</label>
            <select
              id="rfid-filter-class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-9 px-3 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">সকল শ্রেণি (৬ষ্ঠ–১০ম)</option>
              {CLASS_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rfid-filter-section" className="block text-[11px] font-medium text-slate-500 mb-1">শাখা</label>
            <select
              id="rfid-filter-section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full h-9 px-3 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">সকল শাখা</option>
              {SECTION_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rfid-filter-status" className="block text-[11px] font-medium text-slate-500 mb-1">উপস্থিতি অবস্থা</label>
            <select
              id="rfid-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full h-9 px-3 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">সকল অবস্থা</option>
              <option value="Present">উপস্থিত</option>
              <option value="Late">বিলম্বে প্রবেশ</option>
              <option value="Absent">অনুপস্থিত</option>
              <option value="Unmarked">অচিহ্নিত</option>
            </select>
          </div>
          <div>
            <label htmlFor="rfid-filter-search" className="block text-[11px] font-medium text-slate-500 mb-1">দ্রুত অনুসন্ধান</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
              <input
                id="rfid-filter-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম, রোল বা কার্ড নং..."
                className="w-full h-9 pl-8 pr-3 text-xs sm:text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Attendance Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#1B2A6B]" />
            <span>মোট শিক্ষার্থী</span>
          </p>
          <p className="text-2xl font-bold text-[#1B2A6B] tabular-nums mt-1">{toBanglaDigits(stats.total)} জন</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#1F7A4D]" />
            <span>উপস্থিত</span>
          </p>
          <p className="text-2xl font-bold text-[#1F7A4D] tabular-nums mt-1">{toBanglaDigits(stats.present)} জন</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>বিলম্বে প্রবেশ</span>
          </p>
          <p className="text-2xl font-bold text-amber-700 tabular-nums mt-1">{toBanglaDigits(stats.late)} জন</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <UserX className="w-3.5 h-3.5 text-rose-600" />
            <span>অনুপস্থিত</span>
          </p>
          <p className="text-2xl font-bold text-rose-700 tabular-nums mt-1">{toBanglaDigits(stats.absent)} জন</p>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">উপস্থিতির হার</span>
            <span className="font-bold text-[#1F7A4D] tabular-nums">{toBanglaDigits(stats.ratePct)}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#1F7A4D] rounded-full transition-all" style={{ width: `${stats.ratePct}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 tabular-nums">অচিহ্নিত: {toBanglaDigits(stats.unmarked)} জন</p>
        </div>
      </div>

      {/* TAB 1: SMART DAILY ATTENDANCE REGISTER */}
      {tab === 'attendance' && (
        <div id="butphs-attendance-sheet-print" className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#1B2A6B]">
                দৈনিক শ্রেণি ও RFID হাজিরা শিট ({selectedDate})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                এক ক্লিকে যেকোনো শিক্ষার্থীর উপস্থিতি হালনাগাদ করুন অথবা অনুপস্থিতদের অভিভাবককে তাৎক্ষণিক SMS পাঠান।
              </p>
            </div>
            <div className="no-print flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleBulkPresent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>সবাই উপস্থিত মার্ক করুন</span>
              </button>
              <button
                type="button"
                onClick={handleAbsentSms}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1B2A6B] bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>অনুপস্থিতদের SMS ({toBanglaDigits(absentIds.length)})</span>
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState title="কোনো শিক্ষার্থী পাওয়া যায়নি" description="শ্রেণি, শাখা বা অনুসন্ধান শব্দ পরিবর্তন করে চেষ্টা করুন।" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">রোল ও শিক্ষার্থী</th>
                    <th className="py-3 px-4 font-semibold">শ্রেণি ও শাখা</th>
                    <th className="py-3 px-4 font-semibold">RFID কার্ড</th>
                    <th className="py-3 px-4 font-semibold">প্রবেশ / প্রস্থান</th>
                    <th className="py-3 px-4 font-semibold">মাধ্যম</th>
                    <th className="py-3 px-4 font-semibold text-right">দ্রুত হাজিরা পরিবর্তন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.studentId} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-[#1B2A6B] text-xs font-bold tabular-nums flex items-center justify-center shrink-0">
                            {toBanglaDigits(r.roll)}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{r.nameBn}</p>
                            <p className="text-[11px] text-slate-500 tabular-nums">{r.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {r.className} · {r.section}
                      </td>
                      <td className="py-3 px-4 text-xs tabular-nums text-slate-600">
                        {r.rfidCardUid || 'বরাদ্দ নেই'}
                      </td>
                      <td className="py-3 px-4 text-xs tabular-nums text-slate-700">
                        {r.entryTime || '—'} / {r.exitTime || '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {r.source === 'RFID' ? 'RFID গেট' : r.source === 'Manual' ? 'ম্যানুয়াল' : 'অচিহ্নিত'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                          {(
                            [
                              { val: 'Present', label: 'উপস্থিত', activeCls: 'bg-[#1F7A4D] text-white' },
                              { val: 'Late', label: 'বিলম্ব', activeCls: 'bg-amber-600 text-white' },
                              { val: 'Absent', label: 'অনুপস্থিত', activeCls: 'bg-rose-600 text-white' },
                            ] as const
                          ).map((opt) => {
                            const isSelected =
                              r.status === opt.val || (opt.val === 'Present' && r.status === 'Exited');
                            return (
                              <button
                                key={opt.val}
                                type="button"
                                onClick={() => handleQuickStatus(r.studentId, opt.val)}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                                  isSelected ? opt.activeCls : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE RFID GATE CONSOLE + TODAY'S FEED */}
      {tab === 'rfid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <RfidScannerWidget selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-[#1B2A6B] inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1F7A4D]" />
                <span>গেট পাঞ্চ লাইভ ফিড ({selectedDate})</span>
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">{toBanglaDigits(todayRfidFeed.length)} টি স্ক্যান</span>
            </div>
            {todayRfidFeed.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                নির্বাচিত তারিখে কোনো RFID গেট স্ক্যান রেকর্ড হয়নি। বাম পাশের স্ক্যানার থেকে কার্ড পাঞ্চ করুন।
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {todayRfidFeed.map((log) => (
                  <li key={log.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{log.studentName}</p>
                      <p className="text-slate-500 tabular-nums">
                        {log.className} · {log.cardUid || log.studentId}
                      </p>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className={`font-semibold ${log.status === 'Late' ? 'text-amber-700' : 'text-[#1F7A4D]'}`}>
                        {log.status === 'Exited' ? 'প্রস্থান' : log.status === 'Late' ? 'বিলম্বে প্রবেশ' : 'প্রবেশ'}
                      </p>
                      <p className="text-[11px] text-slate-500">{log.exitTime || log.entryTime}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RFID CARD REGISTRY */}
      {tab === 'cards' && (
        <div className="space-y-5">
          <form onSubmit={handleAssignCard} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-[#1B2A6B]">নতুন RFID স্মার্ট কার্ড বরাদ্দ করুন</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label htmlFor="smart-card-uid" className="block text-xs font-medium text-slate-600 mb-1">কার্ড UID *</label>
                <input
                  id="smart-card-uid"
                  required
                  value={cardUid}
                  onChange={(e) => setCardUid(e.target.value)}
                  placeholder="যেমন: RFID-1099"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="smart-card-stu" className="block text-xs font-medium text-slate-600 mb-1">শিক্ষার্থী নির্বাচন</label>
                <select
                  id="smart-card-stu"
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {db.students.map((s) => (
                    <option key={s.id} value={s.studentId}>
                      {s.studentId} — {s.nameBn} ({s.className})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="h-10 px-4 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
              >
                কার্ড সক্রিয় ও বরাদ্দ করুন
              </button>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#1B2A6B]">
                নিবন্ধিত RFID কার্ড তালিকা ({toBanglaDigits(filteredCards.length)} টি)
              </h3>
              <input
                type="search"
                aria-label="Search RFID cards"
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                placeholder="কার্ড UID বা শিক্ষার্থীর নাম..."
                className="h-9 px-3 text-xs border border-slate-300 rounded-lg w-56"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-semibold">কার্ড UID</th>
                    <th className="py-3 px-4 font-semibold">শিক্ষার্থী</th>
                    <th className="py-3 px-4 font-semibold">শ্রেণি ও শাখা</th>
                    <th className="py-3 px-4 font-semibold">সর্বশেষ স্ক্যান</th>
                    <th className="py-3 px-4 font-semibold">অবস্থা</th>
                    <th className="py-3 px-4 font-semibold text-right">নিয়ন্ত্রণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCards.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 px-4 tabular-nums font-semibold text-[#1B2A6B]">{c.cardUid}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{c.studentName}</p>
                        <p className="text-[11px] text-slate-500 tabular-nums">{c.studentId}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{c.className} · {c.section}</td>
                      <td className="py-3 px-4 text-xs tabular-nums text-slate-600">{c.lastScannedAt || '—'}</td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        <span className={c.status === 'Active' ? 'text-[#1F7A4D]' : 'text-rose-700'}>
                          {c.status === 'Active' ? 'সক্রিয়' : 'হারানো / ব্লকড'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            updateRfidCardStatus(
                              c.id,
                              c.status === 'Active' ? 'Lost' : 'Active',
                              user?.nameBn || 'Admin'
                            )
                          }
                          className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                        >
                          {c.status === 'Active' ? 'ব্লক করুন' : 'পুনরায় সক্রিয়'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
