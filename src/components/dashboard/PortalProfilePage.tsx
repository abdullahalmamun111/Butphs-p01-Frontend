import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { useAuth } from '../../providers/AuthProvider';
import { useSchoolStore } from '../../store/SchoolStore';
import { authService } from '../../services';
import {
  computeAvatarInitials,
  readAndCompressImageFile,
  resolveStudentPhotoUrl,
} from '../../utils/profileHelpers';
import { toBanglaDigits } from '../../utils/noticeUtils';

const ROLE_LABELS_BN: Record<string, string> = {
  admin: 'প্রশাসনিক (অ্যাডমিন) পোর্টাল',
  teacher: 'শিক্ষক পোর্টাল',
  accountant: 'হিসাবরক্ষক পোর্টাল',
  parent: 'অভিভাবক পোর্টাল',
};

export function PortalProfilePage() {
  const { user, updateCurrentUserProfile } = useAuth();
  const {
    db,
    updateTeacher,
    updateStaff,
    updateGuardian,
    updateWebsiteContent,
    logAudit,
    addToast,
  } = useSchoolStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const linkedTeacher = user?.linkedTeacherId
    ? db.teachers.find((t) => t.id === user.linkedTeacherId)
    : undefined;
  const linkedStaff = user?.linkedStaffId
    ? db.staff.find((s) => s.id === user.linkedStaffId)
    : undefined;
  const linkedGuardian = user?.linkedGuardianId
    ? db.guardians.find((g) => g.id === user.linkedGuardianId)
    : undefined;

  const linkedChildren =
    user?.role === 'parent'
      ? db.students.filter(
          (s) =>
            user.linkedStudentIds?.includes(s.studentId) ||
            (linkedGuardian && linkedGuardian.studentIds.includes(s.studentId))
        )
      : [];

  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [qualification, setQualification] = useState('');
  const [departmentBn, setDepartmentBn] = useState('');
  const [officeRoom, setOfficeRoom] = useState('');
  const [personalMotto, setPersonalMotto] = useState('');
  const [occupation, setOccupation] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  // Password Change State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setNameBn(linkedTeacher?.nameBn || linkedStaff?.nameBn || linkedGuardian?.nameBn || user.nameBn || '');
    setNameEn(linkedTeacher?.name || linkedStaff?.name || linkedGuardian?.name || user.name || '');
    setDesignation(
      linkedTeacher?.designationBn ||
        linkedStaff?.roleBn ||
        user.designation ||
        ''
    );
    setPhone(linkedTeacher?.phone || linkedStaff?.phone || linkedGuardian?.phone || user.phone || '');
    setAddress(linkedGuardian?.address || user.address || SCHOOL_INFO.addressBn);
    setBio(linkedTeacher?.bio || linkedStaff?.bio || user.bio || '');
    setQualification(linkedTeacher?.qualification || linkedStaff?.qualification || '');
    setDepartmentBn(linkedTeacher?.departmentBn || linkedStaff?.departmentBn || linkedTeacher?.department || linkedStaff?.department || '');
    setOfficeRoom(linkedTeacher?.officeRoom || linkedStaff?.officeRoom || '');
    setPersonalMotto(linkedTeacher?.personalMotto || '');
    setOccupation(linkedGuardian?.occupation || '');
    setPhotoUrl(
      user.photoUrl ||
        linkedTeacher?.photoUrl ||
        linkedStaff?.photoUrl ||
        linkedGuardian?.photoUrl ||
        ''
    );
  }, [user, linkedTeacher, linkedStaff, linkedGuardian]);

  if (!user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const compressedDataUrl = await readAndCompressImageFile(file, 420);
      setPhotoUrl(compressedDataUrl);
      setSavedBanner(false);
      addToast('info', 'নতুন ছবি প্রিভিউ প্রস্তুত', 'পরিবর্তন স্থায়ী করতে "প্রোফাইল সংরক্ষণ করুন" বাটনে ক্লিক করুন।');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetPhoto = () => {
    const defaultAsset =
      user.role === 'teacher'
        ? SCHOOL_INFO.assets.teacherFemaleSenior
        : user.role === 'parent'
          ? SCHOOL_INFO.assets.committeeGuardianMale
          : user.linkedTeacherId === 'tch-1'
            ? SCHOOL_INFO.assets.headTeacher
            : SCHOOL_INFO.assets.staffOffice;
    setPhotoUrl(defaultAsset);
    setUploadError(null);
    setSavedBanner(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !nameEn.trim()) {
      addToast('error', 'প্রয়োজনীয় তথ্য পূরণ করুন', 'বাংলা ও ইংরেজি উভয় নাম আবশ্যক।');
      return;
    }

    const nextInitials = computeAvatarInitials(nameEn, nameBn);
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanBio = bio.trim();
    const cleanDesignation = designation.trim();

    // 1. Update active session & persistent auth profile override
    updateCurrentUserProfile({
      nameBn: nameBn.trim(),
      name: nameEn.trim(),
      designation: cleanDesignation || user.designation,
      phone: cleanPhone,
      address: cleanAddress,
      bio: cleanBio,
      photoUrl: photoUrl || undefined,
      avatarInitials: nextInitials,
    });

    // 2. Sync with institutional database & Public Website records
    const actorName = nameBn.trim();
    if (linkedTeacher) {
      updateTeacher(
        linkedTeacher.id,
        {
          nameBn: nameBn.trim(),
          name: nameEn.trim(),
          designationBn: cleanDesignation || linkedTeacher.designationBn,
          departmentBn: departmentBn.trim() || linkedTeacher.departmentBn,
          qualification: qualification.trim() || linkedTeacher.qualification,
          officeRoom: officeRoom.trim() || linkedTeacher.officeRoom,
          phone: cleanPhone || linkedTeacher.phone,
          bio: cleanBio || linkedTeacher.bio,
          personalMotto: personalMotto.trim() || linkedTeacher.personalMotto,
          photoUrl: photoUrl || linkedTeacher.photoUrl,
        },
        actorName
      );
      // If Head Teacher, keep homepage Head Teacher Message synced too
      if (linkedTeacher.isHeadTeacher) {
        updateWebsiteContent(
          {
            headTeacherName: nameBn.trim(),
            headTeacherTitle: `${cleanDesignation || 'প্রধান শিক্ষক'} · ${SCHOOL_INFO.nameBn}`,
          },
          actorName
        );
      }
    } else if (linkedStaff) {
      updateStaff(
        linkedStaff.id,
        {
          nameBn: nameBn.trim(),
          name: nameEn.trim(),
          roleBn: cleanDesignation || linkedStaff.roleBn,
          departmentBn: departmentBn.trim() || linkedStaff.departmentBn,
          qualification: qualification.trim() || linkedStaff.qualification,
          officeRoom: officeRoom.trim() || linkedStaff.officeRoom,
          phone: cleanPhone || linkedStaff.phone,
          bio: cleanBio || linkedStaff.bio,
          photoUrl: photoUrl || linkedStaff.photoUrl,
        },
        actorName
      );
    } else if (linkedGuardian) {
      updateGuardian(
        linkedGuardian.id,
        {
          nameBn: nameBn.trim(),
          name: nameEn.trim(),
          phone: cleanPhone || linkedGuardian.phone,
          occupation: occupation.trim() || linkedGuardian.occupation,
          address: cleanAddress || linkedGuardian.address,
          photoUrl: photoUrl || linkedGuardian.photoUrl,
        },
        actorName
      );
    } else {
      logAudit(actorName, user.role, 'Profile', `ব্যক্তিগত প্রোফাইল ও ছবি হালনাগাদ (${user.email})`);
      addToast('success', 'ব্যক্তিগত প্রোফাইল সংরক্ষিত হয়েছে', 'আপনার ছবি ও তথ্য সফলভাবে হালনাগাদ হয়েছে।');
    }

    setSavedBanner(true);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdFeedback(null);
    if (newPwd !== confirmPwd) {
      setPwdFeedback({ ok: false, msg: 'নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।' });
      return;
    }
    const res = authService.changePassword(user.email, currentPwd, newPwd);
    setPwdFeedback({ ok: res.ok, msg: res.message });
    if (res.ok) {
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      logAudit(nameBn || user.nameBn, user.role, 'Security', 'ব্যক্তিগত পোর্টাল পাসওয়ার্ড পরিবর্তন');
      addToast('success', 'পাসওয়ার্ড হালনাগাদ হয়েছে');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Profile Banner & Local Image Upload Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar Frame with Upload Button Overlay */}
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-[#F7F8FC] shrink-0 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={nameBn || user.nameBn}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <span className="text-2xl font-semibold text-[#1B2A6B]">
                  {computeAvatarInitials(nameEn || user.name, nameBn || user.nameBn)}
                </span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold text-[#1F7A4D]">
                {ROLE_LABELS_BN[user.role] || user.role}
                {linkedTeacher ? ` · আইডি: ${linkedTeacher.employeeId}` : ''}
                {linkedStaff ? ` · আইডি: ${linkedStaff.employeeId}` : ''}
              </p>
              <h2 className="text-xl font-semibold text-[#1B2A6B] leading-snug">
                {nameBn || user.nameBn}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {designation || user.designation}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#1F7A4D]" aria-hidden="true" />
                  {user.email}
                </span>
                {phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#1F7A4D]" aria-hidden="true" />
                    {phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
            <input
              ref={fileInputRef}
              id="portal-avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="প্রোফাইল ছবি আপলোড করুন"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>{uploading ? 'ছবি প্রক্রিয়াকরণ হচ্ছে...' : 'ছবি পরিবর্তন করুন (ফাইল)'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-[#1B2A6B] bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>ডিফল্ট ছবি</span>
              </button>

              {linkedTeacher && (
                <Link
                  to={`/about/teachers/${linkedTeacher.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1F7A4D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>পাবলিক প্রোফাইল</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
              {linkedStaff && (
                <Link
                  to={`/about/staff/${linkedStaff.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1F7A4D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>পাবলিক প্রোফাইল</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {uploadError && (
          <div role="alert" className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {uploadError}
          </div>
        )}

        {savedBanner && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F7A4D] shrink-0" aria-hidden="true" />
            <span>
              আপনার ব্যক্তিগত প্রোফাইল ও ছবি সংরক্ষিত হয়েছে এবং পোর্টাল ও পাবলিক ওয়েবসাইটের সাথে সিঙ্ক করা হয়েছে।
            </span>
          </div>
        )}
      </section>

      {/* Main Editable Profile Form + Security Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[#1B2A6B]">ব্যক্তিগত তথ্য হালনাগাদ</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                এখানে তথ্য বা ছবি পরিবর্তন করলে পোর্টাল হেডার ও সংশ্লিষ্ট পাবলিক ডিরেক্টরিতে স্বয়ংক্রিয়ভাবে আপডেট হবে।
              </p>
            </div>
            <UserCheck className="w-5 h-5 text-[#1F7A4D] shrink-0" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-name-bn" className="block text-xs font-semibold text-slate-700 mb-1">
                পূর্ণ নাম (বাংলা) *
              </label>
              <input
                id="prof-name-bn"
                type="text"
                required
                value={nameBn}
                onChange={(e) => {
                  setNameBn(e.target.value);
                  setSavedBanner(false);
                }}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>

            <div>
              <label htmlFor="prof-name-en" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name (English) *
              </label>
              <input
                id="prof-name-en"
                type="text"
                required
                value={nameEn}
                onChange={(e) => {
                  setNameEn(e.target.value);
                  setSavedBanner(false);
                }}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>

            <div>
              <label htmlFor="prof-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                মোবাইল নম্বর
              </label>
              <input
                id="prof-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setSavedBanner(false);
                }}
                placeholder="017XXXXXXXX"
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D] tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="prof-designation" className="block text-xs font-semibold text-slate-700 mb-1">
                {user.role === 'parent' ? 'পরিচয় / সম্পর্ক' : 'পদবি / দায়িত্ব'}
              </label>
              <input
                id="prof-designation"
                type="text"
                value={designation}
                onChange={(e) => {
                  setDesignation(e.target.value);
                  setSavedBanner(false);
                }}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>

            {(linkedTeacher || linkedStaff) && (
              <>
                <div>
                  <label htmlFor="prof-dept" className="block text-xs font-semibold text-slate-700 mb-1">
                    বিভাগ / শাখা
                  </label>
                  <input
                    id="prof-dept"
                    type="text"
                    value={departmentBn}
                    onChange={(e) => {
                      setDepartmentBn(e.target.value);
                      setSavedBanner(false);
                    }}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                  />
                </div>
                <div>
                  <label htmlFor="prof-qual" className="block text-xs font-semibold text-slate-700 mb-1">
                    শিক্ষাগত যোগ্যতা
                  </label>
                  <input
                    id="prof-qual"
                    type="text"
                    value={qualification}
                    onChange={(e) => {
                      setQualification(e.target.value);
                      setSavedBanner(false);
                    }}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="prof-room" className="block text-xs font-semibold text-slate-700 mb-1">
                    অফিস কক্ষ / অবস্থান
                  </label>
                  <input
                    id="prof-room"
                    type="text"
                    value={officeRoom}
                    onChange={(e) => {
                      setOfficeRoom(e.target.value);
                      setSavedBanner(false);
                    }}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                  />
                </div>
              </>
            )}

            {user.role === 'parent' && (
              <div>
                <label htmlFor="prof-occupation" className="block text-xs font-semibold text-slate-700 mb-1">
                  পেশা
                </label>
                <input
                  id="prof-occupation"
                  type="text"
                  value={occupation}
                  onChange={(e) => {
                    setOccupation(e.target.value);
                    setSavedBanner(false);
                  }}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                />
              </div>
            )}

            <div className={user.role === 'parent' ? '' : 'sm:col-span-2'}>
              <label htmlFor="prof-address" className="block text-xs font-semibold text-slate-700 mb-1">
                ঠিকানা
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="prof-address"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setSavedBanner(false);
                  }}
                  className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                />
              </div>
            </div>

            {linkedTeacher && (
              <div className="sm:col-span-2">
                <label htmlFor="prof-motto" className="block text-xs font-semibold text-slate-700 mb-1">
                  ব্যক্তিগত শিক্ষাদর্শন / বাণী
                </label>
                <input
                  id="prof-motto"
                  type="text"
                  value={personalMotto}
                  onChange={(e) => {
                    setPersonalMotto(e.target.value);
                    setSavedBanner(false);
                  }}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label htmlFor="prof-bio" className="block text-xs font-semibold text-slate-700 mb-1">
                সংক্ষিপ্ত পরিচিতি / বিবরণ
              </label>
              <textarea
                id="prof-bio"
                rows={3}
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setSavedBanner(false);
                }}
                className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500">
              সমর্থিত ছবি: JPG, PNG, WEBP (সর্বোচ্চ ৫ MB · স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হয়)
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>প্রোফাইল সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>

        {/* Right Column: Role Summary + Password Security */}
        <div className="lg:col-span-4 space-y-5">
          {/* Teacher Assigned Classes or Parent Linked Children */}
          {linkedTeacher && (
            <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1B2A6B]">নির্ধারিত শ্রেণি ও বিষয়</h3>
                <ShieldCheck className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
              </div>
              <dl className="space-y-2.5 text-xs">
                <div>
                  <dt className="text-slate-500">নির্ধারিত শ্রেণি</dt>
                  <dd className="font-semibold text-[#1F7A4D] mt-0.5">
                    {linkedTeacher.assignedClasses.join(', ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">পাঠদানকৃত বিষয়</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">
                    {linkedTeacher.assignedSubjects.join(', ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">যোগদানের তারিখ</dt>
                  <dd className="font-medium text-slate-800 mt-0.5 tabular-nums">
                    {linkedTeacher.joiningDate}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {user.role === 'parent' && linkedChildren.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#1B2A6B]">
                  সংযুক্ত শিক্ষার্থী ({toBanglaDigits(linkedChildren.length)})
                </h3>
                <Users className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
              </div>
              <div className="space-y-2.5">
                {linkedChildren.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7F8FC] border border-slate-200/80"
                  >
                    <img
                      src={resolveStudentPhotoUrl(child)}
                      alt={child.nameBn}
                      className="w-10 h-12 rounded-lg object-cover object-top border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1B2A6B] truncate">{child.nameBn}</p>
                      <p className="text-[11px] text-slate-600 tabular-nums">
                        {child.className} · রোল {toBanglaDigits(child.roll)}
                      </p>
                      <p className="text-[10.5px] text-[#1F7A4D] font-mono">{child.studentId}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Password Security Card */}
          <form
            onSubmit={handlePasswordChange}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-[#1B2A6B]">পাসওয়ার্ড পরিবর্তন</h3>
              <KeyRound className="w-4 h-4 text-[#1F7A4D]" aria-hidden="true" />
            </div>

            {pwdFeedback && (
              <div
                role="alert"
                className={`p-2.5 rounded-lg text-xs border ${
                  pwdFeedback.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {pwdFeedback.msg}
              </div>
            )}

            <div>
              <label htmlFor="pwd-current" className="block text-xs font-medium text-slate-700 mb-1">
                বর্তমান পাসওয়ার্ড
              </label>
              <input
                id="pwd-current"
                type="password"
                required
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>

            <div>
              <label htmlFor="pwd-new" className="block text-xs font-medium text-slate-700 mb-1">
                নতুন পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)
              </label>
              <input
                id="pwd-new"
                type="password"
                required
                minLength={6}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>

            <div>
              <label htmlFor="pwd-confirm" className="block text-xs font-medium text-slate-700 mb-1">
                নতুন পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <input
                id="pwd-confirm"
                type="password"
                required
                minLength={6}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#1F7A4D]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-9 text-xs font-semibold text-white bg-[#1B2A6B] hover:bg-[#1F7A4D] rounded-lg transition-colors cursor-pointer"
            >
              পাসওয়ার্ড হালনাগাদ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
