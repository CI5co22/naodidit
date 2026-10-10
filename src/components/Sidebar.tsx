import React from 'react';
import { NavigationTab } from '../types';
import { sounds } from '../utils/sound';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  soundEnabled,
  onToggleSound,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'daily-quests', label: 'Tareas Diarias', icon: 'task_alt' },
    { id: 'scholarship-roadmap', label: 'Horas Beca', icon: 'route' },
    { id: 'budget-and-coins', label: 'Presupuesto', icon: 'savings' },
    { id: 'focus-session', label: 'Sesión de Enfoque', icon: 'timer' },
    { id: 'mood-tracker', label: 'Estado de Ánimo', icon: 'sentiment_satisfied' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between p-4 border-r border-[#efeded]">
      <div className="flex flex-col gap-6">
        {/* Brand Header: Nao Did It */}
        <div className="flex items-center gap-3 px-2 pt-1 select-none">
          <div className="w-10 h-10 rounded-xl bg-[#1cb0f6] text-white flex items-center justify-center text-2xl shadow-[0_4px_0_0_#006590]">
            <span className="material-symbols-outlined text-[28px]">sports_esports</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-[#006590] tracking-tight leading-none">
              Nao Did It
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onSelectTab(item.id);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-extrabold uppercase tracking-wide transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'btn-tactile-blue translate-y-0'
                    : 'text-[#3f4a36] hover:bg-[#f5f3f3] hover:text-[#1b1c1c] active:translate-y-1'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-white' : 'text-[#3f4a36]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: Only Sound Toggle */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[#efeded]">
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Silenciar efectos' : 'Activar sonido'}
          className="flex items-center justify-center gap-2 text-xs font-bold text-[#3f4a36] hover:text-[#1b1c1c] p-2 rounded-xl hover:bg-[#f5f3f3] transition-colors cursor-pointer w-full"
        >
          <span className="material-symbols-outlined text-[18px]">
            {soundEnabled ? 'volume_up' : 'volume_off'}
          </span>
          <span>{soundEnabled ? 'Sonido Activado' : 'Sonido Silenciado'}</span>
        </button>
      </div>
    </aside>
  );
};
