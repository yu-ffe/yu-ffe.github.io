import * as THREE from "three";

export function handleClick(camera, scene, renderer) {
    window.addEventListener("click", (event) => {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (clickedObject.userData && clickedObject.userData.link) {
                // 🔗 클릭된 텍스트의 링크로 이동
                window.open(clickedObject.userData.link, "_blank");
            }
        }
    });
}