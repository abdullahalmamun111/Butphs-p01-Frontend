import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  Bell,
  BookMarked,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  Compass,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HeartHandshake,
  History,
  Image as ImageIcon,
  Landmark,
  Layers,
  LayoutDashboard,
  Library,
  LogIn,
  MapPin,
  Menu,
  MessageSquare,
  Mic,
  Music,
  Newspaper,
  Palette,
  ScrollText,
  ShieldCheck,
  Target,
  Trophy,
  UserCheck,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { PUBLIC_NAV_GROUPS, type NavIconKey } from '../../constants/navigation';
import { useAuth } from '../../providers/AuthProvider';

const NAV_ICON_MAP: Record<NavIconKey, LucideIcon> = {
  history: History,
  chairman: Landmark,
  headteacher: UserCheck,
  committee: Building2,
  teachers: GraduationCap,
  staff: Briefcase,
  students: Users,
  mission: Target,
  routine: Calendar,
  syllabus: BookOpen,
  curriculum: Layers,
  notices: Bell,
  calendar: Calendar,
  results: Award,
  library: Library,
  guidelines: ShieldCheck,
  sports: Trophy,
  cultural: Music,
  scout: Compass,
  girlsguide: HeartHandshake,
  tour: MapPin,
  sportsclub: Trophy,
  debate: Mic,
  culturalclub: Palette,
  magazine: BookMarked,
  wallmag: Newspaper,
  journal: ScrollText,
  admission: ClipboardCheck,
  form: FileText,
  fees: Wallet,
  media: ImageIcon,
  community: MessageSquare,
};

