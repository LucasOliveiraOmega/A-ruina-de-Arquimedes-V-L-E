
// ui.js
"use strict"

import Phaser from 'phaser'
import { ValueBar } from 'phaser-ui-tools'

export function createButton(scene, x, y, text, onClick, font = '20px Arial', color = '#000', hoverColor = '#C0C0C0', padding = { top: 0, bottom: 0 }) {
    // Cria o botão com padding
    const button = scene.add.text(x, y, text, {
        font,
        fill: color,
        padding: {
            top: padding.top || 0,
            bottom: padding.bottom
        }
    })
        .setInteractive()
        .on('pointerover', () => button.setStyle({ fill: hoverColor }))
        .on('pointerout', () => button.setStyle({ fill: color }))
        .on('pointerdown', onClick)

    return button
}


// GlobalSettings.js
export const GlobalSettingsVolume = {
    volume: {
        general: 0.5,
        music: 0.5,
        creatures: 0.5,
    }
}

// Função para criar a barra de valor (volume)
export function createValueBar(scene, x, y, categoryKey, barText, globalVolume, updateAudioVolume) {
    // Cria a barra de volume
    const bar = new ValueBar(
        scene,
        { x: x, y: y }, // Posição inicial da barra
        { step: 0.1, startValue: globalVolume[categoryKey], maxValue: 10 }, // Inicializa com o volume atual
        true,  // Barra horizontal
        false, // Não é vertical
        "track", // Imagem de fundo
        "bar",   // Imagem da barra
        { duration: 100, ease: Phaser.Math.Easing.Linear.None } // Easing
    )

    bar.setScale(0.3, 0.3) // Ajuste o tamanho da barra conforme necessário

    // Configura o emitter para atualizar o valor e o texto da barra
    bar.emitter.on('movement', () => {
        const currentValue = bar.valueRange.getCurrentValue()
        barText.setText(currentValue.toFixed(1)) // Atualiza o texto com o valor atual
        globalVolume[categoryKey] = currentValue // Atualiza o volume global
        updateAudioVolume() // Atualiza o volume de áudio
    })

    return bar
}
