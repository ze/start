"use strict";
const container = document.querySelector("#container"),
    search = document.querySelector("#searchbar"),
    button = document.querySelector("button");

const config = new Config(container);

const COL_MAX = 4,
    ITEM_MAX = 10,
    CHAR_MAX = [18, 25]

const getCols = () => document.querySelectorAll(".column");
const totalChildren = col => col.firstChild.childNodes[1].childNodes.length;

button.onclick = function (e) {
    button.disabled = true;

    const cols = getCols();

    Array.from(cols).map(function (col) {
        if (totalChildren(col) < ITEM_MAX) {
            col.classList.add("editable");
            col.onclick = function (e) {
                e.stopPropagation()
                columnClick(e, col, cols);
            };
        }
    });

    if (cols.length < COL_MAX) {
        e.stopPropagation();
        document.addEventListener("click", newColumn);
    }
};

search.onkeypress = e => {
    if (e.keyCode == 13) {
        let url = "http://", query = search.value.trim();

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

name.maxLength = Column.icons ? CHAR_MAX[0] : CHAR_MAX[1];

function clear() {
    item.style.display = "none";
    protocol.selectedIndex = 0;
    url.value = name.value = "";

    name.maxLength = Column.icons ? CHAR_MAX[0] : CHAR_MAX[1];

    button.disabled = false;
}

function newColumn() {
    document.removeEventListener("click", newColumn);

    name.maxLength = CHAR_MAX[0];

    protocol.style.display = "none";
    url.style.display = "none";
    url.required = false;

    item.style.display = "flex";
    item.classList.add("new-column");

    document.querySelector("form").onsubmit = function (e) {
        e.preventDefault();

        config.addColumn(name.value.trim());

        const col = config.columns[config.columns.length - 1];
        col.column.onclick = function (e) {
            e.stopPropagation();

            clear();
            columnClick(e, col.column, getCols());
        };

        col.column.classList.add("editable");
        config.localize();

        if (getCols().length == COL_MAX) {
            clear();
        }
    }

    const once = function (e) {
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

        const trimVal = elem => elem.value.trim();
        config.add(headerVal.innerHTML, protocol.value + trimVal(url), trimVal(name));

        columnObj.reload();
        config.localize();

        if (totalChildren(column) == ITEM_MAX) {
            clear();
            column.classList.remove("editable");
        }
    };

    const once = function (e) {
        if (!e.target.closest("#new-item")) {
            clear();

            document.removeEventListener(e.type, once);
        }
    };

    document.addEventListener("click", once);
}

config.load();
