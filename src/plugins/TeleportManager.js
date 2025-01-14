export default class TeleportManager {
    constructor(scene, gridEngine, teleportObjects, playerId) {
        this.scene = scene
        this.gridEngine = gridEngine
        this.teleportObjects = teleportObjects
        this.playerId = playerId
        this.cooldown = 1000
        this.teleports = new Map() // Usa Map para acesso rápido por nomes
        this.interactKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)

        this.interactionText = this.createInteractionText()

        // Armazena partículas em um array
        this.particleEmitters = []
    }

    update() {
        const playerPosition = this.gridEngine.getPosition(this.playerId)
        const teleporter = this.getTeleporterAtPosition(playerPosition)

        if (teleporter) {
            this.showInteractionText(teleporter.entry)

            if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.canTeleport(teleporter)) {
                this.teleportPlayer(teleporter)
                teleporter.lastTeleportTime = this.scene.time.now
            }
        } else {
            this.hideInteractionText()
        }

        // Verifica se as partículas estão na área visível
        this.checkParticlesInView()
    }

    /**
     * Adiciona um novo par de teletransportes
     */
    add(entryName, exitName) {
        const entry = this.findObjectByName(entryName)
        const exit = this.findObjectByName(exitName)

        if (entry && exit) {
            this.teleports.set(entryName, { entry, exit, lastTeleportTime: 0 })
            this.createParticleEmitter(entry)
            this.createParticleEmitter(exit)
        } else {
            console.warn(`Teleport points '${entryName}' or '${exitName}' not found in the map.`)
        }
    }

    /**
     * Cria partículas e adiciona ao array `particleEmitters`
     */
    createParticleEmitter(position) {
        const emitter = this.scene.add.particles(position.x, position.y, 'particle', {
            lifespan: 200,
            speed: { min: 20, max: 50 },
            quantity: 10,
            angle: { min: 0, max: 360 },
            alpha: { start: 1, end: 0 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
        }).setDepth(20)

        // Armazena o emitter
        this.particleEmitters.push({ emitter, position })
    }

    /**
     * Verifica se as partículas estão na área visível da câmera
     */
    checkParticlesInView() {
        const camera = this.scene.cameras.main
        const buffer = 50
        const cameraLeft = camera.worldView.x - buffer
        const cameraRight = camera.worldView.x + camera.worldView.width + buffer
        const cameraTop = camera.worldView.y - buffer
        const cameraBottom = camera.worldView.y + camera.worldView.height + buffer

        // Verifica se as partículas estão dentro da área visível da câmera
        for (const { emitter, position } of this.particleEmitters) {
            const inCameraView = position.x >= cameraLeft && position.x <= cameraRight &&
                position.y >= cameraTop && position.y <= cameraBottom

            if (inCameraView) {
                emitter.setVisible(true).setActive(true)
            } else {
                emitter.setVisible(false).setActive(false)
            }
        }
    }

    /**
     * Teletransporta o jogador para o ponto de saída
     */
    teleportPlayer({ exit }) {
        this.scene.cameras.main.fadeOut(500, 0, 0, 0, (_, progress) => {
            if (progress === 1) {
                this.gridEngine.stopMovement(this.playerId)
                this.gridEngine.setPosition(this.playerId, {
                    x: Math.floor(exit.x / 16),
                    y: Math.floor(exit.y / 16),
                })
                this.scene.cameras.main.fadeIn(500, 0, 0, 0)
            }
        })
    }

    /**
     * Verifica se o jogador pode se teletransportar (respeitando cooldown)
     */
    canTeleport(teleporter) {
        return (this.scene.time.now - teleporter.lastTeleportTime) >= this.cooldown
    }

    /**
     * Mostra o texto de interação
     */
    showInteractionText(position) {
        this.interactionText.setPosition(position.x, position.y - 10)

        if (this.interactionText.alpha === 0) {
            this.scene.tweens.add({
                targets: this.interactionText,
                alpha: 1,
                duration: 300,
                ease: 'Power2'
            })
        }
    }

    /**
     * Esconde o texto de interação
     */
    hideInteractionText() {
        if (this.interactionText.alpha === 1) {
            this.scene.tweens.add({
                targets: this.interactionText,
                alpha: 0,
                duration: 300,
                ease: 'Power2'
            })
        }
    }

    /**
     * Cria o texto de interação
     */
    createInteractionText() {
        return this.scene.add.text(0, 0, 'F', {
            backgroundColor: '#000000',
            color: '#ffffff',
            fontSize: '11px',
            padding: { left: 2, right: 2 }
        })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(21)
    }

    /**
     * Verifica se há um teleporter na posição atual do jogador
     */
    getTeleporterAtPosition(playerPosition) {
        for (const teleporter of this.teleports.values()) {
            if (playerPosition.x === Math.floor(teleporter.entry.x / 16) &&
                playerPosition.y === Math.floor(teleporter.entry.y / 16)) {
                return teleporter
            }
        }
        return null
    }

    /**
     * Localiza um objeto pelo nome
     */
    findObjectByName(name) {
        return this.teleportObjects.objects.find(obj => obj.name === name)
    }
}
