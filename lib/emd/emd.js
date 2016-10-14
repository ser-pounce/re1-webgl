import Section0 from './section0';
import Section1 from './section1';
import Tmd from 'lib/psx/tmd';
import Tim from 'lib/psx/tim';

export default class Emd
{
  constructor(buf)
  {
    let dataEnd = buf.byteLength - 4 * Uint32Array.BYTES_PER_ELEMENT;
    let offsets = new Uint32Array(buf, dataEnd);

    this.section0 = new Section0(buf.slice(offsets[0], offsets[1]));
    this.section1 = new Section1(buf.slice(offsets[1], offsets[2]));
    this.tmd = new Tmd(buf.slice(offsets[2], offsets[3]));
    this.tim = new Tim(buf.slice(offsets[3], dataEnd));
  }
}

