import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Task, TaskUserCategory } from '../../types';
import { sounds } from '../../utils/sound';

interface DailyTasksScreenProps {
  tasks: Task[];
  energy: number;
  maxEnergy: number;
  categories: TaskUserCategory[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, category: string, subject?: string) => void;
  onIncrementStep: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onRefillEnergy: () => void;
  onReorderTasks: (newTasks: Task[]) => void;
  onMoveTaskToCategory: (taskId: string, categoryId: string) => void;
  onAddCategory: (name: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const DailyTasksScreen: React.FC<DailyTasksScreenProps> = ({
  tasks,
  energy,
  maxEnergy,
  categories,
  onToggleTask,
  onAddTask,
  onIncrementStep,
  onDeleteTask,
  onRefillEnergy,
  onReorderTasks,
  onMoveTaskToCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [quickInput, setQuickInput] = useState('');
  const [quickCategory, setQuickCategory] = useState<string>(categories[0]?.id || 'hacer-hoy');
  const [notes, setNotes] = useState<string[]>([
    'Revisar biblioteca a las 3:00 PM para devolver libros prestados.',
    'Recordatorio: sesión de asesoría académica mañana temprano.',
  ]);
  const [newNoteInput, setNewNoteInput] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);

  // Category creation & editing modals
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatNameInput, setNewCatNameInput] = useState('');
  const [editingCat, setEditingCat] = useState<TaskUserCategory | null>(null);
  const [editCatNameInput, setEditCatNameInput] = useState('');

  // Waving state when "Saludar a Nao" is pressed
  const [isWaving, setIsWaving] = useState(false);
  const [wavingGreeting, setWavingGreeting] = useState<string | null>(null);

  const CUATE_GREETINGS = [
    '“¡Qué onda vos! ¡A darle con todo hoy, no te ahueves que sí sale! 💥”',
    '“¡Wenas! Tomate un respiro, estirate un cacho y seguimos dándole ☕”',
    '“¡Buena onda! Si hoy no sale perfecto, al menos que salga hecho jajaja 🚀”',
    '“¡Qué onda vos! Aquí ando echándote porras, vos dale sin miedo ✨”',
    '“¡Esooo! Descansá un toque que el cerebro no es máquina tampoco 😎”',
    '“¡Qué onda! Una tarea a la vez y nos echamos un buen café después ⚡”',
    '“¡Ánimo pues! Ya falta menos para terminar el día y mandar todo a volar jaja 🙌”',
  ];

  // Completed vs Pending logic:
  // Active tasks only show pending. Completed only show in 'completed' tab.
  // Completed tasks are limited to max 10.
  const completedTasks = tasks.filter((t) => t.completed).slice(0, 10);
  const pendingTasks = tasks.filter((t) => !t.completed);

  const completedCount = completedTasks.length;
  const totalCount = pendingTasks.length + completedCount;
  const remainingCount = pendingTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter for display
  const displayedTasks =
    activeTab === 'completed'
      ? completedTasks
      : pendingTasks.filter((task) => {
          if (activeTab === 'all') return true;
          return task.category === activeTab;
        });

  // DRAG & DROP HANDLERS
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOverTask = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    if (draggedTaskId && draggedTaskId !== taskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleDropOnTask = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }
    const next = [...tasks];
    const srcIndex = next.findIndex((t) => t.id === draggedTaskId);
    const tgtIndex = next.findIndex((t) => t.id === targetTaskId);
    if (srcIndex !== -1 && tgtIndex !== -1) {
      const [moved] = next.splice(srcIndex, 1);
      next.splice(tgtIndex, 0, moved);
      onReorderTasks(next);
      sounds.playPop();
    }
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDropOnCategory = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    onMoveTaskToCategory(draggedTaskId, catId);
    sounds.playPop();
    try {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.3 },
        colors: ['#1cb0f6', '#58cc02'],
      });
    } catch {
      // ignore
    }
    setDraggedTaskId(null);
    setDragOverCatId(null);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    sounds.playPop();
    onAddTask(quickInput.trim(), quickCategory);
    setQuickInput('');
  };

  const handleSaludarNao = () => {
    sounds.playCheer();
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6, x: 0.8 },
        colors: ['#1cb0f6', '#58cc02', '#ff9c27'],
      });
    } catch {
      // ignore
    }

    setIsWaving(true);
    const randomGreeting = CUATE_GREETINGS[Math.floor(Math.random() * CUATE_GREETINGS.length)];
    setWavingGreeting(randomGreeting);
    onRefillEnergy();

    setTimeout(() => {
      setIsWaving(false);
      setWavingGreeting(null);
    }, 3000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    sounds.playPop();
    setNotes([...notes, newNoteInput.trim()]);
    setNewNoteInput('');
    setShowAddNote(false);
  };

  const handleSaveNewCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameInput.trim() || categories.length >= 4) return;
    sounds.playPop();
    onAddCategory(newCatNameInput.trim());
    setNewCatNameInput('');
    setIsAddCatModalOpen(false);
  };

  const handleSaveEditCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editCatNameInput.trim()) return;
    sounds.playPop();
    onEditCategory(editingCat.id, editCatNameInput.trim());
    setEditingCat(null);
    setEditCatNameInput('');
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Zero Energy Banner */}
      {energy <= 0 && (
        <div className="bg-[#ffdcbf] border-2 border-[#ff9c27] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_3px_0_0_#d97706]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-[#8c5000]">battery_alert</span>
            <div className="flex flex-col">
              <span className="text-sm font-black text-[#2d1600]">
                ¡Te has quedado sin energía (0/{maxEnergy})!
              </span>
              <span className="text-xs font-bold text-[#6a3b00]">
                Saluda a Nao para recargar fuerzas antes de seguir.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaludarNao}
            className="btn-tactile-blue px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer whitespace-nowrap"
          >
            Saludar a Nao (Recargar)
          </button>
        </div>
      )}

      {/* Hero Banner with Naoo */}
      <section className="w-full bg-white rounded-2xl p-6 shadow-[0_4px_0_0_#e4e2e2] relative overflow-hidden border border-[#efeded]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c] leading-snug">
              Tareas Diarias y Estudio
            </h2>
          </div>

          {/* Progress Widget */}
          <div className="w-full lg:w-80 flex flex-col gap-2 bg-[#f5f3f3] p-4 rounded-xl shadow-[0_3px_0_0_#efeded] border border-[#efeded]">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="text-[#3f4a36] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#006590]">check_circle</span>
                Progreso del día:
              </span>
              <span className="text-[#006590] font-black tracking-wide">
                {completedCount} de {totalCount} completadas
              </span>
            </div>
            <div className="w-full h-3.5 bg-[#efeded] rounded-full overflow-hidden p-0.5 shadow-inner relative">
              <div
                className="h-full bg-[#1cb0f6] rounded-full transition-all duration-500 shadow-[0_2px_0_0_#006590]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[#3f4a36] text-[11px] font-bold">
              <span>{progressPercent}% avanzado</span>
              <span className="text-[#006590] font-black">{remainingCount} restantes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Quests Column */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* CATEGORIES ROW & BUBBLES */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Todas bubble */}
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setActiveTab('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                activeTab === 'all'
                  ? 'bg-[#1cb0f6] text-white shadow-[0_3px_0_0_#006590] border-[#006590]'
                  : 'bg-[#f5f3f3] text-[#3f4a36] hover:bg-[#eae8e7] border-transparent shadow-[0_2px_0_0_#e4e2e2]'
              }`}
            >
              Todas ({pendingTasks.length})
            </button>

            {/* Category Bubbles - Compact Drop Targets & Filters */}
            {categories.map((cat) => {
              const isSelected = activeTab === cat.id;
              const isDragOver = dragOverCatId === cat.id;
              const count = pendingTasks.filter((t) => t.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCatId(cat.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverCatId === cat.id) setDragOverCatId(null);
                  }}
                  onDrop={(e) => handleDropOnCategory(e, cat.id)}
                  onClick={() => {
                    sounds.playPop();
                    setActiveTab(cat.id);
                  }}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border select-none ${
                    isDragOver
                      ? 'bg-[#c8e6ff] text-[#006590] border-[#1cb0f6] shadow-[0_3px_0_0_#006590] scale-105 ring-2 ring-[#006590]'
                      : isSelected
                      ? 'bg-[#1cb0f6] text-white shadow-[0_3px_0_0_#006590] border-[#006590]'
                      : 'bg-[#f5f3f3] text-[#3f4a36] hover:bg-[#eae8e7] border-transparent shadow-[0_2px_0_0_#e4e2e2]'
                  }`}
                >
                  <span className="truncate max-w-[140px]">{cat.name}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#e4e2e2] text-[#3f4a36]'
                    }`}
                  >
                    {count}
                  </span>

                  {!cat.isDefault && (
                    <div className="flex items-center gap-0.5 ml-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title="Editar nombre"
                        onClick={() => {
                          sounds.playPop();
                          setEditingCat(cat);
                          setEditCatNameInput(cat.name);
                        }}
                        className={`p-0.5 rounded transition-colors ${
                          isSelected ? 'text-white/80 hover:text-white' : 'text-[#6f7b64] hover:text-[#006590]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                      </button>
                      <button
                        type="button"
                        title="Eliminar categoría"
                        onClick={() => {
                          sounds.playPop();
                          onDeleteCategory(cat.id);
                          if (activeTab === cat.id) setActiveTab('all');
                        }}
                        className={`p-0.5 rounded transition-colors ${
                          isSelected ? 'text-white/80 hover:text-white' : 'text-[#6f7b64] hover:text-[#ba1a1a]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Compact Plus Bubble to Add Category */}
            {categories.length < 4 && (
              <button
                type="button"
                title="Agregar categoría"
                onClick={() => {
                  sounds.playPop();
                  setNewCatNameInput('');
                  setIsAddCatModalOpen(true);
                }}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#f5f3f3] hover:bg-[#eae8e7] text-[#3f4a36] hover:text-[#006590] flex items-center justify-center cursor-pointer shadow-[0_2px_0_0_#e4e2e2] active:translate-y-0.5 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            )}

            {/* Completadas bubble */}
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setActiveTab('completed');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                activeTab === 'completed'
                  ? 'bg-[#1cb0f6] text-white shadow-[0_3px_0_0_#006590] border-[#006590]'
                  : 'bg-[#f5f3f3] text-[#3f4a36] hover:bg-[#eae8e7] border-transparent shadow-[0_2px_0_0_#e4e2e2]'
              }`}
            >
              Completadas ({completedCount})
            </button>
          </div>

          {/* Task List: Pending (Draggable & Reorderable) vs Completed */}
          <div className="flex flex-col gap-3">
            {activeTab === 'completed' ? (
              /* COMPACT COMPLETED TASKS (Max 10 with Unmark Option) */
              <div className="flex flex-col gap-2">
                <span className="text-xs text-[#6f7b64] font-bold">
                  Historial de las últimas {completedTasks.length} tareas completadas (máximo 10):
                </span>
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#f5f3f3] rounded-xl px-3.5 py-2.5 border border-[#efeded] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          onToggleTask(task.id);
                        }}
                        title="Desmarcar y regresar a pendientes"
                        className="w-7 h-7 rounded-lg bg-[#58cc02] hover:bg-[#46a302] text-white flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </button>
                      <span className="font-bold text-[#3f4a36] line-through truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-[#2b6c00] font-black">
                        {task.completedAt || 'Completada'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          onToggleTask(task.id);
                        }}
                        title="Desmarcar tarea"
                        className="text-[#006590] hover:text-[#004666] font-bold text-[11px] p-1 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">undo</span>
                        <span className="hidden sm:inline">Desmarcar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          onDeleteTask(task.id);
                        }}
                        title="Eliminar de historial"
                        className="text-[#6f7b64] hover:text-[#ba1a1a] p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* PENDING ACTIVE TASKS (DRAGGABLE) */
              displayedTasks.map((task) => {
                const catObj = categories.find((c) => c.id === task.category);
                const isItemDragOver = dragOverTaskId === task.id;
                const isSelfDragged = draggedTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={() => {
                      setDraggedTaskId(null);
                      setDragOverTaskId(null);
                      setDragOverCatId(null);
                    }}
                    onDragOver={(e) => handleDragOverTask(e, task.id)}
                    onDragLeave={() => {
                      if (dragOverTaskId === task.id) setDragOverTaskId(null);
                    }}
                    onDrop={(e) => handleDropOnTask(e, task.id)}
                    className={`group bg-white rounded-xl p-4 shadow-[0_4px_0_0_#e4e2e2] hover:shadow-[0_4px_0_0_#becbb1] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border cursor-grab active:cursor-grabbing ${
                      isItemDragOver
                        ? 'border-2 border-[#1cb0f6] bg-[#c8e6ff]/25 shadow-md -translate-y-1'
                        : isSelfDragged
                        ? 'opacity-40 border-dashed border-[#1cb0f6]'
                        : 'border-[#efeded]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      {/* Drag Handle Icon - only visible while dragging */}
                      {draggedTaskId === task.id && (
                        <div className="p-1 rounded-lg text-[#006590] flex-shrink-0">
                          <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                        </div>
                      )}

                      {/* Checkbox button */}
                      <button
                        type="button"
                        aria-label="Marcar como completada"
                        onClick={() => {
                          sounds.playCheck();
                          try {
                            confetti({
                              particleCount: 25,
                              spread: 50,
                              origin: { y: 0.7 },
                            });
                          } catch {
                            // ignore
                          }
                          onToggleTask(task.id);
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#f5f3f3] text-transparent hover:text-[#006590] hover:bg-[#c8e6ff]/50 shadow-[0_3px_0_0_#becbb1] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[24px]">check</span>
                      </button>

                      {/* Task Title & Details */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-[#1b1c1c]">
                            {task.title}
                          </span>

                          {catObj && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#f5f3f3] text-[#006590] border border-[#efeded]">
                              {catObj.name}
                            </span>
                          )}

                          {task.badgeLabel && task.badgeLabel !== catObj?.name && (
                            <span
                              className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                                task.badgeVariant === 'red'
                                  ? 'bg-[#ffdad6] text-[#93000a]'
                                  : 'bg-[#e4e2e2] text-[#3f4a36]'
                              }`}
                            >
                              {task.badgeLabel}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[#3f4a36] text-xs font-semibold">
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-[#ba1a1a] font-bold">
                              <span className="material-symbols-outlined text-[15px]">schedule</span>
                              {task.dueDate}
                            </span>
                          )}

                          {task.subject && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-[#3f4a36]">
                                <span className="material-symbols-outlined text-[15px]">menu_book</span>
                                {task.subject}
                              </span>
                            </>
                          )}

                          {task.detail && (
                            <span className="text-[#3f4a36]">{task.detail}</span>
                          )}

                          {task.totalSteps && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-28 h-2 bg-[#efeded] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#1cb0f6] rounded-full transition-all"
                                  style={{
                                    width: `${((task.currentStep || 1) / task.totalSteps) * 100}%`,
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  sounds.playPop();
                                  onIncrementStep(task.id);
                                }}
                                className="text-[11px] text-[#006590] hover:text-[#004666] font-black underline cursor-pointer"
                                title="Avanzar un paso"
                              >
                                Paso {task.currentStep} de {task.totalSteps} (+1)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#f5f3f3] text-[#3f4a36]">
                        {task.currentStep ? 'En progreso' : 'Pendiente'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          onDeleteTask(task.id);
                        }}
                        title="Eliminar tarea"
                        className="opacity-0 group-hover:opacity-100 text-[#3f4a36] hover:text-[#ba1a1a] p-1 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {displayedTasks.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center border border-[#efeded] text-[#3f4a36] shadow-[0_3px_0_0_#e4e2e2]">
                <span className="material-symbols-outlined text-4xl text-[#1cb0f6] mb-2">celebration</span>
                <p className="font-bold">No hay pendientes en esta categoría.</p>
              </div>
            )}
          </div>

          {/* Formulario Agregar Tarea Rápida with Blue Button */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_0_0_#e4e2e2] flex flex-col gap-4 mt-2 border border-[#efeded]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#c8e6ff] text-[#006590] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">add_task</span>
                </div>
                <span className="text-lg font-bold text-[#1b1c1c]">Agregar Tarea Rápida</span>
              </div>
              <span className="text-[11px] bg-[#efeded] px-2.5 py-1 rounded-full text-[#3f4a36] font-bold">
                Organizador
              </span>
            </div>

            <form onSubmit={handleQuickAdd} className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="new-quest-input"
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="¿Cuál es tu siguiente tarea? (ej. Estudiar Cálculo...)"
                  className="flex-1 bg-[#f5f3f3] text-[#1b1c1c] text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1cb0f6] shadow-[inset_0_2px_0_0_#efeded] placeholder:text-[#6f7b64]"
                />

                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="bg-[#f5f3f3] text-[#1b1c1c] text-xs font-bold px-3 py-3 rounded-xl focus:outline-none shadow-[0_3px_0_0_#e4e2e2] cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end pt-1">
                {/* Vibrant Blue Action Button */}
                <button
                  type="submit"
                  className="btn-tactile-blue text-[13px] font-black uppercase px-6 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>AGREGAR PENDIENTE</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* RIGHT: Naoo Standing (Without shadows) & "Saludar a Nao" */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_0_0_#e4e2e2] flex flex-col items-center text-center relative border border-[#efeded]">
            {/* Pure Character without ANY drop-shadow */}
            <div className="w-40 h-40 flex items-center justify-center my-2">
              <img
                src={isWaving ? '/naoo-wave.png' : '/maya.png'}
                alt="Naoo"
                className="w-full h-full object-contain pixelated transition-transform duration-200"
              />
            </div>

            {/* Dynamic dialog: animos de cuate a cuate */}
            <p className="text-xs sm:text-sm font-semibold text-[#3f4a36] max-w-xs mt-2 min-h-[36px] flex items-center justify-center text-center">
              {wavingGreeting
                ? wavingGreeting
                : energy <= 0
                ? '“¡Mano, te quedaste a 0 de energía! Tomate un respiro antes de que colapses jaja, salúdame para recargar.”'
                : remainingCount === 0
                ? '“¡Uff qué pro! Terminaste todos los pendientes de hoy, ya te ganaste tu buen descanso de crack 🎉”'
                : `“¡Vas bien vos! Te faltan ${remainingCount} pendientes y coronamos el día 💪”`}
            </p>

            {/* "Saludar a Nao" Blue Tactile Button */}
            <button
              type="button"
              onClick={handleSaludarNao}
              className="mt-4 w-full py-2.5 btn-tactile-blue text-xs font-black uppercase rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">waving_hand</span>
              <span>Saludar a Nao</span>
            </button>
          </div>

          {/* Notas del Día */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_0_0_#e4e2e2] flex flex-col gap-3 border border-[#efeded]">
            <div className="flex items-center justify-between text-[#1b1c1c]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006590] text-[22px]">
                  sticky_note_2
                </span>
                <h4 className="text-base font-bold">Notas del Día</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddNote(!showAddNote)}
                className="text-xs font-bold text-[#006590] hover:underline cursor-pointer"
              >
                {showAddNote ? 'Cerrar' : '+ Nota'}
              </button>
            </div>

            {showAddNote && (
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  placeholder="Escribir recordatorio..."
                  className="flex-1 bg-[#f5f3f3] px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-tactile-blue px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  Ok
                </button>
              </form>
            )}

            <ul className="flex flex-col gap-2 mt-1 text-xs font-semibold text-[#3f4a36]">
              {notes.map((note, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 bg-[#f5f3f3] p-2.5 rounded-lg border border-[#efeded]"
                >
                  <span className="material-symbols-outlined text-[#006590] text-[18px] flex-shrink-0 mt-0.5">
                    info
                  </span>
                  <span className="flex-1">{note}</span>
                  <button
                    type="button"
                    onClick={() => setNotes(notes.filter((_, i) => i !== idx))}
                    className="text-[#6f7b64] hover:text-[#ba1a1a] text-xs cursor-pointer"
                    title="Eliminar nota"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* MODAL: Nueva Categoría (hasta 2 personalizadas) */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1b1c1c]">Nueva Categoría</h3>
              <button
                type="button"
                onClick={() => setIsAddCatModalOpen(false)}
                className="text-[#6f7b64] hover:text-[#1b1c1c] font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewCat} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Proyectos, Exámenes, Personal..."
                  value={newCatNameInput}
                  onChange={(e) => setNewCatNameInput(e.target.value)}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1cb0f6]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-tactile-blue flex-1 py-2.5 rounded-xl text-xs font-black uppercase"
                >
                  Crear Categoría
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="bg-[#f5f3f3] text-[#3f4a36] text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Categoría */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1b1c1c]">Editar Categoría</h3>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="text-[#6f7b64] hover:text-[#1b1c1c] font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCat} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={editCatNameInput}
                  onChange={(e) => setEditCatNameInput(e.target.value)}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1cb0f6]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="btn-tactile-blue flex-1 py-2.5 rounded-xl text-xs font-black uppercase"
                >
                  Guardar Nombre
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="bg-[#f5f3f3] text-[#3f4a36] text-xs font-bold px-4 py-2.5 rounded-xl"
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
