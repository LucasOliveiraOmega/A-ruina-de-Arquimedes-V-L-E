import Phaser from "phaser"
import DialogCreator from "./DialogCreator"
import renderer from "./renderer"

export default class DialogModal extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager)

    this.borderThickness = 10
    this.borderCloseThickness = 3
    this.borderColor = 0xffffff
    this.borderAlpha = 1
    this.windowAlpha = 0.9
    this.windowColor = 0x303030
    this.windowHeight = 70
    this.padding = 32
    this.paddingAvatar = 9
    this.paddingInnerX = 10
    this.paddingInnerY = 10
    this.addCloseButton = true
    this.closeBtnColor = "darkgoldenrod"
    this.dialogSpeed = 3
    this.atBottom = false
    this.fontSize = 16
    this.fontFamily = "Arial"
    this.isBitmapText = false
    this.maxHorisontalCharacters = 55
    this.useFrame = false
    this.frameSettings = {}
    this.visible = false
    this.isOnDialog = false

    this.beenInitialized = false
  }

  setup(scene) {
    this.scene = scene
    this.systems = scene.sys

    if (!scene.sys.settings.isBooted) {
      scene.sys.events.once("boot", this.boot, this)
    }

    return this
  }

  boot() {
    var eventEmitter = this.systems.events
    eventEmitter.on("shutdown", this.shutdown, this)
    eventEmitter.on("destroy", this.destroy, this)
  }

  shutdown() {
    if (this.timedEvent) this.timedEvent.remove()
    if (this.text) this.text.destroy()
  }

  destroy() {
    this.shutdown()
    this.scene = undefined
  }

  initialize(opts) {
    if (!opts) opts = {}

    this.borderThickness = opts.borderThickness || this.borderThickness
    this.borderCloseThickness =
      opts.borderCloseThickness || this.borderCloseThickness
    this.borderColor = opts.borderColor || this.borderColor
    this.borderAlpha = opts.borderAlpha || this.borderAlpha
    this.windowAlpha = opts.windowAlpha || this.windowAlpha
    this.windowColor = opts.windowColor || this.windowColor
    this.windowHeight = opts.windowHeight || this.windowHeight
    this.padding = opts.padding || this.padding
    this.paddingAvatar = opts.paddingAvatar || this.paddingAvatar
    this.paddingInnerX = opts.paddingInnerX || this.paddingInnerX
    this.paddingInnerY = opts.paddingInnerY || this.paddingInnerY
    this.addCloseButton =
      opts.addCloseButton === true
        ? true
        : opts.addCloseButton === false
          ? false
          : this.addCloseButton
    this.closeBtnColor = opts.closeBtnColor || this.closeBtnColor
    this.dialogSpeed = opts.dialogSpeed || this.dialogSpeed
    this.atBottom =
      opts.atBottom === true
        ? true
        : opts.atBottom === false
          ? false
          : this.atBottom
    this.fontSize = opts.fontSize || this.fontSize
    this.fontFamily = opts.fontFamily || this.fontFamily
    this.isBitmapText = opts.isBitmapText || this.isBitmapText
    this.maxHorisontalCharacters =
      opts.maxHorisontalCharacters || this.maxHorisontalCharacters
    this.useFrame =
      opts.useFrame === true
        ? true
        : opts.useFrame === false
          ? false
          : this.useFrame
    this.frameSettings = opts.frameSettings || this.frameSettings
    this.visible =
      opts.visible === true
        ? true
        : opts.visible === false
          ? false
          : this.visible

    this.eventCounter = 0
    this.text
    this.avatar
    this.avatarIsSet = false

    this.dialog
    this.graphics
    this.closeBtn

    //this._createWindow()
    var windowCreator = new DialogCreator(this)
    windowCreator.createWindow()

    if (!this.visible) {
      this.toggleWindow()
    }

    this.beenInitialized = true
  }

  _getGameWidth() {
    return this.scene.scale.width
  }

  _getGameHeight() {
    return this.scene.scale.height
  }

  toggleWindow() {
    this.visible = !this.visible
    if (this.text) this.text.visible = this.visible
    if (this.textBitmap) this.textBitmap.visible = this.visible
    if (this.graphics) this.graphics.visible = this.visible
    if (this.frame) this.frame.visible = this.visible
    if (this.closeBtn) this.closeBtn.visible = this.visible
    if (this.avatar) this.avatar.visible = this.visible
  }

  setDialogList(dialogList, animate = true) {
    this.dialogList = []
    this.dialogIndex = 0

    for (let i = 0; i < dialogList.length; i++) {
      this.dialogList[i] = {
        isDialog: dialogList[i].isDialog,
        text: dialogList[i].text,
        sprite: dialogList[i].sprite,
        frame: dialogList[i].frame,
        name: dialogList[i].name,
        nameColor: dialogList[i].nameColor,
        maxHorisontalCharacters: dialogList[i].maxHorisontalCharacters,
        textIsDynamic: dialogList[i].textIsDynamic,
        specialTextColor: dialogList[i].specialTextColor,
        specialTextShaking: dialogList[i].specialTextShaking
      }
    }
    
    this.isOnDialog = true

    if (!this.visible) this.toggleWindow()

    if (this.isBitmapText) {
      for (let i = 0; i < this.dialogList.length; i++) {
        if (this.dialogList[i].textIsDynamic) {
          this.createSpecialCharactersIndexList(this.dialogList[i])
        }

        let currentMaxCharacters = this.dialogList[i].maxHorisontalCharacters
        let maxHorisontalCharacters = currentMaxCharacters
          ? currentMaxCharacters
          : this.maxHorisontalCharacters
        /*this.dialogList[i].text = textSplitter(
          this.dialogList[i].text,
          maxHorisontalCharacters
        )*/
      }
    }

    var says = this.dialogList[this.dialogIndex]
    this.setText(says.text, animate, says.sprite, says.frame, says.name)
  }

  //ToDo: move out
  createSpecialCharactersIndexList(dialog) {
    var firstBracesList = this.getIndicesOf("{", dialog.text)
    var secondBracesList = this.getIndicesOf("}", dialog.text)
    dialog.specialTextIndexs = []
    for (let b = 0; b < firstBracesList.length; b++) {
      let numberOfRemovedBraces = b === 0 ? 0 : 2 * (b + 1) - 1
      let indexOne = firstBracesList[b] - numberOfRemovedBraces
      let indexTwo = secondBracesList[b] - 2 * (b + 1)
      let indexes = this.specialCharactersFill(indexOne, indexTwo)
      dialog.specialTextIndexs.push(...indexes)
    }

    dialog.text = dialog.text.replace(/{|}/gi, "")
  }

  getIndicesOf(searchStr, str) {
    var searchStrLen = searchStr.length
    if (searchStrLen == 0) {
      return []
    }
    var startIndex = 0,
      index,
      indices = []

    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index)
      startIndex = index + searchStrLen
    }
    return indices
  }

  specialCharactersFill(start, end) {
    const fillRange = (start, end) => {
      return Array(end - start + 1)
        .fill()
        .map((item, index) => start + index)
    }

    return fillRange(start, end)
  }
  //

  goToNextPieceOfDialog() {
    if (!this.getIsTextAnimateDone()) {
      this.showAllText()
    } else {
      this.dialogIndex++
      if (this.dialogIndex < this.dialogList.length) {
        let says = this.dialogList[this.dialogIndex]
        this.setText(says.text, true, says.sprite, says.frame, says.name)
        this.isOnDialog = true
      } else {
        if (this.visible) this.toggleWindow()
        if (this.timedEvent) this.timedEvent.remove()
        if (this.text) this.text.destroy()
        if (this.textBitmap) this.textBitmap.destroy()
        if (this.name) this.name.destroy()
        if (this.nameBitmap) this.nameBitmap.destroy()
          this.isOnDialog = false
        return true
      }
    }

    return false
  }

  setText(text, animate, avatar, frame, name) {
    this.eventCounter = 0
    this.dialog = text.split("")
    if (this.timedEvent) this.timedEvent.remove()

    if (avatar) {
      this._setAvatar(avatar, frame, name)
    } else {
      this.avatarIsSet = false
      if (this.avatar) this.avatar.destroy()
      if (this.name) this.name.destroy()
      if (this.nameBitmap) this.nameBitmap.destroy()
    }

    var tempText = animate ? "" : text
    this._setText(tempText, name)

    this.fulltext = text
    if (animate) {
      this.timedEvent = this.scene.time.addEvent({
        delay: 150 - this.dialogSpeed * 30,
        callback: this._animateText,
        callbackScope: this,
        loop: true
      })
    }
  }

  showAllText() {
    this.timedEvent.remove()

    if (!this.isBitmapText) {
      this.text.setText(this.fulltext)
    } else {
      this.textBitmap.setText(this.fulltext)
    }
  }

  getIsTextAnimateDone() {
    if (!this.isBitmapText) {
      return this.text.text.length === this.fulltext.length
    } else {
      return this.textBitmap.text.length === this.fulltext.length
    }
  }

  _setAvatar(avatar, frame, name) {
    if (this.avatar) this.avatar.destroy()

    /*var tex = this.scene.textures.get(avatar).get()
    var height = tex.cutHeight
    var width = tex.cutwidth*/

    var namePaddingY = 0
    if (name) {
      namePaddingY = this.fontSize + 2
    }

    var x = this.padding + this.paddingAvatar
    var y = this.atBottom
      ? this._getGameHeight() -
      this.windowHeight -
      this.padding +
      this.paddingAvatar
      : this.padding + this.paddingAvatar

    this.avatar = this.scene.add
      .image(x, y + namePaddingY, avatar, frame)
      .setOrigin(0, 0)
      .setScrollFactor(0)

    if (name) {
      let avatarCenter = this.avatar.getCenter()
      this._setName(name, y, avatarCenter.x, 0.5)
    }

    this.avatarIsSet = true
  }

  _setText(text, name) {
    if (this.text) this.text.destroy()
    if (this.textBitmap) this.textBitmap.destroy()

    var namePaddingY = 0
    if (!this.avatarIsSet && name) {
      namePaddingY = this.fontSize + 2
    }

    var x = this.avatarIsSet
      ? this.padding +
      this.paddingAvatar +
      this.paddingInnerX +
      this.avatar.width
      : this.padding + this.paddingInnerX

    var y = this.atBottom
      ? this._getGameHeight() -
      this.windowHeight -
      this.padding +
      this.paddingInnerY
      : this.padding + this.paddingInnerY

    var widthPadding = this.avatarIsSet
      ? -this.padding * 2 - this.paddingInnerX * 2 - this.avatar.width
      : -this.padding * 2 - this.paddingInnerX * 2

    if (!this.isBitmapText) {
      this.text = this.scene.make
        .text({
          x,
          y: y + namePaddingY,
          text,
          style: {
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            wordWrap: { width: this._getGameWidth() + widthPadding }
          }
        })
        .setScrollFactor(0)
    } else {
      let config = {
        x,
        y: y + namePaddingY,
        text,
        font: this.fontFamily,
        size: this.fontSize,
        add: true
      }
      let isDynamic = this.dialogList[this.dialogIndex].textIsDynamic
      this.textBitmap = isDynamic
        ? this.scene.make
          .dynamicBitmapText(config)
          .setMaxWidth(450)
          .setScrollFactor(0)
        : this.scene.make
          .bitmapText(config)
          .setMaxWidth(450)
          .setScrollFactor(0)
      //this.textBitmap.setMaxWidth(300)
      //console.log(this.textBitmap)

      if (isDynamic) {
        this.textBitmap.renderWebGL = renderer

        this.textBitmap.setDisplayCallback(
          this._dynamicTextCallback.bind(this)
        )
      }
    }

    if (!this.avatarIsSet && name) {
      this._setName(name, y, x, 0)
    }
  }

  _animateText() {
    this.eventCounter++

    if (!this.isBitmapText) {
      this.text.setText(this.text.text + this.dialog[this.eventCounter - 1])
    } else {
      this.textBitmap.setText(
        this.textBitmap.text + this.dialog[this.eventCounter - 1]
      )
      //this.textBitmap.setMaxWidth(100, " ")
    }

    if (this.eventCounter === this.dialog.length) {
      this.timedEvent.remove()
    }
  }

  _setName(name, y, xCenter, xOrigin) {
    if (this.name) this.name.destroy()
    if (this.nameBitmap) this.nameBitmap.destroy()

    if (!this.isBitmapText) {
      this.name = this.scene.make
        .text({
          x: 0,
          y: 0,
          text: name,
          style: {
            fontFamily: this.fontFamily,
            fontSize: this.fontSize
          }
        })
        .setScrollFactor(0)

      if (this.dialogList[this.dialogIndex].nameColor) {
        this.name.setTint(this.dialogList[this.dialogIndex].nameColor)
      }
    } else {
      this.nameBitmap = this.scene.make
        .bitmapText({
          x: 0,
          y: 0,
          text: name,
          font: this.fontFamily,
          size: this.fontSize
        })
        .setScrollFactor(0)

      if (this.dialogList[this.dialogIndex].nameColor) {
        this.nameBitmap.setTint(this.dialogList[this.dialogIndex].nameColor)
      }
    }

    if (!this.isBitmapText) {
      this.name.setOrigin(xOrigin, 0)
      this.name.setPosition(xCenter, y)
    } else {
      this.nameBitmap.setOrigin(xOrigin, 0)
      this.nameBitmap.setPosition(xCenter, y)
    }
  }

  _dynamicTextCallback(data) {
    var specialTextIndexs = this.dialogList[this.dialogIndex].specialTextIndexs
    var specialTextColor = this.dialogList[this.dialogIndex].specialTextColor
    var specialTextShaking = this.dialogList[this.dialogIndex]
      .specialTextShaking

    if (specialTextColor) {
      data.color = 0xffffff
    }
    if (specialTextIndexs.includes(data.index)) {
      if (specialTextShaking) {
        data.x = Phaser.Math.Between(data.x - 2, data.x + 2)
        data.y = Phaser.Math.Between(data.y - 4, data.y + 4)
      }
      if (specialTextColor) {
        data.color = specialTextColor
      }
    }

    return data
  }
}
