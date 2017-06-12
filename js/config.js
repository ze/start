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

        for (const head of headers) {
            const col = new Column(this.config[head]);
            col.content = this.config[head];
            col.header = head;

            this.columns.push(col);
            this._container.appendChild(col.column);
        }
    }

    load(callback) {
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

    clearContainer() {
        this._container.innerHTML = "";
    }
}
