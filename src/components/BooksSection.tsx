import React, { useState } from 'react';
import {
  BookPlus,
  ArrowLeftRight,
  QrCode,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookCopy } from '../types/library';
import { CopyQRModal } from './CopyQRModal';

interface BooksSectionProps {
  onOpenNewBook: () => void;
  onQuickLoan: (book: Book, copy?: BookCopy) => void;
  onQuickReturn?: (loanId: string) => void;
}

export const BooksSection: React.FC<BooksSectionProps> = ({
  onOpenNewBook,
  onQuickLoan,
  onQuickReturn,
}) => {
  const { books, loans } = useLibrary();

  // State for expanded copy views per book
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

  // State for active QR Copy Modal
  const [selectedBookForQR, setSelectedBookForQR] = useState<Book | null>(null);
  const [selectedCopyForQR, setSelectedCopyForQR] = useState<BookCopy | null>(null);

  const handleOpenCopyQR = (book: Book, copy: BookCopy) => {
    setSelectedBookForQR(book);
    setSelectedCopyForQR(copy);
  };

  const handleCloseCopyQR = () => {
    setSelectedBookForQR(null);
    setSelectedCopyForQR(null);
  };

  const getCopyLoan = (copyId: string, copyIdentifier: string) => {
    return loans.find(
      (l) =>
        l.status !== 'Terminé' &&
        (l.copyId === copyId || l.copyIdentifier.toLowerCase() === copyIdentifier.toLowerCase())
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Ouvrages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Informations bibliographiques, suivi individuel de chaque exemplaire physique et impression des codes QR.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewBook}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <BookPlus className="w-4 h-4" />
          <span>Ajouter un ouvrage</span>
        </button>
      </div>

      {/* Books List */}
      <div className="space-y-4">
        {books.map((book) => {
          const isAvailable = book.availableCopies > 0;
          const isCopiesExpanded = expandedBookId === book.id;

          return (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 transition-all hover:border-slate-300"
            >
              {/* Header: Titre & Auteur & Disponibilité */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-14 rounded-lg shadow-xs flex items-center justify-center text-white shrink-0 font-mono text-xs font-bold"
                    style={{ backgroundColor: book.coverAccent || '#1e293b' }}
                  >
                    {book.publishedYear}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                      Auteur : <strong className="text-slate-900">{book.author}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Maison d’édition : <strong className="text-slate-700">{book.publisher}</strong> ({book.publishedYear})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono font-bold text-xs px-3 py-1 rounded-full border ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                    <span>
                      {book.availableCopies} / {book.totalCopies} disponible{book.availableCopies > 1 ? 's' : ''}
                    </span>
                  </span>
                </div>
              </div>

              {/* Bibliographic Details: ISBN & Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Code ISBN</span>
                  <span className="font-mono text-slate-900 font-semibold">{book.isbn}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total exemplaires</span>
                  <span className="font-mono text-slate-900 font-bold">{book.totalCopies} exemplaires</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Disponibles</span>
                  <span className="font-mono text-emerald-700 font-bold">{book.availableCopies} en rayon</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-700 uppercase font-bold block">Prêtés</span>
                  <span className="font-mono text-rose-700 font-bold">{book.borrowedCopies} emprunté(s)</span>
                </div>
              </div>

              {/* Résumé de l'ouvrage */}
              {book.description && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                    Résumé de l'ouvrage :
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Ubicación / Emplacement physique de l'ouvrage */}
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-800">Emplacement :</span>
                <span>{book.sectionName} · {book.themeName} · <strong className="text-slate-900">{book.shelfName}</strong></span>
              </div>

              {/* COPIES BREAKDOWN & QR CODES (Fiche de l'exemplaire) */}
              <div className="pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2 py-1">
                  <button
                    type="button"
                    onClick={() => setExpandedBookId(isCopiesExpanded ? null : book.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    <span>
                      {isCopiesExpanded ? 'Masquer les exemplaires' : `Gérer les ${book.copies?.length || 0} exemplaires & Codes QR`}
                    </span>
                    {isCopiesExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Action Prêt */}
                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => onQuickLoan(book)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Prêter un exemplaire</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 text-[11px] text-slate-400 font-medium bg-slate-100 rounded-lg">
                      Tous prêtés
                    </span>
                  )}
                </div>

                {/* Expanded individual copies list */}
                {isCopiesExpanded && (
                  <div className="mt-3 space-y-2 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Exemplaires physiques individuels de cet ouvrage :
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {book.copies?.map((copy) => {
                        const copyLoan = getCopyLoan(copy.id, copy.copyIdentifier);
                        const isBorrowed = copy.status === 'Emprunté' || !!copyLoan;

                        return (
                          <div
                            key={copy.id}
                            className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 transition-colors"
                          >
                            <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isBorrowed
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {isBorrowed ? (
                                  <AlertTriangle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 text-xs">
                                    {copy.copyIdentifier}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isBorrowed
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {isBorrowed ? 'Emprunté' : 'Disponible'}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    État : {copy.condition}
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                  📍 {book.sectionName} · {book.shelfName}
                                  {isBorrowed && (copyLoan?.memberName || copy.borrowerName) && (
                                    <span className="text-rose-700 font-medium ml-1.5">
                                      · Emprunté par {copyLoan?.memberName || copy.borrowerName} ({copyLoan?.dueDate || copy.dueDate})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Copy Actions: Fiche Exemplaire & QR */}
                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenCopyQR(book, copy)}
                                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Fiche & Code QR</span>
                              </button>

                              {!isBorrowed ? (
                                <button
                                  type="button"
                                  onClick={() => onQuickLoan(book, copy)}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  title="Prêter cet exemplaire"
                                >
                                  Prêter
                                </button>
                              ) : copyLoan && onQuickReturn ? (
                                <button
                                  type="button"
                                  onClick={() => onQuickReturn(copyLoan.id)}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Restituer cet exemplaire"
                                >
                                  Retour
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy QR and Print Modal */}
      {selectedBookForQR && selectedCopyForQR && (
        <CopyQRModal
          isOpen={true}
          onClose={handleCloseCopyQR}
          book={selectedBookForQR}
          copy={selectedCopyForQR}
          loan={getCopyLoan(selectedCopyForQR.id, selectedCopyForQR.copyIdentifier)}
          onQuickLoan={(b, c) => {
            handleCloseCopyQR();
            onQuickLoan(b, c);
          }}
          onQuickReturn={
            onQuickReturn
              ? (loanId) => {
                  handleCloseCopyQR();
                  onQuickReturn(loanId);
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
