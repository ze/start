"use strict";
class Column {
    constructor(config) {
        this._config = config;

        this._column = document.createElement("div");
        this._column.setAttribute("class", "column hoverable");

        this._content = document.createElement("table");
        this._header = this._content.createTHead();

        this._column.appendChild(this._content);
    }

    get column() {
        return this._column;
    }

    get config() {
        return this._config;
    }

    set header(text) {
        this.header.innerHTML = text;
    }

    get header() {
        return this._header;
    }

    set content(section) {
        if (!this._content.childNodes[1]) {
            this._content.createTBody();
        }

        for (const s of section) {
            const row = this._content.insertRow(-1);
            row.onclick = () => window.open(s.url, "_self");

            const linkCell = row.insertCell(-1);
            linkCell.innerHTML = s.name;
            linkCell.style.textAlign = "center";
        }
    }

    get content() {
        return this._content;
    }

    clear() {
        this._content.childNodes[1].innerHTML = "";
    }

    reload() {
        this.clear();

        this.content = this._config;
        const rows = this.content.childNodes[1].childNodes;
        for (const row of Array.from(rows)) {
            row.oncontextmenu = e => {
                e.preventDefault();
                e.stopPropagation();

                columnClick(e, this.column, getCols(), changeItem, row);
            };
        }
    }
}
