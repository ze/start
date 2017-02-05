"use strict";

const columns = 4;
const container = document.querySelector("#container");

class Column {
    constructor() {
        this._column = document.createElement("div");
        this._column.setAttribute("class", "column");

        this._header = document.createElement("div");
        this._header.setAttribute("class", "header");

        this._column.appendChild(this._header);
    }

    get column() {
        return this._column;
    }

    set header(text) {
        this._header.innerHTML = text;
    }
}

(function (cols) {
    var topics = ["Programming", "School", "Social", "Games"];
    for (let i = 0; i < cols; i++) {
        let item = new Column();
        item.header = topics[i];
        container.appendChild(item.column);
    }
})(columns);
