"use strict";

const container = document.querySelector("#container");

class Column {
    constructor() {
        this._column = document.createElement("div");
        this._column.setAttribute("class", "column");

        this._header = document.createElement("div");
        this._header.setAttribute("class", "header");

        this._content = document.createElement("table");

        this._column.appendChild(this._header);
        this._column.appendChild(this._content);
    }

    get column() {
        return this._column;
    }

    set header(text) {
        this._header.innerHTML = text;
    }

    set content(section) {
        for (let i = 0; i < section.length; i++) {
            let row = document.createElement("tr");

            let icon = document.createElement("img");
            icon.src = section[i].url + "/favicon.ico";

            let link = document.createElement("a");
            link.href = section[i].url;
            link.innerHTML = section[i].name;

            let iconCell = document.createElement("td");
            iconCell.setAttribute("class", "icon");
            iconCell.appendChild(icon);
            let linkCell = document.createElement("td");
            linkCell.appendChild(link);

            row.appendChild(iconCell);
            row.appendChild(linkCell);

            this._content.appendChild(row);
        }
    }
}

var xhr = new XMLHttpRequest();
xhr.open("GET", "config.json", true);
xhr.send();
xhr.addEventListener("load", function () {
    var config = JSON.parse(this.responseText);

    var headers = (() => {
        let names = [];

        for (let key in config) {
            names.push(key);
        }

        return names;
    })(config);

    (function (cols) {
        for (let i = 0; i < cols; i++) {
            let item = new Column();
            item.header = headers[i];
            item.content = config[headers[i]];

            container.appendChild(item.column);
        }
    })(headers.length);
});
