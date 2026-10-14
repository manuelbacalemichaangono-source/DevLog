import React, { useState } from 'react';
import { X, CheckCircle2, RotateCcw } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCondition } from '../types/library';

interface ReturnModalProps {
  loanId: string | null;
  onClose: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ loanId, onClose }) => {
  const { loans, returnBook } = useLibrary();

  const [condition, setCondition] = useState<BookCondition>('Bon');

  if (!loanId) return null;

  const loan = loans.find((l) => l.id === loanId);
  if (!loan) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    returnBook(loan.id, condition);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Enregistrer le retour en rayon</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="py-4 space-y-4 text-xs">
          {/* Loan Overview */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div>
              <span className="text-[11px] text-slate-500">Ouvrage retourné :</span>
              <div className="font-semibold text-slate-900 text-sm">{loan.bookTitle}</div>
              <div className="text-[11px] text-slate-600">{loan.exactLocation}</div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500">Emprunteur : </span>
                <span className="font-medium text-slate-800">{loan.memberName}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Prêté le {loan.loanDate}
              </div>
            </div>
          </div>

          {/* Book physical condition */}
          <div>
            <label className="block font-semibold text-slate-800 mb-2">
              État physique de l'exemplaire restitué :
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Parfait', 'Bon', 'Légèrement abîmé', 'Endommagé'] as BookCondition[]).map(
                (cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      condition === cond
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">{cond}</div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Explanation */}
          <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            En validant, cet exemplaire repasse automatiquement à l'état <strong>« Disponible »</strong> et pourra être prêté ou réservé.
          </p>

          {/* Actions */}
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
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Valider le retour (Passer à Disponible)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
