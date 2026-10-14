import React from 'react';
import {
  X,
  BookOpen,
  Barcode,
  MapPin,
  Clock,
  Layers,
  Edit2,
  ArrowLeftRight,
  CheckCircle2,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookCopy } from '../types/library';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onQuickLoan: (book: Book, copy?: BookCopy) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onEdit,
  onQuickLoan,
}) => {
  const { loans } = useLibrary();

  if (!book) return null;

  const isAvailable = book.availableCopies > 0;
  const activeBookLoans = loans.filter((l) => l.bookId === book.id && l.status !== 'Rendu');

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header with color spine */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-16 rounded-md shadow-md flex items-center justify-center text-white shrink-0 font-mono text-xs font-bold"
              style={{ backgroundColor: book.coverAccent || '#1e293b' }}
            >
              {book.publishedYear}
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 block">
                {book.genre}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                {book.title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {book.author} · {book.publisher} ({book.publishedYear})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Metadata badges (unboxed, clean typography) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
            <div>
              <span className="text-[10px] text-slate-500 block">Cote Dewey</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">{book.deweyCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">ISBN</span>
              <span className="font-mono tabular-nums text-slate-900">{book.isbn}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Pagination</span>
              <span className="font-mono tabular-nums text-slate-900">{book.pages} pages</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Disponibilité</span>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  isAvailable ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {book.availableCopies} / {book.totalCopies} en rayon
              </span>
            </div>
          </div>

          {/* Exact Physical Location in Library */}
          <div className="flex items-center gap-2 text-slate-700 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[11px] text-slate-500">Emplacement physique dans la bibliothèque : </span>
              <span className="font-semibold text-slate-900">{book.shelfLocation}</span>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-1">Résumé de l'œuvre</h4>
              <p className="text-slate-600 leading-relaxed text-xs bg-white p-3 rounded-lg border border-slate-100">
                {book.description}
              </p>
            </div>
          )}

          {/* Physical Copies Detail */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Exemplaires physiques inventoriés ({book.copies?.length || 0})
            </h4>
            <div className="space-y-2">
              {(book.copies || []).map((copy) => {
                const isDisponible = copy.status === 'Disponible';
                const isIndisponible = copy.status === 'Indisponible' || (copy.status as string) === 'Non disponible';
                const isReserve = copy.status === 'Réservé';

                return (
                  <div
                    key={copy.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{copy.exactLocation}</span>
                        {isDisponible && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>Disponible</span>
                          </span>
                        )}
                        {isIndisponible && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            <span>Indisponible</span>
                          </span>
                        )}
                        {isReserve && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            <span>Réservé</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono">{copy.barcode}</span>
                        <span aria-hidden="true">·</span>
                        <span>État : {copy.condition}</span>
                        {isIndisponible && copy.borrowerName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-rose-700 font-medium">Prêté à {copy.borrowerName}</span>
                          </>
                        )}
                        {isReserve && copy.reservedForName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-800 font-medium">Réservé pour {copy.reservedForName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isDisponible && (
                      <button
                        onClick={() => {
                          onClose();
                          onQuickLoan(book, copy);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors self-start sm:self-auto shrink-0"
                      >
                        Prêter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEdit(book);
            }}
            className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Modifier la fiche</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Fermer
            </button>

            {isAvailable ? (
              <button
                onClick={() => {
                  onClose();
                  onQuickLoan(book);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Prêter cet ouvrage</span>
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
              >
                Stock épuisé en rayon
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
