import Transform from "./transform.js";

class Cube extends Transform {
  constructor(position = null, rotation = null, scale = null) {
    super(position, rotation, scale); // Transform의 생성자를 호출하여 초기화
    this._divElement = null; // 큐브 엘리먼트
  }

}

export default Cube;