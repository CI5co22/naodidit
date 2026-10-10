import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  BudgetCategory,
  ExpenseRecord,
  QuickPreset,
  SavingsGoal,
} from "../../types";
import { sounds } from "../../utils/sound";

const AVAILABLE_CATEGORY_ICONS = [
  "shopping_bag",
  "restaurant",
  "local_cafe",
  "directions_car",
  "school",
  "fitness_center",
  "devices",
  "movie",
  "home",
  "pets",
  "medical_services",
  "savings",
  "local_mall",
  "sports_esports",
];

interface BudgetScreenProps {
  categories: BudgetCategory[];
  expenses: ExpenseRecord[];
  quickPresets: QuickPreset[];
  savingsGoal: SavingsGoal;
  monthlyBudget: number;
  onSetMonthlyBudget: (amount: number) => void;
  onAddExpense: (title: string, categoryId: string, amount: number) => void;
  onEditExpense: (
    id: string,
    title: string,
    categoryId: string,
    amount: number,
  ) => void;
  onDeleteExpense: (id: string) => void;
  onResetCategory: (categoryId: string) => void;
  onAddCategory: (name: string, limit: number, icon: string) => void;
  onEditCategory: (
    id: string,
    name: string,
    limit: number,
    icon?: string,
  ) => void;
  onDeleteCategory: (id: string) => void;
  onUpdatePresets: (presets: QuickPreset[]) => void;
  onUpdateGoalContribution: (amount: number) => void;
  onUpdateGoalDetails: (name: string, target: number) => void;
  onWithdrawFromSavings: (amount: number, categoryId: string, title: string) => boolean;
  animationsEnabled: boolean;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  categories,
  expenses,
  quickPresets,
  savingsGoal,
  monthlyBudget,
  onSetMonthlyBudget,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onResetCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onUpdatePresets,
  onUpdateGoalContribution,
  onUpdateGoalDetails,
  onWithdrawFromSavings,
  animationsEnabled,
}) => {
  // Expense form
  const [amountInput, setAmountInput] = useState("14.50");
  const [categorySelect, setCategorySelect] = useState(
    categories[0]?.id || "food",
  );
  const [providerInput, setProviderInput] = useState("Cafetería Universitaria");
  const [sliderAmount, setSliderAmount] = useState(25);
  const [expenseLimitError, setExpenseLimitError] = useState("");

  // Category modal states
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("500");
  const [newCatIcon, setNewCatIcon] = useState("shopping_bag");
  const [newCategoryLimitError, setNewCategoryLimitError] = useState("");

  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
    null,
  );
  const [editCatName, setEditCatName] = useState("");
  const [editCatLimit, setEditCatLimit] = useState("");
  const [editCatIcon, setEditCatIcon] = useState("shopping_bag");
  const [editCategoryLimitError, setEditCategoryLimitError] = useState("");

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState(String(monthlyBudget));
  const [monthlyBudgetError, setMonthlyBudgetError] = useState("");

  // Preset edit modal
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [editingPresets, setEditingPresets] =
    useState<QuickPreset[]>(quickPresets);

  // Expense edit modal
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(
    null,
  );
  const [editExpTitle, setEditExpTitle] = useState("");
  const [editExpAmount, setEditExpAmount] = useState("");
  const [editExpCat, setEditExpCat] = useState("");

  // Goal modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalNameInput, setGoalNameInput] = useState(savingsGoal.name);
  const [goalTargetInput, setGoalTargetInput] = useState(String(savingsGoal.target));
  const [goalMovementAmount, setGoalMovementAmount] = useState("");
  const [goalMovementType, setGoalMovementType] = useState<"add" | "withdraw">("add");
  const [goalWithdrawalCategory, setGoalWithdrawalCategory] = useState(categories[0]?.id || "");
  const [goalWithdrawalTitle, setGoalWithdrawalTitle] = useState("");
  const [goalError, setGoalError] = useState("");

  const totalLimit = monthlyBudget;
  const allocatedCategoryBudget = categories.reduce((sum, category) => sum + category.limit, 0);
  const remainingBudgetToAllocate = Math.max(0, totalLimit - allocatedCategoryBudget);
  const editingCategoryAvailable = editingCategory
    ? Math.max(0, totalLimit - categories.filter((category) => category.id !== editingCategory.id).reduce((sum, category) => sum + category.limit, 0))
    : 0;
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const selectedBudgetCategory = categories.find((category) => category.id === categorySelect);
  const selectedCategoryAvailable = selectedBudgetCategory
    ? Math.max(0, selectedBudgetCategory.limit - selectedBudgetCategory.spent)
    : 0;
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallPercent =
    totalLimit > 0
      ? Math.min(100, Math.round((totalSpent / totalLimit) * 1000) / 10)
      : 0;

  const handleRegisterExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amountInput);
    if (isNaN(parsed) || parsed <= 0 || !providerInput.trim()) return;
    if (parsed > selectedCategoryAvailable) {
      setExpenseLimitError(`En ${selectedBudgetCategory?.name || "esta categoría"} solo quedan Q${selectedCategoryAvailable.toFixed(2)}.`);
      return;
    }

    sounds.playCoin();
    onAddExpense(providerInput.trim(), categorySelect, parsed);
    setExpenseLimitError("");
    setAmountInput("");
    setProviderInput("");

    try {
      if (animationsEnabled)
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.3 },
          colors: ["#58cc02", "#2fb8ff"],
        });
    } catch {
      // ignore
    }
  };

  const handleQuickPresetClick = (preset: QuickPreset) => {
    const category = categories.find((item) => item.id === preset.categoryId);
    const available = category ? Math.max(0, category.limit - category.spent) : 0;
    if (preset.amount > available) {
      setExpenseLimitError(`Para ${category?.name || "esta categoría"} solo quedan Q${available.toFixed(2)}.`);
      return;
    }
    setExpenseLimitError("");
    sounds.playCoin();
    onAddExpense(preset.name, preset.categoryId, preset.amount);
  };

  const handleRegisterSlider = () => {
    if (sliderAmount > selectedCategoryAvailable) {
      setExpenseLimitError(`En ${selectedBudgetCategory?.name || "esta categoría"} solo quedan Q${selectedCategoryAvailable.toFixed(2)}.`);
      return;
    }
    setExpenseLimitError("");
    sounds.playCoin();
    onAddExpense("Gasto Rápido", categorySelect, sliderAmount);
  };

  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const lim = parseFloat(newCatLimit);
    if (!newCatName.trim() || !Number.isFinite(lim) || lim <= 0) return;
    if (lim > remainingBudgetToAllocate) {
      setNewCategoryLimitError(`Solo tenés Q${remainingBudgetToAllocate.toFixed(2)} disponibles para asignar.`);
      return;
    }
    sounds.playPop();
    onAddCategory(newCatName.trim(), lim, newCatIcon);
    setNewCatName("");
    setNewCatLimit("500");
    setNewCategoryLimitError("");
    setIsAddCatOpen(false);
  };

  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const lim = parseFloat(editCatLimit);
    if (!editCatName.trim() || !Number.isFinite(lim) || lim <= 0) return;
    if (lim > editingCategoryAvailable) {
      setEditCategoryLimitError(`Para esta categoría hay Q${editingCategoryAvailable.toFixed(2)} disponibles.`);
      return;
    }
    sounds.playPop();
    onEditCategory(editingCategory.id, editCatName.trim(), lim, editCatIcon);
    setEditCategoryLimitError("");
    setEditingCategory(null);
  };

  const handleSaveMonthlyBudget = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(monthlyBudgetInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMonthlyBudgetError("Ingresá un monto mayor a Q0.00.");
      return;
    }
    if (amount < allocatedCategoryBudget) {
      setMonthlyBudgetError(`Ya asignaste Q${allocatedCategoryBudget.toFixed(2)} a tus categorías. El presupuesto debe cubrir esa cantidad.`);
      return;
    }
    onSetMonthlyBudget(amount);
    setMonthlyBudgetError("");
    setIsBudgetModalOpen(false);
  };

  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const amt = parseFloat(editExpAmount);
    if (!editExpTitle.trim() || isNaN(amt) || amt <= 0) return;
    sounds.playPop();
    onEditExpense(editingExpense.id, editExpTitle.trim(), editExpCat, amt);
    setEditingExpense(null);
  };

  const selectedGoalCategory = categories.find((category) => category.id === goalWithdrawalCategory);
  const goalWithdrawalAvailable = selectedGoalCategory
    ? Math.max(0, Math.min(savingsGoal.current, selectedGoalCategory.limit - selectedGoalCategory.spent))
    : 0;

  const openGoalModal = () => {
    setGoalNameInput(savingsGoal.name);
    setGoalTargetInput(String(savingsGoal.target));
    setGoalMovementAmount("");
    setGoalMovementType("add");
    setGoalWithdrawalCategory(categories[0]?.id || "");
    setGoalWithdrawalTitle("");
    setGoalError("");
    setShowGoalModal(true);
  };

  const handleSaveGoalDetails = () => {
    const target = Number(goalTargetInput);
    if (!goalNameInput.trim() || !Number.isFinite(target) || target <= 0) {
      setGoalError("Ingresá un nombre y una meta mayor a Q0.00.");
      return;
    }
    onUpdateGoalDetails(goalNameInput.trim(), target);
    setGoalError("");
  };

  const handleGoalMovement = () => {
    const amount = Number(goalMovementAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setGoalError("Ingresá un monto mayor a Q0.00.");
      return;
    }
    if (goalMovementType === "withdraw") {
      if (!selectedGoalCategory) {
        setGoalError("Elegí una categoría para registrar el gasto.");
        return;
      }
      if (amount > goalWithdrawalAvailable) {
        setGoalError(`Podés retirar hasta Q${goalWithdrawalAvailable.toFixed(2)} entre tu ahorro y el saldo disponible de la categoría.`);
        return;
      }
      const expenseTitle = goalWithdrawalTitle.trim() || `Retiro de ahorro: ${savingsGoal.name}`;
      if (!onWithdrawFromSavings(amount, goalWithdrawalCategory, expenseTitle)) {
        setGoalError("No se pudo registrar el retiro. Revisá el saldo de ahorro y de la categoría.");
        return;
      }
    } else {
      onUpdateGoalContribution(amount);
    }
    sounds.playCoin();
    setGoalMovementAmount("");
    setGoalError("");
    setShowGoalModal(false);
  };

  const goalPercent =
    savingsGoal.target > 0
      ? Math.round((savingsGoal.current / savingsGoal.target) * 100)
      : 0;
  const goalPercentClamped = Math.min(100, Math.max(0, goalPercent));

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      <section className="bg-white rounded-2xl p-5 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-[#1b1c1c]">Presupuesto mensual: Q{monthlyBudget.toFixed(2)}</h3>
          <p className="text-sm text-[#6f7b64] mt-1">Disponible para repartir: <strong>Q{remainingBudgetToAllocate.toFixed(2)}</strong></p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMonthlyBudgetInput(String(monthlyBudget));
            setMonthlyBudgetError("");
            setIsBudgetModalOpen(true);
          }}
          className="btn-tactile-blue px-4 py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          Establecer presupuesto
        </button>
      </section>

      {/* Top Bar: Agregar Nuevo Gasto in Quetzales (Q) */}
      <section className="bg-white rounded-2xl p-5 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#58cc02] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                add_card
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#1b1c1c]">
              Agregar Nuevo Gasto
            </h3>
          </div>
        </div>

        <form
          onSubmit={handleRegisterExpense}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          {/* Monto in Quetzales (Q) */}
          <div className="sm:col-span-3 flex flex-col gap-1">
            <label className="text-[11px] font-black uppercase text-[#6f7b64] tracking-wider">
              Monto (Q)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-[#3f4a36]">
                Q
              </span>
              <input
                type="number"
                step="0.01"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setExpenseLimitError("");
                }}
                placeholder="0.00"
                className="w-full bg-[#f5f3f3] text-[#1b1c1c] font-black text-sm pl-7 pr-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#58cc02]"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="sm:col-span-4 flex flex-col gap-1">
            <label className="text-[11px] font-black uppercase text-[#6f7b64] tracking-wider">
              Categoría
            </label>
            <select
              value={categorySelect}
              onChange={(e) => {
                setCategorySelect(e.target.value);
                setExpenseLimitError("");
              }}
              className="w-full bg-[#f5f3f3] text-[#1b1c1c] font-bold text-xs px-3 py-2.5 rounded-xl focus:outline-none shadow-[0_2px_0_0_#e4e2e2] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Proveedor / Detalle */}
          <div className="sm:col-span-3 flex flex-col gap-1">
            <label className="text-[11px] font-black uppercase text-[#6f7b64] tracking-wider">
              Proveedor / Detalle
            </label>
            <input
              type="text"
              value={providerInput}
              onChange={(e) => setProviderInput(e.target.value)}
              placeholder="Cafetería, librería..."
              className="w-full bg-[#f5f3f3] text-[#1b1c1c] font-semibold text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#58cc02]"
            />
          </div>

          {/* Botón Registrar */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full btn-tactile-blue text-xs font-black uppercase py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                add_circle
              </span>
              <span className="truncate">REGISTRAR</span>
            </button>
          </div>
        </form>
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-xs font-bold text-[#006590]">Disponible en {selectedBudgetCategory?.name || "esta categoría"}: Q{selectedCategoryAvailable.toFixed(2)}</p>
          {expenseLimitError && <p role="alert" className="text-xs font-bold text-[#ba1a1a]">{expenseLimitError}</p>}
        </div>
      </section>

      {/* Main Grid: Categories (Left) vs Fast Register & Goal (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Categorías de Presupuesto */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#c8e6ff] text-[#006590] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">
                  pie_chart
                </span>
              </div>
              <h3 className="text-lg font-black text-[#1b1c1c]">
                Categorías de Presupuesto
              </h3>
            </div>

            {/* Add Category Trigger */}
            <button
              type="button"
              onClick={() => {
                setNewCatLimit(remainingBudgetToAllocate.toFixed(2));
                setNewCategoryLimitError("");
                setIsAddCatOpen(true);
              }}
              className="btn-tactile-blue text-xs font-black uppercase px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>NUEVA CATEGORÍA</span>
            </button>
          </div>

          {/* List of Category Cards with PERIMETER REDUCING BORDER */}
          <div className="flex flex-col gap-4">
            {categories.map((cat) => {
              const isAtOrOverLimit = cat.spent >= cat.limit;
              const isOverspent = cat.spent > cat.limit;
              const remainingAmount = Math.max(0, cat.limit - cat.spent);
              const percentUsed = cat.limit > 0 ? cat.spent / cat.limit : 1;

              // Perimeter calculation:
              // When unspent (0 spent): 100% perimeter remaining.
              // When spent increases: perimeter reduces.
              // If overspent: perimeter becomes negative/red.
              const remainingFraction = Math.max(0, 1 - percentUsed);
              const strokeOffset = (1 - remainingFraction) * 100;

              // If overspent: red perimeter stroke, otherwise green or yellow
              const overspentExcess = isOverspent ? cat.spent - cat.limit : 0;
              const overspentFraction =
                cat.limit > 0 ? Math.min(1, overspentExcess / cat.limit) : 1;
              const overspentOffset = (1 - overspentFraction) * 100;

              return (
                <div
                  key={cat.id}
                  className={`relative rounded-2xl p-5 transition-all shadow-[0_4px_0_0_#e4e2e2] overflow-hidden ${
                    isAtOrOverLimit
                      ? "opacity-65 hover:opacity-95 bg-[#ffdad6]/25 border-2 border-[#ba1a1a]/50 shadow-[0_4px_0_0_#ffdad6]"
                      : "bg-white border border-[#efeded]"
                  }`}
                >
                  {/* SVG PERIMETER BORDER: Reduces in perimeter as spent, turns red when over limit */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-visible"
                    style={{ zIndex: 1 }}
                  >
                    {!isOverspent ? (
                      /* Normal decreasing perimeter border (green / teal) */
                      <rect
                        x="2"
                        y="2"
                        width="calc(100% - 4px)"
                        height="calc(100% - 4px)"
                        rx="16"
                        fill="none"
                        stroke={
                          isAtOrOverLimit
                            ? "#ba1a1a"
                            : percentUsed > 0.85
                              ? "#ff9c27"
                              : "#58cc02"
                        }
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-500"
                      />
                    ) : (
                      /* Overspent RED perimeter border showing excess */
                      <rect
                        x="2"
                        y="2"
                        width="calc(100% - 4px)"
                        height="calc(100% - 4px)"
                        rx="16"
                        fill="none"
                        stroke="#ba1a1a"
                        strokeWidth="4"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={overspentOffset}
                        className="transition-all duration-500 animate-pulse"
                      />
                    )}
                  </svg>

                  {/* Card Content */}
                  <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                            isAtOrOverLimit
                              ? "bg-[#ba1a1a] text-white"
                              : percentUsed > 0.85
                                ? "bg-[#ffdcbf] text-[#8c5000]"
                                : "bg-[#87fe45]/40 text-[#2b6c00]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[24px]">
                            {isAtOrOverLimit ? "block" : cat.icon}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-extrabold text-[#1b1c1c]">
                              {cat.name}
                            </span>

                            {isAtOrOverLimit ? (
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#ba1a1a] text-white animate-bounce">
                                ¡YA NO PODES GASTAR EN ESTO!
                              </span>
                            ) : percentUsed >= 0.85 ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#ffdcbf] text-[#6a3b00]">
                                CERCA DEL LÍMITE
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#87fe45] text-[#082100]">
                                BUEN RITMO
                              </span>
                            )}
                          </div>

                          {isOverspent && (
                            <span className="text-xs text-[#ba1a1a] font-bold mt-0.5">
                              Excedido por Q{overspentExcess.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right amount & edit controls */}
                      <div className="flex items-center gap-3">
                        <div className="text-right flex flex-col">
                          <span
                            className={`text-base font-black ${isAtOrOverLimit ? "text-[#ba1a1a]" : "text-[#1b1c1c]"}`}
                          >
                            Q{cat.spent.toFixed(2)}{" "}
                            <span className="text-xs font-semibold text-[#6f7b64]">
                              / Q{cat.limit.toFixed(2)}
                            </span>
                          </span>
                          <span
                            className={`text-[11px] font-extrabold ${isAtOrOverLimit ? "text-[#ba1a1a]" : "text-[#3f4a36]"}`}
                          >
                            {Math.round(percentUsed * 100)}% UTILIZADO
                          </span>
                        </div>

                        {/* Category actions */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditCatName(cat.name);
                            setEditCatLimit(cat.limit.toString());
                            setEditCatIcon(cat.icon);
                            setEditCategoryLimitError("");
                          }}
                          title="Editar categoría"
                          className="p-1.5 text-[#6f7b64] hover:text-[#006590] rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (cat.spent <= 0) return;
                            const confirmed = window.confirm(
                              `¿Reiniciar "${cat.name}"? Se borrarán los gastos registrados en esta categoría y el total volverá a Q0.00.`,
                            );
                            if (confirmed) onResetCategory(cat.id);
                          }}
                          title={`Reiniciar ${cat.name} y borrar sus gastos`}
                          aria-label={`Reiniciar categoría ${cat.name}`}
                          disabled={cat.spent <= 0}
                          className="p-1.5 text-[#6f7b64] hover:text-[#ba1a1a] rounded-lg hover:bg-white/80 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            restart_alt
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Footer text */}
                    <div className="flex items-center justify-between text-xs text-[#3f4a36] font-semibold pt-1 border-t border-[#efeded]/70">
                      <span className="flex items-center gap-1">
                        {isAtOrOverLimit ? (
                          <>
                            <span className="material-symbols-outlined text-[15px] text-[#ba1a1a]">
                              block
                            </span>
                            <span className="text-[#ba1a1a] font-black">
                              ¡Ya no puedes gastar acá!
                            </span>
                          </>
                        ) : (
                          <span>Disponible</span>
                        )}
                      </span>
                      <span
                        className={
                          isAtOrOverLimit
                            ? "text-[#ba1a1a] font-black"
                            : "font-black"
                        }
                      >
                        {isOverspent
                          ? `-Q${overspentExcess.toFixed(2)}`
                          : isAtOrOverLimit
                            ? "Q0.00 restantes"
                            : `Q${remainingAmount.toFixed(2)} restantes`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT: Quick Register (Editable) & Vacaciones Goal */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Registro Rápido with Editable Presets */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006590] text-[20px]">
                  add_circle
                </span>
                <h4 className="text-sm font-extrabold text-[#1b1c1c]">
                  Registro Rápido
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPresets([...quickPresets]);
                  setIsPresetModalOpen(true);
                }}
                className="text-xs text-[#006590] font-black hover:underline cursor-pointer"
              >
                Editar botones
              </button>
            </div>

            {/* Quick chips in Quetzales (Q) */}
            <div className="grid grid-cols-3 gap-2">
              {quickPresets.map((preset) => {
                const presetCategory = categories.find((category) => category.id === preset.categoryId);
                const presetAvailable = presetCategory ? Math.max(0, presetCategory.limit - presetCategory.spent) : 0;
                const cannotAffordPreset = !presetCategory || preset.amount > presetAvailable;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleQuickPresetClick(preset)}
                    disabled={cannotAffordPreset}
                    title={cannotAffordPreset ? `Disponible: Q${presetAvailable.toFixed(2)}` : preset.name}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#f5f3f3] hover:bg-[#87fe45]/30 text-[#1b1c1c] shadow-[0_2px_0_0_#e4e2e2] active:translate-y-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#58cc02]">
                      {preset.icon}
                    </span>
                    <span className="text-sm font-black mt-1">Q{preset.amount}</span>
                    <span className="text-[10px] text-[#6f7b64] font-bold truncate max-w-[60px]">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Monto Personalizado Slider in Quetzales (Q) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#f5f3f3]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3f4a36]">
                  Monto personalizado:
                </span>
                <span className="text-base font-black text-[#2b6c00]">
                  Q{sliderAmount.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={sliderAmount}
                onChange={(e) => setSliderAmount(Number(e.target.value))}
                className="w-full accent-[#58cc02] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-bold text-[#6f7b64]">
                <span>Q1</span>
                <span>Q100</span>
                <span>Q200</span>
              </div>
            </div>

            <p className="text-xs font-bold text-[#006590]">Disponible en {selectedBudgetCategory?.name || "esta categoría"}: Q{selectedCategoryAvailable.toFixed(2)}</p>
            {expenseLimitError && <p role="alert" className="text-xs font-bold text-[#ba1a1a]">{expenseLimitError}</p>}

            <button
              type="button"
              onClick={handleRegisterSlider}
              disabled={sliderAmount > selectedCategoryAvailable}
              className="w-full btn-tactile-blue text-xs font-black uppercase py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              <span>REGISTRAR GASTO</span>
            </button>
          </div>

          {/* Savings Goal */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ffdcbf] text-[#8c5000] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">
                    luggage
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1b1c1c]">
                    {savingsGoal.name}
                  </h4>
                  <p className="text-[11px] text-[#6f7b64]">
                    Objetivo: Q{savingsGoal.target.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={openGoalModal}
                  className="text-xs font-bold text-[#3f4a36] hover:text-[#006590] flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    edit
                  </span>
                  <span className="text-[10px]">Editar ahorro</span>
                </button>
                <span className="bg-[#c8e6ff] text-[#001e2e] text-[11px] font-black px-1.5 py-0.5 rounded-md ml-1">
                  {goalPercent}%
                </span>
              </div>
            </div>

            <div className="bg-[#ffdcbf]/30 rounded-xl p-4 text-center border border-[#ffdcbf] flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-[#8c5000]">
                Q{savingsGoal.current.toFixed(2)}
              </span>
              <div className="w-full flex items-center justify-between text-[10px] font-bold text-[#8c5000] mt-3">
                <span>Ahorrado: Q{savingsGoal.current.toFixed(2)}</span>
                <span>Meta: Q{savingsGoal.target.toFixed(2)}</span>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mt-1 p-0.5 shadow-inner">
                <div
                  className="h-full bg-[#ff9c27] rounded-full transition-all"
                  style={{ width: `${goalPercentClamped}%` }}
                />
              </div>
            </div>

          </div>
        </aside>
      </div>

      {/* Gastos Recientes (with Edit & Delete options) */}
      <section className="bg-white rounded-2xl p-5 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2b6c00] text-[20px]">
                receipt_long
              </span>
              <h3 className="text-base font-extrabold text-[#1b1c1c]">
                Gastos Recientes
              </h3>
            </div>
            <p className="text-xs text-[#3f4a36] font-semibold">
              Historial detallado de transacciones
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6f7b64] font-bold">
              Total: {expenses.length} registros
            </span>
          </div>
        </div>

        {/* List of recent expenses with EDIT and DELETE */}
        <div className="flex flex-col divide-y divide-[#efeded]">
          {expenses.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.isRefund
                      ? "bg-[#87fe45]/40 text-[#2b6c00]"
                      : "bg-[#f5f3f3] text-[#006590]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#1b1c1c]">
                    {item.title}
                  </span>
                  <span className="text-xs text-[#6f7b64] font-semibold">
                    {item.date} •{" "}
                    {categories.find((c) => c.id === item.categoryId)?.name ||
                      item.categoryId}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-sm sm:text-base font-black ${
                    item.isRefund ? "text-[#2b6c00]" : "text-[#1b1c1c]"
                  }`}
                >
                  {item.isRefund ? "+" : "-"}Q{item.amount.toFixed(2)}
                </span>

                {/* Edit & Delete Buttons */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingExpense(item);
                    setEditExpTitle(item.title);
                    setEditExpAmount(item.amount.toString());
                    setEditExpCat(item.categoryId);
                  }}
                  title="Editar gasto"
                  className="text-[#6f7b64] hover:text-[#006590] p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onDeleteExpense(item.id);
                  }}
                  title="Eliminar gasto"
                  className="text-[#6f7b64] hover:text-[#ba1a1a] p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resumen Mensual */}
      <section className="bg-white rounded-2xl p-5 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#87fe45] text-[#082100] flex items-center justify-center font-bold shadow-sm">
            <span className="material-symbols-outlined text-[24px]">
              wallet
            </span>
          </div>
          <div className="flex flex-col">
            <h4 className="text-base font-black text-[#1b1c1c]">
              Resumen Mensual
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-[#3f4a36]">
              Gastado: <strong>Q{totalSpent.toFixed(2)}</strong> · Restante: Q{totalRemaining.toFixed(2)} · Presupuesto: Q{totalLimit.toFixed(2)}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-right">
            <span className="text-sm font-black text-[#1b1c1c]">
              {overallPercent}%
            </span>
            <span className="block text-[10px] text-[#6f7b64] font-bold">
              Utilizado
            </span>
          </div>
        </div>
      </section>

      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1b1c1c]">Establecer presupuesto</h3>
              <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="text-[#6f7b64] hover:text-[#1b1c1c] font-black" aria-label="Cerrar">✕</button>
            </div>
            <form onSubmit={handleSaveMonthlyBudget} className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase text-[#6f7b64]" htmlFor="monthly-budget-input">Presupuesto total del mes (Q)</label>
              <input
                id="monthly-budget-input"
                type="number"
                step="0.01"
                required
                value={monthlyBudgetInput}
                onChange={(event) => {
                  setMonthlyBudgetInput(event.target.value);
                  setMonthlyBudgetError("");
                }}
                className="bg-[#f5f3f3] text-sm font-bold p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1cb0f6]"
              />
              <p className="text-xs text-[#6f7b64]">Ya asignado a categorías: Q{allocatedCategoryBudget.toFixed(2)}.</p>
              {monthlyBudgetError && <p className="text-xs font-bold text-[#ba1a1a]">{monthlyBudgetError}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#58cc02] text-white text-xs font-black uppercase py-2.5 rounded-xl shadow-[0_3px_0_0_#1e5000]">Guardar presupuesto</button>
                <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="bg-[#f5f3f3] text-[#3f4a36] text-xs font-bold px-4 py-2.5 rounded-xl">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: Add New Category */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1b1c1c]">
                Nueva Categoría
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCatOpen(false)}
                className="text-[#6f7b64] hover:text-[#1b1c1c] font-black"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveNewCategory}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Transporte, Salud..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Límite en Quetzales (Q)
                </label>
                <span className="text-xs font-bold text-[#006590]">Disponible para asignar: Q{remainingBudgetToAllocate.toFixed(2)}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={newCatLimit}
                  onChange={(e) => {
                    setNewCatLimit(e.target.value);
                    setNewCategoryLimitError("");
                  }}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none"
                />
                {newCategoryLimitError && <span className="text-xs font-bold text-[#ba1a1a]">{newCategoryLimitError}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Selecciona un Icono
                </label>
                <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#f5f3f3] rounded-2xl border border-[#efeded]">
                  {AVAILABLE_CATEGORY_ICONS.map((icon) => {
                    const isSelected = newCatIcon === icon;
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setNewCatIcon(icon);
                        }}
                        className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1cb0f6] text-white shadow-[0_2px_0_0_#006590] scale-105 ring-2 ring-[#006590]"
                            : "bg-white text-[#3f4a36] hover:bg-[#eae8e7] hover:text-[#1b1c1c]"
                        }`}
                        title={icon}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {icon}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#58cc02] text-white text-xs font-black uppercase py-2.5 rounded-xl shadow-[0_3px_0_0_#1e5000]"
                >
                  Crear Categoría
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCatOpen(false)}
                  className="bg-[#f5f3f3] text-[#3f4a36] text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Category */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1b1c1c]">
                Editar Categoría
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="text-[#6f7b64] hover:text-[#1b1c1c] font-black"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveEditCategory}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Límite en Quetzales (Q)
                </label>
                <span className="text-xs font-bold text-[#006590]">Disponible para esta categoría: Q{editingCategoryAvailable.toFixed(2)}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={editCatLimit}
                  onChange={(e) => {
                    setEditCatLimit(e.target.value);
                    setEditCategoryLimitError("");
                  }}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none"
                />
                {editCategoryLimitError && <span className="text-xs font-bold text-[#ba1a1a]">{editCategoryLimitError}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Icono
                </label>
                <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#f5f3f3] rounded-2xl border border-[#efeded]">
                  {AVAILABLE_CATEGORY_ICONS.map((icon) => {
                    const isSelected = editCatIcon === icon;
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setEditCatIcon(icon);
                        }}
                        className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1cb0f6] text-white shadow-[0_2px_0_0_#006590] scale-105 ring-2 ring-[#006590]"
                            : "bg-white text-[#3f4a36] hover:bg-[#eae8e7] hover:text-[#1b1c1c]"
                        }`}
                        title={icon}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {icon}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#58cc02] text-white text-xs font-black uppercase py-2.5 rounded-xl shadow-[0_3px_0_0_#1e5000]"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    onDeleteCategory(editingCategory.id);
                    setEditingCategory(null);
                  }}
                  className="bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Quick Presets */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1b1c1c]">
                Editar Botones Rápidos
              </h3>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="text-[#6f7b64] hover:text-[#1b1c1c] font-black"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {editingPresets.map((p, idx) => (
                <div
                  key={p.id}
                  className="p-3 bg-[#f5f3f3] rounded-xl flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => {
                      const next = [...editingPresets];
                      next[idx].name = e.target.value;
                      setEditingPresets(next);
                    }}
                    className="w-1/2 bg-white text-xs font-bold p-1.5 rounded-lg focus:outline-none"
                  />
                  <div className="flex items-center gap-1 w-1/2">
                    <span className="text-xs font-bold">Q</span>
                    <input
                      type="number"
                      value={p.amount}
                      onChange={(e) => {
                        const next = [...editingPresets];
                        next[idx].amount = Number(e.target.value);
                        setEditingPresets(next);
                      }}
                      className="w-full bg-white text-xs font-bold p-1.5 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onUpdatePresets(editingPresets);
                setIsPresetModalOpen(false);
              }}
              className="w-full bg-[#58cc02] text-white text-xs font-black uppercase py-2.5 rounded-xl shadow-[0_3px_0_0_#1e5000]"
            >
              Guardar Botones
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Expense */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1b1c1c]">
                Editar Gasto
              </h3>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="text-[#6f7b64] hover:text-[#1b1c1c] font-black"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveEditExpense}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Concepto / Detalle
                </label>
                <input
                  type="text"
                  required
                  value={editExpTitle}
                  onChange={(e) => setEditExpTitle(e.target.value)}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Monto en Quetzales (Q)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editExpAmount}
                  onChange={(e) => setEditExpAmount(e.target.value)}
                  className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase text-[#6f7b64]">
                  Categoría
                </label>
                <select
                  value={editExpCat}
                  onChange={(e) => setEditExpCat(e.target.value)}
                  className="bg-[#f5f3f3] text-xs font-bold p-2.5 rounded-xl focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#58cc02] text-white text-xs font-black uppercase py-2.5 rounded-xl shadow-[0_3px_0_0_#1e5000]"
                >
                  Actualizar Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="bg-[#f5f3f3] text-[#3f4a36] text-xs font-bold px-4 py-2.5 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Savings goal and movement modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#efeded] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1b1c1c]">Editar ahorro</h3>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="text-[#6f7b64] hover:text-[#1b1c1c] font-black"
              >
                ✕
              </button>
            </div>
            <section className="flex flex-col gap-3 rounded-xl bg-[#f5f3f3] p-4">
              <p className="text-xs font-bold text-[#3f4a36]">Nombre y monto objetivo de tu meta.</p>
              <label className="flex flex-col gap-1 text-xs font-bold text-[#6f7b64]">
                Nombre
                <input type="text" value={goalNameInput} onChange={(event) => setGoalNameInput(event.target.value)} maxLength={48} className="bg-white text-sm font-bold p-2.5 rounded-xl focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold text-[#6f7b64]">
                Meta (Q)
                <input type="number" min="0.01" step="0.01" value={goalTargetInput} onChange={(event) => setGoalTargetInput(event.target.value)} className="bg-white text-sm font-bold p-2.5 rounded-xl focus:outline-none" />
              </label>
              <button type="button" onClick={handleSaveGoalDetails} className="bg-[#2fb8ff] text-white text-xs font-black uppercase py-2.5 rounded-xl shadow-[0_3px_0_0_#006590]">
                Guardar meta
              </button>
            </section>

            <section className="flex flex-col gap-3">
              <p className="text-xs font-bold text-[#3f4a36]">Saldo actual: Q{savingsGoal.current.toFixed(2)}</p>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f5f3f3] p-1">
                <button type="button" onClick={() => { setGoalMovementType("add"); setGoalError(""); }} aria-pressed={goalMovementType === "add"} className={`rounded-lg py-2 text-xs font-black ${goalMovementType === "add" ? "bg-white text-[#2b6c00] shadow-sm" : "text-[#6f7b64]"}`}>Aportar</button>
                <button type="button" onClick={() => { setGoalMovementType("withdraw"); setGoalError(""); }} aria-pressed={goalMovementType === "withdraw"} className={`rounded-lg py-2 text-xs font-black ${goalMovementType === "withdraw" ? "bg-white text-[#ba1a1a] shadow-sm" : "text-[#6f7b64]"}`}>Descontar</button>
              </div>
              <label className="flex flex-col gap-1 text-xs font-bold text-[#6f7b64]">
                {goalMovementType === "add" ? "Monto para agregar (Q)" : "Monto a descontar (Q)"}
                <input type="number" min="0.01" step="0.01" value={goalMovementAmount} onChange={(event) => setGoalMovementAmount(event.target.value)} className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none" />
              </label>
              {goalMovementType === "withdraw" && (
                <>
                  <label className="flex flex-col gap-1 text-xs font-bold text-[#6f7b64]">
                    Categoría del gasto
                    <select value={goalWithdrawalCategory} onChange={(event) => setGoalWithdrawalCategory(event.target.value)} className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none">
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name} · quedan Q{Math.max(0, category.limit - category.spent).toFixed(2)}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-bold text-[#6f7b64]">
                    Concepto (opcional)
                    <input type="text" value={goalWithdrawalTitle} onChange={(event) => setGoalWithdrawalTitle(event.target.value)} placeholder={`Retiro de ahorro: ${savingsGoal.name}`} maxLength={80} className="bg-[#f5f3f3] text-sm font-bold p-2.5 rounded-xl focus:outline-none" />
                  </label>
                  <p className="text-[11px] font-semibold text-[#6f7b64]">Disponible para retirar: Q{goalWithdrawalAvailable.toFixed(2)}. El retiro también aparecerá en Gastos Recientes.</p>
                </>
              )}
            </div>
            {goalError && <p role="alert" className="text-xs font-bold text-[#ba1a1a]">{goalError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGoalMovement}
                className={`flex-1 text-white text-xs font-black uppercase py-2.5 rounded-xl ${goalMovementType === "add" ? "bg-[#58cc02] shadow-[0_3px_0_0_#1e5000]" : "bg-[#ff8b75] shadow-[0_3px_0_0_#ba1a1a]"}`}
              >
                {goalMovementType === "add" ? "+ Agregar al ahorro" : "− Descontar y registrar gasto"}
              </button>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="bg-[#f5f3f3] text-[#3f4a36] text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
