import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { useSchoolStore } from '../../store/SchoolStore';

export function PublicFooter() {
  const { db } = useSchoolStore();
  const wc = db.websiteContent;
  return (
    <footer className="site-footer no-print bg-[#1B2A6B] text-white mt-16 border-t-4 border-[#C9A961]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/15">
          {/* School Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={SCHOOL_INFO.assets.logo}
                alt="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় মনোগ্রাম"
                className="w-12 h-12 object-contain bg-white rounded-lg p-1 shrink-0"
              />
              <div>
                <p className="text-sm font-semibold font-bn leading-snug">{SCHOOL_INFO.nameBn}</p>
                <p className="text-xs text-white/75">{SCHOOL_INFO.nameEn}</p>
              </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-bn">
              {wc.mottoBn || SCHOOL_INFO.mottoBn} · স্থাপিতঃ {SCHOOL_INFO.establishedBn}
            </p>
            <p className="text-xs text-[#E3C884] font-medium tabular-nums">
              EIIN: {SCHOOL_INFO.eiin} · School Code: {SCHOOL_INFO.schoolCode}
            </p>
          </div>

          {/* Academic Links */}
          <div>
            <h3 className="text-sm font-medium text-[#C9A961] mb-3 font-bn">একাডেমিক ও পরিচিতি</h3>
            <ul className="space-y-2 text-xs text-white/85 font-bn">
              <li><Link to="/academics/notices" className="hover:text-white transition-colors">প্রাতিষ্ঠানিক নোটিশ বোর্ড</Link></li>
              <li><Link to="/academics/results" className="hover:text-white transition-colors">অনলাইন ফলাফল ও মার্কশিট</Link></li>
              <li><Link to="/academics/class-routine" className="hover:text-white transition-colors">সাপ্তাহিক ক্লাস রুটিন</Link></li>
              <li><Link to="/about/teachers" className="hover:text-white transition-colors">শিক্ষকমণ্ডলী ও প্রোফাইল</Link></li>
              <li><Link to="/academics/calendar" className="hover:text-white transition-colors">একাডেমিক ক্যালেন্ডার</Link></li>
            </ul>
          </div>

          {/* Admission & Portals */}
          <div>
            <h3 className="text-sm font-medium text-[#C9A961] mb-3 font-bn">ভর্তি ও ডিজিটাল পোর্টাল</h3>
            <ul className="space-y-2 text-xs text-white/85 font-bn">
              <li><Link to="/others/online-admission" className="hover:text-white transition-colors">অনলাইন ভর্তি আবেদন ২০২৭</Link></li>
              <li><Link to="/others/fees" className="hover:text-white transition-colors">বেতন ও ফি কাঠামো</Link></li>
              <li><Link to="/admin-login" className="hover:text-white transition-colors">প্রশাসনিক (অ্যাডমিন) পোর্টাল</Link></li>
              <li><Link to="/teacher-login" className="hover:text-white transition-colors">শিক্ষক পোর্টাল লগইন</Link></li>
              <li><Link to="/accountant-login" className="hover:text-white transition-colors">হিসাবরক্ষক পোর্টাল লগইন</Link></li>
              <li><Link to="/parent-login" className="hover:text-white transition-colors">অভিভাবক পোর্টাল লগইন</Link></li>
            </ul>
          </div>

          {/* Address & Office Hours */}
          <div>
            <h3 className="text-sm font-medium text-[#C9A961] mb-3 font-bn">যোগাযোগ ও অফিস সময়</h3>
            <div className="space-y-2.5 text-xs text-white/85 leading-relaxed font-bn">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C9A961] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{wc.addressBn || SCHOOL_INFO.addressBn}</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#C9A961] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{wc.officeHoursBn || SCHOOL_INFO.officeHoursBn}</span>
              </p>
              <p className="flex items-center gap-2 tabular-nums">
                <Phone className="w-3.5 h-3.5 text-[#C9A961] shrink-0" aria-hidden="true" />
                <span>{wc.contactPhone || SCHOOL_INFO.contactPlaceholders.officePhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C9A961] shrink-0" aria-hidden="true" />
                <span>{wc.contactEmail || SCHOOL_INFO.contactPlaceholders.email}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/75">
          <p className="font-bn text-center md:text-left">
            © {new Date().getFullYear()} {SCHOOL_INFO.nameBn} ({SCHOOL_INFO.nameEn}). সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1.5">
            <span className="tabular-nums text-white/70">
              EIIN: {SCHOOL_INFO.eiin} · School Code: {SCHOOL_INFO.schoolCode}
            </span>
            <span className="text-white/30 hidden sm:inline" aria-hidden="true">|</span>
            <p className="font-bn text-white/80">
              ডিজাইন ও উন্নয়নে:{' '}
              <a
                href="https://www.qyltavex.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#E8CF8E] hover:text-white underline-offset-4 hover:underline transition-colors font-sans"
              >
                Qyltavex Solutions Bd
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
