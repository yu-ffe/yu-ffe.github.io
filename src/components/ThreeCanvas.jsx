// Stream_LiveGame :: React 훅과 Three.js 초기화 진입점을 불러온다.
import { useEffect, useRef } from 'react';
import { createThreeExperience } from '../three/index.js';

function ThreeCanvas() {
  // Stream_LiveGame :: 실제 DOM 캔버스 요소를 참조하기 위한 ref 생성.
  const canvasRef = useRef(null);

  useEffect(() => {
    // Stream_LiveGame :: 마운트 이후에만 캔버스를 참조하도록 보호.
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    // Stream_LiveGame :: Three.js 애플리케이션을 초기화하고 정리 함수를 수신한다.
    const dispose = createThreeExperience(canvas);

    return () => {
      // Stream_LiveGame :: 컴포넌트 언마운트 시 렌더 루프와 이벤트를 해제한다.
      dispose?.();
    };
  }, []);

  // Stream_LiveGame :: 접근성을 고려한 캔버스 요소 반환.
  return <canvas ref={canvasRef} id="webgl-canvas" aria-label="3D 렌더링 캔버스" role="img" />;
}

// Stream_LiveGame :: ThreeCanvas 컴포넌트를 기본 내보내기로 등록.
export default ThreeCanvas;
