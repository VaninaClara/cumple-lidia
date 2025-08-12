import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";

// === Utils ===
function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const total = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { total, days, hours, minutes, seconds };
}

const useLocal = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      
      console.warn("localStorage write failed", err);
    }
  }, [key, value]);
  return [value, setValue] as const;
};

// === imágenes en /public/fondos ===
const PRESETS = [
{ name: "Lidia 1", url: "/assets/fondos/lidia1.jpg" },
{ name: "Lidia 2", url: "/assets/fondos/lidia5.jpg" },
{ name: "Lidia 3", url: "/assets/fondos/lidia7.jpg" },
{ name: "Lidia 4", url: "/assets/fondos/lidia4.jpg"},
];

export default function App() {
  
  const targetDate = useMemo(() => {
    const now = new Date();
    const month = 7; 
    const day = 25;
    const year =
      now.getMonth() > month || (now.getMonth() === month && now.getDate() > day)
        ? now.getFullYear() + 1
        : now.getFullYear();
    return new Date(year, month, day, 0, 0, 0);
  }, []);

  const prettyDayMonth = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(
        targetDate
      ),
    [targetDate]
  );

  const [title, setTitle] = useLocal<string>("cb:title", "Cumple de Lidia 🎂");
  const [bgUrl, setBgUrl] = useLocal<string>("cb:bg", PRESETS[0].url);
  const [selectedName, setSelectedName] = useState<string>(() => {
    const found = PRESETS.find((p) => p.url === bgUrl)?.name ?? PRESETS[0].name;
    return found;
  });

  
  useEffect(() => {
    const url = new URL(window.location.href);
    const qTitle = url.searchParams.get("t");
    const qBg = url.searchParams.get("bg");
    if (qTitle) setTitle(qTitle);
    if (qBg) {
      setBgUrl(qBg);
      const preset = PRESETS.find((p) => p.url === qBg);
      if (preset) setSelectedName(preset.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [time, setTime] = useState(() => getTimeLeft(targetDate));
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setTime(getTimeLeft(targetDate)), 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  useEffect(() => {
    if (time.total === 0 && !confettiFired) {
      launchConfetti();
      setConfettiFired(true);
    }
  }, [time.total, confettiFired]);

  const isOver = time.total === 0;

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("t", title);
    url.searchParams.set("bg", bgUrl);
    const shareUrl = url.toString();
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("¡Enlace copiado!");
    } catch {
      prompt("Copia el enlace:", shareUrl);
    }
  };

  const onSelectPreset = (name: string) => {
    setSelectedName(name);
    const preset = PRESETS.find((p) => p.name === name);
    if (preset) setBgUrl(preset.url);
  };

  return (
    <div className="relative min-h-screen text-slate-900">
      {/* Fondo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/30 to-white/70" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header superior */}
        <header className="flex items-center justify-between gap-4 text-white drop-shadow">
          <h1 className="text-lg sm:text-xl font-semibold">
            🎉 Cuenta regresiva de cumpleaños para Lidia 🎉
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-white/90 text-sm">
            ⏱️ Actualiza cada segundo
          </div>
        </header>

        {/* Panel de configuración */}
<section className="mt-6 rounded-2xl bg-white/75 backdrop-blur-md shadow-xl p-4 sm:p-6">

  {/* fila responsive: input a la izquierda, botón a la derecha */}
  <div className="flex flex-col gap-2">
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-slate-800">
          Dedicatoria
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:ring-2 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Cumple de…"
        />
      </div>

      <button
        onClick={share}
        className="h-11 w-full sm:w-auto px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white font-medium shadow hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-nowrap shrink-0 sm:mt-[26px]"
        aria-label="Compartir enlace"
        title="Compartir enlace"
      >
        Compartir enlace ♥
      </button>
    </div>

    <p className="text-xs text-slate-500">
      La fecha está fijada al <strong>25 de agosto</strong> ({targetDate.getFullYear()}).
    </p>
  </div>

  {/* Presets con miniaturas */}
  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
    {PRESETS.map((p) => (
      <button
        key={p.url}
        onClick={() => {
          setBgUrl(p.url);
          setSelectedName(p.name);
        }}
        className="group relative overflow-hidden rounded-2xl ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label={`Usar fondo: ${p.name}`}
      >
        <img src={p.url} alt={p.name} className="h-28 w-full object-cover" />
        <span className="absolute bottom-0 left-0 right-0 bg-black/45 text-white text-xs p-1.5">
          {p.name}
        </span>
      </button>
    ))}
  </div>

  {/* Barra USAR */}
  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
    <select
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
      value={selectedName}
      onChange={(e) => onSelectPreset(e.target.value)}
    >
      {PRESETS.map((p) => (
        <option key={p.url} value={p.name}>
          {p.name}
        </option>
      ))}
    </select>
    <button
      onClick={() => onSelectPreset(selectedName)}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 font-medium shadow hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Usar
    </button>
  </div>

</section>

        {/* Contador */}
        <section className="mt-8 text-center text-white drop-shadow">
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            {isOver ? "¡Feliz cumpleaños!" : title}
          </h2>
          <p className="mt-1 text-sm sm:text-base opacity-90 shine-text">
            {prettyDayMonth} de {targetDate.getFullYear()}
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <TimeTile label="DÍAS" value={time.days} />
            <TimeTile label="HORAS" value={time.hours} />
            <TimeTile label="MINUTOS" value={time.minutes} />
            <TimeTile label="SEGUNDOS" value={time.seconds} />
          </div>

          {isOver && (
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow mt-6 text-slate-900">
              <span>🎉</span>
              <span className="font-medium">¡Es hoy! Celebremos</span>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-white/80 drop-shadow">
          Hecho con ♥ por{" "}
          <a
            className="underline decoration-white/40 hover:decoration-white"
            href="https://github.com/VaninaClara"
            target="_blank"
            rel="noreferrer"
          >
            Vanina
          </a>{" "}
          — editable, accesible y responsive.
        </footer>
      </div>

      {/* Animaciones */}
      <style>{`
        @keyframes pop { 0% { transform: scale(.9); opacity: .2 } 100% { transform: scale(1); opacity: 1 } }
        @keyframes shine { 0% { background-position: -200px; } 100% { background-position: 200px; } }
        .shine-text {
          display:inline-block;
          background: linear-gradient(90deg, rgba(255,255,255,.15) 0%, #fff 50%, rgba(255,255,255,.15) 100%);
          background-size: 200px;
          -webkit-background-clip:text;
          -webkit-text-fill-color: transparent;
          animation: shine 2.5s infinite linear;
        }
      `}</style>
    </div>
  );
}

function TimeTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-6 text-center border border-white/60">
      <div
        key={value}
        className="font-extrabold text-4xl sm:text-5xl tabular-nums animate-[pop_.35s_cubic-bezier(.2,.9,.3,1.4)]"
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs sm:text-sm text-slate-600 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

// Confeti con paleta alegre
function launchConfetti() {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 35,
    spread: 360,
    ticks: 60,
    zIndex: 1000,
    colors: ["#FF0A54", "#FF477E", "#FF85A1", "#FFB3C1", "#FFD6E0", "#FEE440", "#8AC926", "#1982C4", "#6A4C93"],
  };

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      window.clearInterval(interval);
      return;
    }
    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
    });
  }, 250);
}

