import Game from './classes/Game.js';

window.onload = () => {
    const game = new Game(10, 10, 10);
    game.start();
}