import React, { useEffect, useRef, useState } from "react";
import { sounds } from "../utils/sound";

export type FidgetIntensity = "suave" | "normal" | "activa";

export interface FidgetPreferences {
  intensity: FidgetIntensity;
  soundsEnabled: boolean;
  contextualAnimations: boolean;
}

export const DEFAULT_FIDGET_PREFERENCES: FidgetPreferences = {
  intensity: "normal",
  soundsEnabled: false,
  contextualAnimations: true,
};

interface FidgetCenterProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: FidgetPreferences;
  onChangePreferences: (next: Partial<FidgetPreferences>) => void;
  onOpen: () => void;
}

const BUBBLE_COUNT = 25;

export const FidgetCenter: React.FC<FidgetCenterProps> = ({
  isOpen,
  onClose,
  preferences,
  onChangePreferences,
  onOpen,
}) => {
  const [poppedBubbles, setPoppedBubbles] = useState<boolean[]>(() =>
    Array(BUBBLE_COUNT).fill(false),
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
          ),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (!isOpen) previouslyFocused?.focus();
    };
  }, [isOpen]);

  const playFidgetSound = (kind: "click" | "soft" | "double" | "pop") => {
    if (!preferences.soundsEnabled || !sounds.enabled) return;

    try {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextConstructor) return;
      const context = audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = context;
      if (context.state === "suspended") void context.resume();

      const playNoise = (
        start: number,
        duration: number,
        frequency: number,
        volume: number,
      ) => {
        const buffer = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * duration),
          context.sampleRate,
        );
        const data = buffer.getChannelData(0);
        for (let index = 0; index < data.length; index += 1) {
          data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
        }
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        source.buffer = buffer;
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(frequency, start);
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(100, frequency * 0.35),
          start + duration,
        );
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        source.connect(filter).connect(gain).connect(context.destination);
        source.start(start);
        source.stop(start + duration);
      };

      const playTone = (
        start: number,
        from: number,
        to: number,
        duration: number,
        volume: number,
        type: OscillatorType = "sine",
      ) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(from, start);
        oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration);
      };

      const now = context.currentTime + 0.005;
      if (kind === "click") {
        playNoise(now, 0.018, 5200, 0.22);
        playTone(now, 1550, 720, 0.025, 0.12, "triangle");
      } else if (kind === "soft") {
        playTone(now, 620, 260, 0.065, 0.14, "sine");
        playNoise(now, 0.035, 1200, 0.08);
      } else if (kind === "double") {
        playNoise(now, 0.014, 4200, 0.18);
        playTone(now, 1250, 700, 0.02, 0.1, "square");
        playNoise(now + 0.085, 0.014, 4200, 0.18);
        playTone(now + 0.085, 1250, 700, 0.02, 0.1, "square");
      } else {
        // Bubble pop: a short rounded pressure release plus a low, falling plop.
        playNoise(now, 0.075, 1150, 0.2);
        playTone(now, 430, 105, 0.095, 0.2, "sine");
      }
    } catch {
      // Audio is optional; visual interaction still works if the browser blocks it.
    }
  };

  useEffect(
    () => () => {
      void audioContextRef.current?.close();
      audioContextRef.current = null;
    },
    [],
  );

  return (
    <>
      <button
          type="button"
          onClick={onOpen}
          aria-label="Abrir actividades fidget"
          title="Abrir actividades fidget"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="fixed right-4 bottom-20 lg:bottom-6 z-[55] bg-[#006590] text-white rounded-full shadow-[0_4px_0_0_#003b55] px-4 py-3 font-extrabold text-sm inline-flex items-center gap-2 hover:bg-[#005579] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#87fe45]"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            toys
          </span>
      </button>

      <div className="fidget-overlay fixed inset-0 z-[80]" hidden={!isOpen}>
        <button
          type="button"
          aria-label="Cerrar actividades fidget"
          onClick={onClose}
          className="absolute inset-0 bg-[#10202a]/35 cursor-default"
        />
        <section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fidget-title"
          data-intensity={preferences.intensity}
          className="fidget-dialog absolute inset-x-3 top-3 bottom-20 sm:inset-y-6 sm:left-auto sm:right-6 sm:w-[min(620px,calc(100vw-3rem))] bg-[#fbf9f8] border border-[#d8e3e9] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <header className="flex items-start justify-between gap-4 px-5 py-4 sm:px-7 border-b border-[#e4e2e2] bg-white">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#006590]">
                ESTIMULACIÓN OPCIONAL
              </span>
              <h2
                id="fidget-title"
                className="text-2xl font-black text-[#1b1c1c]"
              >
                Fidget
              </h2>
              <p className="text-xs text-[#6f7b64] mt-1">
                Sin metas ni puntuaciones; usalo a tu manera.
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Cerrar actividades fidget"
              className="w-10 h-10 rounded-xl bg-[#f5f3f3] hover:bg-[#eae8e7] text-[#3f4a36] inline-grid place-items-center shrink-0 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#1cb0f6]"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </header>

          <div className="fidget-content overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
            <section className="fidget-activity rounded-2xl border border-[#e4e2e2] bg-white p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="font-extrabold text-lg">Botones de clic</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
                {(
                  [
                    ["click", "Click", "mouse"],
                    ["soft", "Click suave", "touch_app"],
                    ["double", "Doble click", "ads_click"],
                  ] as const
                ).map(([kind, label, icon]) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => playFidgetSound(kind)}
                    className="fidget-press-button min-h-16 rounded-2xl bg-[#8ed9fa] border border-[#65c8f5] text-[#004563] font-black shadow-[0_5px_0_0_#3a9cca] active:translate-y-1 active:shadow-[0_1px_0_0_#3a9cca] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#87fe45] inline-flex items-center justify-center gap-2"
                    aria-label={`${label}; reproducir sonido de clic`}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <section className="fidget-activity rounded-2xl border border-[#e4e2e2] bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-lg">Pop-it</h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPoppedBubbles(Array(BUBBLE_COUNT).fill(false))
                  }
                  className="text-xs font-extrabold text-[#006590] underline underline-offset-2 rounded-lg px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1cb0f6]"
                >
                  Restablecer
                </button>
              </div>
              <div
                className="grid grid-cols-5 gap-2.5 max-w-sm mx-auto"
                role="group"
                aria-label="Cuadrícula de burbujas Pop-it"
              >
                {poppedBubbles.map((popped, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Burbuja ${index + 1}, ${popped ? "hundida" : "sin hundir"}`}
                    aria-pressed={popped}
                    onClick={() => {
                      setPoppedBubbles((previous) =>
                        previous.map((value, bubbleIndex) =>
                          bubbleIndex === index ? !value : value,
                        ),
                      );
                      playFidgetSound("pop");
                    }}
                    className={`fidget-bubble aspect-square rounded-full border-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#006590] ${popped ? "is-popped bg-[#dfeef5] border-[#b6cfdd] shadow-inner" : "bg-[#a7e2fa] border-[#5abde8] shadow-[0_4px_0_0_#48a8d1] active:translate-y-1 active:shadow-inner"}`}
                  />
                ))}
              </div>
            </section>

            <section className="fidget-activity rounded-2xl border border-[#e4e2e2] bg-white p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="font-extrabold text-lg">Preferencias</h3>
                <p className="text-sm text-[#6f7b64]">
                  Se guardan en tu espacio sincronizado.
                </p>
              </div>

              <fieldset>
                <legend className="text-sm font-bold text-[#3f4a36] mb-2">
                  Intensidad visual
                </legend>
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Intensidad visual"
                >
                  {(
                    [
                      ["suave", "Suave"],
                      ["normal", "Normal"],
                      ["activa", "Activa"],
                    ] as [FidgetIntensity, string][]
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={preferences.intensity === value}
                      onClick={() => onChangePreferences({ intensity: value })}
                      className={`rounded-xl border-2 py-2.5 text-sm font-extrabold focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#1cb0f6] ${preferences.intensity === value ? "border-[#006590] bg-[#e8f5fc] text-[#004563]" : "border-[#e4e2e2] bg-white text-[#3f4a36]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-4 grid gap-3">
                <label className="flex items-center justify-between gap-4 rounded-xl bg-[#f5f3f3] px-3 py-3 text-sm font-bold text-[#3f4a36]">
                  <span>Sonidos</span>
                  <input
                    type="checkbox"
                    checked={preferences.soundsEnabled}
                    onChange={(event) =>
                      onChangePreferences({
                        soundsEnabled: event.target.checked,
                      })
                    }
                    className="h-5 w-5 accent-[#006590]"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-xl bg-[#f5f3f3] px-3 py-3 text-sm font-bold text-[#3f4a36]">
                  <span>Animaciones contextuales</span>
                  <input
                    type="checkbox"
                    checked={preferences.contextualAnimations}
                    onChange={(event) =>
                      onChangePreferences({
                        contextualAnimations: event.target.checked,
                      })
                    }
                    className="h-5 w-5 accent-[#006590]"
                  />
                </label>
              </div>
              <p className="text-xs text-[#6f7b64] mt-3">
                También se respeta la preferencia de movimiento reducido de tu
                dispositivo.
              </p>
            </section>
          </div>
        </section>
      </div>
    </>
  );
};
