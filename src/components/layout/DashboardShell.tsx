import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  ClipboardCheck,
  CreditCard,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Globe,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Printer,
  Radio,
  Receipt,
  Settings,
  ShieldCheck,
  UserCheck,
  UserCircle2,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../providers/AuthProvider';
import { useSchoolStore } from '../../store/SchoolStore';
import { computePendingActionsSummary } from '../../utils/portalHelpers';
import { toBanglaDigits } from '../../utils/noticeUtils';

export interface DashboardNavItem {
  id: string;
  label: string;
  labelBn: string;
  href: string;
  groupBn?: string;
}

const SIDEBAR_ICON_MAP: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  teachers: GraduationCap,
  students: Users,
  staff: Briefcase,
  guardians: UserCheck,
  committee: ShieldCheck,
  syllabus: BookOpen,
  notices: Bell,
  website: Globe,
  rfid: Radio,
  attendance: ClipboardCheck,
  results: Award,
  exams: FileSpreadsheet,
  admissions: FileText,
  reports: BarChart3,
  audit: History,
  sms: MessageSquare,
  print: Printer,
  settings: Settings,
  profile: UserCircle2,
  classes: BookOpen,
  routine: Calendar,
  academics: BookOpen,
  fees: Wallet,
  dues: AlertCircle,
  ledger: Receipt,
  payment: CreditCard,
};

const ROUTE_ALIAS_PREFIXES: Record<string, string[]> = {
  admissions: ['/admin/admissions', '/admin/inquiries'],
  syllabus: ['/admin/syllabus', '/admin/academics'],
  print: ['/admin/print', '/admin/fees'],
  academics: ['/parent/academics', '/parent/routine'],
  classes: ['/teacher/classes', '/teacher/students'],
  routine: ['/teacher/routine', '/teacher/academics'],
};

interface DashboardShellProps {
  portalTitle: string;
  portalSubtitle: string;
  navItems: DashboardNavItem[];
  pageTitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
}

