
varying vec2 vNdc;


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

    vec2 ndc = gl_Position.xy / gl_Position.w;

    vNdc = ndc * 0.5 + 0.5;
}