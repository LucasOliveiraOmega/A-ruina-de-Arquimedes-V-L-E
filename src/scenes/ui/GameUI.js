"use strict"

import { Row } from 'phaser-ui-tools'

export default class GameUI extends Phaser.Scene {
    constructor() {
        super("GameUI")
        this.dialogIsBooted = false
        this.isOnDialog = false
        this.keys = {}
        this.isPlayerOnBattle = false
    }

    init(data) {
        this.gameScene = data.gameScene || null
        this.map = data.map || null
        this.player = data.player || null
    }

    create() {
        this.keys = {
            F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
            SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        }

        const minimapCameraSize = 60

        this.minimap = this.gameScene.cameras.add(this.gameScene.cameras.main.width - minimapCameraSize - 7, 7, minimapCameraSize, minimapCameraSize)
            .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
            .setZoom(0.13)
            .setBackgroundColor('#000000')
            .startFollow(this.player)

        this.minimapBackground = this.gameScene.add.image((this.minimap.x + minimapCameraSize + 2.5) / this.gameScene.cameras.main.zoom, 29, 'bg-minimap')
            .setDisplaySize(minimapCameraSize - 5, minimapCameraSize - 5)
            .setOrigin(0)
            .setScrollFactor(false)
            .setDepth(10)

        this.configBtn = this.add.image(0, 0, 'Menu-btns-image')
            .setFrame(3)
            .setScale(0.8)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.launch('Config', { scene: this.gameScene || this })
            })

        this.row = new Row(this, this.sys.game.config.width * 0.93, 68)
        this.row.addNode(this.configBtn)

        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.isPlayerOnBattle)
                this.goToNextDialog()
        })
    }

    bootDialog() {
        if (!this.dialog) return
        this.dialogIsBooted = true

        this.dialog.setup(this)
        this.dialog.initialize({
            fontFamily: this.game.config.defaultFontFamily,
            fontSize: 11,
            borderThickness: 3,
            windowHeight: 60,
            addCloseButton: false,
            atBottom: true,
            visible: false,
            offsetConfig: 8,
            paddingAvatar: 9,
            paddingInnerY: 10,
            paddingInnerX: 10,
        })

    }

    goToNextDialog() {
        if (this.dialog) this.dialog.goToNextPieceOfDialog()
    }


}
