export default class Highscores {
    constructor(domContainer) {
        this.key = 'minesweeper_highscores';
        // [{when, name, duration, moves}, ...]
        this._data = undefined;
        this.domContainer = domContainer;
        this.load();
        if (this.domContainer) {
            this.render();
        }
    }

    load() {
        let raw_data = localStorage[this.key];
        if (raw_data) {
            this._data = JSON.parse(raw_data);
            this._data.forEach((el) => {el.when = new Date(el.when)});
            console.log('Parsed data: ', this._data);
        } else {
            this._data = [];
        }
    }

    save() {
        localStorage[this.key] = JSON.stringify(this._data);
    }

    render() {
        this.domContainer.innerHTML = '';
        let table = document.createElement('table'), tr, td;
        for (let record of this._data) {
            tr = document.createElement('tr');

            td = document.createElement('td');
            td.innerText = record.when;
            tr.append(td);

            td = document.createElement('td');
            td.innerText = record.name;
            tr.append(td);

            td = document.createElement('td');
            td.innerText = record.moves;
            tr.append(td);

            td = document.createElement('td');
            td.innerText = record.duration;
            tr.append(td);

            table.append(tr);
        }

        this.domContainer.append(table);
    }

    record(name, duration, moves) {
        let record = {
            when: new Date(),
            name: name,
            duration: duration,
            moves: moves
        }
        this._data.push(record);
        this.save();
        this.render();
    }

    asArray() {
        return this._data;
    }
}