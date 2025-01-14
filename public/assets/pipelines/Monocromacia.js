const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float gray;

varying vec2 outTexCoord;

void main()
{
    vec4 color = texture2D(uMainSampler, outTexCoord);
    float grayScale = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    gl_FragColor = vec4(mix(color.rgb, vec3(grayScale), gray), color.a);
}
`;

export default class MonocromaciaPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    constructor (game)
    {
        super({
            game,
            fragShader
        });

        this._gray = 1;
    }

    onPreRender ()
    {
        this.set1f('gray', this._gray);
    }

    get gray ()
    {
        return this._gray;
    }

    set gray (value)
    {
        this._gray = value;
    }
}
