import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";


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
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn("localStorage write failed", e); }
  }, [key, value]);
  return [value, setValue] as const;
};


const PRESETS = [
  { name: "❤️", url: "/assets/fondos/lidia1.jpg" },
  { name: "❤️", url: "/assets/fondos/lidia5.jpg" },
  { name: "❤️", url: "/assets/fondos/lidia7.jpg" },
  { name: "❤️", url: "/assets/fondos/lidia8.jpg" },
];

export default function App() {

  const targetDate = useMemo(() => {
    const now = new Date();
    const month = 7, day = 25;
    const year = (now.getMonth() > month || (now.getMonth() === month && now.getDate() > day))
      ? now.getFullYear() + 1 : now.getFullYear();
    return new Date(year, month, day, 0, 0, 0);
  }, []);
  const prettyDayMonth = useMemo(
    () => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(targetDate),
    [targetDate]
  );

  // Fondo elegido
  const [bgUrl, setBgUrl] = useLocal<string>("cb:bg", PRESETS[0].url);
  const [selectedName, setSelectedName] = useState<string>(() =>
    PRESETS.find(p => p.url === bgUrl)?.name ?? PRESETS[0].name
  );

  // Timer + confeti
  const [time, setTime] = useState(() => getTimeLeft(targetDate));
  const [confettiFired, setConfettiFired] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setTime(getTimeLeft(targetDate)), 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);
  useEffect(() => {
    if (time.total === 0 && !confettiFired) { launchConfetti(); setConfettiFired(true); }
  }, [time.total, confettiFired]);

  return (
    <div className="relative min-h-screen text-slate-900">
      {/* Fondo */}
      <div aria-hidden className="absolute inset-0 -z-10"
           style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/30 to-white/70" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Encabezado pequeño */}
        <header className="flex items-center justify-between gap-4 text-white drop-shadow">
          <h1 className="text-lg sm:text-xl font-semibold">🎉 Cuenta regresiva de cumpleaños 🎉</h1>
          <span className="hidden sm:inline text-white/90 text-sm">⏱️ Actualiza cada segundo</span>
        </header>

        {/* Panel: solo selector de fotos */}
        <section className="mt-6 rounded-2xl bg-white/75 backdrop-blur-md shadow-xl p-4 sm:p-6">
          <p className="text-base font-medium text-slate-800 mb-3">
             Elige una foto:
          </p>


          {/* Miniaturas (elige fondo) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRESETS.map(p => (
              <button
                key={p.url}
                onClick={() => { setBgUrl(p.url); setSelectedName(p.name); }}
                className="group relative overflow-hidden rounded-2xl ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Usar fondo: ${p.name}`}
              >
                <img src={p.url} alt={p.name} className="h-28 w-full object-cover" />
                <span className="absolute bottom-0 left-0 right-0 bg-black/45 text-white text-xs p-1.5">{p.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Título grande, fecha e imagen destacada */}
        <section className="mt-8 text-center text-white drop-shadow">
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">Cumpleaños de Lidia</h2>
          <p className="mt-1 text-sm sm:text-base opacity-90 shine-text">
            {prettyDayMonth} de {targetDate.getFullYear()}
          </p>

          {/* Imagen grande debajo del título */}
          <div className="mt-6 flex justify-center">
            <img src={bgUrl} alt={selectedName} className="rounded-2xl shadow-lg max-w-full sm:max-w-2xl object-cover" />
          </div>

          {/* Contador */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <TimeTile label="DÍAS" value={time.days} />
            <TimeTile label="HORAS" value={time.hours} />
            <TimeTile label="MINUTOS" value={time.minutes} />
            <TimeTile label="SEGUNDOS" value={time.seconds} />
          </div>

          {time.total === 0 && (
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow mt-6 text-slate-900">
              <span>🎉</span><span className="font-medium">¡Es hoy! Celebremos</span>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-white/80 drop-shadow">
          Hecho con ♥ por <a className="underline decoration-white/40 hover:decoration-white" href="https://github.com/VaninaClara" target="_blank" rel="noreferrer">Vanina</a> — editable, accesible y responsive.
        </footer>
      </div>

      {/* Animaciones */}
      <style>{`
        @keyframes pop { 0% { transform: scale(.9); opacity:.2 } 100% { transform: scale(1); opacity:1 } }
        @keyframes shine { 0% { background-position: -200px; } 100% { background-position: 200px; } }
        .shine-text{
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
      <div key={value} className="font-extrabold text-4xl sm:text-5xl tabular-nums animate-[pop_.35s_cubic-bezier(.2,.9,.3,1.4)]">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-xs sm:text-sm text-slate-600 uppercase tracking-wide">{label}</div>
    </div>
  );
}

// 🎊 Confeti alegre
function launchConfetti() {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 35, spread: 360, ticks: 60, zIndex: 1000,
    colors: ["#FF0A54","#FF477E","#FF85A1","#FFB3C1","#FFD6E0","#FEE440","#8AC926","#1982C4","#6A4C93"],
  };
  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) { window.clearInterval(interval); return; }
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
  }, 250);
}
