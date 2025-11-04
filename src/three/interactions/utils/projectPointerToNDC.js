// Stream_LiveGame :: 포인터 좌표를 Three.js 정규화 장치 좌표(NDC)로 변환한다.
export function projectPointerToNDC(event, domElement) {
  if (!event) {
    return { x: 0, y: 0 };
  }

  const rect = getElementRect(domElement);
  const width = rect?.width ?? window.innerWidth;
  const height = rect?.height ?? window.innerHeight;

  if (!width || !height) {
    return { x: 0, y: 0 };
  }

  const offsetX = rect ? event.clientX - rect.left : event.clientX;
  const offsetY = rect ? event.clientY - rect.top : event.clientY;

  const x = (offsetX / width) * 2 - 1;
  const y = -(offsetY / height) * 2 + 1;

  return { x, y };
}

function getElementRect(domElement) {
  if (!domElement || typeof domElement.getBoundingClientRect !== "function") {
    return null;
  }

  const rect = domElement.getBoundingClientRect();
  if (!rect || rect.width === 0 || rect.height === 0) {
    return null;
  }

  return rect;
}
