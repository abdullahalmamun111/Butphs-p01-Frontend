import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Radio,
  Shield,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { authService, PORTAL_ACCOUNTS, type PortalAccountRecord } from '../../services';
import { useAuth } from '../../providers/AuthProvider';
import { useSchoolStore } from '../../store/SchoolStore';
import { loginSchema } from '../../validations/schemas';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { UserRole } from '../../types';

interface LoginPageProps {
  lockedRole?: UserRole;
}

const ROLE_META: Record<
  UserRole,
  {
    title: string;
    titleBn: string;
    descBn: string;
    redirect: string;
  }
> = {
  admin: {
    title: 'Admin Portal Login',
    titleBn: 'প্রশাসনিক (অ্যাডমিন) পোর্টাল',
    descBn: 'শিক্ষক-শিক্ষার্থী ব্যবস্থাপনা, RFID হাজিরা, পরীক্ষা, ফলাফল প্রকাশনা, ভর্তি ও ওয়েবসাইট নিয়ন্ত্রণ।',
    redirect: '/admin',
  },
  teacher: {
    title: 'Teacher Portal Login',
    titleBn: 'শিক্ষক পোর্টাল',
    descBn: 'নির্ধারিত শ্রেণি ও বিষয়, দৈনিক হাজিরা গ্রহণ, রুটিন এবং পরীক্ষার নম্বর এন্ট্রি।',
    redirect: '/teacher',
  },
  accountant: {
    title: 'Accountant Portal Login',
    titleBn: 'হিসাবরক্ষক (অ্যাকাউন্ট্যান্ট) পোর্টাল',
    descBn: 'শিক্ষার্থীর বেতন-ফি আদায়, বকেয়া ট্র্যাকিং, রসিদ প্রিন্ট, আয়-ব্যয় ভাউচার ও আর্থিক প্রতিবেদন।',
    redirect: '/accountant',
  },
  parent: {
    title: 'Parent Portal Login',
    titleBn: 'অভিভাবক পোর্টাল',
    descBn: 'সন্তানের দৈনিক RFID উপস্থিতি, SMS বার্তা, প্রকাশিত মার্কশিট, রুটিন ও বেতন-ফি বিবরণী।',
    redirect: '/parent',
  },
};

