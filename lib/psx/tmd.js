import DataStream from 'lib/datastream';

class SectionHeader
{
  constructor(stream)
  {
    this._values = stream.readUint32(3);
  }

  get id()    { return this._values[0]; }
  get flags() { return this._values[1]; }
  get nobj()  { return this._values[2]; }

  static get size() { return Uint32Array.BYTES_PER_ELEMENT * 3 };
}



class ObjHeader
{
  constructor(stream)
  {
    this._values = stream.readUint32(7);
  }
   
  get vert_top()      { return this._values[0]; }
  get n_vert()        { return this._values[1]; }
  get normal_top()    { return this._values[2]; }
  get n_normal()      { return this._values[3]; }
  get primitive_top() { return this._values[4]; }
  get n_primitive()   { return this._values[5]; }
  get scale()         { return this._values[6]; }
}



class PrimitiveHeader
{
  constructor(stream)
  {
    this._values = stream.readUint8(4);
  }

  get olen() { return this._values[0]; }
  get ilen() { return this._values[1]; }
  get flag() { return this._values[2]; }
  get mode() { return this._values[3]; }
}



class PrimitiveFlags
{
  constructor(stream)
  {
    this.header = new PrimitiveHeader(stream);
  }

  get option() { return this.header.mode & 0x1F; }
  get code() { return (this.header.mode & 0xE0) >> 5; }
  get grd()  { return !!(this.header.flag & 0x4); }
  get fce()  { return !!(this.header.flag & 0x2); }
  get lgt()  { return !(this.header.flag & 0x1); }
  get iip()  { return !!(this.option & 0x10); }
  get quad() { return !!(this.option & 0x8); }
  get tme()  { return !!(this.option & 0x4); }
  get abe()  { return !!(this.option & 0x2); }
  get tge()  { return !(this.option & 0x1); }
}



class Vec2Uint8
{
  constructor(stream)
  {
    this._values = stream.readUint8(2);
  }

  get u() { return this._values[0]; }
  get v() { return this._values[1]; }
  values(info) { return new Float32Array([this.u / info.w, this.v / info.h]); }
}



class Vec3Uint8
{
  constructor(stream)
  {
    this._values = stream.readUint8(3);
  }

  get r() { return this._values[0]; }
  get g() { return this._values[1]; }
  get b() { return this._values[2]; }
}



class ClutOffset
{
  constructor(stream)
  {
    this._values = stream.readUint16(1);
  }

  get x() { return (this._values[0] & 0x3F)   << 4; }
  get y() { return (this._values[0] & 0x7FC0) >> 6; }
  values(info) { return new Float32Array([
    (this.x - info.dx) * .5,
    (this.y - info.dy) * .5
  ]); }
}



class ClutFlags
{
  constructor(stream)
  {
    this._values = stream.readUint16(1);
  }

  get tpage() { return this._values[0] & 0x1F; }
  get abr()   { return (this._values[0] & 0x60)  >> 5; }
  get tpf()   { return (this._values[0] & 0x180) >> 7; }
  get values() { return new Float32Array([this.tpage * .5, this.abr, this.tpf]); }
}



class Texture
{
  constructor(stream, isQuad)
  {
    this.texture = [new Vec2Uint8(stream)];
    this.clutOffset = new ClutOffset(stream);
    this.texture.push(new Vec2Uint8(stream));
    this.clutFlags = new ClutFlags(stream);
    this.texture.push(new Vec2Uint8(stream));

    stream.pos += 2;

    if (isQuad) {
      this.texture.push(new Vec2(stream));
      stream.pos += 2;
    }
  }
}



class Color
{
  constructor(stream, flags)
  {
    let color = Array(flags.grd ? (flags.quad ? 4 : 3) : 1);

    for (let i = 0; i < color.length; ++i) {
      color.push(new Vec3Uint8(Stream));
      ++stream.pos;
    }

    return color;
  }
}



class Vertices
{
  constructor(stream, flags)
  {
    let nVerts = flags.quad ? 4 : 3;
    let prim = [];

    if (flags.lgt) {
      if (flags.iip)
        for (let i = 0; i < nVerts; ++i)
          prim.push({
            normal: stream.readUint16(1)[0],
            vertex: stream.readUint16(1)[0],
          });

      else {
        let normal = stream.readUint16(1)[0];
        for (let i = 0; i < nVerts; ++i)
          obj.push({
            normal: normal,
            vertex: stream.readUint16(1)[0],
          });
      }

    } else
      for (let i = 0; i < nVerts; ++i)
        obj.push({ vertex: stream.readUint16(1)[0] });

    return prim;
  }
}



class Polygon
{
  constructor(stream, flags)
  {
    this.flags = flags;

    if (flags.tme)
      this.texture = new Texture(stream, flags.quad);

    if (!flags.tme || (flags.tme && !flags.lgt))
      this.vertices = new Color(stream, flags);

    this.vertices = new Vertices(stream, flags);
  }
}



function readPrimitive(stream)
{
  let flags = new PrimitiveFlags(stream);

  switch (flags.code) {
    case 1:
      return new Polygon(stream, flags);
    default:
      throw new Error(`Primitive ${flags.code} Not implemented`);
    /*case 2:
      return new Line(stream, flags);
    case 3:
      return new Sprite(stream, flags);*/
  }
}



class Vertex
{
  constructor(stream)
  {
    this._values = stream.readInt16(3);
  }

  get x() { return this._values[0]; }
  get y() { return this._values[1]; }
  get z() { return this._values[2]; }
  get values() { return new Float32Array([
    this.z / 0x7FFF,
    -this.y / 0x7FFF,
    -this.x / 0x7FFF,
  ]); }
}



class Normal
{
  constructor(stream)
  {
    this._values = stream.readInt16(3);
  }

  get x() { return this._values[0]; }
  get y() { return this._values[1]; }
  get z() { return this._values[2]; }
  get values() { return new Float32Array([
    this.z / 4096,
    -this.y / 4096,
    -this.x / 4096,
  ]); }
}



class Mesh
{
  constructor(header, stream)
  {
    stream.pos    = SectionHeader.size + header.vert_top;
    this.vertices = [];

    for (let i = 0; i < header.n_vert; ++i) {
      this.vertices.push(new Vertex(stream));
      stream.pos += 2;
    }

    stream.pos   = SectionHeader.size + header.normal_top;
    this.normals = [];

    for (let i = 0; i < header.n_normal; ++i) {
      this.normals.push(new Normal(stream));
      stream.pos += 2;
    }

    stream.pos      = SectionHeader.size + header.primitive_top;
    this.primitives = [];

    for (let i = 0; i < header.n_primitive; ++i)
      this.primitives.push(readPrimitive(stream));

    this.scale = header.scale;
  }
}



export default class Tmd
{
  constructor(buf)
  {
    let stream  = new DataStream(buf);
    let h       = new SectionHeader(stream);

    let headers = [];
    for (let i = 0; i < h.nobj; ++i)
      headers.push(new ObjHeader(stream));

    let meshes = [];

    for (let header of headers)
      meshes.push(new Mesh(header, stream));

    return meshes;
  }
}

