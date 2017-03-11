"use strict";
const container = document.querySelector("#container"),
      search = document.querySelector("#searchbar"),
      button = document.querySelector("button");

const config = new Config(container);

function getCols() {
    return document.querySelectorAll(".column");
}

button.onclick = function (e) {
    button.disabled = true;

    let cols = getCols();

    Array.from(cols).map(function (col) {
        col.classList.add("editable");
        col.onclick = function (e) {
            e.stopPropagation()
            columnClick(e, col, cols);
        };
    });

    e.stopPropagation();
    document.addEventListener("click", newColumn);
};

search.onkeypress = e => {
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
        if (!this._content.childNodes[1]) {
            this._content.createTBody();
        }

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

function columnClick(e, col, cols) {
    let selectedColumn = null;
    for (let i = 0; i < cols.length; i++) {
        cols[i].onclick = () => false;

        if (col == cols[i]) {
            selectedColumn = config.columns[i];
            continue;
        } else {
            cols[i].classList.remove("editable");
        }
    }

    e.stopPropagation();
    newItem(col, selectedColumn);
}

const item = document.querySelector("#new-item"),
    protocol = document.querySelector("select"),
    url = document.querySelector("#url"),
    name = document.querySelector("#name");

function newItem(column, columnObj) {
    document.removeEventListener("click", newColumn);
    item.classList.remove("new-column");

    item.style.display = "flex";
    protocol.style.display = "initial";
    url.style.display = "initial";
    url.required = true;

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
            item.style.display = "none";

            document.removeEventListener(e.type, once);

            protocol.selectedIndex = 0;
            url.value = name.value = "";

            button.disabled = false;

            column.classList.remove("editable");
        }
    };

    document.addEventListener("click", once);
}

function newColumn() {
    document.removeEventListener("click", newColumn);

    protocol.style.display = "none";
    url.style.display = "none";
    url.required = false;

    item.style.display = "flex";
    item.classList.add("new-column");

    document.querySelector("form").onsubmit = function (e) {
        e.preventDefault();
        item.classList.remove("new-column");

        config.addColumn(name.value.trim());

        let col = config.columns[config.columns.length - 1];
        col.column.onclick = function (e) {
            e.stopPropagation();

            name.value = "";
            columnClick(e, col.column, getCols());
        };

        col.column.classList.add("editable");
    }

    var once = function (e) {
        if (e.target == document.firstElementChild) {
            item.style.display = "none";

            document.removeEventListener(e.type, once);
            Array.from(document.querySelectorAll(".column")).map(function (col) {
                col.classList.remove("editable");
                col.onclick = () => false;
            });

            name.value = "";

            button.disabled = false;
        }
    };

    document.addEventListener("click", once);
}

config.load();
