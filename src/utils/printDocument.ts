/**
 * Centralized Institutional Print & Printable Document Export Engine.
 * Supports A4 Portrait, A4 Landscape, Letter, Custom Card sheets, configurable margins,
 * multi-copy duplication, repeating table headers, and exact color fidelity without popup blockers.
 */

export type PrintPaperSize = 'A4' | 'Letter' | 'Legal';
export type PrintOrientation = 'portrait' | 'landscape';

export interface PrintPageOptions {
  paperSize?: PrintPaperSize;
  orientation?: PrintOrientation;
  marginMm?: number;
  copies?: number;
}

function collectDocumentStyles(): string {
  const parts: string[] = [];
  const headNodes = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'));
  for (const node of headNodes) {
    if (node.tagName === 'LINK') {
      const href = (node as HTMLLinkElement).href;
      if (href) {
        parts.push(`<link rel="stylesheet" href="${href}" />`);
      }
    } else if (node.tagName === 'STYLE') {
      parts.push(`<style>${node.textContent || ''}</style>`);
    }
  }
  return parts.join('\n');
}

function absolutizeAssetUrls(root: HTMLElement): void {
  const origin = window.location.origin;
  const imgs = Array.from(root.querySelectorAll('img'));
  for (const img of imgs) {
    const rawSrc = img.getAttribute('src');
    if (
      rawSrc &&
      !rawSrc.startsWith('data:') &&
      !rawSrc.startsWith('http://') &&
      !rawSrc.startsWith('https://')
    ) {
      try {
        img.setAttribute('src', new URL(rawSrc, origin).href);
      } catch {
        // Retain original src if URL resolution fails
      }
    }
  }
}

function buildPrintHtmlDocument(
  innerHtml: string,
  title: string,
  includeAutoToolbar = false,
  options: PrintPageOptions = {}
): string {
  const styles = collectDocumentStyles();
  const paperSize = options.paperSize || 'A4';
  const orientation = options.orientation || 'portrait';
  const marginMm = typeof options.marginMm === 'number' ? options.marginMm : 8;
  const copies = Math.max(1, Math.min(5, options.copies || 1));

  const maxWidthCss =
    orientation === 'landscape'
      ? paperSize === 'Legal'
        ? '355mm'
        : '297mm'
      : paperSize === 'Letter'
        ? '216mm'
        : '210mm';

  const repeatedBody =
    copies === 1
      ? `<div class="bhs-copy-block">${innerHtml}</div>`
      : Array.from({ length: copies })
          .map(
            (_, idx) =>
              `<div class="bhs-copy-block ${idx > 0 ? 'bhs-copy-break' : ''}">${innerHtml}</div>`
          )
          .join('\n');

  const toolbar = includeAutoToolbar
    ? `<div class="no-print" style="max-width:${maxWidthCss};margin:14px auto;padding:10px 14px;background:#F7F8FC;border:1px solid #cbd5e1;border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-family:'Open Sans','Noto Sans Bengali',sans-serif;">
        <div style="font-size:13px;color:#1B2A6B;font-weight:600;">${title} <span style="font-weight:400;color:#64748b;">(${paperSize} ${orientation === 'landscape' ? 'Landscape' : 'Portrait'})</span></div>
        <button onclick="window.print()" style="background:#1F7A4D;color:#fff;border:none;border-radius:8px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;">প্রিন্ট / PDF সংরক্ষণ (Print / Save PDF)</button>
      </div>`
    : '';

  return `<!doctype html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${styles}
  <style>
    @page {
      size: ${paperSize} ${orientation};
      margin: ${marginMm}mm;
    }
    html, body {
      background: #ffffff !important;
      color: #0f172a !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: 'Open Sans', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .bhs-print-root {
      width: 100%;
      max-width: ${maxWidthCss};
      margin: 0 auto;
      background: #ffffff !important;
      box-shadow: none !important;
    }
    .bhs-print-root * {
      box-shadow: none !important;
    }
    .bhs-copy-break {
      page-break-before: always;
      break-before: page;
    }
    .doc-sheet-page {
      width: 100% !important;
      max-width: none !important;
      min-height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      page-break-after: always;
      break-after: page;
    }
    .doc-sheet-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .doc-keep-together {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .no-print {
      display: none !important;
    }
    table {
      border-collapse: collapse;
    }
    thead {
      display: table-header-group;
    }
    tfoot {
      display: table-footer-group;
    }
    tr, td, th {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    @media screen {
      body {
        background: #E8ECF4 !important;
        padding: 16px !important;
      }
      .bhs-print-root {
        background: transparent !important;
      }
      .doc-sheet-page {
        background: #ffffff !important;
        padding: 10mm !important;
        margin-bottom: 16px !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
      }
      .no-print {
        display: flex !important;
      }
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .doc-sheet-page {
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 0 !important;
      }
    }
  </style>
</head>
<body>
  ${toolbar}
  <div class="bhs-print-root">${repeatedBody}</div>
</body>
</html>`;
}

