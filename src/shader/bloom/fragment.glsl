varying vec2 vUv;

uniform sampler2D uDiffuseColor;
uniform sampler2D uBloomTexture;

void main(){
    vec2 uv = vUv;
 
    vec4 diffuseColor = texture2D(uDiffuseColor, uv);
    vec4 bloomColor   = texture2D(uBloomTexture, uv);
   
    gl_FragColor = diffuseColor + bloomColor * 1.0;
}