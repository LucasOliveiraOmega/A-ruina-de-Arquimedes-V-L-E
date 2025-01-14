import { createMapLayers } from "../utils/tileset"
import TeleportManager from "../plugins/TeleportManager"
import Player from "../objects/player/Player.js"
import Orc from "../objects/enemies/Orc"
import NPC from "../objects/NPC"
import { initI18next, GlobalSettings } from './Boot.js'
import { GlobalSettingsVolume } from '../components/ui.js'
import { MusicManager } from '../plugins/MusicManager.js' // Importa o AudioManager
import i18next from 'i18next'

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene')
        this.orcIndex = 1
        this.isFirstGameStart = true
        this.orcsDeadList = []
        this.musicManager = null
    }

    init(data) {
        // Configura o idioma inicial
        this.globalLanguage = GlobalSettings.language || 'en'
        initI18next(this.globalLanguage, this.cache)
        this.game.config.currentMainScene = this

        this.playerPosition = data.playerPosition
    }

    create() {
        /*  */
                // Toca música de menu
                this.musicManager = new MusicManager(this);
                this.musicManager.setScene('castle');  // Configura a música para a cena 'game'
                this.musicManager.switchMusic('castle', 10); // Ou 'game', dependendo da cena
                this.musicManager.playMusic() // Toca a música
      
        this.cameras.main.fadeFrom(5000, 0, 0, 0)

        // Carrega o mapa e define os limites do mundo
        this.map = this.make.tilemap({ key: 'map-JSON' })
        this.spawnPoints = this.createSpawnPointsMap()
        this.atlasImage = this.map.addTilesetImage('atlas', 'atlas-image')

        const config = {
            scene: this,
            tilesetImage: this.atlasImage,
            map: this.map,
            layers: [
                { name: 'ground' },
                { name: 'buildBase' },
                { name: 'treesBase' },
                { name: 'props' },
                { name: 'treesTop' },
                { name: 'buildTop' },
                { name: 'props2' },
            ],
        }
        createMapLayers(config)
        this.animatedTiles.init(this.map)

        const gridEngineConfig = {
            characters: [],
            numberOfDirections: 8,
            collisionTilePropertyName: "collider",
            pathCacheLimit: 50,
            collisionDetectionInterval: 300,
        }

        this.gridEngine.create(this.map, gridEngineConfig)

        if (this.isFirstGameStart) {
            this.initDialog()
            this.isFirstGameStart = false
        }

        const playerSpawnPoint = this.spawnPoints['player-spawn']
        this.player = new Player(this, playerSpawnPoint.x, playerSpawnPoint.y, 'player-idle')

        this.npcs = this.add.group()
        this.enemies = this.add.group()

        this.createNPCS()
        this.createOrcs()
        this.createTeleporters()
        this.createCamera()

        this.scene.launch('GameUI', { gameScene: this, map: this.map, player: this.player })
    }

    update() {
        if (this.player) this.player.update()

        this.updateEntities(this.enemies, this.player)
        this.updateEntities(this.npcs, this.player)

        if (this.teleportManager) this.teleportManager.update(this.player.id)
    }

    createCamera() {
        this.cameras.main.setBackgroundColor('#201020')
        this.cameras.main.setZoom(1.32)
        this.cameras.main.startFollow(this.player)
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
    }

    createSpawnPointsMap() {
        return this.map.getObjectLayer('spawns').objects.reduce((map, obj) => {
            map[obj.name] = obj
            return map
        }, {})
    }

    createTeleporters() {
        const entrancesAndExitsObjects = this.map.getObjectLayer('entrancesAndExits')
        this.teleportManager = new TeleportManager(this, this.gridEngine, entrancesAndExitsObjects, this.player.id)

        const teleportPairs = [
            ['entrance1House1Village1', 'exit1House1Village1'],
            ['entrance1House2Village1', 'exit1House2Village1'],
            ['entrance1House3Village1', 'exit1House3Village1'],
            ['entranceCastleDoor', 'exitCastleDoor'],
            ['entranceCastleLadderThrone', 'exitCastleLadderThrone'],
            ['entranceCastleDoorDungeon', 'exitCastleDoorDungeon'],
            ['entranceCastleWall', 'exitCastleWall'],
        ]

        teleportPairs.forEach(([entrance, exit]) => {
            this.teleportManager.add(entrance, exit)
            this.teleportManager.add(exit, entrance)
        })
    }

    createOrcs() {
        for (const [key, obj] of Object.entries(this.spawnPoints)) {
            if (key.startsWith('orc-spawn')) {
                let orc = this.enemies.getFirstDead()
                if (!orc) {
                    orc = new Orc(this, obj.x, obj.y)
                    this.enemies.add(orc)
                } else {
                    orc.setPosition(obj.x, obj.y).setActive(true).setVisible(true)
                }
            }
        }
    }

    createNPCS() {
        const npcData = this.cache.json.get('npcData').npcs
        npcData.forEach(npcConfig => {
            const spawnPoint = this.spawnPoints[npcConfig.spawnPointName]
            if (!spawnPoint) {
                console.warn(`Spawn point ${npcConfig.spawnPointName} não encontrado para NPC:`, npcConfig.spriteKey)
                return
            }

            const npc = new NPC(
                this,
                spawnPoint.x,
                spawnPoint.y,
                npcConfig.spriteKey,
                npcConfig.animations,
                npcConfig.dialogList.map(dialog => ({
                    ...dialog,
                    text: i18next.t(dialog.textId)  // Obtém a tradução usando o textId
                })),
                npcConfig.canMove || false,
                npcConfig.speed || 2,
                npcConfig.pathName || null,
            )

            npc.setScale(0.5)
            this.npcs.add(npc)
        })
    }

    initDialog() {
        this.gameUI = this.scene.get('GameUI')
        this.gameUI.bootDialog()
        this.gameUI.dialog.setDialogList(
            [{
                "isDialog": true,
                "text": i18next.t("DialogInicial"),
                "name": "Arquimedes",
                "nameColor": 16776960
            }],
            false
        )

        this.cameras.main.shake(2000, 0.016)
    }

    updateEntities(group, player) {
        group.children.each(entity => {
            entity.update(player)
        })
    }
}
