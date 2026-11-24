import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  ExternalLink,
  Eye,
  Inbox,
  Library,
  Plus,
  Printer,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { CLASS_LIST, SECTION_LIST } from '../../constants/navigation';
import { SCHOOL_INFO } from '../../config/school';
import { LIBRARY_CATEGORIES, type LibraryCategory } from '../../data/academicCatalog';
import { useAuth } from '../../providers/AuthProvider';
import { useSchoolStore } from '../../store/SchoolStore';
import { formatCurrencyBdt } from '../../utils/grading';
import { toBanglaDigits } from '../../utils/noticeUtils';
import { filterInquiries } from '../../utils/portalHelpers';
import { filterCommitteeTable } from '../../utils/adminFormHelpers';
import { AdminSyllabusPage } from './AdminAcademicPages';
import { AdminPrintDocumentsPage } from './AdminOperationsPages';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import type { AdmissionApplication, CommitteeCategory, CommitteeMember, ContactInquiry } from '../../types';

// ---------------------------------------------------------------------------
// 1. ADMIN MANAGING COMMITTEE CRUD (Clean Image-Free Admin Table + Public Sync)
// ---------------------------------------------------------------------------

const COMMITTEE_PORTRAIT_PRESETS = [
  { labelBn: 'সভাপতি পোর্ট্রেট', url: SCHOOL_INFO.assets.chairmanPortrait },
  { labelBn: 'প্রধান শিক্ষক পোর্ট্রেট', url: SCHOOL_INFO.assets.headTeacher },
  { labelBn: 'সিনিয়র শিক্ষক পোর্ট্রেট', url: SCHOOL_INFO.assets.teacherMaleScience },
  { labelBn: 'পুরুষ অভিভাবক প্রতিনিধি', url: SCHOOL_INFO.assets.committeeGuardianMale },
  { labelBn: 'মহিলা অভিভাবক প্রতিনিধি', url: SCHOOL_INFO.assets.committeeGuardianFemale },
  { labelBn: 'দাতা ও সমাজসেবক প্রতিনিধি', url: SCHOOL_INFO.assets.committeeDonorElder },
];

const COMMITTEE_CATEGORIES: CommitteeCategory[] = [
  'সভাপতি ও নেতৃত্ব',
  'অভিভাবক প্রতিনিধি',
  'শিক্ষক প্রতিনিধি',
  'দাতা ও প্রতিষ্ঠাতা',
];

