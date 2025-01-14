export default class DaltonismFilter {
    constructor(game) {
        this.game = game

        this.pipelines = {
            tritanopiaFilterPipeline: this.game.config.pipeline['tritanopiaFilter'],
            protanopiaFilterPipeline: this.game.config.pipeline['protanopiaFilter'],
            protanomaliaFilterPipeline: this.game.config.pipeline['protanomaliaFilter'],
            deuteranopiaFilterPipeline: this.game.config.pipeline['deuteranopiaFilter'],
            monocromaciaFilterPipeline: this.game.config.pipeline['monocromaciaFilter'],
        }

        this.currentPipeline = null
    }

    setFilter(type) {
        this.removeFilter()

        switch (type) {
            case 'Monocromacia':
            case 'monocromacia':
                this.currentPipeline = this.pipelines.monocromaciaFilterPipeline
                break
            case 'Tritanopia':
            case 'tritanopia':
                this.currentPipeline = this.pipelines.tritanopiaFilterPipeline
                break
            case 'Protanopia':
            case 'protanopia':
                this.currentPipeline = this.pipelines.protanopiaFilterPipeline
                break
            case 'Protanomalia':
            case 'protanomalia':
                this.currentPipeline = this.pipelines.protanomaliaFilterPipeline
                break
            case 'Deuteranopia':
            case 'deuteranopia':
                this.currentPipeline = this.pipelines.deuteranopiaFilterPipeline
                break
        }

        this.game.scene.scenes.forEach(scene => {
            if (this.currentPipeline === null || scene.cameras.main === null || scene.cameras.main === undefined) return
            scene.cameras.main.setPostPipeline(this.currentPipeline)
        })

    }

    removeFilter() {
        this.currentPipeline = null

        this.game.scene.scenes.forEach(scene => {
            if (scene.cameras.main === null || scene.cameras.main === undefined) return
            scene.cameras.main.resetPostPipeline(true)
        })
    }

}
