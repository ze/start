"use strict";
const container = document.querySelector("#container"),
    search = document.querySelector("#searchbar"),
    button = document.querySelector("button");

const config = new Config(container);

const getCols = () => document.querySelectorAll(".column"),
    totalChildren = col => col.firstChild.childNodes[1].childNodes.length;

const item = document.querySelector("#new-item"),
    protocol = document.querySelector("select"),
    url = document.querySelector("#url"),
    name = document.querySelector("#name");

const COL_MAX = 4,
    ITEM_MAX = 10,
    CHAR_MAX = [18, 25]

button.onclick = function (e) {
    button.disabled = true;

    const cols = getCols();

    Array.from(cols).map(function (col) {
        if (totalChildren(col) < ITEM_MAX) {
            col.classList.add("editable");

            let head = col.firstChild.firstChild;
            head.onclick = function (e) {
                e.stopPropagation();
                columnClick(e, col, cols, changeColumn);
            };

            col.onclick = function (e) {
                e.stopPropagation()
                columnClick(e, col, cols, newItem);
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
        let url = "http://",
            query = search.value.trim();

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

name.maxLength = Column.icons ? CHAR_MAX[0] : CHAR_MAX[1];

function columnClick(e, col, cols, callback) {
    name.maxLength = CHAR_MAX[0];

    let selectedColumn = null;
    for (let i = 0; i < cols.length; i++) {
        cols[i].onclick = () => false;
        cols[i].firstChild.firstChild.onclick = () => false;

        if (col == cols[i]) {
            selectedColumn = config.columns[i];
            continue;
        } else {
            cols[i].classList.remove("editable");
        }
    }

    e.stopPropagation();
    callback(col, selectedColumn);
}

function clear() {
    item.style.display = "none";
    document.querySelector("#delete").style.display = "none";

    protocol.selectedIndex = 0;
    url.value = name.value = "";

    name.maxLength = Column.icons ? CHAR_MAX[0] : CHAR_MAX[1];

    button.disabled = false;
}

function clearColumnClick() {
    const once = function (e) {
        e.stopPropagation();

        if (e.target == document.documentElement) {
            item.style.display = "none";
            document.querySelector("#delete").style.display = "none";

            document.removeEventListener(e.type, once);
            Array.from(getCols()).map(function (col) {
                col.classList.remove("editable");
                col.onclick = () => false;
                col.firstChild.firstChild.onclick = () => false;
            });

            name.value = "";

            button.disabled = false;
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

    document.querySelector("form").onsubmit = function (e) {
        e.preventDefault();

        config.addColumn(name.value.trim());

        const col = config.columns[config.columns.length - 1];
        col.column.onclick = function (e) {
            e.stopPropagation();

            clear();
            columnClick(e, col.column, getCols(), newItem);
        };

        col.column.classList.add("editable");
        config.localize();

        if (getCols().length == COL_MAX) {
            clear();
        }
    };

    clearColumnClick();
}

function changeColumn(column, columnObj) {
    document.removeEventListener("click", newColumn);

    name.value = "";

    protocol.style.display = "none";
    url.style.display = "none";
    url.required = false;

    item.style.display = "flex";
    document.querySelector("#delete").style.display = "initial";

    document.querySelector("form").onsubmit = function (e) {
        e.preventDefault();

        let trimmed = name.value.trim();
        let replace = {};

        for (let key in config.config) {
            if (key == columnObj.header.innerHTML) {
                replace[trimmed] = config.config[key];
            } else {
                replace[key] = config.config[key];
            }
        }

        config.config = replace;

        config.localize();
        columnObj.header = trimmed;
    };

    document.querySelector("#delete").onclick = function (e) {
        for (let i = 0; i < config.columns.length; i++) {
            if (config.columns[i].header.innerHTML == columnObj.header.innerHTML) {
                config.columns.splice(i, 1);
            }
        }
        delete config.config[columnObj.header.innerHTML];
        column.parentNode.removeChild(column);

        columnObj.reload();
        config.localize();

        clear();
    }

    clearColumnClick();
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
            column.classList.remove("editable");

            document.removeEventListener(e.type, once);
        }
    };

    document.addEventListener("click", once);
}

config.load();
