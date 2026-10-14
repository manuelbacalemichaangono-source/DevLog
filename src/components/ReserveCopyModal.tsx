import React, { useState } from 'react';
import { X, BookmarkCheck, Check } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookCopy } from '../types/library';

interface ReserveCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  copy: BookCopy | null;
}

export const ReserveCopyModal: React.FC<ReserveCopyModalProps> = ({
  isOpen,
  onClose,
  book,
  copy,
}) => {
  const { members, reserveBook } = useLibrary();
  const [selectedMemberId, setSelectedMemberId] = useState('');

  if (!isOpen || !book || !copy) return null;

  const activeMembers = members.filter((m) => m.status === 'Actif');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    reserveBook(book.id, selectedMemberId, copy.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Réserver cet exemplaire</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="py-4 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900 text-sm">{book.title}</div>
            <div className="text-slate-600">Auteur : {book.author}</div>
            <div className="text-slate-500 font-mono text-[11px] mt-1">
              Exemplaire n°{copy.copyNumber} · {copy.exactLocation}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Choisir l'adhérent qui réserve l'ouvrage :
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              required
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
            >
              <option value="">-- Sélectionnez un adhérent actif --</option>
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.memberNumber})
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            L'exemplaire passera immédiatement à <strong>« Réservé »</strong> (orange) et ne pourra plus être emprunté par d'autres personnes.
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedMemberId}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmer la réservation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
