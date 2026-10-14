import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, User, Check, AlertCircle, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookCopy, Member } from '../types/library';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBook?: Book | null;
  preselectedCopy?: BookCopy | null;
  preselectedMember?: Member | null;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen,
  onClose,
  preselectedBook,
  preselectedCopy,
  preselectedMember,
}) => {
  const { sections, books, members, loans, borrowBook, settings } = useLibrary();

  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBook?.id || '');
  const [selectedCopyId, setSelectedCopyId] = useState<string>(preselectedCopy?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(preselectedMember?.id || '');

  // Manual step navigation for picking a book if not preselected
  const [pickSectionId, setPickSectionId] = useState<string>('');
  const [pickThemeId, setPickThemeId] = useState<string>('');
  const [pickShelfId, setPickShelfId] = useState<string>('');

  // Sync if preselected props change
  useEffect(() => {
    if (preselectedBook) {
      setSelectedBookId(preselectedBook.id);
      setPickSectionId(preselectedBook.sectionId);
      setPickThemeId(preselectedBook.themeId);
      setPickShelfId(preselectedBook.shelfId);
    }
  }, [preselectedBook]);

  useEffect(() => {
    if (preselectedCopy) {
      setSelectedCopyId(preselectedCopy.id);
    }
  }, [preselectedCopy]);

  useEffect(() => {
    if (preselectedMember) setSelectedMemberId(preselectedMember.id);
  }, [preselectedMember]);

  if (!isOpen) return null;

  // Selected entities
  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedCopy = selectedBook?.copies?.find((c) => c.id === selectedCopyId) || selectedBook?.copies?.find((c) => c.status === 'Disponible');
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  // Active loans for member
  const memberActiveLoansCount = selectedMember
    ? loans.filter((l) => l.memberId === selectedMember.id && l.status !== 'Rendu').length
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) return;

    const res = borrowBook(selectedBookId, selectedMemberId, selectedCopy?.id);
    if (res.success) {
      onClose();
      setSelectedBookId('');
      setSelectedCopyId('');
      setSelectedMemberId('');
      setPickSectionId('');
      setPickThemeId('');
      setPickShelfId('');
    }
  };

  // Hierarchy helpers for manual picking
  const activeSection = sections.find((s) => s.id === pickSectionId);
  const activeTheme = activeSection?.themes.find((t) => t.id === pickThemeId);
  const activeShelf = activeTheme?.shelves.find((sh) => sh.id === pickShelfId);
  const availableBooksOnShelf = pickShelfId
    ? books.filter((b) => b.shelfId === pickShelfId && b.availableCopies > 0)
    : [];

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enregistrer un prêt au guichet</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sélection de l'adhérent et de l'exemplaire physique rangé en médiathèque.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Step 1: Select Member */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>1. Étudiant inscrit emprunteur</span>
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
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Choisir un étudiant inscrit --</option>
              {members.map((m) => {
                const count = loans.filter((l) => l.memberId === m.id && l.status !== 'Rendu').length;
                const maxAllowed = m.maxLoans || 5;
                const isFull = count >= maxAllowed;
                const isInactive = m.status && m.status !== 'Actif';
                return (
                  <option
                    key={m.id}
                    value={m.id}
                    disabled={isFull || !!isInactive}
                  >
                    {m.firstName} {m.lastName} (Matricule : {m.memberNumber}) [{count} prêt(s)]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Step 2: Select Book via Physical Library Navigation */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>2. Choix de l'exemplaire physique</span>
              {selectedBook && (
                <span className="font-normal text-emerald-700 font-semibold">
                  {selectedBook.availableCopies} en rayon
                </span>
              )}
            </label>

            {selectedBook ? (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{selectedBook.title}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBookId('');
                      setSelectedCopyId('');
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Changer d'ouvrage
                  </button>
                </div>
                <div className="text-[11px] text-slate-600">
                  {selectedBook.author} · {selectedBook.isbn}
                </div>
                {selectedCopy && (
                  <div className="text-[11px] text-slate-800 font-medium pt-1 border-t border-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{selectedCopy.exactLocation}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <p className="text-[11px] text-slate-500">
                  Parcourez les rayons de la bibliothèque pour localiser l'ouvrage à prêter :
                </p>

                {/* Level 1: Section */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">1. Section :</label>
                  <select
                    value={pickSectionId}
                    onChange={(e) => {
                      setPickSectionId(e.target.value);
                      setPickThemeId('');
                      setPickShelfId('');
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                  >
                    <option value="">-- Sélectionner une section --</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} : {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level 2: Theme */}
                {activeSection && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">2. Rayon / Thématique :</label>
                    <select
                      value={pickThemeId}
                      onChange={(e) => {
                        setPickThemeId(e.target.value);
                        setPickShelfId('');
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                    >
                      <option value="">-- Sélectionner une thématique --</option>
                      {activeSection.themes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Level 3: Shelf */}
                {activeTheme && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">3. Étagère :</label>
                    <select
                      value={pickShelfId}
                      onChange={(e) => setPickShelfId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                    >
                      <option value="">-- Sélectionner l'étagère --</option>
                      {activeTheme.shelves.map((sh) => (
                        <option key={sh.id} value={sh.id}>
                          {sh.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Level 4: Books on shelf */}
                {pickShelfId && (
                  <div className="space-y-1 pt-2 border-t border-slate-200">
                    <label className="text-[11px] font-medium text-slate-700">
                      4. Livres rangés sur cette étagère :
                    </label>
                    {availableBooksOnShelf.length === 0 ? (
                      <p className="text-[11px] text-rose-600">
                        Aucun exemplaire disponible sur cette étagère.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {availableBooksOnShelf.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setSelectedBookId(b.id);
                              const freeCopy = b.copies?.find((c) => c.status === 'Disponible');
                              if (freeCopy) setSelectedCopyId(freeCopy.id);
                            }}
                            className="w-full text-left p-2 rounded bg-white hover:bg-indigo-50 border border-slate-200 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">{b.title}</div>
                              <div className="text-[11px] text-slate-500">{b.author}</div>
                            </div>
                            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                              {b.availableCopies} dispo
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Copy status flow notice */}
          <div className="bg-rose-50/60 rounded-lg p-3 border border-rose-200 text-xs text-rose-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>Passage immédiat à l'état « Indisponible »</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Une fois le prêt validé, cet exemplaire sera marqué comme prêté et ne pourra plus être emprunté par un autre adhérent jusqu'à son retour en rayon.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedBookId || !selectedMemberId}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${
                !selectedBookId || !selectedMemberId
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              Valider le prêt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
