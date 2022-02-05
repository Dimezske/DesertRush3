import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import backgroundImg from './assets/desert-background.png';
import groundSandBrokenImg from './assets/ground_sand_broken.png';
import groundSandBrokenWall from './assets/ground_sand_broken_wall.png'
import playerSpriteSheet from './assets/characterSheet.png';
import Platforms from './game/Platforms'
import GameOver from '../scenes/GameOver'
import BootScene from '../scenes/BootScene';
import TitleScene from '../scenes/TitleScene';

import jumpAudio from './assets/sfx/jump.wav';
import powerupAudio from './assets/sfx/powerup.wav';
import deadAudio from './assets/sfx/playerdied.mp3';
import clingAudio from './assets/sfx/cling.wav';

class Player extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y){
        super(scene, x, y, 'player-sprite', 0);
        
        this.scene.add.existing(this);
        this.keys = {
                /*jump: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
                left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
                right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
                duck: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),*/
                attack: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                clingOn: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                clingOff: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
            };
    }
    control_handler(){
        this.cursors = this.scene.input.keyboard.createCursorKeys()
        //--------------------Movement-------------------------
		if (this.cursors.left.isDown) {
    		this.body.setVelocityX(-160);
    		//this.player.anims.play('left', true);
			//this.schimitar.anims.play('left');
		}
		else if (this.cursors.right.isDown) {
    		this.body.setVelocityX(160);
			//this.player.anims.play('right', true);
			//this.schimitar.anims.play('right');
		}
		else {
    		this.body.setVelocityX(0);
    		//this.player.enable.anims.play('turn');
		}

		if (this.cursors.up.isDown && this.body.touching.down) {
			this.scene.sound.play('jump')
   		 	this.body.setVelocityY(-330);
		}
        
        if(this.keys['clingOn'].isDown ) {
			console.log('is clinging')
			this.body.setAcceleration(0,0)	
	    }
	    if(this.keys['clingOff'].isDown)	{	
			console.log('is not clinging')
			this.body.setAcceleration(0,0)	
	    }
		if(this.keys['clingOn'].isDown && this.body.touching.left) {
				this.isClinging = true
				this.body.setVelocityY(0,0),
				this.body.setVelocityX(0,0),
				this.scene.anims.play('clingleft');
				if (this.isClinging) {
					this.scene.anims.play('left',false);
				}
			}
			if(this.keys['clingOn'].isDown && this.body.touching.right) {
				this.isClinging = true
				this.body.setVelocityY(0,0),
				this.body.setVelocityX(0,0),
				this.anims.play('clingright');
				if (this.isClinging){
					this.scene.anims.play('right',false);
				}
			}
            //add
		if(this.keys['clingOn'].isDown && this.scene.physics.overlap(this, this.platforms)) {
			this.body.setAcceleration(0,0)
		}
		function cliffHang() {
			if (this.keys['clingOn'].isDown && this.body.touching.left && this.keys['jump'].isDown) {
				this.sound.play('cling')
   		 			if(this.keys['jump'].isDown) {
						climbUp();
					}
			}
			else if (this.keys['clingOn'].isDown && this.body.touching.right && this.keys['jump'].isDown) {
				this.sound.play('cling')
   		 		this.body.setVelocityY(-50)
					if(this.keys['jump'].isDown) {
						climbUp();
					}
			}
			else if (this.keys['clingOff'].isDown) {

			}/*
            const bottomPlatform = this.findBottomMostPlatform()
            if (this.body.y > bottomPlatform.y + 200)
            {
                this.scene.start('game-over')
                this.sound.play('dead')
            }
            */
		} 
    }
    
  }
class GameScene extends Phaser.Scene
{
    constructor(test) { // should this be scene?
        super({
            key: 'GameScene'
        });
    }

	init() {

	}
    preload() {
        //this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
        this.load.image('background', backgroundImg);
        this.load.image('logo', logoImg);
        this.load.image('platform', groundSandBrokenImg);
        this.load.image('platform_wall', groundSandBrokenWall);
        //this.load.image('player-sprite', playerSpriteSheet);
        this.load.audio('jump', jumpAudio);
        this.load.spritesheet('player-sprite', playerSpriteSheet, {
            frameWidth: 60,
            frameHeight: 80
        });
        
    }

    create (data) {
        const background = this.add.image(1450/2, 775/2, 'background');
		background.setScale(Math.max(1450 / background.width, 775 / background.height))
        .setScrollFactor(1, 0);

        this.platforms = this.physics.add.staticGroup();
        this.platformWalls = this.physics.add.staticGroup();

        for (let i = 0; i < 5; ++i) {
            const x = Phaser.Math.Between(80, 300)
            const y = 100 * i
            const platform = this.platforms.create(x, y, 'platform')
            platform.scale = 0.5
            const body = platform.body
            body.updateFromGameObject()
        } 
        for (let j = 0; j < 5; ++j) {
            const x = Phaser.Math.Between(0, 600)
            const y = 200 * j
            const platformWall = this.platformWalls.create(x, y, 'platform_wall')
            platformWall.scale = 0.5
            const body = platformWall.body
            body.updateFromGameObject()
        } 
        
        this.player = this.physics.add.existing(new Player(this, 100, 100));
		this.player.setScale(0.7)

        this.physics.add.collider(this.platforms, this.player)
        this.physics.add.collider(this.platformWalls, this.player)
        this.player.body.setBounce(0.2);
        this.player.body.setCollideWorldBounds(false);

        this.cameras.main.startFollow(this.player)
        
        //this.cameras.main.setDeadzone(this.scale.width * 1.5)

    }
	update(time, delta) {
        this.player.control_handler()
        const menubuttons = this.input.keyboard.addKeys({
            'startbutton': Phaser.Input.Keyboard.KeyCodes.ENTER,
            'exitbutton': Phaser.Input.Keyboard.KeyCodes.ESC
           });
           //------------cliffhanging------------------------
             
            
            if(menubuttons['startbutton'].isDown ) {
                console.log('start button!')
                //this.scene.stop('BootScene');
                this.scene.start('TitleScene');

            }
            else if(menubuttons['exitbutton'].isDown)	{	
                console.log('exit button!')	
            }
	}
	render() {

	}
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1450,
	height: 775,
    scene: [
        BootScene,
        TitleScene,
        GameScene,
        GameOver
    ],
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				y: 200
			},
			debug: true
		}
	}
};

const game = new Phaser.Game(config);