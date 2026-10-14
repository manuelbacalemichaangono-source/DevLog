import React from 'react';
import {
  Compass,
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  BookmarkCheck,
  Settings,
  Library,
  Plus,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export type ActiveTab = 'books' | 'dashboard' | 'loans' | 'members' | 'reservations' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLoan: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLoan,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { stats, settings } = useLibrary();

  const navItems = [
    {
      id: 'books' as ActiveTab,
      label: 'Plan & Rayons (Consultation)',
      icon: Compass,
      count: stats.totalTitles,
    },
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      id: 'loans' as ActiveTab,
      label: 'Prêts & Retours',
      icon: ArrowLeftRight,
      count: stats.activeLoansCount > 0 ? stats.activeLoansCount : undefined,
    },
    {
      id: 'members' as ActiveTab,
      label: 'Adhérents',
      icon: Users,
      count: stats.totalMembers,
    },
    {
      id: 'reservations' as ActiveTab,
      label: 'Réservations',
      icon: BookmarkCheck,
      count: stats.activeReservationsCount > 0 ? stats.activeReservationsCount : undefined,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Paramètres & Sauvegardes',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Zone */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Library className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white truncate leading-none">
              BiblioTech
            </h1>
            <p className="text-[11px] text-slate-400 truncate mt-1">
              SIGB · {settings.libraryName.replace('Médiathèque Municipale ', '')}
            </p>
          </div>
        </div>

        {/* Quick action button */}
        <div className="p-4">
          <button
            onClick={() => {
              onOpenNewLoan();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-indigo-500"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Prêt</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span className="text-[11px] font-mono tabular-nums text-slate-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info - clean and factual */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Prêts actifs</span>
            <span className="font-mono tabular-nums text-slate-200 font-semibold">{stats.activeLoansCount}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Exemplaires en rayon</span>
            <span className="font-mono tabular-nums text-slate-200 font-semibold">{stats.availableCopies}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
