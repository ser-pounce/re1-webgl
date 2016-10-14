import Mesh from 'lib/mesh';
import Emd from 'lib/emd/emd';
import {Vec3} from 'lib/math';

export default class Model
{
  constructor(gl, buf)
  {
    let emd = new Emd(buf);

    let clut;
    if (emd.tim.clut)
      clut = { tex: emd.tim.clut.toTexture(gl, 0), loc: Model._clutLoc };

    this._textures =
      [clut, { tex: emd.tim.data.toTexture(gl, 1), loc: Model._texLoc }];

    this._meshPos = emd.section0.meshes.map(p => p.values);

    let setPos = (id, parent) => {
      Vec3.add(this._meshPos[id], parent);
      for (let child of emd.section0.skeleton[id])
        setPos(child, this._meshPos[id]);
    };

    setPos(0, new Float32Array([0, 0, 0]));

    this._children = [];
    for (let i = 0; i < emd.tmd.length; ++i) {
      this._children.push(new Mesh(gl, emd.tmd[i], emd.tim));
      if (this._meshPos[i] === undefined)
        this._meshPos[i] = new Float32Array([0, 0, 0]);
    }

    //printClut(emd.tim.clut);
  }

  draw(gl, viewMatrix)
  {
    for (let tex of this._textures) {
      gl.activeTexture(gl.TEXTURE0 + tex.tex.unitId);
      gl.bindTexture(gl.TEXTURE_2D, tex.tex.texId);
      gl.uniform1i(tex.loc, tex.tex.unitId);
    }

    gl.uniformMatrix4fv(Model._view, false, viewMatrix);

    for (let id = 0; id < this._children.length; ++id)
      this._children[id].draw(gl, this._meshPos[id]);
  }

  delete(gl)
  {
    for (let child of this._children)
      child.delete(gl);
    gl.deleteTexture(this._textures[0].tex.texId);
    gl.deleteTexture(this._textures[1].tex.texId);
  }

  static init(gl)
  {
    let program = gl.getParameter(gl.CURRENT_PROGRAM);

    this._view = gl.getUniformLocation(program, 'view');
    if (this._view == -1)
      throw new Error('Invalid uniform view');

    this._clutLoc = gl.getUniformLocation(program, 'clut');
    if (this._clutLoc == -1)
      throw new Error('Invalid uniform clut');

    this._texLoc = gl.getUniformLocation(program, 'texture');
    if (this._texLoc == -1)
      throw new Error('Invalid uniform texture');

    Mesh.init(gl);
  }
}



function printClut(clut)
{
  var clutElem = document.getElementById('clut');

  for (var i = 0; i < clut.info.h; ++i) {
    var row = document.createElement('div');
    row.classList.add('row');
    for (var j = 0; j < clut.info.w; ++j) {
      var c = clut[j + i * clut.info.w];
      var color = document.createElement('span');
      color.classList.add('color');
      color.style.backgroundColor = 'rgb('+[c.r << 3, c.g << 3, c.b << 3].join(',')+')';
      row.appendChild(color);
    }
    clutElem.appendChild(row);
  }
}
