const { BrowserWindow } = require("electron");
const { EventEmitter } = require("events");
const path = require("path");

module.exports = class confirmationWindow {
  #window;
  #eventEmitter;

  constructor(parent) {
    this.#window = new BrowserWindow({
      width: 400,
      height: 100,
      resizable: false,
      titleBarStyle: "hidden",
      parent: parent,
      webPreferences: {
        preload: path.join(__dirname, "cw_preload.js"),
      },
      show: false,
    });

    this.#eventEmitter = new EventEmitter();

    this.loadDefault();
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
    this.#window.loadFile("./renderer/html/verification.html");
  }

  show() {
    this.#window.show();
  }

  hide() {
    this.#window.hide();
  }

  emitEvent() {
    this.#eventEmitter.emit("user-confirmed");
  }

  on(eventName, listener) {
    this.#eventEmitter.addListener(eventName, listener);
  }

  removeEventListeners() {
    this.#eventEmitter.removeAllListeners();
  }
};
