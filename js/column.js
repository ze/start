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
        this._header.innerHTML = text;
    }

    get header() {
        return this._header;
    }

    static set icons(icons) {
        this._icons = icons;
    }

    static get icons() {
        return this._icons;
    }

    set content(section) {
        if (Column.icons) {
            const head = document.createElement("th");
            head.setAttribute("colspan", "2");
            head.innerHTML = this._header.innerHTML;

            this.header = "";
            this.header.appendChild(head);
        }

        if (!this._content.childNodes[1]) {
            this._content.createTBody();
        }

        for (let i = 0; i < section.length; i++) {
            const row = this._content.insertRow(-1);
            row.onclick = () => window.open(section[i].url, "_self");

            const linkCell = row.insertCell(-1);
            linkCell.innerHTML = section[i].name;

            if (Column.icons) {
                const icon = document.createElement("img");
                icon.src = section[i].url + "/favicon.ico";

                const iconCell = row.insertCell(0);
                iconCell.setAttribute("class", "icon");
                iconCell.appendChild(icon);

                icon.onerror = function () {
                    this.style.visibility = "hidden";
                };

            } else {
                linkCell.style.textAlign = "center";
            }
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
