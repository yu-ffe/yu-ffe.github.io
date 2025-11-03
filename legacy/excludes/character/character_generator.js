let character;

function createCharacter() {
  character = document.createElement("div");
  character.classList.add("character");
  character.style.position = "absolute";
  character.style.left = parseFloat(aetherisArea.style.width) / 2 + "px";
  character.style.top = parseFloat(aetherisArea.style.height) / 2 + "px";
  character.style.width = parseFloat(aetherisArea.style.width) * 0.05 + "px";
  character.style.height = parseFloat(aetherisArea.style.height) * 0.05 + "px";
  character.style.zIndex = 10;
  character.style.transform = "translate(-50%, -50%)";

  const img = document.createElement("img");
  img.src = "../image/character/gwen_stop.gif";
  img.alt = "Character";

  character.appendChild(img);
  aetherisArea.appendChild(character);

}

createCharacter();
