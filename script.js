// import phaser from "../phaser/types/phaser"

class Character {
    constructor({ sprite, health }) {
        this._sprite = sprite
        this.actions = {}
        this._health = health

        this._healthBar = null;
    }

    addAction(key, animAction) {
        this.actions[key] = animAction

    }

    setPosition(x, y) {
        this._sprite.setPosition(x, y)
    }

    playAnim(animAction) {
        let actionId = this.actions[animAction]
        this._sprite.anims.play(actionId);
    }

    isAlive() {
        return this._health > 0
    }

    takeDamage(value) {
        this._health = Math.max(this._health - value, 0)

        if (this._healthBar !== null) {
            this._healthBar.setHealth(this._health)
        }

    }

    setHealthBar(healthBar) {
        this._healthBar = healthBar
    }

    sprite() {
        return this._sprite;
    }
}


class Healthbar {
    constructor({ scene, maxValue }) {
        this.scene = scene
        this.healthBar = this.scene.add.graphics()
        this.maxHealth = maxValue


        this.setPosition(0, 0)
        this.setHealth(this.maxHealth)
        this.draw()
    }

    setPosition(x, y) {
        this.x = x
        this.y = y
        this.draw()
    }

    setHealth(value) {
        this.currentHealth = value
        this.draw()
    }

