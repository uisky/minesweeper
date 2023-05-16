export default class Cell {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.hasBomb = false;
        this._state = 'closed';
        this.el = undefined;
        this.bombsAround = 0;
    }

    set state(val) {
        this._state = val;
        this.setClass();
    }

    get state() {
        return this._state;
    }

    // Возвращает массив своих соседей
    neighbours() {
        let neighbours = [];
        let x = this.x, y = this.y;
        if(this.game.valid(x-1, y-1)) neighbours.push(this.game.field[x-1][y-1]);
        if(this.game.valid(x, y-1))   neighbours.push(this.game.field[x]  [y-1]);
        if(this.game.valid(x+1, y-1)) neighbours.push(this.game.field[x+1][y-1]);

        if(this.game.valid(x-1, y)) neighbours.push(this.game.field[x-1][y]);
        if(this.game.valid(x+1, y)) neighbours.push(this.game.field[x+1][y]);

        if(this.game.valid(x-1, y+1)) neighbours.push(this.game.field[x-1][y+1]);
        if(this.game.valid(x, y+1))   neighbours.push(this.game.field[x]  [y+1]);
        if(this.game.valid(x+1, y+1)) neighbours.push(this.game.field[x+1][y+1]);

        return neighbours;
    }

    // Открывает ячейку
    open() {
        if (this.state != 'closed') return;
        this.state = 'open';
        if (this.bombsAround === 0) {
            // Если у ячейки нет бомб в соседях, то открываем соседние
            this.neighbours().forEach((el) => el.open());
        }
    }

    dom() {
        this.el = document.createElement('div');
        this.el.classList.add('cell', 'closed');
        this.el.dataset.x = this.x;
        this.el.dataset.y = this.y;
        return this.el;
    }

    setClass() {
        let classNames = ['cell'];
        if (this.state === 'closed') {
            classNames.push('closed');
        } else if (this.state === 'open') {
            classNames.push('open');
            classNames.push('open-' + this.bombsAround);
        } else if (this.state === 'exploded') {
            classNames.push('exploded');
        } else if (this.state === 'flagged') {
            classNames.push('flagged');
        }
        this.el.className = classNames.join(' ');
    }
}
