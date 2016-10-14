precision lowp float;

uniform sampler2D texture;
uniform sampler2D clut;

varying vec2 v_uv;
varying vec2 v_clutOffset;
varying vec3 v_clutFlags;
varying vec3 v_norm;

const vec4 transparent = vec4(0, 0, 0, 0);
 
void main()
{
  vec4 index = texture2D(texture, vec2(v_uv.x + v_clutFlags[0], v_uv.y));
  vec4 texel = texture2D(clut, vec2(index.a + v_clutOffset.x, v_clutOffset.y));
  if (texel == transparent)
    discard;
  gl_FragColor = vec4(texel.rgb, 1);
}

