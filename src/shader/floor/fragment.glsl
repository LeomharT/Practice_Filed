uniform sampler2D uReflector;

varying vec2 vUv;
varying vec4 vTexturePosition;

void main(){
    vec2 uv              = vUv;
    vec3 color           = vec3(1.0);
    vec4 texturePosition = vTexturePosition;


    vec4 reflectorColor = texture2DProj(uReflector, texturePosition);
         color          = reflectorColor.rgb;

    gl_FragColor = vec4(color, 1.0);   
}