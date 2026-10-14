import React from 'react';
import {
  Users,
  BookOpen,
  ArrowLeftRight,
  Library,
  Plus,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export type ActiveTab = 'student' | 'books' | 'loans';

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
  const { stats } = useLibrary();

  const navItems = [
    {
      id: 'student' as ActiveTab,
      label: 'Étudiant',
      icon: Users,
      count: stats.totalMembers,
    },
    {
      id: 'books' as ActiveTab,
      label: 'Ouvrage',
      icon: BookOpen,
      count: stats.totalTitles,
    },
    {
      id: 'loans' as ActiveTab,
      label: 'Emprunt',
      icon: ArrowLeftRight,
      count: stats.activeLoansCount,
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
              Tableau de Bord
            </p>
          </div>
        </div>

        {/* Quick action: Nouvel Emprunt */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => {
              onOpenNewLoan();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Emprunt</span>
          </button>
        </div>

        {/* Navigation list: 3 items: Étudiant, Ouvrage, Emprunt */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate text-sm">{item.label}</span>
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

        {/* Simple Footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Livres prêtés</span>
          <span className="font-mono tabular-nums text-white font-bold">{stats.activeLoansCount}</span>
        </div>
      </aside>
    </>
  );
};
