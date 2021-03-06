/**
 * @module levelProvider
 */

import Worker from '../objects/worker.js'
import Boxes, { addBox } from '../objects/boxes.js'
import Box from '../objects/box.js'
import { BOARD_DIMENSIONS } from '../constants.js'
import { readLevels } from '../storage/levelSaver.js'

/**
 * Format poziomu używany przez klasę {@link module:game#Game Game}.
 * @name module:levelProvider#Level
 * @typedef {{
 *          board: module:board#Board,
 *          worker: module:worker#Worker,
 *          boxes: module:boxes#Boxes
 *      }} module:levelProvider#Level
 */

/**
 * Wczytane poziomy z trybu 1, w postaci tekstu, podzielone na poziomy trudności.
 * Poziomy są wczytywane z assets\levels\levels_difficulty.json.
 * @see module:levelProvider#readLevelsByDifficulty
 * @name module:levelProvider#byDifficultyMode
 * @type {
 *      Array.<{
 *          string: Array.<{ name: string, data: string }>,
 *          string: Array.<{ name: string, data: string }>,
 *          string: Array.<{ name: string, data: string }>
 *      }>
 * }
 */
let byDifficultyMode = {
    easy: [],
    intermediate: [],
    hard: []
}
/**
 * Wczytane poziomy z trybu 2, w postaci tekstu.
 * Poziomy są wczytywane z assets\levels\levels_levels_mode.json.
 * @see module:levelProvider#readLevelsLevelsByLevelNumber
 * @name module:levelProvider#levelsMode
 * @type {
 *      Array.<{
 *          name: string,
 *          data: string
 *      }>
 * }
 */
let levelsMode = []
/**
 * Wczytane poziomy stworzone przez gracza z trybu 3, w postaci tekstu.
 * Poziomy są wczytywane z localStorage.
 * @see module:levelProvider#readCustomLevels
 * @name module:levelProvider#customLevels
 * @type {
 *      Array.<{
 *          name: string,
 *          data: string
 *      }>
 * }
 */
let customLevels = []

/**
 * Po włączeniu strony wczytuje poziomy.
 * @name module:levelProvider#LevelProvider
 */
export default class LevelProvider {
    /**
     * Zwraca Promise który wczytuje poziomy.
     * Poziomy do 1 i 2 trybu gry są wczytywane z assets\levels, a do 3 trybu z localStorage.
     * @returns {Promise} Promise wczytujący poziomy
     */
    constructor() {
        return new Promise(async (resolve, reject) => {
            try {
                readCustomLevels();

                await readLevelsByDifficulty();
                await readLevelsLevelsByLevelNumber();

                resolve();
            } catch(error) {
                reject(error);
            }
        });
    }
};

/**
 * Wczytuje poziomy z assets\levels\levels_levels_mode.json do 1 trybu gry i zapisuje je do tablicy {@link module:levelProvider#byDifficultyMode byDifficultyMode}.
 * @name module:levelProvider#readLevelsByDifficulty
 * @function
 */
export async function readLevelsByDifficulty() {
    await fetch('/assets/levels/levels_difficulty.json')
            .then(response => response.json())
            .then(levels => {
                Object.keys(byDifficultyMode).forEach(difficulty => {
                    Object.keys(levels[difficulty]).forEach(key => {
                        byDifficultyMode[difficulty].push({ 'name': key, 'data': levels[difficulty][key] })
                    });
                });
            });
}
/**
 * Wczytuje poziomy z assets\levels\levels_difficulty.json do 2 trybu gry i zapisuje je do tablicy {@link module:levelProvider#levelsMode levelsMode}.
 * @name module:levelProvider#readLevelsLevelsByLevelNumber
 * @function
 */
export async function readLevelsLevelsByLevelNumber() {
    await fetch('/assets/levels/levels_levels_mode.json')
            .then(response => response.json())
            .then(levels => {
                Object.keys(levels).forEach(key => {
                    levelsMode.push({ 'name': key, 'data': levels[key] });
                });
            });
}
/**
 * Wczytuje poziomy z localStorage do 3 trybu gry i zapisuje je do tablicy {@link module:levelProvider#customLevels customLevels}.
 * @name module:levelProvider#readCustomLevels
 * @function
 * @see module:levelSaver#readLevels
 */
export function readCustomLevels() { customLevels = readLevels() }

/**
 * Przyjmuje poziom w postaci tekstu i konwertuje go na {@link module:levelProvider#Level Level}.
 * @name module:levelProvider#convertToLevel
 * @function
 * @param {string} rawLevel - Poziom w postaci tekstu
 * @returns {module:levelProvider#Level} Poziom po konwersji
 */
function convertToLevel(rawLevel) {
    let row = 0;
    let column = 0;

    let board = new Array(BOARD_DIMENSIONS.y).fill('e').map(() => new Array(BOARD_DIMENSIONS.x).fill('e'));
    let worker = new Worker({ x: 0, y: 0 })
    let boxes = new Boxes();

    [...rawLevel].forEach(element => {
        if(column >= BOARD_DIMENSIONS.x) {
            column = 0;
            row ++;
        }

        switch(element) {
            case 'p':
                worker = new Worker({ x: column, y: row });
                board[row][column] = 'e'
                break;
            case 'b':
                addBox(boxes, new Box({ x: column, y: row }, false));
                board[row][column] = 'e';
                break;
            case 'h':
                addBox(boxes, new Box({ x: column, y: row }, true));
                board[row][column] = 't';
                break;
            default:
                board[row][column] = element
        }

        column ++
    });

    return {
        'board': board,
        'worker': worker,
        'boxes': boxes
    };
}

/**
 * Zwraca losowy poziom o podanym poziomie trudności, z 1 trybu gry.
 * @name module:levelProvider#getLevelByDifficulty
 * @function
 * @param {string} difficulty - Poziom trudności
 * @returns {{ name: string, level: Level }} Poziom z nazwą
 */
export function getLevelByDifficulty(difficulty) {
    let level = byDifficultyMode[difficulty][Math.floor(Math.random() * byDifficultyMode[difficulty].length)];
    
    return {
        'name': level['name'],
        'level': convertToLevel(level['data'])
    }
}
/**
 * Zwraca poziom o podanym numerze, z 2 trybu gry.
 * @name module:levelProvider#getLevelByLevelNumber
 * @function
 * @param {number} levelNumber - Numer poziomu
 * @returns {{ name: string, level: Level }} Poziom z nazwą
 */
export function getLevelByLevelNumber(levelNumber) {
    let level = levelsMode.length > levelNumber ? levelsMode[levelNumber]: levelsMode[levelsMode.length - 1];

    return {
        'name': level['name'],
        'level': convertToLevel(level['data'])
    }
}
/**
 * Zwraca poziom o podanej nazwie, z 3 trybu gry.
 * @name module:levelProvider#getCustomLevel
 * @function
 * @param {string} levelName - Nazwa poziomu
 * @returns {{ name: string, level: Level }} Poziom z nazwą
 */
export function getCustomLevel(levelName) {
    let level = customLevels.find(level => level['name'] == levelName);

    return {
        'name': level['name'],
        'level': convertToLevel(level['data'])
    }
}

/**
 * Zwraca nazwy wczytanych poziomów z 3 trybu gry.
 * @name module:levelProvider#getCustomLevelsNames
 * @function
 * @returns {Array.<string>} 
 */
export function getCustomLevelsNames() { return customLevels.map(level => level['name']) }