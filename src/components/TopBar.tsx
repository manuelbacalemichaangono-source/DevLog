import React from 'react';
import { Menu, Plus, Camera } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface TopBarProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenNewLoan: () => void;
  onOpenQRScanner?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenNewLoan,
  onOpenQRScanner,
}) => {
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'student':
        return 'Tableau de bord · Étudiant';
      case 'books':
        return 'Tableau de bord · Ouvrage';
      case 'loans':
        return 'Tableau de bord · Emprunt';
    }
  };

  return (
    <header className="min-h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden md:inline text-xs font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
            BiblioTech
          </span>
          <span className="hidden md:inline text-slate-300 shrink-0" aria-hidden="true">/</span>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 whitespace-normal break-words">
            {getTabTitle(activeTab)}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onOpenQRScanner && (
          <button
            type="button"
            onClick={onOpenQRScanner}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Scanner le code QR d'un exemplaire"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Scanner QR</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenNewLoan}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvel Emprunt</span>
        </button>
      </div>
    </header>
  );
};
