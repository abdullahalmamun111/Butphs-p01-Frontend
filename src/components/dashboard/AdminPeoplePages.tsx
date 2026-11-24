import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Edit2,
  ExternalLink,
  Eye,
  Globe,
  GraduationCap,
  MessageSquare,
  Plus,
  Printer,
  Radio,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CLASS_LIST, SECTION_LIST } from '../../constants/navigation';
import { SCHOOL_INFO } from '../../config/school';
import { useSchoolStore } from '../../store/SchoolStore';
import { useAuth } from '../../providers/AuthProvider';
import { teacherSchema } from '../../validations/schemas';
import { toBanglaDigits } from '../../utils/noticeUtils';
import { computePendingActionsSummary } from '../../utils/portalHelpers';
import {
  normalizeBdPhone,
  validateStudentWizardStep,
  type StudentWizardFormState,
} from '../../utils/adminFormHelpers';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import type { StaffMember, Student, Teacher } from '../../types';

const TEN_DAY_ATTENDANCE = [
  { day: '০৯ নভে', present: 622, late: 24, absent: 34 },
  { day: '১০ নভে', present: 635, late: 18, absent: 27 },
  { day: '১১ নভে', present: 618, late: 28, absent: 34 },
  { day: '১২ নভে', present: 641, late: 15, absent: 24 },
  { day: '১৩ নভে', present: 629, late: 22, absent: 29 },
  { day: '১৫ নভে', present: 644, late: 16, absent: 20 },
  { day: '১৬ নভে', present: 638, late: 19, absent: 23 },
  { day: '১৭ নভে', present: 647, late: 14, absent: 19 },
  { day: '১৮ নভে', present: 640, late: 18, absent: 22 },
  { day: '১৯ নভে', present: 649, late: 13, absent: 18 },
];

const MONTHLY_FINANCE_DATA = [
  { month: 'জুন', collected: 285000, due: 42000 },
  { month: 'জুলাই', collected: 312000, due: 38000 },
  { month: 'আগস্ট', collected: 298000, due: 45000 },
  { month: 'সেপ্টে', collected: 334000, due: 31000 },
  { month: 'অক্টো', collected: 348000, due: 26000 },
  { month: 'নভে', collected: 365000, due: 22000 },
];

const CLASS_DISTRIBUTION = [
  { name: '৬ষ্ঠ', students: 142, boys: 74, girls: 68 },
  { name: '৭ম', students: 136, boys: 71, girls: 65 },
  { name: '৮ম', students: 128, boys: 66, girls: 62 },
  { name: '৯ম', students: 140, boys: 73, girls: 67 },
  { name: '১০ম', students: 134, boys: 70, girls: 64 },
];

const GENDER_SPLIT = [
  { name: 'ছাত্র', value: 354, color: '#1B2A6B' },
  { name: 'ছাত্রী', value: 326, color: '#1F7A4D' },
];

const SUBJECT_AVERAGES = [
  { subject: 'আইসিটি', avg: 86 },
  { subject: 'বাংলা', avg: 81 },
  { subject: 'বিজ্ঞান', avg: 80 },
  { subject: 'গণিত', avg: 78 },
  { subject: 'ইংরেজি', avg: 75 },
];

