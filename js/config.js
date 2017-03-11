"use strict";
class Config {
    constructor(container) {
        this._xhr = new XMLHttpRequest();
        this._xhr.open("GET", "config.json", true);
        this._xhr.send();

        this._container = container;

        this._config = null;
        this._columns = [];
    }

    get config() {
        return this._config;
    }

    get columns() {
        return this._columns;
    }

    load(icons = false) {
        Column.icons = icons;

        this._xhr.addEventListener("load", () => {
            this._config = JSON.parse(this._xhr.responseText);

            var headers = Object.keys(this.config);

            for (let i = 0; i < headers.length; i++) {
                let col = new Column(this.config[headers[i]]);
                col.header = headers[i];
                col.content = this.config[headers[i]];

                this.columns.push(col);
                this._container.appendChild(col.column);
            }
        });
    }

    add(column, url, name) {
        this.config[column].push({url, name});
    }

    addColumn(name) {
        this.config[name] = [];

        let col = new Column(this.config[name]);
        col.header = name;
        col.content = this.config[name];

        this.columns.push(col);
        this._container.appendChild(col.column);
    }
}
