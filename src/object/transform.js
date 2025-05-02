class Transform {
  constructor(position = null, rotation = null, scale = null) {
    this._position = position || vec3.create(); // 위치 (vec3) 기본값 설정
    this._rotation = rotation || vec3.create(); // 회전 (쿼터니언) 기본값 설정
    this._scale = scale || vec3.fromValues(1, 1, 1); // 크기 (vec3) 기본값 설정
  }

  setTransform(position, rotation = null, scale = null) {
    this._position = position || this._position;
    this._rotation = rotation || this._rotation;
    this._scale = scale || this._scale;
  }

  setPosition(position) {
    this._position = position;
  }

  setRotation(rotation) {
    this._rotation = rotation;
  }

  getTransform() {
    return {
      position: this._position,
      rotation: this._rotation,
      scale: this._scale,
    };
  }

  getPosition() {
    return this._position;
  }

  getRotation() {
    return this._rotation;
  }

  getScale() {
    return this._scale;
  }
}

export default Transform;
