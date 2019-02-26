varying highp vec2 textureCoordinate;

uniform highp sampler2D inputImageTexture;
uniform highp vec2 resolution;
uniform highp vec3 targetColor;
uniform highp float threshold;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main() {
    highp vec2 xy = textureCoordinate.xy;

    highp vec4 color = texture2D(inputImageTexture, xy);

    highp vec3 hsv = rgb2hsv(color.rgb);
    highp vec3 hsvTarget = rgb2hsv(targetColor);

    if (distance(hsv, hsvTarget) < threshold) {
    //if (distance(color.rgb, targetColor) < threshold) {
        color.a = 1.0;
        color.rgb = vec3(0.0,1.0,1.0);
    }
    else {
        color = vec4(0.0,0.0,0.0,0.0);
    }

    gl_FragColor = color;
}
