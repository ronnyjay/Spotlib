const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("confirmation", {
  confirm: () => ipcRenderer.invoke("user-confirmed"),
  close: () => ipcRenderer.invoke("close-confirmation"),
  minimize: () => ipcRenderer.invoke("minimize-confirmation"),
  maximize: () => ipcRenderer.invoke("maximize-confirmation"),
});

contextBridge.exposeInMainWorld("pages", {
  setTheme: (val) => ipcRenderer.invoke("set-theme", val),
  getTheme: () => ipcRenderer.invoke("get-theme")
})
