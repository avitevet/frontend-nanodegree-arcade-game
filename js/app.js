/* global Resources, ctx */

window.EASY = {
	"num_enemies" : 3,
	"min_speed" : 100,
	"max_speed" : 300,
	"get_speed" : function() { return randomRange(this.min_speed, this.max_speed); }
};
window.MEDIUM = {
	"num_enemies" : 5,
	"min_speed" : 100,
	"max_speed" : 500,
	"get_speed" : function() {
		// speed at which the enemy moves.  It should be mostly slow-moving
		// enemies, with a few fast moving enemies.  So, first pick a random number
		// between min & max, which establishes an upper bound.  Then pick another
		// number between min & upper, which becomes the speed.  This makes low speeds
		// more likely to be selected than high speeds.
		return randomRange(this.min_speed, randomRange(this.min_speed, this.max_speed));
	}
};
window.HARD = {
	"num_enemies" : 6,
	"min_speed" : 50,
	"max_speed" : 700,
	"get_speed" : function() {
		// speed at which the enemy moves.  It should be mostly fast-moving
		// enemies, with a few slow moving enemies.  So, first pick a random number
		// between min & max, which establishes a lower bound.  Then pick another
		// number between lower & max, which becomes the speed.  This makes high speeds
		// more likely to be selected than low speeds.
		return randomRange(randomRange(this.min_speed, this.max_speed), this.max_speed);
	}
};


const SPRITE_DIM = {
	"x" : 101,
	"y" : 171,
	"visible" : 85  // heigt of the non-overlapping part of the tile
};
const NUM_ROWS = 5;
const NUM_COLS = 5;

const COLLISION_FUDGE_FACTOR = 30;  // the player & enemy must overlap by this much to be considered a collision
const BOARD_WIDTH = SPRITE_DIM.x * NUM_COLS;

function randomRange(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function col2board(col) {
	return col * SPRITE_DIM.x;
}

function row2board(row) {
	return 400 - row * SPRITE_DIM.visible;
}

// Enemies our player must avoid
var Enemy = function() {
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started

  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/enemy-bug.png';

	this.reset();
};

Enemy.prototype.reset = function() {
	//console.log("resetting from x = " + this.x + " and y = " + this.y);

	this.x = col2board(-1);
	this.y = row2board(randomRange(1, NUM_ROWS));


	// speed at which the enemy moves.  It should be mostly slow-moving
	// enemies, with a few fast moving enemies.  So, first pick a random number
	// between min & max, which establishes an upper bound.  Then pick another
	// number between min & upper, which becomes the speed.  This makes low speeds
	// more likely to be selected than high speeds.
	this.speed = Difficulty.level.get_speed();
}

Enemy.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}


// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
		this.x += this.speed * dt;

		if (this.x > BOARD_WIDTH + SPRITE_DIM.x) {
			this.reset();
		}
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
	this.sprite = 'images/char-boy.png';
	this.reset();
};

Player.prototype.update = function() {
	this.x = col2board(this.col);
	this.y = row2board(this.row);

	// perform collision detection
	var self = this;
	allEnemies.forEach(function(enemy) {
		if ((enemy.y === self.y)
			&& (enemy.x + SPRITE_DIM.x - COLLISION_FUDGE_FACTOR > self.x)
			&& (enemy.x < self.x + SPRITE_DIM.x - COLLISION_FUDGE_FACTOR)) {
			scoreboard.lose();
		}
	});
};

Player.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.reset = function() {
	this.row = 0;
	this.col = 2;
}

Player.prototype.handleInput = function(dir) {
	// check for valid move, then update x & y as necessary
	if ((dir === "left") && (this.col !== 0)) {
		this.col--;
	}
	else if ((dir === "right") && (this.col !== NUM_COLS - 1)) {
		this.col++;
	}
	else if ((dir === "down") && (this.row !== 0)) {
		this.row--;
	}
	else if (dir === "up") {
		if (this.row !== NUM_ROWS - 1) {
			this.row++;
		}
		else {
			scoreboard.win();
		}
	}
};

var Scoreboard = function(statsTable) {
	var tds = statsTable.getElementsByTagName("td");
	this.winsEl = tds[0];
	this.lossesEl = tds[1];

	this.wins = 0;
	this.losses = 0;

	this.winsEl.innerHTML = this.wins;
	this.lossesEl.innerHTML = this.losses;
}

Scoreboard.prototype.win = function() {
	player.reset();
	this.wins++;
	this.winsEl.innerHTML = this.wins;
}

Scoreboard.prototype.lose = function() {
	player.reset();
	this.losses++;
	this.lossesEl.innerHTML = this.losses;
}

Scoreboard.prototype.reset = function() {
	this.wins = 0;
	this.losses = 0;
	this.winsEl.innerHTML = this.wins;
	this.lossesEl.innerHTML = this.losses;
}


var Difficulty = function(difficultyContainer) {
	var radioChangeHandler = function() {
		player.reset();
		scoreboard.reset();
		Difficulty.level = window[this.value];

		allEnemies = [];
		for (var i = 0; i < Difficulty.level.num_enemies; ++i) {
			allEnemies.push(new Enemy());
		}

		// give focus back to the canvas by taking it from the radio buttons
		this.blur();
	}

	var radios = difficultyContainer.getElementsByTagName("input");
	for (var radio in radios) {
		radios[radio].onclick = radioChangeHandler;
	}
}

Difficulty.level = EASY;


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();
var allEnemies = [];
var scoreboard = new Scoreboard(document.getElementById("statsTable"));
var difficulty = new Difficulty(document.getElementById("difficultyList"));
for (var i = 0; i < Difficulty.level.num_enemies; ++i) {
	allEnemies.push(new Enemy());
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
