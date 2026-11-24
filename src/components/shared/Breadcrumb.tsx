import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-nav no-print mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <li>
          <Link to="/" className="hover:text-[#1F7A4D] transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link to={item.href} className="hover:text-[#1F7A4D] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#1B2A6B] font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
