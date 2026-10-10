import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/sound';

export const FocusSessionScreen: React.FC = () => {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      if (mode === 'focus') {
        // 25-min focus ended -> switch to 5-min break automatically!
        sounds.playCheer();
        setCompletedSessions((prev) => prev + 1);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1cb0f6', '#58cc02', '#ff9c27'],
          });
        } catch {
          // ignore
        }
        setMode('break');
        setSeconds(5 * 60);
        setIsRunning(true); // runs automatically
      } else {
        // 5-min break ended -> switch back to 25-min focus!
        sounds.playPop();
        setMode('focus');
        setSeconds(25 * 60);
        setIsRunning(false);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds, mode]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    sounds.playPop();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sounds.playPop();
    setIsRunning(false);
    setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  // Image selection:
  // When focus timer is running: show naoo-focus.png with gentle floating animation!
  // When idle, paused, or during 5-min break: show idle /maya.png without animation.
  const isFocusStudying = mode === 'focus' && isRunning;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-4 pb-12 gap-6">
      {/* Naoo Mascot Display without shadows */}
      <div className="flex flex-col items-center text-center">
        <div className="w-52 h-52 flex items-center justify-center relative">
          <img
            src={isFocusStudying ? '/naoo-focus.png' : '/maya.png'}
            alt="Naoo Enfoque"
            className={`w-full h-full object-contain pixelated transition-transform duration-300 ${
              isFocusStudying ? 'animate-float scale-110' : ''
            }`}
          />
        </div>

        <h2 className="text-2xl font-black text-[#1b1c1c] mt-2">
          {mode === 'focus' ? 'Sesión de Enfoque' : 'Tiempo de Descanso'}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-[#3f4a36] mt-0.5 max-w-sm">
          {mode === 'focus'
            ? isRunning
              ? 'Naoo está estudiando concentrada junto a ti...'
              : 'Estudia 25 minutos sin distracciones. Al terminar iniciará un descanso de 5 min.'
            : isRunning
            ? '¡Descanso activo de 5 minutos! Estírate o toma agua mientras Naoo descansa.'
            : 'Listo para descansar.'}
        </p>
      </div>

      {/* Big Tactile Timer Card */}
      <div className="w-full bg-white rounded-3xl p-8 sm:p-10 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col items-center text-center gap-6">
        <div className="w-full bg-[#f5f3f3] rounded-2xl py-8 px-4 border border-[#efeded] shadow-inner">
          <span className="text-6xl sm:text-7xl font-black text-[#1b1c1c] tracking-widest font-mono">
            {formatTime(seconds)}
          </span>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning
                  ? mode === 'focus'
                    ? 'bg-[#1cb0f6] animate-ping'
                    : 'bg-[#58cc02] animate-ping'
                  : 'bg-[#6f7b64]'
              }`}
            />
            <span className="text-xs font-bold text-[#3f4a36]">
              {isRunning
                ? mode === 'focus'
                  ? 'Modo Estudio (25 min)'
                  : 'Modo Descanso (5 min)'
                : 'Pausado'}
            </span>
          </div>
        </div>

        {/* Tactile Buttons */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer ${
              isRunning
                ? 'bg-[#ba1a1a] shadow-[0_4px_0_0_#93000a] active:translate-y-1 active:shadow-none'
                : 'btn-tactile-blue'
            }`}
          >
            {isRunning ? 'Pausar' : mode === 'focus' ? 'Iniciar (25 min)' : 'Iniciar (5 min)'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-3.5 rounded-xl text-xs font-black uppercase text-[#3f4a36] bg-[#f5f3f3] hover:bg-[#eae8e7] shadow-[0_3px_0_0_#e4e2e2] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Reiniciar
          </button>
        </div>

        {completedSessions > 0 && (
          <span className="text-xs font-bold text-[#006590] bg-[#c8e6ff]/50 px-3 py-1 rounded-full">
            ✓ {completedSessions} sesión{completedSessions > 1 ? 'es' : ''} de enfoque completada{completedSessions > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};
