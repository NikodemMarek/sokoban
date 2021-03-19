import Game from './game/game.js'
import LevelProvider, { getLevelByDifficulty, getLevelByLevelNumber } from './board/levelProvider.js'
import { calculateScore } from './game/scoreCounter.js'
import ScoreHolder, { pushScore } from './board/scoreHolder.js'
import GameSaver, { saveGame } from './board/gameSaver.js';

const gamemodes = Object.freeze({
    BY_DIFFICULTY: 0,
    LEVELS: 1
});
let gamemode = gamemodes.BY_DIFFICULTY;

let canvas = document.getElementById('c_game_screen');
let context = canvas.getContext('2d');

new LevelProvider(() => {
    let selectedDifficulty = 'easy';
    let currentLevel = 0;

    let scoreHolder = new ScoreHolder();
    let gameSaver = new GameSaver();

    let movesUndone = 0;

    function onVictory(movesMade) {
        document.getElementById('b_next_level').style.display = 'inline';

        let score = calculateScore(1, movesMade, movesUndone);
        document.getElementById('s_total_score').innerText = pushScore(scoreHolder, currentLevel, score);

        return score;
    }

    let level = getLevelByDifficulty(selectedDifficulty)['level'];
    let game = new Game(context, JSON.parse(JSON.stringify(level)), onVictory);

    function resetGame() {
        movesUndone = 0;
        game = new Game(context, JSON.parse(JSON.stringify(level)), onVictory);
        game.start();
    }

    let levelsColors = [
        '#59b300', '#66cc00', '#73e600', '#80ec13', '#99f042', '#a6f655', '#d7fb6a',
        '#f0f986', '#ffff4d', '#ffff00', '#f2f20d', '#ffd11a', '#ffbf00', '#ff8000',
        '#ff4000', '#ff0000', '#e60000', '#cc0000', '#b30000', '#990000'
    ];

    let levelsMode = document.getElementById('levels_mode');
    for (let i = 1; i <= 20; i++) {
        let levelButton = document.createElement('button');
        levelButton.innerText = i;
        levelButton.style.width = '45px';
        levelButton.style.height = '45px';
        levelButton.style.border = 'none';
        levelButton.style.backgroundColor = levelsColors[i - 1];

        levelsMode.appendChild(levelButton);
    }

    // reset level button click listener
    document.getElementById('b_reset_level').addEventListener('click', () => {
        resetGame();
    });
    // undo move button click listener
    document.getElementById('b_undo_move').addEventListener('click', () => {
        game.undoMove();
        movesUndone++;
    });
    // get new random level
    document.getElementById('b_random_level').addEventListener('click', () => {
        level = getLevelByDifficulty(selectedDifficulty)['level'];
        resetGame();
    });
    document.getElementById('b_next_level').addEventListener('click', () => {
        level = getLevelByLevelNumber(++currentLevel)['level'];
        resetGame();
        document.getElementById('b_next_level').style.display = 'none';
    });
    document.getElementById('b_save_game').addEventListener('click', () => {
        game.stop();

        document.getElementById('menu').style.display = 'none';
        document.getElementById('save_menu').style.display = 'inline';
    });

    // set save name and save game
    document.getElementById('b_confirm_save').addEventListener('click', () => {
        saveGame(
            gameSaver,
            document.getElementById('i_save_name').value,
            currentLevel,
            game.worker,
            game.boxes,
            game.movesMade,
            movesUndone,
            scoreHolder.totalScore
        );

        document.getElementById('i_save_name').value = '';
        document.getElementById('menu').style.display = 'inline';
        document.getElementById('save_menu').style.display = 'none';

        game.start();
    });
    document.getElementById('b_cancel_save').addEventListener('click', () => {
        document.getElementById('i_save_name').value = '';
        document.getElementById('menu').style.display = 'inline';
        document.getElementById('save_menu').style.display = 'none';

        game.start();
    });

    // switch game mode, BY_DIFFICULTY -> LEVELS -> BY_DIFFICULTY
    document.getElementById('b_change_gamemode').addEventListener('click', () => {
        if (gamemode == gamemodes.BY_DIFFICULTY) {
            gamemode = gamemodes.LEVELS;
            document.getElementById('by_difficulty_mode').style.display = 'none';
            document.getElementById('levels_mode').style.display = 'inline';

            document.getElementById('b_random_level').style.display = 'none';

            document.getElementById('s_total_score').style.display = 'inline';
            document.getElementById('s_total_score_label').style.display = 'inline';

            document.getElementById('b_save_game').style.display = 'inline';

            level = getLevelByLevelNumber(0)['level'];
            resetGame();
        } else {
            gamemode = gamemodes.BY_DIFFICULTY;
            document.getElementById('by_difficulty_mode').style.display = 'inline';
            document.getElementById('levels_mode').style.display = 'none';

            document.getElementById('b_random_level').style.display = 'inline';
            document.getElementById('b_next_level').style.display = 'none';

            document.getElementById('s_total_score').style.display = 'none';
            document.getElementById('s_total_score_label').style.display = 'none';

            document.getElementById('b_save_game').style.display = 'none';
        }
    });

    // change difficulty level click listeners
    document.getElementById('easy_level').addEventListener('click', () => {
        selectedDifficulty = 'easy';
        level = getLevelByDifficulty('easy')['level'];
        resetGame();
    });
    document.getElementById('intermediate_level').addEventListener('click', () => {
        selectedDifficulty = 'intermediate';
        level = getLevelByDifficulty('intermediate')['level'];
        resetGame();
    });
    document.getElementById('hard_level').addEventListener('click', () => {
        selectedDifficulty = 'hard';
        level = getLevelByDifficulty('hard')['level'];
        resetGame();
    });

    game.start();
});