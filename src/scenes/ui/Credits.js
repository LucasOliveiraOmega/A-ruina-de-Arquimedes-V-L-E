"use strict"

import Popup from '../../components/Popup.js';
import { initI18next, GlobalSettings  } from '../Boot.js';
import i18next from 'i18next';

export default class Credits extends Phaser.Scene {
    constructor() {
        super("Credits")
    }

    init(data) {
        this.currentScene = data.scene || undefined
          // Configura o idioma inicial
          this.globalLanguage = GlobalSettings.language || 'en';
          initI18next(this.globalLanguage, this.cache);
    }

    create() {
        if (this.currentScene)
            this.scene.pause(this.currentScene)

        this.background = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000)
            .setOrigin(0)
            .setAlpha(0.5)
            .setDepth(0) // Definido com profundidade 0 para que fique atrás dos popups

        const popup = new Popup(this, {
            width: 200,
            height: 200,
            bgImage: 'bg-popup',
            closeBtnImage: 'close-button',
            onClose: () => {
                this.scene.run(this.currentScene)
                this.children.each(gameObject => gameObject.destroy(true))
            },
            gameObjects: [
                this.add.text(0, 0, i18next.t('CREDITS'), { color: '#000000', padding: { bottom: 10 } }),
                this.add.text(0, 0, 'Rafael C. Perondi\nVictor R. Lima\nLucas S. Oliveira\nMurilo V. S. Pedroso\nRodrigo J. Q. Silva', { color: '#000000', fontSize: 12 })
            ]
        })


    }


}