/**
 * Prints a specific DOM element cleanly via a dedicated hidden same-origin iframe.
 * Supports A4 Portrait/Landscape, custom margins, and multiple copies.
 */
export function printElementById(
  elementId: string,
  documentTitle = 'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয় — অফিসিয়াল ডকুমেন্ট',
  options: PrintPageOptions = {}
): boolean {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    window.print();
    return false;
  }

  const clone = sourceEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-print').forEach((n) => n.remove());
  // Reset any CSS preview zoom transforms on cloned print output
  clone.style.transform = 'none';
  clone.style.width = '100%';
  clone.querySelectorAll<HTMLElement>('[data-print-zoom-shell]').forEach((el) => {
    el.style.transform = 'none';
    el.style.width = '100%';
  });
  absolutizeAssetUrls(clone);

  const html = buildPrintHtmlDocument(clone.innerHTML, documentTitle, false, options);

  const existing = document.getElementById('bhs-print-frame');
  if (existing) {
    existing.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'bhs-print-frame';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.title = documentTitle;
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc || !iframe.contentWindow) {
    window.print();
    return false;
  }

  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    }
  };

  doc.open();
  doc.write(html);
  doc.close();

  const waitAndPrint = async () => {
    try {
      const iframeFonts = (iframe.contentDocument as Document & { fonts?: FontFaceSet })?.fonts;
      if (iframeFonts?.ready) {
        await Promise.race([
          iframeFonts.ready,
          new Promise((resolve) => window.setTimeout(resolve, 600)),
        ]);
      }
      const imgs = Array.from(iframe.contentDocument?.querySelectorAll('img') || []);
      await Promise.race([
        Promise.all(
          imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((res) => {
                  img.onload = () => res();
                  img.onerror = () => res();
                })
          )
        ),
        new Promise((resolve) => window.setTimeout(resolve, 600)),
      ]);
    } catch {
      // Ignore wait errors and proceed to print
    }
    window.setTimeout(triggerPrint, 90);
  };

  if (iframe.contentDocument?.readyState === 'complete') {
    void waitAndPrint();
  } else {
    iframe.onload = () => {
      void waitAndPrint();
    };
    window.setTimeout(() => {
      void waitAndPrint();
    }, 700);
  }

  return true;
}

/**
 * Downloads a standalone, offline print-ready HTML document configured with exact @page rules
 * so users can open and Save as PDF cleanly in any browser.
 */
export function downloadElementAsPrintableHtml(
  elementId: string,
  filename: string,
  documentTitle = 'বিঝারী উপসী তারা প্রসন্ন উচ্চ বিদ্যালয়',
  options: PrintPageOptions = {}
): boolean {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) return false;

  const clone = sourceEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-print').forEach((n) => n.remove());
  clone.style.transform = 'none';
  clone.style.width = '100%';
  clone.querySelectorAll<HTMLElement>('[data-print-zoom-shell]').forEach((el) => {
    el.style.transform = 'none';
    el.style.width = '100%';
  });
  absolutizeAssetUrls(clone);

  const html = buildPrintHtmlDocument(clone.innerHTML, documentTitle, true, options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
