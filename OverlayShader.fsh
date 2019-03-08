varying highp vec2 textureCoordinate;

uniform highp sampler2D inputImageTexture;
uniform highp sampler2D overlayTexture;
uniform bool flipX;
uniform bool erase;

void main() {
    highp vec2 xy = textureCoordinate.xy;

    if (flipX) {
        xy.x = 1.0 - xy.x;
    }

    highp vec4 color = texture2D(inputImageTexture, xy);

    highp vec4 colorO = texture2D(overlayTexture, xy);

    if (erase) {
        color.a -= colorO.a;
    }
    else {
        color.rgb = mix(color.rgb, colorO.rgb, colorO.a);

        if (colorO.a > color.a) {
            color.a = colorO.a;
        }
    }

    gl_FragColor = color;
}
