import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

interface LoansViewProps {
  onOpenNewLoan: () => void;
  onOpenReturnModal: (loanId: string) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  onOpenNewLoan,
  onOpenReturnModal,
}) => {
  const { loans } = useLibrary();

  const [activeTab, setActiveTab] = useState<'active' | 'returned'>('active');

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      if (activeTab === 'active') return loan.status === 'En cours';
      if (activeTab === 'returned') return loan.status === 'Rendu';
      return true;
    });
  }, [loans, activeTab]);

  const activeCount = loans.filter((l) => l.status === 'En cours').length;
  const returnedCount = loans.filter((l) => l.status === 'Rendu').length;

  return (
    <div className="space-y-5">
      {/* Search and Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'active'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prêts actifs ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('returned')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                activeTab === 'returned'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historique des retours ({returnedCount})
            </button>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onOpenNewLoan}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau prêt</span>
          </button>
        </div>
      </div>

      {/* Loans Table */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-900">Aucun prêt répertorié</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'Aucun prêt n’est actuellement en cours. Tous les exemplaires sont en rayon ou réservés.'
              : 'L’historique des retours est vide.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Ouvrage & Exemplaire physique</th>
                  <th className="py-3 px-3">Adhérent emprunteur</th>
                  <th className="py-3 px-3">Date d'emprunt</th>
                  <th className="py-3 px-3">État de l'exemplaire</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredLoans.map((loan) => {
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Book & copy location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{loan.bookTitle}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {loan.exactLocation}
                        </div>
                      </td>

                      {/* Borrower */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-900">{loan.memberName}</div>
                        <div className="text-slate-500 text-[11px] truncate">{loan.memberEmail}</div>
                      </td>

                      {/* Loan Date */}
                      <td className="py-3.5 px-3 text-slate-600 font-mono tabular-nums">
                        {loan.loanDate}
                      </td>

                      {/* Status Tag */}
                      <td className="py-3.5 px-3">
                        {loan.status === 'En cours' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            <span>Non disponible</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Rendu ({loan.returnDate})</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {loan.status === 'En cours' ? (
                          <button
                            onClick={() => onOpenReturnModal(loan.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs inline-flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Enregistrer retour</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Remis en rayon ({loan.conditionOnReturn || 'Bon'})
                          </span>
                        )}
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
