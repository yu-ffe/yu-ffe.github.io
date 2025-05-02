import Camera from "../camera/camera.js";  
import Terrain from "../terrain/terrain.js";  
import Cube from "../object/cube.js";  
import { DomFactory } from "../object/factory/objectFactory.js";  
import Aetheris from "../aetheris/aetheris.js";

class TerrainRenderer {
    constructor(camera, terrain) {
        this._camera = camera;
        this._terrain = terrain;

        console.log("TerrainRenderer constructor");
    }

    calculateRelativePosition(cameraTransform, cameraRotation, terrainPosition) {
        // 카메라와 블록의 월드 좌표 차이
        const dx = terrainPosition[0] - cameraTransform[0];
        const dy = terrainPosition[1] - cameraTransform[1];
        const dz = terrainPosition[2] - cameraTransform[2];

        // 카메라 회전값을 적용하여 상대적인 위치 계산
        return this.applyCameraRotation(dx, dy, dz, cameraRotation);
    }

    applyCameraRotation(dx, dy, dz, cameraRotation) {
        const radX = cameraRotation[0] * (Math.PI / 180);
        const radY = cameraRotation[1] * (Math.PI / 180);
        const radZ = cameraRotation[2] * (Math.PI / 180);

        // 회전 행렬을 적용하여 새로운 좌표 계산
        let x = dx, y = dy, z = dz;

        // X축 회전 (Pitch)
        let tempY = y * Math.cos(radX) - z * Math.sin(radX);
        let tempZ = y * Math.sin(radX) + z * Math.cos(radX);
        y = tempY;
        z = tempZ;

        // Y축 회전 (Yaw)
        let tempX = x * Math.cos(radY) + z * Math.sin(radY);
        tempZ = -x * Math.sin(radY) + z * Math.cos(radY);
        x = tempX;
        z = tempZ;

        // Z축 회전 (Roll)
        tempX = x * Math.cos(radZ) - y * Math.sin(radZ);
        tempY = x * Math.sin(radZ) + y * Math.cos(radZ);
        x = tempX;
        y = tempY;

        return vec3.fromValues(
            x * this._camera.getZoom(),  // X축 크기 조정
            y * this._camera.getZoom(),  // Y축 크기 조정
            z * this._camera.getZoom()   // Z축 크기 조정
        );
    }

    rendererTerrain() {
        const cameraPosition = this._camera.getPosition();  // 카메라의 위치 (vec3)
        const cameraRotation = this._camera.getRotation();  // 카메라의 회전값 (vec3)
        const cameraZoom = this._camera.getZoom();  // 카메라의 줌값

        const terrainData = this._terrain.getGrounds();  // 지형 데이터 가져오기

        terrainData.forEach(terrainData => {
            const groundPosition = terrainData.getPosition();
            const groundRotation = terrainData.getRotation();
            const groundSize = terrainData.getScale();

            const relativePosition = this.calculateRelativePosition(cameraPosition, cameraRotation, groundPosition);
            const adjustedRotation = this.calculateAdjustedRotation(cameraRotation, groundRotation);
            const adjustedSize = this.calculateAdjustedSize(groundSize, cameraZoom);

            // 없으면 생성, 있으면 위치 업데이트
            if (!terrainData._divElement) {
                terrainData._divElement = DomFactory.createCube(relativePosition, adjustedRotation, adjustedSize);
                Aetheris.getInstance()._aetherisArea.appendChild(terrainData._divElement);
            } else {
                console.log("update terrainData._divElement", terrainData._divElement);
                terrainData._divElement.style.transform = 
                    `translate3d(${relativePosition[0]}px, ${relativePosition[1]}px, ${relativePosition}px)
                     rotateX(${adjustedRotation[0]}deg) rotateY(${adjustedRotation[1]}deg) rotateZ(${adjustedRotation[2]}deg)
                     scale(${adjustedSize})`;
            }
        });
    }

    calculateAdjustedRotation(cameraRotation, terrainRotation) {
        return [
            terrainRotation[0] - cameraRotation[0],
            terrainRotation[1] - cameraRotation[1],
            terrainRotation[2] - cameraRotation[2]
        ];
    }

    calculateAdjustedSize(terrainSize, cameraZoom) {
        return vec3.fromValues(
            terrainSize[0] * cameraZoom,  // X축 크기 조정
            terrainSize[1] * cameraZoom,  // Y축 크기 조정
            terrainSize[2] * cameraZoom   // Z축 크기 조정
        );
    }
}

export default TerrainRenderer;
