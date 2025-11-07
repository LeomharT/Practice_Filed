varying vec2 vUv;
varying vec3 vPosition;

uniform vec3 uRootColor;
uniform vec3 uGrassColor;
uniform sampler2D uNoiseTexture;
uniform vec3 uGrassColor2;
uniform float uTime;

void main(){
    float radius = 5.5;

    vec2 uv    = vUv;
    vec3 color = vec3(0.0);

    vec2 groundUv = vec2(vPosition.xz / (radius * 2.0)) + 0.5;
    groundUv *= 0.75;
    groundUv = fract(groundUv);

    // Texture Color
    vec4 noiseColor = texture2D(uNoiseTexture, groundUv);

    float colorMix = smoothstep(0.1, 1.0, uv.y);

    vec3 grassColor = uGrassColor;
    if(noiseColor.r >= 0.45) grassColor = uGrassColor2;

    color = mix(
        uRootColor,
        grassColor,
        colorMix
    );

 
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}