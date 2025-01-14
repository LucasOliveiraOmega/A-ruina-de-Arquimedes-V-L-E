const fragShader = `
#define SHADER_NAME PROTANOPIA_FS

precision mediump float;

uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

void main()
{
    vec4 color = texture2D(uMainSampler, outTexCoord);

    // Matriz de correção para protanopia
    mat3 protanopia = mat3(
        0.567, 0.433, 0.0,
        0.558, 0.442, 0.0,
        0.0, 0.242, 0.758
    );

    vec3 correctedColor = color.rgb * protanopia;

    gl_FragColor = vec4(correctedColor, color.a);
}
`;

export default class ProtanopiaPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor (game)
    {
        super({
            game,
            name: 'ProtanopiaPostFX',
            fragShader
        });
    }
}
