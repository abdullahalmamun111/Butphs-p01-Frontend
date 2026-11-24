import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
  Scissors,
  Send,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SCHOOL_INFO } from '../../config/school';
import { useSchoolStore } from '../../store/SchoolStore';
import { formatCurrencyBdt } from '../../utils/grading';
import { validateAndBuildInquiry } from '../../utils/portalHelpers';
import { downloadElementAsPrintableHtml, printElementById } from '../../utils/printDocument';
import type { AdmissionApplication } from '../../types';

// ---------------------------------------------------------------------------
// 1. ONLINE ADMISSION APPLICATION (Wide, Clean, Non-Intrusive Validation)
// ---------------------------------------------------------------------------

interface AdmissionFormState {
  applicantNameBn: string;
  applicantName: string;
  dateOfBirth: string;
  birthCertificateNo: string;
  gender: 'Male' | 'Female';
  religion: string;
  fatherNameBn: string;
  fatherNameEn: string;
  fatherOccupation: string;
  fatherNid: string;
  motherNameBn: string;
  motherNameEn: string;
  motherOccupation: string;
  motherNid: string;
  guardianPhone: string;
  address: string;
  permanentAddress: string;
  previousSchool: string;
  previousClassGrade: string;
  passingYear: string;
  previousRollGpa: string;
  applyingClass: string;
  program: 'General';
  sscGroup: 'বিজ্ঞান' | 'মানবিক' | 'ব্যবসায় শিক্ষা';
  fourthSubject: string;
  admissionType: 'নতুন ভর্তি' | 'পুনঃ ভর্তি';
  undertakingAccepted: boolean;
}

const INITIAL_ADMISSION_STATE: AdmissionFormState = {
  applicantNameBn: '',
  applicantName: '',
  dateOfBirth: '',
  birthCertificateNo: '',
  gender: 'Male',
  religion: 'ইসলাম',
  fatherNameBn: '',
  fatherNameEn: '',
  fatherOccupation: '',
  fatherNid: '',
  motherNameBn: '',
  motherNameEn: '',
  motherOccupation: '',
  motherNid: '',
  guardianPhone: '',
  address: '',
  permanentAddress: '',
  previousSchool: '',
  previousClassGrade: '',
  passingYear: '2026',
  previousRollGpa: '',
  applyingClass: 'Class 6',
  program: 'General',
  sscGroup: 'বিজ্ঞান',
  fourthSubject: 'কৃষি শিক্ষা',
  admissionType: 'নতুন ভর্তি',
  undertakingAccepted: false,
};

const ADMISSION_STEPS = [
  { id: 1, titleBn: 'শিক্ষার্থী ও জন্ম তথ্য', titleEn: 'Student & Birth Info', icon: UserCheck },
  { id: 2, titleBn: 'পিতা-মাতা ও ঠিকানা', titleEn: 'Parents & Address', icon: Users },
  { id: 3, titleBn: 'পূর্ববর্তী ও ভর্তিচ্ছু শ্রেণি', titleEn: 'Academic & Class', icon: GraduationCap },
  { id: 4, titleBn: 'যাচাই ও অঙ্গীকারনামা', titleEn: 'Review & Submit', icon: ShieldCheck },
] as const;

