import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Member, MemberCategory, MemberStatus } from '../types/library';

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
  const { addMember, updateMember, settings } = useLibrary();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<MemberCategory>('Adulte');
  const [status, setStatus] = useState<MemberStatus>('Actif');
  const [expiryDate, setExpiryDate] = useState('');
  const [maxLoans, setMaxLoans] = useState<number>(settings.defaultMaxLoans);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setFirstName(memberToEdit.firstName);
      setLastName(memberToEdit.lastName);
      setEmail(memberToEdit.email);
      setPhone(memberToEdit.phone);
      setCategory(memberToEdit.category);
      setStatus(memberToEdit.status);
      setExpiryDate(memberToEdit.expiryDate);
      setMaxLoans(memberToEdit.maxLoans);
      setNotes(memberToEdit.notes || '');
    } else {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const defExp = nextYear.toISOString().split('T')[0];

      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setCategory('Adulte');
      setStatus('Actif');
      setExpiryDate(defExp);
      setMaxLoans(settings.defaultMaxLoans);
      setNotes('');
    }
  }, [memberToEdit, isOpen, settings.defaultMaxLoans]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    if (memberToEdit) {
      updateMember(memberToEdit.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || 'Non renseigné',
        category,
        status,
        expiryDate,
        maxLoans: Number(maxLoans),
        notes: notes.trim(),
      });
    } else {
      addMember({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || '06 00 00 00 00',
        category,
        expiryDate,
        status,
        maxLoans: Number(maxLoans),
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {memberToEdit ? 'Modifier le dossier adhérent' : 'Inscrire un nouvel adhérent'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex : Camille"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Nom de famille *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex : Martin"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Adresse email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.fr"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Catégorie tarifaire *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemberCategory)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="Adulte">Adulte</option>
                <option value="Étudiant">Étudiant</option>
                <option value="Enseignant">Enseignant</option>
                <option value="Enfant">Enfant</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Statut d'adhésion</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Expiré">Expiré</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Date d'expiration de la carte</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Quota max de prêts simultanés</label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxLoans}
                onChange={(e) => setMaxLoans(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">Notes & Observations</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Centres d'intérêt, remarques de gestion..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

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
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              {memberToEdit ? 'Enregistrer les modifications' : 'Créer la carte adhérent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
