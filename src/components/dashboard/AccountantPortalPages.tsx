import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet,
  Plus,
  Printer,
  Receipt,
  Search,
  Send,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SCHOOL_INFO } from '../../config/school';
import { CLASS_LIST } from '../../constants/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useSchoolStore } from '../../store/SchoolStore';
import { formatCurrencyBdt } from '../../utils/grading';
import { toBanglaDigits } from '../../utils/noticeUtils';
import { computeAccountantSummary } from '../../utils/portalHelpers';
import { printElementById } from '../../utils/printDocument';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import type { FeeRecord } from '../../types';

const MONTHLY_CASHFLOW = [
  { month: 'জুলাই', income: 168000, expense: 112000 },
  { month: 'আগস্ট', income: 184000, expense: 118500 },
  { month: 'সেপ্টে', income: 176500, expense: 121000 },
  { month: 'অক্টো', income: 192000, expense: 124500 },
  { month: 'নভে', income: 214500, expense: 129000 },
];

const EXPENSE_CATEGORIES = [
  'বিদ্যুৎ ও ইউটিলিটি বিল',
  'পরীক্ষা ও মুদ্রণ সামগ্রী',
  'ল্যাব ও শ্রেণিকক্ষ রক্ষণাবেক্ষণ',
  'অফিস স্টেশনারি ও ইন্টারনেট',
  'ক্রীড়া ও সহশিক্ষা ব্যয়',
  'খণ্ডকালীন সম্মানী ও ভাতা',
];

const INCOME_CATEGORIES = [
  'সরকারি অনুদান ও বৃত্তি তহবিল',
  'ভর্তি ফরম ও রেজিস্ট্রেশন ফি',
  'প্রশংসাপত্র ও সনদ ফি',
  'বিবিধ প্রাতিষ্ঠানিক আয়',
];

// ---------------------------------------------------------------------------
// 1. ACCOUNTANT OVERVIEW PAGE (KPIs + Interactive Recharts)
// ---------------------------------------------------------------------------

