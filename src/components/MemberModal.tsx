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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [filiere, setFiliere] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberToEdit) {
      setLastName(memberToEdit.lastName || '');
      setFirstName(memberToEdit.firstName || '');
      setMemberNumber(memberToEdit.memberNumber || '');
      setEmail(memberToEdit.email || '');
      setPhone(memberToEdit.phone || '');
      setFiliere(memberToEdit.filiere || '');
      setError(null);
    } else {
      const year = new Date().getFullYear();
      const nextNum = members.length + 1;
      const defaultMatricule = `ETU-${year}-${String(nextNum).padStart(3, '0')}`;
      setLastName('');
      setFirstName('');
      setMemberNumber(defaultMatricule);
      setEmail('');
      setPhone('');
      setFiliere('Licence Universitaire');
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

    // Unicité du matricule
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
        email: email.trim(),
        phone: phone.trim(),
        filiere: filiere.trim(),
      });
    } else {
      addMember({
        lastName: cleanNom,
        firstName: cleanPrenom,
        memberNumber: cleanMatricule,
        email: email.trim(),
        phone: phone.trim(),
        filiere: filiere.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
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

        <p className="text-xs text-slate-500 mt-3">
          Seuls les étudiants inscrits figurant dans cette liste sont autorisés à emprunter des livres dans la bibliothèque.
        </p>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5 text-xs">
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold tracking-wide focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Filière / Promotion
            </label>
            <input
              type="text"
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
              placeholder="Ex : Informatique (L3), Lettres (M1)..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="etudiant@univ.fr"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
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
