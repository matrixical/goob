import { api } from "./api.js";
import { NoRecordsFoundError } from "./errors.js";
import { enableAllButtons, showPlayerInfo } from "./players.js";
import { Helper } from "./helper.js"


const searchQueryLabel = document.getElementById("searchQueryLabel");
const searchQuery = document.getElementById("searchQuery");
const searchLevel = document.getElementById("searchLevel");


searchLevel.onclick = async function(event) {
    results.replaceChildren([]);
    
    const resultsSpan = document.createElement("span");
    resultsSpan.textContent = "Results";
    results.appendChild(resultsSpan);
    
    const loading = document.createElement("div");
    loading.className = "loading";
    results.appendChild(loading);
    
    const levels = await api.queryLevelsSearch(searchQuery.value);
    loadLevels(levels);
    
    loading.remove();
};


const timeRange = document.getElementById("timeRange");
let isOnMostFavorited = false;

timeRange.onchange = async function(event) {
    results.replaceChildren([]);
    
    const resultsSpan = document.createElement("span");
    resultsSpan.textContent = "Results";
    results.appendChild(resultsSpan);
    
    const loading = document.createElement("div");
    loading.className = "loading";
    results.appendChild(loading);
    
    const levels = await api.queryLevelsMostFavorited(timeRange.value);
    loadLevels(levels);
    
    loading.remove();
};


const levelQueries = document.getElementById("levelQueries");
levelQueries.onchange = queryLevel

const results = document.getElementById("levelResults");


async function queryLevel() {
    results.replaceChildren([]);
    
    const resultsSpan = document.createElement("span");
    resultsSpan.textContent = "Results";
    results.appendChild(resultsSpan);
    
    searchQueryLabel.hidden = true;
    searchQuery.hidden = true;
    searchLevel.hidden = true;
    
    timeRange.hidden = true;
    isOnMostFavorited = false;
    
    if (levelQueries.value == "queryLevelsSearch") {
        searchQueryLabel.hidden = false;
        searchQuery.hidden = false;
        searchLevel.hidden = false;
        return;
    }
    
    const loading = document.createElement("div");
    loading.className = "loading";
    results.appendChild(loading);
    
    let levels;
    
    if (levelQueries.value == "queryLevelsMostFavorited") {
        timeRange.hidden = false;
        isOnMostFavorited = true;
        levels = await api.queryLevelsMostFavorited(timeRange.value);
    } else {
        levels = await api[levelQueries.value]();
    }
    
    loadLevels(levels);
    
    loading.remove();
}

queryLevel();


const decimal = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});


const buttons = [];


function loadLevels(levels) {
    for (const level of levels) {
        const button = document.createElement("button");
        button.className = "level";
        
        let ratingHTML;
        
        if (isOnMostFavorited) {
            ratingHTML = `
                <div class="horizontal">
                    <img class="red" src="icons/favorite.png">
                    <span class="green">${level["favorites_count"]}</span>
                </div>
            `;
        } else {
            const ratingPercentage = "rating" in level ? (25 * (level["rating"] - 1)) : 0;
        
            let ratingColor = "unknown";
            if (ratingPercentage >= 70) {
                ratingColor = "green";
            } else if (ratingPercentage >= 50) {
                ratingColor = "yellow";
            } else if (ratingPercentage > 0){
                ratingColor = "red";
            }
            
            ratingHTML = `
                <div class="horizontal">
                    <img class="${ratingColor}" src="icons/rate.png">
                    <span class="${ratingColor}">${decimal.format(ratingPercentage)}%</span>
                </div>
                <span class="smallFont">(${level["rating_count"] ?? 0})</span>
            `;
        }
        
        button.innerHTML = `
            <div class="vertical textLeft">
                <span>${level["name"]}</span>
                <span>${level["author_name"]}</span>
                <span class="smallFont">${level["game_mode"]} (${level["player_count"]})</span>
            </div>
            <div class="vertical textRight">
                <span class="smallFont">${Helper.timeAgo(level["update_time"])}</span>
                ${ratingHTML}
            </div>
        `;
        
        results.appendChild(button);
        buttons.push(button)
        
        button.onclick = async function(event) {
            for (const otherButton of buttons) {
                otherButton.disabled = otherButton == button;
            }
            
            await showLevelInfo(level["id"], level);
        }
    }
}


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


const nameLabel = document.getElementById("levelName");
const levelIdLabel = document.getElementById("levelLevelId");
const creatorNameLabel = document.getElementById("levelCreatorName");
const creatorIdLabel = document.getElementById("levelCreatorId");
const createTimeLabel = document.getElementById("levelCreateTime");
const createTimeHoverLabel = document.getElementById("levelCreateTimeHover");
const lastUpdateLabel = document.getElementById("levelLastUpdate");
const lastUpdateHoverLabel = document.getElementById("levelLastUpdateHover");
const playerCountLabel = document.getElementById("levelPlayerCount");
const themeLabel = document.getElementById("levelTheme");
const statusLabel = document.getElementById("levelStatus");
const gamemodeLabel = document.getElementById("levelGamemode");
const ratingLabel = document.getElementById("levelRating");
const ratingCountLabel = document.getElementById("levelRatingCount");


async function showLevelInfo(uuid, level) {
    setUrlParameter("level", uuid);
    
    if (!level) {
        const levels = await api.queryLevelsSearch(uuid);
        level = levels[0];
    }
    
    nameLabel.textContent = level["name"];
    levelIdLabel.textContent = level["id"];
    creatorNameLabel.textContent = level["author_name"];
    creatorIdLabel.textContent = level["author_id"];
    
    createTimeLabel.textContent = Helper.timeAgo(level["create_time"])
    createTimeHoverLabel.textContent = `${level["create_time"].split("T")[0]} @ ${level["create_time"].split("T")[1].slice(0, -1)} UTC (YYYY/MM/DD)`;
    
    lastUpdateLabel.textContent = Helper.timeAgo(level["update_time"])
    lastUpdateHoverLabel.textContent = `${level["update_time"].split("T")[0]} @ ${level["update_time"].split("T")[1].slice(0, -1)} UTC (YYYY/MM/DD)`;
    
    playerCountLabel.textContent = level["player_count"];
    themeLabel.textContent = capitalize(level["theme"]);
    statusLabel.textContent = level["published"] == "Curated" ? "Certified" : level["published"];
    gamemodeLabel.textContent = level["game_mode"];
    
    const ratingPercentage = "rating" in level ? (25 * (level["rating"] - 1)) : 0;
    ratingLabel.textContent = `${decimal.format(ratingPercentage)}%`;
    
    ratingCountLabel.textContent = level["rating_count"] ?? 0;
}


const urlSearchParams = new URLSearchParams(window.location.search);
if (urlSearchParams.has("level")) {
    const uuid = urlSearchParams.get("level");
    
    if (Helper.isValidUuid(uuid)) {
        await showLevelInfo(uuid);
    }
}