export function PublicHeader() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>('about');
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleGroupEnter = (groupId: string) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDropdown(groupId);
  };

  const handleGroupLeave = () => {
    closeTimerRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/parent';

  return (
    <header className="site-header no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200/90">
      {/* Subtle 2px institutional gold-emerald top accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#1B2A6B] via-[#1F7A4D] to-[#C9A961]" />

      <div
        ref={navRef}
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-2 sm:gap-4 lg:gap-6"
      >
        {/* Zone 1: Institutional Crest & Name */}
        <Link
          to="/"
          className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 lg:flex-initial lg:shrink-0 focus-visible:outline-2 focus-visible:outline-[#1F7A4D] rounded-lg"
        >
          <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#F7F8FC] border border-slate-200 p-1 flex items-center justify-center shrink-0">
            <img
              src={SCHOOL_INFO.assets.logo}
              alt="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় মনোগ্রাম"
              className="w-full h-full object-contain"
            />
          </span>
          <div className="min-w-0">
            <span className="block text-[13px] sm:text-[15px] font-semibold text-[#1B2A6B] leading-tight truncate font-bn">
              {SCHOOL_INFO.nameBn}
            </span>
            <span className="hidden sm:block text-[11px] text-slate-500 leading-tight truncate tabular-nums">
              EIIN: {SCHOOL_INFO.eiin} · স্থাপিত {SCHOOL_INFO.establishedBn} · নড়িয়া, শরীয়তপুর
            </span>
          </div>
        </Link>

        {/* Zone 2: Desktop Hover 2-Column Mega-Menu Navigation */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
          {PUBLIC_NAV_GROUPS.map((group, idx) => {
            const isActiveGroup = group.children?.some(
              (c) => pathname === c.href || (c.href !== '/' && pathname.startsWith(c.href + '/'))
            );
            const isOpen = openDropdown === group.id;
            // Align rightmost two menus to the right edge so the 2-column panel never overflows viewport
            const alignRight = idx >= 3;
            const alignCenter = idx === 2;

            return (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => handleGroupEnter(group.id)}
                onMouseLeave={handleGroupLeave}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer font-bn ${
                    isActiveGroup || isOpen
                      ? 'bg-[#1F7A4D]/10 text-[#1F7A4D]'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-[#1B2A6B]'
                  }`}
                >
                  <span>{group.labelBn}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      isOpen ? 'rotate-180 text-[#1F7A4D]' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Hover-accessible 2-Column Mega Dropdown with zero-gap bridge */}
                {isOpen && group.children && (
                  <div
                    role="menu"
                    aria-label={group.labelBn}
                    className={`absolute top-full pt-2.5 z-50 w-[560px] ${
                      alignRight
                        ? 'right-0'
                        : alignCenter
                          ? 'left-1/2 -translate-x-1/2'
                          : 'left-0'
                    }`}
                  >
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
                      {/* Panel Header */}
                      <div className="px-5 py-3 bg-[#F7F8FC] border-b border-slate-200/80 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#1B2A6B] font-bn">
                            {group.labelBn}
                          </p>
                          <p className="text-[11px] text-slate-500 font-bn">{group.taglineBn}</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1F7A4D]">
                          {group.label}
                        </span>
                      </div>

                      {/* 2-Column Icon Grid */}
                      <div className="p-3 grid grid-cols-2 gap-1.5">
                        {group.children.map((item) => {
                          const Icon = NAV_ICON_MAP[item.icon] || FileSpreadsheet;
                          const active = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              role="menuitem"
                              to={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className={`group/item flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                                active
                                  ? 'bg-[#1F7A4D]/10 text-[#1F7A4D]'
                                  : 'hover:bg-[#F7F8FC] text-slate-800'
                              }`}
                            >
                              <span
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  active
                                    ? 'bg-[#1F7A4D] text-white'
                                    : 'bg-[#1B2A6B]/[0.07] text-[#1B2A6B] group-hover/item:bg-[#1F7A4D] group-hover/item:text-white'
                                }`}
                              >
                                <Icon className="w-4 h-4" aria-hidden="true" />
                              </span>
                              <div className="min-w-0">
                                <span
                                  className={`block text-[13px] font-semibold leading-snug font-bn ${
                                    active
                                      ? 'text-[#1F7A4D]'
                                      : 'text-[#1B2A6B] group-hover/item:text-[#1F7A4D]'
                                  }`}
                                >
                                  {item.labelBn}
                                </span>
                                <span className="block text-[11px] text-slate-500 leading-snug mt-0.5 font-bn line-clamp-1">
                                  {item.description}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Zone 3: Primary Portal Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors whitespace-nowrap shrink-0 font-bn"
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span>ড্যাশবোর্ড</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1B2A6B] hover:bg-[#1F7A4D] rounded-lg transition-colors whitespace-nowrap shrink-0 font-bn"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span className="sm:hidden">লগইন</span>
              <span className="hidden sm:inline">পোর্টাল লগইন</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'নেভিগেশন মেনু বন্ধ করুন' : 'নেভিগেশন মেনু খুলুন'}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-[#1B2A6B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white text-slate-900 border-t border-slate-200 max-h-[calc(100vh-4.5rem)] overflow-y-auto shadow-xl">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-[#F7F8FC] text-xs text-slate-600 font-bn flex flex-wrap items-center gap-x-2">
            <span>{SCHOOL_INFO.addressBn}</span>
            <span className="tabular-nums text-[#1B2A6B] font-medium">EIIN: {SCHOOL_INFO.eiin}</span>
          </div>
          <nav aria-label="Mobile navigation" className="px-4 py-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium font-bn ${
                pathname === '/' ? 'bg-[#1F7A4D]/10 text-[#1F7A4D]' : 'text-[#1B2A6B]'
              }`}
            >
              মূল পাতা (হোম)
            </Link>
            {PUBLIC_NAV_GROUPS.map((group) => {
              const expanded = mobileExpanded === group.id;
              return (
                <div key={group.id} className="border-b border-slate-100 pb-1">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setMobileExpanded(expanded ? null : group.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-[#1B2A6B] rounded-lg hover:bg-[#F7F8FC] font-bn"
                  >
                    <span>{group.labelBn}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        expanded ? 'rotate-180 text-[#1F7A4D]' : ''
                      }`}
                    />
                  </button>
                  {expanded && group.children && (
                    <div className="pl-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {group.children.map((item) => {
                        const Icon = NAV_ICON_MAP[item.icon] || FileSpreadsheet;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-bn ${
                              pathname === item.href
                                ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] font-medium'
                                : 'text-slate-700 hover:bg-[#F7F8FC]'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-[#1F7A4D] shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.labelBn}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-3 grid grid-cols-3 gap-2 font-bn">
              <Link
                to="/admin-login"
                className="text-center py-2.5 px-2 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded-lg"
              >
                অ্যাডমিন
              </Link>
              <Link
                to="/teacher-login"
                className="text-center py-2.5 px-2 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded-lg"
              >
                শিক্ষক
              </Link>
              <Link
                to="/parent-login"
                className="text-center py-2.5 px-2 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded-lg"
              >
                অভিভাবক
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
