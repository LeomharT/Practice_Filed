varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vNdc;
varying vec4 vReflectionMatrix;

uniform sampler2D uReflectionTexture;

void main(){
    vec3 color       = vec3(1.0);
    vec4 mReflection = vReflectionMatrix;

    vec4 diffuseColor = texture2D(uReflectionTexture, mReflection.xy / mReflection.w);

    color = vec3(0.0125, 0.15, 0.547);
    color += diffuseColor.rgb;
 
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}