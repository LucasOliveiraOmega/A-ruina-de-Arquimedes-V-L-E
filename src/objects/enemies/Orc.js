import Character from "../Character"

export default class Orc extends Character {
    constructor(scene, x, y) {
        super(scene, x, y, 'base-orc-idle', 5, 5, 3, 'orc')

        this.lastUpdateTime = 0
        this.pursuitCooldown = 400
        this.isFollowingPlayer = false
        this.animations = [
            { name: 'base-orc-idle', start: 0, end: 3, frameRate: 2, repeat: -1, yoyo: true },
            { name: 'base-orc-run', start: 0, end: 5, frameRate: 6, repeat: -1 },
            { name: 'base-orc-death', start: 0, end: 5, frameRate: 2, repeat: 0 },
        ]

        this.initOrc()
    }

    initOrc() {
        this.createAnims(this.animations)
        this.anims.play('base-orc-idle', true)
    }

    states = {
        idle: () => { this.anims.play('base-orc-idle', true) },
        walk: () => { this.anims.play('base-orc-run', true) },
        dead: () => { this.anims.play('base-orc-death', true) },
    }

    update(player) {
        super.update(player)

        if (this.health <= 0) {
            this.transitionTo('dead')
            return
        }

        const now = this.scene.time.now
        if (now - this.lastUpdateTime >= this.pursuitCooldown) {
            this.lastUpdateTime = now
            this.handlePursuit(player)
        }
    }

    handlePursuit(player) {
        const playerPosition = this.gridEngine.getPosition(player.id)
        const orcPosition = this.gridEngine.getPosition(this.id)

        const distanceToPlayer = Math.abs(playerPosition.x - orcPosition.x) + Math.abs(playerPosition.y - orcPosition.y)

        // Se o jogador está dentro do alcance
        if (distanceToPlayer > 1 && distanceToPlayer < 10) {
            if (!this.isFollowingPlayer) {
                this.isFollowingPlayer = true
                this.followPlayer(player)
            }

            if (!this.gridEngine.isMoving(this.id)) {
                this.transitionTo('idle')
            } else {
                this.transitionTo('walk')
            }
        } else {
            // Para de seguir se estiver fora do alcance
            if (this.isFollowingPlayer) {
                this.isFollowingPlayer = false
                this.gridEngine.stopMovement(this.id) // Para o movimento
            }

            this.transitionTo('idle')
        }

        if (distanceToPlayer === 1)
            this.transitionToBattleScene(player)

        this.flipX = ['left', 'down-left', 'up-left'].includes(this.gridEngine.getFacingDirection(this.id))
    }

    followPlayer(player) {
        if (!this.gridEngine.isMoving(this.id)) {
            this.gridEngine.follow(this.id, player.id, {
                facingDirection: 'down',
                stopOnCollision: true, // Evitar atravessar o jogador ou obstáculos
                distance: 1            // Para quando estiver a 1 tile de distância
            })
        }
    }

    transitionToBattleScene(player) {
        this.scene.cameras.main.shake(300, 0.02)
        this.scene.time.delayedCall(300, () => {
            this.scene.scene.start('BattleScene', { player: player, enemy: this, UIScene: this.UIScene })
        }, [], this)
    }

}
