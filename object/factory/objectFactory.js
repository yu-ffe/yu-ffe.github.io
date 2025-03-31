import Cube from "../cube.js";

export class ObjectFactory {
  static createCube(position, rotation, scale) {
    return new Cube(position, rotation, scale);
  }
}

export class DomFactory {
  static createCube(position, rotation, scale) {
    let div = document.createElement("div");
    div.classList.add("cube");

    // 크기 적용
    div.style.width = `${scale[0]}px`;
    div.style.height = `${scale[1]}px`;

    div.style.left = `${position[0]}px`;
    div.style.top = `${position[1]}px`;

    div.style.position = "absolute";

    // 3D 위치 및 회전 적용

    return div;
  }
}