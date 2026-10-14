import React from 'react';
import { Menu, UserPlus, ArrowLeftRight } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface TopBarProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenNewLoan: () => void;
  onOpenNewMember: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenNewLoan,
  onOpenNewMember,
}) => {
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'books':
        return 'Plan & Consultation des Rayons';
      case 'dashboard':
        return 'Tableau de bord général';
      case 'loans':
        return 'Registre des Prêts & Retours';
      case 'members':
        return 'Fichier des Adhérents';
      case 'reservations':
        return 'File d’attente des Réservations';
      case 'settings':
        return 'Paramètres & Configuration';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Menu & Titre Complet - Aucun bouton ne le recouvre, aucun texte coupé */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden md:inline text-xs font-medium text-slate-400 shrink-0">Médiathèque</span>
          <span className="hidden md:inline text-slate-300 shrink-0" aria-hidden="true">/</span>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate">
            {getTabTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Côté droit : date ou actions contextuelles (hors consultation des rayons) */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline font-mono tabular-nums text-xs text-slate-500">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>

        {activeTab === 'members' && (
          <button
            onClick={onOpenNewMember}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nouvel adhérent</span>
          </button>
        )}

        {(activeTab === 'dashboard' || activeTab === 'loans' || activeTab === 'reservations' || activeTab === 'settings') && (
          <button
            onClick={onOpenNewLoan}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Enregistrer un prêt</span>
          </button>
        )}
      </div>
    </header>
  );
};
