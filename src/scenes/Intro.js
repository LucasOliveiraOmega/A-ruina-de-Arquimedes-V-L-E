 "use-strict"

import  {GlobalSettingsVolume}  from '../components/ui.js'
import { MusicManager } from '../plugins/MusicManager.js' // Importa o AudioManager

export default class Intro extends Phaser.Scene {
    constructor() {
        super("Intro")
        this.musicManager = null
    }

    create() {
        this.createContinueText()
        this.createKeyboardEvent()
        this.createLogoPhaser()
        this.createMusicManager()  // Criando o gerenciador de música   
    }

    createContinueText() {
        const { centerX, centerY } = this.cameras.main
        this.txtContinue = this.add.text(
            centerX * 1.75,
            centerY * 1.9,
            'Press any key to skip',
            {
                fontFamily: this.game.config.defaultFontFamily,
                fontSize: 10
            }
        )
        .setOrigin(0.5)
        .setAlpha(0.6)

        this.addTween(this.txtContinue, 1000, -1)
    }

    createKeyboardEvent() {
        this.input.keyboard.on('keydown', () => {
            this.children.each(gameObject => gameObject.destroy(true))
            this.scene.start('TitleScene')
        })
    }

    createLogoPhaser() {
        const { centerX, centerY } = this.cameras.main
        this.logoPhaser = this.add.image(centerX, centerY, 'logo-phaser')
            .setAlpha(0)
            .setScale(0.03)

        this.addTween(this.logoPhaser, 2000, 0, () => this.createLogoGame())
    }

    createLogoGame() {
        const { centerX, centerY } = this.cameras.main
        this.logoGame = this.add.image(centerX, centerY, 'logo-game')
            .setAlpha(0)
            .setScale(0.3)

        this.addTween(this.logoGame, 2000, 0, () => this.scene.start('TitleScene'))
    }

    addTween(target, duration, repeat = 0, onComplete = null) {
        this.tweens.add({
            targets: target,
            alpha: { from: 0, to: 1 },
            duration: duration,
            yoyo: true,
            repeat: repeat,
            onComplete: onComplete
        })
    }

    // Criando o gerenciador de música 
    createMusicManager() {
        // Instanciando o MusicManager
          // No seu código de cena, você pode fazer assim:
          this.musicManager = new MusicManager(this);
          this.musicManager.setScene('menu'); // Ou 'game', dependendo da cena
          this.musicManager.playMusic()
          this.musicManager.setVolume(GlobalSettingsVolume.volume.music) // Aplicando volume global
       }
}
