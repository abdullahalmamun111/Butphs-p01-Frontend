import { SCHOOL_INFO } from '../config/school';
import type { Notice } from '../types';

/**
 * Generates and downloads a real local printable notice document (.html)
 * so every "Download / PDF" button works cleanly offline with zero broken links.
 */
export function downloadNoticeFile(notice: Notice) {
  const html = `<!doctype html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>${notice.title} - ${SCHOOL_INFO.shortName}</title>
  <style>
    body { font-family: "Open Sans", "Noto Sans Bengali", Arial, sans-serif; color: #1a202c; max-width: 760px; margin: 32px auto; padding: 28px; border: 1.5px solid #1B2A6B; line-height: 1.7; }
    header { border-bottom: 2px solid #1B2A6B; padding-bottom: 14px; margin-bottom: 20px; text-align: center; }
    h1 { color: #1B2A6B; margin: 0 0 4px; font-size: 22px; }
    .meta { color: #475569; font-size: 13px; }
    h2 { color: #1F7A4D; font-size: 18px; margin: 18px 0 6px; }
    .footer { margin-top: 48px; display: flex; justify-content: space-between; font-size: 13px; color: #334155; }
  </style>
</head>
<body>
  <header>
    <h1>${SCHOOL_INFO.nameBn}</h1>
    <div>${SCHOOL_INFO.nameEn}</div>
    <div class="meta">${SCHOOL_INFO.addressEn} · EIIN: ${SCHOOL_INFO.eiin} · Code: ${SCHOOL_INFO.schoolCode}</div>
  </header>
  <div class="meta">Category: ${notice.category} · Date: ${notice.date} · Ref: ${notice.attachmentName}</div>
  <h2>${notice.titleBn}</h2>
  <div style="font-weight:600; margin-bottom:14px;">${notice.title}</div>
  <p>${notice.content}</p>
  <div class="footer">
    <div>Published by: ${notice.publishedBy}</div>
    <div>Head Teacher · ${SCHOOL_INFO.nameBn}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = notice.attachmentName.replace(/\.pdf$/i, '.html');
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
