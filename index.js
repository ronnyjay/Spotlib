const { app, BrowserWindow, screen, ipcMain } = require("electron");
const Window = require("./renderer/components/window/Window");
const fs = require("fs");

app.whenReady().then(() => {
  let window = new Window(screen.getPrimaryDisplay().bounds);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows.length === 0) {
      window = new Window(screen.getPrimaryDisplay().bounds);
    }
  });

  ipcMain.handle("get-theme", () => {
    let data;

    try {
      data = fs.readFileSync("./renderer/components/localstorage/storage.json");
    } catch (error) {
      console.error(error);
    }

    const theme = JSON.parse(data);
    return theme.value;
  });

  ipcMain.handle("set-theme", async (event, value) => {
    const data = JSON.stringify({
      value: value,
    });

    fs.writeFile(
      "./renderer/components/localstorage/storage.json",
      data,
      (error) => {
        if (error) console.error(error);
      }
    );
  });

  ipcMain.handle("authorize", () => {
    window.auhorize();
  });

  ipcMain.handle("close", async () => {
    window.close();
  });

  ipcMain.handle("close-confirmation", () => {
    window.getConfirmationWindow().close();
  });

  ipcMain.handle("minimize", () => {
    window.minimize();
  });

  ipcMain.handle("minimize-confirmation", () => {
    window.getConfirmationWindow().minimize();
  });

  // Both maximize handlers currently for show
  ipcMain.handle("maximize", () => {
    return;
  });

  ipcMain.handle("maximize-confirmation", () => {
    return;
  });

  ipcMain.handle("load-tracks", async (event, playlist) => {
    await window.setCurrentPlaylist(playlist);
    window.loadFile("./renderer/html/tracks.html");
  });

  ipcMain.handle("preview", (event, sortType, sortOrder) => {
    window.previewCurrentPlaylist(sortType, sortOrder);
  });

  ipcMain.handle("sort-playlist", async (event, params) => {
    window.on("did-finish-sorting", async () => {
      window.loadFile("./renderer/html/playlists.html");
      window.removeEventListeners();
    });

    const playlist = await window.sortCurrentPlaylist(params);

    if (playlist) {
      window.setCurrentPlaylist(playlist);
    }
  });

  ipcMain.handle("back-to-playlists", () => {
    window.loadFile("./renderer/html/playlists.html");
  });

  ipcMain.handle("user-confirmed", () => {
    window.setConfirmed();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
