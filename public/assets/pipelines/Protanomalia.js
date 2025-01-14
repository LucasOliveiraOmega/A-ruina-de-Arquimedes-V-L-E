const fragShader = `
#define SHADER_NAME PROTANOMALIA_FS

precision mediump float;

uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

void main()
{
    vec4 color = texture2D(uMainSampler, outTexCoord);

    // Matriz de correção para protanomalia
    mat3 protanomalia = mat3(
        0.817, 0.183, 0.0,
        0.333, 0.667, 0.0,
        0.0, 0.125, 0.875
    );

    vec3 correctedColor = color.rgb * protanomalia;

    gl_FragColor = vec4(correctedColor, color.a);
}
`;

export default class ProtanomaliaPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor (game)
    {
        super({
            game,
            name: 'ProtanomaliaPostFX',
            fragShader
        });
    }
}
