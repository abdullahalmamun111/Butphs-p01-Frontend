import { SCHOOL_INFO } from '../config/school';
import type { Student } from '../types';

export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

export const MAX_AVATAR_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ImageValidationResult {
  valid: boolean;
  errorBn?: string;
}

export function validateAvatarFile(
  file: { type: string; size: number },
  maxBytes: number = MAX_AVATAR_FILE_BYTES
): ImageValidationResult {
  const mime = (file.type || '').toLowerCase();
  if (!ALLOWED_AVATAR_MIME_TYPES.includes(mime as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])) {
    return {
      valid: false,
      errorBn: 'শুধুমাত্র JPG, PNG অথবা WEBP ফরম্যাটের ছবি আপলোড করা যাবে।',
    };
  }
  if (file.size <= 0) {
    return {
      valid: false,
      errorBn: 'নির্বাচিত ফাইলটি খালি। অনুগ্রহ করে সঠিক ছবি নির্বাচন করুন।',
    };
  }
  if (file.size > maxBytes) {
    const mb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10;
    return {
      valid: false,
      errorBn: `ছবির আকার সর্বোচ্চ ${mb} MB-এর মধ্যে হতে হবে।`,
    };
  }
  return { valid: true };
}

export function computeAvatarInitials(nameEn: string, nameBn?: string): string {
  const parts = (nameEn || '')
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0 && !/^(md\.?|most\.?|dr\.?|engr\.?)$/i.test(p));
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const bnParts = (nameBn || '').trim().split(/\s+/).filter(Boolean);
  if (bnParts.length > 0) {
    return bnParts[0].slice(0, 2);
  }
  return 'BP';
}

/**
 * Deterministic student portrait photo resolver.
 * Returns the student's uploaded/assigned photoUrl if present, otherwise picks an
 * age- & gender-appropriate institutional mock portrait so every print document shows a crisp photo.
 */
export function resolveStudentPhotoUrl(
  student: Pick<Student, 'photoUrl' | 'gender' | 'className'>
): string {
  if (student.photoUrl && student.photoUrl.trim().length > 0) {
    return student.photoUrl;
  }
  const isSenior =
    student.className.includes('9') ||
    student.className.includes('10') ||
    student.className.includes('৯ম') ||
    student.className.includes('১০ম');

  if (student.gender === 'Female') {
    return isSenior ? SCHOOL_INFO.assets.studentGirlSenior : SCHOOL_INFO.assets.studentGirlJunior;
  }
  return isSenior ? SCHOOL_INFO.assets.studentBoySenior : SCHOOL_INFO.assets.studentBoyJunior;
}

/**
 * Browser-side image reader + canvas downscaler (max 420x420 JPEG @ 0.85 quality)
 * so uploaded profile photos look sharp while staying lightweight in localStorage or REST JSON payloads.
 */
export function readAndCompressImageFile(file: File, maxDimension = 420): Promise<string> {
  return new Promise((resolve, reject) => {
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      reject(new Error(validation.errorBn));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবিটি পড়তে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'));
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) {
        reject(new Error('ছবিটি রূপান্তর করা যায়নি।'));
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback to raw Data URL if canvas decode fails
        resolve(rawDataUrl);
      };
      img.onload = () => {
        try {
          const { naturalWidth: w, naturalHeight: h } = img;
          const scale = Math.min(1, maxDimension / Math.max(w || 1, h || 1));
          const targetW = Math.max(1, Math.round(w * scale));
          const targetH = Math.max(1, Math.round(h * scale));
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          resolve(canvas.toDataURL('image/jpeg', 0.86));
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}