export function AccountantOverviewPage() {
  const { db } = useSchoolStore();

  const summary = useMemo(
    () =>
      computeAccountantSummary({
        fees: db.fees,
        transactions: db.financeTransactions,
      }),
    [db.fees, db.financeTransactions]
  );

  const feePieData = [
    { name: 'আদায়কৃত ফি', value: summary.feeCollected, color: '#1F7A4D' },
    { name: 'বকেয়া ফি', value: summary.feeDue, color: '#D97706' },
  ];

  const recentVouchers = db.financeTransactions.slice(0, 5);
  const urgentDues = db.fees.filter((f) => f.dueAmount > 0).slice(0, 5);

  return (
    <div className="space-y-6 font-bn">
      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/accountant/fees"
          className="bg-white border border-slate-200 hover:border-[#1F7A4D] rounded-xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>মোট আদায়কৃত বেতন ও ফি</span>
            <Wallet className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-[#1F7A4D] tabular-nums mt-2">
            {formatCurrencyBdt(summary.feeCollected)}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            আদায়ের হার: <span className="font-semibold text-[#1B2A6B]">{toBanglaDigits(summary.collectionRatePct)}%</span>
          </p>
        </Link>

        <Link
          to="/accountant/dues"
          className="bg-white border border-slate-200 hover:border-amber-500 rounded-xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>মোট বকেয়া পাওনা</span>
            <Bell className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-amber-700 tabular-nums mt-2">
            {formatCurrencyBdt(summary.feeDue)}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            বকেয়া চালান: <span className="font-semibold text-amber-700">{toBanglaDigits(summary.dueCount)} টি</span>
          </p>
        </Link>

        <Link
          to="/accountant/ledger"
          className="bg-white border border-slate-200 hover:border-rose-400 rounded-xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>মোট প্রাতিষ্ঠানিক ব্যয়</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-slate-900 tabular-nums mt-2">
            {formatCurrencyBdt(summary.totalExpense)}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            ব্যয় ভাউচার: {toBanglaDigits(db.financeTransactions.filter((t) => t.type === 'Expense').length)} টি
          </p>
        </Link>

        <Link
          to="/accountant/reports"
          className="bg-white border border-slate-200 hover:border-[#1B2A6B] rounded-xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>নিট তহবিল উদ্বৃত্ত</span>
            <ArrowUpRight className="w-4 h-4 text-[#1B2A6B]" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-[#1B2A6B] tabular-nums mt-2">
            {formatCurrencyBdt(summary.netBalance)}
          </p>
          <p className="text-xs text-[#1F7A4D] mt-1">আর্থিক রিপোর্ট দেখুন →</p>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-[#1B2A6B]">মাসিক আয় বনাম ব্যয় বিশ্লেষণ (টাকা)</h2>
              <p className="text-xs text-slate-500 mt-0.5">গত ৫ মাসের বেতন-ফি, অনুদান ও প্রাতিষ্ঠানিক ব্যয়ের তুলনামূলক চিত্র</p>
            </div>
            <Link to="/accountant/ledger" className="text-xs font-semibold text-[#1F7A4D] hover:underline">
              ভাউচার খাতা →
            </Link>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_CASHFLOW} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${Math.round(v / 1000)}k`} />
                <Tooltip
                  formatter={(value) => [formatCurrencyBdt(Number(value ?? 0)), '']}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="মোট আয়" fill="#1F7A4D" radius={[6, 6, 0, 0]} maxBarSize={32} isAnimationActive={false} />
                <Bar dataKey="expense" name="মোট ব্যয়" fill="#1B2A6B" radius={[6, 6, 0, 0]} maxBarSize={32} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-[#1B2A6B]">বেতন ও ফি আদায়ের অনুপাত</h2>
            <p className="text-xs text-slate-500 mt-0.5">চলতি চালানসমূহের আদায় ও বকেয়া অবস্থা</p>
          </div>

          <div className="relative h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={80}
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {feePieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrencyBdt(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-[#1B2A6B] tabular-nums">
                {toBanglaDigits(summary.collectionRatePct)}%
              </span>
              <span className="text-[11px] text-slate-500 font-bn">আদায়</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50/70">
              <p className="text-slate-600">আদায়কৃত</p>
              <p className="font-bold text-[#1F7A4D] tabular-nums mt-0.5">{formatCurrencyBdt(summary.feeCollected)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/70">
              <p className="text-slate-600">বকেয়া</p>
              <p className="font-bold text-amber-700 tabular-nums mt-0.5">{formatCurrencyBdt(summary.feeDue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2-Column Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-[#1B2A6B]">অপেক্ষমাণ বকেয়া ফি চালান</h2>
            <Link to="/accountant/dues" className="text-xs font-semibold text-[#1F7A4D] hover:underline">
              সব বকেয়া →
            </Link>
          </div>
          {urgentDues.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">সকল শিক্ষার্থীর ফি পরিশোধিত রয়েছে।</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {urgentDues.map((f) => (
                <li key={f.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{f.studentName}</p>
                    <p className="text-slate-500 tabular-nums">{f.className} · {f.monthOrTerm}</p>
                  </div>
                  <span className="font-bold text-amber-700 tabular-nums">{formatCurrencyBdt(f.dueAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-[#1B2A6B]">সাম্প্রতিক আয়-ব্যয় ভাউচার</h2>
            <Link to="/accountant/ledger" className="text-xs font-semibold text-[#1F7A4D] hover:underline">
              পূর্ণ খাতা →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentVouchers.map((tx) => (
              <li key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{tx.category}</p>
                  <p className="text-slate-500 tabular-nums">{tx.voucherNo} · {tx.date}</p>
                </div>
                <span className={`font-bold tabular-nums shrink-0 ${tx.type === 'Income' ? 'text-[#1F7A4D]' : 'text-rose-700'}`}>
                  {tx.type === 'Income' ? '+' : '−'} {formatCurrencyBdt(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. ACCOUNTANT FEE COLLECTION & INVOICE GENERATOR + PRINTABLE RECEIPT
// ---------------------------------------------------------------------------

export function AccountantFeeCollectionPage() {
  const { db, simulateFeePayment, createFeeInvoice } = useSchoolStore();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Paid' | 'Due' | 'Partial'>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [receiptFee, setReceiptFee] = useState<FeeRecord | null>(null);

  const [form, setForm] = useState({
    studentId: db.students[0]?.studentId || '',
    monthOrTerm: 'ডিসেম্বর ২০২৬ (মাসিক বেতন)',
    tuitionFee: 450,
    examFee: 0,
    labAndActivityFee: 100,
    dueDate: '2026-12-15',
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.fees.filter((f) => {
      if (classFilter !== 'ALL' && f.className !== classFilter) return false;
      if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
      if (!q) return true;
      return (
        f.studentName.toLowerCase().includes(q) ||
        f.studentId.toLowerCase().includes(q) ||
        f.invoiceNo.toLowerCase().includes(q) ||
        f.monthOrTerm.toLowerCase().includes(q)
      );
    });
  }, [db.fees, classFilter, statusFilter, query]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.monthOrTerm.trim()) return;
    createFeeInvoice(
      {
        studentId: form.studentId,
        monthOrTerm: form.monthOrTerm.trim(),
        tuitionFee: Math.max(0, Number(form.tuitionFee) || 0),
        examFee: Math.max(0, Number(form.examFee) || 0),
        labAndActivityFee: Math.max(0, Number(form.labAndActivityFee) || 0),
        dueDate: form.dueDate,
      },
      user?.nameBn || 'হিসাবরক্ষক'
    );
    setCreateOpen(false);
  };

  return (
    <div className="space-y-5 font-bn">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input
              type="search"
              aria-label="চালান বা শিক্ষার্থী খুঁজুন"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="নাম, আইডি বা চালান নং..."
              className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
            />
          </div>
          <select
            aria-label="শ্রেণি ফিল্টার"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="ALL">সকল শ্রেণি</option>
            {CLASS_LIST.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="অবস্থা ফিল্টার"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="ALL">সকল অবস্থা</option>
            <option value="Due">বকেয়া</option>
            <option value="Partial">আংশিক</option>
            <option value="Paid">পরিশোধিত</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ফি চালান তৈরি</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">চালান নং</th>
                <th className="py-3 px-4 font-semibold">শিক্ষার্থী</th>
                <th className="py-3 px-4 font-semibold">মাস / খাত</th>
                <th className="py-3 px-4 font-semibold text-right">মোট ফি</th>
                <th className="py-3 px-4 font-semibold text-right">আদায়</th>
                <th className="py-3 px-4 font-semibold text-right">বকেয়া</th>
                <th className="py-3 px-4 font-semibold text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 text-xs font-semibold text-[#1B2A6B] tabular-nums">{f.invoiceNo}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{f.studentName}</p>
                    <p className="text-xs text-slate-500 tabular-nums">{f.studentId} · {f.className}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-700">{f.monthOrTerm}</td>
                  <td className="py-3 px-4 text-right text-xs tabular-nums font-medium">{formatCurrencyBdt(f.totalAmount)}</td>
                  <td className="py-3 px-4 text-right text-xs tabular-nums font-semibold text-[#1F7A4D]">{formatCurrencyBdt(f.paidAmount)}</td>
                  <td className="py-3 px-4 text-right text-xs tabular-nums font-semibold text-amber-700">{formatCurrencyBdt(f.dueAmount)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {f.dueAmount > 0 ? (
                        <button
                          type="button"
                          onClick={() => simulateFeePayment(f.id, user?.nameBn || 'হিসাব শাখা')}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
                        >
                          জমা গ্রহণ
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F7A4D] px-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          পরিশোধিত
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setReceiptFee(f)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>রসিদ</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="নতুন শিক্ষার্থী ফি চালান তৈরি করুন">
        <form onSubmit={handleCreate} className="space-y-4 font-bn">
          <div>
            <label htmlFor="inv-stu" className="block text-xs font-semibold text-slate-700 mb-1">শিক্ষার্থী নির্বাচন *</label>
            <select
              id="inv-stu"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {db.students.map((s) => (
                <option key={s.id} value={s.studentId}>
                  {s.studentId} — {s.nameBn} ({s.className})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="inv-month" className="block text-xs font-semibold text-slate-700 mb-1">মাস বা পরীক্ষার পর্ব *</label>
              <input id="inv-month" required value={form.monthOrTerm} onChange={(e) => setForm({ ...form, monthOrTerm: e.target.value })} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="inv-due" className="block text-xs font-semibold text-slate-700 mb-1">শেষ তারিখ</label>
              <input id="inv-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
            </div>
            <div>
              <label htmlFor="inv-tui" className="block text-xs font-semibold text-slate-700 mb-1">মাসিক বেতন (৳)</label>
              <input id="inv-tui" type="number" min={0} value={form.tuitionFee} onChange={(e) => setForm({ ...form, tuitionFee: Number(e.target.value) })} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
            </div>
            <div>
              <label htmlFor="inv-exam" className="block text-xs font-semibold text-slate-700 mb-1">পরীক্ষার ফি (৳)</label>
              <input id="inv-exam" type="number" min={0} value={form.examFee} onChange={(e) => setForm({ ...form, examFee: Number(e.target.value) })} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg cursor-pointer">বাতিল</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] rounded-lg cursor-pointer">চালান সংরক্ষণ</button>
          </div>
        </form>
      </Modal>

      {/* Printable Official Fee Receipt Modal */}
      <Modal open={Boolean(receiptFee)} onClose={() => setReceiptFee(null)} title="অফিসিয়াল বেতন ও ফি রসিদ">
        {receiptFee && (
          <div className="space-y-4 font-bn">
            <div id="accountant-fee-receipt" className="bg-white border border-slate-300 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-[#1B2A6B]">
                <img src={SCHOOL_INFO.assets.logo} alt={SCHOOL_INFO.nameBn} className="w-12 h-12 object-contain" />
                <div>
                  <h3 className="text-base font-bold text-[#1B2A6B]">{SCHOOL_INFO.nameBn}</h3>
                  <p className="text-[11px] text-slate-600">{SCHOOL_INFO.addressBn} · EIIN: {SCHOOL_INFO.eiin}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p><span className="text-slate-500">রসিদ নং:</span> <strong className="tabular-nums">{receiptFee.invoiceNo}</strong></p>
                <p className="text-right"><span className="text-slate-500">অবস্থা:</span> <strong className={receiptFee.dueAmount === 0 ? 'text-[#1F7A4D]' : 'text-amber-700'}>{receiptFee.dueAmount === 0 ? 'পরিশোধিত' : 'বকেয়া'}</strong></p>
                <p><span className="text-slate-500">শিক্ষার্থী:</span> <strong>{receiptFee.studentName}</strong></p>
                <p className="text-right"><span className="text-slate-500">আইডি / শ্রেণি:</span> <span className="tabular-nums">{receiptFee.studentId} · {receiptFee.className}</span></p>
                <p className="col-span-2"><span className="text-slate-500">বিবরণ:</span> {receiptFee.monthOrTerm}</p>
              </div>
              <table className="w-full text-xs border-t border-b border-slate-200">
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2">মাসিক বেতন</td><td className="py-2 text-right tabular-nums">{formatCurrencyBdt(receiptFee.tuitionFee)}</td></tr>
                  <tr><td className="py-2">পরীক্ষার ফি</td><td className="py-2 text-right tabular-nums">{formatCurrencyBdt(receiptFee.examFee)}</td></tr>
                  <tr><td className="py-2">ল্যাব ও সহশিক্ষা ফি</td><td className="py-2 text-right tabular-nums">{formatCurrencyBdt(receiptFee.labAndActivityFee)}</td></tr>
                  <tr className="font-bold text-[#1B2A6B]"><td className="py-2">মোট প্রদেয়</td><td className="py-2 text-right tabular-nums">{formatCurrencyBdt(receiptFee.totalAmount)}</td></tr>
                  <tr className="font-semibold text-[#1F7A4D]"><td className="py-2">পরিশোধিত</td><td className="py-2 text-right tabular-nums">{formatCurrencyBdt(receiptFee.paidAmount)}</td></tr>
                  <tr className="font-semibold text-amber-700"><td className="py-2">অবশিষ্ট বকেয়া</td><td className="py-2 text-right tabular-nums">{formatCurrencyBdt(receiptFee.dueAmount)}</td></tr>
                </tbody>
              </table>
              <div className="flex justify-between pt-4 text-[11px] text-slate-500">
                <span>আদায়কারী: হিসাব শাখা</span>
                <span>প্রধান শিক্ষক / হিসাবরক্ষক স্বাক্ষর</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReceiptFee(null)} className="px-4 py-2 text-xs text-slate-700 border border-slate-300 rounded-lg cursor-pointer">বন্ধ করুন</button>
              <button
                type="button"
                onClick={() => printElementById('accountant-fee-receipt', `ফি রসিদ - ${receiptFee.invoiceNo}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B2A6B] rounded-lg cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>রসিদ প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. ACCOUNTANT DUES & GUARDIAN SMS REMINDERS
// ---------------------------------------------------------------------------

export function AccountantDuesPage() {
  const { db, simulateFeePayment, sendSimulatedSms } = useSchoolStore();
  const { user } = useAuth();

  const dueInvoices = db.fees.filter((f) => f.dueAmount > 0);
  const totalDue = dueInvoices.reduce((s, f) => s + f.dueAmount, 0);

  const handleSendReminder = (fee: FeeRecord) => {
    const stu = db.students.find((s) => s.studentId === fee.studentId);
    sendSimulatedSms(
      {
        recipientName: stu?.guardianName || fee.studentName,
        recipientPhone: stu?.guardianPhone || '01711-000189',
        recipientGroup: 'Guardian',
        message: `সম্মানিত অভিভাবক, আপনার সন্তান ${fee.studentName} (${fee.className})-এর ${fee.monthOrTerm} বাবদ ${formatCurrencyBdt(fee.dueAmount)} বকেয়া রয়েছে। অনুগ্রহ করে ${fee.dueDate} তারিখের মধ্যে হিসাব শাখায় পরিশোধ করুন। — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়`,
      },
      user?.nameBn || 'হিসাবরক্ষক'
    );
  };

  return (
    <div className="space-y-5 font-bn">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1B2A6B]">বকেয়া বেতন-ফি তালিকা ও অভিভাবক তাগাদা</h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            মোট বকেয়া চালান: {toBanglaDigits(dueInvoices.length)} টি · মোট বকেয়া: <strong className="text-amber-700">{formatCurrencyBdt(totalDue)}</strong>
          </p>
        </div>
        {dueInvoices.length > 0 && (
          <button
            type="button"
            onClick={() => dueInvoices.forEach(handleSendReminder)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#132056] rounded-lg cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>সকল বকেয়া অভিভাবককে SMS পাঠান</span>
          </button>
        )}
      </div>

      {dueInvoices.length === 0 ? (
        <EmptyState title="কোনো বকেয়া ফি নেই" description="সকল শিক্ষার্থীর নির্ধারিত ফি পরিশোধ সম্পন্ন হয়েছে।" />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                <tr>
                  <th className="py-3 px-4 font-semibold">শিক্ষার্থী ও অভিভাবক</th>
                  <th className="py-3 px-4 font-semibold">চালান ও খাত</th>
                  <th className="py-3 px-4 font-semibold">শেষ তারিখ</th>
                  <th className="py-3 px-4 font-semibold text-right">বকেয়া পরিমাণ</th>
                  <th className="py-3 px-4 font-semibold text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dueInvoices.map((f) => {
                  const stu = db.students.find((s) => s.studentId === f.studentId);
                  return (
                    <tr key={f.id}>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{f.studentName} ({f.className})</p>
                        <p className="text-xs text-slate-500 tabular-nums">{stu?.guardianName || 'অভিভাবক'} · {stu?.guardianPhone || '—'}</p>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <p className="font-medium text-[#1B2A6B] tabular-nums">{f.invoiceNo}</p>
                        <p className="text-slate-500">{f.monthOrTerm}</p>
                      </td>
                      <td className="py-3 px-4 text-xs tabular-nums text-slate-600">{f.dueDate}</td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-amber-700 tabular-nums">{formatCurrencyBdt(f.dueAmount)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendReminder(f)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#1B2A6B] bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>SMS তাগাদা</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => simulateFeePayment(f.id, user?.nameBn || 'হিসাব শাখা')}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
                          >
                            আদায় করুন
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. ACCOUNTANT INCOME & EXPENSE VOUCHER LEDGER
// ---------------------------------------------------------------------------

export function AccountantLedgerPage() {
  const { db, addFinanceTransaction, deleteFinanceTransaction } = useSchoolStore();
  const { user } = useAuth();
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-11-21');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'Income' | 'Expense'>('ALL');

  const handleTypeChange = (next: 'Income' | 'Expense') => {
    setType(next);
    setCategory(next === 'Expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (!numeric || numeric <= 0 || !descriptionBn.trim()) return;
    addFinanceTransaction(
      {
        date,
        type,
        category,
        descriptionBn: descriptionBn.trim(),
        amount: numeric,
        recordedBy: user?.nameBn || 'মোঃ কামাল হোসেন',
      },
      user?.nameBn || 'হিসাবরক্ষক'
    );
    setAmount('');
    setDescriptionBn('');
  };

  const visible = db.financeTransactions.filter((t) => filterType === 'ALL' || t.type === filterType);

  return (
    <div className="space-y-6 font-bn">
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-[#1B2A6B]">নতুন আয় বা ব্যয় ভাউচার নিবন্ধন</h2>
          <div className="inline-flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('Expense')}
              className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer ${type === 'Expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'}`}
            >
              ব্যয় ভাউচার
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('Income')}
              className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer ${type === 'Income' ? 'bg-white text-[#1F7A4D] shadow-xs' : 'text-slate-600'}`}
            >
              আয় ভাউচার
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input aria-label="Voucher date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
          <select aria-label="Voucher category" value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white">
            {(type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input aria-label="Amount BDT" type="number" min={1} required placeholder="টাকার পরিমাণ (৳) *" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-10 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
          <button type="submit" className="h-10 px-4 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">
            ভাউচার সংরক্ষণ করুন
          </button>
        </div>
        <input
          aria-label="Voucher description"
          required
          placeholder="ভাউচারের বিস্তারিত বিবরণ (যেমন: নভেম্বর মাসের বিদ্যুৎ বিল পরিশোধ) *"
          value={descriptionBn}
          onChange={(e) => setDescriptionBn(e.target.value)}
          className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg"
        />
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#1B2A6B]">আয়-ব্যয় লেজার ({toBanglaDigits(visible.length)} টি এন্ট্রি)</h3>
          <div className="inline-flex gap-1.5">
            {(['ALL', 'Income', 'Expense'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterType(k)}
                className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer ${filterType === k ? 'bg-[#1F7A4D] text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {k === 'ALL' ? 'সব' : k === 'Income' ? 'আয়' : 'ব্যয়'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">ভাউচার ও তারিখ</th>
                <th className="py-3 px-4 font-semibold">খাত ও বিবরণ</th>
                <th className="py-3 px-4 font-semibold">ধরন</th>
                <th className="py-3 px-4 font-semibold text-right">পরিমাণ</th>
                <th className="py-3 px-4 font-semibold text-right">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-3 px-4 text-xs tabular-nums">
                    <p className="font-semibold text-[#1B2A6B]">{tx.voucherNo}</p>
                    <p className="text-slate-500">{tx.date}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-xs font-semibold text-slate-900">{tx.category}</p>
                    <p className="text-xs text-slate-600">{tx.descriptionBn}</p>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold">
                    <span className={tx.type === 'Income' ? 'text-[#1F7A4D]' : 'text-rose-700'}>
                      {tx.type === 'Income' ? 'আয়' : 'ব্যয়'}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-right text-xs font-bold tabular-nums ${tx.type === 'Income' ? 'text-[#1F7A4D]' : 'text-rose-700'}`}>
                    {tx.type === 'Income' ? '+' : '−'} {formatCurrencyBdt(tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      aria-label={`Delete voucher ${tx.voucherNo}`}
                      onClick={() => deleteFinanceTransaction(tx.id, user?.nameBn || 'হিসাবরক্ষক')}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. ACCOUNTANT PRINTABLE A4 FINANCIAL SUMMARY REPORT
// ---------------------------------------------------------------------------

export function AccountantReportsPage() {
  const { db } = useSchoolStore();
  const summary = computeAccountantSummary({
    fees: db.fees,
    transactions: db.financeTransactions,
  });

  return (
    <div className="space-y-5 font-bn">
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-[#1F7A4D]" />
          <div>
            <h2 className="text-sm font-semibold text-[#1B2A6B]">মাসিক আয়-ব্যয় ও ফি আদায় বিবরণী (A4 প্রিন্ট)</h2>
            <p className="text-xs text-slate-500">পরিচালনা পর্ষদ ও প্রধান শিক্ষকের অনুমোদনের জন্য প্রিন্ট উপযোগী আর্থিক প্রতিবেদন।</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => printElementById('bhs-financial-report-a4', 'মাসিক আর্থিক প্রতিবেদন — BUTPHS')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#132056] rounded-lg cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>প্রতিবেদন প্রিন্ট করুন</span>
        </button>
      </div>

      <article id="bhs-financial-report-a4" className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <header className="flex items-center gap-4 pb-4 border-b-2 border-[#1B2A6B]">
          <img src={SCHOOL_INFO.assets.logo} alt={SCHOOL_INFO.nameBn} className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-[#1B2A6B]">{SCHOOL_INFO.nameBn}</h1>
            <p className="text-xs text-slate-600">{SCHOOL_INFO.addressBn} · EIIN: {SCHOOL_INFO.eiin} · কোড: {SCHOOL_INFO.schoolCode}</p>
            <p className="text-xs font-semibold text-[#1F7A4D] mt-1">সমন্বিত আর্থিক বিবরণী ও হিসাব সারসংক্ষেপ — শিক্ষাবর্ষ ২০২৬</p>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-slate-500">মোট ফি আদায়</p>
            <p className="text-base font-bold text-[#1F7A4D] tabular-nums mt-1">{formatCurrencyBdt(summary.feeCollected)}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-slate-500">অন্যান্য আয়</p>
            <p className="text-base font-bold text-[#1B2A6B] tabular-nums mt-1">{formatCurrencyBdt(summary.otherIncome)}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-slate-500">মোট ব্যয়</p>
            <p className="text-base font-bold text-rose-700 tabular-nums mt-1">{formatCurrencyBdt(summary.totalExpense)}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
            <p className="text-slate-600">নিট উদ্বৃত্ত</p>
            <p className="text-base font-bold text-[#1F7A4D] tabular-nums mt-1">{formatCurrencyBdt(summary.netBalance)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[#1B2A6B]">ভাউচারভিত্তিক আয়-ব্যয় তালিকা</h3>
          <table className="w-full text-xs text-left border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2.5 px-3">তারিখ</th>
                <th className="py-2.5 px-3">ভাউচার</th>
                <th className="py-2.5 px-3">খাত ও বিবরণ</th>
                <th className="py-2.5 px-3 text-right">আয় (৳)</th>
                <th className="py-2.5 px-3 text-right">ব্যয় (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.financeTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2 px-3 tabular-nums">{tx.date}</td>
                  <td className="py-2 px-3 tabular-nums font-medium">{tx.voucherNo}</td>
                  <td className="py-2 px-3">{tx.category} — {tx.descriptionBn}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-[#1F7A4D] font-semibold">
                    {tx.type === 'Income' ? formatCurrencyBdt(tx.amount) : '—'}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-rose-700 font-semibold">
                    {tx.type === 'Expense' ? formatCurrencyBdt(tx.amount) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs text-slate-600">
          <div className="border-t border-slate-300 pt-2">হিসাবরক্ষক<br />অর্থ ও হিসাব শাখা</div>
          <div className="border-t border-slate-300 pt-2">প্রধান শিক্ষক<br />বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়</div>
          <div className="border-t border-slate-300 pt-2">সভাপতি<br />বিদ্যালয় পরিচালনা পর্ষদ</div>
        </div>
      </article>
    </div>
  );
}
