"use strict";
const container = document.querySelector("#container"),
    search = document.querySelector("#searchbar"),
    button = document.querySelector("button");

const config = new Config(container);

const getCols = () => Array.from(document.querySelectorAll(".column")),
    columnChildren = col => col.firstChild.childNodes[1].childNodes;

const item = document.querySelector("#new-item"),
    settings = document.querySelector("#config"),
    protocol = document.querySelector("select"),
    url = document.querySelector("#url"),
    name = document.querySelector("#name"),
    del = document.querySelector("#delete");

const COL_MAX = 4,
    ITEM_MAX = 10;

name.maxLength = 25;

button.onclick = function (e) {
    settings.style.display = "none";
    button.disabled = true;

    const cols = getCols();
    cols.map(function (col) {
        col.classList.add("editable");

        if (columnChildren(col).length < ITEM_MAX) {
            col.onclick = function (e) {
                e.stopPropagation();
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

function columnClick(e, col, cols, callback, row) {
    name.maxLength = 18;

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

    if (row) {
        callback(selectedColumn, row);
    } else {
        callback(selectedColumn);
    }
}

function clear() {
    Array.from(document.querySelectorAll(".menu")).map(menu => menu.style.display = "none");
    del.style.display = "none";

    protocol.selectedIndex = 0;
    url.value = name.value = "";
    url.required = true;

    name.maxLength = 25;
    button.disabled = false;
}

function clearColumnClick() {
    const once = function (e) {
        e.stopPropagation();

        if (e.target == document.documentElement) {
            document.removeEventListener(e.type, once);
            clear();

            getCols().map(function (col) {
                col.classList.remove("editable");
                col.onclick = () => false;
                col.firstChild.firstChild.onclick = () => false;
            });
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
        name.value = "";

        const col = config.columns[config.columns.length - 1];
        col.column.onclick = function (e) {
            e.stopPropagation();

            clear();
            columnClick(e, col.column, getCols(), newItem);
        };

        col.header.oncontextmenu = function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (window.getComputedStyle(settings, null).getPropertyValue("display") != "none") return;
            changeColumn(col);
        };

        col.column.classList.add("editable");
        config.localize();

        if (getCols().length == COL_MAX) {
            clear();
        }
    };

    clearColumnClick();
}

function changeColumn(col) {
    name.value = col.header.innerText;

    protocol.style.display = "none";
    url.style.display = "none";
    del.style.display = "initial";

    url.required = false;

    item.style.display = "flex";
    document.querySelector("form").onsubmit = function (e) {
        e.preventDefault();

        const trimmed = name.value.trim();
        const replace = {};

        for (const key in config.config) {
            if (key == col.header.innerText) {
                replace[trimmed] = config.config[key];
            } else {
                replace[key] = config.config[key];
            }
        }

        config.config = replace;

        config.localize();
        col.header = trimmed;
    };

    del.onclick = function (e) {
        for (let i = 0; i < config.columns.length; i++) {
            if (config.columns[i].header.innerText == col.header.innerText) {
                config.columns.splice(i, 1);
            }
        }

        delete config.config[col.header.innerText];
        col.column.parentNode.removeChild(col.column);

        col.reload();
        config.localize();

        clear();
    }

    clearColumnClick();
}

function newItem(col) {
    document.removeEventListener("click", newColumn);

    protocol.style.display = "initial";
    url.style.display = "initial";

    item.style.display = "flex";
    document.querySelector("form").onsubmit = function (e) {
        e.preventDefault();

        const trimVal = elem => elem.value.trim();
        config.add(col.header.innerHTML, protocol.value + trimVal(url), trimVal(name));

        col.reload();
        config.localize();

        if (columnChildren(col.column).length == ITEM_MAX) {
            clear();
        }
    };

    clearColumnClick();
}

function changeItem(col, row) {
    protocol.style.display = "initial";
    url.style.display = "initial";
    del.style.display = "initial";

    const rowIndex = Array.prototype.indexOf.call(row.parentNode.children, row);
    const header = col.header.innerHTML;

    name.value = row.innerText;

    let redir = config.config[header][rowIndex].url;
    let secure = redir.indexOf("https") != -1;

    protocol.value = secure ? "https://" : "http://";
    url.value = redir.slice(secure ? 8 : 7);

    item.style.display = "flex";
    document.querySelector("form").onsubmit = function (e) {
        e.preventDefault();

        const trimVal = elem => elem.value.trim();
        const trimmedUrl = protocol.value + trimVal(url);

        config.change(header, rowIndex, trimmedUrl, trimVal(name));
        row.childNodes[0].innerHTML = trimVal(name);
        row.onclick = () => window.open(trimmedUrl, "_self");

        config.localize();
    };

    del.onclick = function (e) {
        col.config.splice(rowIndex, 1);

        col.reload();
        config.localize();

        clear();
    }

    clearColumnClick();
}

function setupColumns() {
    for (const col of getCols()) {
        let head = col.firstChild.firstChild;
        head.oncontextmenu = function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (window.getComputedStyle(settings, null).getPropertyValue("display") != "none") return;
            columnClick(e, col, getCols(), changeColumn);
        };

        for (const row of columnChildren(col)) {
            row.oncontextmenu = function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (window.getComputedStyle(settings, null).getPropertyValue("display") != "none") return;
                columnClick(e, col, getCols(), changeItem, row);
            };
        }
    }
}

document.querySelector("#download").onclick = function () {
    const downloader = document.querySelector("#down_json");

    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config.config, null, 4));
    downloader.href = data;
    downloader.download = "config.json";
};

document.querySelector("#upload").onclick = function () {
    let inFile = document.querySelector("#up_file");
    inFile.onchange = function (e) {
        let file = e.target.files[0];
        if (!file || !file.type.match("json")) return;

        let reader = new FileReader();
        reader.readAsBinaryString(file);

        reader.onload = () => {
            let conf = JSON.parse(reader.result);
            config.config = conf;

            config.clearContainer();
            config.generate();
            config.localize();
        };
    };

    inFile.click();
};

config.load(function () {
    document.oncontextmenu = e => {
        e.preventDefault();

        if (window.getComputedStyle(item, null).getPropertyValue("display") != "none") return;
        settings.style.display = "flex";

        clearColumnClick();
    };

    setupColumns();
});
