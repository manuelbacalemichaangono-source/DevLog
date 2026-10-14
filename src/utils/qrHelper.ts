import QRCode from 'qrcode';
import { Book, BookCopy, Member, Loan } from '../types/library';

export interface CopyQRInfo {
  biblio: string;
  type: 'library_copy';
  bookId: string;
  copyId: string;
  copyIdentifier: string;
  title: string;
  author: string;
  location: {
    section: string;
    thematic: string;
    shelf: string;
  };
  status: 'Disponible' | 'Emprunté' | 'Réservé';
  borrower?: {
    name: string;
    memberNumber: string;
    loanDate?: string;
    dueDate?: string;
  };
}

/**
 * Builds the essential QR data payload for a specific copy
 */
export function buildCopyQRPayload(
  book: Book,
  copy: BookCopy,
  currentLoan?: Loan | null,
  borrowerMember?: Member | null
): string {
  const isBorrowed = copy.status === 'Emprunté' || !!currentLoan;

  let borrowerInfo: CopyQRInfo['borrower'] | undefined = undefined;

  if (isBorrowed) {
    const studentName =
      currentLoan?.memberName ||
      (borrowerMember ? `${borrowerMember.firstName} ${borrowerMember.lastName}` : copy.borrowerName) ||
      'Étudiant non spécifié';

    const memberNum =
      currentLoan?.memberNumber ||
      borrowerMember?.memberNumber ||
      copy.borrowerMemberNumber ||
      'N/A';

    borrowerInfo = {
      name: studentName,
      memberNumber: memberNum,
      loanDate: currentLoan?.loanDate || copy.loanDate,
      dueDate: currentLoan?.dueDate || copy.dueDate,
    };
  }

  const payloadObj: CopyQRInfo = {
    biblio: 'BiblioTech',
    type: 'library_copy',
    bookId: book.id,
    copyId: copy.id,
    copyIdentifier: copy.copyIdentifier || `EX-${book.id}-${copy.copyNumber}`,
    title: book.title,
    author: book.author,
    location: {
      section: book.sectionName || 'Section Principale',
      thematic: book.themeName || 'Fonds Général',
      shelf: book.shelfName || 'Rayon 1',
    },
    status: isBorrowed ? 'Emprunté' : 'Disponible',
    ...(borrowerInfo ? { borrower: borrowerInfo } : {}),
  };

  return JSON.stringify(payloadObj);
}

/**
 * Generates a Data URL (base64 image/png) for a given QR content string
 */
export async function generateQRCodeDataUrl(
  content: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  try {
    return await QRCode.toDataURL(content, {
      width: options?.width || 280,
      margin: options?.margin ?? 2,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

/**
 * Parses raw text scanned from a QR code and finds the matching book & copy
 */
export function resolveScannedQRCode(
  scannedText: string,
  books: Book[],
  loans: Loan[]
): {
  found: boolean;
  book?: Book;
  copy?: BookCopy;
  loan?: Loan;
  parsedInfo?: Partial<CopyQRInfo>;
  error?: string;
} {
  const clean = scannedText.trim();
  if (!clean) {
    return { found: false, error: 'Code QR vide' };
  }

  let parsed: any = null;
  let targetCopyIdentifier = '';
  let targetCopyId = '';
  let targetBookId = '';

  // Try parsing JSON first
  try {
    parsed = JSON.parse(clean);
    if (parsed && typeof parsed === 'object') {
      targetCopyIdentifier = parsed.copyIdentifier || '';
      targetCopyId = parsed.copyId || '';
      targetBookId = parsed.bookId || '';
    }
  } catch {
    // If not JSON, it might be a direct copy identifier like "EX-CAMUS-01" or contain "EX-"
    targetCopyIdentifier = clean;
  }

  // Find book and copy
  let matchedBook: Book | undefined = undefined;
  let matchedCopy: BookCopy | undefined = undefined;

  for (const b of books) {
    if (targetBookId && b.id === targetBookId) {
      matchedBook = b;
      matchedCopy = b.copies?.find(
        (c) =>
          c.id === targetCopyId ||
          c.copyIdentifier.toLowerCase() === targetCopyIdentifier.toLowerCase()
      );
      if (matchedCopy) break;
    }

    // Otherwise search across all copies
    const c = b.copies?.find(
      (cp) =>
        (targetCopyId && cp.id === targetCopyId) ||
        (targetCopyIdentifier && cp.copyIdentifier.toLowerCase() === targetCopyIdentifier.toLowerCase()) ||
        clean.toLowerCase().includes(cp.copyIdentifier.toLowerCase())
    );

    if (c) {
      matchedBook = b;
      matchedCopy = c;
      break;
    }
  }

  if (!matchedBook || !matchedCopy) {
    return {
      found: false,
      parsedInfo: parsed,
      error: `Exemplaire non trouvé dans la bibliothèque pour : "${targetCopyIdentifier || clean.slice(0, 30)}"`,
    };
  }

  // Check if active loan exists for this copy
  const activeLoan = loans.find(
    (l) =>
      l.status !== 'Terminé' &&
      (l.copyId === matchedCopy?.id ||
        l.copyIdentifier.toLowerCase() === matchedCopy?.copyIdentifier.toLowerCase())
  );

  return {
    found: true,
    book: matchedBook,
    copy: matchedCopy,
    loan: activeLoan,
    parsedInfo: parsed,
  };
}

/**
 * Downloads the QR Code as a PNG image file
 */
export function downloadQRCodeImage(dataUrl: string, copyIdentifier: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `QR-${copyIdentifier}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Opens a print-formatted window to print the copy's sticker label
 */
export function printCopyLabel(
  book: Book,
  copy: BookCopy,
  qrDataUrl: string
): void {
  const printWindow = window.open('', '_blank', 'width=520,height=600');
  if (!printWindow) {
    // Fallback: trigger image download if popups are blocked in iframe
    downloadQRCodeImage(qrDataUrl, copy.copyIdentifier);
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Étiquette Exemplaire - ${copy.copyIdentifier}</title>
  <style>
    @page {
      size: auto;
      margin: 10mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f8fafc;
    }
    .label-card {
      background: #ffffff;
      border: 2px dashed #0f172a;
      border-radius: 12px;
      padding: 20px;
      width: 320px;
      box-sizing: border-box;
      text-align: center;
    }
    .header {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #4f46e5;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .qr-img {
      width: 170px;
      height: 170px;
      margin: 6px auto;
      display: block;
    }
    .copy-id {
      font-family: monospace;
      font-size: 16px;
      font-weight: 900;
      background: #0f172a;
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-top: 4px;
    }
    .title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 10px;
      line-height: 1.25;
    }
    .author {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
    }
    .location {
      font-size: 10px;
      font-weight: 600;
      color: #1e293b;
      margin-top: 8px;
      padding: 6px;
      background: #f1f5f9;
      border-radius: 6px;
      line-height: 1.3;
    }
    .instructions {
      margin-top: 12px;
      font-size: 9px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="label-card">
    <div class="header">BiblioTech · Exemplaire Physique</div>
    <img src="${qrDataUrl}" alt="QR Code" class="qr-img" />
    <div class="copy-id">${copy.copyIdentifier}</div>
    <div class="title">${escapeHtml(book.title)}</div>
    <div class="author">${escapeHtml(book.author)}</div>
    <div class="location">
      📍 ${escapeHtml(book.sectionName)}<br>
      ${escapeHtml(book.themeName)} · ${escapeHtml(book.shelfName)}
    </div>
    <div class="instructions">À coller sur la couverture ou la page de garde</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
