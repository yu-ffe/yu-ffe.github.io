export function startRenderLoop({ renderer, scene, camera }) {
  const render = () => {
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(render);
}
