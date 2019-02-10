var BootState = function (game) {};

BootState.prototype = {
  create: function () {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // Show entire game.
		this.game.state.start('PreloadState'); // Start Preload state.
	}
};
