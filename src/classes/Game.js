import Cell from './Cell.js';
import Highscores from './Highscores.js'

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
        this.highscores = new Highscores();
        console.log(this.highscores.asArray());
    }

    set cntMoves(val) {
        this._cntMoves = val;
        this.elCntMoves.innerText = String(this.cntMoves);
    }

    get cntMoves() {
        return this._cntMoves;
    }

    set cntFlags(val) {
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

    restart() {
        this.initField();
        this.state = 'start';
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
        parent.append(this.elCntMoves);
        this.cntMoves = this.cntMoves;

        this.elGameDur = document.createElement('div');
        this.elGameDur.className = 'counter counter-game-dur';
        parent.append(this.elGameDur);
        this.gameDur = this.gameDur;

        this.elCntFlags = document.createElement('div');
        this.elCntFlags.className = 'counter counter-flags';
        parent.append(this.elCntFlags);
        this.cntFlags = this.cntFlags;

        this.elHighscores = document.createElement('div');
        parent.append(this.elHighscores);

        this.highscores.domContainer = this.elHighscores;
        this.highscores.render();
    }

    // Первый ход сделан
    firstMove(x, y) {
        this.putBombs(x, y);
        this.gameStart = new Date();
        this.gameDur = 0;
        this.ticker = setInterval(this.tick.bind(this), 1000);
        this.state = 'playing';
    }

    // Проверяет, не выиграли ли мы
    checkWin() {
        let cntNotOpened = 0;
        for (let x = 0; x < this.W; x++) {
            for (let y = 0; y < this.H; y++) {
                if (this.field[x][y].state !== 'open') cntNotOpened++;
            }
        }
        return cntNotOpened === this.cntBombs;
    }

    cellClick(e) {
        let x = e.target.dataset.x, y = e.target.dataset.y, cell = this.field[x][y];
        console.log('CELL CLICK: ', cell);

        // Если игра только началась, то расставляем бомбы
        if (this.state === 'start') {
            this.firstMove(x, y);
            this.cntMoves = 1;
            cell.open();
            if (this.checkWin()) {
                this.win();
            }
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
                    if (this.checkWin()) {
                        this.win();
                    }
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

    win() {
       clearInterval(this.ticker);
       setTimeout(() => {
            let name = prompt('Владимир Владимирович, как вас зовут?');
            this.highscores.record(name, this.gameDur, this.cntMoves);
            console.log(this.highscores.asArray());
            this.restart();
        }, 100);
    }
}