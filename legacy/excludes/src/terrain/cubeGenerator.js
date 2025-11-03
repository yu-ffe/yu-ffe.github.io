import Aetheris from "../../aetheris/aetheris.js";
import { ObjectFactory } from "../../object/factory/objectFactory.js";

class CubeGenerator {
  constructor() {
    console.log("CubeGenerator constructor");
  }

  createTerrain() {
    let cubes = [];

    // 3D 좌표계에서 큐브 배치 (x, y, z 범위 설정)
    for (let row = -2; row < 2; row++) {
      for (let col = -2; col < 2; col++) {
        for (let height = -1; height < 1; height++) {
          // y 좌표를 추가해 3D로 배치
          let position = vec3.fromValues(row * 40, height * 40, col * 40); // 3D 좌표로 배치
          let rotation = vec3.fromValues(0, 0, 0); // 기본 회전값
          let scale = vec3.fromValues(1, 1, 1); // 기본 스케일값

          // 큐브를 생성하고, 각 큐브를 배열에 추가
          let cube = ObjectFactory.createCube(
            position,
            rotation,
            scale,
          );
          cubes.push(cube);
        }
      }
    }

    return cubes; // 생성된 큐브 배열 반환
  }

  createCube() {
    return cube;
  }
}

export default CubeGenerator;
