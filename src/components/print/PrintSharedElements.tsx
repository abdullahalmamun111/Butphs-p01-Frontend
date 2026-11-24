import React, { useState } from 'react';
import { SCHOOL_INFO } from '../../config/school';
import {
  buildDeterministicQrMatrix,
  type PrintDisplaySettings,
} from '../../services/printDocumentService';
import { resolveStudentPhotoUrl } from '../../utils/profileHelpers';
import type { Student } from '../../types';

export interface PrintRenderContext {
  settings: PrintDisplaySettings;
  headTeacherName: string;
  schoolAddressBn: string;
  schoolPhone: string;
  schoolEmail: string;
  issueDate: string;
}

/**
 * Exact-ratio printable paper sheet wrapper for Screen Preview + Native A4 Print.
 * Portrait: 210mm x 297mm | Landscape: 297mm x 210mm
 */
export function PaperSheet({
  orientation,
  marginMm = 10,
  pageNumber,
  totalPages,
  ceremonialFrame = false,
  children,
}: {
  orientation: 'portrait' | 'landscape';
  marginMm?: number;
  pageNumber?: number;
  totalPages?: number;
  ceremonialFrame?: boolean;
  children: React.ReactNode;
}) {
  const isLandscape = orientation === 'landscape';
  return (
    <section
      data-doc-page={pageNumber || 1}
      className={`doc-sheet-page font-doc bg-white text-slate-900 border border-slate-300/90 shadow-md mx-auto flex flex-col justify-between ${
        isLandscape ? 'w-[297mm] min-h-[210mm]' : 'w-[210mm] min-h-[297mm]'
      }`}
      style={{ padding: `${marginMm}mm` }}
    >
      <div
        className={`flex-1 flex flex-col justify-between ${
          ceremonialFrame
            ? 'border border-[#1B2A6B]/85 p-[2.5mm]'
            : ''
        }`}
      >
        <div
          className={`flex-1 flex flex-col justify-between ${
            ceremonialFrame
              ? 'border border-[#C9A961] p-[6mm]'
              : ''
          }`}
        >
          <div className="flex-1 flex flex-col">{children}</div>

          {typeof pageNumber === 'number' && typeof totalPages === 'number' && totalPages > 1 && (
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 tabular-nums">
              <span>
                {SCHOOL_INFO.nameEn} · EIIN {SCHOOL_INFO.eiin}
              </span>
              <span>
                Page {pageNumber} of {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Crisp vector SVG verification QR motif + institutional code.
 */
export function VerificationQrSvg({
  code,
  size = 56,
  compact = false,
}: {
  code: string;
  size?: number;
  compact?: boolean;
}) {
  const matrix = buildDeterministicQrMatrix(code);
  const cells = matrix.length;
  const step = 100 / cells;

  return (
    <div className="inline-flex flex-col items-center gap-1 shrink-0">
      <div
        className="p-1 bg-white border border-slate-200 rounded"
        style={{ width: size + 8, height: size + 8 }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          role="img"
          aria-label={`Verification code ${code}`}
          className="block"
        >
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          {matrix.map((row, rIdx) =>
            row.map((filled, cIdx) =>
              filled ? (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx * step}
                  y={rIdx * step}
                  width={step + 0.15}
                  height={step + 0.15}
                  fill="#1B2A6B"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      {!compact && (
        <span className="text-[9px] font-medium tracking-wider text-slate-500 tabular-nums font-mono">
          {code}
        </span>
      )}
    </div>
  );
}

/**
 * Clean student portrait frame displaying the student's actual/mock photo with institutional monogram fallback.
 */
export function StudentAvatarBox({
  student,
  size = 'md',
}: {
  student: Student;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoSrc = resolveStudentPhotoUrl(student);

  const initials = student.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');

  const dims =
    size === 'xs'
      ? 'w-7 h-8 text-[10px]'
      : size === 'sm'
        ? 'w-12 h-15 text-xs'
        : size === 'lg'
          ? 'w-[28mm] h-[34mm] text-xl'
          : 'w-[21mm] h-[26mm] text-sm';

  return (
    <div
      className={`${dims} rounded border border-slate-300 bg-[#F7F8FC] flex flex-col items-center justify-center shrink-0 overflow-hidden select-none`}
      aria-label={`${student.nameBn} — শিক্ষার্থীর ছবি`}
    >
      {photoSrc && !imgFailed ? (
        <img
          src={photoSrc}
          alt={student.nameBn}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <>
          <span className="font-semibold tracking-wide text-[#1B2A6B]">{initials || 'ST'}</span>
          {size !== 'xs' && (
            <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">
              Photo
            </span>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Original Architectural Institutional Letterhead for BUTPHS.
 * Clean hierarchy, subtle brass gold accent line (#C9A961), restrained Navy (#1B2A6B) & Forest Green (#1F7A4D).
 */
export function InstitutionalLetterhead({
  ctx,
  docTitleEn,
  docTitleBn,
  subtitle,
  serialNo,
  verificationCode,
  variant = 'standard',
  rightSlot,
}: {
  ctx: PrintRenderContext;
  docTitleEn: string;
  docTitleBn: string;
  subtitle?: string;
  serialNo?: string;
  verificationCode?: string;
  variant?: 'standard' | 'compact' | 'ceremonial';
  rightSlot?: React.ReactNode;
}) {
  if (!ctx.settings.showBranding) {
    return (
      <div className="pb-3 mb-4 border-b border-slate-300 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-[#1B2A6B]">{docTitleEn}</h1>
          <p className="text-xs text-slate-600">{docTitleBn}</p>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="text-right text-[11px] text-slate-500 tabular-nums">
          {serialNo && <p>Ref: {serialNo}</p>}
          <p>Issued: {ctx.issueDate}</p>
        </div>
      </div>
    );
  }

  if (variant === 'ceremonial') {
    return (
      <header className="text-center pb-4 mb-5 border-b border-slate-200">
        <div className="flex flex-col items-center gap-2">
          <img
            src={SCHOOL_INFO.assets.logo}
            alt={SCHOOL_INFO.nameEn}
            className="w-16 h-16 object-contain"
          />
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-[#1F7A4D]">
              Established {SCHOOL_INFO.established} · EIIN {SCHOOL_INFO.eiin} · School Code{' '}
              {SCHOOL_INFO.schoolCode}
            </p>
            <h1 className="text-[20px] font-semibold text-[#1B2A6B] tracking-tight mt-0.5">
              {SCHOOL_INFO.nameEn}
            </h1>
            <p className="text-[15px] font-medium text-slate-800">{SCHOOL_INFO.nameBn}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {SCHOOL_INFO.addressEn} · {ctx.schoolPhone} · {ctx.schoolEmail}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="h-px w-14 bg-[#C9A961]" aria-hidden="true" />
          <div className="px-4 py-1 border border-[#1B2A6B]/25 bg-[#F7F8FC]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1B2A6B]">
              {docTitleEn}
            </p>
            <p className="text-[11px] font-medium text-[#1F7A4D]">{docTitleBn}</p>
          </div>
          <span className="h-px w-14 bg-[#C9A961]" aria-hidden="true" />
        </div>
        {subtitle && <p className="text-xs text-slate-600 mt-2">{subtitle}</p>}
      </header>
    );
  }

  const isCompact = variant === 'compact';

  return (
    <header className={`${isCompact ? 'pb-2.5 mb-3' : 'pb-3.5 mb-4'} border-b-2 border-[#1B2A6B]`}>
      <div className="h-[2px] w-full bg-[#C9A961] mb-2.5" aria-hidden="true" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={SCHOOL_INFO.assets.logo}
            alt={SCHOOL_INFO.nameEn}
            className={`${isCompact ? 'w-11 h-11' : 'w-14 h-14'} object-contain shrink-0`}
          />
          <div className="min-w-0">
            <h1
              className={`${
                isCompact ? 'text-[14px]' : 'text-[17px]'
              } font-semibold text-[#1B2A6B] leading-tight`}
            >
              {SCHOOL_INFO.nameBn}
            </h1>
            <p
              className={`${
                isCompact ? 'text-[11.5px]' : 'text-[13px]'
              } font-medium text-slate-800 leading-snug`}
            >
              {SCHOOL_INFO.nameEn}
            </p>
            <p className="text-[10.5px] text-slate-500 mt-0.5 tabular-nums">
              {ctx.schoolAddressBn} · EIIN: {SCHOOL_INFO.eiin} · কোড: {SCHOOL_INFO.schoolCode} ·
              স্থাপিত: {SCHOOL_INFO.establishedBn}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 shrink-0">
          {rightSlot}
          {ctx.settings.showQrVerification && verificationCode && !rightSlot && (
            <VerificationQrSvg code={verificationCode} size={isCompact ? 42 : 50} />
          )}
        </div>
      </div>

      {/* Clean Document Title Band */}
      <div
        className={`${
          isCompact ? 'mt-2 pt-2' : 'mt-3 pt-2.5'
        } border-t border-slate-200 flex flex-wrap items-baseline justify-between gap-2`}
      >
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="text-[13px] font-semibold text-[#1B2A6B] tracking-tight">
            {docTitleBn}
          </span>
          <span className="text-slate-300" aria-hidden="true">
            |
          </span>
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#1F7A4D]">
            {docTitleEn}
          </span>
          {subtitle && (
            <>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="text-[11px] text-slate-600">{subtitle}</span>
            </>
          )}
        </div>
        <div className="text-[10.5px] text-slate-500 tabular-nums flex items-center gap-2.5">
          {serialNo && <span>স্মারক / Ref: {serialNo}</span>}
          <span>তারিখ: {ctx.issueDate}</span>
        </div>
      </div>
    </header>
  );
}

/**
 * Compact Bangladesh NCTB 5.00 Grading Scale Reference Table.
 */
export function GradingScaleTable({ compact = false }: { compact?: boolean }) {
  const rows = [
    ['80–100', 'A+', '5.00'],
    ['70–79', 'A', '4.00'],
    ['60–69', 'A-', '3.50'],
    ['50–59', 'B', '3.00'],
    ['40–49', 'C', '2.00'],
    ['33–39', 'D', '1.00'],
    ['00–32', 'F', '0.00'],
  ];

  return (
    <table
      className={`border border-slate-300 text-center tabular-nums shrink-0 ${
        compact ? 'text-[9px] w-[142px]' : 'text-[10px] w-[168px]'
      }`}
    >
      <thead>
        <tr className="bg-[#1B2A6B] text-white">
          <th className={`${compact ? 'py-[2px] px-1' : 'py-1 px-1.5'} font-medium border border-[#1B2A6B]`}>Marks</th>
          <th className={`${compact ? 'py-[2px] px-1' : 'py-1 px-1.5'} font-medium border border-[#1B2A6B]`}>Grade</th>
          <th className={`${compact ? 'py-[2px] px-1' : 'py-1 px-1.5'} font-medium border border-[#1B2A6B]`}>GP</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([range, grade, gp], idx) => (
          <tr key={grade} className={idx % 2 === 1 ? 'bg-[#F7F8FC]' : 'bg-white'}>
            <td className={`${compact ? 'py-[1.5px] px-1 leading-tight' : 'py-0.5 px-1.5'} border border-slate-200 text-slate-700`}>{range}</td>
            <td
              className={`${compact ? 'py-[1.5px] px-1 leading-tight' : 'py-0.5 px-1.5'} border border-slate-200 font-semibold ${
                grade === 'F' ? 'text-red-700' : 'text-[#1B2A6B]'
              }`}
            >
              {grade}
            </td>
            <td className={`${compact ? 'py-[1.5px] px-1 leading-tight' : 'py-0.5 px-1.5'} border border-slate-200 text-slate-700`}>{gp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Standardized Authorization Signature Strip.
 */
export function SignatureBar({
  ctx,
  slots,
  dataSourceNote,
}: {
  ctx: PrintRenderContext;
  slots: Array<{ labelEn: string; labelBn: string; subtext?: string }>;
  dataSourceNote?: string;
}) {
  if (!ctx.settings.showSignatures && !ctx.settings.showDataOriginNote) return null;

  return (
    <footer className="mt-auto pt-6 doc-keep-together">
      {ctx.settings.showSignatures && (
        <div
          className="grid gap-8 pt-6 text-center"
          style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))` }}
        >
          {slots.map((slot) => (
            <div key={slot.labelEn} className="flex flex-col items-center">
              <div className="w-full max-w-[175px] border-t border-slate-400 pt-1.5">
                <p className="text-[11px] font-semibold text-[#1B2A6B] leading-tight">
                  {slot.labelBn}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{slot.labelEn}</p>
                {slot.subtext && (
                  <p className="text-[9.5px] text-slate-500 mt-0.5">{slot.subtext}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {ctx.settings.showDataOriginNote && (
        <div className="mt-4 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-500">
          <span>
            {SCHOOL_INFO.nameBn} ({SCHOOL_INFO.shortName}) · অফিসিয়াল একাডেমিক ডকুমেন্ট সিস্টেম
          </span>
          <span className="tabular-nums">
            {dataSourceNote || 'Verified Institutional Portal Record'} · মুদ্রণ তারিখ: {ctx.issueDate}
          </span>
        </div>
      )}
    </footer>
  );
}
