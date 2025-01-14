"use strict"

import { Viewport, Column, Row, Scrollbar } from "phaser-ui-tools"

export default class Popup extends Phaser.GameObjects.Container {
    constructor(scene, { width = 100, height = 100, bgImage, closeBtnImage, onClose = () => { }, gameObjects = [], orientation = 'column', positions = [] } = {}) {
        super(scene)

        if (!scene) return

        this.scene = scene
        this.width = width
        this.height = height
        this.bgImage = bgImage
        this.closeBtnImage = closeBtnImage
        this.onClose = onClose
        this.gameObjects = gameObjects
        this.orientation = orientation
        this.positions = positions // Adicionamos uma lista de posições manuais

        this.createPopup()

        this.scene.add.existing(this)
    }

    createPopup() {
        const { centerX, centerY } = this.scene.cameras.main

        // Adiciona o background
        const bgPopup = this.scene.add.image(
            centerX,
            centerY,
            this.bgImage)
            .setDisplaySize(this.width, this.height)

        // Configura a coluna ou linha com base na orientação
        let container;
        if (this.orientation === 'column') {
            container = new Column(this.scene)
        } else if (this.orientation === 'row') {
            container = new Row(this.scene)
        }

        // Adiciona os objetos de jogo ao container
        this.gameObjects.forEach((gameObject, index) => {
            container.addNode(gameObject)

            // Configura posição com base na orientação
            if (this.orientation === 'column') {
                gameObject.setX(centerX * 0.375 - gameObject.width / 2)
                // Ajusta a posição vertical para manter alinhamento
             } else if (this.orientation === 'row') {
                // Se há posições manuais, usamos as posições fornecidas
                if (this.positions.length > 0) {
                    const pos = this.positions[index]
                    gameObject.setX(pos.x || centerX) // Posição horizontal manual
                    gameObject.setY(pos.y || centerY) // Posição vertical manual
                } else {
                    // Se não houver posições, faça o layout horizontal automático
                    gameObject.setX(centerX - (this.width / 2) + (index * (gameObject.width + 10)))
                    gameObject.setY(centerY) // Mantém o centro vertical fixo
                }
            }
        })

        // Configura o viewport
        this.viewport = new Viewport(this.scene,
            centerX - this.width * 0.4,
            centerY - this.height * 0.4,
            this.width * 0.8,
            this.height * 0.8)

        this.viewport.addNode(container)

        // Adiciona o botão de fechar
        const closeBtn = this.scene.add.image(
            centerX + this.width * 0.35,
            centerY - this.height * 0.35,
            this.closeBtnImage)
            .setDisplaySize(this.width * 0.05, this.height * 0.05)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                // Deleta o popup juntamente com todo o conteúdo
                [bgPopup, closeBtn, ...this.gameObjects].forEach(gameObject => gameObject.destroy(true))
                this.onClose()
            })

        // Adiciona as instâncias dos objetos à cena
        this.add(bgPopup)
        this.add(this.viewport)
        this.add(closeBtn)
    }
}


/*

Para usar com o ROW

const popup = new Popup(scene, {
    width: 400,
    height: 300,
    bgImage: 'popup-bg',
    closeBtnImage: 'close-btn',
    orientation: 'row',
    gameObjects: [gameObject1, gameObject2, gameObject3],
    positions: [
        { x: 100, y: 150 },
        { x: 200, y: 150 },
        { x: 300, y: 150 }
    ]
});


*/
