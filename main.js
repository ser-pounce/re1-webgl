import {Mat4} from 'lib/math';
import Model from 'lib/model';

let id;
let model;
let gl;

let screen = document.getElementById('screen');
screen.width  = screen.clientWidth;
screen.height = screen.clientHeight;


let scale = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]);

let rotateY = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]);

let translate = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]);


let files = document.getElementById('file');
let list  = document.getElementById('emdlist');

files.addEventListener('change', async() => {

  let names = await fetch('models.json');
  names = await names.json();

  while (list.firstChild)
    list.removeChild(list.firstChild); 

  for (var i = 0; i < files.files.length; ++i) {
    var op = document.createElement('option');
    op.value = i;
    op.text = names[files.files[i].name];
    list.add(op);
  }
  list.selectedIndex = 0;
  list.dispatchEvent(new Event('change'));
});

list.addEventListener('change', () => {
  let reader = new FileReader();
  reader.addEventListener('load', () => load(reader.result));
  if (model) {
    window.cancelAnimationFrame(id);
    model.delete(gl);
  }
  reader.readAsArrayBuffer(files.files[list.selectedIndex]);
});

let slider = document.getElementById('y-axis');
slider.addEventListener('input', () => {
  let rad = slider.value * 2 * Math.PI; 
  rotateY[0] = rotateY[10] = Math.cos(rad);
  rotateY[2] = Math.sin(rad);
  rotateY[8] = -rotateY[2];
});

slider.dispatchEvent(new Event('input'));



let zoom = document.getElementById('zoom');
zoom.addEventListener('input', () => {
  scale[0] = scale[5] = scale[10] = 19 * zoom.value;
});

zoom.dispatchEvent(new Event('input'));

let ypos = document.getElementById('y-pos');
ypos.addEventListener('input', () => {
  translate[7] = ypos.value;
});

ypos.dispatchEvent(new Event('input'));


async function loadShader(url, gl, program, type)
{
  let source = await fetch(url);
  let shader = gl.createShader(type);
 
  gl.shaderSource(shader, await source.text());
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error(
      `Could not compile shader: ${gl.getShaderInfoLog(shader)}`
    );

  gl.attachShader(program, shader);
}

(async function() {
  gl = screen.getContext('webgl') || screen.getContext('experimental-webgl');
  if (!gl)
    throw new Error('Could not obtain webgl context');

  let program = gl.createProgram();

  await Promise.all([
    loadShader('vertex.glsl', gl, program, gl.VERTEX_SHADER),
    loadShader('fragment.glsl', gl, program, gl.FRAGMENT_SHADER),
  ]);

  gl.linkProgram(program);
 
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw (`Program failed to link: ${gl.getProgramInfoLog(program)}`);

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  Model.init(gl);
})();


function load(buf)
{
  model = new Model(gl, buf);

  let view = new Float32Array(16);

  id = window.requestAnimationFrame(function draw(time) {
    view.set(scale); 
    Mat4.mult(view, rotateY);
    Mat4.mult(view, translate);
    model.draw(gl, view);
    id = window.requestAnimationFrame(draw);
  });
}
