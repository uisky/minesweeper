export default class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hasBomb = false;
        this.state = 'closed';
        this.el = undefined;
        this.bombsAround = 0;
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
