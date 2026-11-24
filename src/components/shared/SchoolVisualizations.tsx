import { useState } from 'react';
import { BarChart3, GraduationCap, Users } from 'lucide-react';
import { toBanglaDigits } from '../../utils/noticeUtils';

const SSC_TREND_DEMO = [
  { year: '2021', yearBn: '২০২১', passRate: 93.4, gpa5: 28, candidates: 142 },
  { year: '2022', yearBn: '২০২২', passRate: 94.8, gpa5: 34, candidates: 148 },
  { year: '2023', yearBn: '২০২৩', passRate: 95.6, gpa5: 39, candidates: 156 },
  { year: '2024', yearBn: '২০২৪', passRate: 96.2, gpa5: 44, candidates: 162 },
  { year: '2025', yearBn: '২০২৫', passRate: 96.8, gpa5: 51, candidates: 168 },
];

const STREAM_DISTRIBUTION_DEMO = [
  { id: 'junior', labelBn: 'নিম্ন মাধ্যমিক (৬ষ্ঠ–৮ম)', labelEn: 'Junior Secondary', students: 342, color: '#1B2A6B' },
  { id: 'science', labelBn: 'বিজ্ঞান বিভাগ (৯ম–১০ম)', labelEn: 'Science Stream', students: 162, color: '#1F7A4D' },
  { id: 'humanities', labelBn: 'মানবিক বিভাগ (৯ম–১০ম)', labelEn: 'Humanities Stream', students: 102, color: '#C9A961' },
  { id: 'business', labelBn: 'ব্যবসায় শিক্ষা (৯ম–১০ম)', labelEn: 'Business Studies', students: 74, color: '#2E6F95' },
];

const CLASS_ATTENDANCE_DEMO = [
  { classBn: '৬ষ্ঠ শ্রেণি', rate: 94, students: 120 },
  { classBn: '৭ম শ্রেণি', rate: 92, students: 114 },
  { classBn: '৮ম শ্রেণি', rate: 95, students: 108 },
  { classBn: '৯ম শ্রেণি', rate: 91, students: 172 },
  { classBn: '১০ম শ্রেণি', rate: 96, students: 166 },
];

