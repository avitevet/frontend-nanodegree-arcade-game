/* global Resources, ctx */
const SPRITE_DIM = {
	"x" : 101,
	"y" : 171,
	"tile_y" : 85
};
const BOARD_DIM = {
	"width" : SPRITE_DIM.x * 5,
	"height" : 535  // some of the blocks overlap vertically so it's not just SPRITE_DIM.y * 5
};
const ENEMY_INITIAL_X = -SPRITE_DIM.x;
const Y_LANES = [400, 315, 230, 145, 60];
const MIN_SPEED = 100;
const MAX_SPEED = 500;
const NUM_ENEMIES = 5;
const COLLISION_FUDGE_FACTOR = 30;  // the player & enemy must overlap by this much to be considered a collision

 function randomRange(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
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
	this.x = ENEMY_INITIAL_X;
	this.y = Y_LANES[randomRange(1, Y_LANES.length)];

	// speed at which the enemy moves.  It should be mostly slow-moving
	// enemies, with a few fast moving enemies.  So, first pick a random number
	// between min & max, which establishes an upper bound.  Then pick another
	// number between min & upper, which becomes the speed.  This makes low speeds
	// more likely to be selected than high speeds.
	this.speed = randomRange(MIN_SPEED, randomRange(MIN_SPEED, MAX_SPEED));
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

		if (this.x > BOARD_DIM.width + SPRITE_DIM.x) {
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
	// perform collision detection
	var self = this;
	allEnemies.forEach(function(enemy) {
		if ((enemy.y === self.y)
			&& (enemy.x + SPRITE_DIM.x - COLLISION_FUDGE_FACTOR > self.x)
			&& (enemy.x < self.x + SPRITE_DIM.x - COLLISION_FUDGE_FACTOR)) {
			lose();
		}
	});
};

Player.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.reset = function() {
	this.x = 2 * SPRITE_DIM.x;
	this.y = Y_LANES[0];
}

Player.prototype.handleInput = function(dir) {
	// check for valid move, then update x & y as necessary
	if ((dir === "left") && (this.x !== 0)) {
		this.x -= SPRITE_DIM.x;
	}
	else if ((dir === "right") && (this.x !== 4 * SPRITE_DIM.x)) {
		this.x += SPRITE_DIM.x;
	}
	else if ((dir === "down") && (this.y !== Y_LANES[0])) {
		this.y += SPRITE_DIM.tile_y;
	}
	else if (dir === "up") {
		if (this.y !== Y_LANES[Y_LANES.length - 1]) {
			this.y -= SPRITE_DIM.tile_y;
		}
		else {
			win();
		}
	}
};

function win() {
	player.reset();
}

function lose() {
	// right now this is the same as win, but eventually win will increment the
	// win counter, display a message, or something like that, while
	// lose will increment the loss counter, display a loss message, or something
	// like that.
	player.reset();
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();
var allEnemies = [];
for (var i = 0; i < NUM_ENEMIES; ++i) {
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
