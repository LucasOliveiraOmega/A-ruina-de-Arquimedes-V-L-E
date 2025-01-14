const fragShader = `
#define SHADER_NAME TRITANOPIA_FS

precision mediump float;

uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

void main()
{
    vec4 color = texture2D(uMainSampler, outTexCoord);

    // Matriz de correção para tritanopia
    mat3 tritanopia = mat3(
        0.95, 0.05, 0.0,
        0.0, 0.433, 0.567,
        0.0, 0.475, 0.525
    );

    vec3 correctedColor = color.rgb * tritanopia;

    gl_FragColor = vec4(correctedColor, color.a);
}
`;

export default class TritanopiaPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor (game)
    {
        super({
            game,
            name: 'TritanopiaPostFX',
            fragShader
        });
    }
}
