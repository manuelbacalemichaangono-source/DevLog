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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Enregistrer la restitution</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="py-4 space-y-4 text-xs">
          {/* Loan Overview */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Ouvrage restitué :</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{loan.bookTitle}</div>
              <div className="text-[11px] font-mono text-indigo-700 font-semibold mt-0.5">
                Exemplaire {loan.copyIdentifier}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-500">Emprunteur : </span>
                <strong className="text-slate-800">{loan.memberName}</strong>
              </div>
              <div className="text-slate-500 font-mono">
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
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      condition === cond
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
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
          <p className="text-[11px] text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 leading-relaxed">
            En confirmant, cet exemplaire repasse immédiatement à l'état <strong>« Disponible »</strong> et pourra être emprunté par un autre étudiant. Le statut de l'emprunt sera marqué comme <strong>« Terminé »</strong>.
          </p>

          {/* Actions */}
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
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmer le retour (Rendre disponible)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
