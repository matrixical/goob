const sceneRow = document.getElementById("sceneRow");

const sceneButtonPlayers = document.getElementById("sceneButtonPlayers");
sceneButtonPlayers.onclick = function(event) {
    sceneRow.style.transform = "translateX(0vw)";
}


const sceneButtonLevels = document.getElementById("sceneButtonLevels");
sceneButtonLevels.onclick = function(event) {
    sceneRow.style.transform = "translateX(-100vw)";
}


const sceneButtonCrowns = document.getElementById("sceneButtonCrowns");
sceneButtonCrowns.onclick = function(event) {
    sceneRow.style.transform = "translateX(-200vw)";
}