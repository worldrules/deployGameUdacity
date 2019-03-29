"use strict";
// Predefined variables that will be used to define different objects.
var NUM_ROWS = 8; // Number of rows on the board
var NUM_COLS = 7; // Number of columns on the board

// Array of possible speed of enemies
var enemySpeed = [
    1,
    1.3,
    1.6,
    1.9,
    2.2,
    2.5,
    2.8,
    3.1,
    3.4,
    3.7,
    4.0,
    4.2,
    4.4,
    4.6
];

// Array that stores three different types of blocks to draw the board
var boardImg = [
    "images/grass-block.png",
    "images/stone-block.png",
    "images/water-block.png"
];

// This function generates a random integer numbers between min and max (inclusive).
var randomGenerator = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

// This function draws object (img) on the correct position on the board
// using row, col and offset.
var drawRowCol = function (img, row, col, offset) {
    ctx.drawImage(Resources.get(img), col * 101, row * 83 - offset);
};

// Pseudoclassical inheritance
// SubClass will inherit from superClass
Function.prototype.inheritsFrom = function (superClass) {
    this.prototype = Object.create(superClass.prototype); // Delegate to prototype
    this.prototype.constructor = this; // Set constructor on prototype
};

// Game object stores various information regarding the game.
// board : An array that stores the layout of the current game board
// currentLevel : Stores what level the user is currently playing
// loading : Boolean variable storing if the level is loading
// gemCount : Number of gems collected in the current level
// life : Number of lives left for the user
// score : The current total score
// toast : Boolean variable storing if there is any toast message to display
var Game = function () {
    this.board = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];
    this.currentLevel = 1;
    this.loading = true;
    this.gemCount = 0;
    this.life = 3;
    this.score = 0;
    this.toast = false;

    Game.prototype.resetGame = function (heart, gem, key, player) {
        heart.reset();
        //Reseta as gemas , a chave , e o player;
        gem.reset();
        key.reset();
        player.reset();
    }
};

// Reset all the variables associated with Game object upon restart of the game
Game.prototype.reset = function () {
    this.resetBoard();
    this.currentLevel = 1;
    this.loading = true;
    this.gemCount = 0;
    this.life = 3;
    this.score = 0;
    this.toast = false;
};

// Draws board on the canvas according to the this.board array
Game.prototype.renderBoard = function (ctx) {
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draws board
    for (var row = 0; row < NUM_ROWS; row++) {
        for (var col = 0; col < NUM_COLS; col++) {
            drawRowCol(boardImg[this.board[row][col]], row, col, 0);
        }
    }

    // Draws number of life left
    for (var i = 0; i < this.life; i++) {
        ctx.drawImage(Resources.get("images/Heart.png"), i * 45 + 10, 0, 40, 45);
    }

    ctx.font = "20pt impact";
    ctx.textAlign = "left";

    ctx.fillStyle = "red";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    // Displays the total score
    var line = "Score: " + this.score;
    ctx.fillText(line, 580, 35);
    ctx.strokeText(line, 580, 35);

    // Displays the number of gems left to collect to clear the level
    line = this.currentLevel - this.gemCount + " Gem Left";
    ctx.fillText(line, 295, 35);
    ctx.strokeText(line, 295, 35);
};

// Resets the game board to the default state without any water blocks
Game.prototype.resetBoard = function () {
    this.board = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];
};

// Creates a water block on the board while avoiding any duplication
Game.prototype.createWater = function () {
    var row = randomGenerator(1, 6);
    var col = randomGenerator(0, 6);
    while (this.board[row][col] === 2) {
        row = randomGenerator(1, 6);
        col = randomGenerator(0, 6);
    }
    this.board[row][col] = 2;
};

// Initializes some variables to prepare for the next level
Game.prototype.nextLevelInitiation = function () {
    // Reset number of gems collected to zero for the next level
    this.gemCount = 0;

    // Resets the game board to the default by calling resetBoard() function
    // Then create the same number of water blocks on the board as the level
    this.resetBoard();
    for (i = 0; i < this.currentLevel; i++) {
        this.createWater();
    }

    // Upon finishing the preparation for the next level, change back this.loading to
    // false and this.toast to false.
    this.loading = false;
    this.toast = false;
};

// If player dies by either colliding with an enemy or falling into water,
// decrease number of life left by one and deduct total score by 30.
// Then reset the position of the player to its initial position by calling
// player.reset() function.
Game.prototype.playerDead = function () {
    this.life -= 1;
    this.score -= 30;
};

// GameObject Superclass that defines variables and methods that are common to all
// objects of the game.
// param: image(image of the object), row & col (position of the object)
// Subclasses: Enemy, Player, GameStaticObject
var GameObject = function (image, row, col) {
    this.sprite = image;
    this.row = row;
    this.col = col;
};

// Draw the game object correctly on the canvas by calling drawRowCol function
GameObject.prototype.render = function () {
    drawRowCol(this.sprite, this.row, this.col, 22);
};

// Enemy creates an object that the player should avoid.
// Superclass: GameObject
var Enemy = function () {
    // Construct an enemy with variables that inherits from GameObject
    // by calling .call with appropriate image, row number that is randomly
    // generated between 2 and 5 and column number of -1
    GameObject.call(this, "images/enemy-bug.png", randomGenerator(2, 5), -1);

    // speed is unique to enemy only. randomly generate speed from the enemySpeed array
    this.speed = enemySpeed[randomGenerator(0, 4 + game.currentLevel)];
};

// Enemy inherits methods (render) from GameObject
Enemy.inheritsFrom(GameObject);

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.col = this.col + this.speed * dt;

    // If the enemy reaches the end of the board, reset its position by calling .reset()
    if (this.col > 7) {
        this.reset();
    }
};

