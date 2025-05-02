import CubeManager from "./cubeManager.js";

class Terrain{
    constructor(){
        this._grounds = [];
        this._cubeManager = new CubeManager();

        this.createTerrain();

        console.log("Terrain constructor");
    }

    getGrounds(){
        return this._grounds;
    }

    createTerrain(){
        this._grounds = this._cubeManager.createAndAddCubes();
    }

}

export default Terrain;