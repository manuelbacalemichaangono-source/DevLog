import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  AlertCircle,
  Check,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookCopy, Member } from '../types/library';

interface StudentIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'borrow' | 'reserve';
  book?: Book | null;
  copy?: BookCopy | null;
  onIdentified: (student: Member) => void;
}

export const StudentIdentificationModal: React.FC<StudentIdentificationModalProps> = ({
  isOpen,
  onClose,
  actionType,
  book,
  copy,
  onIdentified,
}) => {
  const { members, verifyStudent } = useLibrary();

  const [matricule, setMatricule] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMatricule('');
      setLastName('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const { student, error } = verifyStudent(matricule, lastName);

    if (!student || error) {
      // Message exact requis :
      // « Accès refusé : seuls les étudiants inscrits peuvent emprunter ou réserver un livre. Vous pouvez consulter les livres, mais pas les emprunter. »
      setErrorMessage(
        error ||
          'Accès refusé : seuls les étudiants inscrits peuvent emprunter ou réserver un livre. Vous pouvez consulter les livres, mais pas les emprunter.'
      );
      return;
    }

    // Succès : l'étudiant est identifié et l'action continue
    onIdentified(student);
    onClose();
  };

  const fillExampleStudent = (m: Member) => {
    setMatricule(m.memberNumber);
    setLastName(m.lastName);
    setErrorMessage(null);
  };

  const actionLabel = actionType === 'borrow' ? 'emprunter' : 'réserver';
  const modalTitle =
    actionType === 'borrow'
      ? 'Identification · Emprunter un livre'
      : 'Identification · Réserver un exemplaire';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{modalTitle}</h3>
              <p className="text-[11px] text-slate-500">Contrôle d'accès étudiant obligatoire</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Détail de l'ouvrage et de l'exemplaire concerné */}
        {book && copy && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 truncate">{book.title}</div>
              <div className="text-slate-500 text-[11px] truncate">
                {book.author} · Exemplaire n°{copy.copyNumber}
              </div>
              <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{copy.exactLocation}</span>
              </div>
            </div>
          </div>
        )}

        {/* Message d'erreur bloquant en cas de non correspondance */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-xs text-rose-900 shadow-xs animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-rose-950">Accès non autorisé</div>
              <p className="leading-relaxed font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Formulaire d'identification */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Numéro de matricule étudiant *
            </label>
            <input
              type="text"
              required
              value={matricule}
              onChange={(e) => {
                setMatricule(e.target.value.toUpperCase());
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Ex : ETU-2024-001"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold tracking-wide focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Nom de famille de l'étudiant *
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Ex : Martin"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Raccourcis d'exemple pour tester facilement */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Étudiants inscrits (cliquez pour tester) :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {members.slice(0, 4).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => fillExampleStudent(m)}
                  className="px-2 py-1 rounded-md text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  {m.firstName} {m.lastName} ({m.memberNumber})
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Valider et {actionLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
