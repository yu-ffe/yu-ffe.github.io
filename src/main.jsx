// Stream_LiveGame :: React 런타임과 DOM 렌더러, 루트 컴포넌트를 불러온다.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
// Stream_LiveGame :: 전역 스타일 시트를 적용한다.
import './index.css';

// Stream_LiveGame :: 루트 DOM 노드에 React 애플리케이션을 마운트한다.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Stream_LiveGame :: 개발 중 경고와 검사 강화를 위해 StrictMode 사용. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
