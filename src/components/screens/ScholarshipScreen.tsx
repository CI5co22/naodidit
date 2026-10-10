import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ScholarshipRecord } from '../../types';
import { sounds } from '../../utils/sound';

interface ScholarshipScreenProps {
  records: ScholarshipRecord[];
  targetHours: number;
  onUpdateTargetHours: (hours: number) => void;
  onAddRecord: (record: Omit<ScholarshipRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  onResetHours: () => void;
  isLogModalOpen: boolean;
  setIsLogModalOpen: (open: boolean) => void;
}

export const ScholarshipScreen: React.FC<ScholarshipScreenProps> = ({
  records,
  targetHours,
  onUpdateTargetHours,
  onAddRecord,
  onDeleteRecord,
  onResetHours,
  isLogModalOpen,
  setIsLogModalOpen,
}) => {
  const [activity, setActivity] = useState('');
  const [hours, setHours] = useState('4');
  const [notes, setNotes] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState(targetHours.toString());

  const completedHours = records.reduce((sum, r) => sum + r.hours, 0);
  const remainingHours = Math.max(0, targetHours - completedHours);
  const progressPercent = Math.min(100, targetHours > 0 ? Math.round((completedHours / targetHours) * 100) : 0);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (!activity.trim() || isNaN(h) || h <= 0) return;

    sounds.playCheck();
    onAddRecord({
      activity: activity.trim(),
      hours: h,
      date: new Date().toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: notes.trim() || undefined,
    });

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#1cb0f6', '#58cc02', '#ff9c27'],
      });
    } catch {
      // ignore
    }

    setActivity('');
    setHours('4');
    setNotes('');
    setIsLogModalOpen(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newTargetInput);
    if (!isNaN(parsed) && parsed > 0) {
      sounds.playPop();
      onUpdateTargetHours(parsed);
      setIsEditingGoal(false);
    }
  };

  const handleReset = () => {
    sounds.playPop();
    onResetHours();
  };

  // 7 nodes coordinates on the 800x480 coordinate system with real winding mountain trail
  const nodes = [
    { id: 0, x: 100, y: 410, label: 'Inicio', hours: 0 },
    { id: 1, x: 260, y: 350, label: 'Primer paso', hours: Math.round(targetHours * 0.15) },
    { id: 2, x: 580, y: 360, label: 'Impulso', hours: Math.round(targetHours * 0.35) },
    { id: 3, x: 440, y: 265, label: 'Mitad de camino', hours: Math.round(targetHours * 0.50) },
    { id: 4, x: 200, y: 245, label: 'Constancia', hours: Math.round(targetHours * 0.70) },
    { id: 5, x: 380, y: 175, label: 'Recta final', hours: Math.round(targetHours * 0.85) },
    { id: 6, x: 670, y: 175, label: `Meta (${targetHours}h)`, hours: targetHours },
  ];

  // Current node index
  const currentNodeIndex = nodes.reduce((acc, n, idx) => {
    if (completedHours >= n.hours) return idx;
    return acc;
  }, 0);

  const currentNode = nodes[currentNodeIndex];

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Banner */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#006590]">
            ESTATUS DE HORAS BECA
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c]">
            Horas Beca
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#3f4a36]">
            Monitorea el trayecto hacia tu meta de {targetHours} horas semestrales.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            title="Reiniciar horas a 0"
            className="bg-[#f5f3f3] hover:bg-[#ffdad6] hover:text-[#ba1a1a] text-[#3f4a36] text-xs font-black uppercase px-3 py-2.5 rounded-xl shadow-[0_2px_0_0_#e4e2e2] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reiniciar Horas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewTargetInput(targetHours.toString());
              setIsEditingGoal(true);
            }}
            className="bg-[#f5f3f3] hover:bg-[#eae8e7] text-[#1b1c1c] text-xs font-black uppercase px-3 py-2.5 rounded-xl shadow-[0_2px_0_0_#e4e2e2] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Meta: {targetHours}h</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setIsLogModalOpen(true);
            }}
            className="btn-tactile-blue text-xs font-black uppercase px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>REGISTRAR HORAS</span>
          </button>
        </div>
      </section>

      {/* Target Hours Edit Form */}
      {isEditingGoal && (
        <form
          onSubmit={handleSaveGoal}
          className="bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#e4e2e2] border border-[#efeded] flex items-center gap-3 flex-wrap"
        >
          <span className="text-xs font-bold text-[#1b1c1c]">Definir meta total de horas:</span>
          <input
            type="number"
            min="1"
            max="1000"
            value={newTargetInput}
            onChange={(e) => setNewTargetInput(e.target.value)}
            className="w-24 bg-[#f5f3f3] font-black text-sm px-3 py-1.5 rounded-xl focus:outline-none"
          />
          <button
            type="submit"
            className="btn-tactile-blue text-xs font-black uppercase px-4 py-1.5 rounded-xl cursor-pointer"
          >
            Guardar Meta
          </button>
          <button
            type="button"
            onClick={() => setIsEditingGoal(false)}
            className="text-xs text-[#6f7b64] font-bold hover:underline cursor-pointer"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#e4e2e2] border border-[#efeded] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c8e6ff] text-[#006590] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6f7b64] font-bold uppercase">Registradas</span>
            <span className="text-xl font-black text-[#1b1c1c] block">{completedHours} hrs</span>
            <span className="text-[10px] text-[#006590] font-bold">{progressPercent}% completado</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#e4e2e2] border border-[#efeded] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffdcbf] text-[#8c5000] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">hourglass_bottom</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6f7b64] font-bold uppercase">Faltantes</span>
            <span className="text-xl font-black text-[#8c5000] block">{remainingHours} hrs</span>
            <span className="text-[10px] text-[#3f4a36] font-bold">para alcanzar {targetHours} hrs</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#e4e2e2] border border-[#efeded] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#87fe45]/40 text-[#2b6c00] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">flag</span>
          </div>
          <div>
            <span className="text-[10px] text-[#6f7b64] font-bold uppercase">Meta Total</span>
            <span className="text-xl font-black text-[#2b6c00] block">{targetHours} hrs</span>
            <span className="text-[10px] text-[#3f4a36] font-bold">Requisito semestral</span>
          </div>
        </div>
      </div>

      {/* ROADMAP WITH REAL WINDING SVG S-CURVES */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-[#1b1c1c]">Horas Beca</h3>
          <span className="text-xs font-black text-[#006590] bg-[#c8e6ff]/50 px-3 py-1 rounded-full">
            {completedHours} / {targetHours} Horas
          </span>
        </div>

        {/* Winding Canvas Container */}
        <div className="w-full bg-[#fbf9f8] rounded-3xl p-4 sm:p-6 pt-10 sm:pt-14 border border-[#efeded] relative overflow-visible">
          <div className="relative w-full aspect-[800/490] min-h-[380px]">
            {/* SVG Connecting Track: Unbroken Winding S-Curves */}
            <svg
              viewBox="0 0 800 480"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* Background Empty Road Path */}
              <path
                d="M 100 410 C 160 410, 210 360, 260 350 C 370 320, 480 400, 580 360 C 660 330, 570 270, 440 265 C 310 250, 140 280, 200 245 C 240 205, 290 175, 380 175 C 480 175, 570 175, 670 175"
                fill="none"
                stroke="#e4e2e2"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active Completed Progress Path */}
              <path
                d="M 100 410 C 160 410, 210 360, 260 350 C 370 320, 480 400, 580 360 C 660 330, 570 270, 440 265 C 310 250, 140 280, 200 245 C 240 205, 290 175, 380 175 C 480 175, 570 175, 670 175"
                fill="none"
                stroke="#1cb0f6"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={Math.max(0, 100 - progressPercent)}
                className="transition-all duration-700"
              />
            </svg>

            {/* Overlaid Milestone Nodes and Character */}
            {nodes.map((node) => {
              const isReached = completedHours >= node.hours;
              const isTrophy = node.id === 6;

              // Convert coordinates to percentages for exact positioning
              const leftPercent = (node.x / 800) * 100;
              const topPercent = (node.y / 480) * 100;

              return (
                <div
                  key={node.id}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                >
                  {/* Node Button / Stone */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black transition-all shadow-[0_4px_0_0_#becbb1] ${
                      isTrophy
                        ? isReached
                          ? 'bg-[#ff9c27] text-white shadow-[0_4px_0_0_#d97706]'
                          : 'bg-[#ffdcbf] text-[#8c5000]'
                        : isReached
                        ? 'bg-[#1cb0f6] text-white shadow-[0_4px_0_0_#006590]'
                        : 'bg-white text-[#6f7b64]'
                    }`}
                  >
                    {isTrophy ? (
                      <span className="material-symbols-outlined text-[28px]">trophy</span>
                    ) : isReached ? (
                      <span className="material-symbols-outlined text-[24px]">check</span>
                    ) : (
                      <span className="text-xs sm:text-sm font-black">{node.hours}h</span>
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-[11px] sm:text-xs font-black text-[#1b1c1c] mt-1.5 whitespace-nowrap bg-white/90 px-1.5 py-0.5 rounded-md shadow-xs">
                    {node.label}
                  </span>
                </div>
              );
            })}

            {/* LARGE STEADY NAOO: Positioned right above currentNode without overflowing */}
            <div
              style={{
                left: `${(currentNode.x / 800) * 100}%`,
                top: `${(currentNode.y / 480) * 100}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-[100%] z-20 flex flex-col items-center pointer-events-none transition-all duration-500"
            >
              <img
                src="/maya.png"
                alt="Naoo en ruta"
                className="w-18 h-18 sm:w-20 sm:h-20 object-contain pixelated"
              />
              <div className="bg-[#1cb0f6] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm mt-0.5 whitespace-nowrap">
                {completedHours >= targetHours ? '¡Meta alcanzada! 🎉' : `${completedHours} hrs`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logged Activities Table */}
      <section className="bg-white rounded-2xl p-6 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-[#1b1c1c]">Registro de Horas ({records.length})</h3>
          <span className="text-xs text-[#006590] font-bold">Total: {completedHours} hrs</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#6f7b64]">
            No has registrado horas todavía. Haz clic en <strong>REGISTRAR HORAS</strong> para comenzar.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#efeded]">
            {records.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c8e6ff] text-[#006590] flex items-center justify-center font-bold flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1b1c1c]">{r.activity}</span>
                    <span className="text-[11px] text-[#6f7b64]">{r.date}</span>
                    {r.notes && (
                      <span className="text-[11px] text-[#3f4a36] italic mt-0.5">"{r.notes}"</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-[#006590]">+{r.hours} hrs</span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      onDeleteRecord(r.id);
                    }}
                    title="Eliminar registro"
                    className="text-[#6f7b64] hover:text-[#ba1a1a] p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Simplified Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1cb0f6] text-[24px]">more_time</span>
                <h3 className="text-lg font-black text-[#1b1c1c]">Registrar Horas Beca</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="text-[#6f7b64] hover:text-[#1b1c1c] font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">Actividad Realizada</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Apoyo en laboratorio, Tutoría..."
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="bg-[#f5f3f3] text-sm font-semibold p-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1cb0f6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">Horas Dedicadas</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="40"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1cb0f6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">Notas (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-[#f5f3f3] text-xs font-medium p-2.5 rounded-xl focus:outline-none focus:bg-white resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-tactile-blue text-xs font-black uppercase py-3 rounded-xl cursor-pointer"
                >
                  Confirmar Horas
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="bg-[#f5f3f3] text-[#3f4a36] text-xs font-bold px-4 py-3 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