export function AdminOverviewPage() {
  const { db } = useSchoolStore();
  const activeStudents = db.students.filter((s) => s.status === 'Active').length;
  const activeTeachers = db.teachers.filter((t) => t.status === 'Active').length;
  const activeStaff = db.staff.filter((s) => s.status === 'Active').length;
  const pendingSummary = computePendingActionsSummary({
    admissions: db.admissions,
    inquiries: db.inquiries,
    results: db.results,
    fees: db.fees,
  });
  const pendingAdmissions = pendingSummary.pendingAdmissions;
  const unreadInquiries = pendingSummary.unreadInquiries;
  const publishedNotices = db.notices.filter((n) => n.status === 'Published').length;
  const draftResults = pendingSummary.unpublishedResults;
  const presentRecords = db.attendance.filter((a) => a.status === 'Present' || a.status === 'Exited' || a.status === 'Late').length;
  const attendancePct = db.attendance.length > 0 ? Math.round((presentRecords / db.attendance.length) * 100) : 95;
  const collectedFeesTotal = db.fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const dueFeesCount = db.fees.filter((f) => f.status !== 'Paid').length;

  const stats = [
    {
      label: 'নিবন্ধিত শিক্ষার্থী',
      value: toBanglaDigits(db.websiteContent.demoStats.studentsCount),
      sub: `সক্রিয় প্রোফাইল: ${toBanglaDigits(activeStudents)} টি`,
      href: '/admin/students',
      icon: Users,
      accent: 'text-[#1B2A6B] bg-indigo-50',
    },
    {
      label: 'শিক্ষক ও কর্মচারী',
      value: toBanglaDigits(activeTeachers + activeStaff),
      sub: `শিক্ষক ${toBanglaDigits(activeTeachers)} · কর্মচারী ${toBanglaDigits(activeStaff)}`,
      href: '/admin/teachers',
      icon: GraduationCap,
      accent: 'text-[#1F7A4D] bg-emerald-50',
    },
    {
      label: 'দৈনিক গড় উপস্থিতি',
      value: `${toBanglaDigits(attendancePct)}%`,
      sub: `${toBanglaDigits(db.attendance.length)} টি RFID ও হাজিরা রেকর্ড`,
      href: '/admin/rfid',
      icon: Radio,
      accent: 'text-[#1F7A4D] bg-emerald-50',
    },
    {
      label: 'আদায়কৃত বেতন-ফি',
      value: `৳${toBanglaDigits(collectedFeesTotal.toLocaleString('en-US'))}`,
      sub: `বকেয়া ইনভয়েস: ${toBanglaDigits(dueFeesCount)} টি`,
      href: '/admin/fees',
      icon: Wallet,
      accent: 'text-amber-700 bg-amber-50',
    },
    {
      label: 'ভর্তি আবেদন ও বার্তা',
      value: toBanglaDigits(pendingAdmissions + unreadInquiries),
      sub: `ভর্তি ${toBanglaDigits(pendingAdmissions)} · বার্তা ${toBanglaDigits(unreadInquiries)}`,
      href: '/admin/admissions',
      icon: ClipboardCheck,
      accent: 'text-sky-700 bg-sky-50',
    },
    {
      label: 'প্রকাশিত নোটিশ',
      value: toBanglaDigits(publishedNotices),
      sub: `কমিটি সদস্য: ${toBanglaDigits(db.committeeMembers.length)} জন`,
      href: '/admin/notices',
      icon: Globe,
      accent: 'text-[#1B2A6B] bg-slate-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.href}
              className="bg-white border border-slate-200/90 hover:border-[#1F7A4D]/60 rounded-xl p-5 transition-colors font-bn flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#1B2A6B] tabular-nums mt-1.5">
                  {s.value}
                </p>
                <p className="text-xs text-[#1F7A4D] mt-1.5 truncate">{s.sub}</p>
              </div>
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.accent}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Analytics Row 1: 10-Day Attendance Stacked BarChart + Monthly Fee Collection AreaChart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
                <span>গত ১০ কর্মদিবসের দৈনিক উপস্থিতি বিশ্লেষণ</span>
              </h2>
              <p className="text-xs text-slate-500 font-bn mt-0.5">
                RFID গেট পাঞ্চ ও শ্রেণি হাজিরা সমন্বিত চিত্র (মোট ৬৮০ শিক্ষার্থী)
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bn text-slate-600">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#1F7A4D]" />উপস্থিত</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-[#C9A961]" />বিলম্ব</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-rose-400" />অনুপস্থিত</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TEN_DAY_ATTENDANCE} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
                  }}
                />
                <Bar dataKey="present" name="উপস্থিত" stackId="a" fill="#1F7A4D" radius={[0, 0, 4, 4]} maxBarSize={26} isAnimationActive={false} />
                <Bar dataKey="late" name="বিলম্ব" stackId="a" fill="#C9A961" maxBarSize={26} isAnimationActive={false} />
                <Bar dataKey="absent" name="অনুপস্থিত" stackId="a" fill="#FB7185" radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
                <span>মাসিক বেতন-ফি আদায় ও বকেয়া</span>
              </h2>
              <p className="text-xs text-slate-500 font-bn mt-0.5">শেষ ৬ মাসের আর্থিক প্রবাহ (টাকা)</p>
            </div>
            <Link to="/admin/fees" className="text-xs font-medium text-[#1F7A4D] hover:underline font-bn">
              বিস্তারিত →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_FINANCE_DATA} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminCollectedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F7A4D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1F7A4D" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="adminDueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10.5, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  formatter={(value) => `৳${Number(value ?? 0).toLocaleString('en-US')}`}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="আদায়"
                  stroke="#1F7A4D"
                  strokeWidth={2.2}
                  fill="url(#adminCollectedFill)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="due"
                  name="বকেয়া"
                  stroke="#D97706"
                  strokeWidth={2}
                  fill="url(#adminDueFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Row 2: Class-wise Student Distribution + Gender Donut + Subject Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
              <span>শ্রেণিভিত্তিক শিক্ষার্থী ও লিঙ্গ অনুপাত</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-7 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CLASS_DISTRIBUTION} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10.5, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar dataKey="boys" name="ছাত্র" fill="#1B2A6B" radius={[3, 3, 0, 0]} maxBarSize={16} isAnimationActive={false} />
                  <Bar dataKey="girls" name="ছাত্রী" fill="#1F7A4D" radius={[3, 3, 0, 0]} maxBarSize={16} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={GENDER_SPLIT}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={56}
                      paddingAngle={3}
                      isAnimationActive={false}
                    >
                      {GENDER_SPLIT.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-3 text-xs font-bn mt-1">
                <span className="inline-flex items-center gap-1 font-semibold text-[#1B2A6B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B2A6B]" />ছাত্র ৫২%
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#1F7A4D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A4D]" />ছাত্রী ৪৮%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
              <span>বিষয়ভিত্তিক গড় নম্বর (%) — অর্ধবার্ষিক ২০২৬</span>
            </h2>
            <Link to="/admin/results" className="text-xs font-medium text-[#1F7A4D] hover:underline font-bn">
              ফলাফল পাতা →
            </Link>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUBJECT_AVERAGES} margin={{ top: 6, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => `${Number(value ?? 0)}%`}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="avg" name="গড় নম্বর (%)" fill="#1F7A4D" radius={[6, 6, 0, 0]} maxBarSize={38} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Row 3: Pending Tasks & Public Website Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 bg-white border border-slate-200/90 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#1B2A6B] pb-3 border-b border-slate-100 font-bn">
            অপেক্ষমাণ কাজ ও দ্রুত প্রশাসনিক কার্যক্রম
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-bn">
            <Link
              to="/admin/results"
              className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:border-amber-400 transition-colors flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-900">
                  {toBanglaDigits(draftResults)} টি ফলাফল অপেক্ষমাণ
                </p>
                <p className="text-[11px] text-amber-800/80 mt-0.5">যাচাই করে প্রকাশ করুন</p>
              </div>
            </Link>
            <Link
              to="/admin/admissions"
              className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-400 transition-colors flex items-start gap-2.5"
            >
              <ClipboardCheck className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-900">
                  {toBanglaDigits(pendingAdmissions)} টি ভর্তি আবেদন
                </p>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">আবেদন পর্যালোচনা</p>
              </div>
            </Link>
            <Link
              to="/admin/inquiries"
              className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 hover:border-indigo-400 transition-colors flex items-start gap-2.5"
            >
              <MessageSquare className="w-4 h-4 text-[#1B2A6B] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#1B2A6B]">
                  {toBanglaDigits(unreadInquiries)} টি নতুন বার্তা
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">হেল্পডেস্ক ইনবক্স</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-bn pt-1">
            <Link to="/admin/rfid" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F7A4D] text-white font-semibold rounded-lg hover:bg-[#165B39]">
              <Radio className="w-4 h-4" />
              <span>RFID গেট হাজিরা টার্মিনাল</span>
            </Link>
            <Link to="/admin/print" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B2A6B] text-white font-semibold rounded-lg hover:bg-[#132056]">
              <Printer className="w-4 h-4" />
              <span>A4 ডকুমেন্ট ও ফি লেজার</span>
            </Link>
          </div>

          {/* Public Website Live Controls */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 font-bn">পাবলিক ওয়েবসাইট দ্রুত নিয়ন্ত্রণ</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bn">
              <Link to="/admin/website" className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F7F8FC] border border-slate-200 text-[#1B2A6B] font-medium rounded-lg hover:border-[#1F7A4D]">
                <Globe className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" />
                <span className="truncate">CMS ও গ্যালারি</span>
              </Link>
              <Link to="/admin/committee" className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F7F8FC] border border-slate-200 text-[#1B2A6B] font-medium rounded-lg hover:border-[#1F7A4D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" />
                <span className="truncate">কমিটি প্রোফাইল</span>
              </Link>
              <Link to="/admin/academics" className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F7F8FC] border border-slate-200 text-[#1B2A6B] font-medium rounded-lg hover:border-[#1F7A4D]">
                <BookOpen className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" />
                <span className="truncate">রুটিন ও লাইব্রেরি</span>
              </Link>
              <Link to="/admin/notices" className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F7F8FC] border border-slate-200 text-[#1B2A6B] font-medium rounded-lg hover:border-[#1F7A4D]">
                <MessageSquare className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0" />
                <span className="truncate">নোটিশ ও SMS</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-base font-semibold text-[#1B2A6B] font-bn inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
            <span>সাম্প্রতিক প্রশাসনিক কার্যক্রম (অডিট লগ)</span>
          </h2>
          <Link to="/admin/audit-logs" className="text-xs font-medium text-[#1F7A4D] hover:underline font-bn">
            সব দেখুন →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100 text-sm">
          {db.auditLogs.slice(0, 5).map((log) => (
            <li key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-bn">
              <p className="text-slate-800">{log.action}</p>
              <p className="text-xs text-slate-500 tabular-nums shrink-0">
                {log.module} · {log.user} · {log.timestamp}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AdminTeachersPage() {
  const { db, addTeacher, updateTeacher, deleteTeacher } = useSchoolStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [viewing, setViewing] = useState<Teacher | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    nameBn: '',
    designation: 'Assistant Teacher',
    designationBn: 'সহকারী শিক্ষক',
    department: 'Science & Laboratory',
    departmentBn: 'বিজ্ঞান ও গবেষণাগার বিভাগ',
    qualification: 'M.Sc, B.Ed',
    email: '',
    phone: '01712-000299',
    joiningDate: new Date().toISOString().slice(0, 10),
    officeRoom: 'শিক্ষক মিলনায়তন',
    photoUrl: SCHOOL_INFO.assets.teacherMaleScience as string,
    bio: '',
    assignedClasses: ['Class 8', 'Class 9'] as string[],
    assignedSubjects: 'General Science (বিজ্ঞান)',
  });

  const TEACHER_DEPARTMENTS = [
    { en: 'Administration & Mathematics', bn: 'প্রশাসন ও গণিত বিভাগ' },
    { en: 'Bangla Literature', bn: 'বাংলা ভাষা ও সাহিত্য বিভাগ' },
    { en: 'English Language', bn: 'ইংরেজি ভাষা বিভাগ' },
    { en: 'Science & Laboratory', bn: 'বিজ্ঞান ও গবেষণাগার বিভাগ' },
    { en: 'ICT & Digital Lab', bn: 'আইসিটি ও কম্পিউটার বিভাগ' },
    { en: 'Business Studies', bn: 'ব্যবসায় শিক্ষা বিভাগ' },
    { en: 'Humanities & Social Science', bn: 'মানবিক ও সমাজবিজ্ঞান বিভাগ' },
    { en: 'Sports & Scouting', bn: 'ক্রীড়া ও স্কাউটিং বিভাগ' },
  ];

  const TEACHER_PHOTO_PRESETS = [
    { label: 'প্রধান শিক্ষক / সিনিয়র পুরুষ', url: SCHOOL_INFO.assets.headTeacher },
    { label: 'পুরুষ শিক্ষক (বিজ্ঞান/গণিত)', url: SCHOOL_INFO.assets.teacherMaleScience },
    { label: 'সিনিয়র শিক্ষিকা (বাংলা)', url: SCHOOL_INFO.assets.teacherFemaleSenior },
    { label: 'সহকারী শিক্ষিকা (ইংরেজি)', url: SCHOOL_INFO.assets.teacherFemaleEnglish },
  ];

  const filtered = db.teachers.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.nameBn.includes(search) ||
        t.employeeId.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        (t.departmentBn || '').includes(search)
      );
    }
    return true;
  });

  const openAdd = () => {
    setEditing(null);
    setFormErr(null);
    setForm({
      name: '',
      nameBn: '',
      designation: 'Assistant Teacher',
      designationBn: 'সহকারী শিক্ষক',
      department: 'Science & Laboratory',
      departmentBn: 'বিজ্ঞান ও গবেষণাগার বিভাগ',
      qualification: 'M.Sc, B.Ed',
      email: '',
      phone: '01712-000299',
      joiningDate: new Date().toISOString().slice(0, 10),
      officeRoom: 'শিক্ষক মিলনায়তন',
      photoUrl: SCHOOL_INFO.assets.teacherMaleScience,
      bio: '',
      assignedClasses: ['Class 8', 'Class 9'],
      assignedSubjects: 'General Science (বিজ্ঞান)',
    });
    setModalOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setFormErr(null);
    setForm({
      name: t.name,
      nameBn: t.nameBn,
      designation: t.designation,
      designationBn: t.designationBn,
      department: t.department,
      departmentBn: t.departmentBn || t.department,
      qualification: t.qualification,
      email: t.email,
      phone: t.phone,
      joiningDate: t.joiningDate || new Date().toISOString().slice(0, 10),
      officeRoom: t.officeRoom || 'শিক্ষক মিলনায়তন',
      photoUrl: t.photoUrl || SCHOOL_INFO.assets.teacherMaleScience,
      bio: t.bio || '',
      assignedClasses: t.assignedClasses.length > 0 ? t.assignedClasses : ['Class 8'],
      assignedSubjects: t.assignedSubjects.join(', '),
    });
    setModalOpen(true);
  };

  const toggleClassChip = (cls: string) => {
    setForm((prev) => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(cls)
        ? prev.assignedClasses.filter((c) => c !== cls)
        : [...prev.assignedClasses, cls],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    const parsed = teacherSchema.safeParse({
      name: form.name,
      nameBn: form.nameBn,
      designation: form.designation,
      department: form.department,
      qualification: form.qualification,
      email: form.email,
      phone: form.phone,
    });
    if (!parsed.success) {
      setFormErr(parsed.error.issues[0]?.message || 'অনুগ্রহ করে সকল আবশ্যক তথ্য পূরণ করুন।');
      return;
    }
    if (!form.designationBn.trim()) {
      setFormErr('শিক্ষকের বাংলা পদবি প্রদান করুন।');
      return;
    }
    if (form.assignedClasses.length === 0) {
      setFormErr('কমপক্ষে একটি পাঠদানের শ্রেণি নির্বাচন করুন।');
      return;
    }

    const subjects = form.assignedSubjects.split(',').map((s) => s.trim()).filter(Boolean);
    if (subjects.length === 0) {
      setFormErr('কমপক্ষে একটি পাঠদানের বিষয় লিখুন।');
      return;
    }

    const commonPayload = {
      ...parsed.data,
      designationBn: form.designationBn.trim(),
      departmentBn: form.departmentBn.trim() || form.department,
      qualificationBn: form.qualification.trim(),
      joiningDate: form.joiningDate || new Date().toISOString().slice(0, 10),
      officeRoom: form.officeRoom.trim() || 'শিক্ষক মিলনায়তন',
      photoUrl: form.photoUrl,
      bio:
        form.bio.trim() ||
        `${form.nameBn.trim()} বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের ${form.departmentBn || form.department}-এ নিষ্ঠার সাথে পাঠদান করছেন।`,
      assignedClasses: form.assignedClasses,
      assignedSubjects: subjects,
    };

    if (editing) {
      updateTeacher(editing.id, commonPayload, user?.nameBn || user?.name || 'Admin');
    } else {
      addTeacher(
        {
          employeeId: `BUTPHS-T-${String(db.teachers.length + 1).padStart(3, '0')}`,
          ...commonPayload,
          status: 'Active',
        },
        user?.nameBn || user?.name || 'Admin'
      );
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="search"
              aria-label="শিক্ষক খুঁজুন"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="শিক্ষকের নাম, আইডি বা বিভাগ খুঁজুন..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-lg font-bn"
            />
          </div>
          <select
            aria-label="স্ট্যাটাস ফিল্টার"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
            className="h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white font-bn"
          >
            <option value="All">সকল অবস্থা</option>
            <option value="Active">সক্রিয় (Active)</option>
            <option value="Inactive">নিষ্ক্রিয় (Inactive)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/about/teachers"
            className="h-10 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 hover:border-[#1B2A6B] rounded-lg whitespace-nowrap font-bn"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>পাবলিক তালিকা</span>
          </Link>
          <button
            type="button"
            onClick={openAdd}
            className="h-10 px-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg whitespace-nowrap cursor-pointer font-bn"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শিক্ষক যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="কোনো শিক্ষক খুঁজে পাওয়া যায়নি" description="অনুসন্ধান পরিবর্তন করুন অথবা নতুন শিক্ষক যুক্ত করুন।" />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
                <tr>
                  <th className="py-3 px-4 font-medium">আইডি</th>
                  <th className="py-3 px-4 font-medium">শিক্ষকের নাম</th>
                  <th className="py-3 px-4 font-medium">পদবি ও বিভাগ</th>
                  <th className="py-3 px-4 font-medium">পাঠদানের শ্রেণি ও বিষয়</th>
                  <th className="py-3 px-4 font-medium">যোগাযোগ</th>
                  <th className="py-3 px-4 font-medium">অবস্থা</th>
                  <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F7F8FC]/60">
                    <td className="py-3 px-4 tabular-nums text-xs text-slate-600">{t.employeeId}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#1B2A6B] font-bn">{t.nameBn}</p>
                      <p className="text-xs text-slate-500">{t.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800 font-bn">{t.designationBn}</p>
                      <p className="text-xs text-slate-500 font-bn">{t.departmentBn || t.department}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <p className="font-medium text-slate-700">{t.assignedClasses.join(', ')}</p>
                      <p className="text-slate-500 font-bn truncate max-w-[200px]">{t.assignedSubjects.join(', ')}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="tabular-nums text-slate-700">{t.phone}</p>
                      <p className="text-slate-400">{t.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${t.status === 'Active' ? 'text-[#1F7A4D]' : 'text-amber-700'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" aria-label={`View ${t.name}`} onClick={() => setViewing(t)} className="p-1.5 text-slate-600 hover:text-[#1B2A6B] rounded hover:bg-slate-100 cursor-pointer"><Eye className="w-4 h-4" /></button>
                        <button type="button" aria-label={`Edit ${t.name}`} onClick={() => openEdit(t)} className="p-1.5 text-slate-600 hover:text-[#1F7A4D] rounded hover:bg-slate-100 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        <button
                          type="button"
                          aria-label={t.status === 'Active' ? `Deactivate ${t.name}` : `Activate ${t.name}`}
                          onClick={() => updateTeacher(t.id, { status: t.status === 'Active' ? 'Inactive' : 'Active' }, user?.nameBn || 'Admin')}
                          className="p-1.5 text-slate-600 hover:text-amber-700 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          {t.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button type="button" aria-label={`Delete ${t.name}`} onClick={() => setDeletingId(t.id)} className="p-1.5 text-slate-600 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'শিক্ষকের তথ্য হালনাগাদ' : 'নতুন শিক্ষক নিবন্ধন'}
        subtitle="পাবলিক ওয়েবসাইট প্রোফাইলে প্রদর্শিত প্রয়োজনীয় তথ্যসমূহ পূরণ করুন"
      >
        <form onSubmit={handleSave} className="space-y-4 font-bn" noValidate>
          {formErr && <div role="alert" className="p-2.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">{formErr}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="t-name-bn" className="block text-xs font-medium text-slate-700 mb-1">শিক্ষকের নাম (বাংলায়) *</label>
              <input id="t-name-bn" placeholder="যেমন: মোঃ কামরুল হাসান" value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="t-name" className="block text-xs font-medium text-slate-700 mb-1">শিক্ষকের নাম (ইংরেজিতে) *</label>
              <input id="t-name" placeholder="Md. Kamrul Hasan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" required />
            </div>
            <div>
              <label htmlFor="t-desig-bn" className="block text-xs font-medium text-slate-700 mb-1">পদবি (বাংলায়) *</label>
              <input id="t-desig-bn" placeholder="সহকারী শিক্ষক (গণিত)" value={form.designationBn} onChange={(e) => setForm({ ...form, designationBn: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="t-desig" className="block text-xs font-medium text-slate-700 mb-1">Designation (English) *</label>
              <input id="t-desig" placeholder="Assistant Teacher" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" required />
            </div>
            <div>
              <label htmlFor="t-dept" className="block text-xs font-medium text-slate-700 mb-1">বিভাগ (Department) *</label>
              <select
                id="t-dept"
                value={form.departmentBn}
                onChange={(e) => {
                  const chosen = TEACHER_DEPARTMENTS.find((d) => d.bn === e.target.value);
                  setForm({
                    ...form,
                    departmentBn: e.target.value,
                    department: chosen?.en || e.target.value,
                  });
                }}
                className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {TEACHER_DEPARTMENTS.map((d) => (
                  <option key={d.bn} value={d.bn}>{d.bn}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="t-qual" className="block text-xs font-medium text-slate-700 mb-1">শিক্ষাগত যোগ্যতা *</label>
              <input id="t-qual" placeholder="M.Sc (Mathematics), B.Ed" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" required />
            </div>
            <div>
              <label htmlFor="t-phone" className="block text-xs font-medium text-slate-700 mb-1">মোবাইল নম্বর *</label>
              <input id="t-phone" placeholder="01712-000299" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" required />
            </div>
            <div>
              <label htmlFor="t-email" className="block text-xs font-medium text-slate-700 mb-1">প্রাতিষ্ঠানিক ইমেইল *</label>
              <input id="t-email" type="email" placeholder="teacher@butphs.edu.bd" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" required />
            </div>
            <div>
              <label htmlFor="t-room" className="block text-xs font-medium text-slate-700 mb-1">অফিস কক্ষ</label>
              <input id="t-room" placeholder="শিক্ষক মিলনায়তন (কক্ষ-১০৫)" value={form.officeRoom} onChange={(e) => setForm({ ...form, officeRoom: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="t-photo" className="block text-xs font-medium text-slate-700 mb-1">প্রোফাইল ছবি (পাবলিক পেজ)</label>
              <select id="t-photo" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {TEACHER_PHOTO_PRESETS.map((p) => (
                  <option key={p.url} value={p.url}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-700 mb-1.5">পাঠদানের শ্রেণি নির্বাচন করুন *</span>
            <div className="flex flex-wrap gap-2">
              {CLASS_LIST.map((cls) => {
                const active = form.assignedClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClassChip(cls)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer font-sans ${
                      active
                        ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-[#1B2A6B]'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="t-subjects" className="block text-xs font-medium text-slate-700 mb-1">পাঠদানের বিষয়সমূহ (কমা দিয়ে আলাদা করুন) *</label>
              <input id="t-subjects" value={form.assignedSubjects} onChange={(e) => setForm({ ...form, assignedSubjects: e.target.value })} placeholder="Mathematics (গণিত), General Science (বিজ্ঞান)" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="t-join" className="block text-xs font-medium text-slate-700 mb-1">যোগদানের তারিখ</label>
              <input id="t-join" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
            </div>
          </div>

          <div>
            <label htmlFor="t-bio" className="block text-xs font-medium text-slate-700 mb-1">সংক্ষিপ্ত পরিচিতি (পাবলিক প্রোফাইলে প্রদর্শিত)</label>
            <textarea id="t-bio" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="শিক্ষকের অভিজ্ঞতা ও বিশেষত্ব লিখুন..." className="w-full p-2.5 text-sm border border-slate-300 rounded-lg" />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg cursor-pointer">বাতিল</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">সংরক্ষণ করুন</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing?.nameBn || ''} subtitle={viewing?.designationBn}>
        {viewing && (
          <dl className="divide-y divide-slate-100 text-sm font-bn">
            <div className="py-2 flex justify-between"><dt className="text-slate-500">কর্মী আইডি</dt><dd className="tabular-nums font-medium font-sans">{viewing.employeeId}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">বিভাগ</dt><dd>{viewing.departmentBn || viewing.department}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">যোগ্যতা</dt><dd className="font-sans">{viewing.qualification}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">ইমেইল</dt><dd className="font-sans">{viewing.email}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">মোবাইল</dt><dd className="tabular-nums font-sans">{viewing.phone}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">অফিস কক্ষ</dt><dd>{viewing.officeRoom || '—'}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">পাঠদানের শ্রেণি</dt><dd className="font-sans">{viewing.assignedClasses.join(', ')}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">বিষয়সমূহ</dt><dd>{viewing.assignedSubjects.join(', ')}</dd></div>
            <div className="pt-3 flex justify-end">
              <Link to={`/about/teachers/${viewing.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F7A4D] hover:underline">
                <span>পাবলিক প্রোফাইল দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="শিক্ষক রেকর্ড মুছে ফেলবেন?"
        message="নিশ্চিত করলে নির্বাচিত শিক্ষকের রেকর্ড তালিকা ও পাবলিক ওয়েবসাইট থেকে অপসারণ করা হবে।"
        confirmLabel="মুছে ফেলুন"
        destructive
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteTeacher(deletingId, user?.nameBn || 'Admin');
          setDeletingId(null);
        }}
      />
    </div>
  );
}

const WIZARD_STEPS = [
  { num: 1, shortLabel: 'ধাপ ১', title: 'শিক্ষার্থীর প্রাথমিক তথ্য' },
  { num: 2, shortLabel: 'ধাপ ২', title: 'সনদ ও ঠিকানা' },
  { num: 3, shortLabel: 'ধাপ ৩', title: 'অভিভাবকের তথ্য' },
  { num: 4, shortLabel: 'ধাপ ৪', title: 'পূর্ববর্তী শিক্ষা' },
  { num: 5, shortLabel: 'ধাপ ৫', title: 'শ্রেণি, শাখা ও রোল' },
  { num: 6, shortLabel: 'ধাপ ৬', title: 'চূড়ান্ত যাচাই' },
] as const;

const CLASS_BN_OPTIONS: Array<{ value: string; labelBn: string }> = [
  { value: 'Class 6', labelBn: '৬ষ্ঠ শ্রেণি' },
  { value: 'Class 7', labelBn: '৭ম শ্রেণি' },
  { value: 'Class 8', labelBn: '৮ম শ্রেণি' },
  { value: 'Class 9', labelBn: '৯ম শ্রেণি' },
  { value: 'Class 10', labelBn: '১০ম শ্রেণি' },
];

const SECTION_BN_OPTIONS: Array<{ value: string; labelBn: string }> = [
  { value: SECTION_LIST[0], labelBn: 'ক (পদ্মা)' },
  { value: SECTION_LIST[1], labelBn: 'খ (মেঘনা)' },
  { value: SECTION_LIST[2], labelBn: 'গ (যমুনা)' },
];

function createEmptyStudentWizard(nextRoll: number): StudentWizardFormState {
  return {
    nameBn: '',
    name: '',
    dateOfBirth: '2013-04-10',
    gender: 'Male',
    birthCertificateNo: '',
    boardRegistrationNo: '',
    address: 'উপসী, নড়িয়া, শরীয়তপুর',
    permanentAddress: 'উপসী, নড়িয়া, শরীয়তপুর',
    guardianName: '',
    guardianNameBn: '',
    guardianPhone: '',
    guardianOccupation: 'ব্যবসা',
    previousSchool: '',
    previousGpa: '4.5',
    className: 'Class 6',
    section: SECTION_LIST[0],
    roll: String(nextRoll),
    group: 'General',
    bloodGroup: 'O+',
    rfidCardId: '',
  };
}

export function AdminStudentsPage() {
  const { db, addStudent, updateStudent, deleteStudent } = useSchoolStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const [sameAsPresent, setSameAsPresent] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [wizard, setWizard] = useState<StudentWizardFormState>(() => createEmptyStudentWizard(15));

  const filtered = db.students.filter((s) => {
    if (classFilter !== 'All' && s.className !== classFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.nameBn.includes(search) ||
        s.studentId.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q) ||
        s.guardianPhone.includes(search)
      );
    }
    return true;
  });

  const openWizard = () => {
    const class6Rolls = db.students
      .filter((s) => s.className === 'Class 6' && s.section === SECTION_LIST[0])
      .map((s) => s.roll);
    const suggestedRoll = class6Rolls.length > 0 ? Math.max(...class6Rolls) + 1 : 15;
    setWizard(createEmptyStudentWizard(suggestedRoll));
    setSameAsPresent(true);
    setStep(1);
    setErr(null);
    setModalOpen(true);
  };

  const handleNextStep = () => {
    const stepErr = validateStudentWizardStep(step, wizard, db.students);
    if (stepErr) {
      setErr(stepErr);
      return;
    }
    setErr(null);
    setStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrevStep = () => {
    setErr(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (let s = 1; s <= 5; s += 1) {
      const checkErr = validateStudentWizardStep(s, wizard, db.students);
      if (checkErr) {
        setStep(s);
        setErr(checkErr);
        return;
      }
    }

    const rollNum = Number(wizard.roll);
    const sessionYear = db.websiteContent.academicSession || '2026';
    const studentId = `BUTPHS-${sessionYear}-${310 + db.students.length}`;
    const permAddr = sameAsPresent ? wizard.address.trim() : wizard.permanentAddress.trim() || wizard.address.trim();

    addStudent(
      {
        studentId,
        roll: rollNum,
        name: wizard.name.trim(),
        nameBn: wizard.nameBn.trim(),
        className: wizard.className,
        section: wizard.section,
        group: wizard.className === 'Class 9' || wizard.className === 'Class 10' ? wizard.group : 'General',
        session: sessionYear,
        gender: wizard.gender,
        dateOfBirth: wizard.dateOfBirth,
        bloodGroup: wizard.bloodGroup || 'O+',
        guardianId: `grd-${Date.now()}`,
        guardianName: wizard.guardianName.trim(),
        guardianNameBn: wizard.guardianNameBn.trim() || wizard.guardianName.trim(),
        guardianPhone: normalizeBdPhone(wizard.guardianPhone),
        guardianOccupation: wizard.guardianOccupation.trim() || 'ব্যবসা',
        address: wizard.address.trim(),
        permanentAddress: permAddr,
        birthCertificateNo: wizard.birthCertificateNo.trim() || undefined,
        boardRegistrationNo: wizard.boardRegistrationNo.trim() || undefined,
        previousSchool: wizard.previousSchool.trim() || undefined,
        previousGpa: wizard.previousGpa.trim() || undefined,
        rfidCardId: wizard.rfidCardId.trim() || undefined,
        status: 'Active',
      },
      user?.nameBn || 'Admin'
    );
    setModalOpen(false);
  };

  const selectedClassBn = CLASS_BN_OPTIONS.find((c) => c.value === wizard.className)?.labelBn || wizard.className;
  const selectedSectionBn = SECTION_BN_OPTIONS.find((s) => s.value === wizard.section)?.labelBn || wizard.section;

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="search"
              aria-label="শিক্ষার্থী খুঁজুন"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="শিক্ষার্থী আইডি, নাম বা অভিভাবকের মোবাইল খুঁজুন..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-lg font-bn"
            />
          </div>
          <select
            aria-label="শ্রেণি ফিল্টার"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white font-bn"
          >
            <option value="All">সকল শ্রেণি</option>
            {CLASS_BN_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.labelBn}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={openWizard}
          className="h-10 px-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg whitespace-nowrap cursor-pointer font-bn"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন শিক্ষার্থী যুক্ত করুন</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
              <tr>
                <th className="py-3 px-4 font-medium">শিক্ষার্থী আইডি</th>
                <th className="py-3 px-4 font-medium">রোল</th>
                <th className="py-3 px-4 font-medium">শিক্ষার্থীর নাম</th>
                <th className="py-3 px-4 font-medium">শ্রেণি ও শাখা</th>
                <th className="py-3 px-4 font-medium">অভিভাবক ও মোবাইল</th>
                <th className="py-3 px-4 font-medium">RFID কার্ড</th>
                <th className="py-3 px-4 font-medium">অবস্থা</th>
                <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#F7F8FC]/60">
                  <td className="py-3 px-4 tabular-nums font-medium text-[#1B2A6B]">{s.studentId}</td>
                  <td className="py-3 px-4 tabular-nums">{s.roll}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900 font-bn">{s.nameBn}</p>
                    <p className="text-xs text-slate-500">{s.name}</p>
                  </td>
                  <td className="py-3 px-4 font-bn">{s.className} · {s.section}</td>
                  <td className="py-3 px-4 text-xs">
                    <p className="font-bn text-slate-800">{s.guardianNameBn || s.guardianName}</p>
                    <p className="tabular-nums text-slate-500">{s.guardianPhone}</p>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-xs text-slate-600">{s.rfidCardId || 'বরাদ্দ হয়নি'}</td>
                  <td className="py-3 px-4 text-xs font-medium">
                    <span className={s.status === 'Active' ? 'text-[#1F7A4D]' : 'text-amber-700'}>{s.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" aria-label={`View ${s.name}`} onClick={() => setViewing(s)} className="p-1.5 text-slate-600 hover:text-[#1B2A6B] rounded hover:bg-slate-100 cursor-pointer"><Eye className="w-4 h-4" /></button>
                      <button
                        type="button"
                        aria-label={`Toggle status for ${s.name}`}
                        onClick={() => updateStudent(s.id, { status: s.status === 'Active' ? 'Inactive' : 'Active' }, user?.nameBn || 'Admin')}
                        className="p-1.5 text-slate-600 hover:text-amber-700 rounded hover:bg-slate-100 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button type="button" aria-label={`Delete ${s.name}`} onClick={() => setDeletingId(s.id)} className="p-1.5 text-slate-600 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6-Step Student Registration Wizard Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="নতুন শিক্ষার্থী নিবন্ধন (৬ ধাপের ফরম)"
        subtitle={`${WIZARD_STEPS[step - 1].shortLabel} — ${WIZARD_STEPS[step - 1].title}`}
      >
        <form onSubmit={handleWizardSubmit} className="space-y-5 font-bn" noValidate>
          {/* 6-Step Progress Bar */}
          <nav aria-label="শিক্ষার্থী নিবন্ধনের ধাপসমূহ" className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {WIZARD_STEPS.map((st) => {
              const isActive = st.num === step;
              const isDone = st.num < step;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    if (st.num < step) {
                      setErr(null);
                      setStep(st.num);
                    }
                  }}
                  disabled={st.num > step}
                  className={`py-2 px-1.5 rounded-lg text-center border text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                      : isDone
                        ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] border-[#1F7A4D]/30 cursor-pointer hover:bg-[#1F7A4D]/15'
                        : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {st.shortLabel}
                </button>
              );
            })}
          </nav>

          {err && (
            <div role="alert" className="flex items-start gap-2 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}

          {/* Step 1: Student Basic Info */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="wiz-name-bn" className="block text-xs font-medium text-slate-700 mb-1">শিক্ষার্থীর বাংলা নাম *</label>
                <input
                  id="wiz-name-bn"
                  value={wizard.nameBn}
                  onChange={(e) => setWizard({ ...wizard, nameBn: e.target.value })}
                  placeholder="যেমন: রাফিউল ইসলাম"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                  required
                />
              </div>
              <div>
                <label htmlFor="wiz-name-en" className="block text-xs font-medium text-slate-700 mb-1">ইংরেজি নাম *</label>
                <input
                  id="wiz-name-en"
                  value={wizard.name}
                  onChange={(e) => setWizard({ ...wizard, name: e.target.value })}
                  placeholder="Rafiul Islam"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg font-sans focus:outline-none focus:border-[#1F7A4D]"
                  required
                />
              </div>
              <div>
                <label htmlFor="wiz-dob" className="block text-xs font-medium text-slate-700 mb-1">জন্ম তারিখ *</label>
                <input
                  id="wiz-dob"
                  type="date"
                  value={wizard.dateOfBirth}
                  onChange={(e) => setWizard({ ...wizard, dateOfBirth: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans focus:outline-none focus:border-[#1F7A4D]"
                  required
                />
              </div>
              <div>
                <label htmlFor="wiz-gender" className="block text-xs font-medium text-slate-700 mb-1">লিঙ্গ *</label>
                <select
                  id="wiz-gender"
                  value={wizard.gender}
                  onChange={(e) => setWizard({ ...wizard, gender: e.target.value as 'Male' | 'Female' })}
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Male">ছাত্র (Male)</option>
                  <option value="Female">ছাত্রী (Female)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Birth Certificate, Registration & Address */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="wiz-bcn" className="block text-xs font-medium text-slate-700 mb-1">জন্ম সনদ নম্বর (১৭ ডিজিট)</label>
                  <input
                    id="wiz-bcn"
                    value={wizard.birthCertificateNo}
                    onChange={(e) => setWizard({ ...wizard, birthCertificateNo: e.target.value })}
                    placeholder="20138614500012345"
                    maxLength={17}
                    className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans"
                  />
                </div>
                <div>
                  <label htmlFor="wiz-reg" className="block text-xs font-medium text-slate-700 mb-1">বোর্ড রেজিস্ট্রেশন নং</label>
                  <input
                    id="wiz-reg"
                    value={wizard.boardRegistrationNo}
                    onChange={(e) => setWizard({ ...wizard, boardRegistrationNo: e.target.value })}
                    placeholder="ঐচ্ছিক (যেমন: 2110458921)"
                    className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="wiz-addr" className="block text-xs font-medium text-slate-700 mb-1">বর্তমান ঠিকানা *</label>
                <input
                  id="wiz-addr"
                  value={wizard.address}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWizard((prev) => ({
                      ...prev,
                      address: val,
                      permanentAddress: sameAsPresent ? val : prev.permanentAddress,
                    }));
                  }}
                  placeholder="উপসী, নড়িয়া, শরীয়তপুর"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="wiz-paddr" className="block text-xs font-medium text-slate-700">স্থায়ী ঠিকানা</label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPresent}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsPresent(checked);
                        if (checked) {
                          setWizard((prev) => ({ ...prev, permanentAddress: prev.address }));
                        }
                      }}
                      className="rounded accent-[#1F7A4D]"
                    />
                    <span>বর্তমান ঠিকানার অনুরূপ</span>
                  </label>
                </div>
                <input
                  id="wiz-paddr"
                  disabled={sameAsPresent}
                  value={sameAsPresent ? wizard.address : wizard.permanentAddress}
                  onChange={(e) => setWizard({ ...wizard, permanentAddress: e.target.value })}
                  placeholder="উপসী, নড়িয়া, শরীয়তপুর"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Guardian Information */}
          {step === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="wiz-grd-en" className="block text-xs font-medium text-slate-700 mb-1">অভিভাবকের নাম (ইংরেজি) *</label>
                <input
                  id="wiz-grd-en"
                  value={wizard.guardianName}
                  onChange={(e) => setWizard({ ...wizard, guardianName: e.target.value })}
                  placeholder="Md. Zahirul Islam"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg font-sans"
                  required
                />
              </div>
              <div>
                <label htmlFor="wiz-grd-bn" className="block text-xs font-medium text-slate-700 mb-1">অভিভাবকের নাম (বাংলা)</label>
                <input
                  id="wiz-grd-bn"
                  value={wizard.guardianNameBn}
                  onChange={(e) => setWizard({ ...wizard, guardianNameBn: e.target.value })}
                  placeholder="মোঃ জহিরুল ইসলাম"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="wiz-grd-phone" className="block text-xs font-medium text-slate-700 mb-1">অভিভাবকের মোবাইল (SMS রিসিভার) *</label>
                <input
                  id="wiz-grd-phone"
                  value={wizard.guardianPhone}
                  onChange={(e) => setWizard({ ...wizard, guardianPhone: e.target.value })}
                  placeholder="01711998877"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans"
                  required
                />
              </div>
              <div>
                <label htmlFor="wiz-grd-occ" className="block text-xs font-medium text-slate-700 mb-1">পেশা</label>
                <input
                  id="wiz-grd-occ"
                  value={wizard.guardianOccupation}
                  onChange={(e) => setWizard({ ...wizard, guardianOccupation: e.target.value })}
                  placeholder="ব্যবসা / চাকরি / কৃষি"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Step 4: Previous School & GPA */}
          {step === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label htmlFor="wiz-prev-school" className="block text-xs font-medium text-slate-700 mb-1">পূর্ববর্তী বিদ্যালয়ের নাম</label>
                <input
                  id="wiz-prev-school"
                  value={wizard.previousSchool}
                  onChange={(e) => setWizard({ ...wizard, previousSchool: e.target.value })}
                  placeholder="যেমন: উপসী সরকারি প্রাথমিক বিদ্যালয়"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="wiz-prev-gpa" className="block text-xs font-medium text-slate-700 mb-1">পূর্ববর্তী জিপিএ (০.০০–৫.০০)</label>
                <input
                  id="wiz-prev-gpa"
                  value={wizard.previousGpa}
                  onChange={(e) => setWizard({ ...wizard, previousGpa: e.target.value })}
                  placeholder="4.5"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans"
                />
              </div>
              <div>
                <label htmlFor="wiz-blood" className="block text-xs font-medium text-slate-700 mb-1">রক্তের গ্রুপ</label>
                <select
                  id="wiz-blood"
                  value={wizard.bloodGroup}
                  onChange={(e) => setWizard({ ...wizard, bloodGroup: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white font-sans"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 5: Class, Section & Unique Roll */}
          {step === 5 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="wiz-class" className="block text-xs font-medium text-slate-700 mb-1">শ্রেণি *</label>
                <select
                  id="wiz-class"
                  value={wizard.className}
                  onChange={(e) => setWizard({ ...wizard, className: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {CLASS_BN_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.labelBn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="wiz-section" className="block text-xs font-medium text-slate-700 mb-1">শাখা *</label>
                <select
                  id="wiz-section"
                  value={wizard.section}
                  onChange={(e) => setWizard({ ...wizard, section: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {SECTION_BN_OPTIONS.map((sec) => (
                    <option key={sec.value} value={sec.value}>{sec.labelBn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="wiz-roll" className="block text-xs font-medium text-slate-700 mb-1">রোল নম্বর (ইউনিক) *</label>
                <input
                  id="wiz-roll"
                  type="number"
                  min={1}
                  value={wizard.roll}
                  onChange={(e) => setWizard({ ...wizard, roll: e.target.value })}
                  placeholder="15"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans"
                  required
                />
              </div>
              <div>
                <label htmlFor="wiz-rfid" className="block text-xs font-medium text-slate-700 mb-1">RFID কার্ড নম্বর (ঐচ্ছিক)</label>
                <input
                  id="wiz-rfid"
                  value={wizard.rfidCardId}
                  onChange={(e) => setWizard({ ...wizard, rfidCardId: e.target.value })}
                  placeholder="যেমন: RFID-1099"
                  className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans"
                />
              </div>
              {(wizard.className === 'Class 9' || wizard.className === 'Class 10') && (
                <div className="sm:col-span-2">
                  <label htmlFor="wiz-group" className="block text-xs font-medium text-slate-700 mb-1">বিভাগ (৯ম–১০ম শ্রেণির জন্য)</label>
                  <select
                    id="wiz-group"
                    value={wizard.group}
                    onChange={(e) =>
                      setWizard({
                        ...wizard,
                        group: e.target.value as StudentWizardFormState['group'],
                      })
                    }
                    className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Science">বিজ্ঞান (Science)</option>
                    <option value="Humanities">মানবিক (Humanities)</option>
                    <option value="Business Studies">ব্যবসায় শিক্ষা (Business Studies)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Final Review & Confirmation */}
          {step === 6 && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200 space-y-2.5 text-sm">
                <p className="text-xs font-semibold text-[#1F7A4D] inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>চূড়ান্ত যাচাই ও নিশ্চিতকরণ</span>
                </p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  <div className="sm:col-span-2 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <dt className="text-slate-500">শিক্ষার্থী</dt>
                    <dd className="font-semibold text-[#1B2A6B] text-sm mt-0.5">
                      {wizard.nameBn} <span className="font-normal text-slate-600 font-sans">({wizard.name})</span>
                    </dd>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <dt className="text-slate-500">অভিভাবক ও SMS মোবাইল</dt>
                    <dd className="font-medium text-slate-900 mt-0.5">
                      {wizard.guardianNameBn || wizard.guardianName} ·{' '}
                      <span className="tabular-nums font-sans text-[#1F7A4D]">{wizard.guardianPhone}</span>
                    </dd>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <dt className="text-slate-500">শ্রেণি, শাখা ও রোল</dt>
                    <dd className="font-semibold text-[#1B2A6B] mt-0.5 tabular-nums">
                      {selectedClassBn} · {selectedSectionBn} · রোল: {wizard.roll}
                    </dd>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <dt className="text-slate-500">জন্ম তারিখ ও লিঙ্গ</dt>
                    <dd className="font-medium text-slate-800 mt-0.5 tabular-nums">
                      {wizard.dateOfBirth} · {wizard.gender === 'Male' ? 'ছাত্র' : 'ছাত্রী'}
                    </dd>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <dt className="text-slate-500">পূর্ববর্তী বিদ্যালয় ও জিপিএ</dt>
                    <dd className="font-medium text-slate-800 mt-0.5">
                      {wizard.previousSchool || 'উল্লেখ নেই'} {wizard.previousGpa ? `(GPA ${wizard.previousGpa})` : ''}
                    </dd>
                  </div>
                  <div className="sm:col-span-2 bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <dt className="text-slate-500">ঠিকানা</dt>
                    <dd className="font-medium text-slate-800 mt-0.5">{wizard.address}</dd>
                  </div>
                </dl>
              </div>
              <p className="text-xs text-slate-500">
                সংরক্ষণ করলে শিক্ষার্থী তালিকা, অভিভাবক পোর্টাল সংযোগ {wizard.rfidCardId ? 'এবং RFID কার্ড রেকর্ড ' : ''}স্বয়ংক্রিয়ভাবে হালনাগাদ হবে।
              </p>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={step === 1 ? () => setModalOpen(false) : handlePrevStep}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              {step > 1 && <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{step === 1 ? 'বাতিল' : 'পূর্ববর্তী'}</span>
            </button>

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#121D4D] rounded-lg cursor-pointer"
              >
                <span>পরবর্তী ধাপ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>সংরক্ষণ করুন</span>
              </button>
            )}
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing?.nameBn || ''} subtitle={viewing?.studentId}>
        {viewing && (
          <dl className="divide-y divide-slate-100 text-sm font-bn">
            <div className="py-2 flex justify-between"><dt className="text-slate-500">ইংরেজি নাম</dt><dd className="font-sans">{viewing.name}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">শ্রেণি ও শাখা</dt><dd>{viewing.className} · {viewing.section}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">রোল / রক্তের গ্রুপ</dt><dd className="tabular-nums">রোল {viewing.roll} · {viewing.bloodGroup}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">জন্ম তারিখ ও লিঙ্গ</dt><dd className="tabular-nums">{viewing.dateOfBirth} · {viewing.gender === 'Male' ? 'ছাত্র' : 'ছাত্রী'}</dd></div>
            {viewing.birthCertificateNo && (
              <div className="py-2 flex justify-between"><dt className="text-slate-500">জন্ম সনদ নং</dt><dd className="tabular-nums font-sans">{viewing.birthCertificateNo}</dd></div>
            )}
            {viewing.boardRegistrationNo && (
              <div className="py-2 flex justify-between"><dt className="text-slate-500">বোর্ড রেজিস্ট্রেশন</dt><dd className="tabular-nums font-sans">{viewing.boardRegistrationNo}</dd></div>
            )}
            <div className="py-2 flex justify-between"><dt className="text-slate-500">অভিভাবক</dt><dd>{viewing.guardianNameBn || viewing.guardianName}{viewing.guardianOccupation ? ` (${viewing.guardianOccupation})` : ''}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">অভিভাবকের মোবাইল</dt><dd className="tabular-nums font-sans">{viewing.guardianPhone}</dd></div>
            {viewing.previousSchool && (
              <div className="py-2 flex justify-between"><dt className="text-slate-500">পূর্ববর্তী বিদ্যালয়</dt><dd>{viewing.previousSchool}{viewing.previousGpa ? ` (GPA ${viewing.previousGpa})` : ''}</dd></div>
            )}
            <div className="py-2 flex justify-between"><dt className="text-slate-500">RFID কার্ড</dt><dd className="tabular-nums font-sans">{viewing.rfidCardId || 'বরাদ্দ হয়নি'}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">বর্তমান ঠিকানা</dt><dd>{viewing.address}</dd></div>
            {viewing.permanentAddress && (
              <div className="py-2 flex justify-between"><dt className="text-slate-500">স্থায়ী ঠিকানা</dt><dd>{viewing.permanentAddress}</dd></div>
            )}
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="শিক্ষার্থী রেকর্ড মুছে ফেলবেন?"
        message="নিশ্চিত করলে নির্বাচিত শিক্ষার্থীর রেকর্ড তালিকা থেকে অপসারণ করা হবে।"
        confirmLabel="মুছে ফেলুন"
        destructive
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteStudent(deletingId, user?.nameBn || 'Admin');
          setDeletingId(null);
        }}
      />
    </div>
  );
}

const STAFF_DEPARTMENTS = [
  { en: 'Administration & Accounts', bn: 'প্রশাসন ও হিসাব শাখা' },
  { en: 'Office & Records', bn: 'অফিস ও নথি ব্যবস্থাপনা' },
  { en: 'Library & Archive', bn: 'গ্রন্থাগার শাখা' },
  { en: 'Science & ICT Support', bn: 'বিজ্ঞান ও আইসিটি ল্যাব সহায়তা' },
  { en: 'Campus Security & Maintenance', bn: 'নিরাপত্তা ও ক্যাম্পাস রক্ষণাবেক্ষণ' },
];

const STAFF_PHOTO_PRESETS = [
  { label: 'অফিস কর্মকর্তা পোর্ট্রেট', url: SCHOOL_INFO.assets.staffOffice },
  { label: 'সিনিয়র কর্মচারী পোর্ট্রেট', url: SCHOOL_INFO.assets.committeeGuardianMale },
  { label: 'মহিলা কর্মচারী পোর্ট্রেট', url: SCHOOL_INFO.assets.committeeGuardianFemale },
];

export function AdminStaffPage() {
  const { db, addStaff, updateStaff, deleteStaff, toggleStaffStatus } = useSchoolStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [viewing, setViewing] = useState<StaffMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    nameBn: '',
    name: '',
    roleBn: '',
    role: '',
    departmentBn: STAFF_DEPARTMENTS[0].bn,
    department: STAFF_DEPARTMENTS[0].en,
    qualification: 'স্নাতক (বি.কম)',
    phone: '01713-000399',
    joiningDate: new Date().toISOString().slice(0, 10),
    officeRoom: 'প্রশাসনিক কার্যালয় (নিচতলা)',
    workingHours: 'রবি–বৃহঃ · সকাল ০৯:৩০ – বিকাল ০৫:০০',
    photoUrl: SCHOOL_INFO.assets.staffOffice as string,
    responsibilitiesText: '',
    bio: '',
  });

  const filtered = db.staff.filter((m) => {
    if (statusFilter !== 'All' && m.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.nameBn.includes(search) ||
        m.roleBn.includes(search) ||
        m.employeeId.toLowerCase().includes(q) ||
        (m.departmentBn || m.department).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openAdd = () => {
    setEditing(null);
    setFormErr(null);
    setForm({
      nameBn: '',
      name: '',
      roleBn: '',
      role: '',
      departmentBn: STAFF_DEPARTMENTS[0].bn,
      department: STAFF_DEPARTMENTS[0].en,
      qualification: 'স্নাতক',
      phone: '01713-000399',
      joiningDate: new Date().toISOString().slice(0, 10),
      officeRoom: 'প্রশাসনিক কার্যালয় (নিচতলা)',
      workingHours: 'রবি–বৃহঃ · সকাল ০৯:৩০ – বিকাল ০৫:০০',
      photoUrl: SCHOOL_INFO.assets.staffOffice,
      responsibilitiesText: 'দাপ্তরিক নথি সংরক্ষণ ও অভিভাবক সেবা\nশিক্ষার্থী সনদ ও ফরম বিতরণ সহায়তা',
      bio: '',
    });
    setModalOpen(true);
  };

  const openEdit = (m: StaffMember) => {
    setEditing(m);
    setFormErr(null);
    setForm({
      nameBn: m.nameBn,
      name: m.name,
      roleBn: m.roleBn,
      role: m.role,
      departmentBn: m.departmentBn || m.department,
      department: m.department,
      qualification: m.qualification || '',
      phone: m.phone,
      joiningDate: m.joiningDate || new Date().toISOString().slice(0, 10),
      officeRoom: m.officeRoom || 'প্রশাসনিক কার্যালয়',
      workingHours: m.workingHours || 'রবি–বৃহঃ · সকাল ০৯:৩০ – বিকাল ০৫:০০',
      photoUrl: m.photoUrl || SCHOOL_INFO.assets.staffOffice,
      responsibilitiesText: (m.responsibilities || []).join('\n'),
      bio: m.bio || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    if (form.nameBn.trim().length < 2) {
      setFormErr('কর্মকর্তা/কর্মচারীর বাংলা নাম আবশ্যক।');
      return;
    }
    if (form.name.trim().length < 3) {
      setFormErr('ইংরেজি নাম আবশ্যক।');
      return;
    }
    if (form.roleBn.trim().length < 2) {
      setFormErr('পদবি (বাংলা) আবশ্যক।');
      return;
    }
    if (form.phone.trim().length < 10) {
      setFormErr('সঠিক মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    const responsibilities = form.responsibilitiesText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      nameBn: form.nameBn.trim(),
      name: form.name.trim(),
      roleBn: form.roleBn.trim(),
      role: form.role.trim() || form.roleBn.trim(),
      departmentBn: form.departmentBn,
      department: form.department,
      qualification: form.qualification.trim() || undefined,
      phone: form.phone.trim(),
      joiningDate: form.joiningDate || new Date().toISOString().slice(0, 10),
      officeRoom: form.officeRoom.trim() || 'প্রশাসনিক কার্যালয়',
      workingHours: form.workingHours.trim() || 'রবি–বৃহঃ · সকাল ০৯:৩০ – বিকাল ০৫:০০',
      photoUrl: form.photoUrl,
      responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
      bio:
        form.bio.trim() ||
        `${form.nameBn.trim()} বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের ${form.departmentBn}-এ ${form.roleBn.trim()} হিসেবে কর্মরত।`,
    };

    if (editing) {
      updateStaff(editing.id, payload, user?.nameBn || 'Admin');
    } else {
      addStaff(
        {
          employeeId: `BUTPHS-S-${String(db.staff.length + 1).padStart(3, '0')}`,
          ...payload,
          status: 'Active',
        },
        user?.nameBn || 'Admin'
      );
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="search"
              aria-label="কর্মকর্তা-কর্মচারী খুঁজুন"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, পদবি, আইডি বা বিভাগ খুঁজুন..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-lg font-bn"
            />
          </div>
          <select
            aria-label="কর্মচারী অবস্থা ফিল্টার"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
            className="h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white font-bn"
          >
            <option value="All">সকল অবস্থা</option>
            <option value="Active">সক্রিয় (Active)</option>
            <option value="Inactive">নিষ্ক্রিয় (Inactive)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/about/staff"
            className="h-10 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 hover:border-[#1B2A6B] rounded-lg whitespace-nowrap font-bn"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>পাবলিক তালিকা</span>
          </Link>
          <button
            type="button"
            onClick={openAdd}
            className="h-10 px-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg whitespace-nowrap cursor-pointer font-bn"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন কর্মকর্তা/কর্মচারী যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="কোনো কর্মকর্তা বা কর্মচারী পাওয়া যায়নি" description="অনুসন্ধান পরিবর্তন করুন অথবা নতুন কর্মচারী যুক্ত করুন।" />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
                <tr>
                  <th className="py-3 px-4 font-medium">আইডি</th>
                  <th className="py-3 px-4 font-medium">নাম</th>
                  <th className="py-3 px-4 font-medium">পদবি ও বিভাগ</th>
                  <th className="py-3 px-4 font-medium">অফিস কক্ষ ও মোবাইল</th>
                  <th className="py-3 px-4 font-medium">অবস্থা</th>
                  <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F7F8FC]/60">
                    <td className="py-3 px-4 tabular-nums text-xs text-slate-600">{m.employeeId}</td>
                    <td className="py-3 px-4">
                      <p className="font-bn font-medium text-[#1B2A6B]">{m.nameBn}</p>
                      <p className="text-xs text-slate-500">{m.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bn text-slate-800">{m.roleBn}</p>
                      <p className="text-xs text-slate-500 font-bn">{m.departmentBn || m.department}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="font-bn text-slate-700">{m.officeRoom || 'প্রশাসনিক কার্যালয়'}</p>
                      <p className="tabular-nums text-slate-500">{m.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium">
                      <span className={m.status === 'Active' ? 'text-[#1F7A4D]' : 'text-amber-700'}>{m.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" aria-label={`View ${m.name}`} onClick={() => setViewing(m)} className="p-1.5 text-slate-600 hover:text-[#1B2A6B] rounded hover:bg-slate-100 cursor-pointer"><Eye className="w-4 h-4" /></button>
                        <button type="button" aria-label={`Edit ${m.name}`} onClick={() => openEdit(m)} className="p-1.5 text-slate-600 hover:text-[#1F7A4D] rounded hover:bg-slate-100 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        <button
                          type="button"
                          aria-label={`Toggle status for ${m.name}`}
                          onClick={() => toggleStaffStatus(m.id, user?.nameBn || 'Admin')}
                          className="p-1.5 text-slate-600 hover:text-amber-700 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          {m.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button type="button" aria-label={`Delete ${m.name}`} onClick={() => setDeletingId(m.id)} className="p-1.5 text-slate-600 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'কর্মকর্তা/কর্মচারীর তথ্য হালনাগাদ' : 'নতুন কর্মকর্তা/কর্মচারী নিবন্ধন'}
        subtitle="পাবলিক ওয়েবসাইট প্রোফাইলে প্রদর্শিত প্রয়োজনীয় তথ্যসমূহ পূরণ করুন"
      >
        <form onSubmit={handleSave} className="space-y-3.5 font-bn" noValidate>
          {formErr && <div role="alert" className="p-2.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">{formErr}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="stf-bn" className="block text-xs font-medium text-slate-700 mb-1">নাম (বাংলায়) *</label>
              <input id="stf-bn" value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} placeholder="যেমন: মোঃ কামাল হোসেন" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="stf-name" className="block text-xs font-medium text-slate-700 mb-1">নাম (ইংরেজিতে) *</label>
              <input id="stf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Md. Kamal Hossain" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" required />
            </div>
            <div>
              <label htmlFor="stf-role-bn" className="block text-xs font-medium text-slate-700 mb-1">পদবি (বাংলায়) *</label>
              <input id="stf-role-bn" value={form.roleBn} onChange={(e) => setForm({ ...form, roleBn: e.target.value })} placeholder="অফিস সহকারী ও হিসাবরক্ষক" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" required />
            </div>
            <div>
              <label htmlFor="stf-role-en" className="block text-xs font-medium text-slate-700 mb-1">Designation (English)</label>
              <input id="stf-role-en" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Office Assistant & Accountant" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" />
            </div>
            <div>
              <label htmlFor="stf-dept" className="block text-xs font-medium text-slate-700 mb-1">বিভাগ *</label>
              <select
                id="stf-dept"
                value={form.departmentBn}
                onChange={(e) => {
                  const chosen = STAFF_DEPARTMENTS.find((d) => d.bn === e.target.value);
                  setForm({
                    ...form,
                    departmentBn: e.target.value,
                    department: chosen?.en || e.target.value,
                  });
                }}
                className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {STAFF_DEPARTMENTS.map((d) => (
                  <option key={d.bn} value={d.bn}>{d.bn}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="stf-phone" className="block text-xs font-medium text-slate-700 mb-1">মোবাইল নম্বর *</label>
              <input id="stf-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01713-000301" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" required />
            </div>
            <div>
              <label htmlFor="stf-qual" className="block text-xs font-medium text-slate-700 mb-1">শিক্ষাগত যোগ্যতা</label>
              <input id="stf-qual" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="স্নাতক (বি.কম)" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="stf-room" className="block text-xs font-medium text-slate-700 mb-1">অফিস কক্ষ</label>
              <input id="stf-room" value={form.officeRoom} onChange={(e) => setForm({ ...form, officeRoom: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="stf-hours" className="block text-xs font-medium text-slate-700 mb-1">কর্মঘণ্টা</label>
              <input id="stf-hours" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="stf-photo" className="block text-xs font-medium text-slate-700 mb-1">প্রোফাইল ছবি (পাবলিক পেজ)</label>
              <select id="stf-photo" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {STAFF_PHOTO_PRESETS.map((p) => (
                  <option key={p.url} value={p.url}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="stf-resp" className="block text-xs font-medium text-slate-700 mb-1">প্রধান দায়িত্বসমূহ (প্রতি লাইনে একটি)</label>
            <textarea id="stf-resp" rows={2} value={form.responsibilitiesText} onChange={(e) => setForm({ ...form, responsibilitiesText: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-lg" />
          </div>

          <div>
            <label htmlFor="stf-bio" className="block text-xs font-medium text-slate-700 mb-1">সংক্ষিপ্ত পরিচিতি</label>
            <textarea id="stf-bio" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-lg" />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg cursor-pointer">বাতিল</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">সংরক্ষণ করুন</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing?.nameBn || ''} subtitle={viewing?.roleBn}>
        {viewing && (
          <dl className="divide-y divide-slate-100 text-sm font-bn">
            <div className="py-2 flex justify-between"><dt className="text-slate-500">কর্মী আইডি</dt><dd className="tabular-nums font-sans">{viewing.employeeId}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">বিভাগ</dt><dd>{viewing.departmentBn || viewing.department}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">অফিস কক্ষ</dt><dd>{viewing.officeRoom || '—'}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">কর্মঘণ্টা</dt><dd>{viewing.workingHours || '—'}</dd></div>
            <div className="py-2 flex justify-between"><dt className="text-slate-500">মোবাইল</dt><dd className="tabular-nums font-sans">{viewing.phone}</dd></div>
            <div className="pt-3 flex justify-end">
              <Link to={`/about/staff/${viewing.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F7A4D] hover:underline">
                <span>পাবলিক প্রোফাইল দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="কর্মকর্তা/কর্মচারী রেকর্ড মুছে ফেলবেন?"
        message="নিশ্চিত করলে নির্বাচিত রেকর্ড তালিকা ও পাবলিক ওয়েবসাইট থেকে অপসারণ করা হবে।"
        confirmLabel="মুছে ফেলুন"
        destructive
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteStaff(deletingId, user?.nameBn || 'Admin');
          setDeletingId(null);
        }}
      />
    </div>
  );
}

export function AdminGuardiansPage() {
  const { db } = useSchoolStore();
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">অভিভাবক ও সংযুক্ত শিক্ষার্থী তালিকা</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
            <tr>
              <th className="py-3 px-4 font-medium">অভিভাবকের নাম</th>
              <th className="py-3 px-4 font-medium">সম্পর্ক</th>
              <th className="py-3 px-4 font-medium">পোর্টাল ইমেইল</th>
              <th className="py-3 px-4 font-medium">মোবাইল নম্বর</th>
              <th className="py-3 px-4 font-medium">সংযুক্ত শিক্ষার্থী আইডি</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {db.guardians.map((g) => (
              <tr key={g.id}>
                <td className="py-3 px-4">
                  <p className="font-medium text-[#1B2A6B] font-bn">{g.nameBn}</p>
                  <p className="text-xs text-slate-500">{g.name}</p>
                </td>
                <td className="py-3 px-4 font-bn">{g.relation}</td>
                <td className="py-3 px-4 text-xs">{g.email}</td>
                <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">{g.phone}</td>
                <td className="py-3 px-4 tabular-nums text-xs font-medium text-[#1F7A4D]">
                  {g.studentIds.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminStudentsHubPage({ defaultTab = 'students' }: { defaultTab?: 'students' | 'guardians' }) {
  const { db } = useSchoolStore();
  const [tab, setTab] = useState<'students' | 'guardians'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-5">
      <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('students')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'students' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          শিক্ষার্থী তালিকা ({toBanglaDigits(db.students.length)})
        </button>
        <button
          type="button"
          onClick={() => setTab('guardians')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'guardians' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          অভিভাবক ও পোর্টাল সংযোগ ({toBanglaDigits(db.guardians.length)})
        </button>
      </div>

      {tab === 'students' ? <AdminStudentsPage /> : <AdminGuardiansPage />}
    </div>
  );
}

export function AdminTeachersStaffHubPage({ defaultTab = 'teachers' }: { defaultTab?: 'teachers' | 'staff' }) {
  const { db } = useSchoolStore();
  const [tab, setTab] = useState<'teachers' | 'staff'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-5">
      <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('teachers')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'teachers' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          শিক্ষকমণ্ডলী ({toBanglaDigits(db.teachers.length)})
        </button>
        <button
          type="button"
          onClick={() => setTab('staff')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'staff' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          কর্মকর্তা ও কর্মচারী ({toBanglaDigits(db.staff.length)})
        </button>
      </div>

      {tab === 'teachers' ? <AdminTeachersPage /> : <AdminStaffPage />}
    </div>
  );
}

