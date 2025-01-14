import BattleCharacter from "../BattleCharacter"

export default class BattleOrc extends BattleCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'base-orc-idle', 5, 5, 2, 'battleOrc')

        this.health = 100
        this.maxHealth = 100
        this.damage = 10
        this.isDead = false

        this.animations = [
            { name: 'base-base-orc-idle', start: 0, end: 3, frameRate: 2, repeat: -1, yoyo: true },
            { name: 'base-orc-run', start: 0, end: 5, frameRate: 6, repeat: -1 },
            { name: 'base-orc-death', start: 0, end: 5, frameRate: 2, repeat: 0 },
        ]

        this.initBattleOrc()
    }

    initBattleOrc() {
        this.createAnims(this.animations)
        this.anims.play('base-orc-idle', true)
        this.flipX = true
        this.setScale(1.7)
    }

    setHealth(health) {
        this.health = health
        this.maxHealth = health
    }

    getHealth() {
        return this.health
    }

    takeDamage(damage) {
        if (this.isDead) return

        this.health -= damage
        if (this.health <= 0) {
            this.health = 0
            this.die()
        }
        this.transitionTo('takeDamage')
    }

    die() {
        this.isDead = true
        this.transitionTo('death')
        console.log("Orc died!")
    }

    states = {
        idle: () => {
            if (!this.isDead) {
                this.anims.play('base-orc-idle', true)
            }
        },
        walk: () => {
            if (!this.isDead) {
                this.anims.play('base-orc-run', true)
            }
        },
        attack: () => {
            if (!this.isDead) {

            }
        },
        takeDamage: () => {
            if (!this.isDead) {
                this.flashDamage()
            }
        },
        dead: () => {
            this.anims.play('base-orc-death', true)
        },
    }

    flashDamage() {
        this.setTint(0xff0000)
        this.scene.time.delayedCall(100, () => {
            this.clearTint()
        })
    }

    update() {
        super.update()
        this.transitionTo('idle')
    }
}
