import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Armchair,
  Award,
  BarChart3,
  Bookmark,
  BookOpenCheck,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  FileOutput,
  FileSpreadsheet,
  FileText,
  FileWarning,
  Filter,
  GraduationCap,
  Grid3x3,
  Layers,
  LayoutGrid,
  ListOrdered,
  Printer,
  Receipt,
  ScrollText,
  Search,
  Settings2,
  SlidersHorizontal,
  Square,
  Table2,
  Ticket,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  UserSquare2,
  Users,
  Wallet,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { CLASS_LIST, SECTION_LIST } from '../../constants/navigation';
import { useSchoolStore } from '../../store/SchoolStore';
import {
  allocateExamSeats,
  BANGLA_MONTHS,
  buildMonthlyAttendanceMatrix,
  DEFAULT_PRINT_SETTINGS,
  deletePrintPreset,
  filterStudentsForPrint,
  getDocumentMeta,
  getExamByIdOrFirst,
  loadSavedPrintPresets,
  PRINT_CATEGORIES,
  PRINT_DOCUMENT_CATALOG,
  savePrintPreset,
  validatePrintRequest,
  type PrintDisplaySettings,
  type PrintDocumentCategory,
  type PrintDocumentTypeId,
  type PrintFilterState,
  type SavedPrintPreset,
} from '../../services/printDocumentService';
import { toBanglaNumber } from '../../utils/grading';
import {
  downloadElementAsPrintableHtml,
  printElementById,
  type PrintOrientation,
  type PrintPaperSize,
} from '../../utils/printDocument';
import type { PrintRenderContext } from './PrintSharedElements';
import {
  AcademicTranscriptDocument,
  StudentDirectoryDocument,
  StudentIdCardDocument,
  StudentProfileDocument,
  TestimonialDocument,
  TransferCertificateDocument,
} from './templates/StudentDocumentTemplates';
import {
  AdmitCardDocument,
  ClassResultSheetDocument,
  ExamSeatCardDocument,
  ExamSeatPlanDocument,
  IndividualResultSheetDocument,
  MeritListDocument,
  ProgressReportDocument,
  ResultSummaryDocument,
  SubjectResultDocument,
  TabulationSheetDocument,
} from './templates/ExamDocumentTemplates';
import {
  AttendanceSummaryDocument,
  DailyAttendanceDocument,
  FeeDueListDocument,
  FeeReceiptDocument,
  IndividualAttendanceDocument,
  MonthlyAttendanceMatrixDocument,
  TeacherAttendanceDocument,
} from './templates/AttendanceAndFinanceTemplates';

const PRINT_CANVAS_ID = 'butphs-print-center-canvas';

const CATEGORY_ICONS: Record<PrintDocumentCategory, LucideIcon> = {
  student: GraduationCap,
  examination: FileSpreadsheet,
  attendance: Users,
  financial: Wallet,
};

const DOC_ICON_MAP: Record<PrintDocumentTypeId, LucideIcon> = {
  'student-id-card': CreditCard,
  'student-profile': UserSquare2,
  'academic-transcript': ScrollText,
  testimonial: Award,
  'transfer-certificate': FileOutput,
  'student-list': ListOrdered,
  'admit-card': Ticket,
  'exam-seat-card': LayoutGrid,
  'exam-seat-plan': Armchair,
  'individual-result': FileSpreadsheet,
  'progress-report': TrendingUp,
  'class-result': Table2,
  'tabulation-sheet': Grid3x3,
  'merit-list': Trophy,
  'result-summary': BarChart3,
  'subject-result': BookOpenCheck,
  'monthly-attendance': CalendarDays,
  'daily-attendance': CalendarCheck,
  'student-attendance': UserCheck,
  'attendance-summary': ClipboardList,
  'teacher-attendance': Briefcase,
  'fee-receipt': Receipt,
  'fee-due-list': FileWarning,
};

type ZoomMode = 'fit' | 0.65 | 0.8 | 1 | 1.15;

