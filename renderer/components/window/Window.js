const ConfirmationWindow = require("./ConfirmationWindow");
const { BrowserWindow, webContents } = require("electron");
const { EventEmitter } = require("events");
const Spotify = require("../spotify/Spotify");
const path = require("path");
const { decode } = require("../../../util/decode");
const {
  sortByArtist,
  sortByTitle,
  sortByDanceability,
  sortByAlbum,
  sortByKey,
  sortByMode,
} = require("../../../util/sorting");
require('dotenv').config();

const spotify = new Spotify(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

module.exports = class Window {
  #bounds;
  #window;
  #confirmationWindow;
  #eventEmitter;

  #cache = {
    userPlaylists: undefined,
    currentPlaylist: undefined,
  };

  constructor(bounds) {
    this.#bounds = bounds;

    this.#window = new BrowserWindow({
      x: Math.floor(bounds.x + (bounds.width - 800) / 2),
      y: Math.floor(bounds.y + (bounds.height - 200) / 2),
      width: 800,
      height: 200,
      resizable: false,
      titleBarStyle: "hidden", // Change to "customButtonsOnHover" for macOS
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
      icon: "./assets/images/logo.ico", // Does not work on macOS
    });

    this.loadDefault();
    this.#window.show();
    this.#eventEmitter = new EventEmitter();

    /**
     * Emitted when a user or the page wants to start navigation
     * This can happen when the window.location object is changed or a user clicks a link in the page.
     * In this case, the user authorizes through spotify's oauth
     */
    this.#window.webContents.on("will-navigate", async (event, url) => {
      const { code } = decode(url.split("?")[1]);

      if (!code) {
        this.loadDefault();
        this.#resize(800, 200);
        return;
      }

      spotify.authorizationCodeGrant(code).then(async () => {
        this.#cache.userPlaylists = await this.sortPlaylists(
          await spotify.getCurrentUsersPlaylists()
        );
        this.#resize(400, 800);
        this.loadFile("./renderer/html/playlists.html");
      });
    });

    this.#window.webContents.on("did-finish-load", async (event, url) => {
      url = this.#window.webContents.getURL();

      if (url.endsWith("/playlists.html")) {
        this.#cache.userPlaylists = await this.sortPlaylists(
          await spotify.getCurrentUsersPlaylists()
        );
        this.#window.webContents.send(
          "display-playlists",
          this.#cache.userPlaylists
        );
        return;
      }

      if (url.endsWith("/tracks.html")) {
        this.#cache.currentPlaylist.tracks = await spotify.getPlaylistTracks(
          this.#cache.currentPlaylist.id
        );
        this.#window.webContents.send(
          "display-tracks",
          this.#cache.currentPlaylist.tracks,
          this.#cache.currentPlaylist
        );
      }
    });
  }

  close() {
    this.#window.close();
  }

  minimize() {
    this.#window.minimize();
  }

  maximize() {
    if (this.#window.isFullScreen()) {
      this.#window.setFullScreen(false);
    } else {
      this.#window.setFullScreen(true);
    }
  }

  loadDefault() {
    this.#window.loadFile("./renderer/html/index.html");
  }

  loadFile(src) {
    this.#window.loadFile(src);
  }

  on(eventName, listener) {
    this.#eventEmitter.addListener(eventName, listener);
  }

  removeEventListeners() {
    this.#eventEmitter.removeAllListeners();
  }

  getConfirmationWindow() {
    return this.#confirmationWindow;
  }

  setConfirmed() {
    this.#confirmationWindow.emitEvent();
    this.#confirmationWindow.hide();
  }

  #resize(w, h) {
    this.#window.setResizable(true);
    this.#window.setSize(w, h);
    this.#window.setResizable(false);

    // Position window at center of screen
    const x = Math.floor(this.#bounds.x + (this.#bounds.width - w) / 2);
    const y = Math.floor(this.#bounds.y + (this.#bounds.height - h) / 2);
    this.#window.setPosition(x, y);
  }

  auhorize() {
    this.#window.loadURL(spotify.authorizationUrl);
    this.#resize(800, 800);
  }

  getCurrentPlaylist() {
    return this.#cache.currentPlaylist;
  }

  async updateCurrentPlaylist(playlistId) {
    const index = this.#cache.userPlaylists.findIndex(
      (playlist) => playlist.id === playlistId
    );
    this.#cache.currentPlaylist = this.#cache.userPlaylists[index];
  }

  async setCurrentPlaylist(playlist) {
    this.#cache.currentPlaylist = playlist;
  }

  async sortPlaylists(playlists) {
    for (let i = 0; i < playlists.length - 1; i++) {
      for (let j = 0; j < playlists.length - i - 1; j++) {
        if ((playlists[j].name.charAt(0)) > (playlists[j + 1].name.charAt(0))) {
          let temp = playlists[j];
          playlists[j] = playlists[j + 1];
          playlists[j + 1] = temp;
        }
      }
    }

    return playlists;
  }

  async previewCurrentPlaylist(sortType, sortOrder) {
    if (!sortType || !sortOrder) {
      return;
    }

    let playlist = this.#cache.currentPlaylist;
    let playlistTracks = this.#cache.currentPlaylist.tracks;

    let sortedTracks;
    switch (sortType) {
      case "track":
        sortedTracks = await sortByTitle(playlistTracks, sortOrder);
        break;
      case "artist":
        sortedTracks = await sortByArtist(playlistTracks, sortOrder);
        break;
      case "album":
        sortedTracks = await sortByAlbum(playlistTracks, sortOrder);
        break;
      case "danceability":
        sortedTracks = await sortByDanceability(playlistTracks, sortOrder);
        break;
      case "key":
        sortedTracks = await sortByKey(playlistTracks, sortOrder);
        break;
      default:
        break;
    }

    try {
      await this.#window.webContents.executeJavaScript(`
              document.getElementById('tracks-showcase').removeChild(
                document.getElementsByTagName("ul")[0]);
            ;0`);
    } catch (error) {
      console.error(error);
    }
    this.#window.webContents.send("display-tracks", sortedTracks, playlist);
  }

  async sortCurrentPlaylist(params) {
    const { type, order, method } = params;

    if (!type || !method) {
      this.#window.webContents.send("undefined-sort-options");
      return;
    }

    let currentPlaylist = this.#cache.currentPlaylist;
    let playlistTracks = currentPlaylist.tracks;

    let sortedTracks;
    switch (type) {
      case "track":
        sortedTracks = await sortByTitle(playlistTracks, order);
        break;
      case "artist":
        sortedTracks = await sortByArtist(playlistTracks, order);
        break;
      case "album":
        sortedTracks = await sortByAlbum(playlistTracks, order);
        break;
      case "danceability":
        sortedTracks = await sortByDanceability(playlistTracks, order);
        break;
      case "key":
        sortedTracks = await sortByKey(playlistTracks, order);
        break;
      default:
        break;
    }

    if (method === "clone") {
      const clonedPlaylist = await this.#clonePlaylist(
        currentPlaylist,
        sortedTracks
      );
      this.#cache.userPlaylists.unshift(clonedPlaylist);
      return clonedPlaylist;
    } else if (method === "modify") {
      this.#confirmationWindow = new ConfirmationWindow(this.#window);
      this.#confirmationWindow.show();
      this.#confirmationWindow.on("user-confirmed", async () => {
        await this.#modifyPlaylist(
          currentPlaylist,
          playlistTracks,
          sortedTracks
        );
        this.#confirmationWindow.removeEventListeners();
      });
    }

    return undefined;
  }

  async #clonePlaylist(playlist, tracks) {
    const clonedPlaylist = await spotify.createPlaylist(playlist);
    const trackUris = tracks.map((track) => track.uri);

    const batchSize = 100;

    for (let i = 0; i < tracks.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      await spotify.addTracksToPlaylist(clonedPlaylist.id, batch);
    }

    const playlistObject = {
      name: clonedPlaylist.name,
      id: clonedPlaylist.id,
      image: playlist.image,
      total: clonedPlaylist.total,
    };

    this.#eventEmitter.emit("did-finish-sorting");
    return playlistObject;
  }

  async #modifyPlaylist(playlistObject, unsortedTracks, sortedTracks) {
    const unsortedTrackUris = unsortedTracks.map((track) => track.uri);
    const sortedTrackUris = sortedTracks.map((track) => track.uri);
    await spotify.removeAllPlaylistItems(playlistObject.id, unsortedTrackUris);
    await spotify.updatePlaylistItems(playlistObject.id, sortedTrackUris);
    this.#eventEmitter.emit("did-finish-sorting");
  }
};
