const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("pages", {
  authorize: () => ipcRenderer.invoke("authorize"),
  close: () => ipcRenderer.invoke("close"),
  minimize: () => ipcRenderer.invoke("minimize"),
  maximize: () => ipcRenderer.invoke("maximize"),
  back: () => ipcRenderer.invoke("back-to-playlists"),
  sort: (data) => ipcRenderer.invoke("sort-playlist", data),
  preview: (sortType, sortOrder) =>
    ipcRenderer.invoke("preview", sortType, sortOrder),
  setTheme: (val) => ipcRenderer.invoke("set-theme", val),
  getTheme: () => ipcRenderer.invoke("get-theme"),
});

contextBridge.exposeInMainWorld("playlist", {
  sort: (data) => ipcRenderer.invoke("sort-playlist", data),
});

ipcRenderer.on("display-playlists", (_, playlists) => {
  const ul_list = document.getElementById("ul-list");
  for (let playlist of playlists) {
    const li = document.createElement("li");
    const div_img = document.createElement("div");
    const img = document.createElement("img");
    const div_data = document.createElement("div");
    const div_title = document.createElement("div");
    const div_total = document.createElement("div");

    div_title.className = "title";
    div_total.className = "total";
    div_title.textContent = playlist.name;
    div_total.textContent = "Tracks: " + playlist.total;
    img.src = playlist.image;

    div_img.appendChild(img);
    div_data.appendChild(div_title);
    div_data.appendChild(div_total);
    li.appendChild(div_img);
    li.appendChild(div_data);
    ul_list.appendChild(li);

    li.addEventListener("click", () => {
      ipcRenderer.invoke("load-tracks", playlist);
    });
  }
});

ipcRenderer.on("display-tracks", (_, tracks, currentPlaylist) => {
  const tracks_showcase = document.getElementById("tracks-showcase");

  if (tracks.length < 1) {
    const div_empty = document.createElement("div");
    const message = document.createElement("h3");

    div_empty.className = "empty-showcase";
    message.textContent = "It appears this playlist is empty";

    tracks_showcase.style.minHeight = `calc(100vh - 300px)`;

    div_empty.appendChild(message);
    tracks_showcase.appendChild(div_empty);

    return;
  }

  const ul_list = document.createElement("ul");
  for (let track of tracks) {
    const li = document.createElement("li");
    const div_img = document.createElement("div");
    const div_title = document.createElement("div");
    const div_artist = document.createElement("div");
    const span_title = document.createElement("span");
    const span_artist = document.createElement("span");
    const img = document.createElement("img");

    div_artist.className = "track-artist";

    span_title.textContent = track.track;
    span_artist.textContent = track.artist;
    img.src = track.image;

    div_img.appendChild(img);
    div_title.appendChild(span_title);
    div_title.appendChild(div_artist);
    div_artist.appendChild(span_artist);
    li.appendChild(div_img);
    li.appendChild(div_title);
    ul_list.appendChild(li);
    tracks_showcase.appendChild(ul_list);
  }
});
