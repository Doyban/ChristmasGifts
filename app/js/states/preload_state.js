var PreloadState = function (game) {};

PreloadState.prototype = {
	// Preload all game assets.
	preload: function () {
		this.game.load.audio('music', 'assets/audio/music.mp3');
		this.game.load.atlas('spritesheet', 'assets/spritesheets/spritesheet.png', 'assets/spritesheets/spritesheet.json');
		this.game.load.image('background', 'assets/images/background.png');
		this.game.load.spritesheet('snowflakes', 'assets/spritesheets/snowflakes.png', 17, 17);
		this.game.load.spritesheet('snowflakes_large', 'assets/spritesheets/snowflakes_large.png', 64, 64);
	},

	create: function(){
		this.game.state.start('GameState'); // Start Game state.
	}
};
