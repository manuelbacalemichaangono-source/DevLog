import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  Download,
  BookOpen,
  MapPin,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowLeftRight,
  RotateCcw,
} from 'lucide-react';
import { Book, BookCopy, Loan, Member } from '../types/library';
import {
  buildCopyQRPayload,
  generateQRCodeDataUrl,
  downloadQRCodeImage,
  printCopyLabel,
} from '../utils/qrHelper';

interface CopyQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  copy: BookCopy | null;
  loan?: Loan | null;
  member?: Member | null;
  onQuickLoan?: (book: Book, copy: BookCopy) => void;
  onQuickReturn?: (loanId: string) => void;
}

export const CopyQRModal: React.FC<CopyQRModalProps> = ({
  isOpen,
  onClose,
  book,
  copy,
  loan,
  member,
  onQuickLoan,
  onQuickReturn,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !book || !copy) {
      setQrDataUrl('');
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    const payload = buildCopyQRPayload(book, copy, loan, member);
    generateQRCodeDataUrl(payload, { width: 320 })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, book, copy, loan, member]);

  if (!isOpen || !book || !copy) return null;

  const isBorrowed = copy.status === 'Emprunté' || !!loan;
  const borrowerName =
    loan?.memberName ||
    (member ? `${member.firstName} ${member.lastName}` : copy.borrowerName);
  const borrowerMatricule =
    loan?.memberNumber || member?.memberNumber || copy.borrowerMemberNumber;

  const handlePrint = () => {
    if (!qrDataUrl) return;
    printCopyLabel(book, copy, qrDataUrl);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    downloadQRCodeImage(qrDataUrl, copy.copyIdentifier);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Fiche & Code QR de l'exemplaire
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {copy.copyIdentifier}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* QR Code and Actions Display */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* QR Box */}
            <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center shrink-0">
              {isGenerating ? (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                  Génération du code QR...
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code ${copy.copyIdentifier}`}
                  className="w-44 h-44 block rounded-md"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-rose-500 text-xs">
                  Erreur QR
                </div>
              )}
              <span className="mt-2 font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {copy.copyIdentifier}
              </span>
            </div>

            {/* Sticker Actions */}
            <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                  Étiquette physique de l'exemplaire
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Ce code QR est rattaché à cet exemplaire précis pour le prêt, la restitution et l'inventaire en rayon.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!qrDataUrl}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer l'étiquette</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!qrDataUrl}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          </div>

          {/* Essential Information of the Copy */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Informations contenues dans le QR :
            </div>

            {/* Title & Author */}
            <div className="pb-2.5 border-b border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Ouvrage & Auteur
              </span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {book.title}
              </div>
              <div className="text-slate-600 font-medium">
                Par <strong className="text-slate-800">{book.author}</strong> (Édition {book.publisher})
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                ISBN : {book.isbn}
              </div>
            </div>

            {/* Identification & Physical Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Numéro d'exemplaire
                </span>
                <span className="font-mono font-bold text-indigo-700 text-xs">
                  {copy.copyIdentifier}
                </span>
                <span className="text-slate-500 text-[11px] block">
                  Exemplaire n°{copy.copyNumber} sur {book.totalCopies}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Ubicación / Emplacement</span>
                </span>
                <div className="font-semibold text-slate-800 text-xs">
                  {book.sectionName}
                </div>
                <div className="text-[11px] text-slate-600">
                  {book.themeName} · {book.shelfName}
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                État actuel de l'exemplaire
              </span>
              {isBorrowed ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 font-bold text-rose-800 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      <span>Statut : Emprunté</span>
                    </span>
                    <span className="text-[11px] text-rose-700 font-medium">
                      Non disponible en rayon
                    </span>
                  </div>

                  {/* Student who borrowed it */}
                  <div className="pt-2 border-t border-rose-200/70 text-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900">
                      <User className="w-3.5 h-3.5 text-rose-600" />
                      <span>Emprunteur : {borrowerName || 'Étudiant'}</span>
                    </div>
                    {borrowerMatricule && (
                      <div className="text-[11px] text-slate-600">
                        Numéro de matricule : <strong className="font-mono text-slate-900">{borrowerMatricule}</strong>
                      </div>
                    )}
                    {(loan?.loanDate || copy.loanDate) && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Prêté le <strong className="font-mono text-slate-800">{loan?.loanDate || copy.loanDate}</strong></span>
                        <span>· Retour prévu : <strong className="font-mono text-rose-700">{loan?.dueDate || copy.dueDate}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-emerald-900 text-xs">
                        Statut : Disponible
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        Présent en rayon physique, prêt à être emprunté.
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-mono font-bold text-[11px]">
                    En rayon
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Contextual loan/return button */}
          {isBorrowed && onQuickReturn && loan ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onQuickReturn(loan.id);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restituer cet exemplaire</span>
            </button>
          ) : !isBorrowed && onQuickLoan ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onQuickLoan(book, copy);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Prêter cet exemplaire</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