export function DashboardShell({
  portalTitle,
  portalSubtitle,
  navItems,
  pageTitle,
  children,
}: DashboardShellProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useDocumentTitle(`${pageTitle} · ${portalTitle}`);
  const { user, logout } = useAuth();
  const { db, addToast } = useSchoolStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarBrokenUrl, setAvatarBrokenUrl] = useState<string | null>(null);

  const activeAvatarUrl =
    user?.photoUrl && user.photoUrl !== avatarBrokenUrl ? user.photoUrl : undefined;
  const profilePath = `/${user?.role || 'admin'}/profile`;

  const pendingSummary = computePendingActionsSummary({
    admissions: db.admissions,
    inquiries: db.inquiries,
    results: db.results,
    fees: db.fees,
  });

  const recentNotifications = [
    ...db.inquiries.filter((i) => i.status === 'New').slice(0, 2).map((inq) => ({
      id: inq.id,
      title: `নতুন অভিভাবক জিজ্ঞাসা: ${inq.subject}`,
      meta: `${inq.senderName} (${inq.source}) · ${inq.createdAt}`,
    })),
    ...db.admissions.slice(0, 2).map((a) => ({
      id: a.id,
      title: `ভর্তি আবেদন (${a.status}): ${a.applicantNameBn}`,
      meta: `${a.applyingClass} · ${a.submittedDate}`,
    })),
    ...db.smsLogs.slice(0, 2).map((s) => ({
      id: s.id,
      title: `SMS প্রেরণ (${s.trigger === 'RFID_ENTRY' ? 'RFID প্রবেশ' : s.trigger === 'RFID_EXIT' ? 'RFID প্রস্থান' : 'বিজ্ঞপ্তি'})`,
      meta: `${s.recipientName} · ${s.timestamp}`,
    })),
  ];

  const handleLogout = () => {
    logout();
    addToast('info', 'সফলভাবে লগআউট সম্পন্ন হয়েছে');
    navigate('/login');
  };

  const roleLabelBn =
    user?.role === 'admin'
      ? 'প্রশাসক'
      : user?.role === 'teacher'
        ? 'শিক্ষক'
        : user?.role === 'accountant'
          ? 'হিসাবরক্ষক'
          : 'অভিভাবক';

  const getBadgeCount = (itemId: string): number => {
    if (user?.role === 'admin') {
      if (itemId === 'admissions') return pendingSummary.pendingAdmissions + pendingSummary.unreadInquiries;
      if (itemId === 'results') return pendingSummary.unpublishedResults;
    }
    if (user?.role === 'accountant' && itemId === 'dues') {
      return pendingSummary.dueFeeInvoices;
    }
    return 0;
  };

  const renderSidebarLinks = () => {
    let lastGroup: string | undefined;
    return (
      <nav aria-label={`${portalTitle} navigation`} className="px-3 py-3 space-y-0.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isExact =
            item.href === '/admin' ||
            item.href === '/teacher' ||
            item.href === '/parent' ||
            item.href === '/accountant';
          const aliasPrefixes = ROUTE_ALIAS_PREFIXES[item.id];
          const active = isExact
            ? pathname === item.href
            : aliasPrefixes
              ? aliasPrefixes.some((p) => pathname.startsWith(p))
              : pathname.startsWith(item.href);
          const Icon = SIDEBAR_ICON_MAP[item.id] || LayoutDashboard;
          const badge = getBadgeCount(item.id);
          const showGroupHeader = item.groupBn && item.groupBn !== lastGroup;
          lastGroup = item.groupBn;

          return (
            <React.Fragment key={item.id}>
              {showGroupHeader && (
                <p className="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 font-bn first:pt-1">
                  {item.groupBn}
                </p>
              )}
              <Link
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                  active
                    ? 'bg-emerald-50 text-[#1F7A4D] font-semibold border border-emerald-200/70'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-[#1B2A6B] font-medium border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? 'text-[#1F7A4D]' : 'text-slate-400'}`}
                    aria-hidden="true"
                  />
                  <span className="truncate font-bn">{item.labelBn}</span>
                </span>
                {badge > 0 && (
                  <span
                    className={`text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded ${
                      active ? 'bg-[#1F7A4D] text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {toBanglaDigits(badge)}
                  </span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F6F8FB]">
      {/* Desktop Sidebar — Clean Light Surface */}
      <aside className="dashboard-sidebar no-print hidden lg:flex lg:flex-col w-64 bg-white text-slate-800 border-r border-slate-200/90 shrink-0 sticky top-0 h-screen">
        <div className="px-4 h-16 border-b border-slate-200/80 flex items-center gap-3 shrink-0">
          <img
            src={SCHOOL_INFO.assets.logo}
            alt="BUTPHS Crest"
            className="w-9 h-9 object-contain bg-slate-50 border border-slate-200/70 rounded-full p-0.5 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1B2A6B] truncate">{portalTitle}</p>
            <p className="text-[11px] text-[#1F7A4D] font-medium truncate font-bn">{portalSubtitle}</p>
          </div>
        </div>
        {renderSidebarLinks()}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-[#1B2A6B] hover:bg-slate-200/60 rounded-lg transition-colors font-bn"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>পাবলিক ওয়েবসাইট দেখুন</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-bn"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer — Clean Light Surface */}
      {sidebarOpen && (
        <div className="no-print lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px]"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white text-slate-800 border-r border-slate-200 flex flex-col h-full shadow-xl">
            <div className="px-4 h-16 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={SCHOOL_INFO.assets.logo}
                  alt="BUTPHS Crest"
                  className="w-9 h-9 object-contain bg-slate-50 border border-slate-200/70 rounded-full p-0.5"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1B2A6B] truncate">{portalTitle}</p>
                  <p className="text-[11px] text-[#1F7A4D] font-medium truncate font-bn">{portalSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarLinks()}
            <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-[#1B2A6B] hover:bg-slate-200/60 rounded-lg font-bn"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>পাবলিক ওয়েবসাইট</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg font-bn cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open dashboard menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-[#1B2A6B] hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-[#1B2A6B] truncate font-bn">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden md:inline-block text-xs text-slate-500 tabular-nums">
              EIIN: {SCHOOL_INFO.eiin} · সেশন ২০২৬
            </span>

            {/* Notifications dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((p) => !p);
                  setProfileOpen(false);
                }}
                aria-label="Open notifications"
                aria-expanded={notifOpen}
                className="relative inline-flex items-center justify-center w-9 h-9 text-slate-600 hover:text-[#1B2A6B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-[#1B2A6B] font-bn">সাম্প্রতিক কার্যক্রম</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bn cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                  <ul className="divide-y divide-slate-100 mt-1">
                    {recentNotifications.map((item) => (
                      <li key={item.id} className="py-2 text-xs font-bn">
                        <p className="font-medium text-slate-800">{item.title}</p>
                        <p className="text-slate-500 mt-0.5 tabular-nums">{item.meta}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((p) => !p);
                  setNotifOpen(false);
                }}
                aria-label="Open user profile menu"
                aria-expanded={profileOpen}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-[#F7F8FC] transition-colors cursor-pointer"
              >
                {activeAvatarUrl ? (
                  <img
                    src={activeAvatarUrl}
                    alt={user?.nameBn || user?.name || 'User avatar'}
                    onError={() => setAvatarBrokenUrl(user?.photoUrl || null)}
                    className="w-7 h-7 rounded-full object-cover object-top border border-slate-200 shrink-0"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-[#1F7A4D] text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                    {user?.avatarInitials || 'BH'}
                  </span>
                )}
                <span className="hidden sm:block text-xs font-medium text-[#1B2A6B] max-w-[140px] truncate font-bn">
                  {user?.nameBn || user?.name}
                </span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-68 bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 z-50 text-xs">
                  <div className="flex items-center gap-2.5">
                    {activeAvatarUrl ? (
                      <img
                        src={activeAvatarUrl}
                        alt={user?.nameBn || user?.name || 'User avatar'}
                        onError={() => setAvatarBrokenUrl(user?.photoUrl || null)}
                        className="w-10 h-10 rounded-full object-cover object-top border border-slate-200 shrink-0"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-[#1F7A4D] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {user?.avatarInitials || 'BH'}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1B2A6B] font-bn truncate">{user?.nameBn}</p>
                      <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                      <p className="text-[#1F7A4D] font-medium text-[11px] mt-0.5 font-bn truncate">
                        {user?.designation || roleLabelBn}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1 font-bn">
                    <Link
                      to={profilePath}
                      onClick={() => setProfileOpen(false)}
                      className="px-2 py-1.5 rounded hover:bg-emerald-50 text-[#1F7A4D] font-semibold flex items-center gap-2"
                    >
                      <UserCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>আমার প্রোফাইল ও ছবি পরিবর্তন</span>
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setProfileOpen(false)}
                      className="px-2 py-1.5 rounded hover:bg-[#F7F8FC] text-slate-700"
                    >
                      পাবলিক ওয়েবসাইটে যান
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-left px-2 py-1.5 rounded hover:bg-red-50 text-red-700 font-medium cursor-pointer"
                    >
                      লগআউট করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
