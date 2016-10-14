precision lowp float;

attribute vec3 vert;
attribute vec3 norm;
attribute vec2 uv;
attribute vec2 clutOffset;
attribute vec3 clutFlags;

uniform mat4 view;
uniform vec3 mesh;

varying vec2 v_uv;
varying vec2 v_clutOffset;
varying vec3 v_clutFlags;
varying vec3 v_norm;

void main()
{
  vec4 pos = vec4(vert + mesh, 1) * view;
  gl_Position = pos;

  v_uv = uv;
  v_clutOffset = clutOffset;
  v_clutFlags = clutFlags;
  v_norm = norm;
}