export function OnlineAdmissionPage() {
  const { submitAdmission, addToast } = useSchoolStore();
  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState<AdmissionFormState>(INITIAL_ADMISSION_STATE);
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState<AdmissionApplication | null>(null);

  const updateField = <K extends keyof AdmissionFormState>(key: K, value: AdmissionFormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'address' && sameAsPresent) {
        next.permanentAddress = String(value);
      }
      return next;
    });
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setSameAsPresent(checked);
    if (checked) {
      setForm((prev) => ({ ...prev, permanentAddress: prev.address }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!form.applicantNameBn.trim() && !form.applicantName.trim()) {
      setStep(1);
      addToast('error', 'আবেদন জমা দিতে শিক্ষার্থীর নাম লিখুন।');
      return;
    }
    if (!form.guardianPhone.trim()) {
      setStep(2);
      addToast('error', 'যোগাযোগের জন্য অভিভাবকের মোবাইল নম্বর দিন।');
      return;
    }
    if (!form.undertakingAccepted) {
      setStep(4);
      addToast('error', 'অনুগ্রহ করে অঙ্গীকারনামায় সম্মতি (টিক চিহ্ন) প্রদান করুন।');
      return;
    }

    const record = submitAdmission({
      applicantName: form.applicantName.trim() || form.applicantNameBn.trim(),
      applicantNameBn: form.applicantNameBn.trim() || form.applicantName.trim(),
      dateOfBirth: form.dateOfBirth || '2014-01-15',
      birthCertificateNo: form.birthCertificateNo.trim() || 'Pending Verification',
      gender: form.gender,
      religion: form.religion,
      fatherNameBn: form.fatherNameBn.trim() || '—',
      fatherNameEn: form.fatherNameEn.trim() || '—',
      fatherOccupation: form.fatherOccupation.trim() || '—',
      fatherNid: form.fatherNid.trim() || '—',
      motherNameBn: form.motherNameBn.trim() || '—',
      motherNameEn: form.motherNameEn.trim() || '—',
      motherOccupation: form.motherOccupation.trim() || '—',
      motherNid: form.motherNid.trim() || '—',
      guardianName: form.fatherNameBn.trim() || form.motherNameBn.trim() || 'অভিভাবক',
      guardianPhone: form.guardianPhone.trim(),
      address: form.address.trim() || 'উপসী, নড়িয়া, শরীয়তপুর',
      permanentAddress: form.permanentAddress.trim() || form.address.trim() || 'উপসী, নড়িয়া, শরীয়তপুর',
      previousSchool: form.previousSchool.trim() || '—',
      previousClassGrade: form.previousClassGrade.trim() || '—',
      passingYear: form.passingYear.trim() || '2026',
      previousRollGpa: form.previousRollGpa.trim() || '—',
      applyingClass: form.applyingClass,
      program: form.program,
      admissionType: form.admissionType === 'পুনঃ ভর্তি' ? 'বদলি ভর্তি' : 'নতুন ভর্তি',
    });
    setSubmitted(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputClass =
    'w-full h-11 px-3.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F7A4D]/20 focus:border-[#1F7A4D] transition-colors font-bn';

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="শিক্ষাবর্ষ ২০২৭ · অনলাইন ভর্তি পোর্টাল"
        title="অনলাইন ভর্তি আবেদন ফরম"
        titleBn="Online Admission Application — Session 2027"
        description="৪টি সহজ ধাপে শিক্ষার্থীর ব্যক্তিগত, পারিবারিক ও একাডেমিক তথ্য পূরণ করে অনলাইন ভর্তি আবেদন সম্পন্ন করুন।"
        actions={
          <Link
            to="/others/admission-form"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-[#1B2A6B] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors font-bn"
          >
            <Printer className="w-4 h-4 text-[#1F7A4D]" />
            <span>অফিসিয়াল প্রিন্ট ফরম দেখুন</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {submitted ? (
          <div className="space-y-5">
            <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#1F7A4D] shrink-0" />
                <div className="font-bn">
                  <p className="text-sm font-semibold text-[#1B2A6B]">
                    ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে! আবেদন নম্বর: <span className="tabular-nums text-[#1F7A4D]">{submitted.applicationNo}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    নিচের প্রাপ্তি স্বীকারপত্রটি প্রিন্ট করে সংরক্ষণ করুন এবং যাচাইয়ের সময় বিদ্যালয় অফিসে উপস্থাপন করুন।
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    printElementById(
                      'online-admission-confirmation-slip',
                      `ভর্তি আবেদন প্রাপ্তি স্বীকারপত্র — ${submitted.applicationNo}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
                >
                  <Printer className="w-4 h-4" />
                  <span>স্বীকারপত্র প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(null);
                    setForm(INITIAL_ADMISSION_STATE);
                    setSameAsPresent(false);
                    setSubmitAttempted(false);
                    setStep(1);
                  }}
                  className="px-4 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer font-bn"
                >
                  নতুন আবেদন করুন
                </button>
              </div>
            </div>

            <article
              id="online-admission-confirmation-slip"
              className="bg-white border border-slate-300 rounded-xl p-6 sm:p-10 shadow-sm space-y-6 font-bn"
            >
              <header className="flex flex-col sm:flex-row items-center gap-4 pb-5 border-b-2 border-[#1B2A6B]">
                <img
                  src={SCHOOL_INFO.assets.logo}
                  alt={SCHOOL_INFO.nameBn}
                  className="w-16 h-16 object-contain shrink-0"
                />
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl font-bold text-[#1B2A6B]">{SCHOOL_INFO.nameBn}</h2>
                  <p className="text-xs font-semibold text-slate-700 font-sans">{SCHOOL_INFO.nameEn}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {SCHOOL_INFO.addressBn} · EIIN: {SCHOOL_INFO.eiin} · বিদ্যালয় কোড: {SCHOOL_INFO.schoolCode}
                  </p>
                </div>
                <div className="text-center sm:text-right border border-slate-200 rounded-lg px-4 py-2 bg-[#F7F8FC]">
                  <p className="text-[11px] text-slate-500">আবেদন নম্বর (Application ID)</p>
                  <p className="text-base font-bold text-[#1F7A4D] tabular-nums">{submitted.applicationNo}</p>
                </div>
              </header>

              <div className="text-center">
                <h3 className="inline-block px-5 py-1.5 bg-[#1B2A6B] text-white text-sm font-semibold rounded">
                  অনলাইন ভর্তি আবেদন প্রাপ্তি স্বীকারপত্র — ২০২৭
                </h3>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm border border-slate-200 rounded-lg p-5 bg-[#F7F8FC]/60">
                <div>
                  <dt className="text-xs text-slate-500">শিক্ষার্থীর নাম (বাংলায়)</dt>
                  <dd className="font-semibold text-[#1B2A6B] mt-0.5">{submitted.applicantNameBn}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">শিক্ষার্থীর নাম (ইংরেজিতে)</dt>
                  <dd className="font-semibold text-slate-900 font-sans mt-0.5">{submitted.applicantName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">ভর্তিচ্ছু শ্রেণি ও ধারা</dt>
                  <dd className="font-semibold text-[#1F7A4D] mt-0.5">
                    {submitted.applyingClass} (সাধারণ মাধ্যমিক ধারা)
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">জন্ম তারিখ ও সনদ নং</dt>
                  <dd className="text-slate-800 tabular-nums mt-0.5">
                    {submitted.dateOfBirth} · {submitted.birthCertificateNo}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">পিতা ও মাতার নাম</dt>
                  <dd className="text-slate-800 mt-0.5">
                    {submitted.fatherNameBn} / {submitted.motherNameBn}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">অভিভাবকের মোবাইল নম্বর</dt>
                  <dd className="font-semibold text-slate-900 tabular-nums mt-0.5">{submitted.guardianPhone}</dd>
                </div>
              </dl>

              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1">
                <p className="font-semibold text-[#1B2A6B]">পরবর্তী করণীয়:</p>
                <p>১. অফিস চলাকালীন (রবি–বৃহঃ, সকাল ১০:০০ – বিকাল ৫:০০) এই স্বীকারপত্র, জন্ম নিবন্ধনের ফটোকপি, ২ কপি পাসপোর্ট সাইজ ছবি ও পূর্ববর্তী বিদ্যালয়ের প্রত্যয়নপত্রসহ উপস্থিত হয়ে যাচাই সম্পন্ন করুন।</p>
                <p>২. যাচাই শেষে ভর্তি পরীক্ষার প্রবেশপত্র ও রোল নম্বর প্রদান করা হবে।</p>
              </div>
            </article>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Full-Width 4-Step Progress Navigation */}
            <nav
              aria-label="ভর্তি আবেদনের ধাপসমূহ"
              className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {ADMISSION_STEPS.map((s) => {
                  const Icon = s.icon;
                  const isActive = step === s.id;
                  const isDone = step > s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1B2A6B] text-white border-[#1B2A6B] shadow-sm'
                          : isDone
                          ? 'bg-emerald-50/70 text-[#1F7A4D] border-emerald-200 hover:bg-emerald-50'
                          : 'bg-[#F7F8FC] text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : isDone
                            ? 'bg-[#1F7A4D] text-white'
                            : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-[11px] font-medium ${isActive ? 'text-white/75' : 'text-slate-500'}`}>
                          ধাপ ০{s.id} · {s.titleEn}
                        </p>
                        <p className={`text-sm font-semibold truncate font-bn ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {s.titleBn}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Full-Width Clean Form Card */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
            >
              {/* Form Section Header */}
              <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-[#F7F8FC]/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B] font-bn">
                    ধাপ ০{step}: {ADMISSION_STEPS[step - 1].titleBn}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-bn mt-0.5">
                    সকল তথ্য শিক্ষার্থীর জন্ম নিবন্ধন সনদ ও পূর্ববর্তী শিক্ষা সনদ অনুযায়ী নির্ভুলভাবে পূরণ করুন।
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500 tabular-nums font-bn">
                  ধাপ {step} / ৪
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* STEP 1: Student & Birth Information */}
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label htmlFor="adm-name-bn" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        শিক্ষার্থীর নাম (বাংলায়) <span className="text-[#1F7A4D]">*</span>
                      </label>
                      <input
                        id="adm-name-bn"
                        type="text"
                        placeholder="যেমন: রাফিউল ইসলাম"
                        value={form.applicantNameBn}
                        onChange={(e) => updateField('applicantNameBn', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="adm-name-en" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        শিক্ষার্থীর নাম (ইংরেজিতে) <span className="text-[#1F7A4D]">*</span>
                      </label>
                      <input
                        id="adm-name-en"
                        type="text"
                        placeholder="e.g. Rafiul Islam"
                        value={form.applicantName}
                        onChange={(e) => updateField('applicantName', e.target.value)}
                        className={`${inputClass} font-sans`}
                      />
                    </div>

                    <div>
                      <label htmlFor="adm-dob" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        জন্ম তারিখ (Date of Birth)
                      </label>
                      <input
                        id="adm-dob"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => updateField('dateOfBirth', e.target.value)}
                        className={`${inputClass} font-sans tabular-nums`}
                      />
                    </div>

                    <div>
                      <label htmlFor="adm-brc" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        ১৭ ডিজিটের ডিজিটাল জন্ম সনদ নং
                      </label>
                      <input
                        id="adm-brc"
                        type="text"
                        inputMode="numeric"
                        maxLength={17}
                        placeholder="যেমন: 20148614500012345"
                        value={form.birthCertificateNo}
                        onChange={(e) => updateField('birthCertificateNo', e.target.value.replace(/[^\d]/g, ''))}
                        className={`${inputClass} font-sans tabular-nums`}
                      />
                    </div>

                    <div>
                      <label htmlFor="adm-gender" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        লিঙ্গ (Gender)
                      </label>
                      <select
                        id="adm-gender"
                        value={form.gender}
                        onChange={(e) => updateField('gender', e.target.value as 'Male' | 'Female')}
                        className={inputClass}
                      >
                        <option value="Male">ছাত্র (Male)</option>
                        <option value="Female">ছাত্রী (Female)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="adm-religion" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        ধর্ম (Religion)
                      </label>
                      <select
                        id="adm-religion"
                        value={form.religion}
                        onChange={(e) => updateField('religion', e.target.value)}
                        className={inputClass}
                      >
                        <option value="ইসলাম">ইসলাম</option>
                        <option value="হিন্দু">হিন্দু</option>
                        <option value="বৌদ্ধ">বৌদ্ধ</option>
                        <option value="খ্রিস্টান">খ্রিস্টান</option>
                        <option value="অন্যান্য">অন্যান্য</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 2: Parents & Address */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <div>
                        <label htmlFor="adm-father-bn" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          পিতার নাম (বাংলায়)
                        </label>
                        <input
                          id="adm-father-bn"
                          type="text"
                          placeholder="যেমন: মোঃ কামাল উদ্দিন"
                          value={form.fatherNameBn}
                          onChange={(e) => updateField('fatherNameBn', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="adm-father-en" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          পিতার নাম (ইংরেজিতে)
                        </label>
                        <input
                          id="adm-father-en"
                          type="text"
                          placeholder="Md. Kamal Uddin"
                          value={form.fatherNameEn}
                          onChange={(e) => updateField('fatherNameEn', e.target.value)}
                          className={`${inputClass} font-sans`}
                        />
                      </div>
                      <div>
                        <label htmlFor="adm-father-occ" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          পিতার পেশা
                        </label>
                        <input
                          id="adm-father-occ"
                          type="text"
                          placeholder="ব্যবসা / চাকরি / কৃষি"
                          value={form.fatherOccupation}
                          onChange={(e) => updateField('fatherOccupation', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="adm-father-nid" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          পিতার এনআইডি (NID) নং
                        </label>
                        <input
                          id="adm-father-nid"
                          type="text"
                          inputMode="numeric"
                          placeholder="১০ বা ১৭ ডিজিট"
                          value={form.fatherNid}
                          onChange={(e) => updateField('fatherNid', e.target.value.replace(/[^\d]/g, ''))}
                          className={`${inputClass} font-sans tabular-nums`}
                        />
                      </div>

                      <div>
                        <label htmlFor="adm-mother-bn" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          মাতার নাম (বাংলায়)
                        </label>
                        <input
                          id="adm-mother-bn"
                          type="text"
                          placeholder="যেমন: সালমা বেগম"
                          value={form.motherNameBn}
                          onChange={(e) => updateField('motherNameBn', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="adm-mother-en" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          মাতার নাম (ইংরেজিতে)
                        </label>
                        <input
                          id="adm-mother-en"
                          type="text"
                          placeholder="Salma Begum"
                          value={form.motherNameEn}
                          onChange={(e) => updateField('motherNameEn', e.target.value)}
                          className={`${inputClass} font-sans`}
                        />
                      </div>
                      <div>
                        <label htmlFor="adm-mother-occ" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          মাতার পেশা
                        </label>
                        <input
                          id="adm-mother-occ"
                          type="text"
                          placeholder="গৃহিণী / শিক্ষিকা"
                          value={form.motherOccupation}
                          onChange={(e) => updateField('motherOccupation', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="adm-mother-nid" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          মাতার এনআইডি (NID) নং
                        </label>
                        <input
                          id="adm-mother-nid"
                          type="text"
                          inputMode="numeric"
                          placeholder="১০ বা ১৭ ডিজিট"
                          value={form.motherNid}
                          onChange={(e) => updateField('motherNid', e.target.value.replace(/[^\d]/g, ''))}
                          className={`${inputClass} font-sans tabular-nums`}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label htmlFor="adm-phone" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          অভিভাবকের মোবাইল নম্বর <span className="text-[#1F7A4D]">*</span>
                        </label>
                        <input
                          id="adm-phone"
                          type="tel"
                          placeholder="017XXXXXXXX"
                          value={form.guardianPhone}
                          onChange={(e) => updateField('guardianPhone', e.target.value)}
                          className={`${inputClass} font-sans tabular-nums`}
                        />
                      </div>
                      <div>
                        <label htmlFor="adm-address" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                          বর্তমান ঠিকানা (গ্রাম, ডাকঘর, উপজেলা, জেলা)
                        </label>
                        <input
                          id="adm-address"
                          type="text"
                          placeholder="উপসী, নড়িয়া, শরীয়তপুর"
                          value={form.address}
                          onChange={(e) => updateField('address', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="adm-perm-address" className="text-xs font-semibold text-slate-700 font-bn">
                            স্থায়ী ঠিকানা
                          </label>
                          <label className="inline-flex items-center gap-1.5 text-[11px] text-[#1F7A4D] cursor-pointer font-bn">
                            <input
                              type="checkbox"
                              checked={sameAsPresent}
                              onChange={(e) => handleSameAddressToggle(e.target.checked)}
                              className="rounded border-slate-300 text-[#1F7A4D]"
                            />
                            <span>বর্তমান ঠিকানার অনুরূপ</span>
                          </label>
                        </div>
                        <input
                          id="adm-perm-address"
                          type="text"
                          placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                          value={form.permanentAddress}
                          onChange={(e) => updateField('permanentAddress', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Previous School & Applying Class */}
                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="md:col-span-2 lg:col-span-2">
                      <label htmlFor="adm-prev-school" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        পূর্বে অধ্যয়নরত বিদ্যালয়ের নাম ও ঠিকানা
                      </label>
                      <input
                        id="adm-prev-school"
                        type="text"
                        placeholder="যেমন: উপসী সরকারি প্রাথমিক বিদ্যালয়, নড়িয়া, শরীয়তপুর"
                        value={form.previousSchool}
                        onChange={(e) => updateField('previousSchool', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="adm-prev-class" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        পূর্ববর্তী শ্রেণি ও প্রাপ্ত গ্রেড
                      </label>
                      <input
                        id="adm-prev-class"
                        type="text"
                        placeholder="যেমন: ৫ম শ্রেণি / GPA 5.00"
                        value={form.previousClassGrade}
                        onChange={(e) => updateField('previousClassGrade', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="adm-pass-year" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        পাসের সন (Passing Year)
                      </label>
                      <input
                        id="adm-pass-year"
                        type="text"
                        placeholder="2026"
                        value={form.passingYear}
                        onChange={(e) => updateField('passingYear', e.target.value)}
                        className={`${inputClass} font-sans tabular-nums`}
                      />
                    </div>

                    <div>
                      <label htmlFor="adm-roll-gpa" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        পূর্ববর্তী রোল নম্বর / রেজিঃ নং
                      </label>
                      <input
                        id="adm-roll-gpa"
                        type="text"
                        placeholder="যেমন: রোল ০৫ / জিপিএ ৫.০০"
                        value={form.previousRollGpa}
                        onChange={(e) => updateField('previousRollGpa', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="adm-type" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        ভর্তির ধরন
                      </label>
                      <select
                        id="adm-type"
                        value={form.admissionType}
                        onChange={(e) => updateField('admissionType', e.target.value as 'নতুন ভর্তি' | 'পুনঃ ভর্তি')}
                        className={inputClass}
                      >
                        <option value="নতুন ভর্তি">নতুন ভর্তি (New Admission)</option>
                        <option value="পুনঃ ভর্তি">পুনঃ ভর্তি (Re-Admission)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="adm-class" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        ভর্তিচ্ছু শ্রেণি
                      </label>
                      <select
                        id="adm-class"
                        value={form.applyingClass}
                        onChange={(e) => updateField('applyingClass', e.target.value)}
                        className={inputClass}
                      >
                        <option value="Class 6">৬ষ্ঠ শ্রেণি (Class 6)</option>
                        <option value="Class 7">৭ম শ্রেণি (Class 7)</option>
                        <option value="Class 8">৮ম শ্রেণি (Class 8)</option>
                        <option value="Class 9">৯ম শ্রেণি (Class 9)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="adm-group" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        একাডেমিক বিভাগ (৯ম শ্রেণির জন্য)
                      </label>
                      <select
                        id="adm-group"
                        value={form.sscGroup}
                        onChange={(e) => updateField('sscGroup', e.target.value as AdmissionFormState['sscGroup'])}
                        className={inputClass}
                      >
                        <option value="বিজ্ঞান">বিজ্ঞান (Science)</option>
                        <option value="মানবিক">মানবিক (Humanities)</option>
                        <option value="ব্যবসায় শিক্ষা">ব্যবসায় শিক্ষা (Business Studies)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="adm-fourth" className="block text-xs font-semibold text-slate-700 mb-1.5 font-bn">
                        ৯ম শ্রেণির শাখা / ৪র্থ বিষয় (প্রযোজ্য ক্ষেত্রে)
                      </label>
                      <select
                        id="adm-fourth"
                        value={form.fourthSubject}
                        onChange={(e) => updateField('fourthSubject', e.target.value)}
                        className={inputClass}
                      >
                        <option value="কৃষি শিক্ষা">কৃষি শিক্ষা</option>
                        <option value="উচ্চতর গণিত">উচ্চতর গণিত</option>
                        <option value="গার্হস্থ্য অর্থনীতি">গার্হস্থ্য অর্থনীতি</option>
                        <option value="কম্পিউটার শিক্ষা">কম্পিউটার শিক্ষা</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review & Official Undertaking */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F7F8FC] border border-slate-200 rounded-xl p-5 text-sm font-bn">
                      <div>
                        <p className="text-xs text-slate-500">শিক্ষার্থীর নাম</p>
                        <p className="font-semibold text-[#1B2A6B] mt-0.5">
                          {form.applicantNameBn || '—'} {form.applicantName ? `(${form.applicantName})` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">জন্ম তারিখ ও সনদ নং</p>
                        <p className="font-medium text-slate-800 tabular-nums mt-0.5">
                          {form.dateOfBirth || '—'} · {form.birthCertificateNo || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">ভর্তিচ্ছু শ্রেণি ও ধারা</p>
                        <p className="font-semibold text-[#1F7A4D] mt-0.5">
                          {form.applyingClass} · {form.applyingClass === 'Class 9' ? `${form.sscGroup} বিভাগ` : 'সাধারণ মাধ্যমিক'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">পিতা ও মাতা</p>
                        <p className="font-medium text-slate-800 mt-0.5">
                          {form.fatherNameBn || '—'} / {form.motherNameBn || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">অভিভাবকের মোবাইল</p>
                        <p className="font-semibold text-slate-900 tabular-nums mt-0.5">
                          {form.guardianPhone || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">বর্তমান ঠিকানা</p>
                        <p className="font-medium text-slate-800 mt-0.5">{form.address || '—'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 font-bn">
                      <h3 className="text-sm font-bold text-[#1B2A6B]">অঙ্গীকার নামা (Declaration)</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        আমি এই মর্মে অঙ্গীকার করিতেছি যে, আমার পুত্র / কন্যা / আত্মীয় অন্য কোন বিদ্যালয়ে ভর্তি হয় নাই। সে অত্র বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের সকল প্রকার বিধি-বিধান মানিয়া চলিতে বাধ্য থাকিবে এবং আমার উপরে বর্ণিত সকল তথ্যাবলী সঠিক।
                      </p>
                      <label className="flex items-start gap-3 pt-2 cursor-pointer">
                        <input
                          id="adm-undertaking"
                          type="checkbox"
                          checked={form.undertakingAccepted}
                          onChange={(e) => updateField('undertakingAccepted', e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1F7A4D] focus:ring-[#1F7A4D]"
                        />
                        <span className="text-sm font-medium text-[#1B2A6B]">
                          উপরোক্ত অঙ্গীকারনামা পাঠ করেছি এবং প্রদত্ত সকল তথ্য সত্য ও নির্ভুল মর্মে সম্মতি প্রদান করছি।
                        </span>
                      </label>
                      {submitAttempted && !form.undertakingAccepted && (
                        <p className="text-xs text-amber-700 font-medium">
                          আবেদন জমা দেওয়ার পূর্বে অনুগ্রহ করে উপরের বক্সে টিক চিহ্ন দিন।
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Footer Actions */}
              <div className="px-6 sm:px-8 py-4 bg-[#F7F8FC] border-t border-slate-200 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg cursor-pointer font-bn"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী ধাপ</span>
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(4, s + 1))}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1B2A6B] hover:bg-[#142054] rounded-lg transition-colors cursor-pointer font-bn"
                  >
                    <span>পরবর্তী ধাপ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-7 py-2.5 text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors cursor-pointer font-bn"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ভর্তি আবেদন জমা দিন</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. OFFICIAL PRINTABLE A4 ADMISSION FORM + TEAR-OFF ADMIT CARD
// Matches exact official printed school form of Bijhari Upashi T.P. High School
// ---------------------------------------------------------------------------

export function AdmissionFormPrintPage() {
  const { addToast } = useSchoolStore();

  const handlePrintForm = () => {
    printElementById(
      'official-admission-a4-form',
      'ভর্তির আবেদন ফরম — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়'
    );
    addToast('success', 'অফিসিয়াল ভর্তি ফরম প্রিন্ট প্রিভিউ খোলা হয়েছে।');
  };

  const handleDownloadForm = () => {
    downloadElementAsPrintableHtml(
      'official-admission-a4-form',
      'BUTPHS-Official-Admission-Form.html',
      'ভর্তির আবেদন ফরম — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়'
    );
    addToast('info', 'অফিসিয়াল প্রিন্টযোগ্য ভর্তি ফরম সংরক্ষণ করা হয়েছে।');
  };

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <div className="no-print">
        <PageHeader
          kicker="অফিসিয়াল প্রিন্ট ফরম (A4) · স্থাপিত ১৮৯৮ খ্রি."
          title="ভর্তির আবেদন ফরম ও ভর্তি পরীক্ষার প্রবেশপত্র"
          titleBn="Official Printable Admission Form & Admit Card"
          description="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের মূল মুদ্রিত ফরমের হুবহু A4 ডিজিটাল সংস্করণ। সরাসরি প্রিন্ট করুন অথবা সংরক্ষণ করুন।"
          actions={
            <>
              <button
                type="button"
                onClick={handleDownloadForm}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-[#1B2A6B] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer font-bn"
              >
                <Download className="w-4 h-4" />
                <span>ফরম ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={handlePrintForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন (A4)</span>
              </button>
            </>
          }
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <article
          id="official-admission-a4-form"
          className="bg-white border border-slate-300 shadow-sm rounded-sm max-w-[210mm] mx-auto px-6 sm:px-10 py-7 sm:py-9 text-slate-950 font-bn"
        >
          {/* Top School Header + Photo Box */}
          <header className="grid grid-cols-12 gap-3 items-start pb-3">
            <div className="col-span-2 flex justify-center sm:justify-start pt-1">
              <img
                src={SCHOOL_INFO.assets.logo}
                alt={SCHOOL_INFO.nameBn}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
            </div>

            <div className="col-span-8 text-center space-y-0.5">
              <h2 className="text-xl sm:text-[26px] font-extrabold text-slate-950 tracking-tight leading-tight">
                বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়
              </h2>
              <p className="text-xs sm:text-[15px] font-extrabold tracking-wide text-slate-900 font-sans uppercase">
                BIJHARI UPASHI T.P. HIGH SCHOOL
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800 pt-0.5 tabular-nums">
                বিদ্যালয় কোডঃ ৬১০২, জেলা কোডঃ ৩০, থানা কোডঃ ২৪১, EIIN : 113585
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800">
                ডাকঘরঃ উপসী, উপজেলাঃ নড়িয়া, জেলাঃ শরীয়তপুর।
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800">
                স্থাপিতঃ ১৮৯৮ খ্রি.
              </p>
            </div>

            <div className="col-span-2 flex justify-end">
              <div className="w-24 h-28 border border-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 bg-white">
                ছবি
              </div>
            </div>
          </header>

          {/* Inverted Title Bar + Serial / Class / Session Row */}
          <div className="text-center mt-1 mb-3">
            <span className="inline-block bg-slate-950 text-white text-sm sm:text-base font-bold px-6 py-1 tracking-wide">
              ভর্তির আবেদন ফরম
            </span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 text-xs sm:text-[13px] pb-3 mb-2">
            <div className="flex items-end gap-1.5 min-w-[140px]">
              <span className="font-semibold shrink-0">ক্রমিক নং :</span>
              <span className="flex-1 border-b border-dotted border-slate-700 min-w-[70px]" />
            </div>
            <div className="flex items-end gap-1.5 flex-1 max-w-xs">
              <span className="font-semibold shrink-0">শ্রেণিঃ</span>
              <span className="flex-1 border-b border-dotted border-slate-700" />
            </div>
            <div className="flex items-end gap-1.5 flex-1 max-w-xs">
              <span className="font-semibold shrink-0">শিক্ষাবর্ষঃ</span>
              <span className="flex-1 border-b border-dotted border-slate-700" />
            </div>
          </div>

          {/* Official 13 Numbered Fields */}
          <div className="space-y-2.5 text-xs sm:text-[13px] leading-relaxed">
            {/* 01 */}
            <div className="space-y-1.5">
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 font-semibold">০১. শিক্ষার্থীর নাম (বাংলায়)</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
              </div>
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 pl-5 font-semibold">(ইংরেজিতে)</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
              </div>
            </div>

            {/* 02 */}
            <div className="space-y-1.5">
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 font-semibold">০২. পিতার নাম (বাংলায়)</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="font-semibold shrink-0 ml-2">পেশা :</span>
                <span className="w-36 border-b border-dotted border-slate-700" />
              </div>
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 pl-5 font-semibold">(ইংরেজিতে)</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="font-semibold shrink-0 ml-2">পিতার এনআইডি নং :</span>
                <span className="w-44 border-b border-dotted border-slate-700" />
              </div>
            </div>

            {/* 03 */}
            <div className="space-y-1.5">
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 font-semibold">০৩. মাতার নাম (বাংলায়)</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="font-semibold shrink-0 ml-2">পেশা :</span>
                <span className="w-36 border-b border-dotted border-slate-700" />
              </div>
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 pl-5 font-semibold">(ইংরেজিতে)</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="font-semibold shrink-0 ml-2">মাতার এনআইডি নং :</span>
                <span className="w-44 border-b border-dotted border-slate-700" />
              </div>
            </div>

            {/* 04 */}
            <div className="space-y-1.5">
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 font-semibold">০৪. বর্তমান ঠিকানা</span>
                <span>:</span>
                <span className="shrink-0">গ্রাম</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="shrink-0">, পোস্ট অফিস:</span>
                <span className="w-28 border-b border-dotted border-slate-700" />
                <span className="shrink-0">পোস্ট কোড:</span>
                <span className="w-20 border-b border-dotted border-slate-700" />
              </div>
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0" />
                <span className="opacity-0">:</span>
                <span className="shrink-0">উপজেলা:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="shrink-0 ml-2">জেলা:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
              </div>
            </div>

            {/* 05 */}
            <div className="flex items-end gap-2">
              <span className="w-44 shrink-0 font-semibold">০৫. জন্ম তারিখ</span>
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-slate-700" />
            </div>

            {/* 06 */}
            <div className="flex items-end gap-2">
              <span className="w-44 shrink-0 font-semibold">০৬. শিক্ষার্থীর জন্ম সনদ নং</span>
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-slate-700" />
            </div>

            {/* 07 */}
            <div className="flex items-end gap-2">
              <span className="w-44 shrink-0 font-semibold">০৭. ধর্ম</span>
              <span>:</span>
              <span className="flex-1 border-b border-dotted border-slate-700" />
            </div>

            {/* 08 */}
            <div className="space-y-1.5">
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 font-semibold">০৮. পি.এস.সি/জে.এস.সি পাসের সন</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="font-semibold shrink-0 ml-2">রোল নম্বরঃ</span>
                <span className="w-44 border-b border-dotted border-slate-700" />
              </div>
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 pl-5 font-semibold">রেজিঃ নং</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="font-semibold shrink-0 ml-2">প্রাপ্ত জি.পি.এ :</span>
                <span className="w-44 border-b border-dotted border-slate-700" />
              </div>
            </div>

            {/* 09 */}
            <div className="space-y-1.5">
              <div className="flex items-end gap-2">
                <span className="w-44 shrink-0 font-semibold">০৯. পূর্বে অধ্যয়নরত বিদ্যালয়ের নাম</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
              </div>
              <div className="flex items-end gap-2 pl-48">
                <span className="shrink-0">শ্রেণি :</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
                <span className="shrink-0">শিক্ষাবর্ষ:</span>
                <span className="w-20 border-b border-dotted border-slate-700" />
                <span className="shrink-0">প্রাপ্ত গ্রেড:</span>
                <span className="w-16 border-b border-dotted border-slate-700" />
                <span className="shrink-0">জি.পি.এ:</span>
                <span className="w-16 border-b border-dotted border-slate-700" />
              </div>
              <div className="flex items-end gap-2 pl-48">
                <span className="shrink-0">ঠিকানা :</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
              </div>
            </div>

            {/* 10 */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="w-44 shrink-0 font-semibold">১০. নতুন ভর্তি / পুনঃ ভর্তি</span>
              <span>:</span>
              <span>হ্যাঁ / না &nbsp;&nbsp;(টিক চিহ্ন দিন)</span>
            </div>

            {/* 11 */}
            <div className="flex items-end gap-2">
              <span className="w-44 shrink-0 font-semibold">১১. ৬ষ্ঠ / ৭ম / ৮ম / ৯ম শ্রেণি</span>
              <span>:</span>
              <span className="shrink-0">শাখা ক / খ / গ / ঘ, &nbsp; রোল নং</span>
              <span className="w-32 border-b border-dotted border-slate-700" />
            </div>

            {/* 12 */}
            <div className="flex items-center gap-2">
              <span className="w-56 shrink-0 font-semibold">১২. ৯ম শ্রেণির যে শাখায় ভর্তি হতে ইচ্ছুক</span>
              <span>:</span>
              <span>বিজ্ঞান / মানবিক / ব্যবসায় শিক্ষা শাখা</span>
            </div>

            {/* 13 */}
            <div className="flex items-center gap-2">
              <span className="w-44 shrink-0 font-semibold">১৩. ৪র্থ বিষয়</span>
              <span>:</span>
              <span>উচ্চতর গণিত / কৃষি শিক্ষা / গার্হস্থ্য অর্থনীতি / কম্পিউটার শিক্ষা</span>
            </div>
          </div>

          {/* Framed Undertaking Box (অঙ্গীকার নামা) */}
          <div className="mt-5 border border-slate-800 rounded-lg px-5 py-4 space-y-4">
            <div className="text-center">
              <span className="inline-block px-4 py-0.5 bg-slate-100 border border-slate-300 text-xs sm:text-sm font-bold text-slate-950">
                অঙ্গীকার নামা
              </span>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-900">
              আমি এই মর্মে অঙ্গীকার করিতেছি যে, আমার পুত্র / কন্যা / আত্মীয় অন্য কোন বিদ্যালয়ে ভর্তি হয় নাই। সে অত্র বিদ্যালয়ের সকল প্রকার বিধি-বিধান মানিয়া চলিতে বাধ্য থাকিবে এবং আমার উপরে বর্ণিত সকল তথ্যাবলী সঠিক।
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6 text-xs">
              <div className="space-y-1.5">
                <p className="font-semibold">অভিভাবকের স্বাক্ষর</p>
                <div className="flex items-end gap-1.5">
                  <span>মোবাইল নং :</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 max-w-[160px]" />
                </div>
              </div>
              <div className="space-y-1.5 pl-6">
                <p className="font-semibold">শিক্ষার্থীর স্বাক্ষর ও তারিখ</p>
                <div className="flex items-end gap-1.5">
                  <span>মোবাইল নং :</span>
                  <span className="flex-1 border-b border-dotted border-slate-700 max-w-[160px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Office Endorsement Line */}
          <div className="mt-5 space-y-8 text-xs sm:text-[13px]">
            <div className="flex flex-wrap items-end gap-2">
              <span>আবেদনকারীকে</span>
              <span className="w-32 border-b border-dotted border-slate-700" />
              <span>শিক্ষাবর্ষে</span>
              <span className="w-32 border-b border-dotted border-slate-700" />
              <span>শ্রেণিতে ভর্তি করা হইল।</span>
            </div>

            <div className="flex items-end justify-between gap-8 pt-4">
              <div className="text-center w-44">
                <div className="border-t border-slate-800 pt-1 font-semibold">শ্রেণি শিক্ষকের স্বাক্ষর</div>
              </div>
              <div className="text-center w-44">
                <div className="border-t border-slate-800 pt-1 font-semibold">প্রধান শিক্ষকের স্বাক্ষর</div>
              </div>
            </div>
          </div>

          {/* Perforated Tear-Off Divider */}
          <div className="my-5 flex items-center gap-2 text-slate-600">
            <Scissors className="w-4 h-4 shrink-0" aria-hidden="true" />
            <div className="flex-1 border-t-2 border-dotted border-slate-800" />
          </div>

          {/* Bottom Tear-Off Slip: ভর্তি পরীক্ষার প্রবেশ পত্র */}
          <section aria-label="ভর্তি পরীক্ষার প্রবেশ পত্র" className="space-y-3">
            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-2 flex justify-center sm:justify-start">
                <img
                  src={SCHOOL_INFO.assets.logo}
                  alt={SCHOOL_INFO.nameBn}
                  className="w-14 h-14 object-contain"
                />
              </div>

              <div className="col-span-6 text-center space-y-2">
                <span className="inline-block bg-slate-950 text-white text-sm font-bold px-5 py-1">
                  ভর্তি পরীক্ষার প্রবেশ পত্র
                </span>
                <div className="flex items-end justify-center gap-3 text-xs pt-1">
                  <span className="font-semibold">শ্রেণিঃ</span>
                  <span className="w-24 border-b border-dotted border-slate-700" />
                  <span className="font-semibold">শিক্ষাবর্ষঃ</span>
                  <span className="w-24 border-b border-dotted border-slate-700" />
                </div>
              </div>

              <div className="col-span-2 text-center space-y-1">
                <p className="text-[11px] font-semibold">ভর্তি পরীক্ষার রোল নং</p>
                <div className="h-8 border border-slate-800 bg-white" />
              </div>

              <div className="col-span-2 flex justify-end">
                <div className="w-20 h-24 border border-slate-800 flex items-center justify-center text-[11px] font-semibold text-slate-700">
                  ছবি
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-[13px] pt-1">
              <div className="flex items-end gap-2">
                <span className="w-28 shrink-0 font-semibold">শিক্ষার্থীর নাম</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
              </div>
              <div className="flex items-end gap-2">
                <span className="w-28 shrink-0 font-semibold">পিতার নাম</span>
                <span>:</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
              </div>
            </div>

            <div className="flex items-end justify-between gap-6 pt-6 text-xs">
              <div className="flex items-end gap-1.5 flex-1 max-w-xs">
                <span className="font-semibold shrink-0">ভর্তি পরীক্ষার তারিখঃ</span>
                <span className="flex-1 border-b border-dotted border-slate-700" />
              </div>
              <div className="text-center min-w-[200px]">
                <div className="border-t border-slate-800 pt-1">
                  <p className="font-bold text-slate-950">প্রধান শিক্ষক</p>
                  <p className="text-[11px] font-semibold text-slate-800">বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়</p>
                  <p className="text-[10px] text-slate-700">উপসী, নড়িয়া, শরীয়তপুর।</p>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. REORGANIZED TUITION & FEES SCHEDULE PAGE
// ---------------------------------------------------------------------------

interface FeeTierRow {
  id: string;
  level: 'junior' | 'secondary';
  classBn: string;
  streamBn: string;
  monthlyTuition: number;
  sessionFee: number;
  examFeeYearly: number;
  labIctFee: number;
  admissionFee: number;
}

const FEE_SCHEDULE_ROWS: FeeTierRow[] = [
  {
    id: 'fee-c6',
    level: 'junior',
    classBn: '৬ষ্ঠ শ্রেণি',
    streamBn: 'সাধারণ (নিম্ন মাধ্যমিক)',
    monthlyTuition: 200,
    sessionFee: 600,
    examFeeYearly: 400,
    labIctFee: 100,
    admissionFee: 500,
  },
  {
    id: 'fee-c7',
    level: 'junior',
    classBn: '৭ম শ্রেণি',
    streamBn: 'সাধারণ (নিম্ন মাধ্যমিক)',
    monthlyTuition: 220,
    sessionFee: 600,
    examFeeYearly: 400,
    labIctFee: 100,
    admissionFee: 500,
  },
  {
    id: 'fee-c8',
    level: 'junior',
    classBn: '৮ম শ্রেণি',
    streamBn: 'সাধারণ (নিম্ন মাধ্যমিক)',
    monthlyTuition: 250,
    sessionFee: 700,
    examFeeYearly: 500,
    labIctFee: 150,
    admissionFee: 550,
  },
  {
    id: 'fee-c9-gen',
    level: 'secondary',
    classBn: '৯ম শ্রেণি',
    streamBn: 'বিজ্ঞান / মানবিক / ব্যবসায় শিক্ষা',
    monthlyTuition: 300,
    sessionFee: 850,
    examFeeYearly: 600,
    labIctFee: 250,
    admissionFee: 650,
  },
  {
    id: 'fee-c10-gen',
    level: 'secondary',
    classBn: '১০ম শ্রেণি (এসএসসি)',
    streamBn: 'বিজ্ঞান / মানবিক / ব্যবসায় শিক্ষা',
    monthlyTuition: 320,
    sessionFee: 900,
    examFeeYearly: 700,
    labIctFee: 250,
    admissionFee: 650,
  },
];

export function FeesInfoPage() {
  const { addToast } = useSchoolStore();
  const [filterLevel, setFilterLevel] = useState<'all' | 'junior' | 'secondary'>('all');

  const rows = useMemo(
    () => (filterLevel === 'all' ? FEE_SCHEDULE_ROWS : FEE_SCHEDULE_ROWS.filter((r) => r.level === filterLevel)),
    [filterLevel]
  );

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="স্বচ্ছ আর্থিক কাঠামো · শিক্ষাবর্ষ ২০২৬–২৭"
        title="বেতন ও ফি কাঠামো"
        titleBn="Tuition Fees, Session Charges & Stipend Policy"
        description="শিক্ষা মন্ত্রণালয় ও বিদ্যালয় পরিচালনা পর্ষদ অনুমোদিত শ্রেণিভিত্তিক মাসিক বেতন, সেশন চার্জ, বৃত্তি সুবিধা ও পরিশোধ নির্দেশিকা।"
        actions={
          <button
            type="button"
            onClick={() => {
              printElementById('bhs-fees-schedule-sheet', 'বেতন ও ফি কাঠামো — বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়');
              addToast('success', 'বেতন ও ফি কাঠামো প্রিন্ট প্রিভিউ খোলা হয়েছে।');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg cursor-pointer font-bn"
          >
            <Printer className="w-4 h-4" />
            <span>ফি কাঠামো প্রিন্ট করুন</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-bn">
          {[
            { label: 'মাসিক বেতন শুরু', value: '৳২০০ / মাস', sub: '৬ষ্ঠ শ্রেণি থেকে সরকারি নীতিমালা অনুযায়ী' },
            { label: 'সরকারি উপবৃত্তি', value: '১০০% সহায়তা', sub: 'মেধাবী ও দরিদ্র শিক্ষার্থীদের উপবৃত্তি সুবিধা' },
            { label: 'বেতন পরিশোধের সময়', value: 'প্রতি মাসের ১–১৫ তারিখ', sub: 'বিলম্ব ফি ছাড়াই নিয়মিত পরিশোধ' },
            { label: 'ডিজিটাল রসিদ', value: 'তাৎক্ষণিক রসিদ', sub: 'ব্যাংক ও অফিস কাউন্টার থেকে সংরক্ষিত রসিদ' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-[#1B2A6B] mt-1 tabular-nums">{stat.value}</p>
              <p className="text-xs text-slate-600 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs + Printable Fee Table */}
        <div id="bhs-fees-schedule-sheet" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="font-bn">
              <h2 className="text-lg font-semibold text-[#1B2A6B]">শ্রেণিভিত্তিক নির্ধারিত ফি তালিকা</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় · EIIN: {SCHOOL_INFO.eiin}
              </p>
            </div>

            <div className="no-print flex flex-wrap gap-2 font-bn">
              {[
                { key: 'all', label: 'সকল শ্রেণি' },
                { key: 'junior', label: '৬ষ্ঠ–৮ম শ্রেণি' },
                { key: 'secondary', label: '৯ম–১০ম শ্রেণি' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterLevel(tab.key as typeof filterLevel)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    filterLevel === tab.key
                      ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left font-bn">
              <thead>
                <tr className="bg-[#F7F8FC] text-[#1B2A6B] border-b border-slate-200">
                  <th className="py-3.5 px-5 font-semibold">শ্রেণি ও শাখা</th>
                  <th className="py-3.5 px-4 font-semibold text-right">মাসিক বেতন</th>
                  <th className="py-3.5 px-4 font-semibold text-right">সেশন চার্জ (বার্ষিক)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">পরীক্ষা ফি (বার্ষিক)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ল্যাব ও আইসিটি</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ভর্তি ফি (নতুন)</th>
                  <th className="py-3.5 px-5 font-semibold text-right">বার্ষিক আনুমানিক মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const annualTotal = row.monthlyTuition * 12 + row.sessionFee + row.examFeeYearly + row.labIctFee;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-5">
                        <p className="font-semibold text-[#1B2A6B]">{row.classBn}</p>
                        <p className="text-xs text-slate-500">{row.streamBn}</p>
                      </td>
                      <td className="py-4 px-4 text-right tabular-nums font-medium">{formatCurrencyBdt(row.monthlyTuition)}</td>
                      <td className="py-4 px-4 text-right tabular-nums">{formatCurrencyBdt(row.sessionFee)}</td>
                      <td className="py-4 px-4 text-right tabular-nums">{formatCurrencyBdt(row.examFeeYearly)}</td>
                      <td className="py-4 px-4 text-right tabular-nums">{formatCurrencyBdt(row.labIctFee)}</td>
                      <td className="py-4 px-4 text-right tabular-nums">{formatCurrencyBdt(row.admissionFee)}</td>
                      <td className="py-4 px-5 text-right tabular-nums font-bold text-[#1F7A4D]">
                        {formatCurrencyBdt(annualTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Channels & Stipend Waivers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-bn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-[#1B2A6B]">
              <CreditCard className="w-5 h-5 text-[#1F7A4D]" />
              <h3 className="text-base font-semibold">বেতন ও ফি পরিশোধের মাধ্যম</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                <span><strong>বিদ্যালয় হিসাব শাখা:</strong> রবি–বৃহস্পতিবার সকাল ১০:০০ থেকে বিকাল ৪:০০ পর্যন্ত সরাসরি রসিদের মাধ্যমে।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                <span><strong>সোনালী ব্যাংক (নড়িয়া শাখা):</strong> বিদ্যালয়ের নির্ধারিত সঞ্চয়ী হিসাবে শিক্ষার্থী আইডি উল্লেখ করে জমা দেওয়া যাবে।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                <span><strong>অভিভাবক পোর্টাল রসিদ:</strong> প্রতি মাসের পরিশোধিত ফি ও বকেয়া অবস্থা পোর্টালে লগইন করে যাচাই করা যায়।</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-[#1B2A6B]">
              <GraduationCap className="w-5 h-5 text-[#C9A961]" />
              <h3 className="text-base font-semibold">উপবৃত্তি ও বেতন মওকুফ নীতিমালা</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                <span>সরকারি সমন্বিত উপবৃত্তি কর্মসূচির আওতায় নির্বাচিত শিক্ষার্থীরা পূর্ণ বিনা বেতনে অধ্যয়নের সুযোগ পায়।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                <span>একই পরিবারের দুই বা ততোধিক ভাই-বোন অধ্যয়নরত থাকলে প্রধান শিক্ষকের অনুমোদনে অর্ধ-বিনা বেতন সুবিধা রয়েছে।</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0 mt-1" />
                <span>এতিম, আর্থিকভাবে অসচ্ছল ও শ্রেণিতে ১ম–৩য় স্থান অর্জনকারী মেধাবী শিক্ষার্থীদের জন্য বিশেষ ফান্ড হতে সহায়তা প্রদান করা হয়।</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. MEDIA GALLERY PAGE
// ---------------------------------------------------------------------------

interface MediaGalleryItem {
  id: string;
  category: 'Campus' | 'Academics' | 'Events' | 'Sports';
  title: string;
  titleBn: string;
  date: string;
  imageUrl: string;
}

const CAMPUS_MEDIA_ITEMS: MediaGalleryItem[] = [
  {
    id: 'med-1',
    category: 'Campus',
    title: 'Main Academic Building & Heritage Courtyard',
    titleBn: 'প্রধান একাডেমিক ভবন ও শতবর্ষী প্রাঙ্গণ',
    date: '২০২৬',
    imageUrl: SCHOOL_INFO.assets.campusHero,
  },
  {
    id: 'med-2',
    category: 'Academics',
    title: 'Smart Multimedia Classroom Learning',
    titleBn: 'আধুনিক মাল্টিমিডিয়া শ্রেণিকক্ষে পাঠদান',
    date: '২০২৬',
    imageUrl: SCHOOL_INFO.assets.classroomStudy,
  },
  {
    id: 'med-3',
    category: 'Academics',
    title: 'Science & Computer Practical Laboratory',
    titleBn: 'বিজ্ঞান গবেষণাগার ও কম্পিউটার ব্যবহারিক ল্যাব',
    date: '২০২৬',
    imageUrl: SCHOOL_INFO.assets.scienceLab,
  },
  {
    id: 'med-4',
    category: 'Academics',
    title: 'Central School Library & Reading Room',
    titleBn: 'বিদ্যালয় কেন্দ্রীয় গ্রন্থাগার ও পাঠকক্ষ',
    date: '২০২৬',
    imageUrl: SCHOOL_INFO.assets.schoolLibrary,
  },
  {
    id: 'med-5',
    category: 'Events',
    title: 'Morning Assembly & National Anthem Parade',
    titleBn: 'প্রাত্যহিক সমাবেশ ও জাতীয় সংগীত পরিবেশন',
    date: '২০২৬',
    imageUrl: SCHOOL_INFO.assets.morningAssembly,
  },
  {
    id: 'med-6',
    category: 'Events',
    title: 'Inter-School Debate & Cultural Competition',
    titleBn: 'আন্তঃবিদ্যালয় বিতর্ক ও সাংস্কৃতিক প্রতিযোগিতা',
    date: '২০২৬',
    imageUrl: SCHOOL_INFO.assets.debateCulture,
  },
  {
    id: 'med-7',
    category: 'Sports',
    title: 'Annual Sports & Athletics Championship',
    titleBn: 'বার্ষিক ক্রীড়া ও অ্যাথলেটিক্স প্রতিযোগিতা',
    date: '২০২৬',
    imageUrl: SCHOOL_INFO.assets.sportsField,
  },
];

export function MediaGalleryPage() {
  const { db } = useSchoolStore();
  const [category, setCategory] = useState<'All' | MediaGalleryItem['category']>('All');
  const categories: Array<'All' | MediaGalleryItem['category']> = ['All', 'Campus', 'Academics', 'Events', 'Sports'];

  const mergedItems = useMemo<MediaGalleryItem[]>(() => {
    const dynamicEvents: MediaGalleryItem[] = db.events.map((ev) => ({
      id: `evt-${ev.id}`,
      category: ev.category === 'Sports' ? 'Sports' : ev.category === 'Academic' ? 'Academics' : 'Events',
      title: ev.title,
      titleBn: ev.titleBn || ev.title,
      date: ev.date,
      imageUrl: ev.imageUrl || SCHOOL_INFO.assets.campusHero,
    }));
    return [...dynamicEvents, ...CAMPUS_MEDIA_ITEMS];
  }, [db.events]);

  const items = category === 'All' ? mergedItems : mergedItems.filter((m) => m.category === category);

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="ফটো ও মিডিয়া আর্কাইভ"
        title="ক্যাম্পাস মিডিয়া গ্যালারি"
        titleBn="Campus Photography, Labs & Events"
        description="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়ের ক্যাম্পাস, শ্রেণিকক্ষ, বিজ্ঞান ও কম্পিউটার ল্যাব, ক্রীড়া ও সাংস্কৃতিক আয়োজনের স্থিরচিত্র।"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isDebatePhoto = item.imageUrl.includes('bhs_debate_culture');
            return (
              <figure
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={`w-full h-full object-cover ${
                      isDebatePhoto ? 'object-bottom scale-[1.22] origin-bottom' : 'object-center'
                    }`}
                  />
                </div>
                <figcaption className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-[#1F7A4D]">{item.category}</span>
                    <span className="tabular-nums">{item.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1B2A6B] font-bn">{item.titleBn}</h3>
                  <p className="text-xs text-slate-600">{item.title}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. CLEAN CONTACT & GUARDIAN HELPDESK PAGE
// Left = Concise School Info | Right = Clean Contact Form | Bottom = Interactive Map
// ---------------------------------------------------------------------------

export function CommunityForumPage() {
  const { db, addInquiry, addToast } = useSchoolStore();
  const wc = db.websiteContent;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAndBuildInquiry({
      senderName: name,
      phone,
      subject: topic,
      message,
      source: 'Public Contact',
    });
    if (!validation.ok) {
      addToast('error', validation.error);
      return;
    }
    addInquiry(validation.inquiry);
    setName('');
    setPhone('');
    setTopic('');
    setMessage('');
    setSentSuccess(true);
  };

  return (
    <div className="bg-[#F7F8FC] min-h-screen">
      <PageHeader
        kicker="যোগাযোগ ও অভিভাবক সহায়তা"
        title="বিদ্যালয়ের সাথে যোগাযোগ করুন"
        titleBn="Contact & Guardian Helpdesk"
        description="ভর্তি, একাডেমিক কার্যক্রম, ফলাফল কিংবা যেকোনো প্রশাসনিক তথ্যের জন্য সরাসরি বিদ্যালয় অফিসে যোগাযোগ করুন অথবা বার্তা পাঠান।"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Clean Equal-Height 2-Column Top Grid: Left = Essential School Info, Right = Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* LEFT: Concise Essential School Contact Information */}
          <aside
            data-testid="contact-info-card"
            className="lg:col-span-5 h-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs font-bn flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                <img
                  src={SCHOOL_INFO.assets.logo}
                  alt={SCHOOL_INFO.nameBn}
                  className="w-12 h-12 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-[#1B2A6B] leading-snug">
                    {SCHOOL_INFO.nameBn}
                  </h2>
                  <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                    EIIN: {SCHOOL_INFO.eiin} · কোড: {SCHOOL_INFO.schoolCode} · স্থাপিত: {SCHOOL_INFO.establishedBn}
                  </p>
                </div>
              </div>

              <ul className="space-y-5 text-sm text-slate-700">
                <li className="flex items-start gap-3.5">
                  <span className="w-9 h-9 rounded-lg bg-emerald-50 text-[#1F7A4D] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">ঠিকানা (Address)</p>
                    <p className="font-medium text-slate-900 mt-0.5">{wc.addressBn || SCHOOL_INFO.addressBn}</p>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <span className="w-9 h-9 rounded-lg bg-indigo-50 text-[#1B2A6B] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">অফিস মোবাইল (Phone)</p>
                    <p className="font-semibold text-slate-900 font-sans tabular-nums mt-0.5">
                      {wc.contactPhone || SCHOOL_INFO.contactPlaceholders.officePhone}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">ইমেইল (Email)</p>
                    <p className="font-medium text-slate-900 font-sans mt-0.5 break-all">
                      {wc.contactEmail || SCHOOL_INFO.contactPlaceholders.email}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">অফিস সময় (Office Hours)</p>
                    <p className="font-medium text-slate-900 mt-0.5">{wc.officeHoursBn || SCHOOL_INFO.officeHoursBn}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-6 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
              সাপ্তাহিক ছুটি: শুক্রবার ও শনিবার · জরুরি প্রয়োজনে সরাসরি প্রধান শিক্ষকের কার্যালয়ে যোগাযোগ করুন।
            </div>
          </aside>

          {/* RIGHT: Clean Contact & Inquiry Form (Matched Height) */}
          <div
            data-testid="contact-form-card"
            className="lg:col-span-7 h-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs font-bn flex flex-col justify-between"
          >
            <div>
              <div className="pb-5 border-b border-slate-100">
                <h2 className="text-lg sm:text-xl font-semibold text-[#1B2A6B]">
                  সরাসরি বার্তা বা জিজ্ঞাসা পাঠান
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  আপনার প্রশ্ন বা মতামত নিচে লিখুন। বিদ্যালয় অফিস ডেস্ক দ্রুত উত্তর প্রদান করবে।
                </p>
              </div>

              {sentSuccess && (
                <div className="mt-5 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#1F7A4D] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">আপনার বার্তা সফলভাবে বিদ্যালয় অফিসে গৃহীত হয়েছে।</p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      অফিস চলাকালীন সময়ে আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
                    </p>
                  </div>
                </div>
              )}

              <form id="contact-helpdesk-form" onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      আপনার নাম (Full Name) *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="যেমন: মোঃ জহিরুল ইসলাম"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A4D]/20 focus:border-[#1F7A4D]"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      মোবাইল নম্বর (Mobile Number)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm border border-slate-300 rounded-lg font-sans tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1F7A4D]/20 focus:border-[#1F7A4D]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-topic" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    বিষয় (Subject) *
                  </label>
                  <input
                    id="contact-topic"
                    type="text"
                    placeholder="যেমন: ৬ষ্ঠ শ্রেণির ভর্তি তথ্য / প্রশংসাপত্র সংগ্রহ"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A4D]/20 focus:border-[#1F7A4D]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    বিস্তারিত বার্তা (Message) *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="আপনার জিজ্ঞাসা বা মতামত বিস্তারিত লিখুন..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A4D]/20 focus:border-[#1F7A4D]"
                  />
                </div>
              </form>
            </div>

            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">অফিস চলাকালীন সময়ে আমাদের প্রতিনিধি দ্রুত উত্তর প্রদান করবেন।</p>
              <button
                type="submit"
                form="contact-helpdesk-form"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>বার্তা পাঠান</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM FULL-WIDTH INTERACTIVE CAMPUS MAP */}
        <section
          aria-label="বিদ্যালয়ের অবস্থান মানচিত্র"
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
        >
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 font-bn">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-[#1F7A4D]" />
              <div>
                <h2 className="text-base font-semibold text-[#1B2A6B]">
                  ক্যাম্পাসের ভৌগোলিক অবস্থান (গুগল ম্যাপ)
                </h2>
                <p className="text-xs text-slate-500">
                  {SCHOOL_INFO.nameBn}, {SCHOOL_INFO.addressBn}
                </p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${SCHOOL_INFO.mapCoordinates.lat},${SCHOOL_INFO.mapCoordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1B2A6B] bg-[#F7F8FC] hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <span>গুগল ম্যাপে দিকনির্দেশনা</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="w-full h-[360px] sm:h-[420px] bg-slate-100">
            <iframe
              title="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় মানচিত্র"
              src={SCHOOL_INFO.mapCoordinates.embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
