import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Download, ExternalLink, Eye, Image as ImageIcon, Plus, Radio, Trash2 } from 'lucide-react';
import { CLASS_LIST } from '../../constants/navigation';
import { SCHOOL_INFO } from '../../config/school';
import { useSchoolStore } from '../../store/SchoolStore';
import { useAuth } from '../../providers/AuthProvider';
import { noticeSchema } from '../../validations/schemas';
import { downloadNoticeFile } from '../../utils/downloadNotice';
import { RfidScannerWidget } from '../shared/RfidScannerWidget';
import { NoticePrintModal } from '../shared/NoticePrintModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { AttendanceStatus, Notice, SchoolEvent } from '../../types';

const EVENT_IMAGE_PRESETS = [
  { label: 'ঐতিহ্যবাহী ক্যাম্পাস ভবন', url: SCHOOL_INFO.assets.campusHero },
  { label: 'স্মার্ট শ্রেণিকক্ষ ও পাঠদান', url: SCHOOL_INFO.assets.classroomStudy },
  { label: 'বিজ্ঞান ও আইসিটি ল্যাব', url: SCHOOL_INFO.assets.scienceLab },
  { label: 'বিদ্যালয় গ্রন্থাগার', url: SCHOOL_INFO.assets.schoolLibrary },
  { label: 'বার্ষিক ক্রীড়া ও মাঠ', url: SCHOOL_INFO.assets.sportsField },
];