export function PrintManagementCenter() {
  const { db, addToast } = useSchoolStore();

  // 1. Document Selection State
  const [activeCategory, setActiveCategory] = useState<PrintDocumentCategory>('examination');
  const [docType, setDocType] = useState<PrintDocumentTypeId>('individual-result');
  const [catalogSearch, setCatalogSearch] = useState('');

  const activeMeta = useMemo(() => getDocumentMeta(docType), [docType]);

  // Extract distinct subjects from available results for Subject-wise Report
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const r of db.results) {
      for (const m of r.marks) {
        set.add(m.subjectName);
      }
    }
    if (set.size === 0) {
      set.add('বাংলা (Bangla)');
      set.add('ইংরেজি (English)');
      set.add('গণিত (Mathematics)');
    }
    return Array.from(set);
  }, [db.results]);

  // Pick exam with highest number of recorded results so initial result sheets are immediately populated
  const defaultExamId = useMemo(() => {
    if (db.exams.length === 0) return '';
    let bestId = db.exams[0].id;
    let bestCount = -1;
    for (const ex of db.exams) {
      const cnt = db.results.filter((r) => r.examId === ex.id).length;
      if (cnt > bestCount) {
        bestCount = cnt;
        bestId = ex.id;
      }
    }
    return bestId;
  }, [db.exams, db.results]);

  // 2. Context-Aware Filter State
  const [filters, setFilters] = useState<PrintFilterState>({
    session: db.websiteContent.academicSession || '2026',
    className: 'All',
    section: 'All',
    examId: defaultExamId,
    subjectName: availableSubjects[0] || 'গণিত (Mathematics)',
    month: 11,
    year: 2026,
    date: '2026-11-19',
    attendanceStatus: 'All',
    searchQuery: '',
    seatRoomName: 'Room 101 — Academic Wing',
    seatRoomCapacity: 30,
    seatColumns: 3,
    seatsPerBench: 2,
    seatStrategy: 'alternating',
  });

  // 3. Student Selection State
  const filteredStudents = useMemo(
    () => filterStudentsForPrint(db.students, filters),
    [db.students, filters]
  );

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() =>
    db.students.map((s) => s.studentId)
  );
  const [pickerExpanded, setPickerExpanded] = useState(false);

  // Sync selected students cleanly when filter changes so selection never holds stale IDs
  useEffect(() => {
    const validSet = new Set(filteredStudents.map((s) => s.studentId));
    setSelectedStudentIds((prev) => {
      const stillValid = prev.filter((id) => validSet.has(id));
      if (stillValid.length > 0) return stillValid;
      return filteredStudents.map((s) => s.studentId);
    });
  }, [filteredStudents]);

  const selectedStudents = useMemo(() => {
    const set = new Set(selectedStudentIds);
    return filteredStudents.filter((s) => set.has(s.studentId));
  }, [filteredStudents, selectedStudentIds]);

  // 4. Print Display Settings & Saved Presets
  const [settings, setSettings] = useState<PrintDisplaySettings>({
    ...DEFAULT_PRINT_SETTINGS,
    orientation: activeMeta.defaultOrientation,
    paperSize: activeMeta.defaultPaperSize,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [presets, setPresets] = useState<SavedPrintPreset[]>(() => loadSavedPrintPresets());
  const [presetNameDraft, setPresetNameDraft] = useState('');

  // Auto-align paper orientation when user picks a different document type
  const handleSelectDocument = (nextDocId: PrintDocumentTypeId) => {
    const nextMeta = getDocumentMeta(nextDocId);
    setDocType(nextDocId);
    setActiveCategory(nextMeta.category);
    setSettings((prev) => ({
      ...prev,
      orientation: nextMeta.defaultOrientation,
      paperSize: nextMeta.defaultPaperSize,
    }));
    setCurrentPage(1);
  };

  // 5. Derived Academic Data for Active Document
  const activeExam = useMemo(
    () => getExamByIdOrFirst(db.exams, filters.examId),
    [db.exams, filters.examId]
  );

  const selectedIdSet = useMemo(
    () => new Set(selectedStudents.map((s) => s.studentId)),
    [selectedStudents]
  );

  const examResultsAll = useMemo(() => {
    if (!activeExam) return db.results;
    const exact = db.results.filter((r) => r.examId === activeExam.id);
    return exact.length > 0 ? exact : db.results;
  }, [db.results, activeExam]);

  const resultsForSelection = useMemo(() => {
    if (!activeMeta.needsStudentSelection) return examResultsAll;
    return examResultsAll.filter((r) => selectedIdSet.has(r.studentId));
  }, [examResultsAll, selectedIdSet, activeMeta.needsStudentSelection]);

  const monthlyAttendanceMatrix = useMemo(
    () =>
      buildMonthlyAttendanceMatrix(
        selectedStudents,
        db.attendance,
        filters.year,
        filters.month,
        { fillDemoWorkingDays: true }
      ),
    [selectedStudents, db.attendance, filters.year, filters.month]
  );

  const seatAllocation = useMemo(
    () =>
      allocateExamSeats(selectedStudents, {
        roomName: filters.seatRoomName,
        capacity: filters.seatRoomCapacity,
        columns: filters.seatColumns,
        seatsPerBench: filters.seatsPerBench,
        strategy: filters.seatStrategy,
      }),
    [
      selectedStudents,
      filters.seatRoomName,
      filters.seatRoomCapacity,
      filters.seatColumns,
      filters.seatsPerBench,
      filters.seatStrategy,
    ]
  );

  const validationIssues = useMemo(
    () =>
      validatePrintRequest(
        docType,
        filters,
        selectedStudents,
        resultsForSelection,
        docType === 'exam-seat-plan' || docType === 'exam-seat-card' ? seatAllocation : undefined
      ),
    [docType, filters, selectedStudents, resultsForSelection, seatAllocation]
  );

  const hasBlockingError = validationIssues.some((v) => v.level === 'error');

  // 6. Render Context
  const renderCtx: PrintRenderContext = useMemo(
    () => ({
      settings,
      headTeacherName: db.websiteContent.headTeacherName || 'মোঃ আব্দুর রাজ্জাক',
      schoolAddressBn: db.websiteContent.addressBn || SCHOOL_INFO.addressBn,
      schoolPhone: db.websiteContent.contactPhone || SCHOOL_INFO.contactPlaceholders.officePhone,
      schoolEmail: db.websiteContent.contactEmail || SCHOOL_INFO.contactPlaceholders.email,
      issueDate: new Date().toISOString().slice(0, 10),
    }),
    [settings, db.websiteContent]
  );

  // 7. Preview Stage Zoom, Responsive Auto-Fit & Page Tracking
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
  const [stageWidth, setStageWidth] = useState(960);
  const [canvasHeight, setCanvasHeight] = useState(1123);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 100) setStageWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const updateMetrics = () => {
      setCanvasHeight(el.scrollHeight || 1123);
      const pages = el.querySelectorAll('[data-doc-page]').length;
      setPageCount(Math.max(1, pages));
      setCurrentPage((prev) => Math.min(prev, Math.max(1, pages)));
    };
    updateMetrics();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(updateMetrics);
    ro.observe(el);
    return () => ro.disconnect();
  }, [docType, selectedStudents, settings, filters]);

  const sheetNaturalWidthPx = settings.orientation === 'landscape' ? 1123 : 794;
  const effectiveScale = useMemo(() => {
    if (zoomMode === 'fit') {
      const available = Math.max(260, stageWidth - 36);
      return Math.min(1, Math.max(0.32, available / sheetNaturalWidthPx));
    }
    return zoomMode;
  }, [zoomMode, stageWidth, sheetNaturalWidthPx]);

  const jumpToPage = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(pageCount, nextPage));
    setCurrentPage(clamped);
    const target = canvasRef.current?.querySelector<HTMLElement>(`[data-doc-page="${clamped}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 8. Print & Download Actions
  const handlePrint = () => {
    if (hasBlockingError) {
      addToast('error', validationIssues[0]?.messageBn || 'প্রিন্টের জন্য আবশ্যক তথ্য নির্বাচন করুন');
      return;
    }
    setIsPrinting(true);
    const title = `${SCHOOL_INFO.shortName} — ${activeMeta.titleEn} (${activeMeta.titleBn})`;
    printElementById(PRINT_CANVAS_ID, title, {
      paperSize: settings.paperSize,
      orientation: settings.orientation,
      marginMm: settings.marginMm,
      copies: settings.copies,
    });
    addToast('success', `${activeMeta.titleBn} প্রিন্ট ডায়ালগ প্রস্তুত হয়েছে`);
    window.setTimeout(() => setIsPrinting(false), 700);
  };

  const handleDownloadHtml = () => {
    if (hasBlockingError) {
      addToast('error', validationIssues[0]?.messageBn || 'ডাউনলোডের জন্য আবশ্যক তথ্য নির্বাচন করুন');
      return;
    }
    const slug = `${SCHOOL_INFO.shortName.toLowerCase()}-${docType}-${new Date().toISOString().slice(0, 10)}`;
    const ok = downloadElementAsPrintableHtml(
      PRINT_CANVAS_ID,
      `${slug}.html`,
      `${SCHOOL_INFO.nameEn} — ${activeMeta.titleEn}`,
      {
        paperSize: settings.paperSize,
        orientation: settings.orientation,
        marginMm: settings.marginMm,
        copies: settings.copies,
      }
    );
    if (ok) {
      addToast('success', 'প্রিন্ট-রেডি ডকুমেন্ট ফাইল ডাউনলোড হয়েছে (যেকোনো ব্রাউজারে খুলে PDF সংরক্ষণ করুন)');
    }
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = presetNameDraft.trim();
    if (!trimmed) return;
    const updated = savePrintPreset({
      name: trimmed,
      docType,
      settings,
    });
    setPresets(updated);
    setPresetNameDraft('');
    addToast('success', `"${trimmed}" প্রিন্ট প্রিসেট সংরক্ষিত হয়েছে`);
  };

  const handleApplyPreset = (preset: SavedPrintPreset) => {
    const meta = getDocumentMeta(preset.docType);
    setDocType(preset.docType);
    setActiveCategory(meta.category);
    setSettings(preset.settings);
    addToast('info', `"${preset.name}" প্রিসেট প্রয়োগ করা হয়েছে`);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(deletePrintPreset(id));
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  // Filtered Document Catalog
  const visibleCatalogDocs = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return PRINT_DOCUMENT_CATALOG.filter((doc) => {
      if (q) {
        return (
          doc.titleEn.toLowerCase().includes(q) ||
          doc.titleBn.toLowerCase().includes(q) ||
          doc.shortDescBn.toLowerCase().includes(q)
        );
      }
      return doc.category === activeCategory;
    });
  }, [activeCategory, catalogSearch]);

  const classLabel = filters.className === 'All' ? 'সকল শ্রেণি (All Classes)' : filters.className;
  const sectionLabel = filters.section === 'All' ? 'সকল শাখা' : filters.section;
  const activeMonthMeta = BANGLA_MONTHS.find((m) => m.value === filters.month) || BANGLA_MONTHS[10];

  // 9. Document Renderer Switch (All 23 Purpose-Built Templates)
  const renderActiveDocument = () => {
    if (hasBlockingError) {
      return (
        <div className="w-[210mm] min-h-[160mm] mx-auto bg-white border border-slate-300 rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="w-10 h-10 text-amber-600 mb-3" />
          <h3 className="text-base font-semibold text-[#1B2A6B]">
            প্রিভিউ প্রদর্শনের জন্য নির্বাচন অসম্পূর্ণ
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-md">
            {validationIssues[0]?.messageBn}
          </p>
        </div>
      );
    }

    switch (docType) {
      case 'student-id-card':
        return <StudentIdCardDocument students={selectedStudents} ctx={renderCtx} />;
      case 'student-profile':
        return (
          <StudentProfileDocument
            students={selectedStudents}
            results={db.results}
            attendanceMatrix={monthlyAttendanceMatrix}
            ctx={renderCtx}
          />
        );
      case 'academic-transcript':
        return (
          <AcademicTranscriptDocument
            students={selectedStudents}
            results={resultsForSelection}
            exam={activeExam}
            ctx={renderCtx}
          />
        );
      case 'testimonial':
        return (
          <TestimonialDocument
            students={selectedStudents}
            results={resultsForSelection}
            exam={activeExam}
            ctx={renderCtx}
          />
        );
      case 'transfer-certificate':
        return <TransferCertificateDocument students={selectedStudents} ctx={renderCtx} />;
      case 'student-list':
        return (
          <StudentDirectoryDocument
            students={selectedStudents}
            classLabel={classLabel}
            sectionLabel={sectionLabel}
            session={filters.session}
            ctx={renderCtx}
          />
        );
      case 'admit-card':
        return <AdmitCardDocument students={selectedStudents} exam={activeExam} ctx={renderCtx} />;
      case 'exam-seat-card':
        return (
          <ExamSeatCardDocument
            allocation={seatAllocation}
            exam={activeExam}
            ctx={renderCtx}
          />
        );
      case 'exam-seat-plan':
        return (
          <ExamSeatPlanDocument
            allocation={seatAllocation}
            exam={activeExam}
            date={filters.date}
            ctx={renderCtx}
          />
        );
      case 'individual-result':
        return (
          <IndividualResultSheetDocument
            students={selectedStudents}
            results={resultsForSelection}
            allClassResults={examResultsAll}
            exam={activeExam}
            attendanceMatrix={monthlyAttendanceMatrix}
            ctx={renderCtx}
          />
        );
      case 'progress-report':
        return (
          <ProgressReportDocument
            students={selectedStudents}
            allResults={db.results}
            exams={db.exams}
            attendanceMatrix={monthlyAttendanceMatrix}
            ctx={renderCtx}
          />
        );
      case 'class-result':
        return (
          <ClassResultSheetDocument
            results={resultsForSelection}
            exam={activeExam}
            classLabel={classLabel}
            sectionLabel={sectionLabel}
            ctx={renderCtx}
          />
        );
      case 'tabulation-sheet':
        return (
          <TabulationSheetDocument
            results={resultsForSelection}
            exam={activeExam}
            classLabel={classLabel}
            ctx={renderCtx}
          />
        );
      case 'merit-list':
        return (
          <MeritListDocument
            results={resultsForSelection}
            exam={activeExam}
            classLabel={classLabel}
            ctx={renderCtx}
          />
        );
      case 'result-summary':
        return (
          <ResultSummaryDocument
            students={db.students}
            results={db.results}
            exam={activeExam}
            ctx={renderCtx}
          />
        );
      case 'subject-result':
        return (
          <SubjectResultDocument
            results={resultsForSelection}
            subjectName={filters.subjectName}
            exam={activeExam}
            ctx={renderCtx}
          />
        );
      case 'monthly-attendance':
        return (
          <MonthlyAttendanceMatrixDocument
            matrix={monthlyAttendanceMatrix}
            classLabel={classLabel}
            sectionLabel={sectionLabel}
            ctx={renderCtx}
          />
        );
      case 'daily-attendance':
        return (
          <DailyAttendanceDocument
            students={selectedStudents}
            attendanceRecords={db.attendance}
            date={filters.date}
            statusFilter={filters.attendanceStatus}
            classLabel={classLabel}
            ctx={renderCtx}
          />
        );
      case 'student-attendance':
        return <IndividualAttendanceDocument matrix={monthlyAttendanceMatrix} ctx={renderCtx} />;
      case 'attendance-summary':
        return (
          <AttendanceSummaryDocument
            students={db.students}
            attendanceRecords={db.attendance}
            year={filters.year}
            month={filters.month}
            monthLabelBn={activeMonthMeta.labelBn}
            monthLabelEn={activeMonthMeta.labelEn}
            ctx={renderCtx}
          />
        );
      case 'teacher-attendance':
        return (
          <TeacherAttendanceDocument
            teachers={db.teachers}
            staff={db.staff}
            year={filters.year}
            month={filters.month}
            monthLabelBn={activeMonthMeta.labelBn}
            monthLabelEn={activeMonthMeta.labelEn}
            ctx={renderCtx}
          />
        );
      case 'fee-receipt':
        return <FeeReceiptDocument students={selectedStudents} fees={db.fees} ctx={renderCtx} />;
      case 'fee-due-list':
        return (
          <FeeDueListDocument
            students={selectedStudents}
            fees={db.fees}
            classLabel={classLabel}
            sectionLabel={sectionLabel}
            ctx={renderCtx}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 font-bn">
      {/* 1. CENTRALIZED DOCUMENT CATALOG HEADER */}
      <section className="no-print bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#1B2A6B] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1F7A4D]" />
              <span>একাডেমিক ডকুমেন্ট প্রিন্ট ম্যানেজমেন্ট সেন্টার</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ২৩টি প্রাতিষ্ঠানিক ডকুমেন্ট · একক ও শ্রেণিভিত্তিক বাল্ক প্রিন্ট, কক্ষ আসন বিন্যাস এবং A4 Portrait/Landscape প্রিভিউ।
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="search"
              aria-label="ডকুমেন্ট খুঁজুন"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="ডকুমেন্টের নাম খুঁজুন (যেমন: Merit, Seat, ID)..."
              className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm border border-slate-300 rounded-lg bg-[#F7F8FC] focus:bg-white focus:outline-none focus:border-[#1B2A6B]"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="ডকুমেন্ট বিভাগ"
          className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3"
        >
          {PRINT_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const count = PRINT_DOCUMENT_CATALOG.filter((d) => d.category === cat.id).length;
            const active = !catalogSearch.trim() && activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setCatalogSearch('');
                  setActiveCategory(cat.id);
                  const firstInCat = PRINT_DOCUMENT_CATALOG.find((d) => d.category === cat.id);
                  if (firstInCat && activeMeta.category !== cat.id) {
                    handleSelectDocument(firstInCat.id);
                  }
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-[#F7F8FC] hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{cat.labelBn}</span>
                <span
                  className={`text-[11px] tabular-nums ${
                    active ? 'text-[#E6CE8A]' : 'text-slate-400'
                  }`}
                >
                  ({toBanglaNumber(count)})
                </span>
              </button>
            );
          })}
        </div>

        {/* Document Type Selector Grid — Dedicated Icon Per Document */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {visibleCatalogDocs.map((doc) => {
            const selected = doc.id === docType;
            const DocIcon = DOC_ICON_MAP[doc.id] || FileText;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelectDocument(doc.id)}
                className={`group text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selected
                    ? 'bg-emerald-50/55 border-[#1F7A4D] ring-1 ring-[#1F7A4D] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-[#1B2A6B]/45 hover:bg-[#F7F8FC]/80'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      selected
                        ? 'bg-[#1F7A4D] text-white'
                        : 'bg-[#1B2A6B]/8 text-[#1B2A6B] group-hover:bg-[#1B2A6B] group-hover:text-white'
                    }`}
                  >
                    <DocIcon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <span
                        className={`text-xs font-semibold leading-snug line-clamp-2 ${
                          selected ? 'text-[#1F7A4D]' : 'text-[#1B2A6B]'
                        }`}
                      >
                        {doc.titleBn}
                      </span>
                      {selected && (
                        <Check className="w-3.5 h-3.5 text-[#1F7A4D] shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans truncate mt-0.5">
                      {doc.titleEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                  <span className="font-medium">
                    {doc.defaultOrientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'}
                  </span>
                  <span className={selected ? 'text-[#1F7A4D] font-medium' : 'text-slate-400'}>
                    {doc.supportsBulkStudents ? 'বাল্ক ও একক' : 'সামারি / লেজার'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. CONTEXT-AWARE FILTER BAR + BULK SELECTION + SETTINGS */}
      <section className="no-print bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1B2A6B]">
            <Filter className="w-4 h-4 text-[#1F7A4D]" />
            <span>ডকুমেন্ট ফিল্টার ও তথ্য নির্বাচন</span>
            <span className="text-slate-400 font-normal">· {activeMeta.titleEn}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeMeta.needsStudentSelection && (
              <button
                type="button"
                onClick={() => setPickerExpanded((p) => !p)}
                aria-expanded={pickerExpanded}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-[#F7F8FC] text-[#1B2A6B] hover:border-[#1B2A6B] cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#1F7A4D]" />
                <span>
                  নির্বাচিত শিক্ষার্থী: {toBanglaNumber(selectedStudents.length)}/
                  {toBanglaNumber(filteredStudents.length)}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSettingsOpen((p) => !p)}
              aria-expanded={settingsOpen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                settingsOpen
                  ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>পেজ সেটিংস ও প্রিসেট</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* Session */}
          <div>
            <label htmlFor="pf-session" className="block text-[11px] font-medium text-slate-600 mb-1">
              শিক্ষাবর্ষ (Session)
            </label>
            <select
              id="pf-session"
              value={filters.session}
              onChange={(e) => setFilters({ ...filters, session: e.target.value })}
              className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="2026">২০২৬ (2026)</option>
              <option value="All">সকল শিক্ষাবর্ষ</option>
            </select>
          </div>

          {/* Class & Section (for student-scoped documents) */}
          {!activeMeta.isTeacherDoc && (
            <>
              <div>
                <label htmlFor="pf-class" className="block text-[11px] font-medium text-slate-600 mb-1">
                  শ্রেণি (Class)
                </label>
                <select
                  id="pf-class"
                  value={filters.className}
                  onChange={(e) => setFilters({ ...filters, className: e.target.value })}
                  className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="All">সকল শ্রেণি (All)</option>
                  {CLASS_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pf-section" className="block text-[11px] font-medium text-slate-600 mb-1">
                  শাখা (Section)
                </label>
                <select
                  id="pf-section"
                  value={filters.section}
                  onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                  className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="All">সকল শাখা (All)</option>
                  {SECTION_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Exam Selector */}
          {activeMeta.needsExam && (
            <div>
              <label htmlFor="pf-exam" className="block text-[11px] font-medium text-slate-600 mb-1">
                পরীক্ষা (Examination)
              </label>
              <select
                id="pf-exam"
                value={filters.examId}
                onChange={(e) => setFilters({ ...filters, examId: e.target.value })}
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
              >
                {db.exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.nameBn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Selector */}
          {activeMeta.needsSubject && (
            <div>
              <label htmlFor="pf-subject" className="block text-[11px] font-medium text-slate-600 mb-1">
                বিষয় (Subject)
              </label>
              <select
                id="pf-subject"
                value={filters.subjectName}
                onChange={(e) => setFilters({ ...filters, subjectName: e.target.value })}
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Month & Year */}
          {activeMeta.needsMonthYear && (
            <>
              <div>
                <label htmlFor="pf-month" className="block text-[11px] font-medium text-slate-600 mb-1">
                  মাস (Month)
                </label>
                <select
                  id="pf-month"
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
                  className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {BANGLA_MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.labelBn} ({m.labelEn})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pf-year" className="block text-[11px] font-medium text-slate-600 mb-1">
                  বছর (Year)
                </label>
                <select
                  id="pf-year"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
                  className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white tabular-nums"
                >
                  <option value={2026}>২০২৬ (2026)</option>
                  <option value={2025}>২০২৫ (2025)</option>
                </select>
              </div>
            </>
          )}

          {/* Specific Date */}
          {activeMeta.needsDate && (
            <div>
              <label htmlFor="pf-date" className="block text-[11px] font-medium text-slate-600 mb-1">
                তারিখ (Date)
              </label>
              <input
                id="pf-date"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white tabular-nums"
              />
            </div>
          )}

          {/* Attendance Status */}
          {activeMeta.needsAttendanceStatus && (
            <div>
              <label htmlFor="pf-att-status" className="block text-[11px] font-medium text-slate-600 mb-1">
                হাজিরার অবস্থা
              </label>
              <select
                id="pf-att-status"
                value={filters.attendanceStatus}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    attendanceStatus: e.target.value as PrintFilterState['attendanceStatus'],
                  })
                }
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="All">সকল অবস্থা</option>
                <option value="Present">উপস্থিত (Present)</option>
                <option value="Late">বিলম্ব (Late)</option>
                <option value="Absent">অনুপস্থিত (Absent)</option>
              </select>
            </div>
          )}

          {/* Student Quick Search */}
          {activeMeta.needsStudentSelection && (
            <div>
              <label htmlFor="pf-search" className="block text-[11px] font-medium text-slate-600 mb-1">
                শিক্ষার্থী খুঁজুন (নাম / আইডি / রোল)
              </label>
              <input
                id="pf-search"
                type="search"
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                placeholder="যেমন: 2026-10 বা রাফিউল..."
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
              />
            </div>
          )}
        </div>

        {/* Exam Room Seat Plan Configurator */}
        {activeMeta.needsRoomConfig && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#F7F8FC] p-3.5 rounded-lg border border-slate-200/80">
            <div>
              <label htmlFor="pf-room" className="block text-[11px] font-medium text-[#1B2A6B] mb-1">
                পরীক্ষার কক্ষের নাম (Room)
              </label>
              <input
                id="pf-room"
                value={filters.seatRoomName}
                onChange={(e) => setFilters({ ...filters, seatRoomName: e.target.value })}
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label htmlFor="pf-cap" className="block text-[11px] font-medium text-[#1B2A6B] mb-1">
                কক্ষের ধারণক্ষমতা (Capacity)
              </label>
              <input
                id="pf-cap"
                type="number"
                min={1}
                max={120}
                value={filters.seatRoomCapacity}
                onChange={(e) =>
                  setFilters({ ...filters, seatRoomCapacity: Math.max(1, Number(e.target.value) || 1) })
                }
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="pf-cols" className="block text-[11px] font-medium text-[#1B2A6B] mb-1">
                বেঞ্চের সারি (Columns)
              </label>
              <select
                id="pf-cols"
                value={filters.seatColumns}
                onChange={(e) => setFilters({ ...filters, seatColumns: Number(e.target.value) })}
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value={2}>২ কলাম (2 Columns)</option>
                <option value={3}>৩ কলাম (3 Columns)</option>
                <option value={4}>৪ কলাম (4 Columns)</option>
              </select>
            </div>
            <div>
              <label htmlFor="pf-spb" className="block text-[11px] font-medium text-[#1B2A6B] mb-1">
                প্রতি বেঞ্চে আসন
              </label>
              <select
                id="pf-spb"
                value={filters.seatsPerBench}
                onChange={(e) =>
                  setFilters({ ...filters, seatsPerBench: Number(e.target.value) as 1 | 2 })
                }
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value={2}>২ জন (বাম ও ডান)</option>
                <option value={1}>১ জন (একক বেঞ্চ)</option>
              </select>
            </div>
            <div>
              <label htmlFor="pf-strat" className="block text-[11px] font-medium text-[#1B2A6B] mb-1">
                আসন বিন্যাস কৌশল
              </label>
              <select
                id="pf-strat"
                value={filters.seatStrategy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    seatStrategy: e.target.value as 'sequential' | 'alternating',
                  })
                }
                className="w-full h-9 px-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="alternating">মিশ্র / বিকল্প শ্রেণি (Anti-Copy)</option>
                <option value="sequential">ক্রমিক রোল অনুযায়ী (Sequential)</option>
              </select>
            </div>
          </div>
        )}

        {/* Collapsible Multi-Select Student Picker */}
        {activeMeta.needsStudentSelection && pickerExpanded && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-[#F7F8FC] px-3.5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#1B2A6B]">
                বাল্ক বা ব্যক্তিগত প্রিন্টের জন্য শিক্ষার্থী নির্বাচন ({toBanglaNumber(selectedStudents.length)} জন নির্বাচিত)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds(filteredStudents.map((s) => s.studentId))}
                  className="px-2.5 py-1 text-[11px] font-medium text-[#1F7A4D] bg-white border border-slate-300 rounded hover:border-[#1F7A4D] cursor-pointer"
                >
                  সব নির্বাচন ({toBanglaNumber(filteredStudents.length)})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedStudentIds(
                      filteredStudents[0] ? [filteredStudents[0].studentId] : []
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-medium text-[#1B2A6B] bg-white border border-slate-300 rounded hover:border-[#1B2A6B] cursor-pointer"
                >
                  শুধু ১ম শিক্ষার্থী
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-300 rounded hover:text-red-700 cursor-pointer"
                >
                  নির্বাচন মুছুন
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 bg-white">
              {filteredStudents.map((stu) => {
                const checked = selectedIdSet.has(stu.studentId);
                return (
                  <label
                    key={stu.id}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                      checked ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudentSelection(stu.studentId)}
                        className="sr-only"
                      />
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-[#1F7A4D] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-semibold text-[#1B2A6B] truncate">{stu.nameBn}</span>
                      <span className="text-slate-500 hidden sm:inline font-sans">({stu.name})</span>
                    </span>
                    <span className="text-[11px] text-slate-600 tabular-nums shrink-0">
                      {stu.className} ({stu.section}) · রোল {toBanglaNumber(stu.roll)} · {stu.studentId}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Document Control Settings & Saved Presets Panel */}
        {settingsOpen && (
          <div className="border border-slate-200 rounded-lg bg-[#F7F8FC] p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B2A6B]">
              <SlidersHorizontal className="w-4 h-4 text-[#1F7A4D]" />
              <span>পেপার, মার্জিন, কপি ও দৃশ্যমানতা নিয়ন্ত্রণ</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label htmlFor="ps-size" className="block text-[11px] text-slate-600 mb-1">
                  কাগজের মাপ (Paper)
                </label>
                <select
                  id="ps-size"
                  value={settings.paperSize}
                  onChange={(e) =>
                    setSettings({ ...settings, paperSize: e.target.value as PrintPaperSize })
                  }
                  className="w-full h-9 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                </select>
              </div>
              <div>
                <label htmlFor="ps-orient" className="block text-[11px] text-slate-600 mb-1">
                  পৃষ্ঠার বিন্যাস (Orientation)
                </label>
                <select
                  id="ps-orient"
                  value={settings.orientation}
                  onChange={(e) =>
                    setSettings({ ...settings, orientation: e.target.value as PrintOrientation })
                  }
                  className="w-full h-9 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="portrait">Portrait (লম্বালম্বি)</option>
                  <option value="landscape">Landscape (আড়াআড়ি)</option>
                </select>
              </div>
              <div>
                <label htmlFor="ps-margin" className="block text-[11px] text-slate-600 mb-1">
                  পৃষ্ঠার মার্জিন (Margin)
                </label>
                <select
                  id="ps-margin"
                  value={settings.marginMm}
                  onChange={(e) => setSettings({ ...settings, marginMm: Number(e.target.value) })}
                  className="w-full h-9 px-2.5 text-xs border border-slate-300 rounded-lg bg-white tabular-nums"
                >
                  <option value={6}>Compact (6 mm)</option>
                  <option value={10}>Standard (10 mm)</option>
                  <option value={14}>Spacious (14 mm)</option>
                </select>
              </div>
              <div>
                <label htmlFor="ps-copies" className="block text-[11px] text-slate-600 mb-1">
                  প্রিন্ট কপি (Copies)
                </label>
                <select
                  id="ps-copies"
                  value={settings.copies}
                  onChange={(e) => setSettings({ ...settings, copies: Number(e.target.value) })}
                  className="w-full h-9 px-2.5 text-xs border border-slate-300 rounded-lg bg-white tabular-nums"
                >
                  <option value={1}>১ কপি</option>
                  <option value={2}>২ কপি (অফিস + শিক্ষার্থী)</option>
                  <option value={3}>৩ কপি</option>
                </select>
              </div>
              {docType === 'student-id-card' && (
                <div>
                  <label htmlFor="ps-idpp" className="block text-[11px] text-slate-600 mb-1">
                    প্রতি পৃষ্ঠায় আইডি কার্ড
                  </label>
                  <select
                    id="ps-idpp"
                    value={settings.idCardsPerPage}
                    onChange={(e) =>
                      setSettings({ ...settings, idCardsPerPage: Number(e.target.value) as 4 | 8 })
                    }
                    className="w-full h-9 px-2.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={8}>৮-আপ (Compact 8 Cards)</option>
                    <option value={4}>৪-আপ (Large 4 Cards)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Visibility Toggles */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200/70">
              {(
                [
                  ['showBranding', 'বিদ্যালয়ের লোগো ও হেডার'],
                  ['showStudentPhotos', 'শিক্ষার্থীর ছবি ফ্রেম'],
                  ['showSignatures', 'স্বাক্ষর ব্লক'],
                  ['showQrVerification', 'QR যাচাইকরণ কোড'],
                  ['showGuardianPhone', 'অভিভাবক মোবাইল'],
                  ['showRfidColumn', 'RFID কলাম'],
                  ['showDataOriginNote', 'ফুটার তথ্য নোট'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                    className="accent-[#1F7A4D] rounded"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {/* Saved Presets Bar */}
            <div className="pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <form onSubmit={handleSavePreset} className="flex items-center gap-2">
                <input
                  value={presetNameDraft}
                  onChange={(e) => setPresetNameDraft(e.target.value)}
                  placeholder="নতুন প্রিসেটের নাম লিখুন..."
                  aria-label="প্রিসেটের নাম"
                  className="h-8 px-2.5 text-xs border border-slate-300 rounded-lg bg-white w-52"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium text-white bg-[#1B2A6B] hover:bg-[#132056] rounded-lg cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>প্রিসেট সংরক্ষণ</span>
                </button>
              </form>

              {presets.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">সংরক্ষিত প্রিসেট:</span>
                  {presets.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 bg-white border border-slate-300 rounded-md px-2 py-1 text-[11px]"
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="text-[#1B2A6B] hover:text-[#1F7A4D] font-medium cursor-pointer"
                      >
                        {p.name}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete preset ${p.name}`}
                        onClick={() => handleDeletePreset(p.id)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Notices */}
        {validationIssues.length > 0 && (
          <div className="space-y-2">
            {validationIssues.map((issue, idx) => (
              <div
                key={`val-${idx}`}
                role="alert"
                className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border text-xs ${
                  issue.level === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{issue.messageBn}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. PRINT PREVIEW STUDIO TOOLBAR + SCALED A4 STAGE */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Studio Toolbar */}
        <div className="no-print px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
            <span className="text-sm font-semibold text-[#1B2A6B] truncate">
              {activeMeta.titleBn}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              {settings.paperSize} {settings.orientation === 'landscape' ? 'Landscape' : 'Portrait'} ·{' '}
              মার্জিন {settings.marginMm}mm · {toBanglaNumber(pageCount)} পৃষ্ঠা
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Page Navigator (when multi-page bulk) */}
            {pageCount > 1 && (
              <div className="inline-flex items-center border border-slate-300 rounded-lg bg-[#F7F8FC] text-xs tabular-nums">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() => jumpToPage(currentPage - 1)}
                  className="p-1.5 text-slate-600 hover:text-[#1B2A6B] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-medium text-[#1B2A6B]">
                  পৃষ্ঠা {toBanglaNumber(currentPage)} / {toBanglaNumber(pageCount)}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage >= pageCount}
                  onClick={() => jumpToPage(currentPage + 1)}
                  className="p-1.5 text-slate-600 hover:text-[#1B2A6B] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="inline-flex items-center border border-slate-300 rounded-lg bg-[#F7F8FC] text-xs">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoomMode(0.65)}
                className={`p-1.5 rounded-l-lg cursor-pointer ${
                  zoomMode === 0.65 ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
                }`}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomMode('fit')}
                className={`px-2.5 py-1.5 font-medium cursor-pointer border-x border-slate-300 ${
                  zoomMode === 'fit' ? 'bg-[#1B2A6B] text-white' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                Fit ({Math.round(effectiveScale * 100)}%)
              </button>
              <button
                type="button"
                onClick={() => setZoomMode(1)}
                className={`px-2 py-1.5 font-medium cursor-pointer border-r border-slate-300 tabular-nums ${
                  zoomMode === 1 ? 'bg-[#1B2A6B] text-white' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                100%
              </button>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoomMode(1.15)}
                className={`p-1.5 rounded-r-lg cursor-pointer ${
                  zoomMode === 1.15 ? 'bg-[#1B2A6B] text-white' : 'text-slate-600 hover:text-[#1B2A6B]'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Standalone Printable File */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              disabled={hasBlockingError}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1B2A6B] bg-white border border-slate-300 hover:border-[#1B2A6B] hover:bg-[#F7F8FC] rounded-lg disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>HTML / PDF ফাইল</span>
            </button>

            {/* Primary Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={hasBlockingError || isPrinting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'প্রস্তুত হচ্ছে...' : 'প্রিন্ট / PDF সংরক্ষণ'}</span>
            </button>
          </div>
        </div>

        {/* Realistic Neutral Preview Backdrop */}
        <div
          ref={stageRef}
          className="bg-[#E6EAF2] p-4 sm:p-6 overflow-x-auto"
          aria-label="Document Print Preview Stage"
        >
          <div
            className="mx-auto transition-[height] duration-150"
            style={{
              width: Math.ceil(sheetNaturalWidthPx * effectiveScale),
              height: Math.ceil(canvasHeight * effectiveScale) + 8,
            }}
          >
            <div
              data-print-zoom-shell="true"
              style={{
                width: sheetNaturalWidthPx,
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
              }}
            >
              <div
                id={PRINT_CANVAS_ID}
                ref={canvasRef}
                data-testid="print-preview-canvas"
                className="space-y-6"
              >
                {renderActiveDocument()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
