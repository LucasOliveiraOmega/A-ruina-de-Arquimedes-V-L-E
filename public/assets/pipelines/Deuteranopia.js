const fragShader = `
#define SHADER_NAME DEUTERANOPIA_FS

precision mediump float;

uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

void main()
{
    vec4 color = texture2D(uMainSampler, outTexCoord);

    // Matriz de correção para deuteranopia
    mat3 deuteranopia = mat3(
        0.625, 0.375, 0.0,
        0.7, 0.3, 0.0,
        0.0, 0.3, 0.7
    );

    vec3 correctedColor = color.rgb * deuteranopia;

    gl_FragColor = vec4(correctedColor, color.a);
}
`;

export default class DeuteranopiaPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor (game)
    {
        super({
            game,
            name: 'DeuteranopiaPostFX',
            fragShader
        });
    }
}
