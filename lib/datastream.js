export default class DataStream
{
  constructor(buffer, pos = 0)
  {
    this._buffer = buffer;
    this._pos    = pos;
  }

  readFloat32(length)
  {
    return this._read(Float32Array, length);
  }

  readFloat64(length)
  {
    return this._read(Float64Array, length);
  }

  readInt8(length)
  {
    return this._read(Int8Array, length);
  }

  readInt16(length)
  {
    return this._read(Int16Array, length);
  }

  readInt32(length)
  {
    return this._read(Int32Array, length);
  }

  readUint8(length)
  {
    return this._read(Uint8Array, length);
  }

  readUint16(length)
  {
    return this._read(Uint16Array, length);
  }

  readUint32(length)
  {
    return this._read(Uint32Array, length);
  }

  write(arr)
  {
    try {
      let a = new arr.constructor(this._buffer, this._pos, arr.length);
      a.set(arr);
      this.pos += a.byteLength;
    } catch (e) {
      throw new Error(`Invalid write of ${arr.constructor} length [$arr.length} @ byte ${this.pos}`); 
    }
  }

  get pos() { return this._pos; }

  set pos(pos)
  {
    if (pos < 0)
      throw new Error(`Seek to byte ${pos} is before begin`);
    if (pos > this._buffer.byteLength)
      throw new Error(`Seek to byte ${pos} is past end`);
    this._pos = pos;
  }

  _read(type, length)
  {
    try {
      let a = new type(this._buffer, this._pos, length);
      this.pos += a.byteLength;
      return a;
    } catch (e) {
      throw new Error(`Invalid read of ${type} length [$length} @ byte ${this.pos}`); 
    }
  }
}

