import CubeGenerator from "./cubeGenerator.js";

class CubeManager{
    constructor(){
        this._cubeGenerator = new CubeGenerator();

        console.log("CubeManager constructor");
    }

    createAndAddCubes(){
        const newCubes = this._cubeGenerator.createTerrain();
        return newCubes;
    }
}

export default CubeManager;