import React, { useState, useEffect } from 'react';
import {
  User,
  UserPlus,
  X,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  QrCode,
  Printer,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Member, Loan, Book, BookCopy } from '../types/library';
import { CopyQRModal } from './CopyQRModal';
import { generateQRCodeDataUrl, buildCopyQRPayload } from '../utils/qrHelper';

interface StudentSectionProps {
  onOpenNewMember: () => void;
  onOpenReturnModal: (loanId: string) => void;
}

// Inline QR thumbnail for each borrowed copy
const BorrowedCopyQRItem: React.FC<{
  loan: Loan;
  book?: Book;
  copy?: BookCopy;
  student: Member;
  isOverdue: boolean;
  daysOverdue: number;
  onOpenReturn: () => void;
  onInspectQR: () => void;
}> = ({
  loan,
  book,
  copy,
  student,
  isOverdue,
  daysOverdue,
  onOpenReturn,
  onInspectQR,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    if (book && copy) {
      const payload = buildCopyQRPayload(book, copy, loan, student);
      generateQRCodeDataUrl(payload, { width: 140, margin: 1 }).then((url) => {
        if (active) setQrUrl(url);
      });
    } else {
      // Fallback simple payload if exact book/copy not found
      generateQRCodeDataUrl(
        JSON.stringify({
          copyIdentifier: loan.copyIdentifier,
          title: loan.bookTitle,
          author: loan.bookAuthor,
          status: 'Emprunté',
          borrower: {
            name: `${student.firstName} ${student.lastName}`,
            memberNumber: student.memberNumber,
          },
        }),
        { width: 140, margin: 1 }
      ).then((url) => {
        if (active) setQrUrl(url);
      });
    }
    return () => {
      active = false;
    };
  }, [loan, book, copy, student]);

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        isOverdue ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: QR Code thumbnail + Book Details */}
        <div className="flex items-start gap-3 min-w-0">
          {/* QR thumbnail */}
          <div
            onClick={onInspectQR}
            title="Cliquer pour agrandir ou imprimer le QR"
            className="w-16 h-16 bg-white border border-slate-200 rounded-lg p-1 shrink-0 flex items-center justify-center cursor-pointer shadow-2xs hover:border-indigo-400 group relative"
          >
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`QR ${loan.copyIdentifier}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <QrCode className="w-6 h-6 text-slate-300 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
              <QrCode className="w-5 h-5 text-indigo-700 bg-white/90 p-0.5 rounded shadow-xs" />
            </div>
          </div>

          {/* Book and copy info */}
          <div className="space-y-0.5 min-w-0">
            <div className="font-bold text-slate-900 text-xs truncate">
              {loan.bookTitle}
            </div>
            <div className="text-slate-500 text-[11px]">
              Exemplaire : <strong className="font-mono text-indigo-700">{loan.copyIdentifier || `Exemplaire n°${loan.copyNumber}`}</strong>
              {loan.exactLocation && (
                <span className="text-slate-400 block sm:inline sm:ml-1">
                  · 📍 {loan.exactLocation}
                </span>
              )}
            </div>

            <div className="text-slate-500 text-[11px] flex flex-wrap items-center gap-2 pt-0.5">
              <span>Prêté le <strong className="font-mono text-slate-700">{loan.loanDate}</strong></span>
              <span aria-hidden="true">·</span>
              <span>
                Retour prévu :{' '}
                <strong
                  className={`font-mono ${
                    isOverdue ? 'text-rose-700 font-bold' : 'text-slate-900'
                  }`}
                >
                  {loan.dueDate}
                </strong>
              </span>
            </div>

            {isOverdue && (
              <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>En retard de {daysOverdue} jour(s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right actions: View QR + Return button */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onInspectQR}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1 border border-indigo-200 cursor-pointer shadow-2xs"
            title="Agrandir ou imprimer le QR"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Code QR</span>
          </button>

          <button
            type="button"
            onClick={onOpenReturn}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restituer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const StudentSection: React.FC<StudentSectionProps> = ({
  onOpenNewMember,
  onOpenReturnModal,
}) => {
  const { members, loans, books, getLoanOverdueInfo } = useLibrary();

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<Member | null>(null);

  // Selected QR modal preview
  const [inspectQRData, setInspectQRData] = useState<{
    book: Book;
    copy: BookCopy;
    loan: Loan;
    member: Member;
  } | null>(null);

  // Student active loans when modal is opened
  const studentLoans = selectedStudent
    ? loans.filter((l) => l.memberId === selectedStudent.id && l.status !== 'Terminé')
    : [];

  const handleOpenQRForLoan = (loan: Loan, student: Member) => {
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
        borrowerName: `${student.firstName} ${student.lastName}`,
        borrowerMemberNumber: student.memberNumber,
        borrowerMemberId: student.id,
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
      member: student,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Étudiants
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cliquez sur « Voir les détails » pour afficher la fiche complète, le matricule et les livres empruntés avec leur code QR.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewMember}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inscrire un étudiant</span>
        </button>
      </div>

      {/* Students list: DIRECTLY VISIBLE ONLY NOM ET PRÉNOM, and the button */}
      <div className="space-y-3">
        {members.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:border-slate-300"
          >
            {/* ONLY NOM ET PRÉNOM DIRECTLY VISIBLE */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center shrink-0">
                {student.firstName[0]}
                {student.lastName[0]}
              </div>
              <span className="text-base font-bold text-slate-900 truncate">
                {student.lastName} {student.firstName}
              </span>
            </div>

            {/* BUTTON TO SHOW ALL INFORMATION */}
            <button
              type="button"
              onClick={() => setSelectedStudent(student)}
              className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs shrink-0"
            >
              Voir les détails
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: SHOWN ONLY AFTER CLICKING THE BUTTON */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Informations complètes de l'étudiant
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Nom, Prénom & Matricule */}
              <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-2">
                <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                  Fiche de l'étudiant
                </div>
                <div className="text-base font-bold">
                  {selectedStudent.lastName} {selectedStudent.firstName}
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Numéro de matricule :</span>
                  <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2 py-0.5 rounded">
                    {selectedStudent.memberNumber}
                  </span>
                </div>
              </div>

              {/* Informaciones basicas */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Informations de base :
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Adresse e-mail :</span>
                    <span className="font-medium text-slate-900">{selectedStudent.email || 'Non renseignée'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Téléphone :</span>
                    <span className="font-medium text-slate-900">{selectedStudent.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Filière / Promotion :</span>
                    <span className="font-medium text-slate-900">{selectedStudent.filiere || 'Étudiant'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statut de l'inscription :</span>
                    <span className="text-emerald-700 font-semibold">{selectedStudent.status || 'Actif'}</span>
                  </div>
                </div>
              </div>

              {/* Libros prestados con código QR para cada ejemplar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Exemplaires actuellement prêtés ({studentLoans.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Chaque exemplaire affiche son code QR
                  </span>
                </div>

                {studentLoans.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Aucun livre en cours d'emprunt pour cet étudiant.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {studentLoans.map((loan) => {
                      const overdue = getLoanOverdueInfo(loan);
                      const matchingBook = books.find((b) => b.id === loan.bookId);
                      const matchingCopy = matchingBook?.copies?.find(
                        (c) => c.id === loan.copyId || c.copyIdentifier === loan.copyIdentifier
                      );

                      return (
                        <BorrowedCopyQRItem
                          key={loan.id}
                          loan={loan}
                          book={matchingBook}
                          copy={matchingCopy}
                          student={selectedStudent}
                          isOverdue={overdue.isOverdue}
                          daysOverdue={overdue.daysOverdue}
                          onOpenReturn={() => {
                            setSelectedStudent(null);
                            onOpenReturnModal(loan.id);
                          }}
                          onInspectQR={() => handleOpenQRForLoan(loan, selectedStudent)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect QR Modal from Student View */}
      {inspectQRData && (
        <CopyQRModal
          isOpen={true}
          onClose={() => setInspectQRData(null)}
          book={inspectQRData.book}
          copy={inspectQRData.copy}
          loan={inspectQRData.loan}
          member={inspectQRData.member}
          onQuickReturn={(loanId) => {
            setInspectQRData(null);
            setSelectedStudent(null);
            onOpenReturnModal(loanId);
          }}
        />
      )}
    </div>
  );
};
