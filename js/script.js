"use strict";

const container = document.querySelector("#container");
const search = document.querySelector("input");
const button = document.querySelector("button");

search.onkeypress = (e) => {
    if (e.keyCode == 13) {
        var url = "http://", query = search.value.trim();

        if (!query.includes(".") && query.indexOf("localhost") < 0) url += "google.com/search?q=";

        window.open(url + query, "_self");
    }
};

class Column {
    constructor() {
        this._column = document.createElement("div");
        this._column.setAttribute("class", "column");

        this._header = document.createElement("div");
        this._header.setAttribute("class", "header");

        this._content = document.createElement("table");

        this._column.appendChild(this._header);
        this._column.appendChild(this._content);

        this._icons = false;
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
            row.onclick = () => window.open(section[i].url, "_self");

            let linkCell = document.createElement("td");
            linkCell.innerHTML = section[i].name;

            if (this._icons) {
                let icon = document.createElement("img");
                icon.src = section[i].url + "/favicon.ico";

                let iconCell = document.createElement("td");
                iconCell.setAttribute("class", "icon");
                iconCell.appendChild(icon);

                row.appendChild(iconCell);
            } else {
                linkCell.style.textAlign = "center";
            }

            row.appendChild(linkCell);

            this._content.appendChild(row);
        }
    }

    set icons(state) {
        this._icons = state;
    }
}

var xhr = new XMLHttpRequest();

function loadConfig(request, addIcons) {
    request.open("GET", "config.json", true);
    request.send();
    request.addEventListener("load", function () {
        var config = JSON.parse(this.responseText);
        var headers = Object.keys(config);

        for (let i = 0; i < headers.length; i++) {
                let item = new Column();
                item.header = headers[i];
                item.icons = addIcons;
                item.content = config[headers[i]];

                container.appendChild(item.column);
        }
    });
}

loadConfig(xhr, false);
