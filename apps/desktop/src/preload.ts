// Preload runs in the renderer with Node access before web content loads.
// Expose only what the renderer explicitly needs — never expose full Node APIs.
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("nexusDesktop", {
  platform: process.platform,
  onDeepLink: (cb: (url: string) => void) => {
    ipcRenderer.on("deep-link", (_event, url: string) => cb(url));
  },
});
