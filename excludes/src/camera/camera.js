import Transform from "../../object/transform.js";

class Camera extends Transform {

  constructor(position, rotation, scale, zoom = 1) {
    super(position, rotation, scale); // Transform의 생성자 호출

    this.zoom = zoom; // 확대/축소 비율

    console.log("Camera constructor");
  }

  setZoom(zoom) {
    this.zoom = zoom;
  }

  getZoom() {
    return this.zoom;
  }

}

export default Camera;