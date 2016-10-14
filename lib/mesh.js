import DataStream from 'lib/datastream';

export default class Mesh
{
  constructor(gl, tmd, tim)
  {
    this._nVertices = tmd.primitives.length * 3;

    let buf    = new ArrayBuffer(this._nVertices * Mesh.byteLength);
    let stream = new DataStream(buf);

    for (let prim of tmd.primitives)
      for (let i = 0; i < prim.vertices.length; ++i) {
        stream.write(tmd.vertices[prim.vertices[i].vertex].values);  // 12
        stream.write(tmd.normals[prim.vertices[i].normal].values);   // 12
        stream.write(prim.texture.texture[i].values(tim.data.info)); // 8
        stream.write(prim.texture.clutOffset.values(tim.clut.info)); // 8
        stream.write(prim.texture.clutFlags.values);                 // 12
      }

    this._buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buf);
    gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
  }

  draw(gl, pos)
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buf);
    gl.uniform3fv(Mesh._view, pos);

    for (let attrib of Mesh.attribs) {
      gl.enableVertexAttribArray(attrib.loc);
      gl.vertexAttribPointer(attrib.loc, attrib.length, gl.FLOAT, false,
        Mesh.byteLength, attrib.offset);
    }
    gl.drawArrays(gl.TRIANGLES, 0, this._nVertices);
  }

  delete(gl)
  {
    gl.deleteBuffer(this._buf);
  }

  static init(gl)
  {
    this.attribs = [];

    for (let [name, length, offset] of [
      ['vert', 3,  0],
      ['norm', 3, 12],
      ['uv',   2, 24],
      ['clutOffset', 2, 32],
      ['clutFlags', 3, 40],
    ]) {

      let loc = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), name);
      if (loc == -1)
        throw new Error(`Invalid attribute ${name}`);

      this.attribs.push({
        loc: loc,
        length: length,
        offset: offset
      });
    }

    this._view = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'mesh');
    if (this._view == -1)
      throw new Error(`Invalid uniform ${name}`);
  }

  static get byteLength() { return 13 * 4; }
}

