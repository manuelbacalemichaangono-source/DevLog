import React from 'react';
import {
  X,
  User,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  Edit2,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Member } from '../types/library';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onQuickLoan: (member: Member) => void;
  onOpenReturnModal: (loanId: string) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  onEdit,
  onQuickLoan,
  onOpenReturnModal,
}) => {
  const { loans, renewMemberCard, settings } = useLibrary();

  if (!member) return null;

  const memberLoans = loans.filter((l) => l.memberId === member.id);
  const activeLoans = memberLoans.filter((l) => l.status !== 'Rendu');
  const pastLoans = memberLoans.filter((l) => l.status === 'Rendu');

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Dossier Lecteur · {member.firstName} {member.lastName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Virtual Membership Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-widest text-indigo-300 uppercase font-semibold">
                  Carte Médiathèque
                </span>
                <h4 className="text-base font-bold tracking-tight">
                  {member.firstName} {member.lastName}
                </h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 font-medium">
                {member.category}
              </span>
            </div>

            <div className="flex items-end justify-between pt-2 border-t border-white/10 text-white/80">
              <div>
                <div className="text-[10px] text-white/50">Identifiant adhérent</div>
                <div className="font-mono text-sm tracking-wider font-semibold text-white">
                  {member.memberNumber}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/50">Validité cotisation</div>
                <div className="font-mono text-xs text-white">
                  {member.expiryDate} ({member.status})
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Prêts actifs</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {activeLoans.length} / {member.maxLoans}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Emprunts passés (restitués)</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {pastLoans.length}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Courriel :</span>
              </span>
              <span className="font-medium text-slate-900">{member.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Téléphone :</span>
              </span>
              <span className="font-mono tabular-nums text-slate-900">{member.phone}</span>
            </div>
            {member.notes && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 block">Observations :</span>
                <p className="text-slate-700 mt-0.5">{member.notes}</p>
              </div>
            )}
          </div>

          {/* Active Loans list */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Livres actuellement empruntés ({activeLoans.length})
            </h4>

            {activeLoans.length === 0 ? (
              <div className="p-3 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                Aucun livre en cours d’emprunt pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {activeLoans.map((loan) => (
                  <div key={loan.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{loan.bookTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Emprunté le {loan.loanDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-700 font-semibold">Non disponible</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenReturnModal(loan.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Enregistrer retour
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>

            {member.status === 'Expiré' && (
              <button
                onClick={() => renewMemberCard(member.id)}
                className="px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 font-semibold"
              >
                Renouveler 1 an
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Fermer
            </button>

            {member.status === 'Actif' && activeLoans.length < member.maxLoans && (
              <button
                onClick={() => {
                  onClose();
                  onQuickLoan(member);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau prêt</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
