import DataStream from 'lib/datastream';

class Header
{
  constructor(stream)
  {
    this._values = stream.readUint16(2);
  }

  get steps() { return this._values[0]; }
  get offset() { return this._values[1]; }

  static get size() { return 4; }
}



class Animation
{
  constructor(stream)
  {
    this._values = stream.readUint16(2);
  }

  get keyframe() { return this._values[0]; }
  get duration() { return this._values[1]; }
}



export default class Section1
{
  constructor(buf)
  {
    let stream = new DataStream(buf);
    let header = [new Header(stream)];

    for (let i = 1; i < header[0].offset / Header.size; ++i)
      header.push(new Header(stream));

    let animations = [];

    for (let h of header) {

      stream.pos = h.offset;
      let animation = [];

      for (let i = 0; i < h.steps; ++i)
        animation.push(new Animation(stream));

      animations.push(animation);
    }

    return animations;
  }
}

