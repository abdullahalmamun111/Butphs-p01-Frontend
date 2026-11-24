import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg py-10 px-6 text-center">
      <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
      <h3 className="text-base font-medium text-[#1B2A6B] font-bn">{title}</h3>
      <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto font-bn">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
