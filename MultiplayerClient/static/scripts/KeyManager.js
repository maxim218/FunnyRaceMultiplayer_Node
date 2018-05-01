"use strict";

import printConsole from "./Printer";

const W_KEY = 87;
const S_KEY = 83;
const R_KEY = 82;

export default class KeyManager {
    constructor() {
        printConsole("new KeyManager");
    }

    initKeys() {
        this.w = false;
        this.s = false;
        this.r = false;
    }

    initCallbacks(wwwCallback, sssCallback, rrrCallback) {
        this.wwwCallback = wwwCallback;
        this.sssCallback = sssCallback;
        this.rrrCallback = rrrCallback;
    }

    addEventsToKeys() {
        window.onkeydown = (event) => {
            const n = event.keyCode;

            if(n === W_KEY && this.w === false) {
                this.w = true;
                this.wwwCallback();
            }

            if(n === S_KEY && this.s === false) {
                this.s = true;
                this.sssCallback();
            }

            if(n === R_KEY && this.r === false) {
                this.r = true;
                this.rrrCallback();
            }
        };

        window.onkeyup = (event) => {
            const n = event.keyCode;

            if(n === W_KEY) {
                this.w = false;
            }

            if(n === S_KEY) {
                this.s = false;
            }

            if(n === R_KEY) {
                this.r = false;
            }
        };
    }
}
