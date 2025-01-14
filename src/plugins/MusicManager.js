export class MusicManager {
    static instance = null;
    currentMusicKey = null;
    sceneMusicMap = {
        'menu': 'music-background-menu',
        'game': 'music-background-game',
        'castle': 'music-background-castle',
        'vila': 'music-background-vila',
        'combate': 'music-background-combate',
        // Adicione mais mapeamentos conforme necessário
    };

    constructor(scene) {
        if (MusicManager.instance) {
            return MusicManager.instance;
        }

        this.scene = scene;
        this.audio = null;
        MusicManager.instance = this;
    }

    // Define a cena e carrega a música correspondente
    setScene(sceneKey) {
        const musicKey = this.sceneMusicMap[sceneKey];
    
        if (musicKey) {
            this.addMusic(musicKey);  // Garanta que a música seja adicionada
            this.switchMusic(musicKey);
        } else {
            console.warn(`Música para a cena ${sceneKey} não encontrada.`);
        }
    }
    

    addMusic(key) {
        if (this.audio && this.audio.key === key) {
            return;
        }

        this.stopMusic();
        this.audio = this.scene.sound.add(key);
        this.currentMusicKey = key;
    }

    playMusic({ loop = true } = {}) {
        if (this.audio && !this.audio.isPlaying) {
            this.audio.play({ loop });
        }
    }

    stopMusic() {
        if (this.audio && this.audio.isPlaying) {
            this.audio.stop();
        }
    }

    setVolume(volume) {
        if (this.audio) {
            this.audio.setVolume(volume);
        }
    }

    pauseMusic() {
        if (this.audio && this.audio.isPlaying) {
            this.audio.pause();
        }
    }

    resumeMusic() {
        if (this.audio && this.audio.isPaused) {
            this.audio.resume();
        }
    }

    fadeIn(duration = 1000) {
        if (this.audio) {
            this.audio.setVolume(0);
            this.scene.tweens.add({
                targets: this.audio,
                volume: { from: 0, to: 1 },
                duration: duration,
                onUpdate: (tween) => {
                    this.audio.setVolume(tween.getValue());
                }
            });
        }
    }

    fadeOut(duration = 1000) {
        if (this.audio) {
            this.scene.tweens.add({
                targets: this.audio,
                volume: { from: this.audio.volume, to: 0 },
                duration: duration,
                onComplete: () => this.stopMusic(),
            });
        }
    }

    switchMusic(newKey, fadeDuration = 1000) {
        if (newKey !== this.currentMusicKey) {
            this.fadeOut(fadeDuration);  // Fade out da música atual
            this.scene.time.delayedCall(fadeDuration, () => {
                this.addMusic(newKey);  // Adiciona a nova música
                this.fadeIn(fadeDuration);  // Fade in da nova música
                this.playMusic();  // Inicia a reprodução
            });
        }
    }
    

    isPlaying() {
        return this.audio ? this.audio.isPlaying : false;
    }

    setLoop(loop) {
        if (this.audio) {
            this.audio.setLoop(loop);
        }
    }

    getCurrentMusicKey() {
        return this.currentMusicKey;
    }
}
