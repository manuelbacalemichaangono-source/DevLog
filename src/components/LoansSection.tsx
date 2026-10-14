import React, { useState } from 'react';
import {
  ArrowLeftRight,
  RotateCcw,
  X,
  User,
  BookOpen,
  AlertTriangle,
  QrCode,
  Camera,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Loan, Book, BookCopy } from '../types/library';
import { QRScannerModal } from './QRScannerModal';
import { CopyQRModal } from './CopyQRModal';

interface LoansSectionProps {
  onOpenNewLoan: () => void;
  onOpenReturnModal: (loanId: string) => void;
}

export const LoansSection: React.FC<LoansSectionProps> = ({
  onOpenNewLoan,
  onOpenReturnModal,
}) => {
  const { loans, books, members, getLoanOverdueInfo } = useLibrary();

  // Active loans (books currently borrowed)
  const activeLoans = loans.filter((l) => l.status !== 'Terminé');

  // Selected loan when clicking on the book/row
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // QR scanner state for returns
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // QR modal inspection state
  const [inspectQRData, setInspectQRData] = useState<{
    book: Book;
    copy: BookCopy;
    loan: Loan;
  } | null>(null);

  const handleScanForReturn = (result: { book: Book; copy: BookCopy; loan?: Loan }) => {
    if (result.loan) {
      onOpenReturnModal(result.loan.id);
    } else {
      alert(
        `L'exemplaire ${result.copy.copyIdentifier} de "${result.book.title}" n'est pas actuellement emprunté (déjà disponible en rayon).`
      );
    }
  };

  const handleOpenQRModalForLoan = (loan: Loan) => {
    const book = books.find((b) => b.id === loan.bookId);
    const copy =
      book?.copies?.find(
        (c) => c.id === loan.copyId || c.copyIdentifier === loan.copyIdentifier
      ) ||
      ({
        id: loan.copyId,
        copyNumber: loan.copyNumber,
        copyIdentifier: loan.copyIdentifier,
        bookId: loan.bookId,
        barcode: loan.copyIdentifier,
        status: 'Emprunté',
        condition: 'Bon',
        exactLocation: loan.exactLocation,
        borrowerName: loan.memberName,
        borrowerMemberNumber: loan.memberNumber,
        loanDate: loan.loanDate,
        dueDate: loan.dueDate,
      } as BookCopy);

    const fullBook =
      book ||
      ({
        id: loan.bookId,
        title: loan.bookTitle,
        author: loan.bookAuthor,
        isbn: loan.bookIsbn,
        genre: 'Sciences',
        sectionId: 'sec-a',
        sectionName: 'Section Principale',
        themeId: 'theme-1',
        themeName: 'Fonds Général',
        shelfId: 'shelf-1',
        shelfName: 'Rayon 1',
        publishedYear: 2024,
        publisher: 'Édition Bibliothèque',
        deweyCode: '000',
        shelfLocation: loan.exactLocation,
        totalCopies: 1,
        availableCopies: 0,
        borrowedCopies: 1,
        description: '',
        coverAccent: '#1e293b',
        pages: 100,
        language: 'Français',
        addedDate: '2024-01-01',
        copies: [copy],
      } as Book);

    setInspectQRData({
      book: fullBook,
      copy,
      loan,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar with New Loan and QR Scanner buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Emprunts ({activeLoans.length} livre{activeLoans.length > 1 ? 's' : ''} prêté{activeLoans.length > 1 ? 's' : ''})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cliquez sur un livre pour consulter l'étudiant emprunteur et le numéro d'exemplaire précis.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsQRScannerOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Scanner le code QR d'un exemplaire pour enregistrer sa restitution"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <span>Scanner QR retour</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewLoan}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Nouvel emprunt</span>
          </button>
        </div>
      </div>

      {/* Loans List: DIRECTLY VISIBLE: Exemplaire, Date d'emprunt, Date de retour, et en ROUGE si dévolution tardive */}
      {activeLoans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-900">Aucun livre n'est actuellement prêté</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tous les exemplaires de la bibliothèque sont actuellement disponibles en rayon.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeLoans.map((loan) => {
            const overdue = getLoanOverdueInfo(loan);

            return (
              <div
                key={loan.id}
                onClick={() => setSelectedLoan(loan)}
                className={`rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                  overdue.isOverdue
                    ? 'border-rose-400 bg-rose-50/70 hover:border-rose-500 hover:shadow-rose-100 hover:shadow-md'
                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                {/* 1. EXEMPLAIRE */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 ${
                      overdue.isOverdue
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {overdue.isOverdue ? (
                      <AlertTriangle className="w-5 h-5 text-white" />
                    ) : (
                      <BookOpen className="w-5 h-5" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-base font-bold text-slate-900 truncate">
                      {loan.bookTitle}
                    </div>
                    <div className="text-xs text-slate-500 font-medium truncate">
                      Exemplaire : <strong className={overdue.isOverdue ? 'text-rose-900 font-mono' : 'text-slate-700 font-mono'}>{loan.copyIdentifier || `Exemplaire n°${loan.copyNumber}`}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. DATES & BADGE EN ROUGE SI EN RETARD / DÉVOLUTION TARDIVE */}
                <div className="flex items-center gap-4 sm:gap-6 text-xs shrink-0 self-start sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  {/* Badge rouge si dévolution tardive */}
                  {overdue.isOverdue && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[11px] shadow-xs uppercase tracking-wide">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Dévolution tardive ({overdue.daysOverdue} j de retard)</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Date d'emprunt :
                    </span>
                    <span className="font-mono font-semibold text-slate-800 text-xs">
                      {loan.loanDate}
                    </span>
                  </div>

                  <div>
                    <span className={`text-[10px] uppercase font-bold block ${overdue.isOverdue ? 'text-rose-700' : 'text-slate-400'}`}>
                      Date de retour :
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        overdue.isOverdue
                          ? 'text-rose-700 font-extrabold bg-rose-100 border border-rose-300 px-2 py-0.5 rounded block'
                          : 'font-bold text-slate-900'
                      }`}
                    >
                      {loan.dueDate}
                    </span>
                  </div>

                  <span className={`text-xs font-semibold underline hidden sm:inline ${overdue.isOverdue ? 'text-rose-700 font-bold' : 'text-indigo-600'}`}>
                    Voir détails
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: SHOWN WHEN CLICKING ON THE BOOK/ROW */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    getLoanOverdueInfo(selectedLoan).isOverdue
                      ? 'bg-rose-100 border border-rose-300 text-rose-600'
                      : 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Détails de l'emprunt</h3>
                  <p className="text-[11px] text-slate-500">{selectedLoan.bookTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLoan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: student who borrowed it, copy number, dates */}
            <div className="py-4 space-y-4 text-xs">
              {/* Alerte rouge si en dévolution tardive */}
              {getLoanOverdueInfo(selectedLoan).isOverdue && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-950 font-medium flex items-start gap-2 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-800 block uppercase tracking-wide text-[11px]">
                      Exemplaire en dévolution tardive
                    </span>
                    <span className="text-[11px] text-rose-900">
                      Cet exemplaire devait être rendu le <strong>{selectedLoan.dueDate}</strong>. Le retard actuel est de{' '}
                      <strong className="underline decoration-rose-500">
                        {getLoanOverdueInfo(selectedLoan).daysOverdue} jour(s)
                      </strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* Le livre et le numéro d'exemplaire précis */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ouvrage :</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedLoan.bookTitle}</div>
                  <div className="text-slate-600 text-xs">Auteur : {selectedLoan.bookAuthor}</div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Numéro d'exemplaire :</span>
                  <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded text-xs">
                    Exemplaire n°{selectedLoan.copyNumber} ({selectedLoan.copyIdentifier})
                  </span>
                </div>

                {selectedLoan.exactLocation && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    📍 {selectedLoan.exactLocation}
                  </div>
                )}
              </div>

              {/* L'étudiant qui a effectué l'emprunt */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Étudiant emprunteur</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nom et prénom :</span>
                  <strong className="text-slate-900 text-sm">{selectedLoan.memberName}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Numéro de matricule :</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {selectedLoan.memberNumber}
                  </span>
                </div>

                {selectedLoan.memberEmail && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">E-mail :</span>
                    <span className="text-slate-700">{selectedLoan.memberEmail}</span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Date d'emprunt</span>
                  <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                    {selectedLoan.loanDate}
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    getLoanOverdueInfo(selectedLoan).isOverdue
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold block ${
                      getLoanOverdueInfo(selectedLoan).isOverdue ? 'text-rose-700' : 'text-slate-400'
                    }`}
                  >
                    Date de retour prévue
                  </span>
                  <span
                    className={`font-mono text-xs mt-0.5 block ${
                      getLoanOverdueInfo(selectedLoan).isOverdue
                        ? 'font-extrabold text-rose-700'
                        : 'font-bold text-slate-900'
                    }`}
                  >
                    {selectedLoan.dueDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer: Voir QR, Retourner & Fermer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const loanToInspect = selectedLoan;
                  setSelectedLoan(null);
                  handleOpenQRModalForLoan(loanToInspect);
                }}
                className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Code QR</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoan(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const id = selectedLoan.id;
                    setSelectedLoan(null);
                    onOpenReturnModal(id);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Enregistrer le retour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner for Returns */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        mode="return"
        onScanSuccess={handleScanForReturn}
      />

      {/* QR Inspection Modal */}
      {inspectQRData && (
        <CopyQRModal
          isOpen={true}
          onClose={() => setInspectQRData(null)}
          book={inspectQRData.book}
          copy={inspectQRData.copy}
          loan={inspectQRData.loan}
          member={members.find((m) => m.id === inspectQRData.loan.memberId)}
          onQuickReturn={(loanId) => {
            setInspectQRData(null);
            onOpenReturnModal(loanId);
          }}
        />
      )}
    </div>
  );
};
