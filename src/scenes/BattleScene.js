import BattlePlayer from '../objects/player/BattlePlayer'
import BattleEnemy from '../objects/enemies/BattleOrc'
import { GlobalSettingsVolume } from '../components/ui.js'
import { MusicManager } from '../plugins/MusicManager.js' // Importa o AudioManager

import { TextButton, Row } from 'phaser-ui-tools'

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('BattleScene')


        // Array de mensagens
        const MENSSAGES_PT_BR = [
            "Porque eu ainda tento...",
            "Invasão no Domingo é sacanagem.",
            "Os Orcs são iguais.",
            "Língua FOM? Essa língua não havia sido extinta?",
            "Sério, podemos conversar? Eu sou apenas um bardo.",
            "Calma, Arquimedes... É só um Orc.",
            "Tá achando o quê? Rapadura é doce, mas não é mole não.",
            "Em pensar que eu poderia estar dormindo.",
            "É sempre comigo... Nunca com o guerreiro.",
            "Isso aqui tá mais complicado que um acorde diminuto.",
            "Tô vendo que o dia promete.",
            "Se isso fosse um ensaio, eu já tinha desistido.",
            "Eu só queria tocar uma música, não lutar com Orcs!",
            "Se der ruim, a culpa é da flauta.",
            "Quem inventou essas missões? Eu não assinei pra isso.",
            "Vou precisar de mais que um acorde para sair dessa.",
            "Por que sempre sou eu o escolhido? Cadê o protagonista?",
            "Isso não estava no contrato.",
            "Espero que pelo menos tenha XP no final disso.",
            "Lutar ou correr? Decisões, decisões...",
            "Quem dera um café agora...",
            "Bom, pelo menos não é segunda-feira.",
            "Será que dá tempo de compor uma balada sobre isso?",
            "É isso que dá confiar no GPS mágico.",
            "Pelo visto, improviso vai ser a chave hoje."
        ]

        const MESSAGES_EN = [
            "Why do I even try...",
            "An invasion on Sunday? Seriously?",
            "Orcs... They're all the same.",
            "FOM language? I thought that was extinct!",
            "Can we just talk? I'm just a bard.",
            "Calm down, Archimedes... It's just an Orc.",
            "Think it's easy? Sugarcane is sweet, but it's tough.",
            "I could be sleeping right now.",
            "It's always me... Never the warrior.",
            "This is more complicated than a diminished chord.",
            "Looks like today’s gonna be fun... Not.",
            "If this were a rehearsal, I would've quit already.",
            "I just wanted to play music, not fight Orcs!",
            "If this goes south, blame the flute.",
            "Who came up with these quests? I didn’t sign up for this.",
            "I’ll need more than a chord to get out of this.",
            "Why am I always the chosen one? Where’s the protagonist?",
            "This wasn’t in the contract.",
            "I hope there’s XP at the end of this.",
            "Fight or run? Decisions, decisions...",
            "A coffee would be nice right now...",
            "Well, at least it’s not Monday.",
            "Do I have time to write a ballad about this?",
            "This is what happens when you trust a magical GPS.",
            "Looks like improvisation is the key today."
        ]

        // Função para pegar uma mensagem aleatória
        function getRandomMessage() {
            const randomIndex = Math.floor(Math.random() * MENSSAGES_PT_BR.length)
            return navigator.language === 'pt-BR' ? MENSSAGES_PT_BR[randomIndex] : MESSAGES_EN[randomIndex]
        }

        this.dialogList = [
            {
                isDialog: true,
                text: "Kudo Archimède, a lin ɖɔ emi sixu ɖu ɖo ji ce nugbo wɛ a ? HAHAHA",
                name: "Orc",
                color: "16776960"
            },
            {
                isDialog: true,
                text: "Porque vocês nos atacam?",
                name: "Arquimedes",
                color: "16776960"
            },
            {
                isDialog: true,
                text: "ɖó a yí nǔ e nyí mǐtɔn lɛ́ɛ bǐ.",
                name: "Orc",
                color: "16776960"
            },
            {
                isDialog: true,
                text: "Xó ko kpé, mi nú mǐ ni fun ahwan!",
                name: "Orc",
                color: "16776960"
            },
            {
                isDialog: true,
                text: getRandomMessage(),
                name: "Arquimedes",
                color: "16776960"
            }
        ]

        this.isStarted = false
    }

    init(data) {
        this.game.config.currentMainScene = this
        this.player = data.player
        this.enemy = data.enemy
        this.UIScene = data.UIScene
    }

    create() {

      // Toca música de menu
      this.musicManager = new MusicManager(this);
      this.musicManager.setScene('combate');  // Configura a música para a cena 'game'
      this.musicManager.switchMusic('combate', 10); // Ou 'game', dependendo da cena
      this.musicManager.playMusic() // Toca a música

        this.UIScene.isPlayerOnBattle = true
        this.scene.bringToTop(this.UIScene)

        this.add.image(0, 0, 'bg-battleScene')
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)

        this.cameras.main.fadeIn(1000, 0, 0, 0)

        // Adiciona o delay antes de iniciar o diálogo
        this.time.delayedCall(400, () => {
            if (!this.UIScene.dialogIsBooted) {
                this.UIScene.bootDialog()
            }
            this.UIScene.dialog.setDialogList(this.dialogList, false)
            this.UIScene.isOnDialog = true
        })

        const camera = this.cameras.main
        const enemyX = camera.width - 100

        this.battlePlayer = new BattlePlayer(this, 100, 100)
        this.battleEnemy = new BattleEnemy(this, enemyX, 100, this.enemy.key)
    }

    update() {
        // Verifica se o diálogo terminou e inicia a batalha uma única vez
        if (!this.isStarted && !this.UIScene.isOnDialog) {
            this.isStarted = true
            this.startBattle()
        }

        this.battlePlayer.update()
        this.battleEnemy.update()
    }

    startBattle() {
        console.log('Batalha iniciada!')

        this.createUI()
        // Aqui você adiciona a lógica específica para iniciar a batalha.
    }

    createUI() {
        this.popupBackground = this.add.nineslice(
            0,                                  // X
            this.cameras.main.height - 105,     // Y
            'bg-minimap',                       // Chave da textura
            null,                               // Frame (null se não usar)
            this.cameras.main.width,            // Largura desejada
            105,                                // Altura desejada
            40,                                 // Tamanho da borda esquerda
            40,                                 // Tamanho da borda direita
            20,                                 // Tamanho da borda superior
            20                                  // Tamanho da borda inferior
        )
            .setOrigin(0)

        // Botão de Atacar
        this.initialButtons = new Row(this, 115, this.cameras.main.height - 20)

        this.attackButtom = new TextButton(this, 0, 0, "btn-default-title", this.handleAttack
            , this, 0, 0, 0, 0)
            .setText('Atacar', { fontSize: 10 })

        this.runButtom = new TextButton(this, 0, 0, "btn-default-title", this.handleRun, this, 0, 0, 0, 0)
            .setText('Correr', { fontSize: 10 })

        this.nextButtom = new TextButton(this, 0, 0, "btn-default-title", function () {
            this.UIScene.goToNextDialog()
        }, this, 0, 0, 0, 0)
            .setText('Próximo', { fontSize: 10 })

        this.initialButtons.addNode(this.attackButtom, 0, 0)
        this.initialButtons.addNode(this.runButtom, 50, 0)
        this.initialButtons.addNode(this.nextButtom, 50, 0)
    }

    handleAttack() {
        this.dialogListQuests = [
            {
                isDialog: true,
                text: "Enem (2022)  Um estudante escreveu corretamente o número **1,35 bilhão** com todos os algarismos ao ouvir que essa foi a bilheteria de um filme no primeiro mês, qual nas opções é o número que ele ouviu.",
                color: "16776960"
            },
            {
                isDialog: true,
                text: "a) 135 000,00  b) 1 350 000,00  c) 13 500 000,00  d) 135 000 000,00  e) 1 350 000 000,00",
                color: "16776960"
            }
        ]

        this.UIScene.dialog.setDialogList(this.dialogListQuests, false)
        this.UIScene.isOnDialog = true
    }

    handleRun() {
        this.scene.pause(this)
        this.scene.resume('GameScene')
    }



}
