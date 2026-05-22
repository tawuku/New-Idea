import { execFile, type ChildProcess } from "node:child_process";
import { join } from "node:path";
import { app, BrowserWindow, shell, Menu, Tray, nativeImage } from "electron";

const isDev = !app.isPackaged;

const API_PORT = 3001;
const WEB_PORT = 3000;
const API_URL = `http://localhost:${API_PORT}`;
const WEB_URL = `http://localhost:${WEB_PORT}`;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let apiProcess: ChildProcess | null = null;
let webProcess: ChildProcess | null = null;

// ── Server management ──────────────────────────────────────────────────────

function resourcePath(...parts: string[]): string {
  if (isDev) {
    return join(__dirname, "..", "..", "..", ...parts);
  }
  return join(process.resourcesPath, ...parts);
}

function spawnApi(): void {
  const apiScript = isDev
    ? resourcePath("apps", "api", "dist", "index.js")
    : resourcePath("api", "index.js");

  apiProcess = execFile(process.execPath, [apiScript], {
    env: {
      ...process.env,
      NODE_ENV: isDev ? "development" : "production",
      PORT: String(API_PORT),
    },
  });

  apiProcess.stdout?.on("data", (d: Buffer) => console.log("[api]", d.toString().trim()));
  apiProcess.stderr?.on("data", (d: Buffer) => console.error("[api]", d.toString().trim()));
  apiProcess.on("exit", (code) => console.log(`[api] exited with code ${code}`));
}

function spawnWeb(): void {
  const webScript = isDev
    ? resourcePath("apps", "web", ".next", "standalone", "server.js")
    : resourcePath("web", "server.js");

  webProcess = execFile(process.execPath, [webScript], {
    env: {
      ...process.env,
      NODE_ENV: isDev ? "development" : "production",
      PORT: String(WEB_PORT),
      HOSTNAME: "127.0.0.1",
    },
  });

  webProcess.stdout?.on("data", (d: Buffer) => console.log("[web]", d.toString().trim()));
  webProcess.stderr?.on("data", (d: Buffer) => console.error("[web]", d.toString().trim()));
  webProcess.on("exit", (code) => console.log(`[web] exited with code ${code}`));
}

async function waitForServer(url: string, attempts = 30): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (res.ok || res.status < 500) return;
    } catch {
      // still starting
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not become ready`);
}

// ── Window ─────────────────────────────────────────────────────────────────

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    icon: join(__dirname, "..", "assets", "icon.png"),
  });

  mainWindow.loadURL(WEB_URL);

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (isDev) mainWindow?.webContents.openDevTools({ mode: "detach" });
  });

  // Open external links in the default browser, not in the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(WEB_URL)) {
      void shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray(): void {
  const icon = nativeImage.createFromPath(join(__dirname, "..", "assets", "tray-icon.png"));
  tray = new Tray(icon);
  tray.setToolTip("Nexus Workspace");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Open Nexus",
        click: () => {
          if (!mainWindow) createWindow();
          else mainWindow.show();
        },
      },
      { type: "separator" },
      { label: "Quit", role: "quit" },
    ]),
  );
  tray.on("double-click", () => {
    if (!mainWindow) createWindow();
    else mainWindow.show();
  });
}

function buildMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "Nexus",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        ...(isDev ? [{ role: "toggleDevTools" as const }] : []),
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── App lifecycle ──────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  buildMenu();
  createTray();

  // In dev, Next.js is already running via `pnpm dev` — don't spawn
  if (!isDev) {
    spawnApi();
    spawnWeb();
    try {
      await Promise.all([
        waitForServer(`${API_URL}/healthz`),
        waitForServer(WEB_URL),
      ]);
    } catch (err) {
      console.error("Failed to start servers:", err);
    }
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  // On macOS keep the process alive (in tray) when all windows are closed
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  apiProcess?.kill();
  webProcess?.kill();
  tray?.destroy();
});
