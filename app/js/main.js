var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO); // Fit to all screens perfectly.

// Add Phaser states.
game.state.add('BootState', BootState);
game.state.add('PreloadState', PreloadState);
game.state.add('GameState', GameState);

game.state.start('BootState'); // Start first state of the game.
