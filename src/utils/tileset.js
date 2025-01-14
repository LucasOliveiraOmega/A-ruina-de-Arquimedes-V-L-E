export function createMapLayers(config) {
    config.layers.forEach(layer => {
        config.scene[layer.name] = config.map.createLayer(layer.name, config.tilesetImage, layer.x || 0, layer.y || 0)
        if (typeof layer.depth === 'number')
            config.scene[layer.name].depth = layer.depth || 0

    })
}
