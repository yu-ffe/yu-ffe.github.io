import { useEffect, useRef } from 'react';
import { createThreeExperience } from '../three/main.js';

function ThreeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const dispose = createThreeExperience(canvas);

    return () => {
      dispose?.();
    };
  }, []);

  return <canvas ref={canvasRef} id="webgl-canvas" aria-label="3D 렌더링 캔버스" role="img" />;
}

export default ThreeCanvas;
