"use strict";
class Config {
    constructor(container) {
        if (!localStorage.getItem("config")) {
            this._xhr = new XMLHttpRequest();
            this._xhr.open("GET", "config.json", true);
            this._xhr.send();
        };

        this._container = container;

        this._config = null;
        this._columns = [];
    }

    get config() {
        return this._config;
    }

    set config(config) {
        this._config = config;
    }

    get columns() {
        return this._columns;
    }

    generate() {
        const headers = Object.keys(this.config);

        for (let i = 0; i < headers.length; i++) {
            const col = new Column(this.config[headers[i]]);
            col.header = headers[i];
            col.content = this.config[headers[i]];

            this.columns.push(col);
            this._container.appendChild(col.column);
        }
    }

    load(icons, callback) {
        Column.icons = icons;

        if (localStorage.getItem("config")) {
            this._config = JSON.parse(localStorage.getItem("config"));
            this.generate();
            callback();
        } else {
            this._xhr.addEventListener("load", () => {
                this._config = JSON.parse(this._xhr.responseText);
                this.generate();
                callback();
            });
        }
    }

    add(column, url, name) {
        this.config[column].push({url, name});
    }

    change(column, rowIndex, url, name) {
        this.config[column][rowIndex] = {url, name};
    }

    addColumn(name) {
        this.config[name] = [];

        const col = new Column(this.config[name]);
        col.header = name;
        col.content = this.config[name];

        this.columns.push(col);
        this._container.appendChild(col.column);
    }

    localize() {
        localStorage.setItem("config", JSON.stringify(this.config));
    }
}