    draw() {
        let x = this.x
        let y = this.y
        // Clear the old health bar
        this.healthBar.clear();

        // Draw the background of the health bar
        this.healthBar.fillStyle(0x000000);
        this.healthBar.fillRect(x, y, 100, 16);

        // Calculate health bar width based on the current health
        const healthWidth = Math.floor(((this.currentHealth / this.maxHealth)) * 100 + 0.5);

        // Draw the health
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(x + 1, y + 1, healthWidth, 14);
    }

}

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
        this.siz
    }

    preload() {
        this.load.spritesheet('character1', 'assets/dinoCharactersVersion1.1/sheets/DinoSprites - doux.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('character2', 'assets/dinoCharactersVersion1.1/sheets/DinoSprites - tard.png', { frameWidth: 24, frameHeight: 24 });
        // Load other assets like background, sounds, etc.

        // Load background image
        this.load.image('background', 'assets/bg_all.png');
    }

    create() {
        // Create animations for each character
        this.createAnimations();
        // Add the background image
        this.background = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.fpsText = this.add.text(10, 10, '', { font: '16px Arial', fill: '#ffffff' });
        this.turnNumberText = this.add.text(10, 30, 'Are you ready?', { font: '16px Arial', fill: '#ffffff' });

        // Add characters to the scene
        this.createCharacters()

        this.createHealthbars({ scene: this })

        this.leftCharacter.playAnim('idle');
        this.rightCharacter.playAnim('idle');

        this.characters = [this.leftCharacter, this.rightCharacter]


        this.currentTurn = 0;

        this.launchCounter(4);
    }

    createCharacters() {
        let character1Sprite = this.add.sprite(100, 180, 'character1').setScale(4)
        this.leftCharacter = new Character({ sprite: character1Sprite, health: 100 })
        this.leftCharacter.setPosition(100, 180)
        this.leftCharacter.addAction("idle", "idle1")
        this.leftCharacter.addAction("attack", "attack1")
        this.leftCharacter.addAction("death", "death1")

        let character2Sprite = this.add.sprite(300, 180, 'character2').setScale(4)

        character2Sprite.flipX = true
        this.rightCharacter = new Character({ sprite: character2Sprite, health: 100 })
        this.rightCharacter.setPosition(300, 180)
        this.rightCharacter.addAction("idle", "idle2")
        this.rightCharacter.addAction("attack", "attack2")
        this.rightCharacter.addAction("death", "death2")
    }

    createHealthbars({ scene }) {
        let leftHealthbar = new Healthbar({ scene: scene, maxValue: 100 });
        leftHealthbar.setPosition(50, 100)
        this.leftCharacter.setHealthBar(leftHealthbar);

        let rightHealthbar = new Healthbar({ scene: scene, maxValue: 100 });
        rightHealthbar.setPosition(250, 100)
        this.rightCharacter.setHealthBar(rightHealthbar);
    }

    createAnimations() {
        // Animation for character 1 idle
        this.anims.create({
            key: 'idle1',
            frames: this.anims.generateFrameNumbers('character1', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Animation for character 1 attack
        this.anims.create({
            key: 'attack1',
            frames: this.anims.generateFrameNumbers('character1', { start: 16, end: 23 }),
            frameRate: 15,
            repeat: 0
        });

        // Animation for character 2 idle
        this.anims.create({
            key: 'idle2',
            frames: this.anims.generateFrameNumbers('character2', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        // Animation for character 2 attack
        this.anims.create({
            key: 'attack2',
            frames: this.anims.generateFrameNumbers('character2', { start: 16, end: 23 }),
            frameRate: 15,
            repeat: 0
        });

        // Animation for character 2 attack
        this.anims.create({
            key: 'death1',
            frames: this.anims.generateFrameNumbers('character1', { start: 15, end: 15 }),
            frameRate: 1,
            repeat: 0
        });

        // Animation for character 2 attack
        this.anims.create({
            key: 'death2',
            frames: this.anims.generateFrameNumbers('character2', { start: 15, end: 15 }),
            frameRate: 1,
            repeat: 0
        });
    }

    characterAttack(attacker, defender, animationKey) {
        attacker.anims.play(animationKey);

        // Wait for the attack animation to complete
        attacker.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            // After attack is complete, play defender's attack animation
            defender.anims.play(animationKey === 'attack1' ? 'attack2' : 'attack1');

            // Once defender's attack is complete, set them back to idle
            defender.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                attacker.anims.play('idle1');
                defender.anims.play('idle2');

                // Set the next attack in the sequence after a delay
                this.time.delayedCall(1000, this.characterAttack, [defender, attacker, animationKey === 'attack1' ? 'attack2' : 'attack1'], this);
            });
        });
    }

    update() {
        // Game logic and other updates would go here
        this.fpsText.setText(`FPS: ${this.game.loop.actualFps.toFixed(2)}`);
    }

    getCurrentActiveCharacterIdx(currentTurn) {
        // we can change it so initiative will affect to the result
        const activeCharacterIdx = currentTurn % 2;
        return activeCharacterIdx;
    }

    launchCounter(counter) {
        this.makeTurn()

        // if (counter >= 0) {
        //     this.turnNumberText.setText(`${counter}`)
        //     this.time.delayedCall(400, this.launchCounter, [counter - 1], this);
        // } else {
        //     this.turnNumberText.setText(`Start!`)
        //     this.makeTurn()
        // }
    }

    makeTurn() {
        this.turnNumberText.setText(`Turn: ${this.currentTurn}`)

        let attackingCharacterIdx = this.getCurrentActiveCharacterIdx(this.currentTurn);
        let defendingCharactedIdx = 1 - attackingCharacterIdx;

        let attackingCharacter = this.characters[attackingCharacterIdx];
        let defendingCharacter = this.characters[defendingCharactedIdx];

        attackingCharacter.playAnim("attack");
        defendingCharacter.playAnim("idle");

        attackingCharacter.sprite().once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            let damage = Math.random() * 20 + 15;
            defendingCharacter.takeDamage(damage);

            // check aliveness
            let bothAlive = this.leftCharacter.isAlive() && this.rightCharacter.isAlive()

            if (!bothAlive) {
                this.endGame();
                return
            }

            attackingCharacter.playAnim("idle");
            // next turn
            this.currentTurn += 1
            this.time.delayedCall(500, this.makeTurn, [], this);
        })
    }

    endGame() {
        for (let characterId in this.characters) {
            let character = this.characters[characterId]
            if (character.isAlive()) {
                character.playAnim("idle")
            } else {
                character.playAnim("death")
            }

        }


        this.turnNumberText.setText(`End game`)
    }
}

const config = {
    type: Phaser.AUTO,
    // width: window.innerWidth,
    // height: window.innerWidth / 2,
    scale: {
        mode: Phaser.Scale.FIT,
        // parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: 450,
        height: 240
    },
    scene: [BattleScene],
    fps: {
        debug: true
    },
    // Add any necessary physics or other game config settings here
};

const game = new Phaser.Game(config);