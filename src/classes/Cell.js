export default class Cell {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.hasBomb = false;
        this.state = 'closed';
        this.el = undefined;
        this.bombsAround = 0;
    }

    // Открывает ячейку
    open() {
        if (this.state != 'closed') return;
        this.state = 'open';
        this.setClass();
        if (this.bombsAround === 0) {
            // Если у ячейки нет бомб в соседях, то открываем соседние
            let x = this.x, y = this.y;
            if(y > 0 && x > 0             && this.game.field[x-1][y-1].state === 'closed') this.game.field[x-1][y-1].open();
            if(y > 0                      && this.game.field[x]  [y-1].state === 'closed') this.game.field[x]  [y-1].open();
            if(y > 0 && x < this.game.W-1 && this.game.field[x+1][y-1].state === 'closed') this.game.field[x+1][y-1].open();

            if(x > 0             && this.game.field[x-1][y].state === 'closed') this.game.field[x-1][y].open();
            if(x < this.game.W-1 && this.game.field[x+1][y].state === 'closed') this.game.field[x+1][y].open();

            if(y < this.game.H-1 && x > 0             && this.game.field[x-1][y+1].state === 'closed') this.game.field[x-1][y+1].open();
            if(y < this.game.H-1                      && this.game.field[x]  [y+1].state === 'closed') this.game.field[x]  [y+1].open();
            if(y < this.game.H-1 && x < this.game.W-1 && this.game.field[x+1][y+1].state === 'closed') this.game.field[x+1][y+1].open();
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
        if (this.state == 'closed') {
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
