import Entity from "./Entity"

export default class Projectile extends Entity {
    constructor(scene, x, y, textureKey, type, direction) {
        super(scene, x, y, textureKey, 2, 2, type = 'projectile')

        this.initProjectile()
    }

    initProjectile() {
        
    }

    update() {
        super.update()
    }
}