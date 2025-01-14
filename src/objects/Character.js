import Entity from "./Entity"
import HealthDisplay from './HealthDisplay'

export default class Character extends Entity {
    constructor(scene, x, y, textureKey, health, maxHealth, speed = 160, type = 'character') {
        super(scene, x, y, textureKey, health, maxHealth, type)

        this.speed = speed
        this.gridEngine = this.scene.gridEngine

        this.state = 'idle'

        this.states = {
            idle: () => { },
            move: () => { },
            attack: () => { },
            takeDamage: () => { },
            specialAction: () => { },
            dead: () => { },
        }
        this.initCharacter()
    }

    initCharacter() {
        if (['player', 'orc'].includes(this.type))
            this.healthDisplay = new HealthDisplay(this.scene, this.x, this.y, this.maxHealth, this.width, this.height, this.scaleX, this.scaleY, this.originX, this.originY)

        if (this.gridEngine && !this.gridEngine.hasCharacter(this.id)) {
            const startX = Math.floor(this.x / 16)
            const startY = Math.floor(this.y / 16)

            this.gridEngine.addCharacter({
                id: this.id,
                sprite: this,
                startPosition: { x: startX, y: startY },
                speed: this.speed,
                pathfinding: {
                    enabled: true,
                    heuristic: 'chebyshev',  // Usando a heurística Chebyshev para permitir movimento diagonal
                }
            })
        }

    }

    // Transição de estado
    transitionTo(newState) {
        if (this.state !== newState && this.states[newState]) {
            this.state = newState
            this.states[newState]()
        }
    }

    flashDamage() {
        if (!this.anims.isPlaying && this.tint !== 0xf00000) {
            this.tint = 0xf00000 // Altera a cor para o efeito de dano

            // Efeito de piscamento de cor
            this.scene.time.delayedCall(150, () => {
                this.clearTint() // Remove o efeito de tint
            })
        }
    }

    // Atualização a cada frame
    update() {
        if (this.healthDisplay)
            this.updateHealthDisplayPosition()

        super.update()
    }

    updateHealthDisplayPosition() {
        this.healthDisplay.updatePosition(this.x, this.y, this.scaleX, this.scaleY, this.originX, this.originY)
    }
}
