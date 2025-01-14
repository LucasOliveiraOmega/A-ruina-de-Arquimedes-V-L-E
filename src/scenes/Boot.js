"use strict"

import i18next from 'i18next'

// Inicializa o i18next para o gerenciamento de idiomas
export function initI18next(globalLanguage, cache) {
    return i18next.init({
        lng: globalLanguage,
        resources: {
            en: { translation: { ...cache.json.get('en'), ...cache.json.get('enDialog') } },
            pt: { translation: { ...cache.json.get('pt'), ...cache.json.get('ptDialog') } },
        }
    })
}

// Função para mudar o idioma e atualizar a configuração global
export function changeLanguage(language) {
    i18next.changeLanguage(language)
    GlobalSettings.language = language
}

// GlobalSettings.js
export const GlobalSettings = {
    language: null
}

export default class Boot extends Phaser.Scene {
    constructor() {
        super("Boot")
    }

    preload() {
        this.load.on('complete', () => {
            this.input.keyboard.on('keydown', () => {
                this.children.each(gameObject => gameObject.destroy())
                this.scene.start('Preloader')
            })
        })

        this.load.setPath('./assets/')

        this.load.font('pixelDigivolve', 'fonts/pixelDigivolve.ttf')
        this.load.font('pixelsix', 'fonts/pixelsix.ttf')

        // Carregar os arquivos de tradução
        this.load.json('en', 'i18next/menu/en.json')
        this.load.json('pt', 'i18next/menu/pt.json')

        // Carregar os arquivos de tradução
        this.load.json('enDialog', 'i18next/dialog/enDialog.json')
        this.load.json('ptDialog', 'i18next/dialog/ptDialog.json')

        this.game.config.defaultFontFamily = 'pixelsix'
    }

    create() {
        this.txtContinue = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY * 1.6,
            'Press any key to start the game',
            {
                fontFamily: this.game.config.defaultFontFamily,
                fontSize: 12
            }
        )
            .setOrigin(0.5)

        this.tweens.add({
            targets: this.txtContinue,
            alpha: 0, // Define a opacidade para 0 (totalmente transparente)
            duration: 1000, // Duração em milissegundos
            yoyo: true, // Faz o tween voltar ao valor original
            repeat: -1 // Repete infinitamente
        })

    }
}