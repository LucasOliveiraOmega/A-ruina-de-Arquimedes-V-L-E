"use strict"
import Phaser from 'phaser'
import Popup from '../../components/Popup.js'
import { initI18next, changeLanguage, GlobalSettings  } from '../Boot.js'
import { createButton, GlobalSettingsVolume, createValueBar} from '../../components/ui.js'
import i18next from 'i18next'
import DaltonismFilter from '../../utils/DaltonismFilter.js'

export default class Config extends Phaser.Scene {
    constructor() {
        super('Config')
    }

    init(data) {
        this.currentScene = this.game.config.currentMainScene
        this.globalVolume = GlobalSettingsVolume.volume
        this.currentPopup = null
        this.previousPopup = null
        this.daltonicFilter = null

        // Configura o idioma globalmente ou define o padrão para 'en'
        this.globalLanguage = GlobalSettings.language || 'en'
    }

    create() {
        this.updateAudioVolume()
        this._pauseCurrentScene()

        // Inicializa o i18next com o idioma global
        initI18next(this.globalLanguage, this.cache).then(() => {
            const basicPopupConfig = {
                width: 200,
                height: 200,
                bgImage: 'bg-popup',
                closeBtnImage: 'close-button',
                orientation: 'column'
            }

            this.background = this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000)
                .setOrigin(0)
                .setAlpha(0.5)
                .setDepth(0)

            this.showConfigPopup(basicPopupConfig)
        })
    }

    showConfigPopup(basicPopupConfig) {
        if (this.currentPopup) this.currentPopup.destroy()

        const popup = new Popup(this, {
            ...basicPopupConfig,
            onClose: () => {
                this.scene.run(this.currentScene)
                this.children.each(gameObject => gameObject.destroy(true))
            },
            gameObjects: [
                this.add.text(0, 0, i18next.t('SETTINGS'), { fill: '#000', padding: { bottom: 20, top: 3 } }),
                createButton(this, 0, 0, i18next.t('VOLUME'), () => this.showVolumePopup(), '', '#000', '#555', { bottom: 10 }),
                createButton(this, 0, 0, i18next.t('IDIOMS'), () => this.showIdiomaPopup(basicPopupConfig), '', '#000', '#555', { top: 0, bottom: 10 }),
                createButton(this, 0, 0, i18next.t('VIDEO'), () => this.showVideoPopup(basicPopupConfig), '', '#000', '#555', { top: 0, bottom: 10 }),
            ]
        })

        this.currentPopup = popup
    }

    showIdiomaPopup(basicPopupConfig) {
        if (this.currentPopup) this.currentPopup.destroy()

        const idiomaContent = [
            this.add.text(0, 0, i18next.t('IDIOMS'), { fill: '#000', padding: { bottom: 20, top: 3 } }),
            createButton(this, 0, 0, i18next.t('PORTUGUESE'), () => this.setLanguage('pt', basicPopupConfig), '', '#000', '#555', { bottom: 10 }),
            createButton(this, 0, 0, i18next.t('ENGLISH (USA)'), () => this.setLanguage('en', basicPopupConfig), '', '#000', '#555', { bottom: 30 }),
            createButton(this, 0, 0, i18next.t('Back'), () => this.showConfigPopup(basicPopupConfig), '', '#000', '#555', { bottom: 10 })
        ]

        const idiomaPopup = new Popup(this, {
            ...basicPopupConfig,
            gameObjects: idiomaContent,
            onClose: () => {
                this.currentPopup = null
                this._resumeCurrentScene()
            }
        })

        this.currentPopup = idiomaPopup
    }
    
        setLanguage(language, basicPopupConfig) { 
            GlobalSettings.language = language
            changeLanguage(language)
            
            // Atualiza os diálogos do dialogList dos NPCs na GameScene
            const gameScene = this.scene.get('GameScene')
            if (gameScene && gameScene.npcs) {
                gameScene.npcs.children.each(npc => {
                    npc.dialogList = npc.dialogList.map(dialog => ({
                        ...dialog,
                        text: i18next.t(dialog.textId)  // Atualiza a tradução com base no novo idioma
                    }))
                })
            }
            
            this.showConfigPopup(basicPopupConfig) // Atualiza a interface com o novo idioma
        
            // Dispara um evento para notificar que o idioma foi alterado
            this.scene.get('TitleScene').events.emit('languageChanged')
        }

    showVideoPopup(basicPopupConfig) {
        if (this.currentPopup) {
            this.currentPopup.destroy() // Fecha o pop-up atual antes de abrir outro
        }

        const videoContent = [
            this.add.text(0, 0, i18next.t('VIDEO'), { fill: '#000', padding: { bottom: 20, top: 3 } }),
             createButton(this, 0, 0, i18next.t('DALTONISM'), () => this.showDaltonismoPopup(basicPopupConfig), '', '#000', '#555', { bottom: 30 }),
            createButton(this, 0, 0, i18next.t('Back'), () => this.showConfigPopup(basicPopupConfig), '', '#000', '#555', { bottom: 10 }) // Botão para voltar ao menu anterior
        ]

        const videoPopup = new Popup(this, {
            ...basicPopupConfig,
            gameObjects: videoContent,
            onClose: () => {
                this.currentPopup = null // Limpar a referência
                this._resumeCurrentScene() // Retornar à cena anterior
            }
        })

        this.currentPopup = videoPopup // Atualiza a referência do pop-up atual
    }

    _pauseCurrentScene() {
        this.scene.pause(this.currentScene)
    }

    _resumeCurrentScene() {
        this.scene.stop()
        this.scene.resume(this.currentScene)
        this.children.each(gameObject => gameObject.destroy(true)) // Remove os objetos da cena anterior
    }

    selecionarIdioma(idioma) {
        // Lógica para selecionar o idioma
        console.log(`Idioma selecionado: ${idioma}`)
    }

    showDaltonismoPopup(basicPopupConfig) {
        const filterOptions = [
            { text: i18next.t('Deuteranopia'), value: 'deuteranopia' },
            { text: i18next.t('Protanopia'), value: 'protanopia' },
            { text: i18next.t('Tritanopia'), value: 'tritanopia' },
            { text: i18next.t('Monocromacia'), value: 'monocromacia' },
            { text: i18next.t('No Filter'), value: null }
        ]

        const daltonismoContent = [
            this.add.text(0, 0, i18next.t('DALTONISM'), { fill: '#000', padding: { bottom: 20, top: 3 } }),
            ...filterOptions.map((option, index) => createButton(
                this,
                0,
                0,
                option.text,
                () => this.applyDaltonismFilter(option.value),
                '14px', '#000', '#555', { top: 0, bottom: 8 }
            )), 
            createButton(this, 0, 0, i18next.t('Back'), () => this.showVideoPopup(basicPopupConfig), '', '#000', '#555') // Botão para voltar ao menu anterior
        ]

        const daltonismoPopup = new Popup(this, {
            ...basicPopupConfig,
            gameObjects: daltonismoContent,
            onClose: () => {
                this.currentPopup = null // Limpar a referência
                this._resumeCurrentScene() // Retornar à cena anterior
            }
        })

        this.currentPopup = daltonismoPopup // Atualiza a referência do pop-up atual
    }

    applyDaltonismFilter(filterType) {
        if (!this.daltonicFilter) {
            this.daltonicFilter = new DaltonismFilter(this.game)
        }

        if (!filterType) {
            this.daltonicFilter.removeFilter()
            console.log("Filtro de daltonismo removido.")
        } else {
            this.daltonicFilter.setFilter(filterType)
            console.log(`Aplicando filtro de daltonismo: ${filterType}`)
        }
    }
    
  showVolumePopup() {
    if (this.currentPopup) {
        this.currentPopup.destroy() // Fecha o pop-up atual antes de abrir outro
    }

    // Definindo as categorias de áudio
    const categories = [
        { label: i18next.t('general'), key: 'general' },
        { label: i18next.t('music'), key: 'music' },
        { label: i18next.t('creatures'), key: 'creatures' }
       ]

    // Título do pop-up
    const title = this.add.text(0, 0, i18next.t('VOLUME'), {
        font: "10px",
        fill: "#000",
      })

    // Cria as barras de volume para cada categoria
    const bars = categories.map((category) => this.createVolumeBar(category)).flat()

    // Define as posições manuais para os elementos (título e barras)
    const positions = [
        { x: 60, y: 2 },   // Posição do título mais acima
       
        { x: 30, y: 20 },   // Posição do label da primeira barra mais à esquerda e acima
        { x: 90, y: 20 },  // Posição do valor da primeira barra
        { x: 30, y: 33 },   // Posição da barra da primeira categoria
       
        { x: 30, y: 50 },  // Posição do label da segunda barra
        { x: 90, y: 50 }, // Posição do valor da segunda barra
        { x: 30, y: 63 },  // Posição da barra da segunda categoria
      
        { x: 30, y: 80 },  // Posição do label da terceira barra
        { x: 90, y: 80 }, // Posição do valor da terceira barra
        { x: 30, y: 93 },  // Posição da barra da terceira categoria
      
     ]

    // Criando o pop-up com todos os elementos e suas posições
    const volumePopup = new Popup(this, {
        width: 200,
        height: 200,
        bgImage: 'bg-popup',
        closeBtnImage: 'close-button',
        orientation: 'row',
        gameObjects: [title, ...bars],
        positions: positions, // Passando as posições manuais
        onClose: () => {
            this.currentPopup = null
            this._resumeCurrentScene()
        }
    })

    this.currentPopup = volumePopup
}

createVolumeBar(category) {
    // Cria o rótulo da categoria
    const label = this.add.text(0, 0, `${category.label}:`, {
        font: "10px",
        fill: "#000",
     })

    // Cria o texto que exibe o valor da barra
    const barText = this.add.text(0, 0, this.globalVolume[category.key].toFixed(1), {
        font: "10px",
        fill: "#000",
     })

    // Usa a função modular `createValueBar` para criar a barra de volume
    const bar = createValueBar(this, 0, 0, category.key, barText, this.globalVolume, this.updateAudioVolume.bind(this))

    // Retorna todos os elementos (label, texto e barra)
    return [label, barText, bar]
}

updateAudioVolume() {
    // Atualiza o volume de acordo com as configurações globais
    const audioSources = {
         music: 'music-background-menu',
         creatures: 'creatures-sound',
         general: 'music-background-game'
    }

    Object.keys(audioSources).forEach(key => {
        const sound = this.sound.get(audioSources[key])
        if (sound) {
            sound.setVolume(this.globalVolume[key])
        }
    })

}

}