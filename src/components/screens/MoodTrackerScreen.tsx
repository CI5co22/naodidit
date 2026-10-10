import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MoodEntry, MoodType } from '../../types';
import { sounds } from '../../utils/sound';

interface MoodTrackerScreenProps {
  moodHistory: MoodEntry[];
  onAddMood: (entry: MoodEntry) => void;
  onResetWeek?: () => void;
}

const getISOWeekKey = (date: Date = new Date()): string => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

const MOOD_OPTIONS: {
  id: MoodType;
  emoji: string;
  label: string;
  badgeColor: string;
  quotes: string[];
  facts: string[];
}[] = [
  {
    id: 'super',
    emoji: '🤩',
    label: 'Súper motivada',
    badgeColor: 'bg-[#87fe45]/40 text-[#2b6c00] border-[#87fe45]',
    quotes: [
      '“¡Esa es la actitud! Pero por favor no te inscribas a 3 cursos online que nunca vas a terminar JAJAJA.”',
      '“¡La energía está al 200%! Aprovecha antes de que te dé el bajón de las 3:00 PM.”',
      '“Hoy estás para conquistar el semestre y pedir aumento de propina.”',
    ],
    facts: [
      'Dato curioso: Las abejas bailan para comunicarse con sus compañeras. Si terminas tus tareas hoy, estás legalmente obligada a hacer un baile de victoria.',
      'Fun fact: El cerebro humano genera suficiente electricidad para encender un foco LED pequeño. ¡Hoy el tuyo tiene un proyector láser!',
    ],
  },
  {
    id: 'chilling',
    emoji: '😊',
    label: 'Tranquila',
    badgeColor: 'bg-[#c8e6ff]/50 text-[#006590] border-[#88ceff]',
    quotes: [
      '“Paz mental alcanzada... hasta que te acuerdes del entregable de las 11:59 PM JAJAJA. Disfruta mientras dure.”',
      '“Qué linda vibra. Que nada ni nadie (ni cálculo) te quite la paz hoy.”',
      '“Modo zen activado. Las tareas se hacen con calma y sin dramas.”',
    ],
    facts: [
      'Dato curioso: Las vacas tienen mejores amigas y se estresan si las separan. Tú y tu cama son básicamente almas gemelas hoy.',
      'Fun fact: Las nutrias marinas duermen tomadas de la mano para que la corriente no las separe. Así deberías agarrar tus apuntes.',
    ],
  },
  {
    id: 'tired',
    emoji: '🥱',
    label: 'Con sueño',
    badgeColor: 'bg-[#ffdcbf]/60 text-[#8c5000] border-[#ffb872]',
    quotes: [
      '“Científicos afirman que parpadear más de 4 segundos a esta hora se considera una siesta de alto riesgo JAJAJA.”',
      '“El café no te da energía, solo le pide prestada energía al futuro con 40% de interés bancario.”',
      '“Un cafecito, dos respiraciones profundas y salimos de esta como campeonas.”',
    ],
    facts: [
      'Fun fact: Los koalas duermen 22 horas al día y nadie los juzga por no entregar la guía de matemáticas.',
      'Dato real: Si te duermes con los ojos abiertos en clase, hay un 12% de probabilidad de que el profesor crea que estás meditando.',
    ],
  },
  {
    id: 'stressed',
    emoji: '🤯',
    label: 'Estresada',
    badgeColor: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/40',
    quotes: [
      '“Respira hondo... Llorar solo quema 1.3 calorías por minuto, mejor hagamos una tarea de la lista y avanzamos JAJAJA.”',
      '“Si Newton inventó el cálculo en plena peste bubónica, nosotras al menos podemos sobrevivir a este capítulo.”',
      '“Divide el monstruo en pedacitos pequeños. Nadie se come una pizza de un solo bocado.”',
    ],
    facts: [
      'Dato curioso: Si la Tierra gira a 1,600 km/h, técnicamente estás haciendo un montón de cosas a la vez sin levantarte del escritorio.',
      'Fun fact: El chocolate estimula la liberación de endorfinas. Ve por un pedacito, es una prescripción médica no oficial.',
    ],
  },
  {
    id: 'melting',
    emoji: '🫠',
    label: 'Sobreviviendo',
    badgeColor: 'bg-[#efeded] text-[#3f4a36] border-[#becbb1]',
    quotes: [
      '“Sobrevivir el semestre ya es un deporte olímpico universitario. Medalla de oro asegurada para ti hoy 🥇.”',
      '“Aquí no nos rendimos, solo nos quejamos un poquito y seguimos adelante.”',
      '“Mientras haya internet, café y ganas de no reprobar, el show continúa.”',
    ],
    facts: [
      'Fun fact: Los pulpos tienen 3 corazones y ninguno de ellos se preocupa por tareas atrasadas. Sé más pulpo.',
      'Dato real: Los perezosos pueden tardar hasta un mes en digerir una sola hoja. Tu ritmo hoy está totalmente dentro de los estándares naturales.',
    ],
  },
  {
    id: 'hungry',
    emoji: '🍕',
    label: 'Con hambre',
    badgeColor: 'bg-[#ffdcbf] text-[#6a3b00] border-[#ff9c27]',
    quotes: [
      '“El 90% de tus crisis existenciales se solucionan con un snack y 15 minutos de silencio. Ve a comer algo.”',
      '“Estudiar con el estómago vacío es delito federal contra tu propia felicidad JAJA.”',
      '“El cerebro consume el 20% de tus calorías. Tu apetito está científicamente justificado.”',
    ],
    facts: [
      'Fun fact: Los astronautas no pueden comer pan con migajas en el espacio porque flotan... tú al menos puedes comerte un panito dulce sin gravedad cero.',
      'Dato curioso: La pizza fue considerada vegetal en las escuelas de EE.UU. por la salsa de tomate. Tu nutrición es arte abstracto.',
    ],
  },
];

