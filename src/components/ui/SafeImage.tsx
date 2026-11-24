import React, { useState } from 'react';
import { School } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  ...rest
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackTitle || 'BUTPHS Campus Visual'}
        className={`flex flex-col items-center justify-center bg-[#F0F4F1] text-[#1B2A6B]/70 border border-slate-200 ${className}`}
      >
        <School className="w-8 h-8 mb-2 text-[#1F7A4D]" aria-hidden="true" />
        <span className="text-xs font-medium px-3 text-center">
          {fallbackTitle || alt || 'Bijhari Upashi Tara Prasanna High School'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
