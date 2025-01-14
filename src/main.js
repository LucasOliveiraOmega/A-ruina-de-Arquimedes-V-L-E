"use strict"

import Phaser from 'phaser'
import { FontPlugin } from 'phaser-font-plugin'
import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js'
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice'
import DialogModal from './plugins/DialogModal.js'
import { GridEngine } from "grid-engine"

import Boot from './scenes/Boot.js'
import Preloader from './scenes/Preloader.js'
import Intro from './scenes/Intro.js'
import TitleScene from './scenes/TitleScene.js'
import GameScene from './scenes/GameScene.js'
import GameUI from './scenes/ui/GameUI.js'
import BattleScene from './scenes/BattleScene.js'
import Config from './scenes/ui/Config.js'
import Credits from './scenes/ui/Credits.js'

import MonocromaciaPostFX from '../public/assets/pipelines/Monocromacia.js'
import TritanopiaPostFX from '../public/assets/pipelines/Tritanopia.js'
import ProtanopiaPostFX from '../public/assets/pipelines/Protanopia.js'
import ProtanomaliaPostFX from '../public/assets/pipelines/Protanomalia.js'
import DeuteranopiaPostFX from '../public/assets/pipelines/Deuteranopia.js'

const config = {
  type: Phaser.WEBGL,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 427,
    height: 240,
    resolution: window.devicePixelRatio, // Usa a resolução do dispositivo para melhor performance
  },
  render: {
    antialias: false,  // Desativa suavização para manter o estilo pixelado
    antialiasGL: false,
    pixelArt: true,
  },
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      fps: 24,
      timeScale: 1,
      gravity: { y: 0 }, // Sem gravidade no eixo Y
      tileBias: 16 // Ajuste para tiles de 16x16
    },
  },
  scene: [
    Boot,
    Preloader,
    Intro,
    TitleScene,
    GameScene,
    GameUI,
    BattleScene,
    Config,
    Credits
  ],
  pipeline: {
    'monocromaciaFilter': MonocromaciaPostFX,
    'tritanopiaFilter': TritanopiaPostFX,
    'protanopiaFilter': ProtanopiaPostFX,
    'protanomaliaFilter': ProtanomaliaPostFX,
    'deuteranopiaFilter': DeuteranopiaPostFX,
  },
  plugins: {
    global: [
      {
        key: 'FontPlugin',
        plugin: FontPlugin,
        start: true,
      },
      NineSlicePlugin.DefaultCfg
    ],
    scene: [
      {
        key: 'animatedTiles',
        plugin: AnimatedTiles,
        mapping: 'animatedTiles',
        start: true, // Inicia o plugin quando a cena precisa
      },
      {
        key: "DialogModal",
        plugin: DialogModal,
        start: true, // Inicia manualmente quando necessário
        mapping: "dialog"
      },
      {
        key: "gridEngine",
        plugin: GridEngine,
        mapping: "gridEngine",
      },
    ]
  }
}

const game = new Phaser.Game(config)
game.config.defaultFontFamily = ''
game.config.musicStatus = true
game.config.currentMainScene = null
