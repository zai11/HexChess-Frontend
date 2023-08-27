import GameScene from './scenes/GameScene.js'

const config = {
	type: Phaser.CANVAS,
	width: 680,
	height: 810,
	antialias: true,
	roundPixels: true,
	scene: [GameScene],
	fps: {
		target: 60,
		forceSetTimeOut: true
	},
	parent: 'canvas-container',
	"transparent": true
}

export default new Phaser.Game(config)