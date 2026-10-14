import React from 'react';
import {
  BookOpen,
  ArrowLeftRight,
  CheckCircle2,
  Users,
  BookmarkCheck,
  Compass,
  Clock,
  Plus,
  BookPlus,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewLoan: () => void;
  onOpenNewBook: () => void;
  onOpenNewMember: () => void;
  onOpenReturnModal: (loanId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewLoan,
  onOpenNewBook,
  onOpenReturnModal,
}) => {
  const { stats, loans, books, activityLogs, settings } = useLibrary();

  const activeLoans = loans.filter((l) => l.status === 'En cours').slice(0, 5);

  // Genre distribution
  const genreCounts: Record<string, number> = {};
  books.forEach((b) => {
    genreCounts[b.genre] = (genreCounts[b.genre] || 0) + b.totalCopies;
  });
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {settings.libraryName}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {settings.address} · Navigation physique des rayons & gestion des 3 états (Disponible, Non disponible, Réservé)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('books')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Parcourir les Rayons</span>
            </button>
            <button
              onClick={onOpenNewLoan}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau prêt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid: Total, Disponibles, Non disponibles, Réservés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Fonds total</span>
            <BookOpen className="w-4 h-4 text-slate-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.totalBooks}
            </span>
            <span className="text-xs text-slate-500">
              exemplaires ({stats.totalTitles} titres)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Adhérents inscrits</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700">{stats.activeMembersCount}</span>
          </div>
        </div>

        {/* KPI 2: Disponibles (Green) */}
        <div className="bg-white rounded-xl border border-emerald-200 p-4 bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-semibold">Exemplaires Disponibles</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {stats.availableCopies}
            </span>
            <span className="text-xs text-slate-500">
              prêts pour emprunt
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-100 text-xs text-emerald-700">
            Peuvent être prêtés ou réservés
          </div>
        </div>

        {/* KPI 3: Non disponibles (Red) */}
        <div className="bg-white rounded-xl border border-rose-200 p-4 bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-semibold">Non disponibles (Prêtés)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-700">
              {stats.borrowedCopies}
            </span>
            <span className="text-xs text-slate-500">
              prêts actifs
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-rose-100 text-xs text-slate-600 flex items-center justify-between">
            <span>En circulation</span>
            <span className="font-mono tabular-nums font-semibold text-rose-700">{stats.activeLoansCount}</span>
          </div>
        </div>

        {/* KPI 4: Réservés (Orange) */}
        <div className="bg-white rounded-xl border border-amber-200 p-4 bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-semibold">Réservés</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
              {stats.reservedCopies}
            </span>
            <span className="text-xs text-slate-500">
              mis de côté
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100 text-xs text-amber-800 flex items-center justify-between">
            <span>En attente de retrait</span>
            <span className="font-mono tabular-nums font-semibold">{stats.activeReservationsCount}</span>
          </div>
        </div>
      </div>

      {/* Active Loans Preview (Clean list without due dates or fines) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">
            Prêts actifs en cours ({stats.activeLoansCount})
          </h4>
          <button
            onClick={() => onNavigate('loans')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Voir le registre</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {activeLoans.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Aucun prêt actif en ce moment. Tous les exemplaires sont en rayon.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{loan.bookTitle}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5 flex flex-wrap items-center gap-2">
                    <span>Emprunteur : <strong className="text-slate-700">{loan.memberName}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Date de prêt : <strong className="text-slate-700 font-mono tabular-nums">{loan.loanDate}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-700 font-medium">Non disponible</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenReturnModal(loan.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Enregistrer le retour</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">
              Répartition des ouvrages en rayon
            </h4>
            <button
              onClick={() => onNavigate('books')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Parcourir les Rayons</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {sortedGenres.map(([genre, count]) => {
              const percentage = stats.totalBooks > 0 ? Math.round((count / stats.totalBooks) * 100) : 0;
              return (
                <div key={genre} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{genre}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {count} ex. ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">
              Journal d’activité récent
            </h4>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              Temps réel
            </span>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 5).map((log) => {
              let icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
              if (log.type === 'loan') icon = <ArrowLeftRight className="w-3.5 h-3.5 text-rose-600" />;
              if (log.type === 'return') icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
              if (log.type === 'member_new') icon = <Users className="w-3.5 h-3.5 text-indigo-600" />;
              if (log.type === 'book_new') icon = <BookPlus className="w-3.5 h-3.5 text-violet-600" />;
              if (log.type === 'reservation') icon = <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />;

              return (
                <div key={log.id} className="flex items-start gap-3 text-xs pt-2 first:pt-0">
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 leading-snug">{log.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{log.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
