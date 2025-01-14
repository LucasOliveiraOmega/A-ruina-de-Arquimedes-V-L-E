import Character from "./Character"

export default class NPC extends Character {
    constructor(scene, x, y, textureKey, animations = null, dialogList, canMove = false, speed = 4, pathName = null) {
        super(scene, x, y, textureKey, 5, 5, speed, 'NPC')

        this.animations = animations
        this.dialogList = dialogList || [
            {
                isDialog: true,
                text: "...",
                name: "Arquimedes",
                color: "#16776960"
            }]

        this.textureKey = textureKey
        this.canMove = canMove
        this.speed = speed
        this.pathName = pathName
        this.path = []

        this.dialogCooldown = 1000  // Cooldown de diálogo
        this.lastDialogTime = 0     // Controle de tempo para cooldown
        this.inDialog = false

        if (this.scene.game.config.physics.arcade.debug)
            this.createInteractionDebugCircle()

        if (this.pathName !== null)
            this.extractPathFromPolyline()

        this.initNPC()
    }

    initNPC() {
        this.createInteractionText()

        if (this.animations === null) return
        this.createAnims(this.animations)
        this.anims.play(this.textureKey, true)
    }

    update(player) {
        if (this.scene.game.config.physics.arcade.debug)
            this.updateInteractionDebugCircle()

        if (this.inDialog && this.interactionText.text !== 'Space')
            this.interactionText.setText('Space')
        else if (!this.inDialog && this.interactionText.text !== 'F')
            this.interactionText.setText('F')

        if (this.canMove && this.path.length > 0 && !this.inDialog) {
            this.moveAlongPath()
        } else if (this.canMove && this.path.length && this.inDialog) {
            this.gridEngine.stopMovement(this.id)
            this.flipX = player.x < this.x
        }

        let newFlipX = ['left', 'down-left', 'up-left'].includes(this.gridEngine.getFacingDirection(this.id))
        if (newFlipX !== this.lastFlipX) {
            this.flipX = newFlipX
            this.lastFlipX = newFlipX
        }

        this.checkInteraction(player) // Adicionando a verificação de interação no update

        // Chama handleSpaceKey se o diálogo estiver ativo e a tecla 'Space' for pressionada
        if (this.inDialog && this.UIScene.keys.SPACE.isDown) {
            this.handleSpaceKey()
        }

        super.update()
    }


    createInteractionText() {
        this.interactionText = this.scene.add.text(this.x + 18, this.y - 5, 'F', {
            backgroundColor: '#000000',
            color: '#ffffff',
            fontSize: '11px',
            padding: { left: 2, right: 2 }
        })
            .setOrigin(0.5)
            .setAlpha(0)
            .setActive(true)
            .setDepth(21)
    }

    updateInteractionText() {
        const newX = this.x + 18
        const newY = this.y - 5

        if (this.interactionText.x !== newX || this.interactionText.y !== newY) {
            this.interactionText.setPosition(newX, newY)
        }
    }

    createInteractionDebugCircle() {
        this.interactionDebugCircle = this.scene.add.circle(this.x + 16, this.y + 16, 16 * 3, 0x7fffd4, 0.5)
            .setDepth(20)
    }

    updateInteractionDebugCircle() {
        const newX = this.x + 16
        const newY = this.y + 16

        if (this.currentDebugPosition?.x !== newX || this.currentDebugPosition?.y !== newY) {
            this.interactionDebugCircle.setPosition(newX, newY)
            this.currentDebugPosition = { x: newX, y: newY }
        }
    }

    extractPathFromPolyline() {
        const polylineObject = this.scene.map.getObjectLayer('path')
            .objects.find(obj => obj.name === this.pathName)

        if (!polylineObject?.polyline?.length) return

        const offsetX = polylineObject.x
        const offsetY = polylineObject.y

        this.path = polylineObject.polyline.map(({ x, y }) => ({
            x: Math.floor((x + offsetX) / 16),
            y: Math.floor((y + offsetY) / 16),
        }))

        this.originalPath = [...this.path]
    }

    moveAlongPath() {
        if (!this.path.length) return

        const nextPoint = this.path[0]
        const currentPos = this.gridEngine.getPosition(this.id)

        if (currentPos.x === nextPoint.x && currentPos.y === nextPoint.y) {
            this.path.shift()

            if (!this.path.length) {
                this.path = this.originalPath.slice().reverse()
            }
        } else if (!this.gridEngine.isMoving(this.id)) {
            // Verificar se o próximo ponto está bloqueado
            const isTileBlocked = this.gridEngine.isBlocked(nextPoint)

            if (!isTileBlocked) {
                this.gridEngine.moveTo(this.id, { x: nextPoint.x, y: nextPoint.y })
            } else {
                console.warn(`Ponto bloqueado em (${nextPoint.x}, ${nextPoint.y}). Aguardando desobstrução.`)
                // Não limpar o caminho, apenas aguardar
            }
        }
    }


    checkInteraction(player) {
        this.updateInteractionText()

        if (!player || this.inDialog) return

        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y)
        this.inProximity = distance < 16 * 3

        // Se o jogador está perto e a tecla 'F' for pressionada, inicia o diálogo
        if (!this.inDialog && this.UIScene.keys.F.isDown)
            this.handleFKey()

        // Animar a interação
        if (this.interactionText.alpha !== (this.inProximity ? 1 : 0)) {
            this.scene.tweens.add({
                targets: this.interactionText,
                alpha: this.inProximity ? 1 : 0,
                duration: 300,
                ease: 'Power2'
            })
        }
    }

    initiateDialog() {
        if (this.UIScene.isOnDialog) return
        if (!this.UIScene.dialogIsBooted) this.UIScene.bootDialog()

        this.UIScene.dialog.setDialogList(this.dialogList, false)
        this.inDialog = true
        this.UIScene.isOnDialog = true
        this.scene.player.inDialog = true
    }

    handleFKey() {
        const currentTime = this.scene.time.now

        // Verificar cooldown antes de iniciar o diálogo
        if (this.inProximity && !this.inDialog && currentTime - this.lastDialogTime > this.dialogCooldown && !this.UIScene.isOnDialog) {
            this.initiateDialog()
            this.lastDialogTime = currentTime
        }
    }

    handleSpaceKey() {
        const currentTime = this.scene.time.now
        if (currentTime - this.lastDialogTime >= 1000) {
            this.lastDialogTime = currentTime
            this.UIScene.goToNextDialog()

            // Se o diálogo terminou, finalize o estado de diálogo
            if (!this.UIScene.dialog.isOnDialog) {
                this.inDialog = false
                this.UIScene.isOnDialog = false
                this.scene.player.inDialog = false
            }
        }
    }
}
