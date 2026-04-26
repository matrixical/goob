import { api } from "./api.js";
import { NoRecordsFoundError } from "./errors.js";
import { enableAllButtons, showPlayerInfo } from "./players.js";
import { Helper } from "./helper.js"
import { createLeaderboardUser } from "./users.js";


const searchButton = document.getElementById("searchTimeTrial");
const results = document.getElementById("timeTrialResults");
const uuidInput = document.getElementById("uuidTimeTrial")
const limit = document.getElementById("limitTimeTrial");


searchButton.onclick = async function(event) {
    setUrlParameter("level", uuidInput.value);
    await loadTimeTrialLeaderboard(uuidInput.value);
};


const decimal = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
});


export async function loadTimeTrialLeaderboard(uuid) {
    uuidInput.value = uuid;
    results.replaceChildren([]);
    
    const loading = document.createElement("div");
    loading.className = "loading";
    results.appendChild(loading);
    
    let leaderboard = null;
    try {
        leaderboard = await api.queryTimeTrialLeaderboard(uuid, parseInt(limit.value));
    } catch (error) {
        if (error instanceof NoRecordsFoundError) {
            loading.remove();
            const label = document.createElement("span");
            label.textContent = "No records found!";
            results.appendChild(label);
            return;
        }
    }
    
    await showTimeTrialLeaderboard(uuid, leaderboard);
    
    loading.remove();
}


async function showTimeTrialLeaderboard(uuid, leaderboard) {
    for (const user of Object.values(leaderboard)) {
        const button = createLeaderboardUser(user["username"]["value"], user["rank"], `${decimal.format(user["score"] / 100000)}s`, JSON.parse(user["metadata"])["country"])
        
        results.appendChild(button);
        
        button.onclick = async function(event) {
            button.disabled = true;
            enableAllButtons();
            await showPlayerInfo(user["owner_id"]);
            button.disabled = false;
            
            setUrlParameter("scene", "players");
            sceneRow.style.transform = "translateX(0vw)";
        }
    }
}


const urlSearchParams = new URLSearchParams(window.location.search);
if (urlSearchParams.has("level")) {
    const uuid = urlSearchParams.get("level");
    uuidInput.value = uuid;
    
    if (Helper.isValidUuid(uuid)) {
        await loadTimeTrialLeaderboard(uuid);
    }
}