// elythra 생성 함수
function createIsometricTextBox() {
    let a = document.createElement("div");
    a.innerHTML = "YUFFE 개인 페이지";

    // 스타일 직접 적용
    a.style.position = "absolute";
    a.style.left = "15%";
    a.style.top = "40%";

    a.style.width = "200px";
    a.style.height = "150px";
    a.style.display = "flex";
    a.style.justifyContent = "center";
    a.style.alignItems = "center";
    a.style.backgroundColor = "#3498db";
    a.style.color = "white";
    a.style.fontSize = "18px";
    a.style.fontWeight = "bold";
    a.style.borderRadius = "8px";
    a.style.transform = "rotateX(45deg) rotateY(-30deg) rotateZ(0deg)";
    a.style.boxShadow = "4px 4px 10px rgba(0, 0, 0, 0.3)";

    // 다른 객체와 상호작용하지 않도록 설정
    a.style.pointerEvents = "none"; 
    a.style.zIndex = "15";

    document.body.prepend(a);
    
    // 최초 한 번만 크기와 위치를 조정
    resizeGameArea();
}

// 최초 실행 시 elythra 생성 및 크기 조정
createIsometricTextBox();
