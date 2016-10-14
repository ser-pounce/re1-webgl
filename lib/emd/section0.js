import DataStream from 'lib/datastream';

class Header
{
  constructor(stream)
  {
    this._values = stream.readUint16(4);
  }

  get skeletonOffset() { return this._values[0]; }
  get keyframeOffset() { return this._values[1]; }
  get meshesLength() { return this._values[2]; }
  get keyframeSize() { return this._values[3]; }
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



class SkeletonHeader
{
  constructor(stream)
  {
    this._values = stream.readUint16(2);
  }

  get childrenLength() { return this._values[0]; }
  get offset() { return this._values[1]; }
}



class Skeleton
{
  constructor(stream, length)
  {
    let offset = stream.pos;

    let header = [];
    for (let i = 0; i < length; ++i)
      header.push(new SkeletonHeader(stream));

    let skeleton = [];

    for (let h of header) {
      stream.pos = offset + h.offset;
      skeleton.push(stream.readUint8(h.childrenLength));
    }

    return skeleton;
  }
}



class Keyframe
{
  constructor(stream, meshesLength)
  {
    this.offset   = new Vertex(stream);
    this.rotation = new Vertex(stream);
    this.meshRotations = [];

    for (let i = 0; i < meshesLength; ++i)
      this.meshRotations.push(new Vertex(stream));
  }
}



export default class Section0
{
  constructor(buf)
  {
    let stream  = new DataStream(buf);
    let h       = new Header(stream);

    this.meshes = [];
    for (let i = 0; i < h.meshesLength; ++i)
      this.meshes.push(new Vertex(stream));

    stream.pos     = h.skeletonOffset;
    this.skeleton  = new Skeleton(stream, h.meshesLength);

    stream.pos = h.keyframeOffset;
    this.keyframes = [];

    while (stream.pos < buf.byteLength - h.keyframeSize) {
      this.keyframes.push(new Keyframe(stream, h.meshesLength));
      stream.pos += 2; // padding
    }
  }
}

