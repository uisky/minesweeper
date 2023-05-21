import Game from './classes/Game.js';

window.onload = () => {
    const game = new Game();
    game.start(11, 14, 3);
}