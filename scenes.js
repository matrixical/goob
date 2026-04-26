function setUrlParameter(parameter, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(parameter, value);
    window.history.pushState({}, "", url);
}


function deleteUrlParameter(parameter) {
    const url = new URL(window.location.href);
    url.searchParams.delete(parameter);
    window.history.pushState({}, "", url);
}


const sceneRow = document.getElementById("sceneRow");

const sceneButtonPlayers = document.getElementById("sceneButtonPlayers");
sceneButtonPlayers.onclick = function(event) {
    sceneRow.style.transform = "translateX(0vw)";
    
    setUrlParameter("scene", "players");
    
    deleteUrlParameter("player", "");
    deleteUrlParameter("level", "");
    deleteUrlParameter("type", "");
};


const sceneButtonLevels = document.getElementById("sceneButtonLevels");
sceneButtonLevels.onclick = function(event) {
    sceneRow.style.transform = "translateX(-100vw)";
    
    setUrlParameter("scene", "levels");
    
    deleteUrlParameter("player", "");
    deleteUrlParameter("level", "");
    deleteUrlParameter("type", "");
};


const sceneButtonTimeTrials = document.getElementById("sceneButtonTimeTrials");
sceneButtonTimeTrials.onclick = function(event) {
    sceneRow.style.transform = "translateX(-200vw)";
    
    setUrlParameter("scene", "timeTrials");
    
    deleteUrlParameter("player", "");
    deleteUrlParameter("level", "");
    deleteUrlParameter("type", "");
};


const sceneButtonCrowns = document.getElementById("sceneButtonCrowns");
sceneButtonCrowns.onclick = function(event) {
    sceneRow.style.transform = "translateX(-300vw)";
    
    setUrlParameter("scene", "crowns");
    
    deleteUrlParameter("player", "");
    deleteUrlParameter("level", "");
    deleteUrlParameter("type", "");
};


const urlSearchParams = new URLSearchParams(window.location.search);
if (urlSearchParams.has("scene")) {
    const sceneName = urlSearchParams.get("scene").toLowerCase();
    
    switch (sceneName) {
        case "players":
            sceneRow.style.transform = "translateX(0vw)";
            break;
        case "levels":
            sceneRow.style.transform = "translateX(-100vw)";
            break;
        case "timetrials":
            console.log("asdf")
            sceneRow.style.transform = "translateX(-200vw)";
            break
        case "crowns":
            sceneRow.style.transform = "translateX(-300vw)";
            break;
        default:
            break;
    }
} else {
    setUrlParameter("scene", "players");
}