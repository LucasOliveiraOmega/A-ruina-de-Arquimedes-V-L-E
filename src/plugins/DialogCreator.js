export default class DialogCreator {
  constructor(plugin) {
    this.plugin = plugin;
  }

  createWindow() {
    const gameHeight = this._getGameHeight();
    const gameWidth = this._getGameWidth();
    const dimensions = this._calculateWindowDimensions(gameWidth, gameHeight);
    if (!this.plugin.graphics) {
      this.plugin.graphics = this.plugin.scene.add
        .graphics()
        .setScrollFactor(0);
    }

    if (
      this.plugin.useFrame &&
      this.plugin.scene.add.nineslice &&
      this.plugin.frameSettings
    ) {
      this._createFrame(
        dimensions.x,
        dimensions.y,
        dimensions.rectWidth,
        dimensions.rectHeight,
        this.plugin.frameSettings
      );
    } else {
      this._createOuterWindow(
        dimensions.x,
        dimensions.y,
        dimensions.rectWidth,
        dimensions.rectHeight
      );
      this._createInnerWindow(
        dimensions.x,
        dimensions.y,
        dimensions.rectWidth,
        dimensions.rectHeight
      );
    }

    if (this.plugin.addCloseButton) {
      this._createCloseModalButton();
      this._createCloseModalButtonBorder();
    }
  }

  _getGameWidth() {
    return this.plugin.scene.scale.width;
  }

  _getGameHeight() {
    return this.plugin.scene.scale.height;
  }

  _calculateWindowDimensions(width, height) {
    const x = this.plugin.padding;
    const y = this.plugin.atBottom
      ? height - this.plugin.windowHeight - this.plugin.padding
      : this.plugin.padding;
    const rectWidth = width - this.plugin.padding * 2;
    const rectHeight = this.plugin.windowHeight;
    return {
      x,
      y,
      rectWidth,
      rectHeight
    };
  }

  _createFrame(x, y, rectWidth, rectHeight, frameSettings) {
    if (this.plugin.frame) {
      this.plugin.frame.destroy();
    }

    this.plugin.frame = this.plugin.scene.add
      .nineslice(
        x,
        y,
        rectWidth,
        rectHeight,
        frameSettings.key,
        frameSettings.offsetConfig
      )
      .setScrollFactor(0);
  }

  _createInnerWindow(x, y, rectWidth, rectHeight) {
    this.plugin.graphics.fillStyle(
      this.plugin.windowColor,
      this.plugin.windowAlpha
    );
    this.plugin.graphics.fillRect(x, y, rectWidth, rectHeight);
  }

  _createOuterWindow(x, y, rectWidth, rectHeight) {
    this.plugin.graphics.lineStyle(
      this.plugin.borderThickness,
      this.plugin.borderColor,
      this.plugin.borderAlpha
    );
    this.plugin.graphics.strokeRect(x, y, rectWidth, rectHeight);
  }

  _createCloseModalButton() {
    var self = this.plugin;
    this.plugin.closeBtn = this.plugin.scene.make.text({
      x: this._getGameWidth() - this.plugin.padding - 16,
      y: this.plugin.atBottom
        ? this._getGameHeight() -
          this.plugin.windowHeight -
          this.plugin.padding +
          3
        : this.plugin.padding + 3,
      text: "✖",
      style: {
        font: "bold 12px Arial",
        fill: this.plugin.closeBtnColor
      }
    });
    this.plugin.closeBtn.setInteractive().setScrollFactor(0);

    this.plugin.closeBtn.on("pointerover", function() {
      this.setTint(0xff0000);
    });
    this.plugin.closeBtn.on("pointerout", function() {
      this.clearTint();
    });
    this.plugin.closeBtn.on("pointerdown", function() {
      self.toggleWindow();
      if (self.timedEvent) self.timedEvent.remove();
      if (self.text) self.text.destroy();
    });
  }

  _createCloseModalButtonBorder() {
    var x = this._getGameWidth() - this.plugin.padding - 20;
    var y = this.plugin.atBottom
      ? this._getGameHeight() - this.plugin.windowHeight - this.plugin.padding
      : this.plugin.padding;

    this.plugin.graphics.lineStyle(
      this.plugin.borderCloseThickness,
      this.plugin.borderColor,
      this.plugin.borderAlpha
    );
    this.plugin.graphics.strokeRect(x, y, 20, 20);
  }
}
