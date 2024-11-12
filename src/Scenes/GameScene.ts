import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {

  private background!: Phaser.GameObjects.TileSprite;
  private character!: Phaser.Physics.Arcade.Sprite;
  private trolleys: Phaser.Physics.Arcade.Sprite[] = [];
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('GameScene');
  }

  create() {
    const imageWidth = 1060;
    const imageHeight = 951;
    const gameWidth = 600;
    const aspectRatio = imageWidth / imageHeight;
    const newHeight = gameWidth / aspectRatio;

    this.background = this.add.tileSprite(0, 0, imageWidth, imageHeight, 'background');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(gameWidth, newHeight);

    this.character = this.physics.add.sprite(73, 250, 'guy').setScale(0.16).setCollideWorldBounds(true).setImmovable(true).setGravityY(300);

    this.character.setBodySize(375,495).setOffset(0,150)

    this.anims.create({
      key: "character_anim",
      frames: this.anims.generateFrameNumbers("guy"),
      frameRate: 15,
      repeat: -1
    });
    this.character.play('character_anim');

    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.scoreText = this.add.text(10,10,`Score: ${this.score}`)

    this.time.addEvent({
      delay: 1900,
      callback: this.spawnTrolly,
      callbackScope: this,
      loop: true
    })

    this.physics.add.collider(
      this.character, this.trolleys, this.handleCollision, undefined, this
    )


  }

  update(): void {    
    this.background.tilePositionX += 2.5;

    if(this.spaceKey?.isDown && this.character.body?.bottom == 300){
      this.character.anims.pause();
      this.character.setFrame(1);
      this.character.setVelocityY(-245)
    }
    if (this.character.body?.bottom === 300 && !this.spaceKey?.isDown) {
      // When the character lands, resume the animation
      this.character.anims.play("character_anim", true); // Resume the animation
  }
  }

  spawnTrolly() {
    // Randomly decide between empty or full trolly
    const isFull = Math.random() < 0.2; // 1 in 5 chance for a full trolly
    const trollyImage = isFull ? 'full-trolly' : 'empty-trolly';
  
    // Create the trolly at the right edge of the screen
    const trolly = this.physics.add.sprite(580,270,trollyImage).setScale(0.2).setFlipX(true);
    trolly.setVelocityX(-200)
    trolly.setBodySize(trolly.width-60,trolly.height)
    trolly.setOffset(-20,0)
  
    // Add to the array of trolleys
    this.trolleys.push(trolly);
  }

  handleCollision(character: any, trolly: any) {
    // Type guard to ensure both objects are actually Sprites
    if (character instanceof Phaser.Physics.Arcade.Sprite && trolly instanceof Phaser.Physics.Arcade.Sprite) {
      // Check if the trolly is a "full-trolly" or "empty-trolly"
      if (trolly.texture.key === 'full-trolly') {
        this.score += 1; // Increase score for full trolly
        this.scoreText.setText(`Score: ${this.score}`); // Update score text immediately
        trolly.destroy(); // Destroy the trolly after collision
      } else if (trolly.texture.key === 'empty-trolly') {
        this.scene.start('GameOver'); // End the game if it hits an empty trolly
      }
    }
  }
  

}