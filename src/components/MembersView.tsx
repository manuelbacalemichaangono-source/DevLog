import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Users,
  Edit2,
  Trash2,
  GraduationCap,
  ArrowLeftRight,
  BookmarkCheck,
  ShieldCheck,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Member } from '../types/library';

interface MembersViewProps {
  onOpenNewMember: () => void;
  onEditMember: (member: Member) => void;
  onSelectMember: (member: Member) => void;
  onQuickLoanForMember: (member: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  onOpenNewMember,
  onEditMember,
  onSelectMember,
  onQuickLoanForMember,
}) => {
  const { members, loans, reservations, deleteMember } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return members;

    return members.filter((member) => {
      const matchName = `${member.firstName} ${member.lastName}`.toLowerCase().includes(q);
      const matchMatricule = member.memberNumber.toLowerCase().includes(q);
      return matchName || matchMatricule;
    });
  }, [members, searchQuery]);

  const getActiveLoansCount = (memberId: string) => {
    return loans.filter((l) => l.memberId === memberId && l.status !== 'Rendu').length;
  };

  const getActiveReservationsCount = (memberId: string) => {
    return reservations.filter((r) => r.memberId === memberId && r.status === 'Réservé').length;
  };

  return (
    <div className="space-y-5">
      {/* Explication du contrôle d'accès */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Contrôle d'accès des emprunts et réservations
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Seuls les étudiants inscrits ci-dessous sont autorisés à emprunter ou réserver des livres. Les visiteurs (non inscrits) peuvent uniquement consulter le catalogue physique.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200">
            {members.length} étudiant{members.length > 1 ? 's inscrits' : ' inscrit'}
          </span>
        </div>
      </div>

      {/* Top Search & Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, prénom ou numéro de matricule (ex : ETU-2024-001)..."
              className="w-full pl-9 pr-20 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenNewMember}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscrire un étudiant</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-900">Aucun étudiant inscrit trouvé</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Vérifiez l’orthographe du nom ou du matricule, ou inscrivez un nouvel étudiant.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Numéro de matricule</th>
                  <th className="py-3 px-4">Nom</th>
                  <th className="py-3 px-4">Prénom</th>
                  <th className="py-3 px-4 text-center">Prêts en cours</th>
                  <th className="py-3 px-4 text-center">Réservations</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredMembers.map((member) => {
                  const activeLoansCount = getActiveLoansCount(member.id);
                  const activeReservationsCount = getActiveReservationsCount(member.id);

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        <span className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200">
                          {member.memberNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {member.lastName}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {member.firstName}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {activeLoansCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                            <ArrowLeftRight className="w-3 h-3" />
                            <span>{activeLoansCount}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {activeReservationsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                            <BookmarkCheck className="w-3 h-3" />
                            <span>{activeReservationsCount}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectMember(member)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Consulter le dossier"
                          >
                            <GraduationCap className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditMember(member)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteMember(member.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