// Reset the position and speed of the Enemy
Enemy.prototype.reset = function () {
    this.col = -1;
    this.row = randomGenerator(2, 5);
    this.speed = enemySpeed[randomGenerator(0, 4 + game.currentLevel)];
};

// Player object is created with variables that inherits from GameObject
// by calling .call with appropriate image, row number and column number.
// Superclass: GameObject
var Player = function () {
    GameObject.call(this, "images/char-boy.png", 7, 3);
};

// Player inherits methods (render) from GameObject
Player.inheritsFrom(GameObject);

// Reset the position of the Player to initial position
Player.prototype.reset = function () {
    this.row = 7;
    this.col = 3;
};

// Handles keyboard input and move the Player object accordingly
// param: ctrKey
Player.prototype.handleInput = function (ctrKey) {
    switch (ctrKey) {
        case "left":
            // If user press the left key, move the player one column to the left unless
            // the player is at the leftmost column.
            if (this.col > 0) this.col -= 1;
            break;
        case "right":
            // If user press the right key, move the player one column to the right unless
            // the player is at the rightmost column.
            if (this.col < 6) this.col += 1;
            break;
        case "up":
            // If user press the up key, move the player one row up unless
            // the player is at the top row.
            if (this.row > 0) this.row -= 1;
            break;
        case "down":
            // If user press the down key, move the player one row down unless
            // the player is at the bottom row.
            if (this.row < 7) this.row += 1;
            break;
    }
};

// GameStaticObject defines variables and methods that are common to all
// static objects of the game (collectable items).
// param: image(image of the object), score(how much the object worth)
// Superclass: GameObject
// Subclasses: Gem, Key, Heart
var GameStaticObject = function (image, score) {
    // Construct a GameStaticObject with variables that inherits from GameObject
    // by calling .call with appropriate image and row and column numbers that are
    // randomly generated between 1 and 6.
    GameObject.call(this, image, randomGenerator(1, 6), randomGenerator(0, 6));

    // scoreValue is unique to GameStaticObjects.
    this.scoreValue = score;
};

// GameStaticObject inherits methods (render) from GameObject
GameStaticObject.inheritsFrom(GameObject);

// Reset the position of the GameStaticObject to a random position while making sure
// that the new position does not overlap with a water block.
GameStaticObject.prototype.reset = function () {
    this.row = randomGenerator(1, 6);
    this.col = randomGenerator(0, 6);
    while (game.board[this.row][this.col] === 2) {
        this.row = randomGenerator(1, 6);
        this.col = randomGenerator(0, 6);
    }
};

// Check if the player collected the GameStaticObject. If so, increase the total score
// by the scoreValue of the object and reset the position of the object.
// Then, return true. Otherwise, return false.
// param: game, player
GameStaticObject.prototype.checkGet = function (game, player) {
    if (this.row === player.row && this.col === player.col) {
        game.score += this.scoreValue;
        this.reset();
        return true;
    }

    return false;
};

// Gem object is created with variables that inherits from GameStaticObject
// by calling .call with appropriate image and score value of 15 for the gem.
// Superclass: GameStaticObject
var Gem = function () {
    GameStaticObject.call(this, "images/gem-orange.png", 15);
};

// Gem inherits methods (reset) from GameStaticObject.
// In consequence, as GameStaticObject inherits methods (render) from GameObejct,
// Gem inherits those methods from GameObject, too.
Gem.inheritsFrom(GameStaticObject);

// Key object is created with variables that inherits from GameStaticObject
// by calling .call with appropriate image and score value of 20 for the Key.
// Superclass: GameStaticObject
var Key = function () {
    GameStaticObject.call(this, "images/Key.png", 25);
};

// Key inherits methods (reset) from GameStaticObject.
// In consequence, as GameStaticObject inherits methods (render) from GameObejct,
// Key inherits those methods from GameObject, too.
Key.inheritsFrom(GameStaticObject);

// Heart object is created with variables that inherits from GameStaticObject
// by calling .call with appropriate image and score value of 15 for the Heart.
// Superclass: GameStaticObject
var Heart = function () {
    GameStaticObject.call(this, "images/Heart.png", 20);

    // As Heart object is a temporary object, that will be randomly chosen to appear
    // on the board, it has its unique property called present. As a default,
    // the heart is hidden from the board.
    this.present = false;
};

// Heart inherits methods (reset) from GameStaticObject.
// In consequence, as GameStaticObject inherits methods (render) from GameObejct,
// Heart inherits those methods from GameObject, too.
Heart.inheritsFrom(GameStaticObject);

// generate function randomly determines whether or not to display Heart object
// on the screen.
Heart.prototype.generate = function (level) {
    // As the game level increases, the Heart object will appear more often on the
    // screen. If the player has 6 lives left, no more heart will be generated.
    if (randomGenerator(0, ((14 - level) / 4) * 1200) === 0 && game.life < 6) {
        this.present = true;
    } else {
        this.present = false;
    }
};

// Instantiation of all objects required for the game.
var game = new Game();
var player = new Player();
var gem = new Gem();
var key = new Key();
var heart = new Heart();
var allEnemies = [];

// Five new enemies are generated and stored in an array called all Enemies.
for (var i = 0; i < 4; i++) {
    allEnemies.push(new Enemy());
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener("keyup", function (e) {
    var allowedKeys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

// This disables the original functionalities of some keyboard keys(left, up, right, down, enter).
document.addEventListener(
    "keydown",
    function (e) {
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    },
    false
);