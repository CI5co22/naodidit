import React, { useState } from 'react';
import { TaskCategory, TaskUserCategory } from '../../types';
import { sounds } from '../../utils/sound';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: TaskUserCategory[];
  onAddTask: (
    title: string,
    category: TaskCategory,
    dueDate?: string,
    subject?: string,
    isPriority?: boolean,
    totalSteps?: number
  ) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  categories = [
    { id: 'hacer-hoy', name: 'Hacer hoy', isDefault: true },
    { id: 'alta-prioridad', name: 'Alta prioridad', isDefault: true },
  ],
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>(categories[0]?.id || 'hacer-hoy');
  const [dueDate, setDueDate] = useState('');
  const [subject, setSubject] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [hasSteps, setHasSteps] = useState(false);
  const [totalSteps, setTotalSteps] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sounds.playPop();
    onAddTask(
      title.trim(),
      isPriority ? 'alta-prioridad' : category,
      dueDate.trim() || undefined,
      subject.trim() || undefined,
      isPriority,
      hasSteps ? totalSteps : undefined
    );

    setTitle('');
    setDueDate('');
    setSubject('');
    setIsPriority(false);
    setHasSteps(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#58cc02] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">add_task</span>
            </div>
            <h3 className="text-lg font-black text-[#1b1c1c]">Nueva Misión o Tarea</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6f7b64] hover:text-[#1b1c1c] font-black text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-[#6f7b64]">Título de la Tarea</label>
            <input
              type="text"
              required
              placeholder="ej. Resolver ejercicios de Física II"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#f5f3f3] text-sm font-semibold p-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#58cc02]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase text-[#6f7b64]">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="bg-[#f5f3f3] text-xs font-bold p-2.5 rounded-xl focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase text-[#6f7b64]">Materia o Contexto</label>
              <input
                type="text"
                placeholder="ej. Cálculo II, Ensayo..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-[#f5f3f3] text-xs font-semibold p-2.5 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-black uppercase text-[#6f7b64]">Fecha / Hora Límite</label>
            <input
              type="text"
              placeholder="ej. Vence hoy 5:00 PM, Mañana 11:59 PM..."
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-[#f5f3f3] text-xs font-semibold p-2.5 rounded-xl focus:outline-none focus:bg-white"
            />
          </div>

          {/* Priority & Multi-step toggles */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5f3f3] border border-[#efeded]">
            <span className="text-xs font-bold text-[#1b1c1c]">Marcar como Alta Prioridad</span>
            <input
              type="checkbox"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
              className="w-4 h-4 accent-[#58cc02] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5f3f3] border border-[#efeded]">
            <span className="text-xs font-bold text-[#1b1c1c]">Dividir en pasos (ej. 1 a 4)</span>
            <input
              type="checkbox"
              checked={hasSteps}
              onChange={(e) => setHasSteps(e.target.checked)}
              className="w-4 h-4 accent-[#58cc02] cursor-pointer"
            />
          </div>

          {hasSteps && (
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-[#3f4a36] font-semibold">Total de pasos:</span>
              <input
                type="number"
                min="2"
                max="10"
                value={totalSteps}
                onChange={(e) => setTotalSteps(Number(e.target.value))}
                className="w-16 bg-[#f5f3f3] text-center font-bold text-xs p-1 rounded-lg"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 btn-tactile-blue text-xs font-black uppercase py-3 rounded-xl cursor-pointer"
            >
              Agregar Tarea
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#f5f3f3] text-[#3f4a36] text-xs font-bold px-4 py-3 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
