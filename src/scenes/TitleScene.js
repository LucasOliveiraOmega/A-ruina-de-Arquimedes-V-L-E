import { Column, TextButton } from "phaser-ui-tools"
import { initI18next, GlobalSettings } from './Boot.js'
import { GlobalSettingsVolume } from '../components/ui.js';
import { MusicManager } from '../plugins/MusicManager.js' // Importa o AudioManager
import i18next from 'i18next'

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super("TitleScene")
        this.musicManager = null
    }

    init() {
        // Configura o idioma inicial
        this.globalLanguage = GlobalSettings.language || 'en'
        initI18next(this.globalLanguage, this.cache)
        this.game.config.currentMainScene = this
    }

    create() {

        this.musicManager = new MusicManager(this); 
        this.musicManager.setScene('game');  // Configura a música para a cena 'game'
        this.musicManager.switchMusic('game', 20); // Ou 'game', dependendo da cena
        this.musicManager.playMusic() // Toca a música
        this.musicManager.setVolume(GlobalSettingsVolume.volume.general) // Aplicando volume global
   

        // Fundo animado
        this.background = this.add.video(0, 0, 'background-animated-1')
            .setOrigin(0)
            .setScale(0.6)
            .play(true)

        this.backgroundShadow = this.add.graphics()
            .fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 1, 1, 1, 0)
            .fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height)
            .generateTexture('gradientTexture', this.sys.game.config.width, this.sys.game.config.height)

        this.add.sprite(0, 0, 'gradientTexture').setOrigin(0)

        // Logo
        this.logo = this.add.image(110, 45, 'logo-game').setScale(0.4)

        const btnsColumn = new Column(this, 40, 110)

        // Criação dos botões com textos
        this.buttonConfig = [
            { key: "START", action: () => this.startGame() },
            { key: "SETTING", action: () => this.scene.launch('Config', { scene: this }) },
            { key: "CREDITS", action: () => this.scene.launch('Credits', { scene: this }) }
        ]

        this.buttons = this.buttonConfig.map(({ key, action }) => {
            const button = new TextButton(this, 0, 0, "btn-default-title", action, this, 0, 0, 0, 0)
                .setText(i18next.t(key), { fontSize: 10 })

            button.button
                .on('pointerover', () => button.setScale(1.04))
                .on('pointerout', () => button.setScale(1))

            btnsColumn.addNode(button, 0, 5)
            return button
        })

        // Ícone do GitHub
        this.githubIcon = this.add.image(0, 0, 'social-media-spritesheet', 23)
            .setDisplaySize(20, 20)
            .setInteractive()
            .on('pointerdown', () => window.location.href = "https://github.com/TheRodrig0/A-ruina-de-Arquimedes")
            .on('pointerover', () => this.githubIcon.setTint(0xDDDDDD).setDisplaySize(22, 22))
            .on('pointerout', () => this.githubIcon.clearTint().setDisplaySize(20, 20))

        const socialMediaColumn = new Column(this, this.game.config.width * 0.94, this.game.config.height * 0.9)
        socialMediaColumn.addNode(this.githubIcon, 5, 0)

        // Escuta a mudança de idioma
        this.events.on('languageChanged', this.updateButtonTexts, this)
    }

    // Atualiza o texto de todos os botões
    updateButtonTexts() {
        this.buttons.forEach((button, index) => {
            button.setText(i18next.t(this.buttonConfig[index].key), { fontSize: 10 })
        })
    }

    startGame() {
        this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0, (camera, progress) => {
                if (progress === 1) {
                    this.scene.start('GameScene')
                    this.children.each(gameObject => gameObject.destroy(true))
                }
            })
        })
    }
}
