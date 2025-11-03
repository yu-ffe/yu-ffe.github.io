import Camera from "../camera/camera.js";
import Terrain from "../terrain/terrain.js";
import TerrainRenderer from "../terrain/terrainRenderer.js";

class Aetheris {
  static _instance = null;
  _prevWidth = 1;

  constructor() {
    if (Aetheris._instance) {
      return Aetheris._instance;
    }
    Aetheris._instance = this;

    this._aetherisArea = this.createAetherisArea();
    this._camera = new Camera(vec3.create(0, 0, -5), vec3.create(20, 20, 20));
    this._terrain = new Terrain();
    this._terrainRenderer = new TerrainRenderer(this._camera, this._terrain);

    this._prevWidth = parseFloat(this._aetherisArea.style.width) || 1;

    window.addEventListener("resize", this.resizeGameArea.bind(this));
    this.resizeGameArea();

    console.log("Aetheris constructor");
  }

  static getInstance() {
    if (!Aetheris._instance) {
      Aetheris._instance = new Aetheris();
    }
    return Aetheris._instance;
  }

  createAetherisArea() {
    const area = document.createElement("div");
    area.id = "aetheris";
    Object.assign(area.style, {
      position: "relative",
      backgroundColor: "#808080",
      overflow: "hidden",
      zIndex: "100",
      userSelect: "none",
      webkitUserDrag: "none",
      userDrag: "none",
    });

    document.body.prepend(area);
    return area;
  }

  resizeGameArea() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const aspectRatio = Math.sqrt(2);

    const calculateAetherisArea = {
      wide: () => [windowWidth, windowWidth * aspectRatio],
      tall: () => [windowHeight / aspectRatio, windowHeight],
    };

    const isWide = windowHeight > windowWidth * aspectRatio;
    const [aetherisAreaWidth, aetherisAreaHeight] = isWide
      ? calculateAetherisArea.wide()
      : calculateAetherisArea.tall();

    this._aetherisArea.style.width = `${aetherisAreaWidth}px`;
    this._aetherisArea.style.height = `${aetherisAreaHeight}px`;

    const scale = aetherisAreaWidth / this._prevWidth;

    this._prevWidth = aetherisAreaWidth;

    this._terrainRenderer.rendererTerrain();
  }

  // updateElementsSize(scale) {
  //   const elements = this._aetherisArea.querySelectorAll("*");

  //   elements.forEach((element) => {
  //     if (element === this._aetherisArea) return;
  //     if (["IMG", "P"].includes(element.tagName)) return;

  //     // 요소 크기 조정
  //     element.style.width = `${parseFloat(element.style.width || 0) * scale}px`;
  //     element.style.height = `${parseFloat(element.style.height || 0) * scale}px`;

  //     // 위치 조정
  //     element.style.left = `${parseFloat(element.style.left || 0) * scale}px`;
  //     element.style.top = `${parseFloat(element.style.top || 0) * scale}px`;
  //   });
  // }
}

export default Aetheris;
