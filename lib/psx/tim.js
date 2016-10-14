import DataStream from 'lib/datastream';

class Flag
{
  constructor(stream)
  {
    this._values = stream.readUint32(1);
  }

  get cf()    { return !!(this._values[0] & 0x8); }
  get pmode() { return this._values[0] & 0x7; }
}



class TimHeader
{
  constructor(stream)
  {
    this._values = stream.readUint32(1);
    this.flag = new Flag(stream);
  }

  get id() { return this._values[0]; }
}



class DataHeader
{
  constructor(stream)
  {
    this.byteLength = stream.readUint32(1)[0];
    this._values    = stream.readUint16(4);
  }

  get dx() { return this._values[0]; }
  get dy() { return this._values[1]; }
  get w()  { return this._values[2]; }
  set w(v) { this._values[2] = v;    }
  get h()  { return this._values[3]; }
}



class Color
{
  constructor(stream)
  {
    this._values = stream.readUint16(1);
  }

  get r()   { return this._values[0] & 0x1F; }
  get g()   { return (this._values[0] & 0x3E0) >> 5; }
  get b()   { return (this._values[0] & 0x7C00) >> 10; }
  get stp() { return (this._values[0] & 0x8000) >> 15; }
  toRGBA5551() { return this.stp | this.b << 1 | this.g << 6 | this.r << 11; }
}



class Clut
{
  constructor(stream)
  {
    let colors = [];
    colors.info = new DataHeader(stream);

    for (let i = 0; i < colors.info.w * colors.info.h; ++i)
      colors.push(new Color(stream));

    colors.toTexture = this.toTexture;

    return colors;
  }

  toTexture(gl, id = 0)
  {
    let tex = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + id);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,             // target
      0,                         // level
      gl.RGBA,                   // internalformat
      this.info.w,               // width
      this.info.h,               // height
      0,                         // border
      gl.RGBA,                   // format
      gl.UNSIGNED_SHORT_5_5_5_1, // type
      Uint16Array.from(this, c => c.toRGBA5551()) // pixels
    );

    return {texId: tex, unitId: id};
  }
}



class ImageData4bpp
{
  constructor(stream)
  {
    let pixels = [];
    pixels.info = new DataHeader(stream);

    let dataStart = stream.pos;

    for (let b of stream.readUint8(pixels.info.w * pixels.info.h * 2)) {
      pixels.push(b & 0xF);
      pixels.push((b & 0xF0) >> 4);
    }

    stream.pos = dataStart;
    pixels.raw = stream.readUint16(pixels.info.w * pixels.info.h);
    pixels.bpp = 4;

    return pixels;
  }
}



class ImageData8bpp
{
  constructor(stream)
  {
    let info = new DataHeader(stream);
    info.w *= 2;

    let dataStart = stream.pos;

    let pixels = stream.readUint8(info.w * info.h);
    pixels.info = info;

    stream.pos = dataStart;
    pixels.raw = stream.readUint16(info.w * info.h / 2);
    pixels.bpp = 8;

    pixels.toTexture = this.toTexture;

    return pixels;
  }

  toTexture(gl, id = 1)
  {
    let tex = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + id);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,    // target
      0,                // level
      gl.ALPHA,         // internalformat
      this.info.w,      // width
      this.info.h,      // height
      0,                // border
      gl.ALPHA,         // format
      gl.UNSIGNED_BYTE, // type
      this              // pixels
    );

    return {texId: tex, unitId: id};
  }
}



class ImageData15bpp
{
  constructor(stream)
  {
    let pixels  = [];
    pixels.info = new DataHeader(stream);
    
    let dataStart = stream.pos;

    for (let i = 0; i < pixels.info.w * pixels.info.h; ++i)
      pixels.push(new Color(stream));

    stream.pos = dataStart;
    pixels.raw = stream.readUint16(pixels.info.w * pixels.info.h);
    pixels.bpp = 15;

    return pixels;
  }
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



class ImageData24bpp
{
  constructor(stream)
  {
    let pixels  = [];
    pixles.info = new DataHeader(stream);
        
    let dataStart = stream.pos;

    for (let i = 0; i < pixels.info.w * pixels.info.h / 3; ++i)
      pixels.push(new Vec3Uint8(stream));

    stream.pos = dataStart;
    pixels.raw = stream.readUint16(pixels.info.w * pixels.info.h);
    pixels.bpp = 24;

    return pixels;
  }
}



export default class Tim
{
  constructor(buf)
  {
    let stream = new DataStream(buf);

    this.header = new TimHeader(stream);

    if (this.header.flag.cf)
      this.clut = new Clut(stream);

    switch (this.header.flag.pmode) {
      /*case 0:
        this.data = new ImageData4bpp(stream);
        break;*/
      case 1:
        this.data = new ImageData8bpp(stream);
        break;
      /*case 2:
        this.data = new ImageData15bpp(stream);
        break;
      case 3:
        this.data = new ImageData24bpp(stream);
        break;*/
      default:
        throw new Error(`Tim type ${this.header.flag.pmode} not implemented`);
    }
  }
}

