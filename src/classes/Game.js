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
        this._cntMoves = 0;
        this._cntFlags = 0;
        this.gameStart = undefined;
        this._gameDur = 0;
        this.ticker = undefined;
    }

    set cntMoves(val) {
        this._cntMoves = val;
        this.elCntMoves.innerText = String(this.cntMoves);
    }

    get cntMoves() {
        return this._cntMoves;
    }

    set cntFlags(val) {
        console.log('cntFlags set', val);
        this._cntFlags = val;
        this.elCntFlags.innerText = String(this.cntFlags);
    }

    get cntFlags() {
        return this._cntFlags;
    }

    set gameDur(val) {
        this._gameDur = val;
        this.elGameDur.innerText = String(this.gameDur);
    }

    get gameDur() {
        return this._gameDur;
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
                this.field[x][y] = new Cell(this, x, y);
            }
        }
        console.log('FIELD: ', this.field);
    }

    /* Проверяет, что координаты (x, y) находятся внутри игрового поля */
    valid(x, y) {
        return x >= 0 && x < this.W && y >= 0 && y < this.H;
    }

    /* Возвращает 1, если в клетке (x, y) есть бомба, и 0, если её там нет или координаты вне игрового поля */
    check(x, y) {
        if (!this.valid(x, y)) return 0;
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
                this.field[x][y].neighbours().forEach((el) => {el.bombsAround++})
            }
        }

        console.log('FIELD w/bombs: ', this.field);
    }

    render() {
        console.log('Game.render()');
        this.renderField(document.body);
        this.renderInfo(document.body);
    }

    renderField(parent) {
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

        parent.append(this.elField);
    }

    renderInfo(parent) {
        this.elCntMoves = document.createElement('div');
        this.elCntMoves.className = 'counter counter-moves';
        this.elCntMoves.innerText = String(this.cntMoves);
        parent.append(this.elCntMoves);

        this.elGameDur = document.createElement('div');
        this.elGameDur.className = 'counter counter-game-dur';
        this.elGameDur.innerText = String(this.cntMoves);
        parent.append(this.elGameDur);

        this.elCntFlags = document.createElement('div');
        this.elCntFlags.className = 'counter counter-flags';
        this.elCntFlags.innerText = String(this.cntFlags);
        parent.append(this.elCntFlags);
    }

    // Первый ход сделан
    firstMove(x, y) {
        this.putBombs(x, y);
        this.gameStart = new Date();
        this.gameDur = 0;
        this.ticker = setInterval(this.tick.bind(this), 1000);
        this.cntMoves = 1;
        this.state = 'playing';
    }

    cellClick(e) {
        let x = e.target.dataset.x, y = e.target.dataset.y, cell = this.field[x][y];
        console.log('CELL CLICK: ', cell);

        // Если игра только началась, то расставляем бомбы
        if (this.state === 'start') {
            this.firstMove(x, y);
            cell.open();
        } else if (this.state === 'playing') {
            // Кликнули на закрытую ячейку
            if (cell.state === 'closed') {
                this.cntMoves++;
                if (cell.hasBomb) {
                    // Попали на бомбу, проиграли
                    cell.state = 'exploded'
                    this.state = 'lost';
                    clearInterval(this.ticker);
                } else {
                    // Открываем
                    cell.open();
                }
            }
        }
    }

    cellRightClick(e) {
        e.preventDefault();
        let x = e.target.dataset.x, y = e.target.dataset.y, cell = this.field[x][y];
        console.log('CELL RIGHT CLICK: ', cell);
        if (this.state === 'start') {
            this.firstMove();
            if (cell.state === 'closed') {
                cell.state = 'flagged';
                this.cntFlags++;
            } else if (cell.state == 'flagged') {
                cell.state = 'closed';
                this.cntFlags--;
            }
        } else if (this.state === 'playing') {
            if (cell.state === 'closed') {
                cell.state = 'flagged';
                this.cntFlags++;
            } else if (cell.state == 'flagged') {
                cell.state = 'closed';
                this.cntFlags--;
            }
        }
    }

    tick() {
        this.gameDur = Math.round((new Date() - this.gameStart) / 1000);
    }
}