import React, { useState, useEffect } from 'react';
import { X, UserPlus, GraduationCap, Check } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Member } from '../types/library';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
}) => {
  const { addMember, updateMember, members } = useLibrary();

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberToEdit) {
      setLastName(memberToEdit.lastName || '');
      setFirstName(memberToEdit.firstName || '');
      setMemberNumber(memberToEdit.memberNumber || '');
      setError(null);
    } else {
      const year = new Date().getFullYear();
      const nextNum = members.length + 1;
      const defaultMatricule = `ETU-${year}-${String(nextNum).padStart(3, '0')}`;
      setLastName('');
      setFirstName('');
      setMemberNumber(defaultMatricule);
      setError(null);
    }
  }, [memberToEdit, isOpen, members.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNom = lastName.trim();
    const cleanPrenom = firstName.trim();
    const cleanMatricule = memberNumber.trim().toUpperCase();

    if (!cleanNom || !cleanPrenom || !cleanMatricule) {
      setError('Veuillez renseigner le nom, le prénom et le numéro de matricule.');
      return;
    }

    // Vérifier l'unicité du matricule
    const duplicate = members.find(
      (m) =>
        m.memberNumber.trim().toUpperCase() === cleanMatricule &&
        m.id !== memberToEdit?.id
    );

    if (duplicate) {
      setError(`Le numéro de matricule "${cleanMatricule}" est déjà attribué à un autre étudiant.`);
      return;
    }

    if (memberToEdit) {
      updateMember(memberToEdit.id, {
        lastName: cleanNom,
        firstName: cleanPrenom,
        memberNumber: cleanMatricule,
      });
    } else {
      addMember({
        lastName: cleanNom,
        firstName: cleanPrenom,
        memberNumber: cleanMatricule,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {memberToEdit ? 'Modifier l’étudiant inscrit' : 'Inscrire un étudiant'}
            </h3>
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

        {/* Info reminder */}
        <p className="text-xs text-slate-500 mt-3">
          Seuls les étudiants inscrits figurant dans cette liste sont autorisés à emprunter ou réserver des livres dans la bibliothèque.
        </p>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* Form Body - Only Nom, Prénom, Numéro de matricule */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Numéro de matricule (identifiant unique) *
            </label>
            <input
              type="text"
              required
              value={memberNumber}
              onChange={(e) => setMemberNumber(e.target.value.toUpperCase())}
              placeholder="Ex : ETU-2024-001"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold tracking-wide focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Identifiant unique demandé lors de l'emprunt ou de la réservation.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Nom de famille *
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ex : Martin"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex : Thomas"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{memberToEdit ? 'Enregistrer les modifications' : 'Confirmer l’inscription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