export const MoodTrackerScreen: React.FC<MoodTrackerScreenProps> = ({
  moodHistory,
  onAddMood,
  onResetWeek,
}) => {
  const [selectedMoodId, setSelectedMoodId] = useState<MoodType>('super');
  const currentMoodObj = MOOD_OPTIONS.find((m) => m.id === selectedMoodId) || MOOD_OPTIONS[0];

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Reflection questions notes with localStorage persistence
  const [reflectionText, setReflectionText] = useState('');
  const [reflections, setReflections] = useState<string[]>(() => {
    const saved = localStorage.getItem('naoo_reflections');
    return saved
      ? JSON.parse(saved)
      : [
          'Hoy logré enfocarme en los ejercicios de cálculo y me sentí satisfecha con el avance.',
        ];
  });

  const currentWeekKey = getISOWeekKey(new Date());

  // Filter mood entries to ONLY include records from the current week
  // Automatically resets when a new week begins!
  const thisWeekHistory = moodHistory.filter((entry) => {
    if (entry.weekKey) {
      return entry.weekKey === currentWeekKey;
    }
    // Fallback: check timestamp from ID if available
    const ts = parseInt(entry.id.replace('mood-', ''), 10);
    if (!isNaN(ts)) {
      return getISOWeekKey(new Date(ts)) === currentWeekKey;
    }
    return true;
  });

  const handleSelectMood = (moodId: MoodType) => {
    sounds.playPop();
    setSelectedMoodId(moodId);
    setQuoteIndex(0);
    setFactIndex(0);
    setSavedSuccess(false);
  };

  const handleShuffleQuote = () => {
    sounds.playPop();
    setQuoteIndex((prev) => (prev + 1) % currentMoodObj.quotes.length);
    setFactIndex((prev) => (prev + 1) % currentMoodObj.facts.length);
  };

  const handleLogCurrentMood = () => {
    sounds.playCheer();
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#1cb0f6', '#58cc02', '#ff9c27'],
      });
    } catch {
      // ignore
    }

    const now = new Date();
    const newEntry: MoodEntry = {
      id: `mood-${now.getTime()}`,
      mood: currentMoodObj.id,
      emoji: currentMoodObj.emoji,
      label: currentMoodObj.label,
      quote: currentMoodObj.quotes[quoteIndex],
      funFact: currentMoodObj.facts[factIndex],
      weekKey: currentWeekKey,
      isoDate: now.toISOString(),
      timestamp: now.toLocaleTimeString('es-GT', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };

    onAddMood(newEntry);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;
    sounds.playPop();
    const nextReflections = [reflectionText.trim(), ...reflections];
    setReflections(nextReflections);
    localStorage.setItem('naoo_reflections', JSON.stringify(nextReflections));
    setReflectionText('');
  };

  const handleDeleteReflection = (indexToDelete: number) => {
    sounds.playPop();
    const nextReflections = reflections.filter((_, idx) => idx !== indexToDelete);
    setReflections(nextReflections);
    localStorage.setItem('naoo_reflections', JSON.stringify(nextReflections));
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 max-w-4xl mx-auto">
      {/* CARD UNIFICADA: "¿Cómo te sientes hoy?" + Caritas + Botón "Registrar Estado" debajo */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#006590]">
            CHECK RÁPIDO
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b1c1c]">
            ¿Cómo te sientes hoy?
          </h2>
        </div>

        {/* 6 Caritas with clean single labels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOOD_OPTIONS.map((opt) => {
            const isSelected = opt.id === selectedMoodId;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectMood(opt.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1cb0f6]/10 border-[#1cb0f6] shadow-[0_4px_0_0_#006590] scale-105'
                    : 'bg-[#f5f3f3] border-transparent hover:bg-[#eae8e7] shadow-[0_2px_0_0_#e4e2e2] active:translate-y-1'
                }`}
              >
                <span className="text-4xl mb-2 select-none transform hover:scale-110 transition-transform">
                  {opt.emoji}
                </span>
                <span className="text-xs font-black text-[#1b1c1c] text-center leading-tight">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Botón de Registrar Estado DEBAJO de las caritas */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleLogCurrentMood}
            className="btn-tactile-blue px-8 py-3 rounded-xl font-extrabold text-xs uppercase cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{savedSuccess ? '¡Estado Registrado!' : 'Registrar Estado de Hoy'}</span>
          </button>
        </div>
      </section>

      {/* Naoo Witty Reaction Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col sm:flex-row items-center gap-6">
        {/* Naoo without any drop shadow */}
        <div className="w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <img
            src="/maya.png"
            alt="Naoo reacción"
            className="w-full h-full object-contain pixelated"
          />
        </div>

        {/* Speech and Fun Fact content */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentMoodObj.emoji}</span>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${currentMoodObj.badgeColor}`}>
                {currentMoodObj.label}
              </span>
            </div>

            <button
              type="button"
              onClick={handleShuffleQuote}
              className="text-xs font-black text-[#006590] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">autorenew</span>
              <span>Otro mensaje / chiste</span>
            </button>
          </div>

          {/* Funny Motivational Quote */}
          <div className="bg-[#f5f3f3] p-4 rounded-2xl border border-[#efeded]">
            <span className="text-[10px] font-black uppercase text-[#6f7b64] block mb-1 tracking-wider">
              Mensaje de Naoo:
            </span>
            <p className="text-sm sm:text-base font-bold text-[#1b1c1c] italic">
              {currentMoodObj.quotes[quoteIndex]}
            </p>
          </div>

          {/* Fun fact */}
          <div className="bg-[#c8e6ff]/30 p-3.5 rounded-2xl border border-[#c8e6ff]">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#004c6e] mb-0.5">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              <span>Dato Curioso:</span>
            </div>
            <p className="text-xs font-semibold text-[#004c6e]">
              {currentMoodObj.facts[factIndex]}
            </p>
          </div>
        </div>
      </section>

      {/* REGISTRO SEMANAL & PREGUNTAS DE REFLEXIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Historial Semanal (5 cols) */}
        <section className="md:col-span-5 bg-white rounded-2xl p-6 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006590] text-[20px]">calendar_month</span>
              <h3 className="text-base font-black text-[#1b1c1c]">Resumen Semanal</h3>
            </div>
            {onResetWeek && thisWeekHistory.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onResetWeek();
                }}
                className="text-[11px] font-bold text-[#6f7b64] hover:text-[#ba1a1a] flex items-center gap-1 cursor-pointer transition-colors"
                title="Reiniciar historial de la semana actual"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                <span>Reiniciar</span>
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-[#3f4a36]">
            <span>Se reinicia automáticamente cada semana:</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#c8e6ff]/50 text-[#006590]">
              Semana actual
            </span>
          </div>

          {thisWeekHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#6f7b64] bg-[#f5f3f3] rounded-xl border border-[#efeded]">
              No hay estados registrados esta semana. ¡Elige una expresión arriba para comenzar tu semana!
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              {thisWeekHistory.slice(0, 8).map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between bg-[#f5f3f3] px-3.5 py-2 rounded-xl border border-[#efeded]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{h.emoji}</span>
                    <span className="text-xs font-bold text-[#1b1c1c]">{h.label}</span>
                  </div>
                  <span className="text-[11px] text-[#6f7b64] font-semibold">{h.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Preguntas de Reflexión (7 cols) */}
        <section className="md:col-span-7 bg-white rounded-2xl p-6 shadow-[0_4px_0_0_#e4e2e2] border border-[#efeded] flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006590] text-[20px]">psychology_alt</span>
            <h3 className="text-base font-black text-[#1b1c1c]">Preguntas de Reflexión</h3>
          </div>

          {/* Quick reflection prompts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-[#f5f3f3] p-2.5 rounded-xl border border-[#efeded] text-left">
              <span className="text-[10px] font-black text-[#006590] block uppercase">1. Enfoque</span>
              <span className="text-xs font-semibold text-[#1b1c1c]">¿Qué te dio mayor satisfacción hoy?</span>
            </div>
            <div className="bg-[#f5f3f3] p-2.5 rounded-xl border border-[#efeded] text-left">
              <span className="text-[10px] font-black text-[#006590] block uppercase">2. Bienestar</span>
              <span className="text-xs font-semibold text-[#1b1c1c]">¿Qué momento te hizo sonreír?</span>
            </div>
            <div className="bg-[#f5f3f3] p-2.5 rounded-xl border border-[#efeded] text-left">
              <span className="text-[10px] font-black text-[#006590] block uppercase">3. Soltar</span>
              <span className="text-xs font-semibold text-[#1b1c1c]">¿Qué puedes dejar ir para descansar?</span>
            </div>
          </div>

          {/* Note Input */}
          <form onSubmit={handleAddReflection} className="flex flex-col gap-2 pt-1">
            <textarea
              rows={2}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Escribe una pequeña reflexión sobre cómo te fue hoy..."
              className="w-full bg-[#f5f3f3] text-xs font-semibold p-3 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1cb0f6] border border-[#efeded] resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-tactile-blue px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                + Guardar Reflexión
              </button>
            </div>
          </form>

          {/* Recent reflections with DELETE button */}
          {reflections.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 border-t border-[#efeded]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#6f7b64]">
                <span>Tus reflexiones guardadas ({reflections.length}):</span>
              </div>
              {reflections.map((r, i) => (
                <div
                  key={i}
                  className="group flex items-start justify-between gap-3 text-xs text-[#3f4a36] bg-[#fbf9f8] p-3 rounded-xl border border-[#efeded]"
                >
                  <p className="italic leading-relaxed flex-1">“{r}”</p>
                  <button
                    type="button"
                    onClick={() => handleDeleteReflection(i)}
                    title="Borrar reflexión"
                    className="text-[#8c9b84] hover:text-[#ba1a1a] p-1 rounded-lg hover:bg-[#ffdad6]/40 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
