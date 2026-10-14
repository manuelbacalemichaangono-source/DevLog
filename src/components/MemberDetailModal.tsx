import React from 'react';
import {
  X,
  GraduationCap,
  RotateCcw,
  Plus,
  BookmarkCheck,
  ArrowLeftRight,
  Edit2,
  ShieldCheck,
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
  const { loans, reservations } = useLibrary();

  if (!member) return null;

  const memberLoans = loans.filter((l) => l.memberId === member.id);
  const activeLoans = memberLoans.filter((l) => l.status !== 'Rendu');
  const pastLoans = memberLoans.filter((l) => l.status === 'Rendu');
  const memberReservations = reservations.filter(
    (r) => r.memberId === member.id && r.status === 'Réservé'
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Dossier Étudiant · {member.firstName} {member.lastName}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Student ID Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-widest text-indigo-300 uppercase font-semibold">
                  Étudiant Inscrit
                </span>
                <h4 className="text-base font-bold tracking-tight">
                  {member.firstName} {member.lastName}
                </h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Accès autorisé</span>
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-white/80">
              <div>
                <div className="text-[10px] text-white/50">Numéro de matricule (identifiant unique)</div>
                <div className="font-mono text-sm tracking-wider font-bold text-white">
                  {member.memberNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Prêts en cours</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {activeLoans.length}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Réservations actives</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {memberReservations.length}
              </span>
            </div>
          </div>

          {/* Active Loans list */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
              <span>Livres actuellement empruntés ({activeLoans.length})</span>
            </h4>

            {activeLoans.length === 0 ? (
              <div className="p-3 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                Aucun livre en cours d’emprunt.
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
                        <span className="text-rose-700 font-semibold">Indisponible</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenReturnModal(loan.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Retourner
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Reservations list */}
          {memberReservations.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">
                Réservations actives ({memberReservations.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {memberReservations.map((res) => (
                  <div key={res.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{res.bookTitle}</div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Exemplaire n°{res.copyNumber} · Réservé le {res.reservationDate}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      Réservé
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(member);
            }}
            className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Modifier</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
