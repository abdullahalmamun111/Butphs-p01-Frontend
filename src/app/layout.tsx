import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { SchoolStoreProvider } from '../store/SchoolStore';
import { ToastContainer } from '../components/ui/ToastContainer';
import { PublicLayout } from '../components/layout/PublicLayout';
import { DashboardShell } from '../components/layout/DashboardShell';
import {
  ACCOUNTANT_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
  PARENT_NAV_ITEMS,
  TEACHER_NAV_ITEMS,
} from '../constants/navigation';
import type { UserRole } from '../types';

import { HomePage } from './page';
import { LoginPage } from './(auth)/LoginPage';
import {
  ManagingCommitteePage,
  MissionVisionPage,
  SchoolHistoryPage,
  StaffDirectoryPage,
  StarsOfInstitutionPage,
  StudentsInfoPage,
  TeachersDirectoryPage,
} from './about/AboutPages';
import {
  ChairmanMessagePage,
  CommitteeMemberProfilePage,
  HeadTeacherMessagePage,
  StaffProfileDetailPage,
  TeacherProfileDetailPage,
} from './about/LeadershipAndProfilesPages';
import {
  AcademicCalendarPage,
  AcademicGuidelinesPage,
  ClassRoutinePage,
  CurriculumPage,
  NoticeDetailPage,
  NoticesPage,
  PublicResultsPage,
  SchoolLibraryPage,
  SyllabusPage,
} from './academics/AcademicsPages';
import { ActivityDetailPage } from './activities/ActivitiesPages';
import { ClubDetailPage } from './clubs/ClubsPages';
import { PublicationPage } from './publications/PublicationsPages';
import {
  AdmissionFormPrintPage,
  CommunityForumPage,
  FeesInfoPage,
  MediaGalleryPage,
  OnlineAdmissionPage,
} from './others/OthersPages';
import {
  AdminOverviewPage,
  AdminStudentsHubPage,
  AdminTeachersStaffHubPage,
} from '../components/dashboard/AdminPeoplePages';
import { AdminWebsiteContentPage } from '../components/dashboard/AdminAcademicPages';
import { AdminRfidSmartPage } from '../components/dashboard/AdminRfidSmartPage';
import {
  AdminExamsAndResultsPage,
  AdminNoticesAndSmsPage,
  AdminSettingsHubPage,
} from '../components/dashboard/AdminOperationsPages';
import {
  AdminAcademicsHubPage,
  AdminAdmissionsAndInquiriesPage,
  AdminCommitteePage,
  AdminFeesAndPrintPage,
} from '../components/dashboard/AdminCommitteeAndHubPages';
import {
  TeacherAttendancePage,
  TeacherClassesPage,
  TeacherOverviewPage,
  TeacherResultEntryPage,
  TeacherRoutinePage,
} from '../components/dashboard/TeacherDashboardPages';
import { PortalProfilePage } from '../components/dashboard/PortalProfilePage';
import {
  ParentAcademicsPage,
  ParentAttendancePage,
  ParentChildProvider,
  ParentFeesPage,
  ParentNoticesPage,
  ParentOverviewPage,
  ParentResultsPage,
} from '../components/dashboard/ParentPortalPages';
import {
  AccountantDuesPage,
  AccountantFeeCollectionPage,
  AccountantLedgerPage,
  AccountantOverviewPage,
  AccountantReportsPage,
} from '../components/dashboard/AccountantPortalPages';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoleRoute({
  allowedRole,
  loginPath,
  children,
}: {
  allowedRole: UserRole;
  loginPath: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to={loginPath} replace />;
  }
  if (user.role !== allowedRole) {
    const fallback =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'teacher'
          ? '/teacher'
          : user.role === 'accountant'
            ? '/accountant'
            : '/parent';
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
}

function AdminShellRoute({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ProtectedRoleRoute allowedRole="admin" loginPath="/admin-login">
      <DashboardShell
        portalTitle="BUTPHS Admin Portal"
        portalSubtitle="প্রশাসনিক ড্যাশবোর্ড"
        navItems={ADMIN_NAV_ITEMS}
        pageTitle={title}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: title }]}
      >
        {children}
      </DashboardShell>
    </ProtectedRoleRoute>
  );
}