export function AdminCommitteePage() {
  const { db, addCommitteeMember, updateCommitteeMember, deleteCommitteeMember } = useSchoolStore();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CommitteeCategory>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'name'>('priority');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CommitteeMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nameBn: '',
    name: '',
    roleBn: 'অভিভাবক প্রতিনিধি',
    role: 'Guardian Representative',
    category: 'অভিভাবক প্রতিনিধি' as CommitteeCategory,
    tenure: '২০২৫–২০২৭ মেয়াদ',
    professionBn: '',
    educationBn: '',
    phone: '01711-000000',
    email: '',
    photoUrl: SCHOOL_INFO.assets.committeeGuardianMale as string,
    bioBn: '',
    quoteBn: '',
    priorityOrder: 7,
  });

  const filteredMembers = useMemo(
    () =>
      filterCommitteeTable(db.committeeMembers, {
        query: search,
        category: categoryFilter,
        sortBy,
      }),
    [db.committeeMembers, search, categoryFilter, sortBy]
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      nameBn: '',
      name: '',
      roleBn: 'নির্বাচিত অভিভাবক সদস্য',
      role: 'Elected Guardian Representative',
      category: 'অভিভাবক প্রতিনিধি',
      tenure: '২০২৫–২০২৭ কার্যকাল',
      professionBn: '',
      educationBn: '',
      phone: '01711-000000',
      email: '',
      photoUrl: SCHOOL_INFO.assets.committeeGuardianMale,
      bioBn: '',
      quoteBn: '',
      priorityOrder: db.committeeMembers.length + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (member: CommitteeMember) => {
    setEditing(member);
    setForm({
      nameBn: member.nameBn,
      name: member.name,
      roleBn: member.roleBn,
      role: member.role,
      category: member.category,
      tenure: member.tenure,
      professionBn: member.professionBn,
      educationBn: member.educationBn,
      phone: member.phone,
      email: member.email || '',
      photoUrl: member.photoUrl,
      bioBn: member.bioBn,
      quoteBn: member.quoteBn || '',
      priorityOrder: member.priorityOrder,
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameBn.trim() || !form.roleBn.trim()) return;

    const payload = {
      nameBn: form.nameBn.trim(),
      name: form.name.trim() || form.nameBn.trim(),
      roleBn: form.roleBn.trim(),
      role: form.role.trim() || form.roleBn.trim(),
      category: form.category,
      tenure: form.tenure.trim() || '২০২৫–২০২৭ কার্যকাল',
      professionBn: form.professionBn.trim() || 'শিক্ষানুরাগী ও সমাজসেবক',
      educationBn: form.educationBn.trim() || 'স্নাতক',
      phone: form.phone.trim() || 'অফিস ডেস্কে সংরক্ষিত',
      email: form.email.trim() || undefined,
      photoUrl: form.photoUrl,
      bioBn:
        form.bioBn.trim() ||
        `${form.nameBn.trim()} বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের পরিচালনা পর্ষদের সম্মানিত সদস্য হিসেবে প্রাতিষ্ঠানিক উন্নয়নে কাজ করছেন।`,
      quoteBn: form.quoteBn.trim() || undefined,
      priorityOrder: Number(form.priorityOrder) || db.committeeMembers.length + 1,
    };

    if (editing) {
      updateCommitteeMember(editing.id, payload, user?.nameBn || 'Admin');
    } else {
      addCommitteeMember(
        {
          ...payload,
          responsibilities: [
            'বিদ্যালয়ের সার্বিক শৃঙ্খলা ও উন্নয়নমূলক কার্যক্রমে অংশগ্রহণ',
            'অভিভাবক ও শিক্ষার্থীদের কল্যাণে পরামর্শ প্রদান',
          ],
        },
        user?.nameBn || 'Admin'
      );
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5 font-bn">
      {/* Header + Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#1B2A6B] inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1F7A4D]" />
              <span>বিদ্যালয় পরিচালনা পর্ষদ (Managing Committee)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              পর্ষদের সদস্যদের তথ্য এখানে টেবিল আকারে ব্যবস্থাপনা করুন; পাবলিক ওয়েবসাইটে প্রোফাইল ও ছবি স্বয়ংক্রিয়ভাবে হালনাগাদ হয়।
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/about/management-committee"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 hover:border-[#1B2A6B] rounded-lg"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>পাবলিক পেজ দেখুন</span>
            </Link>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সদস্য যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* Category Counts Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100">
          <div className="p-2.5 rounded-lg bg-[#F7F8FC] border border-slate-200/70">
            <p className="text-[11px] text-slate-500">মোট সদস্য</p>
            <p className="text-base font-semibold text-[#1B2A6B] tabular-nums">{toBanglaDigits(db.committeeMembers.length)}</p>
          </div>
          {COMMITTEE_CATEGORIES.map((cat) => (
            <div key={cat} className="p-2.5 rounded-lg bg-[#F7F8FC] border border-slate-200/70">
              <p className="text-[11px] text-slate-500 truncate">{cat}</p>
              <p className="text-base font-semibold text-[#1F7A4D] tabular-nums">
                {toBanglaDigits(db.committeeMembers.filter((m) => m.category === cat).length)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="search"
            aria-label="পরিচালনা পর্ষদ সদস্য খুঁজুন"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, পদবি, পেশা বা মোবাইল নম্বর খুঁজুন..."
            className="w-full h-10 pl-9 pr-3 text-sm border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="বিভাগ ফিল্টার"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | CommitteeCategory)}
            className="h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">সকল বিভাগ ({toBanglaDigits(db.committeeMembers.length)})</option>
            {COMMITTEE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            aria-label="সাজানোর ক্রম"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'name')}
            className="h-10 px-3 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="priority">ক্রম অনুযায়ী (Priority)</option>
            <option value="name">নাম অনুযায়ী (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Clean Image-Free Data Table */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          title="কোনো পর্ষদ সদস্য খুঁজে পাওয়া যায়নি"
          description="অনুসন্ধান বা বিভাগ ফিল্টার পরিবর্তন করুন অথবা নতুন সদস্য যুক্ত করুন।"
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
                <tr>
                  <th className="py-3 px-4 font-medium w-14">ক্রম</th>
                  <th className="py-3 px-4 font-medium">সদস্যের নাম</th>
                  <th className="py-3 px-4 font-medium">পদবি ও বিভাগ</th>
                  <th className="py-3 px-4 font-medium">পেশা ও যোগ্যতা</th>
                  <th className="py-3 px-4 font-medium">কার্যকাল</th>
                  <th className="py-3 px-4 font-medium">যোগাযোগ</th>
                  <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F7F8FC]/60">
                    <td className="py-3 px-4 tabular-nums font-semibold text-slate-600">
                      {toBanglaDigits(member.priorityOrder)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#1B2A6B]">{member.nameBn}</p>
                      <p className="text-xs text-slate-500 font-sans">{member.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800 font-medium">{member.roleBn}</p>
                      <p className="text-xs text-[#1F7A4D]">{member.category}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="text-slate-700">{member.professionBn}</p>
                      <p className="text-slate-400">{member.educationBn}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {member.tenure}
                    </td>
                    <td className="py-3 px-4 text-xs tabular-nums font-sans text-slate-700 whitespace-nowrap">
                      {member.phone}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/about/management-committee/${member.id}`}
                          aria-label={`View profile of ${member.nameBn}`}
                          className="p-1.5 text-slate-600 hover:text-[#1B2A6B] rounded hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Edit ${member.nameBn}`}
                          onClick={() => openEdit(member)}
                          className="p-1.5 text-slate-600 hover:text-[#1F7A4D] rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${member.nameBn}`}
                          onClick={() => setDeletingId(member.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                        >
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
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'পরিচালনা পর্ষদ সদস্য হালনাগাদ' : 'নতুন পরিচালনা পর্ষদ সদস্য নিবন্ধন'}
        subtitle="পাবলিক পরিচালনা পর্ষদ পাতায় প্রদর্শিত তথ্যসমূহ পূরণ করুন"
      >
        <form onSubmit={handleSave} className="space-y-3.5 font-bn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="mc-name-bn" className="block text-xs font-medium text-slate-700 mb-1">নাম (বাংলায়) *</label>
              <input id="mc-name-bn" required value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} placeholder="যেমন: মোঃ হাবিবুর রহমান" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="mc-name-en" className="block text-xs font-medium text-slate-700 mb-1">Full Name (English)</label>
              <input id="mc-name-en" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Md. Habibur Rahman" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg font-sans" />
            </div>
            <div>
              <label htmlFor="mc-role-bn" className="block text-xs font-medium text-slate-700 mb-1">পর্ষদ পদবি (বাংলায়) *</label>
              <input id="mc-role-bn" required value={form.roleBn} onChange={(e) => setForm({ ...form, roleBn: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="mc-cat" className="block text-xs font-medium text-slate-700 mb-1">বিভাগ (Category)</label>
              <select id="mc-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CommitteeCategory })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {COMMITTEE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mc-prof" className="block text-xs font-medium text-slate-700 mb-1">পেশাগত পরিচয়</label>
              <input id="mc-prof" value={form.professionBn} onChange={(e) => setForm({ ...form, professionBn: e.target.value })} placeholder="সমাজসেবক / ব্যবসায়ী" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="mc-edu" className="block text-xs font-medium text-slate-700 mb-1">শিক্ষাগত যোগ্যতা</label>
              <input id="mc-edu" value={form.educationBn} onChange={(e) => setForm({ ...form, educationBn: e.target.value })} placeholder="স্নাতক / স্নাতকোত্তর" className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="mc-phone" className="block text-xs font-medium text-slate-700 mb-1">মোবাইল নম্বর</label>
              <input id="mc-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
            </div>
            <div>
              <label htmlFor="mc-tenure" className="block text-xs font-medium text-slate-700 mb-1">কার্যকাল</label>
              <input id="mc-tenure" value={form.tenure} onChange={(e) => setForm({ ...form, tenure: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label htmlFor="mc-order" className="block text-xs font-medium text-slate-700 mb-1">প্রদর্শন ক্রম</label>
              <input id="mc-order" type="number" min={1} value={form.priorityOrder} onChange={(e) => setForm({ ...form, priorityOrder: Number(e.target.value) })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums font-sans" />
            </div>
            <div>
              <label htmlFor="mc-photo" className="block text-xs font-medium text-slate-700 mb-1">পাবলিক প্রোফাইল ছবি</label>
              <select id="mc-photo" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {COMMITTEE_PORTRAIT_PRESETS.map((p) => (
                  <option key={p.url} value={p.url}>{p.labelBn}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="mc-bio" className="block text-xs font-medium text-slate-700 mb-1">সংক্ষিপ্ত পরিচিতি</label>
            <textarea id="mc-bio" rows={2} value={form.bioBn} onChange={(e) => setForm({ ...form, bioBn: e.target.value })} placeholder="সদস্যের অবদান ও পরিচিতি..." className="w-full p-2.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg cursor-pointer">বাতিল</button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">সংরক্ষণ করুন</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingId)}
        title="পরিচালনা পর্ষদ সদস্য অপসারণ করবেন?"
        message="নিশ্চিত করলে নির্বাচিত সদস্য পর্ষদ তালিকা ও পাবলিক পেজ থেকে অপসারিত হবেন।"
        confirmLabel="অপসারণ করুন"
        destructive
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteCommitteeMember(deletingId, user?.nameBn || 'Admin');
          setDeletingId(null);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. ADMIN ACADEMICS HUB (4-Tab: Routine · Syllabus · Calendar · Library)
// ---------------------------------------------------------------------------

export function AdminAcademicsHubPage({
  defaultTab = 'routine',
}: {
  defaultTab?: 'routine' | 'syllabus' | 'calendar' | 'library';
}) {
  const {
    db,
    addRoutineEntry,
    deleteRoutineEntry,
    addCalendarEvent,
    deleteCalendarEvent,
    addLibraryBook,
    toggleLibraryBookAvailability,
    deleteLibraryBook,
  } = useSchoolStore();
  const { user } = useAuth();
  const [tab, setTab] = useState<'routine' | 'syllabus' | 'calendar' | 'library'>(defaultTab);
  useEffect(() => setTab(defaultTab), [defaultTab]);

  // Routine Form
  const [rtForm, setRtForm] = useState({
    className: 'Class 10',
    section: SECTION_LIST[0],
    day: 'Sunday' as 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday',
    period: '1st Period',
    time: '10:00 – 10:45',
    subject: 'উচ্চতর গণিত (Higher Math)',
    teacherName: db.teachers[0]?.nameBn || 'মোঃ আব্দুর রাজ্জাক',
    room: 'Room 201',
  });

  // Calendar Form
  const [calForm, setCalForm] = useState({
    date: '2026-12-16',
    title: 'Victory Day Celebration',
    titleBn: 'মহান বিজয় দিবস উদযাপন',
    category: 'Activity' as 'Exam' | 'Holiday' | 'Academic' | 'Activity',
    description: 'আলোচনা সভা, কুচকাওয়াজ ও সাংস্কৃতিক অনুষ্ঠান।',
  });

  // Library Form
  const [bookForm, setBookForm] = useState({
    titleBn: '',
    titleEn: '',
    authorBn: '',
    category: 'বিজ্ঞান ও গণিত' as Exclude<LibraryCategory, 'সকল বই'>,
    shelfNo: 'শেলফ-বি২',
    callNo: 'BUTPHS-SCI-099',
    recommendedFor: '৯ম–১০ম শ্রেণি',
    totalCopies: 5,
    summaryBn: '',
  });

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtForm.subject.trim()) return;
    addRoutineEntry(rtForm, user?.nameBn || 'Admin');
  };

  const handleAddCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calForm.titleBn.trim()) return;
    addCalendarEvent(
      {
        ...calForm,
        title: calForm.title.trim() || calForm.titleBn.trim(),
      },
      user?.nameBn || 'Admin'
    );
    setCalForm({ ...calForm, title: '', titleBn: '', description: '' });
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.titleBn.trim() || !bookForm.authorBn.trim()) return;
    addLibraryBook(
      {
        titleBn: bookForm.titleBn.trim(),
        titleEn: bookForm.titleEn.trim() || bookForm.titleBn.trim(),
        authorBn: bookForm.authorBn.trim(),
        category: bookForm.category,
        shelfNo: bookForm.shelfNo.trim() || 'শেলফ-এ১',
        callNo: bookForm.callNo.trim() || `BUTPHS-${Date.now().toString().slice(-3)}`,
        recommendedFor: bookForm.recommendedFor.trim() || '৬ষ্ঠ–১০ম শ্রেণি',
        totalCopies: Math.max(1, Number(bookForm.totalCopies) || 1),
        availableCopies: Math.max(1, Number(bookForm.totalCopies) || 1),
        publishedYear: '২০২৫',
        summaryBn: bookForm.summaryBn.trim() || 'শিক্ষার্থীদের একাডেমিক ও সহশিক্ষা পাঠাভ্যাসের জন্য সংগৃহীত গ্রন্থ।',
      },
      user?.nameBn || 'Admin'
    );
    setBookForm({ ...bookForm, titleBn: '', titleEn: '', authorBn: '', summaryBn: '' });
  };

  return (
    <div className="space-y-6 font-bn">
      {/* 4-Tab Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-1.5">
        {(
          [
            { key: 'routine', label: 'ক্লাস রুটিন', icon: Clock, count: db.routines.length },
            { key: 'syllabus', label: 'পাঠ্যসূচি ও সিলেবাস', icon: BookOpen, count: db.syllabus.length },
            { key: 'calendar', label: 'একাডেমিক ক্যালেন্ডার', icon: Calendar, count: db.calendar.length },
            { key: 'library', label: 'গ্রন্থাগার (বই তালিকা)', icon: Library, count: db.libraryBooks.length },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                active ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              <span className={`text-[11px] tabular-nums ${active ? 'text-[#E8CF8E]' : 'text-slate-400'}`}>
                ({toBanglaDigits(item.count)})
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLASS ROUTINE */}
      {tab === 'routine' && (
        <div className="space-y-5">
          <form onSubmit={handleAddRoutine} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#1B2A6B]">নতুন ক্লাস রুটিন পিরিয়ড যুক্ত করুন</h2>
              <Link to="/academics/class-routine" className="text-xs font-medium text-[#1F7A4D] hover:underline">
                পাবলিক রুটিন দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select aria-label="Routine class" value={rtForm.className} onChange={(e) => setRtForm({ ...rtForm, className: e.target.value })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {CLASS_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select aria-label="Routine section" value={rtForm.section} onChange={(e) => setRtForm({ ...rtForm, section: e.target.value })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {SECTION_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select aria-label="Routine day" value={rtForm.day} onChange={(e) => setRtForm({ ...rtForm, day: e.target.value as typeof rtForm.day })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] as const).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input aria-label="Routine time" value={rtForm.time} onChange={(e) => setRtForm({ ...rtForm, time: e.target.value })} placeholder="10:00 – 10:45" className="h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
              <input aria-label="Routine subject" value={rtForm.subject} onChange={(e) => setRtForm({ ...rtForm, subject: e.target.value })} placeholder="বিষয়ের নাম *" className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              <input aria-label="Routine teacher" value={rtForm.teacherName} onChange={(e) => setRtForm({ ...rtForm, teacherName: e.target.value })} placeholder="শিক্ষকের নাম" className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              <input aria-label="Routine room" value={rtForm.room} onChange={(e) => setRtForm({ ...rtForm, room: e.target.value })} placeholder="কক্ষ নম্বর" className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              <button type="submit" className="h-9 px-4 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">
                পিরিয়ড যুক্ত করুন
              </button>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
                  <tr>
                    <th className="py-3 px-4 font-medium">শ্রেণি ও শাখা</th>
                    <th className="py-3 px-4 font-medium">বার ও সময়</th>
                    <th className="py-3 px-4 font-medium">বিষয়</th>
                    <th className="py-3 px-4 font-medium">শিক্ষক ও কক্ষ</th>
                    <th className="py-3 px-4 font-medium text-right">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.routines.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 px-4 text-xs font-medium text-[#1B2A6B]">{r.className} · {r.section}</td>
                      <td className="py-3 px-4 text-xs tabular-nums">{r.day} · {r.time}</td>
                      <td className="py-3 px-4 font-medium">{r.subject}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{r.teacherName} · {r.room}</td>
                      <td className="py-3 px-4 text-right">
                        <button type="button" aria-label={`Delete routine ${r.subject}`} onClick={() => deleteRoutineEntry(r.id, user?.nameBn || 'Admin')} className="p-1.5 text-slate-500 hover:text-red-600 cursor-pointer">
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
      )}

      {/* TAB 2: SYLLABUS */}
      {tab === 'syllabus' && <AdminSyllabusPage />}

      {/* TAB 3: ACADEMIC CALENDAR */}
      {tab === 'calendar' && (
        <div className="space-y-5">
          <form onSubmit={handleAddCalendar} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#1B2A6B]">একাডেমিক ক্যালেন্ডারে নতুন ইভেন্ট যুক্ত করুন</h2>
              <Link to="/academics/calendar" className="text-xs font-medium text-[#1F7A4D] hover:underline">
                পাবলিক ক্যালেন্ডার →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input aria-label="Event date" type="date" value={calForm.date} onChange={(e) => setCalForm({ ...calForm, date: e.target.value })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg tabular-nums" />
              <input aria-label="Event Bangla title" required placeholder="শিরোনাম (বাংলা) *" value={calForm.titleBn} onChange={(e) => setCalForm({ ...calForm, titleBn: e.target.value })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              <select aria-label="Event category" value={calForm.category} onChange={(e) => setCalForm({ ...calForm, category: e.target.value as typeof calForm.category })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Holiday">Holiday</option>
                <option value="Activity">Activity</option>
              </select>
              <button type="submit" className="h-9 px-4 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">
                ক্যালেন্ডারে যুক্ত করুন
              </button>
            </div>
            <input aria-label="Event description" placeholder="সংক্ষিপ্ত বিবরণ" value={calForm.description} onChange={(e) => setCalForm({ ...calForm, description: e.target.value })} className="w-full h-9 px-3 text-sm border border-slate-300 rounded-lg" />
          </form>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {db.calendar.map((ev) => (
              <div key={ev.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#1F7A4D] tabular-nums">{ev.date} · {ev.category}</p>
                  <h3 className="text-sm font-bold text-[#1B2A6B] mt-0.5">{ev.titleBn}</h3>
                  <p className="text-xs text-slate-600">{ev.description}</p>
                </div>
                <button type="button" aria-label={`Delete ${ev.titleBn}`} onClick={() => deleteCalendarEvent(ev.id, user?.nameBn || 'Admin')} className="p-1.5 text-slate-500 hover:text-red-600 cursor-pointer shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIBRARY BOOKS */}
      {tab === 'library' && (
        <div className="space-y-5">
          <form onSubmit={handleAddBook} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#1B2A6B]">গ্রন্থাগারে নতুন বই নিবন্ধন</h2>
              <Link to="/academics/library" className="text-xs font-medium text-[#1F7A4D] hover:underline">
                পাবলিক লাইব্রেরি ক্যাটালগ →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input aria-label="Book title Bangla" required placeholder="বইয়ের নাম (বাংলা) *" value={bookForm.titleBn} onChange={(e) => setBookForm({ ...bookForm, titleBn: e.target.value })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              <input aria-label="Book author" required placeholder="লেখকের নাম *" value={bookForm.authorBn} onChange={(e) => setBookForm({ ...bookForm, authorBn: e.target.value })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              <select aria-label="Book category" value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value as typeof bookForm.category })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg bg-white">
                {LIBRARY_CATEGORIES.filter((c) => c !== 'সকল বই').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input aria-label="Book shelf" placeholder="শেলফ নং" value={bookForm.shelfNo} onChange={(e) => setBookForm({ ...bookForm, shelfNo: e.target.value })} className="h-9 px-3 text-sm border border-slate-300 rounded-lg" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input aria-label="Book summary" placeholder="বইয়ের সংক্ষিপ্ত পরিচিতি" value={bookForm.summaryBn} onChange={(e) => setBookForm({ ...bookForm, summaryBn: e.target.value })} className="flex-1 min-w-[240px] h-9 px-3 text-sm border border-slate-300 rounded-lg" />
              <button type="submit" className="h-9 px-4 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer">
                বই সংরক্ষণ করুন
              </button>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
                  <tr>
                    <th className="py-3 px-4 font-medium">বই ও লেখক</th>
                    <th className="py-3 px-4 font-medium">বিভাগ ও শেলফ</th>
                    <th className="py-3 px-4 font-medium">সংগ্রহে কপি</th>
                    <th className="py-3 px-4 font-medium text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.libraryBooks.map((book) => (
                    <tr key={book.id}>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#1B2A6B]">{book.titleBn}</p>
                        <p className="text-xs text-slate-500">{book.authorBn} · {book.callNo}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{book.category} · {book.shelfNo}</td>
                      <td className="py-3 px-4 text-xs tabular-nums font-semibold">
                        <span className={book.availableCopies > 0 ? 'text-[#1F7A4D]' : 'text-amber-700'}>
                          {toBanglaDigits(book.availableCopies)} / {toBanglaDigits(book.totalCopies)} কপি
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleLibraryBookAvailability(book.id, user?.nameBn || 'Admin')}
                            className="px-2.5 py-1 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded hover:border-[#1B2A6B] cursor-pointer"
                          >
                            {book.availableCopies > 0 ? 'ইস্যু মার্ক' : 'ফেরত নিন'}
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${book.titleBn}`}
                            onClick={() => deleteLibraryBook(book.id, user?.nameBn || 'Admin')}
                            className="p-1.5 text-slate-500 hover:text-red-600 cursor-pointer"
                          >
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
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. ADMIN ADMISSIONS & CONTACT INQUIRIES HUB (2-Tab)
// ---------------------------------------------------------------------------

export function AdminAdmissionsAndInquiriesPage({
  defaultTab = 'admissions',
}: {
  defaultTab?: 'admissions' | 'inquiries';
}) {
  const {
    db,
    updateAdmissionStatus,
    enrollApprovedAdmission,
    updateInquiryStatus,
    deleteInquiry,
  } = useSchoolStore();
  const { user } = useAuth();
  const [tab, setTab] = useState<'admissions' | 'inquiries'>(defaultTab);
  useEffect(() => setTab(defaultTab), [defaultTab]);
  const [inspectApp, setInspectApp] = useState<AdmissionApplication | null>(null);
  const [inqFilter, setInqFilter] = useState<'All' | ContactInquiry['status']>('All');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const unreadInquiries = db.inquiries.filter((i) => i.status === 'New').length;
  const pendingAdmissions = db.admissions.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length;
  const visibleInquiries = filterInquiries(db.inquiries, inqFilter, '');

  return (
    <div className="space-y-6 font-bn">
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTab('admissions')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === 'admissions' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>অনলাইন ভর্তি আবেদন</span>
          <span className={`text-[11px] tabular-nums ${tab === 'admissions' ? 'text-[#E8CF8E]' : 'text-slate-400'}`}>
            ({toBanglaDigits(pendingAdmissions)} অপেক্ষমাণ)
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab('inquiries')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === 'inquiries' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>অভিভাবক ও যোগাযোগ ইনবক্স</span>
          <span className={`text-[11px] tabular-nums ${tab === 'inquiries' ? 'text-[#E8CF8E]' : 'text-slate-400'}`}>
            ({toBanglaDigits(unreadInquiries)} নতুন)
          </span>
        </button>
      </div>

      {/* TAB 1: ADMISSIONS QUEUE + 1-CLICK ENROLL */}
      {tab === 'admissions' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#1B2A6B]">অনলাইন ভর্তি আবেদন ব্যবস্থাপনা</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                অনুমোদিত আবেদনকারীকে এক ক্লিকে সরাসরি বিদ্যালয়ের শিক্ষার্থী তালিকায় ভর্তি সম্পন্ন করুন।
              </p>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">মোট আবেদন: {toBanglaDigits(db.admissions.length)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
                <tr>
                  <th className="py-3 px-4 font-medium">আবেদন নং</th>
                  <th className="py-3 px-4 font-medium">আবেদনকারী</th>
                  <th className="py-3 px-4 font-medium">শ্রেণি ও ধারা</th>
                  <th className="py-3 px-4 font-medium">অভিভাবক ও মোবাইল</th>
                  <th className="py-3 px-4 font-medium">অবস্থা</th>
                  <th className="py-3 px-4 font-medium text-right">ব্যবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.admissions.map((a) => {
                  const alreadyEnrolled = db.students.some(
                    (s) => s.nameBn === a.applicantNameBn && s.guardianPhone === a.guardianPhone
                  );
                  return (
                    <tr key={a.id}>
                      <td className="py-3 px-4 tabular-nums text-xs font-medium text-[#1B2A6B]">{a.applicationNo}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#1B2A6B]">{a.applicantNameBn}</p>
                        <p className="text-xs text-slate-500 font-sans">{a.applicantName}</p>
                      </td>
                      <td className="py-3 px-4 text-xs">{a.applyingClass} · {a.program}</td>
                      <td className="py-3 px-4 text-xs">
                        <p>{a.guardianName}</p>
                        <p className="text-[#1F7A4D] tabular-nums">{a.guardianPhone}</p>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        <span className={a.status === 'Approved' ? 'text-[#1F7A4D]' : a.status === 'Rejected' ? 'text-red-700' : 'text-amber-700'}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectApp(a)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1B2A6B] bg-[#F7F8FC] border border-slate-200 rounded hover:border-[#1B2A6B] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>বিস্তারিত</span>
                          </button>
                          {a.status !== 'Approved' && (
                            <button
                              type="button"
                              onClick={() => updateAdmissionStatus(a.id, 'Approved', 'যাচাই শেষে অনুমোদিত', user?.nameBn || 'Admin')}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-[#1F7A4D] rounded cursor-pointer"
                            >
                              অনুমোদন
                            </button>
                          )}
                          {a.status === 'Approved' && !alreadyEnrolled && (
                            <button
                              type="button"
                              onClick={() => enrollApprovedAdmission(a.id, user?.nameBn || 'Admin')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#132056] rounded cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>ভর্তি সম্পন্ন</span>
                            </button>
                          )}
                          {alreadyEnrolled && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F7A4D]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ভর্তিকৃত
                            </span>
                          )}
                          {a.status !== 'Rejected' && !alreadyEnrolled && (
                            <button
                              type="button"
                              onClick={() => updateAdmissionStatus(a.id, 'Rejected', 'কাগজপত্র অসম্পূর্ণ', user?.nameBn || 'Admin')}
                              className="px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200 rounded hover:bg-red-50 cursor-pointer"
                            >
                              বাতিল
                            </button>
                          )}
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

      {/* TAB 2: CONTACT & GUARDIAN INQUIRIES INBOX */}
      {tab === 'inquiries' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { key: 'All', label: 'সকল বার্তা' },
                  { key: 'New', label: 'নতুন' },
                  { key: 'Replied', label: 'উত্তর প্রদত্ত' },
                  { key: 'Resolved', label: 'নিষ্পন্ন' },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setInqFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                    inqFilter === f.key ? 'bg-[#1F7A4D] text-white' : 'bg-[#F7F8FC] text-slate-700 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              প্রদর্শিত: {toBanglaDigits(visibleInquiries.length)} টি বার্তা
            </span>
          </div>

          {visibleInquiries.length === 0 ? (
            <EmptyState title="কোনো জিজ্ঞাসা পাওয়া যায়নি" description="ওয়েবসাইট যোগাযোগ পেজ বা অভিভাবক পোর্টাল থেকে পাঠানো বার্তা এখানে জমা হবে।" />
          ) : (
            <div className="space-y-4">
              {visibleInquiries.map((inq) => (
                <article key={inq.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 tabular-nums">
                        <span className="font-semibold text-[#1F7A4D]">{inq.source}</span> · {inq.senderName} ({inq.phone}) · {inq.createdAt}
                      </p>
                      <h3 className="text-base font-bold text-[#1B2A6B] mt-0.5">{inq.subject}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          inq.status === 'New' ? 'text-amber-700' : inq.status === 'Replied' ? 'text-[#1B2A6B]' : 'text-[#1F7A4D]'
                        }`}
                      >
                        অবস্থা: {inq.status === 'New' ? 'নতুন' : inq.status === 'Replied' ? 'উত্তর প্রদত্ত' : 'নিষ্পন্ন'}
                      </span>
                      <button
                        type="button"
                        aria-label={`Delete inquiry ${inq.subject}`}
                        onClick={() => deleteInquiry(inq.id, user?.nameBn || 'Admin')}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">{inq.message}</p>

                  {inq.replyNote && (
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950">
                      <span className="font-semibold text-[#1F7A4D]">অফিস উত্তর ({inq.repliedBy || 'অফিস ডেস্ক'}): </span>
                      {inq.replyNote}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <input
                      aria-label={`Reply to ${inq.senderName}`}
                      value={replyDrafts[inq.id] ?? ''}
                      onChange={(e) => setReplyDrafts({ ...replyDrafts, [inq.id]: e.target.value })}
                      placeholder="অফিসিয়াল উত্তর লিখুন..."
                      className="flex-1 h-9 px-3 text-xs sm:text-sm border border-slate-300 rounded-lg"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const txt = (replyDrafts[inq.id] || '').trim() || 'আপনার বার্তা গৃহীত হয়েছে। অফিস চলাকালীন সময়ে যোগাযোগ করা হবে।';
                          updateInquiryStatus(inq.id, 'Replied', txt, user?.nameBn || 'অফিস ডেস্ক');
                          setReplyDrafts({ ...replyDrafts, [inq.id]: '' });
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#132056] rounded-lg cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>উত্তর পাঠান</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateInquiryStatus(
                            inq.id,
                            'Resolved',
                            (replyDrafts[inq.id] || '').trim() || inq.replyNote || 'বিষয়টি সমাধান করা হয়েছে।',
                            user?.nameBn || 'অফিস ডেস্ক'
                          )
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-[#1F7A4D] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg cursor-pointer"
                      >
                        নিষ্পন্ন করুন
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={Boolean(inspectApp)}
        onClose={() => setInspectApp(null)}
        title={inspectApp ? `ভর্তি আবেদন বিবরণী · ${inspectApp.applicationNo}` : ''}
        subtitle={inspectApp ? `${inspectApp.applicantNameBn} (${inspectApp.applicantName})` : ''}
      >
        {inspectApp && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F7F8FC] border border-slate-200 rounded-xl p-4 text-xs">
            <div><dt className="text-slate-500">জন্ম তারিখ</dt><dd className="font-medium text-slate-800 tabular-nums">{inspectApp.dateOfBirth}</dd></div>
            <div><dt className="text-slate-500">জন্ম সনদ নং</dt><dd className="font-semibold text-[#1B2A6B] tabular-nums">{inspectApp.birthCertificateNo || '—'}</dd></div>
            <div><dt className="text-slate-500">পিতা ও মাতা</dt><dd className="font-medium text-slate-800">{inspectApp.fatherNameBn || inspectApp.guardianName} / {inspectApp.motherNameBn || '—'}</dd></div>
            <div><dt className="text-slate-500">অভিভাবক মোবাইল</dt><dd className="font-semibold text-[#1F7A4D] tabular-nums">{inspectApp.guardianPhone}</dd></div>
            <div className="sm:col-span-2"><dt className="text-slate-500">বর্তমান ঠিকানা</dt><dd className="font-medium text-slate-800">{inspectApp.address}</dd></div>
          </dl>
        )}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. ADMIN FEES & A4 PRINT HUB (2-Tab)
// ---------------------------------------------------------------------------

export function AdminFeesAndPrintPage({
  defaultTab = 'print',
}: {
  defaultTab?: 'print' | 'fees';
}) {
  const { db, simulateFeePayment } = useSchoolStore();
  const { user } = useAuth();
  const [tab, setTab] = useState<'print' | 'fees'>(defaultTab);
  useEffect(() => setTab(defaultTab), [defaultTab]);

  const totalCollected = db.fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalDue = db.fees.reduce((sum, f) => sum + f.dueAmount, 0);

  return (
    <div className="space-y-6 font-bn">
      <div className="no-print bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTab('print')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === 'print' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>অফিসিয়াল A4 ডকুমেন্ট প্রিন্ট</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('fees')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === 'fees' ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>শিক্ষার্থী বেতন ও ফি খাতা</span>
        </button>
      </div>

      {tab === 'print' ? (
        <AdminPrintDocumentsPage />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">মোট চালান সংখ্যা</p>
              <p className="text-2xl font-bold text-[#1B2A6B] tabular-nums mt-1">{toBanglaDigits(db.fees.length)} টি</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">মোট আদায়কৃত বেতন ও ফি</p>
              <p className="text-2xl font-bold text-[#1F7A4D] tabular-nums mt-1">{formatCurrencyBdt(totalCollected)}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs text-slate-500">মোট বকেয়া</p>
              <p className="text-2xl font-bold text-amber-700 tabular-nums mt-1">{formatCurrencyBdt(totalDue)}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1B2A6B]">বেতন ও পরীক্ষার ফি চালান তালিকা</h2>
              <Link to="/others/fees" className="text-xs font-medium text-[#1F7A4D] hover:underline">
                পাবলিক ফি কাঠামো →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F7F8FC] border-b border-slate-200 text-xs text-[#1B2A6B]">
                  <tr>
                    <th className="py-3 px-4 font-medium">চালান নং</th>
                    <th className="py-3 px-4 font-medium">শিক্ষার্থী</th>
                    <th className="py-3 px-4 font-medium">মাস / পর্ব</th>
                    <th className="py-3 px-4 font-medium text-right">পরিশোধিত</th>
                    <th className="py-3 px-4 font-medium text-right">বকেয়া</th>
                    <th className="py-3 px-4 font-medium text-right">কাউন্টার অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.fees.map((f) => {
                    const stu = db.students.find((s) => s.studentId === f.studentId);
                    return (
                      <tr key={f.id}>
                        <td className="py-3 px-4 text-xs tabular-nums font-medium text-[#1B2A6B]">{f.invoiceNo}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-900">{stu?.nameBn || f.studentId}</p>
                          <p className="text-xs text-slate-500 tabular-nums">{f.studentId} · {stu?.className}</p>
                        </td>
                        <td className="py-3 px-4 text-xs">{f.monthOrTerm}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-xs font-semibold text-[#1F7A4D]">{formatCurrencyBdt(f.paidAmount)}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-xs font-semibold text-amber-700">{formatCurrencyBdt(f.dueAmount)}</td>
                        <td className="py-3 px-4 text-right">
                          {f.dueAmount > 0 ? (
                            <button
                              type="button"
                              onClick={() => simulateFeePayment(f.id, user?.nameBn || 'হিসাব শাখা')}
                              className="px-3 py-1 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded cursor-pointer"
                            >
                              জমা গ্রহণ করুন
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-[#1F7A4D]">পরিশোধিত</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
