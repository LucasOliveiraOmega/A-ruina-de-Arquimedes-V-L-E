export default class BattleCharacter extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey, health, maxHealth, speed = 160, type = 'character') {
        super(scene, x, y, textureKey)

        this.scene = scene
        this.type = type
        this.health = health || 5
        this.maxHealth = maxHealth || 5
        this.speed = speed

        this.scene.add.existing(this)

        this.isDead = false

        this.state = 'idle'
        this.states = {
            idle: () => { },
            move: () => { },
            attack: () => { },
            takeDamage: () => { },
            dead: () => { }
        }
}

    createAnims(animations) {
        if (!animations || !Array.isArray(animations)) {
            console.error('Animations are not defined or invalid format.')
            return
        }

        animations.forEach((anim) => {
            this.scene.anims.create({
                key: anim.name,
                frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
                    start: anim.start,
                    end: anim.end,
                }),
                frameRate: anim.frameRate || 10,
                repeat: anim.repeat || 0,
                yoyo: anim.yoyo || false,
            })
        })
    }

    transitionTo(newState) {
        if (this.state === newState || !this.states[newState]) return
        this.state = newState
        this.states[newState]()
    }

    moveToDirection(direction) {
        if (this.gridEngine) {
            this.gridEngine.move(this.id, direction)
        }
    }

    isMoving() {
        return this.gridEngine ? this.gridEngine.isMoving(this.id) : false
    }

    flashDamage() {
        this.tint = 0xff0000 // Vermelho para indicar dano
        this.scene.time.delayedCall(150, () => {
            this.clearTint() // Remove o efeito de dano
        })
    }

    update() {
        if (this.health <= 0 && !this.isDead) {
            this.transitionTo('dead')
        }
    }   
}