export function SchoolVisualizations() {
  const [activeYearIdx, setActiveYearIdx] = useState(SSC_TREND_DEMO.length - 1);
  const [selectedStreamId, setSelectedStreamId] = useState<string>('science');

  const activeYear = SSC_TREND_DEMO[activeYearIdx];
  const totalEnrolled = STREAM_DISTRIBUTION_DEMO.reduce((acc, s) => acc + s.students, 0);
  const activeStream =
    STREAM_DISTRIBUTION_DEMO.find((s) => s.id === selectedStreamId) || STREAM_DISTRIBUTION_DEMO[0];

  // Build non-overlapping dual-band SVG geometry:
  // Upper band (y: 22..72): Pass Rate trend line (90%..100%)
  // Lower band (y: 102..172): GPA-5 vertical bars (0..60) with labels safely below the line
  const chartW = 430;
  const chartH = 198;
  const padX = 48;
  const stepX = (chartW - padX * 2) / (SSC_TREND_DEMO.length - 1);
  const barBaselineY = 172;
  const maxBarH = 68;

  const linePoints = SSC_TREND_DEMO.map((d, i) => {
    const x = padX + i * stepX;
    const y = 72 - ((d.passRate - 90) / 10) * 48; // 90% -> 72, 100% -> 24
    return { x, y, ...d };
  });

  const polylineStr = linePoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Visualization 1: 5-Year SSC Board Pass Rate & GPA-5 Interactive Chart */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#1F7A4D] inline-flex items-center gap-1.5 font-bn">
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>একাডেমিক অগ্রগতি বিশ্লেষণ · বোর্ড পরিসংখ্যান</span>
            </p>
            <h3 className="text-lg font-semibold text-[#1B2A6B] font-bn mt-0.5">
              ৫ বছরের এসএসসি ফলাফল ও জিপিএ-৫ ধারা (২০২১–২০২৫)
            </h3>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-2xl font-bold text-[#1F7A4D] tabular-nums font-bn">
              {toBanglaDigits(activeYear.passRate)}%
            </p>
            <p className="text-xs text-slate-500 font-bn">
              এসএসসি {activeYear.yearBn} · জিপিএ-৫: {toBanglaDigits(activeYear.gpa5)} জন
            </p>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full h-auto min-w-[320px]"
            role="img"
            aria-label="৫ বছরের এসএসসি পাসের হার ও জিপিএ-৫ চার্ট"
          >
            {/* Horizontal grid lines for upper pass-rate band */}
            {[90, 95, 100].map((val) => {
              const y = 72 - ((val - 90) / 10) * 48;
              return (
                <g key={val}>
                  <line
                    x1={32}
                    y1={y}
                    x2={chartW - 14}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text x={4} y={y + 3} fontSize="9" fill="#94A3B8" className="tabular-nums font-bn">
                    {toBanglaDigits(val)}%
                  </text>
                </g>
              );
            })}

            {/* Subtle baseline rule for GPA-5 bars */}
            <line
              x1={32}
              y1={barBaselineY}
              x2={chartW - 14}
              y2={barBaselineY}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <text x={4} y={barBaselineY - 26} fontSize="8.5" fill="#94A3B8" className="font-bn">
              GPA-5
            </text>

            {/* GPA-5 vertical bars (lower band) */}
            {linePoints.map((pt, idx) => {
              const barH = Math.max(20, (pt.gpa5 / 60) * maxBarH);
              const barTopY = barBaselineY - barH;
              const isSelected = idx === activeYearIdx;
              return (
                <g
                  key={pt.year}
                  onClick={() => setActiveYearIdx(idx)}
                  onMouseEnter={() => setActiveYearIdx(idx)}
                  className="cursor-pointer"
                >
                  <rect
                    x={pt.x - 18}
                    y={barTopY}
                    width={36}
                    height={barH}
                    rx={6}
                    fill={isSelected ? '#1F7A4D' : '#D5E9DE'}
                    className="transition-colors duration-200"
                  />
                  <text
                    x={pt.x}
                    y={barTopY - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={isSelected ? '700' : '600'}
                    fill={isSelected ? '#1B2A6B' : '#64748B'}
                    className="tabular-nums font-bn"
                  >
                    {toBanglaDigits(pt.gpa5)}
                  </text>
                  <text
                    x={pt.x}
                    y={chartH - 6}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? '#1B2A6B' : '#475569'}
                    className="font-bn"
                  >
                    {pt.yearBn}
                  </text>
                </g>
              );
            })}

            {/* Pass Rate Trend Polyline (upper band) */}
            <polyline
              fill="none"
              stroke="#C9A961"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={polylineStr}
            />

            {/* Trend Nodes + Active Pass-Rate Callout */}
            {linePoints.map((pt, idx) => {
              const isSelected = idx === activeYearIdx;
              return (
                <g
                  key={`dot-${pt.year}`}
                  onClick={() => setActiveYearIdx(idx)}
                  onMouseEnter={() => setActiveYearIdx(idx)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 5.2 : 3.8}
                    fill={isSelected ? '#1B2A6B' : '#FFFFFF'}
                    stroke="#C9A961"
                    strokeWidth="2.2"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 9}
                    textAnchor="middle"
                    fontSize={isSelected ? '9.5' : '8.5'}
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? '#1B2A6B' : '#64748B'}
                    className="tabular-nums font-bn"
                  >
                    {toBanglaDigits(pt.passRate)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interactive Year Selector Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 font-bn">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#1F7A4D] inline-block" />
              জিপিএ-৫ সংখ্যা
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#C9A961] inline-block" />
              পাসের হার (%)
            </span>
          </div>
          <div className="flex items-center gap-1">
            {SSC_TREND_DEMO.map((d, idx) => (
              <button
                key={d.year}
                type="button"
                onClick={() => setActiveYearIdx(idx)}
                className={`px-2 py-1 rounded text-xs font-medium tabular-nums transition-colors cursor-pointer font-bn ${
                  idx === activeYearIdx
                    ? 'bg-[#1B2A6B] text-white'
                    : 'bg-[#F7F8FC] text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.yearBn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualization 2: Stream Distribution & Daily RFID Attendance Rate */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-[#1F7A4D] inline-flex items-center gap-1.5 font-bn">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>বিভাগ ও শ্রেণিভিত্তিক শিক্ষার্থী বিন্যাস</span>
            </p>
            <h3 className="text-lg font-semibold text-[#1B2A6B] font-bn mt-0.5">
              মোট {toBanglaDigits(totalEnrolled)} জন শিক্ষার্থী · ৪ একাডেমিক ধারা
            </h3>
          </div>

          {/* Interactive Stacked Segment Bar */}
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100">
            {STREAM_DISTRIBUTION_DEMO.map((stream) => {
              const pct = (stream.students / totalEnrolled) * 100;
              const isSelected = stream.id === selectedStreamId;
              return (
                <button
                  key={stream.id}
                  type="button"
                  aria-label={`${stream.labelBn}: ${stream.students} জন`}
                  onClick={() => setSelectedStreamId(stream.id)}
                  onMouseEnter={() => setSelectedStreamId(stream.id)}
                  style={{ width: `${pct}%`, backgroundColor: stream.color }}
                  className={`h-full transition-opacity cursor-pointer ${
                    isSelected ? 'opacity-100' : 'opacity-75 hover:opacity-95'
                  }`}
                />
              );
            })}
          </div>

          {/* Interactive Legend Rows */}
          <div className="space-y-2">
            {STREAM_DISTRIBUTION_DEMO.map((stream) => {
              const pct = Math.round((stream.students / totalEnrolled) * 100);
              const isSelected = stream.id === selectedStreamId;
              return (
                <button
                  key={stream.id}
                  type="button"
                  onClick={() => setSelectedStreamId(stream.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F7F8FC] border border-[#1F7A4D]/40'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: stream.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-[#1B2A6B] font-bn truncate">
                        {stream.labelBn}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums text-xs font-bn">
                    <span className="font-semibold text-[#1B2A6B]">
                      {toBanglaDigits(stream.students)} জন
                    </span>
                    <span className="text-slate-400 ml-1.5">({toBanglaDigits(pct)}%)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact RFID Attendance Benchmark Bars */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#1B2A6B] inline-flex items-center gap-1.5 font-bn">
              <GraduationCap className="w-3.5 h-3.5 text-[#1F7A4D]" />
              <span>গড় RFID শ্রেণি উপস্থিতি হার</span>
            </span>
            <span className="text-slate-500 font-bn">নির্বাচিত: {activeStream.labelEn}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {CLASS_ATTENDANCE_DEMO.map((c) => (
              <div key={c.classBn} className="text-center space-y-1">
                <div className="h-14 bg-[#F7F8FC] rounded-md flex items-end p-1 overflow-hidden">
                  <div
                    className="w-full bg-[#1F7A4D] rounded-sm"
                    style={{ height: `${Math.max(20, c.rate - 15)}%` }}
                  />
                </div>
                <p className="text-[11px] font-semibold text-[#1B2A6B] tabular-nums font-bn">
                  {toBanglaDigits(c.rate)}%
                </p>
                <p className="text-[10px] text-slate-500 font-bn truncate">{c.classBn}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
