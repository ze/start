"use strict";
class Config {
    constructor() {
        this._xhr = new XMLHttpRequest();
        this._xhr.open("GET", "config.json", true);
        this._xhr.send();

        this._config = null;
        this._columns = [];
    }

    get config() {
        return this._config;
    }

    get columns() {
        return this._columns;
    }

    load(container, icons = false) {
        Column.icons = icons;

        this._xhr.addEventListener("load", () => {
            this._config = JSON.parse(this._xhr.responseText);

            var headers = Object.keys(this.config);

            for (let i = 0; i < headers.length; i++) {
                let col = new Column(this.config[headers[i]]);
                col.header = headers[i];
                col.content = this.config[headers[i]];

                this.columns.push(col);
                container.appendChild(col.column);
            }
        });
    }

    add(column, url, name) {
        this._config[column].push({url, name});
    }
}
