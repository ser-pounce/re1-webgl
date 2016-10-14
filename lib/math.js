export class Vec3
{
  static add(vec1, vec2)
  {
    vec1[0] += vec2[0];
    vec1[1] += vec2[1];
    vec1[2] += vec2[2];
  }
}


export class Mat4
{
  static mult(mat1, mat2)
  {
    let temp = Array.from(mat1);

    for (let i = 0; i < 4; ++i) {
      let row = i * 4;
      for (let j = 0; j < 4; ++j) {
        mat1[row + j] = temp[row] * mat2[j] +
                        temp[row + 1] * mat2[j + 4] +
                        temp[row + 2] * mat2[j + 8] +
                        temp[row + 3] * mat2[j + 12];
      }
    }
  }
}