function TeacherShellRoute({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ProtectedRoleRoute allowedRole="teacher" loginPath="/teacher-login">
      <DashboardShell
        portalTitle="BUTPHS Teacher Portal"
        portalSubtitle="শিক্ষক পোর্টাল"
        navItems={TEACHER_NAV_ITEMS}
        pageTitle={title}
        breadcrumbs={[{ label: 'Teacher', href: '/teacher' }, { label: title }]}
      >
        {children}
      </DashboardShell>
    </ProtectedRoleRoute>
  );
}

function ParentShellRoute({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ProtectedRoleRoute allowedRole="parent" loginPath="/parent-login">
      <DashboardShell
        portalTitle="BUTPHS Parent Portal"
        portalSubtitle="অভিভাবক পোর্টাল"
        navItems={PARENT_NAV_ITEMS}
        pageTitle={title}
        breadcrumbs={[{ label: 'Parent', href: '/parent' }, { label: title }]}
      >
        <ParentChildProvider>{children}</ParentChildProvider>
      </DashboardShell>
    </ProtectedRoleRoute>
  );
}

function AccountantShellRoute({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ProtectedRoleRoute allowedRole="accountant" loginPath="/accountant-login">
      <DashboardShell
        portalTitle="BUTPHS Accounts Portal"
        portalSubtitle="হিসাবরক্ষক পোর্টাল"
        navItems={ACCOUNTANT_NAV_ITEMS}
        pageTitle={title}
        breadcrumbs={[{ label: 'Accountant', href: '/accountant' }, { label: title }]}
      >
        {children}
      </DashboardShell>
    </ProtectedRoleRoute>
  );
}

