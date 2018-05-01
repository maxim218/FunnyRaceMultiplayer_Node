/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = printConsole;


function printConsole(content) {
    console.log(content);
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Printer__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RoomsListRender__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__CanvasPrinter__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__KeyManager__ = __webpack_require__(4);







// const SOCKET_URL = "ws://localhost:5000/";
const SOCKET_URL = "ws://gggg-ssss-serv.herokuapp.com/";

const PING = "PING";

class NetConnectManager {
    constructor() {
        Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("new NetConnectManager");
        // create socket
        this.socket = null;
        // init socket
        this.startSocket();
        //////////////////////////
        this.roomsListRender = new __WEBPACK_IMPORTED_MODULE_1__RoomsListRender__["a" /* default */]();
        this.canvasPrinter = new __WEBPACK_IMPORTED_MODULE_2__CanvasPrinter__["a" /* default */]();
        //////////////////////////
        this.keyManager = new __WEBPACK_IMPORTED_MODULE_3__KeyManager__["a" /* default */]();
        //////////////////////////
        this.addCreatingRoom();
    }

    addCreatingRoom() {
        const textField = document.querySelector(".multiplayer-page__room-name-field");
        document.querySelector(".multiplayer-page__create-room-btn").onclick = () => {
            const value = textField.value.toString();
            this.sendMessage(JSON.stringify({
                t: "r",
                n: value,
            }));
            textField.value = "";
        }
    }

    sendMessage(message) {
        try {
            Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("Send to server: " + message);
            this.socket.send(message.toString());
        } catch (err) {
            // sending error
        }
    }

    startSocket() {
        this.socket = new WebSocket(SOCKET_URL);

        this.socket.onopen = () => {
            Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("Соединение установлено");
        };

        this.socket.onclose = (event) => {
            Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("Соединение закрыто");
        };

        this.socket.onmessage = (event) => {
            Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("Получено сообщение: " + event.data);
            this.sendMessage(PING);

            const message = event.data;
            const obj = JSON.parse(message);

            // printing rooms and adding events
            if(obj.rooms !== null && obj.rooms !== undefined) {
                this.roomsListRender.printRooms(obj.rooms);
                const rooms = document.getElementsByClassName("room-element");
                for(let i = 0; i < rooms.length; i++) {
                    const room = rooms[i];
                    room.onclick = () => {
                        if(room.innerHTML.toString().indexOf("НЕТ МЕСТ") === -1) {
                            Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("Room: " + room.innerHTML);
                            const obj = {
                                t: "j",
                                n: room.innerHTML.toString(),
                            };
                            this.sendMessage(JSON.stringify(obj));
                        } else {
                            Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("В данной комнате нет МЕСТ");
                        }
                    }
                }
            }

            // delete room
            if(obj.delete !== null && obj.delete !== undefined) {
                // reload page
                location.reload();
            }

            // start game
            if(obj.play !== null && obj.play !== undefined) {
                if(obj.play === "P_START") {
                    document.querySelector(".multiplayer-page__game-two-players-box").hidden = false;
                    Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("START GAME");
                    Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("ADD KEY EVENTS");
                    this.keyManager.initKeys();
                    this.keyManager.initCallbacks(() => {
                       this.sendMessage(JSON.stringify({
                           t: "c",
                           v: "UP",
                       }));
                    }, () => {
                        this.sendMessage(JSON.stringify({
                            t: "c",
                            v: "DOWN",
                        }));
                    }, () => {
                        this.sendMessage(JSON.stringify({
                            t: "c",
                            v: "FIRE",
                        }));
                    });
                    this.keyManager.addEventsToKeys();

                }
            }

            // game params getting
            if(obj.game !== null && obj.game !== undefined) {
                const p1 = parseInt(obj.p1);
                const p2 = parseInt(obj.p2);
                Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("Render canvas");
                this.canvasPrinter.renderAll(p1, p2, obj.e_1, obj.e_2, obj.b_1, obj.b_2);
            }

            // finish game
            if(obj.gameOver !== null && obj.gameOver !== undefined) {
                document.querySelector(".multiplayer-page__game-over-label").innerHTML = obj.gameOver.toString();
            }
        };

        this.socket.onerror = (error) => {
            Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("Ошибка: " + error.message);
        };
    }
}

window.onload = function () {
    new NetConnectManager();
};

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Printer__ = __webpack_require__(0);




class RoomsListRender {
    constructor() {
        Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("new RoomsListRender");
        this.roomsListBox = document.querySelector(".multiplayer-page__rooms-list-box");
        this.roomsListBox.innerHTML = "";
    }

    printRooms(roomsArray) {
        this.roomsListBox.innerHTML = "";
        let html = "";
        roomsArray.forEach((element) => {
           const s = "<p class = 'room-element'>" + element.toString() + "</p>";
           html += s.toString();
        });
        this.roomsListBox.innerHTML = html;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = RoomsListRender;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Printer__ = __webpack_require__(0);




const WIDTH = 900;
const HEIGHT = 700;
const SIZE = 80;
const X_POSITION = 100;

class CanvasPrinter {
    constructor() {
        Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("new CanvasPrinter");
        this.initCanvas();
        this.drawBackground();
        this.drawThreeLines();
        this.drawFirst(X_POSITION, 190);
        this.drawSecond(X_POSITION, 430);
    }

    renderAll(p1, p2, e_1, e_2, b_1, b_2) {
        this.drawBackground();
        this.drawThreeLines();

        p1 = p1 * SIZE + 110;
        p2 = p2 * SIZE + 350;
        this.drawFirst(X_POSITION, p1);
        this.drawSecond(X_POSITION, p2);

        e_1.forEach((e) => {
            this.drawRectange("#2fb1d9", e.x, e.y);
        });

        e_2.forEach((e) => {
            this.drawRectange("#32d97e", e.x, e.y);
        });

        b_1.forEach((b) => {
            this.drawRectange("#ff1f1a", b.x, b.y);
        });

        b_2.forEach((b) => {
            this.drawRectange("#ff1f1a", b.x, b.y);
        });
    }

    initCanvas() {
        const can = document.querySelector(".game-two-players-box__canvas-plain");
        this.holst = can.getContext('2d');
        this.holst.lineWidth = 2;
    }

    drawBackground() {
        const holst = this.holst;
        holst.fillStyle = '#2d26ad';
        holst.fillRect(0, 0, WIDTH, HEIGHT);
    }

    drawThreeLines() {
        function drawLine(holst, x1, y1, x2, y2) {
            holst.strokeStyle = "#ff1f1a";
            holst.beginPath();
            holst.moveTo(x1, y1);
            holst.lineTo(x2, y2);
            holst.closePath();
            holst.stroke();
        }

        drawLine(this.holst, 0, 110, WIDTH, 110);
        drawLine(this.holst, 0, 590, WIDTH, 590);
        drawLine(this.holst, 0, 350, WIDTH, 350);
    }

    drawRectange(color, xxx, yyy) {
        const holst = this.holst;
        holst.strokeStyle = color;
        holst.strokeRect(xxx, yyy, SIZE, SIZE);
    }

    drawFirst(xxx, yyy) {
        this.drawRectange("#FFFFFF", xxx, yyy);
    }

    drawSecond(xxx, yyy) {
        this.drawRectange("#00FF00", xxx, yyy);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CanvasPrinter;




/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Printer__ = __webpack_require__(0);




const W_KEY = 87;
const S_KEY = 83;
const R_KEY = 82;

class KeyManager {
    constructor() {
        Object(__WEBPACK_IMPORTED_MODULE_0__Printer__["a" /* default */])("new KeyManager");
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
/* harmony export (immutable) */ __webpack_exports__["a"] = KeyManager;



/***/ })
/******/ ]);