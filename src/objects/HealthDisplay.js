"use strict"

export default class HealthDisplay {
    constructor(scene, x, y, maxHealth, charWidth, charHeight, charScaleX, charScaleY, charOriginX, charOriginY) {
        this.scene = scene
        this.maxHealth = maxHealth
        this.health = maxHealth
        this.charWidth = charWidth
        this.charHeight = charHeight
        this.charScaleX = charScaleX
        this.charScaleY = charScaleY
        this.charOriginX = charOriginX
        this.charOriginY = charOriginY

        this.hpGroup = this.scene.add.group({
            key: 'full-hearth',
            repeat: this.maxHealth - 1,
            setXY: { x: x, y: y },
        })

        this.hpGroup.setDepth(10)
        this.updateHealthDisplay()
    }

    updateHealthDisplay() {
        this.hpGroup.getChildren().forEach((heart, index) => {
            heart.setTexture(index < this.health ? 'full-hearth' : 'empty-hearth')
        })
    }

    takeDamage(amount = 1) {
        this.health = Math.max(0, this.health - amount)
        this.updateHealthDisplay()
    }

    heal(amount = 1) {
        this.health = Math.min(this.maxHealth, this.health + amount)
        this.updateHealthDisplay()
    }

    updatePosition(x, y, scaleX, scaleY, originX, originY) {
        const heartSpacing = 1 // Espaço entre os corações

        // Calculando a largura e altura do personagem com o scale
        const characterWidth = this.charWidth * scaleX
        const characterHeight = this.charHeight * scaleY

        // Calculando o offset devido ao origin
        const originOffsetX = characterWidth * originX
        const originOffsetY = characterHeight * originY

        // Ajustando a posição da barra de saúde
        const offsetY = y - 5 // Ajuste vertical da barra de saúde

        this.hpGroup.getChildren().forEach((heart, index) => {
            heart.x = x + originOffsetX + (index * (heart.displayWidth + heartSpacing)) // Inclui o espaço entre os corações
            heart.y = offsetY + originOffsetY // Ajuste para o origem Y
        })
    }

    setHealth(newHealth) {
        this.health = Math.min(this.maxHealth, Math.max(0, newHealth))
        this.updateHealthDisplay()
    }
}
