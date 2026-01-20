varying vec2 vUv;

uniform float uTime;

vec2 rotate2D(vec2 p, float theta) {
    mat2 m = mat2(
        cos(theta), -sin(theta),
        sin(theta), cos(theta)
    );

    return p * m;
}

vec3 billboard(vec3 v, mat4 view)
{
    vec3 up=vec3(view[0][1],view[1][1],view[2][1]);
    vec3 right=vec3(view[0][0],view[1][0],view[2][0]);
    vec3 pos=right*v.x+up*v.y;
    return pos;
}

void main(){
    vec3 pos    = position;
        //  pos.xy = rotate2D(pos.xy, uTime * 0.125);

    vec4 mvPosition = modelViewMatrix * vec4(vec3(0.0), 1.0);
    mvPosition.xy += pos.xy;
 
    gl_Position = projectionMatrix * mvPosition;
 
    // Varying
    vUv = uv;
}