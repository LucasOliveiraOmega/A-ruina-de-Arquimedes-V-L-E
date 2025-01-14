import BattleCharacter from "../BattleCharacter"

export default class BattlePlayer extends BattleCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'player-idle', 5, 5, 2, 'battlePlayer')

        this.animations = [
            { name: 'player-idle', start: 0, end: 8, frameRate: 1, repeat: -1, yoyo: true },
            { name: 'player-walk', start: 0, end: 2, frameRate: 3, repeat: -1 },
            { name: 'player-death', start: 0, end: 2, frameRate: 6, repeat: -1 },
            { name: 'player-attack-guitar', start: 0, end: 2, frameRate: 6, repeat: -1 },
        ]

        this.initBattlePlayer()
    }

    initBattlePlayer() {
        if (this.animations && this.animations.length) {
            this.createAnims(this.animations)
        } else {
            console.warn('No animations defined for BattlePlayer')
        }
        this.anims.play('player-idle', true)
    }

    setHealth(health) {
        this.health = health
        this.maxHealth = health
    }

    getHealth() {
        return this.health
    }

    applyDamage(damage) {
        this.health -= damage
        if (this.health < 0) {
            this.health = 0
        }
    }

    takeDamage(damage) {
        this.health -= damage
    
        if (this.health <= 0) {
            this.health = 0
            this.die() // Adicione aqui a lógica de morte, se necessário
        }
    
        // Reproduz animação de dano ou qualquer efeito desejado
        this.play('player-take-damage') // Exemplo de animação de dano
    
        // Atualiza a barra de saúde do jogador
        this.scene.updatePlayerHealthBar()
    }    

    // Método para lidar com a morte do jogador
    die() {
        this.isDead = true
        this.states.dead()
        console.log("Player died!") // Verifique se o jogador morreu
    }    

    // Estados de animação do jogador
    states = {
        idle: () => {
            if (!this.isDead) {
                this.anims.play('player-idle', true)
            }
        },
        walk: () => {
            if (!this.isDead) {
                this.anims.play('player-walk', true)
            }
        },
        attack: () => {
            if (!this.isDead) {
                this.anims.play('player-attack-guitar', true)
            }
        },
        takeDamage: () => {
            if (!this.isDead) {
                this.flashDamage()
            }
        },
        dead: () => {
            this.anims.play('player-death', true)
        },
    }

    // Função para flash de dano (pode ser uma animação simples ou mudança de cor)
    flashDamage() {
        this.setTint(0xff0000) // Exemplo de efeito de dano (tint vermelho)
        this.scene.time.delayedCall(100, () => {
            this.clearTint() // Remove o efeito após 100ms
        })
    }

    // Atualiza o estado e animações do jogador
    update() {
        super.update()
        this.transitionTo('idle')
    }
}