export function RootAppLayout() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchoolStoreProvider>
          <ScrollToTop />
          <ToastContainer />
          <Routes>
            {/* Public Homepage */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />

            {/* ABOUT Routes */}
            <Route path="/about/history" element={<PublicLayout><SchoolHistoryPage /></PublicLayout>} />
            <Route path="/about/chairman-message" element={<PublicLayout><ChairmanMessagePage /></PublicLayout>} />
            <Route path="/about/head-teacher-message" element={<PublicLayout><HeadTeacherMessagePage /></PublicLayout>} />
            <Route path="/about/management-committee" element={<PublicLayout><ManagingCommitteePage /></PublicLayout>} />
            <Route path="/about/management-committee/:id" element={<PublicLayout><CommitteeMemberProfilePage /></PublicLayout>} />
            <Route path="/about/teachers" element={<PublicLayout><TeachersDirectoryPage /></PublicLayout>} />
            <Route path="/about/teachers/:id" element={<PublicLayout><TeacherProfileDetailPage /></PublicLayout>} />
            <Route path="/about/staff" element={<PublicLayout><StaffDirectoryPage /></PublicLayout>} />
            <Route path="/about/staff/:id" element={<PublicLayout><StaffProfileDetailPage /></PublicLayout>} />
            <Route path="/about/students" element={<PublicLayout><StudentsInfoPage /></PublicLayout>} />
            <Route path="/about/stars" element={<PublicLayout><StarsOfInstitutionPage /></PublicLayout>} />
            <Route path="/about/mission-vision" element={<PublicLayout><MissionVisionPage /></PublicLayout>} />

            {/* ACADEMIC INFORMATION Routes */}
            <Route path="/academics/class-routine" element={<PublicLayout><ClassRoutinePage /></PublicLayout>} />
            <Route path="/academics/syllabus" element={<PublicLayout><SyllabusPage /></PublicLayout>} />
            <Route path="/academics/curriculum" element={<PublicLayout><CurriculumPage /></PublicLayout>} />
            <Route path="/academics/notices" element={<PublicLayout><NoticesPage /></PublicLayout>} />
            <Route path="/academics/notices/:id" element={<PublicLayout><NoticeDetailPage /></PublicLayout>} />
            <Route path="/notices" element={<PublicLayout><NoticesPage /></PublicLayout>} />
            <Route path="/academics/calendar" element={<PublicLayout><AcademicCalendarPage /></PublicLayout>} />
            <Route path="/academics/results" element={<PublicLayout><PublicResultsPage /></PublicLayout>} />
            <Route path="/results" element={<PublicLayout><PublicResultsPage /></PublicLayout>} />
            <Route path="/academics/library" element={<PublicLayout><SchoolLibraryPage /></PublicLayout>} />
            <Route path="/academics/guidelines" element={<PublicLayout><AcademicGuidelinesPage /></PublicLayout>} />

            {/* CURRICULAR ACTIVITIES Routes */}
            <Route path="/activities/sports" element={<PublicLayout><ActivityDetailPage activityKey="sports" /></PublicLayout>} />
            <Route path="/activities/cultural-programs" element={<PublicLayout><ActivityDetailPage activityKey="cultural-programs" /></PublicLayout>} />
            <Route path="/activities/scout" element={<PublicLayout><ActivityDetailPage activityKey="scout" /></PublicLayout>} />
            <Route path="/activities/girls-guide" element={<PublicLayout><ActivityDetailPage activityKey="girls-guide" /></PublicLayout>} />
            <Route path="/activities/educational-tours" element={<PublicLayout><ActivityDetailPage activityKey="educational-tours" /></PublicLayout>} />

            {/* CLUBS Routes */}
            <Route path="/clubs/sports" element={<PublicLayout><ClubDetailPage clubKey="sports" /></PublicLayout>} />
            <Route path="/clubs/debate-speech" element={<PublicLayout><ClubDetailPage clubKey="debate-speech" /></PublicLayout>} />
            <Route path="/clubs/cultural" element={<PublicLayout><ClubDetailPage clubKey="cultural" /></PublicLayout>} />

            {/* PUBLICATIONS Routes */}
            <Route path="/publications/school-magazine" element={<PublicLayout><PublicationPage pubKey="school-magazine" /></PublicLayout>} />
            <Route path="/publications/wall-magazine" element={<PublicLayout><PublicationPage pubKey="wall-magazine" /></PublicLayout>} />
            <Route path="/publications/journal" element={<PublicLayout><PublicationPage pubKey="journal" /></PublicLayout>} />

            {/* OTHERS Routes */}
            <Route path="/others/online-admission" element={<PublicLayout><OnlineAdmissionPage /></PublicLayout>} />
            <Route path="/others/admission-form" element={<PublicLayout><AdmissionFormPrintPage /></PublicLayout>} />
            <Route path="/others/fees" element={<PublicLayout><FeesInfoPage /></PublicLayout>} />
            <Route path="/others/media" element={<PublicLayout><MediaGalleryPage /></PublicLayout>} />
            <Route path="/others/community" element={<PublicLayout><CommunityForumPage /></PublicLayout>} />

            {/* AUTH Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<LoginPage lockedRole="admin" />} />
            <Route path="/teacher-login" element={<LoginPage lockedRole="teacher" />} />
            <Route path="/accountant-login" element={<LoginPage lockedRole="accountant" />} />
            <Route path="/parent-login" element={<LoginPage lockedRole="parent" />} />

            {/* ADMIN DASHBOARD Routes */}
            <Route path="/admin" element={<AdminShellRoute title="প্রশাসনিক ওভারভিউ"><AdminOverviewPage /></AdminShellRoute>} />
            <Route path="/admin/admissions" element={<AdminShellRoute title="নতুন ভর্তি ও অভিভাবক জিজ্ঞাসা"><AdminAdmissionsAndInquiriesPage defaultTab="admissions" /></AdminShellRoute>} />
            <Route path="/admin/inquiries" element={<AdminShellRoute title="নতুন ভর্তি ও অভিভাবক জিজ্ঞাসা"><AdminAdmissionsAndInquiriesPage defaultTab="inquiries" /></AdminShellRoute>} />
            <Route path="/admin/rfid" element={<AdminShellRoute title="RFID কার্ড ও লাইভ গেট টার্মিনাল"><AdminRfidSmartPage defaultTab="rfid" /></AdminShellRoute>} />
            <Route path="/admin/attendance" element={<AdminShellRoute title="দৈনিক শ্রেণি ও RFID হাজিরা"><AdminRfidSmartPage defaultTab="attendance" /></AdminShellRoute>} />
            <Route path="/admin/notices" element={<AdminShellRoute title="ডিজিটাল নোটিশ ব্যবস্থাপনা"><AdminNoticesAndSmsPage defaultTab="notices" /></AdminShellRoute>} />
            <Route path="/admin/sms" element={<AdminShellRoute title="SMS নোটিশ ও ডেলিভারি লগ"><AdminNoticesAndSmsPage defaultTab="sms" /></AdminShellRoute>} />
            <Route path="/admin/students" element={<AdminShellRoute title="শিক্ষার্থী ব্যবস্থাপনা"><AdminStudentsHubPage defaultTab="students" /></AdminShellRoute>} />
            <Route path="/admin/guardians" element={<AdminShellRoute title="অভিভাবক ব্যবস্থাপনা"><AdminStudentsHubPage defaultTab="guardians" /></AdminShellRoute>} />
            <Route path="/admin/teachers" element={<AdminShellRoute title="শিক্ষক ব্যবস্থাপনা"><AdminTeachersStaffHubPage defaultTab="teachers" /></AdminShellRoute>} />
            <Route path="/admin/staff" element={<AdminShellRoute title="কর্মকর্তা-কর্মচারী ব্যবস্থাপনা"><AdminTeachersStaffHubPage defaultTab="staff" /></AdminShellRoute>} />
            <Route path="/admin/committee" element={<AdminShellRoute title="ম্যানেজিং কমিটি ব্যবস্থাপনা"><AdminCommitteePage /></AdminShellRoute>} />
            <Route path="/admin/academics" element={<AdminShellRoute title="সিলেবাস, রুটিন ও একাডেমিক কারিকুলাম"><AdminAcademicsHubPage defaultTab="routine" /></AdminShellRoute>} />
            <Route path="/admin/syllabus" element={<AdminShellRoute title="সিলেবাস ও কারিকুলাম ব্যবস্থাপনা"><AdminAcademicsHubPage defaultTab="syllabus" /></AdminShellRoute>} />
            <Route path="/admin/results" element={<AdminShellRoute title="ফলাফল ব্যবস্থাপনা ও প্রকাশনা"><AdminExamsAndResultsPage defaultTab="results" /></AdminShellRoute>} />
            <Route path="/admin/exams" element={<AdminShellRoute title="পরীক্ষা ব্যবস্থাপনা ও সূচি"><AdminExamsAndResultsPage defaultTab="exams" /></AdminShellRoute>} />
            <Route path="/admin/website" element={<AdminShellRoute title="ওয়েবসাইট কনটেন্ট (CMS) ও গ্যালারি"><AdminWebsiteContentPage /></AdminShellRoute>} />
            <Route path="/admin/print" element={<AdminShellRoute title="একাডেমিক ডকুমেন্ট প্রিন্ট সেন্টার"><AdminFeesAndPrintPage defaultTab="print" /></AdminShellRoute>} />
            <Route path="/admin/fees" element={<AdminShellRoute title="বেতন-ফি ও A4 ডকুমেন্ট প্রিন্ট"><AdminFeesAndPrintPage defaultTab="fees" /></AdminShellRoute>} />
            <Route path="/admin/settings" element={<AdminShellRoute title="সিস্টেম সেটিংস ও নিরাপত্তা"><AdminSettingsHubPage defaultTab="settings" /></AdminShellRoute>} />
            <Route path="/admin/reports" element={<AdminShellRoute title="রিপোর্ট ও প্রাতিষ্ঠানিক বিশ্লেষণ"><AdminSettingsHubPage defaultTab="reports" /></AdminShellRoute>} />
            <Route path="/admin/audit-logs" element={<AdminShellRoute title="সিস্টেম অডিট লগ"><AdminSettingsHubPage defaultTab="audit" /></AdminShellRoute>} />
            <Route path="/admin/profile" element={<AdminShellRoute title="আমার প্রোফাইল ও ছবি"><PortalProfilePage /></AdminShellRoute>} />

            {/* TEACHER DASHBOARD Routes */}
            <Route path="/teacher" element={<TeacherShellRoute title="শিক্ষক ড্যাশবোর্ড"><TeacherOverviewPage /></TeacherShellRoute>} />
            <Route path="/teacher/classes" element={<TeacherShellRoute title="নির্ধারিত শ্রেণি ও শিক্ষার্থী"><TeacherClassesPage defaultTab="classes" /></TeacherShellRoute>} />
            <Route path="/teacher/students" element={<TeacherShellRoute title="নির্ধারিত শ্রেণি ও শিক্ষার্থী"><TeacherClassesPage defaultTab="students" /></TeacherShellRoute>} />
            <Route path="/teacher/attendance" element={<TeacherShellRoute title="দৈনিক শ্রেণি হাজিরা"><TeacherAttendancePage /></TeacherShellRoute>} />
            <Route path="/teacher/results" element={<TeacherShellRoute title="নম্বর এন্ট্রি (খসড়া)"><TeacherResultEntryPage /></TeacherShellRoute>} />
            <Route path="/teacher/routine" element={<TeacherShellRoute title="ক্লাস রুটিন, নোট ও একাডেমিকস"><TeacherRoutinePage defaultTab="routine" /></TeacherShellRoute>} />
            <Route path="/teacher/academics" element={<TeacherShellRoute title="ক্লাস রুটিন, নোট ও একাডেমিকস"><TeacherRoutinePage defaultTab="academics" /></TeacherShellRoute>} />
            <Route path="/teacher/profile" element={<TeacherShellRoute title="আমার প্রোফাইল ও ছবি"><PortalProfilePage /></TeacherShellRoute>} />

            {/* PARENT PORTAL Routes */}
            <Route path="/parent" element={<ParentShellRoute title="শিক্ষার্থী প্রোফাইল ও ওভারভিউ"><ParentOverviewPage /></ParentShellRoute>} />
            <Route path="/parent/attendance" element={<ParentShellRoute title="উপস্থিতি ও RFID গেট লগ"><ParentAttendancePage /></ParentShellRoute>} />
            <Route path="/parent/results" element={<ParentShellRoute title="প্রকাশিত ফলাফল ও মার্কশিট"><ParentResultsPage /></ParentShellRoute>} />
            <Route path="/parent/academics" element={<ParentShellRoute title="রুটিন, ক্লাস নোট ও সিলেবাস"><ParentAcademicsPage defaultTab="routine" /></ParentShellRoute>} />
            <Route path="/parent/routine" element={<ParentShellRoute title="রুটিন, ক্লাস নোট ও সিলেবাস"><ParentAcademicsPage defaultTab="routine" /></ParentShellRoute>} />
            <Route path="/parent/fees" element={<ParentShellRoute title="বেতন ও ফি পরিশোধ"><ParentFeesPage /></ParentShellRoute>} />
            <Route path="/parent/notices" element={<ParentShellRoute title="বিজ্ঞপ্তি, SMS ও হেল্পডেস্ক"><ParentNoticesPage /></ParentShellRoute>} />
            <Route path="/parent/profile" element={<ParentShellRoute title="আমার প্রোফাইল ও ছবি"><PortalProfilePage /></ParentShellRoute>} />

            {/* ACCOUNTANT PORTAL Routes */}
            <Route path="/accountant" element={<AccountantShellRoute title="আর্থিক ওভারভিউ ও বিশ্লেষণ"><AccountantOverviewPage /></AccountantShellRoute>} />
            <Route path="/accountant/fees" element={<AccountantShellRoute title="বেতন-ফি আদায় ও রসিদ"><AccountantFeeCollectionPage /></AccountantShellRoute>} />
            <Route path="/accountant/dues" element={<AccountantShellRoute title="বকেয়া তালিকা ও রিমাইন্ডার"><AccountantDuesPage /></AccountantShellRoute>} />
            <Route path="/accountant/ledger" element={<AccountantShellRoute title="আয়-ব্যয় ও ভাউচার খাতা"><AccountantLedgerPage /></AccountantShellRoute>} />
            <Route path="/accountant/reports" element={<AccountantShellRoute title="আর্থিক প্রতিবেদন (A4 প্রিন্ট)"><AccountantReportsPage /></AccountantShellRoute>} />
            <Route path="/accountant/profile" element={<AccountantShellRoute title="আমার প্রোফাইল ও ছবি"><PortalProfilePage /></AccountantShellRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SchoolStoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
