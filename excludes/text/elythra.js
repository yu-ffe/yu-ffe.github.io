// elythra 생성 함수
function createIsometricTextBox() {
    elythra = document.createElement("div");
    elythra.style.position = "absolute";
    elythra.id = "elythra";

    // 다른 객체와 상호작용하지 않도록 설정
    elythra.style.pointerEvents = "none"; 

    // elythra를 좌측 하단에 고정
    elythra.innerHTML = "𝐘𝐔__𝐅𝐅𝐄,<br>To weave the celestial wonder upon a limitless canvas.";
    elythra.style.bottom = "5%";
    elythra.style.left = "5%";
    elythra.style.width = "auto";  // 크기 조정 (필요시 변경)
    elythra.style.height = "100px"; // 크기 조정 (필요시 변경)
    elythra.style.zIndex = "11";
    
    document.body.prepend(elythra);
    
    // 최초 한 번만 크기와 위치를 조정
    resizeGameArea();
};

// 최초 실행 시 elythra 생성 및 크기 조정
createIsometricTextBox();
