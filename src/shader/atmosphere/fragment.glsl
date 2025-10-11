uniform vec3 uSunDirection;

uniform sampler2D uDayMapTexture;
uniform sampler2D uNightMapTexture;
uniform sampler2D uSpecularCloudTexture;

uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition;


void main() {
    vec2  uv            = vUv;
    float alpha         = 0.0;
    vec3  color         = vec3(0.0);
    vec3  normal        = normalize(vNormal);
    vec3  viewDirection = normalize(vPosition - cameraPosition);

    // Sun orientation
    vec3  sunDirection   = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    // Atmosphere
    float atmosphereMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereMix
    );
    color = atmosphereColor;

    // Edge alpha
    float edgeAlph = dot(viewDirection, normal);
    edgeAlph = smoothstep(0.0, 0.5, edgeAlph);

    // Day alpha 
    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);

    alpha = edgeAlph * dayAlpha;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}