export default class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey, health = 5, maxHealth = 5, type = 'entity') {
        super(scene, x, y, textureKey)

        this.UIScene = this.scene.game.scene.scenes.find(scene => scene.scene.key === 'GameUI')
        this.health = Math.min(health, maxHealth) // Garante que a saúde não ultrapasse o máximo
        this.maxHealth = maxHealth

        this.type = type
        this.id = `${this.type}${x}${y}` // Forma mais concisa de concatenar

        this.initEntity()
    }

    initEntity() {
        this.scene.add.existing(this)
    }

    createAnims(animations) {
        animations.forEach(animation => {
            if (!this.anims.exists(animation.name)) {
                this.anims.create({
                    key: animation.name,
                    frames: this.anims.generateFrameNames(animation.name, {
                        start: animation.start,
                        end: animation.end,
                    }),
                    frameRate: animation.frameRate,
                    repeat: animation.repeat || 0,
                    yoyo: animation.yoyo || false,
                })
            }
        })
    }

    update() {
        // Atualiza o depth
        const newDepth = this.depth - 3
        if (this.depth !== newDepth)
            this.depth = newDepth
    
        const camera = this.scene.cameras.main
    
        // Buffer de 50 pixels para o desaparecimento
        const buffer = 50
    
        // Posições da borda da tela, considerando o buffer
        const cameraLeft = camera.worldView.x - buffer
        const cameraRight = camera.worldView.x + camera.worldView.width + buffer
        const cameraTop = camera.worldView.y - buffer
        const cameraBottom = camera.worldView.y + camera.worldView.height + buffer
    
        // Verificar se a posição do NPC está dentro da área visível da câmera com o buffer
        const inCameraView = this.x >= cameraLeft && this.x <= cameraRight && this.y >= cameraTop && this.y <= cameraBottom
    
        if (inCameraView) {
            this.anims.resume()
            this.setActive(true)
                .setVisible(true)
        } else {
            this.anims.pause()
            this.setActive(false)
                .setVisible(false)
        }
    }
    


}
