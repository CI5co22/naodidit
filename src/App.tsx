/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  NavigationTab,
  Task,
  TaskCategory,
  TaskUserCategory,
  BudgetCategory,
  QuickPreset,
  ExpenseRecord,
  SavingsGoal,
  ScholarshipRecord,
  MoodEntry,
} from './types';
import {
  INITIAL_TASKS,
  INITIAL_TASK_CATEGORIES,
  INITIAL_BUDGET_CATEGORIES,
  INITIAL_QUICK_PRESETS,
  INITIAL_EXPENSES,
  INITIAL_SAVINGS_GOAL,
  INITIAL_SCHOLARSHIP_RECORDS,
} from './data/mockData';
import { sounds } from './utils/sound';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DailyTasksScreen } from './components/screens/DailyTasksScreen';
import { BudgetScreen } from './components/screens/BudgetScreen';
import { ScholarshipScreen } from './components/screens/ScholarshipScreen';
import { FocusSessionScreen } from './components/screens/FocusSessionScreen';
import { MoodTrackerScreen } from './components/screens/MoodTrackerScreen';
import { NewTaskModal } from './components/modals/NewTaskModal';

export default function App({ onLogout }: { onLogout: () => void }) {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('daily-quests');

  // Energy System (5/5 max, depletes 1 per task completed)
  const [energy, setEnergy] = useState<number>(() => {
    const saved = localStorage.getItem('naoo_energy');
    return saved !== null ? parseInt(saved, 10) : 5;
  });
  const maxEnergy = 5;

  // Stored state with local storage
  const [taskCategories, setTaskCategories] = useState<TaskUserCategory[]>(() => {
    const saved = localStorage.getItem('naoo_task_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_TASK_CATEGORIES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('naoo_tasks');
    const raw = saved ? JSON.parse(saved) : INITIAL_TASKS;
    return raw.map((t: Task) => {
      let cat = t.category;
      if (cat === 'campus' || cat === 'life') cat = 'hacer-hoy';
      if (cat === 'priority') cat = 'alta-prioridad';
      return { ...t, category: cat };
    });
  });

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem('naoo_budget_cats');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET_CATEGORIES;
  });

  const [quickPresets, setQuickPresets] = useState<QuickPreset[]>(() => {
    const saved = localStorage.getItem('naoo_quick_presets');
    return saved ? JSON.parse(saved) : INITIAL_QUICK_PRESETS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('naoo_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>(() => {
    const saved = localStorage.getItem('naoo_savings_goal');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOAL;
  });

  const [scholarshipRecords, setScholarshipRecords] = useState<ScholarshipRecord[]>(() => {
    const saved = localStorage.getItem('naoo_scholarship');
    return saved ? JSON.parse(saved) : INITIAL_SCHOLARSHIP_RECORDS;
  });

  const [targetScholarshipHours, setTargetScholarshipHours] = useState<number>(() => {
    const saved = localStorage.getItem('naoo_target_hours');
    return saved ? parseFloat(saved) : 80;
  });

  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('naoo_mood_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('naoo_sound') !== 'false';
  });

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isLogHoursOpen, setIsLogHoursOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('naoo_energy', energy.toString());
  }, [energy]);

  useEffect(() => {
    localStorage.setItem('naoo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('naoo_task_categories', JSON.stringify(taskCategories));
  }, [taskCategories]);

  useEffect(() => {
    localStorage.setItem('naoo_budget_cats', JSON.stringify(budgetCategories));
  }, [budgetCategories]);

  useEffect(() => {
    localStorage.setItem('naoo_quick_presets', JSON.stringify(quickPresets));
  }, [quickPresets]);

  useEffect(() => {
    localStorage.setItem('naoo_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('naoo_savings_goal', JSON.stringify(savingsGoal));
  }, [savingsGoal]);

  useEffect(() => {
    localStorage.setItem('naoo_scholarship', JSON.stringify(scholarshipRecords));
  }, [scholarshipRecords]);

  useEffect(() => {
    localStorage.setItem('naoo_target_hours', targetScholarshipHours.toString());
  }, [targetScholarshipHours]);

  useEffect(() => {
    localStorage.setItem('naoo_mood_history', JSON.stringify(moodHistory));
  }, [moodHistory]);

  useEffect(() => {
    localStorage.setItem('naoo_sound', String(soundEnabled));
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Refill energy (Saludar a Nao / Tomar un respiro)
  const handleRefillEnergy = () => {
    sounds.playCheer();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#1cb0f6', '#87fe45', '#ff9c27'],
      });
    } catch {
      // ignore
    }
    setEnergy(maxEnergy);
  };

  // Toggle Task Completion (Depletes 1 energy per completed task)
  // Maintains max 10 completed tasks; older ones are removed!
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            setEnergy((prevE) => Math.max(0, prevE - 1));
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted
              ? `Completada a las ${new Date().toLocaleTimeString('es-GT', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}`
              : undefined,
          };
        }
        return t;
      });

      // Split pending and completed
      const pending = updated.filter((t) => !t.completed);
      const completed = updated.filter((t) => t.completed);

      // Keep only max 10 most recent completed tasks
      const trimmedCompleted = completed.slice(-10);

      return [...pending, ...trimmedCompleted];
    });
  };

  const handleAddTask = (
    title: string,
    category: TaskCategory,
    dueDate?: string,
    subject?: string,
    isPriority?: boolean,
    totalSteps?: number
  ) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      category,
      completed: false,
      dueDate,
      subject,
      badgeLabel: isPriority ? 'Alta Prioridad' : category === 'life' ? 'Día a Día' : undefined,
      badgeVariant: isPriority ? 'red' : 'gray',
      currentStep: totalSteps ? 1 : undefined,
      totalSteps,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const handleIncrementStep = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.totalSteps && t.currentStep) {
          const nextStep = t.currentStep + 1;
          if (nextStep >= t.totalSteps) {
            sounds.playCheck();
            setEnergy((prevE) => Math.max(0, prevE - 1));
            return {
              ...t,
              currentStep: t.totalSteps,
              completed: true,
              completedAt: `Completada a las ${new Date().toLocaleTimeString('es-GT', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}`,
            };
          }
          return { ...t, currentStep: nextStep };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleReorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const handleMoveTaskToCategory = (taskId: string, categoryId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, category: categoryId } : t))
    );
  };

  const handleAddTaskCategory = (name: string) => {
    if (taskCategories.length >= 4) return;
    const newCat: TaskUserCategory = {
      id: `custom-${Date.now()}`,
      name,
    };
    setTaskCategories((prev) => [...prev, newCat]);
  };

  const handleEditTaskCategory = (id: string, name: string) => {
    setTaskCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  };

  const handleDeleteTaskCategory = (id: string) => {
    setTaskCategories((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) =>
      prev.map((t) => (t.category === id ? { ...t, category: 'hacer-hoy' } : t))
    );
  };

  const handleResetMoodWeek = () => {
    setMoodHistory([]);
  };

  // Budget Actions
  const handleAddExpense = (title: string, categoryId: string, amount: number) => {
    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      title,
      categoryId,
      date: `Hoy, ${new Date().toLocaleTimeString('es-GT', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
      amount,
      isRefund: false,
      icon: 'receipt',
    };

    setExpenses((prev) => [newRecord, ...prev]);

    setBudgetCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          return {
            ...c,
            spent: c.spent + amount,
          };
        }
        return c;
      })
    );
  };

  const handleEditExpense = (id: string, title: string, categoryId: string, newAmount: number) => {
    const oldExp = expenses.find((e) => e.id === id);
    if (!oldExp) return;

    const diff = newAmount - oldExp.amount;

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, title, categoryId, amount: newAmount } : e))
    );

    setBudgetCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          return { ...c, spent: c.spent + diff };
        }
        return c;
      })
    );
  };

  const handleDeleteExpense = (id: string) => {
    const oldExp = expenses.find((e) => e.id === id);
    if (!oldExp) return;

    setExpenses((prev) => prev.filter((e) => e.id !== id));

    setBudgetCategories((prev) =>
      prev.map((c) => {
        if (c.id === oldExp.categoryId) {
          return { ...c, spent: Math.max(0, c.spent - oldExp.amount) };
        }
        return c;
      })
    );
  };

  const handleAddCategory = (name: string, limit: number, icon: string) => {
    const newCat: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name,
      spent: 0,
      limit,
      icon,
    };
    setBudgetCategories((prev) => [...prev, newCat]);
  };

  const handleEditCategory = (id: string, name: string, limit: number, icon?: string) => {
    setBudgetCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, limit, icon: icon || c.icon } : c))
    );
  };

  const handleDeleteCategory = (id: string) => {
    setBudgetCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdatePresets = (presets: QuickPreset[]) => {
    setQuickPresets(presets);
  };

  const handleUpdateGoalContribution = (amount: number) => {
    setSavingsGoal((prev) => ({
      ...prev,
      current: Math.min(prev.target, prev.current + amount),
    }));
  };

  // Scholarship Actions
  const handleAddScholarshipRecord = (record: Omit<ScholarshipRecord, 'id'>) => {
    const newRecord: ScholarshipRecord = {
      ...record,
      id: `sch-${Date.now()}`,
    };
    setScholarshipRecords((prev) => [newRecord, ...prev]);
  };

  const handleDeleteScholarshipRecord = (id: string) => {
    setScholarshipRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetScholarshipHours = () => {
    setScholarshipRecords([]);
  };

  // Mood Actions
  const handleAddMood = (entry: MoodEntry) => {
    setMoodHistory((prev) => [entry, ...prev]);
  };

  // Header primary action handler
  const handlePrimaryHeaderAction = () => {
    if (currentTab === 'daily-quests') {
      setIsNewTaskOpen(true);
    } else if (currentTab === 'budget-and-coins') {
      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
      input?.focus();
    } else if (currentTab === 'scholarship-roadmap') {
      setIsLogHoursOpen(true);
    } else if (currentTab === 'focus-session') {
      const startBtn = document.querySelector('button') as HTMLButtonElement | null;
      startBtn?.click();
    } else if (currentTab === 'mood-tracker') {
      // scroll to mood selector
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalScholarshipHours = scholarshipRecords.reduce((sum, r) => sum + r.hours, 0);

  return (
    <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1c] antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Tactile Header */}
        <Header
          currentTab={currentTab}
          energy={energy}
          maxEnergy={maxEnergy}
          monthlyBudget={budgetCategories.reduce((sum, c) => sum + c.limit, 0)}
          completedHours={totalScholarshipHours}
          targetHours={targetScholarshipHours}
          onOpenPrimaryAction={handlePrimaryHeaderAction}
          onRefillEnergy={handleRefillEnergy}
        />

        {/* Screen View Container */}
        <main className="flex-1 pt-20 px-4 sm:px-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {currentTab === 'daily-quests' && (
            <DailyTasksScreen
              tasks={tasks}
              energy={energy}
              maxEnergy={maxEnergy}
              categories={taskCategories}
              onToggleTask={handleToggleTask}
              onAddTask={(title, cat) => handleAddTask(title, cat)}
              onIncrementStep={handleIncrementStep}
              onDeleteTask={handleDeleteTask}
              onRefillEnergy={handleRefillEnergy}
              onReorderTasks={handleReorderTasks}
              onMoveTaskToCategory={handleMoveTaskToCategory}
              onAddCategory={handleAddTaskCategory}
              onEditCategory={handleEditTaskCategory}
              onDeleteCategory={handleDeleteTaskCategory}
            />
          )}

          {currentTab === 'budget-and-coins' && (
            <BudgetScreen
              categories={budgetCategories}
              expenses={expenses}
              quickPresets={quickPresets}
              savingsGoal={savingsGoal}
              onAddExpense={handleAddExpense}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onUpdatePresets={handleUpdatePresets}
              onUpdateGoalContribution={handleUpdateGoalContribution}
            />
          )}

          {currentTab === 'scholarship-roadmap' && (
            <ScholarshipScreen
              records={scholarshipRecords}
              targetHours={targetScholarshipHours}
              onUpdateTargetHours={setTargetScholarshipHours}
              onAddRecord={handleAddScholarshipRecord}
              onDeleteRecord={handleDeleteScholarshipRecord}
              onResetHours={handleResetScholarshipHours}
              isLogModalOpen={isLogHoursOpen}
              setIsLogModalOpen={setIsLogHoursOpen}
            />
          )}

          {currentTab === 'focus-session' && (
            <FocusSessionScreen />
          )}

          {currentTab === 'mood-tracker' && (
            <MoodTrackerScreen
              moodHistory={moodHistory}
              onAddMood={handleAddMood}
              onResetWeek={handleResetMoodWeek}
            />
          )}
        </main>

        {/* Mobile Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#efeded] shadow-lg z-40 flex items-center justify-around px-2">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setCurrentTab('daily-quests');
            }}
            className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
              currentTab === 'daily-quests' ? 'text-[#1cb0f6] font-black' : 'text-[#6f7b64]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
            <span className="text-[10px] uppercase font-bold">Tareas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setCurrentTab('scholarship-roadmap');
            }}
            className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
              currentTab === 'scholarship-roadmap' ? 'text-[#1cb0f6] font-black' : 'text-[#6f7b64]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">route</span>
            <span className="text-[10px] uppercase font-bold">Becas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setCurrentTab('budget-and-coins');
            }}
            className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
              currentTab === 'budget-and-coins' ? 'text-[#1cb0f6] font-black' : 'text-[#6f7b64]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">savings</span>
            <span className="text-[10px] uppercase font-bold">Gastos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setCurrentTab('focus-session');
            }}
            className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
              currentTab === 'focus-session' ? 'text-[#1cb0f6] font-black' : 'text-[#6f7b64]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">timer</span>
            <span className="text-[10px] uppercase font-bold">Enfoque</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setCurrentTab('mood-tracker');
            }}
            className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all cursor-pointer ${
              currentTab === 'mood-tracker' ? 'text-[#1cb0f6] font-black' : 'text-[#6f7b64]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
            <span className="text-[10px] uppercase font-bold">Ánimo</span>
          </button>
        </nav>
      </div>

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onAddTask={handleAddTask}
        categories={taskCategories}
      />
    </div>
  );
}