export function AdminSyllabusPage() {
  const { db, addSyllabus, deleteSyllabus } = useSchoolStore();
  const { user } = useAuth();
  const [className, setClassName] = useState('Class 9');
  const program = 'General' as const;
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('বার্ষিক পরীক্ষা ২০২৬');
  const [topics, setTopics] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topics.trim()) return;
    addSyllabus(
      {
        className,
        program,
        subject: subject.trim(),
        term: term.trim(),
        topics: topics.trim(),
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      user?.nameBn || 'Admin'
    );
    setSubject('');
    setTopics('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">নতুন সিলেবাস যুক্ত করুন</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select aria-label="Syllabus class" value={className} onChange={(e) => setClassName(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
            {CLASS_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input aria-label="Subject name" placeholder="বিষয়ের নাম *" required value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg font-bn" />
          <input aria-label="Term" placeholder="টার্ম" value={term} onChange={(e) => setTerm(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg font-bn" />
        </div>
        <textarea aria-label="Topics" rows={2} required placeholder="অধ্যায় ও পাঠ্যসূচির বিবরণ লিখুন..." value={topics} onChange={(e) => setTopics(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg font-bn" />
        <button type="submit" className="px-4 py-2 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn">
          সিলেবাস সংরক্ষণ করুন
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {db.syllabus.map((s) => (
          <article key={s.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs text-[#1F7A4D] font-medium">{s.className} · {s.program} · {s.term}</p>
              <h3 className="text-base font-medium text-[#1B2A6B] font-bn">{s.subject}</h3>
              <p className="text-sm text-slate-700 font-bn">{s.topics}</p>
            </div>
            <button
              type="button"
              aria-label={`Delete syllabus ${s.subject}`}
              onClick={() => deleteSyllabus(s.id, user?.nameBn || 'Admin')}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminNoticesPage() {
  const { db, addNotice, updateNoticeStatus, deleteNotice, addToast } = useSchoolStore();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [category, setCategory] = useState<Notice['category']>('Academic');
  const [isUrgent, setIsUrgent] = useState(false);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewNotice, setPreviewNotice] = useState<Notice | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = noticeSchema.safeParse({ title, titleBn, category, summary, content });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message || 'অনুগ্রহ করে সকল আবশ্যক তথ্য দিন।');
      return;
    }
    addNotice(
      {
        ...parsed.data,
        isUrgent,
        date: new Date().toISOString().slice(0, 10),
        attachmentName: `BUTPHS-Notice-${Date.now().toString().slice(-4)}.pdf`,
        status: 'Published',
        publishedBy: user?.nameBn || 'প্রধান শিক্ষক',
      },
      user?.nameBn || 'Admin'
    );
    setTitle('');
    setTitleBn('');
    setIsUrgent(false);
    setSummary('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4" noValidate>
        <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">নতুন নোটিশ প্রকাশ করুন</h2>
        {err && <div role="alert" className="p-2.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg font-bn">{err}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input aria-label="Notice English title" placeholder="Notice Title (English) *" value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
          <input aria-label="Notice Bangla title" placeholder="নোটিশের শিরোনাম (বাংলা) *" value={titleBn} onChange={(e) => setTitleBn(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg font-bn" />
          <select aria-label="Notice category" value={category} onChange={(e) => setCategory(e.target.value as Notice['category'])} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
            {['Academic', 'Exam', 'Admission', 'Holiday', 'Event', 'General'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <input aria-label="Short summary" placeholder="সংক্ষিপ্ত সারসংক্ষেপ *" value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-bn" />
        <textarea aria-label="Notice content" rows={3} placeholder="বিজ্ঞপ্তির বিস্তারিত বিবরণ *" value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg font-bn" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 font-bn cursor-pointer">
            <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="accent-red-600" />
            <span>জরুরি বিজ্ঞপ্তি হিসেবে চিহ্নিত করুন</span>
          </label>
          <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1F7A4D] rounded-lg cursor-pointer font-bn">
            <Plus className="w-4 h-4" />
            <span>নোটিশ প্রকাশ করুন</span>
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
              <tr>
                <th className="py-3 px-4 font-medium">বিজ্ঞপ্তি</th>
                <th className="py-3 px-4 font-medium">বিভাগ ও তারিখ</th>
                <th className="py-3 px-4 font-medium">অবস্থা</th>
                <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.notices.map((n) => (
                <tr key={n.id}>
                  <td className="py-3 px-4">
                    <p className="font-medium text-[#1B2A6B] font-bn">{n.titleBn}</p>
                    <p className="text-xs text-slate-500">{n.title}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">{n.category} · {n.date}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[#1F7A4D]">{n.status}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewNotice(n)}
                        aria-label={`Preview ${n.titleBn}`}
                        className="p-1.5 text-slate-600 hover:text-[#1F7A4D] cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          downloadNoticeFile(n);
                          addToast('success', 'বিজ্ঞপ্তি ডাউনলোড হয়েছে');
                        }}
                        aria-label={`Download ${n.title}`}
                        className="p-1.5 text-slate-600 hover:text-[#1B2A6B] cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateNoticeStatus(
                            n.id,
                            n.status === 'Published' ? 'Archived' : 'Published',
                            user?.nameBn || 'Admin'
                          )
                        }
                        className="text-xs font-medium text-[#1B2A6B] hover:text-[#1F7A4D] cursor-pointer"
                      >
                        {n.status === 'Published' ? 'Archive' : 'Publish'}
                      </button>
                      <button type="button" aria-label={`Delete ${n.title}`} onClick={() => setDeletingId(n.id)} className="p-1.5 text-slate-500 hover:text-red-600 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NoticePrintModal
        notice={previewNotice}
        onClose={() => setPreviewNotice(null)}
        headTeacherName={db.websiteContent.headTeacherName}
      />

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="বিজ্ঞপ্তি মুছে ফেলবেন?"
        message="নিশ্চিত করলে বিজ্ঞপ্তিটি অ্যাডমিন প্যানেল ও পাবলিক নোটিশ বোর্ড থেকে অপসারিত হবে।"
        confirmLabel="মুছে ফেলুন"
        destructive
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteNotice(deletingId, user?.nameBn || 'Admin');
          setDeletingId(null);
        }}
      />
    </div>
  );
}

export function AdminWebsiteContentPage() {
  const { db, updateWebsiteContent, addSchoolEvent, deleteSchoolEvent } = useSchoolStore();
  const { user } = useAuth();
  const [cmsTab, setCmsTab] = useState<'hero' | 'leadership' | 'about' | 'contact' | 'events'>('hero');
  const [form, setForm] = useState(db.websiteContent);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [eventCatFilter, setEventCatFilter] = useState<'All' | SchoolEvent['category']>('All');
  const [chairmanFullText, setChairmanFullText] = useState(
    (db.websiteContent.chairmanFullMessage || []).join('\n\n')
  );
  const [headTeacherFullText, setHeadTeacherFullText] = useState(
    (db.websiteContent.headTeacherFullMessage || []).join('\n\n')
  );

  // Keep form synced when database resets
  useEffect(() => {
    setForm(db.websiteContent);
    setChairmanFullText((db.websiteContent.chairmanFullMessage || []).join('\n\n'));
    setHeadTeacherFullText((db.websiteContent.headTeacherFullMessage || []).join('\n\n'));
  }, [db.websiteContent]);

  // New Campus Event Form
  const [evTitleBn, setEvTitleBn] = useState('');
  const [evTitleEn, setEvTitleEn] = useState('');
  const [evCategory, setEvCategory] = useState<SchoolEvent['category']>('Academic');
  const [evDate, setEvDate] = useState(new Date().toISOString().slice(0, 10));
  const [evSummary, setEvSummary] = useState('');
  const [evImageUrl, setEvImageUrl] = useState<string>(EVENT_IMAGE_PRESETS[0].url);

  const slides = form.heroSlides || [];
  const currentSlide = slides[activeSlideIdx];

  const updateSlideField = (idx: number, field: string, value: string) => {
    setForm((prev) => {
      const nextSlides = [...(prev.heroSlides || [])];
      if (!nextSlides[idx]) return prev;
      nextSlides[idx] = { ...nextSlides[idx], [field]: value };
      return {
        ...prev,
        heroSlides: nextSlides,
        ...(idx === 0 && field === 'headlineBn' ? { heroHeadline: value } : {}),
        ...(idx === 0 && field === 'subtitleBn' ? { heroSubheadline: value } : {}),
      };
    });
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    const chairmanParagraphs = chairmanFullText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const headParagraphs = headTeacherFullText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    updateWebsiteContent(
      {
        ...form,
        chairmanFullMessage: chairmanParagraphs.length > 0 ? chairmanParagraphs : form.chairmanFullMessage,
        headTeacherFullMessage: headParagraphs.length > 0 ? headParagraphs : form.headTeacherFullMessage,
      },
      user?.nameBn || 'Admin'
    );
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitleBn.trim() || !evSummary.trim()) return;
    addSchoolEvent(
      {
        titleBn: evTitleBn.trim(),
        title: evTitleEn.trim() || evTitleBn.trim(),
        category: evCategory,
        date: evDate,
        summary: evSummary.trim(),
        imageUrl: evImageUrl,
      },
      user?.nameBn || 'Admin'
    );
    setEvTitleBn('');
    setEvTitleEn('');
    setEvSummary('');
  };

  const filteredEvents = db.events.filter(
    (ev) => eventCatFilter === 'All' || ev.category === eventCatFilter
  );

  return (
    <div className="space-y-6 font-bn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap bg-white border border-slate-200 rounded-xl p-1">
          {(
            [
              { id: 'hero', label: 'হিরো স্লাইডার ও পরিসংখ্যান' },
              { id: 'leadership', label: 'সভাপতি ও প্রধান শিক্ষকের বাণী' },
              { id: 'about', label: 'ইতিহাস, লক্ষ্য ও মূলমন্ত্র' },
              { id: 'contact', label: 'যোগাযোগ ও ভর্তি ব্যানার' },
              { id: 'events', label: `ইভেন্ট ও গ্যালারি (${db.events.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCmsTab(t.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                cmsTab === t.id ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Link
          to={
            cmsTab === 'events'
              ? '/others/media'
              : cmsTab === 'about'
                ? '/about/mission-vision'
                : cmsTab === 'leadership'
                  ? '/about/head-teacher-message'
                  : cmsTab === 'contact'
                    ? '/contact'
                    : '/'
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F7A4D] hover:underline"
        >
          <span>পাবলিক পেজ প্রিভিউ</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {cmsTab !== 'events' ? (
        <form onSubmit={handleSaveContent} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 max-w-4xl">
          {cmsTab === 'hero' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-[#1B2A6B]">হোমপেজ হিরো স্লাইডার, ঘোষণা বার্তা ও পরিসংখ্যান</h2>
                <p className="text-xs text-slate-500 mt-0.5">সংরক্ষণ করার সাথে সাথে পাবলিক হোমপেজের স্লাইডার, ঘোষণা ও পরিসংখ্যানে পরিবর্তন প্রদর্শিত হবে।</p>
              </div>

              <div>
                <label htmlFor="cms-banner" className="block text-xs font-medium text-slate-700 mb-1">শীর্ষ ঘোষণা বার্তা (Top Announcement Ticker)</label>
                <input id="cms-banner" value={form.announcementBanner} onChange={(e) => setForm({ ...form, announcementBanner: e.target.value })} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg" />
              </div>

              {/* 4-Slide Interactive Editor */}
              {slides.length > 0 && currentSlide && (
                <div className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#1B2A6B]">হিরো স্লাইড সম্পাদনা ({slides.length}টি স্লাইড)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {slides.map((sl, idx) => (
                        <button
                          key={sl.id}
                          type="button"
                          onClick={() => setActiveSlideIdx(idx)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md border cursor-pointer ${
                            activeSlideIdx === idx
                              ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-[#1B2A6B]'
                          }`}
                        >
                          স্লাইড {idx + 1}: {sl.labelBn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="sl-label" className="block text-xs font-medium text-slate-700 mb-1">স্লাইড ট্যাব লেবেল</label>
                      <input id="sl-label" value={currentSlide.labelBn} onChange={(e) => updateSlideField(activeSlideIdx, 'labelBn', e.target.value)} className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label htmlFor="sl-img" className="block text-xs font-medium text-slate-700 mb-1">স্লাইডের ব্যাকগ্রাউন্ড ছবি</label>
                      <select id="sl-img" value={currentSlide.image} onChange={(e) => updateSlideField(activeSlideIdx, 'image', e.target.value)} className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg">
                        {EVENT_IMAGE_PRESETS.map((p) => (
                          <option key={p.url} value={p.url}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="sl-head" className="block text-xs font-medium text-slate-700 mb-1">স্লাইড শিরোনাম</label>
                      <input id="sl-head" value={currentSlide.headlineBn} onChange={(e) => updateSlideField(activeSlideIdx, 'headlineBn', e.target.value)} className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="sl-sub" className="block text-xs font-medium text-slate-700 mb-1">স্লাইড বিবরণ</label>
                      <textarea id="sl-sub" rows={2} value={currentSlide.subtitleBn} onChange={(e) => updateSlideField(activeSlideIdx, 'subtitleBn', e.target.value)} className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label htmlFor="sl-cta" className="block text-xs font-medium text-slate-700 mb-1">প্রাথমিক বাটন টেক্সট</label>
                      <input id="sl-cta" value={currentSlide.ctaLabel} onChange={(e) => updateSlideField(activeSlideIdx, 'ctaLabel', e.target.value)} className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label htmlFor="sl-sec" className="block text-xs font-medium text-slate-700 mb-1">দ্বিতীয় বাটন টেক্সট</label>
                      <input id="sl-sec" value={currentSlide.secondaryLabel} onChange={(e) => updateSlideField(activeSlideIdx, 'secondaryLabel', e.target.value)} className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-lg" />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-[#1B2A6B] mb-2.5">হোমপেজ মূল পরিসংখ্যান (Institutional Counter)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="stat-stu" className="block text-xs font-medium text-slate-700 mb-1">মোট শিক্ষার্থী</label>
                    <input id="stat-stu" type="number" value={form.demoStats.studentsCount} onChange={(e) => setForm({ ...form, demoStats: { ...form.demoStats, studentsCount: Number(e.target.value) } })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
                  </div>
                  <div>
                    <label htmlFor="stat-tch" className="block text-xs font-medium text-slate-700 mb-1">শিক্ষক সংখ্যা</label>
                    <input id="stat-tch" type="number" value={form.demoStats.teachersCount} onChange={(e) => setForm({ ...form, demoStats: { ...form.demoStats, teachersCount: Number(e.target.value) } })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
                  </div>
                  <div>
                    <label htmlFor="stat-stf" className="block text-xs font-medium text-slate-700 mb-1">কর্মচারী সংখ্যা</label>
                    <input id="stat-stf" type="number" value={form.demoStats.staffCount} onChange={(e) => setForm({ ...form, demoStats: { ...form.demoStats, staffCount: Number(e.target.value) } })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
                  </div>
                  <div>
                    <label htmlFor="stat-adm" className="block text-xs font-medium text-slate-700 mb-1">নতুন ভর্তি আসন</label>
                    <input id="stat-adm" type="number" value={form.demoStats.newAdmissionsCount} onChange={(e) => setForm({ ...form, demoStats: { ...form.demoStats, newAdmissionsCount: Number(e.target.value) } })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {cmsTab === 'leadership' && (
            <div className="space-y-6">
              <div className="space-y-3 pb-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#1B2A6B]">সভাপতির বাণী (Chairman Message)</h2>
                  <Link to="/about/chairman-message" className="text-xs text-[#1F7A4D] hover:underline">সভাপতির বাণী পাতা →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cms-ch-name" className="block text-xs font-medium text-slate-700 mb-1">সভাপতির নাম</label>
                    <input id="cms-ch-name" value={form.chairmanName || ''} onChange={(e) => setForm({ ...form, chairmanName: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label htmlFor="cms-ch-title" className="block text-xs font-medium text-slate-700 mb-1">পদবি</label>
                    <input id="cms-ch-title" value={form.chairmanTitle || ''} onChange={(e) => setForm({ ...form, chairmanTitle: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label htmlFor="cms-ch-msg" className="block text-xs font-medium text-slate-700 mb-1">সংক্ষিপ্ত বাণী (হোমপেজের জন্য)</label>
                  <textarea id="cms-ch-msg" rows={2} value={form.chairmanMessage || ''} onChange={(e) => setForm({ ...form, chairmanMessage: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="cms-ch-full" className="block text-xs font-medium text-slate-700 mb-1">পূর্ণাঙ্গ বাণী (প্রতিটি অনুচ্ছেদ আলাদা লাইনে লিখুন)</label>
                  <textarea id="cms-ch-full" rows={4} value={chairmanFullText} onChange={(e) => setChairmanFullText(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#1B2A6B]">প্রধান শিক্ষকের বাণী (Head Teacher Message)</h2>
                  <Link to="/about/head-teacher-message" className="text-xs text-[#1F7A4D] hover:underline">প্রধান শিক্ষকের বাণী পাতা →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cms-ht-name" className="block text-xs font-medium text-slate-700 mb-1">প্রধান শিক্ষকের নাম</label>
                    <input id="cms-ht-name" value={form.headTeacherName} onChange={(e) => setForm({ ...form, headTeacherName: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label htmlFor="cms-ht-title" className="block text-xs font-medium text-slate-700 mb-1">পদবি</label>
                    <input id="cms-ht-title" value={form.headTeacherTitle} onChange={(e) => setForm({ ...form, headTeacherTitle: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label htmlFor="cms-ht-msg" className="block text-xs font-medium text-slate-700 mb-1">সংক্ষিপ্ত বাণী (হোমপেজের জন্য)</label>
                  <textarea id="cms-ht-msg" rows={2} value={form.headTeacherMessage} onChange={(e) => setForm({ ...form, headTeacherMessage: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="cms-ht-full" className="block text-xs font-medium text-slate-700 mb-1">পূর্ণাঙ্গ বাণী (প্রতিটি অনুচ্ছেদ আলাদা লাইনে লিখুন)</label>
                  <textarea id="cms-ht-full" rows={4} value={headTeacherFullText} onChange={(e) => setHeadTeacherFullText(e.target.value)} className="w-full p-3 text-sm border border-slate-300 rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {cmsTab === 'about' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[#1B2A6B]">প্রতিষ্ঠানের মূলমন্ত্র, ইতিহাস, লক্ষ্য ও উদ্দেশ্য</h2>
                <p className="text-xs text-slate-500 mt-0.5">এই তথ্যসমূহ প্রতিষ্ঠানের ইতিহাস এবং লক্ষ্য ও উদ্দেশ্য পাতায় সরাসরি প্রতিফলিত হয়।</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cms-motto-bn" className="block text-xs font-medium text-slate-700 mb-1">বিদ্যালয়ের মূলমন্ত্র (বাংলা)</label>
                  <input id="cms-motto-bn" value={form.mottoBn || ''} onChange={(e) => setForm({ ...form, mottoBn: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="cms-motto-en" className="block text-xs font-medium text-slate-700 mb-1">School Motto (English)</label>
                  <input id="cms-motto-en" value={form.mottoEn || ''} onChange={(e) => setForm({ ...form, mottoEn: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" />
                </div>
              </div>
              <div>
                <label htmlFor="cms-history" className="block text-xs font-medium text-slate-700 mb-1">প্রতিষ্ঠানের ইতিহাস সারসংক্ষেপ</label>
                <textarea id="cms-history" rows={3} value={form.historySummary} onChange={(e) => setForm({ ...form, historySummary: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="cms-mission" className="block text-xs font-medium text-slate-700 mb-1">আমাদের লক্ষ্য (Mission Statement)</label>
                <textarea id="cms-mission" rows={3} value={form.missionSummary} onChange={(e) => setForm({ ...form, missionSummary: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="cms-vision" className="block text-xs font-medium text-slate-700 mb-1">আমাদের উদ্দেশ্য ও স্বপ্ন (Vision Statement)</label>
                <textarea id="cms-vision" rows={3} value={form.visionSummary} onChange={(e) => setForm({ ...form, visionSummary: e.target.value })} className="w-full p-3 text-sm border border-slate-300 rounded-lg" />
              </div>
            </div>
          )}

          {cmsTab === 'contact' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[#1B2A6B]">যোগাযোগ তথ্য, অফিস সময়সূচি ও ভর্তি ব্যানার</h2>
                <p className="text-xs text-slate-500 mt-0.5">ফুটার, যোগাযোগ পাতা এবং হোমপেজের ভর্তি বিভাগে এই তথ্যসমূহ প্রদর্শিত হয়।</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label htmlFor="cms-addr" className="block text-xs font-medium text-slate-700 mb-1">বিদ্যালয়ের পূর্ণ ঠিকানা (বাংলা)</label>
                  <input id="cms-addr" value={form.addressBn || ''} onChange={(e) => setForm({ ...form, addressBn: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="cms-hours" className="block text-xs font-medium text-slate-700 mb-1">অফিস সময়সূচি</label>
                  <input id="cms-hours" value={form.officeHoursBn || ''} onChange={(e) => setForm({ ...form, officeHoursBn: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="cms-email" className="block text-xs font-medium text-slate-700 mb-1">অফিসিয়াল ইমেইল</label>
                  <input id="cms-email" value={form.contactEmail || ''} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" />
                </div>
                <div>
                  <label htmlFor="cms-phone1" className="block text-xs font-medium text-slate-700 mb-1">প্রধান অফিস ফোন নম্বর</label>
                  <input id="cms-phone1" value={form.contactPhone || ''} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
                </div>
                <div>
                  <label htmlFor="cms-phone2" className="block text-xs font-medium text-slate-700 mb-1">একাডেমিক ও ভর্তি হেল্পলাইন</label>
                  <input id="cms-phone2" value={form.academicPhone || ''} onChange={(e) => setForm({ ...form, academicPhone: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
                </div>
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <label htmlFor="cms-adm-head" className="block text-xs font-medium text-slate-700 mb-1">ভর্তি কলআউট শিরোনাম (হোমপেজ)</label>
                  <input id="cms-adm-head" value={form.admissionHeadline || ''} onChange={(e) => setForm({ ...form, admissionHeadline: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="cms-adm-sub" className="block text-xs font-medium text-slate-700 mb-1">ভর্তি কলআউট বিবরণ</label>
                  <textarea id="cms-adm-sub" rows={2} value={form.admissionSubtitle || ''} onChange={(e) => setForm({ ...form, admissionSubtitle: e.target.value })} className="w-full p-2.5 text-sm border border-slate-300 rounded-lg" />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleAddEvent} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-[#1B2A6B] inline-flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#1F7A4D]" />
              <span>নতুন ক্যাম্পাস ইভেন্ট ও গ্যালারি পোস্ট যুক্ত করুন</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input aria-label="Event title Bangla" required placeholder="ইভেন্টের শিরোনাম (বাংলা) *" value={evTitleBn} onChange={(e) => setEvTitleBn(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              <input aria-label="Event title English" placeholder="Title (English)" value={evTitleEn} onChange={(e) => setEvTitleEn(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" />
              <select aria-label="Event category" value={evCategory} onChange={(e) => setEvCategory(e.target.value as SchoolEvent['category'])} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white font-sans">
                {(['Academic', 'Sports', 'Cultural', 'Achievement'] as const).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input aria-label="Event date" type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select aria-label="Campus photo" value={evImageUrl} onChange={(e) => setEvImageUrl(e.target.value)} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {EVENT_IMAGE_PRESETS.map((p) => <option key={p.url} value={p.url}>{p.label}</option>)}
              </select>
              <input aria-label="Event summary" required placeholder="সংক্ষিপ্ত বিবরণ *" value={evSummary} onChange={(e) => setEvSummary(e.target.value)} className="sm:col-span-2 h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>গ্যালারিতে যুক্ত করুন</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#1B2A6B]">প্রকাশিত ক্যাম্পাস ইভেন্টসমূহ ({filteredEvents.length})</h3>
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Academic', 'Sports', 'Cultural', 'Achievement'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEventCatFilter(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border cursor-pointer font-sans ${
                    eventCatFilter === cat
                      ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#1B2A6B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((ev) => (
              <article key={ev.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <img src={ev.imageUrl} alt={ev.titleBn} className="w-full h-36 object-cover bg-slate-100" />
                <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold text-[#1F7A4D] tabular-nums font-sans">{ev.category} · {ev.date}</p>
                    <h3 className="text-sm font-semibold text-[#1B2A6B] mt-0.5">{ev.titleBn}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ev.summary}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteSchoolEvent(ev.id, user?.nameBn || 'Admin')}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>অপসারণ</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminRfidPage() {
  const { db, assignRfidCard, updateRfidCardStatus } = useSchoolStore();
  const { user } = useAuth();
  const [cardUid, setCardUid] = useState('');
  const [studentId, setStudentId] = useState(db.students[0]?.studentId || '');
  const [assignMsg, setAssignMsg] = useState<string | null>(null);

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const res = assignRfidCard(cardUid, studentId, user?.nameBn || 'Admin');
    setAssignMsg(res.message);
    if (res.ok) setCardUid('');
  };

  return (
    <div className="space-y-6">
      <RfidScannerWidget />

      <form onSubmit={handleAssign} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#1B2A6B] font-bn">নতুন RFID কার্ড বরাদ্দ করুন</h2>
        {assignMsg && <p className="text-xs text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded p-2.5 font-bn">{assignMsg}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label htmlFor="rfid-new-uid" className="block text-xs font-medium text-slate-700 mb-1">Card UID</label>
            <input id="rfid-new-uid" required placeholder="যেমন: RFID-1099" value={cardUid} onChange={(e) => setCardUid(e.target.value)} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label htmlFor="rfid-stu" className="block text-xs font-medium text-slate-700 mb-1 font-bn">শিক্ষার্থী নির্বাচন করুন</label>
            <select id="rfid-stu" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white">
              {db.students.map((s) => <option key={s.id} value={s.studentId}>{s.studentId} — {s.nameBn}</option>)}
            </select>
          </div>
          <button type="submit" className="h-10 px-4 text-sm font-medium text-white bg-[#1B2A6B] hover:bg-[#121D4D] rounded-lg cursor-pointer font-bn">
            কার্ড বরাদ্দ করুন
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn">নিবন্ধিত RFID কার্ডসমূহ ({db.rfidCards.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
              <tr>
                <th className="py-3 px-4 font-medium">কার্ড UID</th>
                <th className="py-3 px-4 font-medium">শিক্ষার্থী</th>
                <th className="py-3 px-4 font-medium">শ্রেণি</th>
                <th className="py-3 px-4 font-medium">সর্বশেষ স্ক্যান</th>
                <th className="py-3 px-4 font-medium">অবস্থা</th>
                <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.rfidCards.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 px-4 tabular-nums font-medium text-[#1B2A6B]">{c.cardUid}</td>
                  <td className="py-3 px-4 font-bn">{c.studentName} <span className="text-xs text-slate-500">({c.studentId})</span></td>
                  <td className="py-3 px-4">{c.className}</td>
                  <td className="py-3 px-4 tabular-nums text-xs text-slate-600">{c.lastScannedAt || '—'}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[#1F7A4D]">{c.status}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => updateRfidCardStatus(c.id, c.status === 'Active' ? 'Lost' : 'Active', user?.nameBn || 'Admin')}
                      className="text-xs font-medium text-[#1B2A6B] hover:text-[#1F7A4D] cursor-pointer"
                    >
                      {c.status === 'Active' ? 'Mark Lost' : 'Reactivate'}
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

export function AdminAttendancePage() {
  const { db, saveManualAttendance } = useSchoolStore();
  const { user } = useAuth();
  const [classFilter, setClassFilter] = useState('All');
  const [studentId, setStudentId] = useState(db.students[0]?.studentId || '');
  const [date, setDate] = useState('2026-11-20');
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [remarks, setRemarks] = useState('');

  const filtered = db.attendance.filter((a) => classFilter === 'All' || a.className === classFilter);

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    saveManualAttendance(studentId, date, status, remarks, user?.nameBn || 'Admin');
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleManual} className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div>
          <label htmlFor="att-stu" className="block text-xs font-medium text-slate-700 mb-1 font-bn">শিক্ষার্থী</label>
          <select id="att-stu" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
            {db.students.map((s) => <option key={s.id} value={s.studentId}>{s.studentId} · {s.nameBn}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="att-date" className="block text-xs font-medium text-slate-700 mb-1 font-bn">তারিখ</label>
          <input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
        </div>
        <div>
          <label htmlFor="att-status" className="block text-xs font-medium text-slate-700 mb-1 font-bn">উপস্থিতি অবস্থা</label>
          <select id="att-status" value={status} onChange={(e) => setStatus(e.target.value as AttendanceStatus)} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
            {(['Present', 'Absent', 'Late', 'Exited'] as AttendanceStatus[]).map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="att-rem" className="block text-xs font-medium text-slate-700 mb-1 font-bn">মন্তব্য</label>
          <input id="att-rem" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="ঐচ্ছিক মন্তব্য" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-bn" />
        </div>
        <button type="submit" className="h-9 px-4 text-xs font-medium text-white bg-[#1F7A4D] rounded-lg cursor-pointer font-bn">
          হাজিরা সংরক্ষণ
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#1B2A6B] font-bn">দৈনিক উপস্থিতি ইতিহাস ({filtered.length} টি রেকর্ড)</h2>
          <select aria-label="Filter attendance class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="h-9 px-3 text-xs border border-slate-300 rounded-lg bg-white">
            <option value="All">All Classes</option>
            {CLASS_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B] font-bn">
              <tr>
                <th className="py-3 px-4 font-medium">তারিখ</th>
                <th className="py-3 px-4 font-medium">শিক্ষার্থী</th>
                <th className="py-3 px-4 font-medium">শ্রেণি</th>
                <th className="py-3 px-4 font-medium">প্রবেশ / প্রস্থান</th>
                <th className="py-3 px-4 font-medium">অবস্থা</th>
                <th className="py-3 px-4 font-medium">মাধ্যম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 px-4 tabular-nums text-xs">{r.date}</td>
                  <td className="py-3 px-4 font-bn">{r.studentName} <span className="text-xs text-slate-500">({r.studentId})</span></td>
                  <td className="py-3 px-4 text-xs">{r.className}</td>
                  <td className="py-3 px-4 tabular-nums text-xs">{r.entryTime || '—'} / {r.exitTime || '—'}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[#1F7A4D]">{r.status}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminRfidAndAttendancePage({ defaultTab = 'rfid' }: { defaultTab?: 'rfid' | 'attendance' }) {
  const [tab, setTab] = useState<'rfid' | 'attendance'>(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-5">
      <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 font-bn">
        <button
          type="button"
          onClick={() => setTab('rfid')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'rfid' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>RFID গেট ও কার্ড ব্যবস্থাপনা</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('attendance')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
            tab === 'attendance' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>দৈনিক উপস্থিতি ও ম্যানুয়াল হাজিরা</span>
        </button>
      </div>

      {tab === 'rfid' ? <AdminRfidPage /> : <AdminAttendancePage />}
    </div>
  );
}

