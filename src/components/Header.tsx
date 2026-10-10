import React from 'react';
import { NavigationTab } from '../types';
import { sounds } from '../utils/sound';

interface HeaderProps {
  currentTab: NavigationTab;
  energy: number;
  maxEnergy: number;
  monthlyBudget: number;
  completedHours: number;
  targetHours: number;
  onOpenPrimaryAction: () => void;
  onRefillEnergy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  energy,
  maxEnergy,
  monthlyBudget,
  completedHours,
  targetHours,
  onOpenPrimaryAction,
  onRefillEnergy,
}) => {
  const getActionButton = () => {
    switch (currentTab) {
      case 'daily-quests':
        return { label: 'NUEVA TAREA', icon: 'add_task' };
      case 'budget-and-coins':
        return { label: 'NUEVO GASTO', icon: 'add_card' };
      case 'scholarship-roadmap':
        return { label: 'REGISTRAR HORAS', icon: 'more_time' };
      case 'focus-session':
        return { label: 'INICIAR ENFOQUE', icon: 'play_arrow' };
      case 'mood-tracker':
        return null;
    }
  };

  const action = getActionButton();

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-8 border-b border-[#efeded]">
      {/* Left indicator section */}
      <div className="flex items-center gap-3">
        {currentTab === 'daily-quests' && (
          <button
            type="button"
            onClick={onRefillEnergy}
            title="Click para recargar energía"
            className="flex items-center gap-1.5 bg-[#87fe45] hover:bg-[#78ee36] px-3.5 py-1.5 rounded-full shadow-[0_3px_0_0_#6be026] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#2b6c00] text-[20px] font-bold">bolt</span>
            <span className="text-[12px] text-[#082100] font-black tracking-wide">
              {energy}/{maxEnergy} ENERGÍA
            </span>
          </button>
        )}

        {currentTab === 'budget-and-coins' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#f5f3f3] px-3 py-1 rounded-xl text-xs font-bold text-[#1b1c1c] shadow-[0_2px_0_0_#e4e2e2]">
              <span className="material-symbols-outlined text-[16px] text-[#006590]">account_balance_wallet</span>
              <span>Presupuesto: <strong>Q{monthlyBudget.toLocaleString('en-US')}</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-[#87fe45] text-[#082100] text-xs font-black px-2.5 py-0.5 rounded-full shadow-[0_2px_0_0_#6be026]">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>Al día</span>
            </div>
          </div>
        )}

        {currentTab === 'scholarship-roadmap' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#f5f3f3] px-3 py-1 rounded-xl text-xs font-bold text-[#1b1c1c] shadow-[0_2px_0_0_#e4e2e2]">
              <span className="material-symbols-outlined text-[16px] text-[#006590]">school</span>
              <span>Horas Beca: <strong>{completedHours} / {targetHours} hrs</strong></span>
            </div>
          </div>
        )}

        {currentTab === 'mood-tracker' && (
          <div className="flex items-center gap-1.5 bg-[#c8e6ff]/50 text-[#006590] px-3 py-1 rounded-xl text-xs font-bold">
            <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
            <span>Seguimiento de Emociones</span>
          </div>
        )}
      </div>

      {/* Right controls: Only shown if action exists (none in mood tracker) */}
      <div className="flex items-center gap-3">
        {action && (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onOpenPrimaryAction();
            }}
            className="btn-tactile-blue text-[13px] font-black uppercase tracking-wide px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        )}
      </div>
    </header>
  );
};
