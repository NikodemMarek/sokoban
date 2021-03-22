import Game, { start as startGame, stop as stopGame, undoMove } from '/src/game/game.js'
import LevelProvider, { getLevelByDifficulty, getLevelByLevelNumber } from '/src/board/levelProvider.js'
import { calculateScore } from '/src/game/scoreCounter.js'
import ScoreHolder, { pushScore, removeScore } from '/src/board/scoreHolder.js'
import { saveGame, readGames } from '/src/board/gameSaver.js'
import CanvasImage from '/src/canvas/canvasImage.js'
import { readScoreboard, updateScoreboard } from '/src/scoreboard.js'

new LevelProvider(() => {
    const gamemodes = Object.freeze({
        BY_DIFFICULTY: 0,
        LEVELS: 1,
        CUSTOM: 2
    });
    let gamemode = gamemodes.BY_DIFFICULTY;
    
    // html elements
    let canvas = document.getElementById('c_game_screen');

    let menu = document.getElementById('menu');

    let saveMenu = document.getElementById('save_menu');
    let savesList = document.getElementById('saves_list');
    let nameSaveForm = document.getElementById('name_save');
    let iSaveName = document.getElementById('i_save_name');
    let bConfirmSave = document.getElementById('b_confirm_save');
    let bCancelSave = document.getElementById('b_cancel_save');
    
    let scoreboardMenu = document.getElementById('scoreboard_menu');
    let scoresList = document.getElementById('scores_list');
    let nameScoreForm = document.getElementById('name_score');
    let iScoreName = document.getElementById('i_score_name');
    let bSubmitScore = document.getElementById('b_submit_score');
    let bCloseScoreboard = document.getElementById('b_close_scoreboard');

    let sTotalScore = document.getElementById('s_total_score');
    let sTotalScoreLabel = document.getElementById('s_total_score_label');

    let bResetLevel = document.getElementById('b_reset_level');
    let bUndoMove = document.getElementById('b_undo_move');
    let bChangeGamemode = document.getElementById('b_change_gamemode');
    
    let bRandomLevel = document.getElementById('b_random_level');

    let bNextLevel = document.getElementById('b_next_level');
    let bSaveGame = document.getElementById('b_save_game');
    let bReadGame = document.getElementById('b_read_game')
    let bOpenScoreboard = document.getElementById('b_open_scoreboard');

    let bCreateLevel = document.getElementById('b_create_level');

    let byDifficultyModeMenu = document.getElementById('by_difficulty_mode');
    let bEasyLevel = document.getElementById('easy_level');
    let bIntermediateLevel = document.getElementById('intermediate_level');
    let bHardLevel = document.getElementById('hard_level');
    
    let levelsModeMenu = document.getElementById('levels_mode');

    let context = canvas.getContext('2d');
    
    let canvasImage = new CanvasImage(context);

    let selectedDifficulty = 'easy';
    let currentLevel = 0;

    let scoreHolder = new ScoreHolder();

    let movesUndone = 0;

    let level
    let game
    
    let levelsColors = [
        '#59b300', '#66cc00', '#73e600', '#80ec13', '#99f042',
        '#a6f655', '#d7fb6a', '#f0f986', '#ffff4d', '#ffff00',
        '#f2f20d', '#ffd11a', '#ffbf00', '#ff8000', '#ff4000',
        '#ff0000', '#e60000', '#cc0000', '#b30000', '#990000'
    ];

    function setGamemode(gamemodeToSet) {
        switch(gamemode) {
            case gamemodes.BY_DIFFICULTY:
                byDifficultyModeMenu.style.display = 'none';
                bRandomLevel.style.display = 'none';
                break;
            case gamemodes.LEVELS:
                levelsModeMenu.style.display = 'none';

                sTotalScore.style.display = 'none';
                sTotalScoreLabel.style.display = 'none';
                
                bNextLevel.style.display = 'none';
                bSaveGame.style.display = 'none';
                bReadGame.style.display = 'none';
                bOpenScoreboard.style.display = 'none';
                break;
            case gamemodes.CUSTOM:
                break;
        }

        gamemode = gamemodeToSet;
        switch(gamemode) {
            case gamemodes.BY_DIFFICULTY:
                byDifficultyModeMenu.style.display = 'inline';
                bRandomLevel.style.display = 'inline';
                
                level = getLevelByDifficulty(selectedDifficulty)['level'];
                resetGame();
                break;
            case gamemodes.LEVELS:
                levelsModeMenu.style.display = 'inline';
    
                sTotalScore.style.display = 'inline';
                sTotalScoreLabel.style.display = 'inline';
    
                bRandomLevel.style.display = 'none';
                bSaveGame.style.display = 'inline';
                bReadGame.style.display = 'inline';
                bOpenScoreboard.style.display = 'inline';

                level = getLevelByLevelNumber(0)['level'];
                resetGame();
                break;
            case gamemodes.CUSTOM:
                break;
        }
    }

    function openScoreboard() {
        stopGame(game);

        menu.style.display = 'none';
        scoreboardMenu.style.display = 'inline';

        while(scoresList.firstChild) scoresList.removeChild(scoresList.firstChild);

        readScoreboard().forEach((score, index) => {
            let scoreButton = document.createElement('button');
            scoreButton.innerText = index + 1 + '. ' + score['name'] + ' - ' + score['score'];
            scoreButton.style.width = '200px';
            scoreButton.style.height = '50px';
            scoreButton.style.border = 'none';
            scoreButton.style.backgroundColor = 'gray';
    
            scoresList.appendChild(scoreButton);
        });

        bSubmitScore.addEventListener('click', () => {
            if(iScoreName.value != '') updateScoreboard(iScoreName.value, scoreHolder.totalScore);
            menu.style.display = 'inline';
            scoreboardMenu.style.display = 'none';
            iScoreName.value = '';

            startGame(game);
        });
        bCloseScoreboard.addEventListener('click', () => {
            menu.style.display = 'inline';
            scoreboardMenu.style.display = 'none';
            iScoreName.value = '';
    
            startGame(game);
        });
    }

    function onVictory(movesMade, movesUndone) {
        if(gamemode == gamemodes.LEVELS) bNextLevel.style.display = 'inline';

        let score = calculateScore(1, movesMade, movesUndone);
        sTotalScore.innerText = pushScore(scoreHolder, currentLevel, score);

        return score;
    }

    function resetGame() {
        stopGame(game);
        game = new Game(context, canvasImage, JSON.parse(JSON.stringify(level)), onVictory);
        startGame(game);
    }

    function init() {
        level = getLevelByDifficulty(selectedDifficulty)['level'];
        game = new Game(context, canvasImage, JSON.parse(JSON.stringify(level)), onVictory);

        for(let i = 1; i <= 20; i ++) {
            let levelButton = document.createElement('button');
            levelButton.innerText = i;
            levelButton.style.width = '45px';
            levelButton.style.height = '45px';
            levelButton.style.border = 'none';
            levelButton.style.backgroundColor = levelsColors[i - 1];
    
            levelsModeMenu.appendChild(levelButton);
        }
    
        startGame(game);
    }

    // reset level button click listener
    bResetLevel.addEventListener('click', () => {
        if(gamemode == gamemodes.LEVELS) {
            removeScore(scoreHolder, currentLevel);
            sTotalScore.innerText = scoreHolder.totalScore;
        }
        resetGame();
    });
    // undo move button click listener
    bUndoMove.addEventListener('click', () => {
        undoMove(game);
    });
    // get new random level
    bRandomLevel.addEventListener('click', () => {
        level = getLevelByDifficulty(selectedDifficulty)['level'];
        resetGame();
    });
    bNextLevel.addEventListener('click', () => {
        level = getLevelByLevelNumber(++ currentLevel)['level'];
        resetGame();
        bNextLevel.style.display = 'none';
    });
    bSaveGame.addEventListener('click', () => {
        stopGame(game);

        menu.style.display = 'none';
        saveMenu.style.display = 'inline';
        nameSaveForm.style.display = 'inline';

        while(savesList.firstChild) savesList.removeChild(savesList.firstChild);

        readGames().forEach(save => {
            let saveButton = document.createElement('button');
            saveButton.innerText = save['name'];
            saveButton.style.width = '200px';
            saveButton.style.height = '50px';
            saveButton.style.border = 'none';
            saveButton.style.backgroundColor = 'gray';

            saveButton.addEventListener('mouseenter', () => {
                saveButton.style.backgroundColor = 'gainsboro';
            });
            saveButton.addEventListener('mouseleave', () => {
                saveButton.style.backgroundColor = 'gray';
            });

            saveButton.addEventListener('click', () => {
                iSaveName.value = save['name'];
            });
    
            savesList.appendChild(saveButton);
        });

        // set save name and save game
        bConfirmSave.addEventListener('click', () => {
            if(iSaveName.value != '') saveGame(
                iSaveName.value,
                currentLevel,
                game.worker,
                game.boxes,
                game.movesMade,
                movesUndone,
                scoreHolder.totalScore
            );
    
            iSaveName.value = '';
            menu.style.display = 'inline';
            saveMenu.style.display = 'none';
            nameSaveForm.style.display = 'none';
    
            startGame(game);
        });
        bCancelSave.addEventListener('click', () => {
            iSaveName.value = '';
            menu.style.display = 'inline';
            saveMenu.style.display = 'none';
            nameSaveForm.style.display = 'none';
    
            startGame(game);
        });
    });
    bReadGame.addEventListener('click', () => {
        stopGame(game);

        menu.style.display = 'none';
        saveMenu.style.display = 'inline';

        while(savesList.firstChild) savesList.removeChild(savesList.firstChild);

        readGames().forEach(save => {
            let saveButton = document.createElement('button');
            saveButton.innerText = save['name'];
            saveButton.style.width = '200px';
            saveButton.style.height = '50px';
            saveButton.style.border = 'none';
            saveButton.style.backgroundColor = 'gray';

            saveButton.addEventListener('mouseenter', () => {
                saveButton.style.backgroundColor = 'gainsboro';
            });
            saveButton.addEventListener('mouseleave', () => {
                saveButton.style.backgroundColor = 'gray';
            });

            saveButton.addEventListener('click', () => {
                menu.style.display = 'inline';
                saveMenu.style.display = 'none';

                let saveData = JSON.parse(save['data']);
                
                scoreHolder.score = saveData['score'];

                level = getLevelByLevelNumber(saveData['currentLevel'])['level'];
                game = new Game(
                    context,
                    canvasImage,
                    {
                        'board': level['board'],
                        'worker': saveData['worker'],
                        'boxes': saveData['boxes']
                    },
                    onVictory,
                    saveData['movesMade'],
                    saveData['movesUndone']
                );
                sTotalScore.innerText = scoreHolder.score;

                startGame(game);
            });
    
            savesList.appendChild(saveButton);
        });

        bCancelSave.addEventListener('click', () => {
            menu.style.display = 'inline';
            saveMenu.style.display = 'none';
    
            startGame(game);
        });
    });
    bOpenScoreboard.addEventListener('click', openScoreboard);

    // switch game mode, BY_DIFFICULTY -> LEVELS -> CUSTOM -> BY_DIFFICULTY
    bChangeGamemode.addEventListener('click', () => {
        switch(gamemode) {
            case gamemodes.BY_DIFFICULTY:
                setGamemode(gamemodes.LEVELS);
                break;
            case gamemodes.LEVELS:
                setGamemode(gamemodes.CUSTOM);
                break;
            case gamemodes.CUSTOM:
                setGamemode(gamemodes.BY_DIFFICULTY);
                break;
        }
    });

    // change difficulty level click listeners
    bEasyLevel.addEventListener('click', () => {
        selectedDifficulty = 'easy';
        level = getLevelByDifficulty('easy')['level'];
        resetGame();
    });
    bIntermediateLevel.addEventListener('click', () => {
        selectedDifficulty = 'intermediate';
        level = getLevelByDifficulty('intermediate')['level'];
        resetGame();
    });
    bHardLevel.addEventListener('click', () => {
        selectedDifficulty = 'hard';
        level = getLevelByDifficulty('hard')['level'];
        resetGame();
    });

    init();
});