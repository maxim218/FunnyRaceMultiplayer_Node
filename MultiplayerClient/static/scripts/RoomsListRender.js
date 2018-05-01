"use strict";

import printConsole from "./Printer";

export default class RoomsListRender {
    constructor() {
        printConsole("new RoomsListRender");
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
