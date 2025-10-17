
varying vec2 vNdc;
varying vec2 vUv;
varying vec3 vPosition;
 
vec3 billboard(vec3 v, mat4 view) {
    vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
    vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
    vec3 pos =  right * v.x + up * v.y;
    return pos;
}


void main() {
    #include <begin_vertex>

    transformed = billboard(transformed, modelViewMatrix);
 
    #include <project_vertex>

    vec2 ndc           = gl_Position.xy / gl_Position.w;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelNormal   = modelMatrix * vec4(normal, 1.0);

    vNdc      = ndc * 0.5 + 0.5;
    vUv       = uv;
    vPosition = modelPosition.xyz;
 }