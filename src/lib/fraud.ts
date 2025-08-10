// ==========================
// 🎯 FINGERPRINT DO DISPOSITIVO
// ==========================
export async function getFingerprint(): Promise<{
  id: string;
  os: string;
  browser: string;
  screen: string;
  timezone: string;
  language: string;
  userAgent: string;
  canvasHash: string;
}> {
  const os = detectOS();
  const browser = detectBrowser();
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const userAgent = navigator.userAgent;
  const canvasHash = await generateCanvasFingerprint();

  const raw = `${os}-${browser}-${screen}-${timezone}-${language}-${canvasHash}`;
  const id = hashString(raw);

  return {
    id,
    os,
    browser,
    screen,
    timezone,
    language,
    userAgent,
    canvasHash,
  };
}

// ======= 🔍 Detecta o sistema operacional =======
function detectOS(): string {
  const { userAgent, platform } = navigator;
  if (/Win/.test(platform)) return "Windows";
  if (/Mac/.test(platform)) return "MacOS";
  if (/Linux/.test(platform)) return "Linux";
  if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
  if (/Android/.test(userAgent)) return "Android";
  return "Unknown";
}

// ======= 🔍 Detecta o navegador com precisão =======
function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Chrome\/\d+/.test(ua) && !/Edge/.test(ua)) return "Chrome";
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Edg/.test(ua)) return "Edge";
  return "Unknown";
}

// ======= 🎨 Fingerprint por Canvas (anti-bot) =======
function generateCanvasFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return resolve("no-canvas");

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = "top";
    ctx.font = "16px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("INSANYCK_FINGERPRINT", 2, 15);

    const dataURL = canvas.toDataURL();
    resolve(hashString(dataURL));
  });
}

// ======= 🔐 Função de hash simples (base-36 com CRC simulada) =======
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // to 32bit int
  }
  return Math.abs(hash).toString(36);
}

// ==========================
// 🧠 ANÁLISE DE COMPORTAMENTO AVANÇADA
// ==========================

export async function analyzeBehavior(): Promise<{ risk: number; events: number }> {
  let moveCount = 0;
  let keyCount = 0;
  let pasteCount = 0;
  let scrollCount = 0;

  // Funções separadas para cada tipo de evento (tipagem correta!)
  function onMouseMove(_ev: MouseEvent) { moveCount++; }
  function onKeyDown(_ev: KeyboardEvent) { keyCount++; }
  function onPaste(_ev: ClipboardEvent) { pasteCount++; }
  function onScroll(_ev: Event) { scrollCount++; }

  // Adiciona listeners
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("paste", onPaste);
  window.addEventListener("scroll", onScroll);

  // Espera 4 segundos capturando os eventos do usuário
  await new Promise(resolve => setTimeout(resolve, 4000));

  // Remove listeners depois de medir
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("paste", onPaste);
  window.removeEventListener("scroll", onScroll);

  // Calcula um score de risco (exemplo simples, refine como quiser)
  // Comportamento "muito robótico" = pouco evento -> risco alto
  const total = moveCount + keyCount + pasteCount + scrollCount;
  let risk = 1;
  if (total < 2) risk = 8; // Praticamente não mexeu — suspeito
  else if (total < 5) risk = 5; // Interação mínima

  return { risk, events: total };
}
