import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  BookOpen,
  User,
  Check,
  QrCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLibrary, getTodayDateString, addDaysToDate } from '../context/LibraryContext';
import { Book, BookCopy, Member, Loan } from '../types/library';
import { QRScannerModal } from './QRScannerModal';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBook?: Book | null;
  preselectedCopy?: BookCopy | null;
  preselectedMember?: Member | null;
  onSwitchToReturn?: (loanId: string) => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen,
  onClose,
  preselectedBook,
  preselectedCopy,
  preselectedMember,
  onSwitchToReturn,
}) => {
  const { books, members, loans, borrowBook, settings } = useLibrary();

  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBook?.id || '');
  const [selectedCopyId, setSelectedCopyId] = useState<string>(preselectedCopy?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(preselectedMember?.id || '');
  const [dueDate, setDueDate] = useState<string>(() =>
    addDaysToDate(getTodayDateString(), settings.defaultLoanDurationDays || 14)
  );

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedNotification, setScannedNotification] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedBook) {
      setSelectedBookId(preselectedBook.id);
    }
  }, [preselectedBook]);

  useEffect(() => {
    if (preselectedCopy) {
      setSelectedCopyId(preselectedCopy.id);
    }
  }, [preselectedCopy]);

  useEffect(() => {
    if (preselectedMember) {
      setSelectedMemberId(preselectedMember.id);
    }
  }, [preselectedMember]);

  useEffect(() => {
    if (isOpen) {
      setDueDate(addDaysToDate(getTodayDateString(), settings.defaultLoanDurationDays || 14));
      setScannedNotification(null);
    }
  }, [isOpen, settings.defaultLoanDurationDays]);

  if (!isOpen) return null;

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const availableCopies = selectedBook?.copies?.filter((c) => c.status === 'Disponible') || [];
  const selectedCopy = selectedBook?.copies?.find((c) => c.id === selectedCopyId) || availableCopies[0];
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const memberActiveLoansCount = selectedMember
    ? loans.filter((l) => l.memberId === selectedMember.id && l.status !== 'Terminé').length
    : 0;

  const handleScanSuccess = (result: { book: Book; copy: BookCopy; loan?: Loan }) => {
    if (result.copy.status === 'Emprunté' || result.loan) {
      // Copy is already borrowed!
      if (result.loan && onSwitchToReturn) {
        onClose();
        onSwitchToReturn(result.loan.id);
        return;
      }
      setScannedNotification(
        `Attention : L'exemplaire ${result.copy.copyIdentifier} est actuellement déjà emprunté.`
      );
      return;
    }

    setSelectedBookId(result.book.id);
    setSelectedCopyId(result.copy.id);
    setScannedNotification(
      `Exemplaire ${result.copy.copyIdentifier} de "${result.book.title}" identifié par code QR.`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) return;

    const res = borrowBook(selectedBookId, selectedMemberId, selectedCopy?.id, dueDate);
    if (res.success) {
      onClose();
      setSelectedBookId('');
      setSelectedCopyId('');
      setSelectedMemberId('');
      setScannedNotification(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enregistrer un emprunt</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prêt d'un exemplaire à un étudiant inscrit.
            </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Quick QR Scanner Option */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-indigo-900">
              <QrCode className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-xs block">Scanner le QR de l'exemplaire</span>
                <span className="text-[11px] text-indigo-700">
                  Évitez de chercher l'ouvrage à la main en scannant directement l'étiquette.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow-xs cursor-pointer shrink-0 transition-colors"
            >
              Scanner QR
            </button>
          </div>

          {/* Scanned Feedback */}
          {scannedNotification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{scannedNotification}</span>
            </div>
          )}

          {/* Step 1: Select Student */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>1. Étudiant emprunteur *</span>
              </span>
              {selectedMember && (
                <span className="font-normal text-slate-500">
                  Prêts : {memberActiveLoansCount}/{selectedMember.maxLoans || 5}
                </span>
              )}
            </label>

            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choisir un étudiant --</option>
              {members.map((m) => {
                const count = loans.filter((l) => l.memberId === m.id && l.status !== 'Terminé').length;
                const maxAllowed = m.maxLoans || 5;
                const isFull = count >= maxAllowed;
                return (
                  <option
                    key={m.id}
                    value={m.id}
                    disabled={isFull}
                  >
                    {m.lastName} {m.firstName} (Matricule : {m.memberNumber}) [{count} prêt(s) en cours]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Step 2: Select Book */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Ouvrage à emprunter *</span>
              </span>
              {selectedBook && (
                <span className="font-normal text-emerald-700 font-semibold">
                  {selectedBook.availableCopies} disponible{selectedBook.availableCopies > 1 ? 's' : ''}
                </span>
              )}
            </label>

            <select
              value={selectedBookId}
              onChange={(e) => {
                setSelectedBookId(e.target.value);
                const book = books.find((b) => b.id === e.target.value);
                const freeCopy = book?.copies?.find((c) => c.status === 'Disponible');
                setSelectedCopyId(freeCopy?.id || '');
              }}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choisir un ouvrage ou scanner le QR ci-dessus --</option>
              {books.map((b) => {
                const isAvailable = b.availableCopies > 0;
                return (
                  <option
                    key={b.id}
                    value={b.id}
                    disabled={!isAvailable}
                  >
                    {b.title} — {b.author} ({b.availableCopies}/{b.totalCopies} disponible{b.availableCopies > 1 ? 's' : ''})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Step 2b: Choose copy if multiple available */}
          {selectedBook && availableCopies.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="block font-semibold text-slate-800">
                Numéro d'exemplaire :
              </label>
              <select
                value={selectedCopy?.id || ''}
                onChange={(e) => setSelectedCopyId(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
              >
                {availableCopies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.copyIdentifier} (Exemplaire n°{c.copyNumber}) — État : {c.condition}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                📍 {selectedBook.sectionName} · {selectedBook.shelfName}
              </p>
            </div>
          )}

          {/* Step 3: Due Date */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Date de retour prévue *</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Immediate effect notice */}
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-950">
            Cet exemplaire sera marqué comme <strong>« Emprunté »</strong> et son code QR sera immédiatement mis à jour avec le nom et matricule de l'étudiant.
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedBookId || !selectedMemberId}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer ${
                !selectedBookId || !selectedMemberId
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Valider l'emprunt</span>
            </button>
          </div>
        </form>
      </div>

      {/* QR Scanner Submodal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        mode="loan"
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
