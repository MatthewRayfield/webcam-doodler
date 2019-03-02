varying highp vec2 textureCoordinate;

uniform highp sampler2D inputImageTexture;
uniform highp sampler2D overlayTexture;
uniform highp bool flipX;
uniform highp vec2 resolution;

void main() {
    highp vec2 xy = textureCoordinate.xy;

    if (flipX) {
        xy.x = 1.0 - xy.x;
    }

    highp vec4 colorO = texture2D(overlayTexture, xy);

    highp vec4 color = vec4(vec3(0.0,1.0,1.0), 0.0);

    if (colorO.a > 0.0) {
        //color.a = colorO.a;
        color.a = 1.0;
    }
    else {
        highp vec2 c = xy * resolution;

        highp vec4 below      = texture2D(inputImageTexture, vec2(c.x + 0.0, c.y - 1.0) / resolution);
        highp vec4 belowBelow = texture2D(inputImageTexture, vec2(c.x + 0.0, c.y - 2.0) / resolution);
        highp vec4 belowLeft  = texture2D(inputImageTexture, vec2(c.x - 1.0, c.y - 1.0) / resolution);
        highp vec4 belowRight = texture2D(inputImageTexture, vec2(c.x + 1.0, c.y - 1.0) / resolution);

        color.a = (below.a+belowBelow.a+belowLeft.a+belowRight.a) / 4.1;
    }

    gl_FragColor = color;
}
