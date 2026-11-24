import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Printer,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../config/school';
import { downloadNoticeFile } from '../../utils/downloadNotice';
import { formatBanglaCalendarTile, getNoticeMemoNo } from '../../utils/noticeUtils';
import { printElementById } from '../../utils/printDocument';
import type { Notice } from '../../types';

interface OfficialNoticePaperProps {
  notice: Notice;
  headTeacherName?: string;
  paperId?: string;
}

/**
 * Publication-grade Bangladeshi institutional official notice sheet (A4 proportions).
 * Used inside both the interactive NoticePrintModal and the standalone /academics/notices/:id page.
 */
export function OfficialNoticePaper({
  notice,
  headTeacherName = 'প্রধান শিক্ষক',
  paperId,
}: OfficialNoticePaperProps) {
  const memoNo = getNoticeMemoNo(notice);
  const dateTile = formatBanglaCalendarTile(notice.date);
  const distribution =
    notice.distributionList && notice.distributionList.length > 0
      ? notice.distributionList
      : [
          '১. সভাপতি, ম্যানেজিং কমিটি, বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়।',
          '২. সকল শ্রেণি শিক্ষক ও সংশ্লিষ্ট বিভাগ।',
          '৩. অফিস নোটিশ বোর্ড ও ডিজিটাল ওয়েবসাইট।',
        ];

  return (
    <article
      id={paperId}
      aria-label={`অফিসিয়াল বিজ্ঞপ্তি: ${notice.titleBn}`}
      className="print-notice-sheet relative bg-white text-slate-900 shadow-lg border border-slate-200 rounded-sm overflow-hidden mx-auto w-full max-w-[760px]"
    >
      {/* Top Institutional Emerald & Gold Double Accent Bar */}
      <div className="h-1.5 bg-[#1F7A4D]" />
      <div className="h-0.5 bg-[#C9A961]" />

      {/* Subtle Institutional Crest Watermark inside Paper */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.045]"
      >
        <img
          src={SCHOOL_INFO.assets.logo}
          alt=""
          className="w-72 h-72 sm:w-80 sm:h-80 object-contain grayscale"
        />
      </div>

      <div className="relative z-10 px-6 sm:px-12 py-8 sm:py-10 space-y-6 font-bn">
        {/* Letterhead Header */}
        <header className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-5 border-b-2 border-[#1F7A4D] relative">
          <img
            src={SCHOOL_INFO.assets.logo}
            alt="বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় মনোগ্রাম"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2A6B] tracking-tight leading-snug">
              {SCHOOL_INFO.nameBn}
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1F7A4D] mt-0.5 font-sans">
              {SCHOOL_INFO.nameEn}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {SCHOOL_INFO.addressBn} · স্থাপিত: {SCHOOL_INFO.establishedBn} · EIIN:{' '}
              <span className="tabular-nums font-medium">{SCHOOL_INFO.eiin}</span> · কোড:{' '}
              <span className="tabular-nums font-medium">{SCHOOL_INFO.schoolCode}</span>
            </p>
          </div>
          <div className="absolute -bottom-[5px] inset-x-0 h-[1px] bg-[#C9A961]" />
        </header>

        {/* Memo Number & Date Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-700">
          <p>
            <span className="text-slate-500">স্মারক নং:</span>{' '}
            <strong className="font-semibold text-[#1B2A6B] tabular-nums">{memoNo}</strong>
          </p>
          <p>
            <span className="text-slate-500">তারিখ:</span>{' '}
            <strong className="font-semibold text-slate-900">{dateTile.fullBn}</strong>
          </p>
        </div>

        {/* Centered Official Circular Heading */}
        <div className="text-center pt-1 pb-2">
          <h3 className="inline-block text-lg sm:text-xl font-bold text-[#1F7A4D] pb-1 border-b-2 border-[#1F7A4D]">
            {notice.isUrgent ? 'জরুরি অফিসিয়াল বিজ্ঞপ্তি' : 'অফিসিয়াল বিজ্ঞপ্তি'}
          </h3>
        </div>

        {/* Subject Callout (Subtle editorial surface, clean hairline frame) */}
        <div className="bg-[#F7F8FC] border border-slate-200 rounded-md px-4 sm:px-5 py-3.5">
          <p className="text-sm sm:text-[15px] leading-relaxed">
            <span className="font-bold text-[#1F7A4D]">বিষয়:</span>{' '}
            <span className="font-semibold text-[#1B2A6B]">{notice.titleBn}</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">{notice.title}</p>
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-sm sm:text-[15px] text-slate-800 leading-[1.85] text-justify">
          <p>{notice.content}</p>

          {notice.instructions && notice.instructions.length > 0 && (
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-md p-4 space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-[#1B2A6B]">
                জ্ঞাতব্য ও অনুসরণীয় নির্দেশনা:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc pl-5">
                {notice.instructions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-slate-700">
            সংশ্লিষ্ট সকলের অবগতি ও প্রয়োজনীয় কার্যার্থে অত্র বিজ্ঞপ্তি জারি করা হলো।
          </p>
        </div>

        {/* Distribution List & Seal/Signature Footer */}
        <footer className="pt-8 mt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
          <div className="sm:col-span-7 space-y-1.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">অনুলিপি (সদয় অবগতি ও কার্যার্থে):</p>
            <ul className="space-y-1 leading-relaxed">
              {distribution.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400 pt-2">
              প্রকাশক: {notice.publishedBy} · প্রাতিষ্ঠানিক ডিজিটাল কপি
            </p>
          </div>

          <div className="sm:col-span-5 flex items-end justify-start sm:justify-end gap-4">
            {/* Official Circular School Rubber Stamp SVG */}
            <svg
              viewBox="0 0 112 112"
              className="w-20 h-20 text-[#1B2A6B]/75 shrink-0"
              aria-label="বিদ্যালয়ের অফিসিয়াল সিল"
            >
              <circle cx="56" cy="56" r="52" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle
                cx="56"
                cy="56"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.9"
                strokeDasharray="2 2"
              />
              <circle cx="56" cy="56" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
              <text
                x="56"
                y="22"
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill="currentColor"
              >
                BIJHARI UPASHI BUTPHS
              </text>
              <text
                x="56"
                y="52"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="currentColor"
              >
                EIIN: 113585
              </text>
              <text
                x="56"
                y="64"
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="600"
                fill="currentColor"
              >
                EST. 1898
              </text>
              <text
                x="56"
                y="95"
                textAnchor="middle"
                fontSize="6.8"
                fontWeight="600"
                fill="currentColor"
              >
                NARIA, SHARIATPUR
              </text>
            </svg>

            {/* Signature Block */}
            <div className="text-center min-w-[140px]">
              <svg
                viewBox="0 0 140 34"
                className="w-28 h-8 mx-auto text-[#1B2A6B]"
                aria-hidden="true"
              >
                <path
                  d="M10 24 C22 8, 34 28, 46 16 C56 6, 66 26, 80 15 C92 7, 106 23, 128 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
              </svg>
              <div className="border-t border-slate-700 pt-1.5">
                <p className="text-xs font-bold text-slate-900">প্রধান শিক্ষক</p>
                <p className="text-[11px] text-slate-600 leading-tight">{headTeacherName}</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}

interface NoticePrintModalProps {
  notice: Notice | null;
  onClose: () => void;
  onDownloadNotify?: (notice: Notice) => void;
  headTeacherName?: string;
}

export function NoticePrintModal({
  notice,
  onClose,
  onDownloadNotify,
  headTeacherName,
}: NoticePrintModalProps) {
  const [zoom, setZoom] = useState(100);
  const [copiedMemo, setCopiedMemo] = useState(false);

  useEffect(() => {
    if (!notice) return;
    setZoom(100);
    setCopiedMemo(false);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      document.body.classList.remove('printing-notice-modal');
    };
  }, [notice, onClose]);

  if (!notice) return null;

  const memoNo = getNoticeMemoNo(notice);
  const dateTile = formatBanglaCalendarTile(notice.date);

  const handlePrint = () => {
    printElementById('notice-modal-print-sheet', `${notice.titleBn} — ${SCHOOL_INFO.nameBn}`);
  };

  const handleCopyMemo = async () => {
    try {
      await navigator.clipboard.writeText(memoNo);
      setCopiedMemo(true);
      window.setTimeout(() => setCopiedMemo(false), 1800);
    } catch {
      setCopiedMemo(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-viewer-title"
      className="notice-modal-portal notice-modal-overlay fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-5"
      onClick={onClose}
    >
      <div
        className="notice-modal-shell bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="notice-modal-chrome flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-200 bg-white">
          <div className="min-w-0">
            <p className="text-xs font-bn text-slate-500 flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-[#1F7A4D]">প্রাতিষ্ঠানিক বিজ্ঞপ্তি ভিউয়ার</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-slate-600">{memoNo}</span>
            </p>
            <h2
              id="notice-viewer-title"
              className="text-base sm:text-lg font-semibold text-[#1B2A6B] font-bn truncate mt-0.5"
            >
              {notice.titleBn}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="নোটিশ ভিউয়ার বন্ধ করুন"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Toolbar */}
        <div className="notice-modal-chrome px-4 sm:px-6 py-2.5 bg-[#F7F8FC] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-bn">
            <span className="tabular-nums font-medium text-[#1B2A6B]">{memoNo}</span>
            <span aria-hidden="true">·</span>
            <span>{dateTile.fullBn}</span>
            <button
              type="button"
              onClick={handleCopyMemo}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-[#1F7A4D] bg-white border border-slate-200 rounded transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedMemo ? <Check className="w-3 h-3 text-[#1F7A4D]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedMemo ? 'কপি হয়েছে' : 'স্মারক কপি'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Zoom Controls */}
            <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                aria-label="জুম আউট"
                onClick={() => setZoom((z) => Math.max(75, z - 10))}
                className="w-7 h-7 inline-flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-medium text-slate-700 tabular-nums min-w-[46px] text-center">
                {zoom}%
              </span>
              <button
                type="button"
                aria-label="জুম ইন"
                onClick={() => setZoom((z) => Math.min(130, z + 10))}
                className="w-7 h-7 inline-flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {zoom !== 100 && (
                <button
                  type="button"
                  aria-label="জুম রিসেট"
                  onClick={() => setZoom(100)}
                  className="w-7 h-7 inline-flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                downloadNoticeFile(notice);
                onDownloadNotify?.(notice);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1F7A4D] hover:bg-[#165B39] rounded-lg transition-colors whitespace-nowrap cursor-pointer font-bn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B2A6B] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer font-bn"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>

            <Link
              to={`/academics/notices/${notice.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B2A6B] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap font-bn"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>পূর্ণ পৃষ্ঠা</span>
            </Link>
          </div>
        </div>

        {/* Scrollable Document Paper Stage */}
        <div className="notice-paper-stage flex-1 overflow-auto bg-[#E8ECEF] p-4 sm:p-8">
          <div
            className="notice-zoom-wrapper mx-auto transition-transform duration-150 origin-top"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <OfficialNoticePaper
              paperId="notice-modal-print-sheet"
              notice={notice}
              headTeacherName={headTeacherName}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="notice-modal-chrome px-5 sm:px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <Link
            to={`/academics/notices/${notice.id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#1F7A4D] hover:underline font-bn"
          >
            <span>পূর্ণ নোটিশ পৃষ্ঠায় যান</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer font-bn"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
