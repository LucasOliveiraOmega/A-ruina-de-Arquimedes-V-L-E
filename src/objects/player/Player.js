import Character from "../Character"

export default class Player extends Character {
    constructor(scene, x, y, textureKey) {
        super(scene, x, y, textureKey, 5, 5, 5, 'player')

        this.animations = [
            { name: 'player-idle', start: 0, end: 8, frameRate: 1, repeat: -1, yoyo: true },
            { name: 'player-walk', start: 0, end: 2, frameRate: 3, repeat: -1 },
            { name: 'player-death', start: 0, end: 2, frameRate: 6, repeat: -1 },
            { name: 'player-attack-guitar', start: 0, end: 2, frameRate: 6, repeat: 0 }, // Sem repetição
        ]

        this.keys = this.scene.input.keyboard.addKeys({
            up: 'W',
            left: 'A',
            down: 'S',
            right: 'D',
            attack: 'SPACE'
        })

        this.lastUpdateTime = 0
        this.lastPositionUpdate = 0

        this.inDialog = false
        this.isAttacking = false // Controla se o jogador está atacando
        this.initPlayer()

        this.loadPlayerData()
    }

        async loadPlayerData() {
            try {
                if (!this.playerId) {
                    throw new Error('Player ID não definido')
                }
        
                const response = await fetch(`/api/player/${this.playerId}`)
                if (!response.ok) throw new Error('Erro ao carregar dados do jogador')
        
                const playerData = await response.json()
        
                // Atualizar o jogador com os dados do banco
                this.health = playerData.VIDA
                const [posX, posY] = playerData.POSICAO_X_Y.split('#').map(Number)
        
                if (!isNaN(posX) && !isNaN(posY)) {
                    // Atualizando a posição no grid
                    this.gridEngine.setPosition(this.id, {
                        x: Math.floor(posX / 16),
                        y: Math.floor(posY / 16),
                    })
                }
        
            } catch (error) {
                console.error('Erro ao carregar os dados do jogador:', error)
            }
        }

    savePlayerData() {
        const playerData = {
            playerId: this.playerId,
            posX: this.x * 16,  // Multiplicando por 16 para ajustar para o grid
            posY: this.y * 16,  // Multiplicando por 16 para ajustar para o grid
            health: this.health,
        }

        // Envia os dados do jogador para o endpoint /api/player
        fetch('/api/player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerData),  // Envia os dados do jogador
        })
            .then(response => response.json())
            .then(data => {
                console.log('Dados do jogador salvos com sucesso:', data)
            })
            .catch(error => {
                console.error('Erro ao salvar dados do jogador:', error)
            })
    }

    initPlayer() {
        this.setScale(0.54, 0.52)
        this.createAnims(this.animations)
    }

    update(time, delta) {
        super.update(time, delta) // Atualiza a cada 100ms
        if (time - this.lastUpdateTime < 100) return

        this.lastUpdateTime = time

        // Impede o movimento durante o diálogo
        if (this.inDialog) {
            this.transitionTo('idle')
            return
        }

        // Atualizar movimentação e ataque
        this.handleMovement()

        // Permite ataque em paralelo com movimento
        if (!this.isAttacking) {
            this.handleAttack()
        }

        // Atualiza a posição do jogador no banco de dados periodicamente
        if (time - this.lastPositionUpdate > 5000) {  // A cada 5 segundos
            this.lastPositionUpdate = time
            this.savePlayerData()  // Salvar a posição do jogador
        }
    }

    handleMovement() {
        let direction = null

        // Verificar teclas de movimento
        if (this.keys.up.isDown && this.keys.left.isDown) {
            direction = 'up-left'
            this.flipX = true
        } else if (this.keys.up.isDown && this.keys.right.isDown) {
            direction = 'up-right'
            this.flipX = false
        } else if (this.keys.down.isDown && this.keys.left.isDown) {
            direction = 'down-left'
            this.flipX = true
        } else if (this.keys.down.isDown && this.keys.right.isDown) {
            direction = 'down-right'
            this.flipX = false
        } else if (this.keys.up.isDown) {
            direction = 'up'
        } else if (this.keys.left.isDown) {
            direction = 'left'
            this.flipX = true
        } else if (this.keys.down.isDown) {
            direction = 'down'
        } else if (this.keys.right.isDown) {
            direction = 'right'
            this.flipX = false
        }

        // Reproduzir animação de caminhada ou idle
        if (direction) {
            this.transitionTo('walk')
            this.gridEngine.move(this.id, direction)
            if (!this.isAttacking) {
                this.anims.play('player-walk', true)
            }
        } else {
            this.transitionTo('idle')
            if (!this.isAttacking) {
                this.anims.play('player-idle', true)
            }
        }
    }

    handleAttack() {
        if (this.inDialog) return

        if (this.keys.attack.isDown && !this.isAttacking) {
            this.isAttacking = true
            this.anims.play('player-attack-guitar', true)

            // Permitir movimento após o ataque
            this.on('animationcomplete-player-attack-guitar', () => {
                this.isAttacking = false
            })
        }
    }

    updateHealthDisplayPosition() {
        this.healthDisplay.updatePosition(this.x - 4, this.y, this.scaleX, this.scaleY, this.originX, this.originY)
    }
}
