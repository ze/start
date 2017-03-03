"use strict";
const container = document.querySelector("#container"),
      search = document.querySelector("#searchbar"),
      button = document.querySelector("button");

const config = new Config();

button.onclick = function () {
    button.disabled = true;

    var cols = document.querySelectorAll(".column");
    Array.from(cols).map(function (col) {
        col.className += " editable";
        col.onclick = function (e) {
            let selectedColumn = null;
            for (let i = 0; i < cols.length; i++) {
                cols[i].onclick = () => false;

                if (this == cols[i]) {
                    selectedColumn = config.columns[i];
                    continue;
                } else {
                    cols[i].className = "column hoverable";
                }
            }

            e.stopPropagation();
            newItem(this, selectedColumn);
        };
    });
};

search.onkeypress = (e) => {
    if (e.keyCode == 13) {
        var url = "http://", query = search.value.trim();

        if (query.includes(" ") || query.includes(",") ||
            !query.includes(".") && query.indexOf("localhost") < 0) {
            url += "google.com/search?q=";
        }

        window.open(url + query, "_self");
    }
};

class Column {
    constructor(config) {
        this._config = config;

        this._column = document.createElement("div");
        this._column.setAttribute("class", "column hoverable");

        this._content = document.createElement("table");
        this._header = this._content.createTHead();

        this._column.appendChild(this._content);

        this._icons = false;
    }

    get column() {
        return this._column;
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
        for (let i = 0; i < section.length; i++) {
            let row = this._content.insertRow(-1);
            row.onclick = () => window.open(section[i].url, "_self");

            let linkCell = row.insertCell(-1);
            linkCell.innerHTML = section[i].name;

            if (Column.icons) {
                let head = document.createElement("th");
                head.setAttribute("colspan", "2");
                head.innerHTML = this._header.innerHTML;

                this.header = "";
                this.header.appendChild(head);

                let icon = document.createElement("img");
                icon.src = section[i].url + "/favicon.ico";

                let iconCell = row.insertCell(0);
                iconCell.setAttribute("class", "icon");
                iconCell.appendChild(icon);
            } else {
                linkCell.style.textAlign = "center";
            }
        }
    }

    clear() {
        this._content.childNodes[1].innerHTML = "";
    }

    reload() {
        this.clear();
        this.content = this._config;
    }
}

function newItem(column, columnObj) {
    var item = document.querySelector("#new-item"),
        protocol = document.querySelector("select"),
        url = document.querySelector("#url"),
        name = document.querySelector("#name");

    item.style.display = "flex";

    document.querySelector("form").onsubmit = function (e) {
        e.preventDefault();

        let headerVal = columnObj.header;
        if (Column.icons) {
            headerVal = headerVal.firstChild;
        }

        let trimVal = elem => elem.value.trim();
        config.add(headerVal.innerHTML, protocol.value + trimVal(url), trimVal(name));

        columnObj.reload();
    };

    var once = function (e) {
        if (!e.target.closest("#new-item")) {
            document.removeEventListener(e.type, once);

            item.style.display = "none";
            protocol.selectedIndex = 0;
            url.value = name.value = "";

            button.disabled = false;

            column.className = "column hoverable";
        }
    };

    document.addEventListener("click", once);
}

config.load(container);
