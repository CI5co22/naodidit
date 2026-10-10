import { Task, TaskUserCategory, BudgetCategory, QuickPreset, ExpenseRecord, SavingsGoal, ScholarshipRecord } from '../types';

export const INITIAL_TASK_CATEGORIES: TaskUserCategory[] = [
  { id: 'hacer-hoy', name: 'Hacer hoy', isDefault: true },
  { id: 'alta-prioridad', name: 'Alta prioridad', isDefault: true },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Terminar Guía de Matemáticas Cap. 4',
    category: 'hacer-hoy',
    completed: false,
    dueDate: 'Vence hoy 5:00 PM',
    subject: 'Cálculo II',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Borrador de Ensayo para la Universidad',
    category: 'alta-prioridad',
    completed: false,
    badgeLabel: 'Alta Prioridad',
    badgeVariant: 'red',
    currentStep: 2,
    totalSteps: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Compras de despensa para la semana',
    category: 'hacer-hoy',
    completed: false,
    badgeLabel: 'Comida y Despensa',
    badgeVariant: 'gray',
    detail: 'Lista de compras del supermercado',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Repasar tarjetas de estudio de Química',
    category: 'alta-prioridad',
    completed: false,
    badgeLabel: '25 tarjetas',
    badgeVariant: 'gray',
    detail: 'Repaso de conceptos de Química Orgánica',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Caminata de 30 minutos por el campus',
    category: 'hacer-hoy',
    completed: true,
    completedAt: 'Completada a las 8:15 AM',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'food',
    name: 'Comida y Restaurantes',
    spent: 320,
    limit: 450,
    icon: 'restaurant',
  },
  {
    id: 'tuition',
    name: 'Matrícula y Libros',
    spent: 800,
    limit: 800,
    icon: 'menu_book',
  },
  {
    id: 'housing',
    name: 'Vivienda y Servicios',
    spent: 650,
    limit: 700,
    icon: 'home',
  },
  {
    id: 'entertainment',
    name: 'Ocio y Suscripciones',
    spent: 90,
    limit: 150,
    icon: 'smart_display',
  },
];

export const INITIAL_QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'qp-1',
    name: 'Café',
    amount: 5,
    icon: 'coffee',
    categoryId: 'food',
  },
  {
    id: 'qp-2',
    name: 'Almuerzo',
    amount: 15,
    icon: 'lunch_dining',
    categoryId: 'food',
  },
  {
    id: 'qp-3',
    name: 'Despensa',
    amount: 50,
    icon: 'shopping_cart',
    categoryId: 'food',
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    title: 'Cafetería Universitaria',
    categoryId: 'food',
    date: 'Hoy, 9:20 AM',
    amount: 4.80,
    isRefund: false,
    icon: 'local_cafe',
  },
  {
    id: 'exp-2',
    title: 'Spotify Dúo',
    categoryId: 'entertainment',
    date: 'Ayer, 6:00 PM',
    amount: 8.99,
    isRefund: false,
    icon: 'headphones',
  },
  {
    id: 'exp-3',
    title: 'Librería del Campus',
    categoryId: 'tuition',
    date: '24 Oct, 2:15 PM',
    amount: 42.50,
    isRefund: false,
    icon: 'storefront',
  },
  {
    id: 'exp-4',
    title: 'Reembolso Eco-Energía',
    categoryId: 'housing',
    date: '22 Oct, 11:00 AM',
    amount: 18.00,
    isRefund: true,
    icon: 'bolt',
  },
];

export const INITIAL_SAVINGS_GOAL: SavingsGoal = {
  name: 'Vacaciones',
  target: 1000,
  current: 680,
  weeklyAutoSave: 20,
  base: 200,
  midpoint: 500,
};

export const INITIAL_SCHOLARSHIP_RECORDS: ScholarshipRecord[] = [
  {
    id: 'sch-1',
    activity: 'Tutoría de Álgebra Lineal - Grupo A',
    hours: 14,
    date: '02 Oct 2026',
    notes: 'Sesiones de apoyo semanal para estudiantes de primer año.',
  },
  {
    id: 'sch-2',
    activity: 'Digitalización y Catalogación de Archivo Histórico',
    hours: 18,
    date: '15 Sep 2026',
    notes: 'Proyecto de conservación de manuscritos de la biblioteca central.',
  },
  {
    id: 'sch-3',
    activity: 'Coordinación Logística Hackathon Interuniversitario',
    hours: 16,
    date: '28 Sep 2026',
    notes: 'Registro, entrega de kits y apoyo en control de accesos.',
  },
];
