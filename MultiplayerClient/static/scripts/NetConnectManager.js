"use strict";

import printConsole from "./Printer";
import RoomsListRender from "./RoomsListRender";
import CanvasPrinter from "./CanvasPrinter";
import KeyManager from "./KeyManager";

// const SOCKET_URL = "ws://localhost:5000/";
const SOCKET_URL = "ws://gggg-ssss-serv.herokuapp.com/";

const PING = "PING";

class NetConnectManager {
    constructor() {
        printConsole("new NetConnectManager");
        // create socket
        this.socket = null;
        // init socket
        this.startSocket();
        //////////////////////////
        this.roomsListRender = new RoomsListRender();
        this.canvasPrinter = new CanvasPrinter();
        //////////////////////////
        this.keyManager = new KeyManager();
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
            printConsole("Send to server: " + message);
            this.socket.send(message.toString());
        } catch (err) {
            // sending error
        }
    }

    startSocket() {
        this.socket = new WebSocket(SOCKET_URL);

        this.socket.onopen = () => {
            printConsole("Соединение установлено");
        };

        this.socket.onclose = (event) => {
            printConsole("Соединение закрыто");
        };

        this.socket.onmessage = (event) => {
            printConsole("Получено сообщение: " + event.data);
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
                            printConsole("Room: " + room.innerHTML);
                            const obj = {
                                t: "j",
                                n: room.innerHTML.toString(),
                            };
                            this.sendMessage(JSON.stringify(obj));
                        } else {
                            printConsole("В данной комнате нет МЕСТ");
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
                    printConsole("START GAME");
                    printConsole("ADD KEY EVENTS");
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
                printConsole("Render canvas");
                this.canvasPrinter.renderAll(p1, p2, obj.e_1, obj.e_2, obj.b_1, obj.b_2);
            }

            // finish game
            if(obj.gameOver !== null && obj.gameOver !== undefined) {
                document.querySelector(".multiplayer-page__game-over-label").innerHTML = obj.gameOver.toString();
            }
        };

        this.socket.onerror = (error) => {
            printConsole("Ошибка: " + error.message);
        };
    }
}

window.onload = function () {
    new NetConnectManager();
};