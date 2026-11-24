import React from 'react';
import type { BreadcrumbItem } from './Breadcrumb';

interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  kicker?: string;
  title: string;
  titleBn?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  kicker,
  title,
  titleBn,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="relative bg-gradient-to-b from-white via-white to-[#F7F8FC]/70 border-b border-slate-200/90">
      <div className="h-1 bg-gradient-to-r from-[#1F7A4D] via-[#1B2A6B] to-[#C9A961]" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="max-w-3xl space-y-1.5">
            {kicker && (
              <p className="text-xs font-semibold tracking-wide text-[#1F7A4D] font-bn">
                {kicker}
              </p>
            )}
            <h1 className="text-[26px] sm:text-[34px] font-semibold text-[#1B2A6B] leading-tight tracking-tight font-bn">
              {title}
            </h1>
            {titleBn && (
              <p className="text-base sm:text-lg font-medium text-slate-700 font-bn">{titleBn}</p>
            )}
            {description && (
              <p className="text-sm sm:text-[15px] text-slate-600 pt-1 leading-relaxed font-bn">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