export function LoginPage({ lockedRole }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(lockedRole || 'admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryTarget, setRecoveryTarget] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, loading } = useAuth();
  const { addToast } = useSchoolStore();
  const navigate = useNavigate();

  const role = lockedRole || selectedRole;
  const meta = ROLE_META[role];

  useDocumentTitle(meta.title);

  const handleQuickLogin = async (account: PortalAccountRecord) => {
    setErrorMsg(null);
    const effectivePwd = authService.getEffectivePassword(account);
    if (!lockedRole) setSelectedRole(account.role);
    setIdentifier(account.role === 'parent' && account.phone ? account.phone : account.email);
    setPassword(effectivePwd);
    try {
      const user = await login(account.email, effectivePwd, lockedRole || account.role);
      addToast('success', 'লগইন সফল হয়েছে', `${user.nameBn} · ${ROLE_META[user.role].titleBn}`);
      navigate(ROLE_META[user.role].redirect, { replace: true });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে।');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = loginSchema.safeParse({ email: identifier, password, role });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message || 'অনুগ্রহ করে সঠিক তথ্য দিন।');
      return;
    }

    try {
      const user = await login(parsed.data.email, parsed.data.password, lockedRole);
      addToast('success', 'লগইন সফল হয়েছে', `${user.nameBn} · ${ROLE_META[user.role].titleBn}`);
      navigate(ROLE_META[user.role].redirect, { replace: true });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে।');
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryTarget.trim()) return;
    setRecoverySent(true);
    addToast('info', 'পাসওয়ার্ড রিসেট অনুরোধ গ্রহণ করা হয়েছে', 'অফিস প্রশাসনের মাধ্যমে আপনার পাসওয়ার্ড পুনর্নির্ধারণ করা হবে।');
  };

  const visibleAccounts = lockedRole
    ? PORTAL_ACCOUNTS.filter((acc) => acc.role === lockedRole)
    : PORTAL_ACCOUNTS;

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      {/* Left Institutional Showcase Panel */}
      <div className="lg:w-[46%] xl:w-[44%] bg-[#1B2A6B] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric gold border motif */}
        <div
          className="pointer-events-none absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-[#C9A961]/20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-12 -bottom-12 w-56 h-56 rounded-full border border-[#1F7A4D]/35"
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-[#E3C884] transition-colors font-bn"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>মূল ওয়েবসাইটে ফিরুন</span>
          </Link>

          <div className="flex items-center gap-3.5 pt-2">
            <span className="w-14 h-14 rounded-full bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img
                src={SCHOOL_INFO.assets.logo}
                alt="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় মনোগ্রাম"
                className="w-full h-full object-contain"
              />
            </span>
            <div>
              <p className="text-base sm:text-lg font-semibold leading-snug font-bn">
                {SCHOOL_INFO.nameBn}
              </p>
              <p className="text-xs text-white/75 mt-0.5">{SCHOOL_INFO.nameEn}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[#E3C884] tabular-nums">
              EIIN: {SCHOOL_INFO.eiin} · School Code: {SCHOOL_INFO.schoolCode} · Est. {SCHOOL_INFO.established}
            </p>
            <h2 className="text-2xl sm:text-3xl font-medium leading-snug font-bn">
              একীভূত ডিজিটাল ক্যাম্পাস ও প্রাতিষ্ঠানিক পোর্টাল
            </h2>
            <p className="text-sm text-white/80 leading-relaxed font-bn max-w-md">
              প্রশাসন, শিক্ষকমণ্ডলী, হিসাব বিভাগ ও অভিভাবকদের জন্য নিরাপদ রোল-ভিত্তিক প্রবেশাধিকার — দৈনিক RFID হাজিরা, ফলাফল, নোটিশ ও বেতন ব্যবস্থাপনা এক প্ল্যাটফর্মে।
            </p>
          </div>

          {/* 3 Institutional Portal Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.07] border border-white/10">
              <Radio className="w-5 h-5 text-[#E3C884] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold font-bn">RFID গেট হাজিরা ও তাৎক্ষণিক SMS</p>
                <p className="text-[11px] text-white/70 font-bn mt-0.5">
                  বিদ্যালয়ে প্রবেশ ও প্রস্থানের সময় অভিভাবকের মোবাইলে স্বয়ংক্রিয় বার্তা।
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.07] border border-white/10">
              <GraduationCap className="w-5 h-5 text-[#E3C884] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold font-bn">পরীক্ষা, নম্বর এন্ট্রি ও ডিজিটাল মার্কশিট</p>
                <p className="text-[11px] text-white/70 font-bn mt-0.5">
                  স্বয়ংক্রিয় GPA গণনা, যাচাইকরণ এবং প্রিন্ট উপযোগী একাডেমিক ট্রান্সক্রিপ্ট।
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 mt-8 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-white/70 font-bn">
          <span>{SCHOOL_INFO.addressBn}</span>
          <span>{SCHOOL_INFO.officeHoursEn}</span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-8 lg:px-14">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1F7A4D] font-bn">
              নিরাপদ পোর্টাল প্রবেশ
            </p>
            <h1 className="text-2xl font-semibold text-[#1B2A6B] mt-1 font-bn">
              {meta.titleBn}
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-bn">
              {meta.descBn}
            </p>
          </div>

          {/* Role Tabs (when on unified /login) */}
          {!lockedRole && (
            <div
              role="tablist"
              aria-label="পোর্টাল রোল নির্বাচন"
              className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-white border border-slate-200 rounded-xl"
            >
              {(
                [
                  { key: 'admin', label: 'অ্যাডমিন', icon: Shield },
                  { key: 'teacher', label: 'শিক্ষক', icon: UserCheck },
                  { key: 'accountant', label: 'হিসাবরক্ষক', icon: Wallet },
                  { key: 'parent', label: 'অভিভাবক', icon: Users },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={role === key}
                  onClick={() => {
                    setSelectedRole(key);
                    setErrorMsg(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer font-bn ${
                    role === key
                      ? 'bg-[#1B2A6B] text-white'
                      : 'text-slate-600 hover:bg-[#F7F8FC] hover:text-[#1B2A6B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-bn"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!forgotOpen ? (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs" noValidate>
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                  ইমেইল অথবা মোবাইল নম্বর
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={role === 'parent' ? '01715223344 অথবা parent@butphs.edu.bd' : `${role}@butphs.edu.bd`}
                    className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D] focus:ring-2 focus:ring-[#1F7A4D]/15"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 font-bn">
                    পাসওয়ার্ড
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true);
                      setRecoverySent(false);
                    }}
                    className="text-xs font-medium text-[#1F7A4D] hover:underline font-bn cursor-pointer"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    className="w-full h-11 pl-10 pr-10 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D] focus:ring-2 focus:ring-[#1F7A4D]/15"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none font-bn">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-[#1F7A4D]"
                />
                <span>এই ডিভাইসে আমার সেশন মনে রাখুন</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] disabled:opacity-60 rounded-lg transition-colors cursor-pointer font-bn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" aria-hidden="true" />
                    <span>পোর্টালে প্রবেশ করুন</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecoverySubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1B2A6B] font-bn">পাসওয়ার্ড পুনরুদ্ধার</h2>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="text-xs text-slate-500 hover:text-[#1B2A6B] font-bn cursor-pointer"
                >
                  লগইনে ফিরুন
                </button>
              </div>
              {recoverySent ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5 font-bn">
                  <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-0.5" />
                  <span>
                    আপনার অনুরোধটি বিদ্যালয় অফিসের আইটি ডেস্কে পাঠানো হয়েছে। অফিস চলাকালীন সময়ে ({SCHOOL_INFO.contactPlaceholders.officePhone}) যোগাযোগ করে নতুন পাসওয়ার্ড সংগ্রহ করুন।
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600 font-bn leading-relaxed">
                    আপনার নিবন্ধিত প্রাতিষ্ঠানিক ইমেইল বা অভিভাবকের মোবাইল নম্বর দিন।
                  </p>
                  <input
                    type="text"
                    required
                    value={recoveryTarget}
                    onChange={(e) => setRecoveryTarget(e.target.value)}
                    placeholder="ইমেইল অথবা ০১৭XXXXXXXX"
                    className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                  />
                  <button
                    type="submit"
                    className="w-full h-10 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#1F7A4D] rounded-lg transition-colors font-bn cursor-pointer"
                  >
                    পুনরুদ্ধার অনুরোধ পাঠান
                  </button>
                </>
              )}
            </form>
          )}

          {/* Direct Portal Quick Access Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1B2A6B] font-bn">
                দ্রুত পোর্টাল প্রবেশ (রোল নির্বাচন)
              </span>
              <span className="text-[11px] text-slate-500 font-bn">এক ক্লিকে প্রবেশ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visibleAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(acc)}
                  className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-[#1F7A4D] hover:bg-[#1F7A4D]/[0.03] transition-colors cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-[#1B2A6B] group-hover:text-[#1F7A4D] font-bn">
                    {acc.labelBn}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 tabular-nums">
                    {acc.subLabelBn}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-500 font-bn">
              <Link to="/admin-login" className="hover:text-[#1F7A4D]">অ্যাডমিন লগইন</Link>
              <span aria-hidden="true">·</span>
              <Link to="/teacher-login" className="hover:text-[#1F7A4D]">শিক্ষক লগইন</Link>
              <span aria-hidden="true">·</span>
              <Link to="/accountant-login" className="hover:text-[#1F7A4D]">হিসাবরক্ষক লগইন</Link>
              <span aria-hidden="true">·</span>
              <Link to="/parent-login" className="hover:text-[#1F7A4D]">অভিভাবক লগইন</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
