import ASSETS from "../constants/assets"

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader')
    }

    preload() {
        this.load.setPath('./assets/')

        // Carregar todas as categorias
        this.loadAssets(ASSETS)

        // Criar gráficos de carregamento
        this.createLoadingGraphics()

        // Eventos
        this.load.on('progress', this.updateProgress, this)
        this.load.on('filecomplete', this.updateFileProgress, this)
        this.load.on('complete', this.completeLoading, this)
    }

    loadAssets(assets) {
        // Adicionando 'font' ao array de tipos de arquivos do Phaser
        const fileTypes = Object.keys(Phaser.Loader.FileTypes).concat('font')  // Usa 'concat' para adicionar 'font'

        for (const category in assets) {
            // Verifica se a categoria existe nos tipos de arquivos do Phaser
            if (fileTypes.map(key => key.replace(/File$/, '').toLowerCase()).includes(category.toLowerCase())) {
                // Loop para carregar os assets dentro da categoria
                for (let key in assets[category]) {
                    const asset = assets[category][key]
                    switch (category) {
                        case 'image':
                            this.load.image(key, asset)
                            break
                        case 'spritesheet':
                            const { path, frameWidth, frameHeight } = asset
                            this.load.spritesheet(key, path, { frameWidth, frameHeight })
                            break
                        case 'audio':
                            this.load.audio(key, asset)
                            break
                        case 'tilemapJSON':
                            this.load.tilemapTiledJSON(key, asset)
                            break
                        case 'video':
                            this.load.video(key, asset)
                            break
                        case 'json':
                            this.load.json(key, asset)
                            break
                        default:
                            console.warn(`Categoria "${category}" não tratada!`)
                    }
                }
            } else {
                console.log(`A categoria ${category} não existe no Phaser`)
            }
        }
    }

    createLoadingGraphics() {
        this.progressBox = this.add.graphics({ fillStyle: { color: 0x222222 } })
        this.progressBox.fillRoundedRect(this.cameras.main.centerX - 105, this.cameras.main.centerY - 12, 210, 24, 10)

        this.progressBar = this.add.graphics({ fillStyle: { color: 0xFFFFFF } })
        this.progressBar.fillRoundedRect(this.cameras.main.centerX - 100, this.cameras.main.centerY - 10, 200, 20, 10)

        this.percentText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '0%', {
            fill: '#000000',
            fontStyle: this.game.config.defaultFontFamily
        })
            .setOrigin(0.5, 0.5)

        this.assetText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY * 1.2, 'Loading asset: ', {
            fill: '#ffffff',
            fontStyle: this.game.config.defaultFontFamily,
            fontSize: 6
        })
            .setOrigin(0.5, 0.5)
    }

    updateProgress(value) {
        this.percentText.setText(parseInt(value * 100) + '%')
        this.progressBar.clear()
        let width = 200 * value
        let radius = width < 20 ? width / 2 : 10 // Ajusta o raio da borda dinamicamente
        this.progressBar.fillRoundedRect(this.cameras.main.centerX - 100, this.cameras.main.centerY - 10, width, 20, radius)
    }

    updateFileProgress(key) {
        this.assetText.setText(`Loading asset: ${key}`)
    }

    completeLoading() {
        this.children.each(gameObject => gameObject.destroy())
        this.scene.start('Intro')
    }
}
