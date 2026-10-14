import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  Users,
  Edit2,
  Trash2,
  RotateCcw,
  Plus,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Member, MemberCategory, MemberStatus } from '../types/library';

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
  const { members, loans, deleteMember, renewMemberCard } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(q) ||
        member.memberNumber.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.phone.includes(q);

      const matchesCat = selectedCategory === 'all' || member.category === selectedCategory;
      const matchesStat = selectedStatus === 'all' || member.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStat;
    });
  }, [members, searchQuery, selectedCategory, selectedStatus]);

  const categories: MemberCategory[] = ['Adulte', 'Étudiant', 'Enseignant', 'Enfant', 'Senior'];

  // Helper for active loans of a member
  const getActiveLoansCount = (memberId: string) => {
    return loans.filter((l) => l.memberId === memberId && l.status !== 'Rendu').length;
  };

  return (
    <div className="space-y-5">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, n° d'adhérent (ADH-...), email ou téléphone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                Effacer
              </button>
            )}
          </div>

          <button
            onClick={onOpenNewMember}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nouvel adhérent</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">Catégorie :</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
          >
            <option value="all">Toutes ({members.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <span className="text-slate-500 ml-3">Statut :</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Suspendu">Suspendu</option>
            <option value="Expiré">Expiré</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-900">Aucun adhérent trouvé</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Vérifiez l’orthographe de votre recherche ou ajoutez un nouveau dossier d’adhérent.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Adhérent & Identifiant</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Catégorie</th>
                  <th className="py-3 px-3">Prêts en cours</th>
                  <th className="py-3 px-3">Validité carte</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredMembers.map((member) => {
                  const activeLoansCount = getActiveLoansCount(member.id);
                  const isQuotaFull = activeLoansCount >= member.maxLoans;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onSelectMember(member)}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-slate-500 text-[11px] font-mono tabular-nums mt-0.5">
                          {member.memberNumber}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-700">{member.email}</div>
                        <div className="text-slate-500 text-[11px] font-mono tabular-nums mt-0.5">
                          {member.phone}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 font-medium">{member.category}</span>
                      </td>

                      {/* Active loans / quota */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-mono tabular-nums font-semibold ${
                            isQuotaFull ? 'text-rose-700' : 'text-slate-800'
                          }`}
                        >
                          {activeLoansCount} / {member.maxLoans} livres
                        </span>
                        {isQuotaFull && (
                          <div className="text-[10px] text-rose-600 font-sans mt-0.5">
                            Quota atteint
                          </div>
                        )}
                      </td>

                      {/* Expiry & Status */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {member.status === 'Actif' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          {member.status === 'Expiré' && (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          {member.status === 'Suspendu' && (
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                          <span className="font-medium text-slate-800">{member.status}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] font-mono tabular-nums mt-0.5">
                          Jusqu'au {member.expiryDate}
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {member.status === 'Actif' && !isQuotaFull && (
                            <button
                              onClick={() => onQuickLoanForMember(member)}
                              className="px-2 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                              title="Enregistrer un prêt pour cet adhérent"
                            >
                              Prêter
                            </button>
                          )}

                          {member.status === 'Expiré' && (
                            <button
                              onClick={() => renewMemberCard(member.id)}
                              className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                              title="Prolonger la carte d'un an"
                            >
                              Renouveler
                            </button>
                          )}

                          <button
                            onClick={() => onEditMember(member)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Supprimer le dossier de ${member.firstName} ${member.lastName} ?`)) {
                                deleteMember(member.id);
                              }
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
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
