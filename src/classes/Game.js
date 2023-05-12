import Cell from './Cell.js';

export default class Game {
    constructor(w, h, cntBombs) {
        console.log('Game.constructor()');
        if (w * h < cntBombs) {
            throw new Error(`На поле ${w} x ${h} клеток не может быть ${cntBombs} бомб, ёбнутая вы по ебальнику ебанашка!`);
        }
        this.W = w;
        this.H = h;
        this.cntBombs = cntBombs;
        this.field = Array();
        this.state = 'start';
        this.cntMoves = 0;
        this.gameStart = undefined;
        this.gameDur = 0;
    }

    start() {
        console.log('Game.start()');
        this.initField();
        this.render();
    }

    initField() {
        console.log('Game.initField()');
        this.field = Array();
        for (let x = 0; x < this.W; x++) {
            this.field[x] = Array();
            for (let y = 0; y < this.H; y++) {
                this.field[x][y] = new Cell(x, y);
            }
        }
        console.log('FIELD: ', this.field);
    }

    check(x, y) {
        if (x < 0 || x >= this.W || y < 0 || y >= this.H) return 0;
        else return this.field[x][y].hasBomb ? 1 : 0;
    }

    putBombs(exceptX, exceptY) {
        console.log('Game.putBombs(%d, %d)', exceptX, exceptY);
        // Ставим бомбы
        let fuze = 1000;
        let cnt = this.cntBombs;
        while(cnt && fuze--) {
            let x = Math.floor(Math.random() * this.W);
            let y = Math.floor(Math.random() * this.H);
            if (!this.field[x][y].hasBomb && x !== exceptX && y !== exceptY) {
                this.field[x][y].hasBomb = true;
                cnt--;
            }
        }

        // Считаем соседей
        for (let x = 0; x < this.W; x++) {
            for (let y = 0; y < this.H; y++) {
                let cnt = this.check(x - 1, y - 1) + this.check(x, y - 1) + this.check(x + 1, y - 1) +
                          this.check(x - 1, y) + this.check(x + 1, y) +
                          this.check(x - 1, y + 1) + this.check(x, y + 1) + this.check(x + 1, y + 1);
                this.field[x][y].bombsAround = cnt;
            }
        }
        
        console.log('FIELD w/bombs: ', this.field);
    }

    render() {
        console.log('Game.render()');
        this.elField = document.createElement('div');
        this.elField.classList.add('field');

        for (let y = 0; y < this.H; y++) {
            let elRow = document.createElement('div');
            elRow.classList.add('row');
            for (let x = 0; x < this.W; x++) {
                let elCell = this.field[x][y].dom();
                elCell.onclick = this.cellClick.bind(this);
                elCell.oncontextmenu = this.cellRightClick.bind(this);
                elRow.append(elCell);
            }
            this.elField.append(elRow);
        }

        document.body.append(this.elField);
    }

    cellClick(e) {
        let x = e.target.dataset.x, y = e.target.dataset.y, cell = this.field[x][y];
        console.log('CELL CLICK: ', cell);

        // Если игра только началась, то расставляем бомбы
        if (this.state === 'start') {
            this.putBombs(x, y);
            this.state = 'playing';
            cell.state = 'open';
            cell.setClass();
        } else if (this.state === 'playing') {
            // Кликнули на закрытую ячейку
            if (cell.state === 'closed') {
                if (cell.hasBomb) {
                    // Попали на бомбу, проиграли
                    cell.state = 'exploded'
                } else {
                    // Открываем
                    cell.state = 'open';
                }
                cell.setClass();
            }
        }

    }

    cellRightClick(e) {
        e.preventDefault();
        let x = e.target.dataset.x, y = e.target.dataset.y, cell = this.field[x][y];
        console.log('CELL CLICK: ', cell);
        if (cell.state === 'closed') {
            cell.state = 'flagged';
        } else if (cell.state == 'flagged') {
            cell.state = 'closed';
        }
        cell.setClass();
    }
}