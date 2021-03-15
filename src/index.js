import Game from './game/game.js';
import LevelProvider, { getLevelByDifficulty } from './board/levelProvider.js'

let canvas = document.getElementById('gameScreen');
let context = canvas.getContext('2d');

new LevelProvider(() => {
    let game
    let level = getLevelByDifficulty('easy')['level'];

    let resetLevel = function() {
        game = new Game(context, JSON.parse(JSON.stringify(level)));
        game.start();
    }

    // reset level button click listener
    document.getElementById('resetLevel').addEventListener('click', resetLevel);

    // change difficulty level click listeners
    document.getElementById('easyLevel').addEventListener('click', () => {
        level = getLevelByDifficulty('easy')['level'];
        resetLevel();
    });
    document.getElementById('intermediateLevel').addEventListener('click', () => {
        level = getLevelByDifficulty('intermediate')['level'];
        resetLevel();
    });
    document.getElementById('hardLevel').addEventListener('click', () => {
        level = getLevelByDifficulty('hard')['level'];
        resetLevel();
    });

    resetLevel();
});