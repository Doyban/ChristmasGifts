var GameState = function (game) {};

GameState.prototype = {
	create: function() {
		this.score = 0; // Initialize score.

		var seed = Date.now(); // Use current date (in milliseconds) as a seed for pseudo random number generator.
		this.random = new Phaser.RandomDataGenerator([seed]); // Generator random number between 0 and current date (in milliseconds).

		this.game.physics.startSystem(Phaser.Physics.ARCADE); // Enable Arcade Physics system.

		this.background = this.game.add.tileSprite(0, 0, this.game.world.bounds.width, this.game.world.bounds.height, 'background'); // Add background tile, and duplicate it to fill all screen.

		// Add items, which will be spawn to the alive (good) side.
		this.spriteKeys = [
			'angel.png',
			'bag.png',
			'ball.png',
			'bear.png',
			'candy.png',
			'chocolate_santa.png',
			'cookie.png',
			'cup.png',
			'deer.png',
			'elf.png',
			'hat.png',
			'lantern.png',
			'loosing.png',
			'santa.png',
			'snowman.png',
			'sock.png',
			'sweater.png',
			'wreath.png'
		];

		this.sprites = this.game.add.group(); // Add sprites to the game.

		// Necessary initial settings for snow, taken from Phaser's website examples (snow).
		this.max = 0;
		this.front_emitter = null;
		this.mid_emitter = null;
		this.back_emitter = null;
		this.update_interval = 4 * 60;
		this.i = 0;

		this.initSprites(); // Initialize sprites.
		this.addSides(); // Add sides.
		this.addScore(); // Add score.
		this.createSnow(); // Create snow.

		this.music = this.game.add.audio('music', 1, true); // Add music, looping it.
		this.music.play(); // Play music.

		this.timer = game.time.events.loop(500, this.addSprites, this); // Add a present every half second.
	},

	// Method running all the time, and checking what's happening in the game.
	update: function () {
		var that = this; // Keep reference to this of the method.

		this.game.physics.arcade.collide(this.sprites, this.dividerSprite); // Set up collision between sprites, and divider.

		// Properties to create snow, taken from Phaser's website examples (snow).
	  this.i++;
		if (this.i === this.update_interval) {
	  	that.changeWindDirection();
	  	that.update_interval = Math.floor(Math.random() * 20) * 60; // 0 - 20sec @ 60fps
	  	that.i = 0;
	  }

	  // Loop through each sprite currently visible on the screen.
		this.sprites.forEachAlive(function (sprite) {
			// Checks for alive sprites, which touches the loosing, and alive sides.
			if (sprite.body.y > that.game.world.height - 220) {
				// Case for sprite being on the right (alive) side of the screen and not being a coal.
				if (sprite.body.x > that.game.world.centerX && sprite.frameName != 'loosing.png') {
					that.incrementScore(); // Increment score.
				}
				// Case for sprite being on the left (loosing) side of the screen and being a coal.
				else if (sprite.body.x < that.game.world.centerX && sprite.frameName == 'loosing.png') {
					that.incrementScoreFive(); // Increment score.
				}
				// Case for other scenarios, i.e. it's when coal goes to the right (alive) side, or good sprites to the left (loosing) side. Simply player gave not correct sprite to not correct side.
				else {
					that.music.stop(); // Stop playing music in the background.
					that.game.state.restart(); // Restart game.
				}
				sprite.kill(); // Each time sprite reaches bottom part of the game screen, kill it - no matter what happened.
			}
		});
	},

	// Method to initialize sprites.
	initSprites: function () {
		var that = this; // Keep reference to this of the method.

		// Create no more than 10 sprites at a time on a screen.
		for (var i = 0; i < 10; i++) {
			var sprite = that.sprites.create(-120, -120, 'spritesheet', null, false); // Create many sprites and add them to 'presents' group.

			that.game.physics.arcade.enable(sprite); // Enable physics.

			// Physics properties.
			sprite.enableBody = true;
			sprite.body.bounce.set(0.95);
			sprite.body.gravity.y = 150;
			sprite.body.collideWorldBounds = true;

			sprite.inputEnabled = true; // Enable possibility to manipulate sprites by the player.

			// Handlers for input events.
			sprite.events.onInputDown.add(that.keepTrack, that); // Handle event once pointer has been pressed down (but not yet released).
			sprite.events.onInputUp.add(that.addVelocity, that); // Handle event once pointer had been pressed, and released.
		}
	},

	// Method to add sprites.
	addSprites: function () {
		// Set up 30% chance of spawning time defined in 'this.timer' to spawn sprites.
		if (Phaser.Utils.chanceRoll(30)) {
		    var sprite = this.sprites.getFirstDead(); // Get first sprite, which is not used.

		    var random = this.random.integerInRange(15, this.game.world.width - 10); // Create random variable.

		    sprite.reset(random, 1); // Reset sprite to randomly generated variable.

				// Create random velocity to fly in different directions.
		    sprite.body.velocity.y = this.random.integerInRange(40, 360);
		    sprite.body.velocity.x = this.random.integerInRange(-80, 120);

				var frame = this.spriteKeys[this.random.integerInRange(0, this.spriteKeys.length - 1)]; // Create random array.
				sprite.frameName = frame; // Using atlas gives possibility to change the sprite to by anything we want, here get a random frame from previously created array.

		    sprite.checkWorldBounds = true; // Check if sprite is within the screen.
		    sprite.outOfBoundsKill = true; // Sprites outside screen are killed, then this sprite agains becomes available for the getFirstDead method.
		}
	},

	// Method to create loosing, and alive sides for falling sprites, each of them takes half of the screen.
	addSides: function () {
		// Create an HTML5 gradient canvas element for loosing side.
		var loosingSide = this.game.add.bitmapData(this.game.world.width / 2, 150);
		var loosingSideGradient = loosingSide.ctx.createLinearGradient(0, 0, 0, 120);
		loosingSideGradient.addColorStop(0, 'red');
		loosingSideGradient.addColorStop(1, 'white');
		loosingSide.ctx.fillStyle = loosingSideGradient;
		loosingSide.ctx.fillRect(0, 0, this.game.world.width / 2, 150);
		loosingSide.ctx.fill();
		var loosingSideSprite = this.game.add.sprite(0, this.game.world.height - 150, loosingSide);

		// Create an HTML5 gradient canvas element for side, which keeps the player alive.
		var aliveSide = this.game.add.bitmapData(this.game.world.width / 2, 150);
		var aliveSideGradient = loosingSide.ctx.createLinearGradient(0, 0, 0, 120);
		aliveSideGradient.addColorStop(0, 'green');
		aliveSideGradient.addColorStop(1, 'white');
		aliveSide.ctx.fillStyle = aliveSideGradient;
		aliveSide.ctx.fillRect(0, 0, this.game.world.width / 2, 150);
		aliveSide.ctx.rect(0, 0, this.game.world.width / 2, 150);
		aliveSide.ctx.fill();
		var aliveSideSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.height - 150, aliveSide);

		// Create a divider to keep clearly separated loosing, and alive sides.
		this.dividerSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.height - 50, 'spritesheet');
		this.dividerSprite.frameName = 'divider.png';
		this.dividerSprite.anchor.setTo(0.5, 1); // Position relative to the bottom, because we want it to dissapear once it will hit bottom space of the game.
		this.game.physics.arcade.enable(this.dividerSprite); // Enable physics on the divider element.
		this.dividerSprite.enableBody = true;
		this.dividerSprite.body.immovable = true; // Once sprite will touch divider, only sprite will move, divider will be immovable.
	},

	// Method to keep track where player initially tapped the sprite.
	keepTrack: function (sprite, pointer) {
		// Add custom properties to sprite from the pointer to get coordinates of initially tapped sprite.
		sprite.downX = pointer.x;
		sprite.downY = pointer.y;
	},

	// Method to compare with initially tapped sprite pointers, in order to determine how much velocity should be added.
	addVelocity: function (sprite, pointer){
		// Compare between pointer, and sprite released coordinates.
		var x = pointer.x - sprite.downX;
		var y = pointer.y - sprite.downY;

		// Add extra velocity once player released pointer.
		sprite.body.velocity.x += 1.5 * x;
		sprite.body.velocity.y -= 500;
	},

	// Method to create displaying score.
	addScore: function () {
		var scoreFont = '140px Arial';

		this.scoreLabel = this.game.add.text((this.game.world.centerX), 140, '0', {font: scoreFont, fill: '#ffe200'});
		this.scoreLabel.anchor.setTo(0.5, 0.5);
		this.scoreLabel.align = 'center';
	},

	// Method to increment score if good items will be catched on the alive side.
	incrementScore: function () {
		this.score += 1; // Increment score by adding plus 1.
		this.scoreLabel.text = this.score; // Update score text.
	},

	// Method to increment score if bad item will be catched on the loosing side.
	incrementScoreFive: function () {
		this.score += 5; // Increment score by adding plus 5.
		this.scoreLabel.text = this.score; // Update score text.
	},

	// Methods to create snow, taken from Phaser's website examples (snow).
	createSnow: function () {
	    this.back_emitter = game.add.emitter(game.world.centerX, -32, 600);
	    this.back_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
	    this.back_emitter.maxParticleScale = 0.6;
	    this.back_emitter.minParticleScale = 0.2;
	    this.back_emitter.setYSpeed(20, 100);
	    this.back_emitter.gravity = 0;
	    this.back_emitter.width = game.world.width * 1.5;
	    this.back_emitter.minRotation = 0;
	    this.back_emitter.maxRotation = 40;

	    this.mid_emitter = game.add.emitter(game.world.centerX, -32, 250);
	    this.mid_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
	    this.mid_emitter.maxParticleScale = 1.2;
	    this.mid_emitter.minParticleScale = 0.8;
	    this.mid_emitter.setYSpeed(50, 150);
	    this.mid_emitter.gravity = 0;
	    this.mid_emitter.width = game.world.width * 1.5;
	    this.mid_emitter.minRotation = 0;
	    this.mid_emitter.maxRotation = 40;

	    this.front_emitter = game.add.emitter(game.world.centerX, -32, 50);
	    this.front_emitter.makeParticles('snowflakes_large', [0, 1, 2, 3, 4, 5]);
	    this.front_emitter.maxParticleScale = 1;
	    this.front_emitter.minParticleScale = 0.5;
	    this.front_emitter.setYSpeed(100, 200);
	    this.front_emitter.gravity = 0;
	    this.front_emitter.width = game.world.width * 1.5;
	    this.front_emitter.minRotation = 0;
	    this.front_emitter.maxRotation = 40;

	    this.changeWindDirection();

	    this.back_emitter.start(false, 14000, 20);
	    this.mid_emitter.start(false, 12000, 40);
	    this.front_emitter.start(false, 6000, 1000);
	},

	// Methods to change snow direction, taken from Phaser's website examples (snow).
	changeWindDirection: function () {
	    var multi = Math.floor((this.max + 200) / 4),
	        frag = (Math.floor(Math.random() * 100) - this.multi);
	    this.max = this.max + frag;

	    if (this.max > 200) this.max = 150;
	    if (this.max < -200) this.max = -150;

	    this.setXSpeed(this.back_emitter, this.max);
	    this.setXSpeed(this.mid_emitter, this.max);
	    this.setXSpeed(this.front_emitter, this.max);
	},

	// Method to set snow speed, taken from Phaser's website examples (snow).
	setXSpeed: function (emitter, max) {
	    emitter.setXSpeed(max - 20, max);
	    emitter.forEachAlive(this.setParticleXSpeed, this, max);
	},

	// Method to set snow velocity, taken from Phaser's website examples (snow).
	setParticleXSpeed: function (particle, max) {
	    particle.body.velocity.x = max - Math.floor(Math.random() * 30);
	},
};
