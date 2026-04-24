import { api } from "./api.js";
import { Helper } from "./helper.js"


const searchList = document.getElementById("playerSearch");
const uuidOrUsername = document.getElementById("uuidOrUsername");
const searchPlayer = document.getElementById("searchPlayer");

const buttons = [];


searchPlayer.onclick = async function(event) {
    const loading = document.createElement("div");
    loading.className = "loading";
    searchList.appendChild(loading);
    
    const users = {};
    if (Helper.isValidUuid(uuidOrUsername.value)) {
        const user = await api.getUser(uuidOrUsername.value);
        users[uuidOrUsername.value] = user["username"]
    } else {
        const levels = await api.queryLevelsSearch(uuidOrUsername.value);
        
        for (const level of levels) {
            if ((level["author_name"] == uuidOrUsername.value) && !(level["author_id"] in users)) {
                users[level["author_id"]] = uuidOrUsername.value
            }
        }
    }
    
    loading.remove();
    
    for (const uuid in users) {
        const username = users[uuid];
        
        const userButton = document.createElement("button");
        userButton.className = "player";
        
        const name = document.createElement("span");
        name.textContent = username;
        userButton.appendChild(name);
        
        searchList.appendChild(userButton);
        buttons.push(userButton);
        
        userButton.onclick = async function(event) {
            for (const otherButton of buttons) {
                otherButton.disabled = otherButton == userButton;
            }
            
            await showPlayerInfo(uuid);
        };
    }
};


export function enableAllButtons() {
    for (const button of buttons) {
        button.disabled = false;
    }
}


const usernameLabel = document.getElementById("playerUsername");
const uuidLabel = document.getElementById("playerUuid");
const levelLabel = document.getElementById("playerLevel");
const createTimeLabel = document.getElementById("playerCreateTime");
const createTimeHoverLabel = document.getElementById("playerCreateTimeHover");
const lastSeenLabel = document.getElementById("playerLastSeen");
const lastSeenHoverLabel = document.getElementById("playerLastSeenHover");
const currentWinstreakLabel = document.getElementById("playerCurrentWinstreak");
const highestWinstreakLabel = document.getElementById("playerHighestWinstreak");
const gamesLabel = document.getElementById("playerGames");
const winsLabel = document.getElementById("playerWins");
const winrateLabel = document.getElementById("playerWinrate");
const deathsLabel = document.getElementById("playerDeaths");
const deathrateLabel = document.getElementById("playerDeathrate");

const awardsGrid = document.getElementById("awardsGrid");

const percent = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const developerUuids = [
    "00000000-0000-0000-0000-000000000001", // Winterpixel
    "fedba0ba-d288-41b6-9056-f0bca6ce9faf", // Typixel
    "4fe69bd2-4293-435d-bef1-c405688ee6d8", // TEKNO
];


export async function showPlayerInfo(uuid) {
    setUrlParameter("player", uuid);
    
    const queryPlayerProfile = await api.queryPlayerProfile(uuid);
    const getUser = await api.getUser(uuid);
    
    const user = {...queryPlayerProfile, ...getUser};
    
    usernameLabel.textContent = user["display_name"];
    uuidLabel.textContent = user["id"];
    levelLabel.textContent = user["level"];
    
    createTimeLabel.textContent = Helper.timeAgo(user["create_time"]);
    createTimeHoverLabel.textContent = `${user["create_time"].split("T")[0]} @ ${user["create_time"].split("T")[1].slice(0, -1)} UTC (YYYY/MM/DD)`;
    
    lastSeenLabel.textContent = Helper.timeAgo(user["update_time"]);
    lastSeenHoverLabel.textContent = `${user["update_time"].split("T")[0]} @ ${user["update_time"].split("T")[1].slice(0, -1)} UTC (YYYY/MM/DD)`;
    
    currentWinstreakLabel.textContent = user["stats"]["CurrentWinstreak"] ?? 0;
    highestWinstreakLabel.textContent = user["stats"]["Winstreak"] ?? 0;
    gamesLabel.textContent = user["stats"]["GamesPlayed"] ?? 0;
    winsLabel.textContent = user["stats"]["GamesWon"] ?? 0;
    
    const winrate = user["stats"]["GamesWon"] / user["stats"]["GamesPlayed"] ?? 0;
    winrateLabel.textContent = percent.format(winrate);
    
    if (winrate >= 0.5) {
        winrateLabel.style.color = "#00ff66";
    } else if (winrate >= 0.3) {
        winrateLabel.style.color = "#55ff00";
    } else if (winrate >= 0.25) {
        winrateLabel.style.color = "#a6ff00";
    } else {
        winrateLabel.style.color = "#ffe600";
    }
    
    deathsLabel.textContent = user["stats"]["Deaths"] ?? 0;
    
    const deathrate = user["stats"]["Deaths"] / user["stats"]["GamesPlayed"] ?? 0;
    deathrateLabel.textContent = `${decimal.format(deathrate)} / Game`;
    
    awardsGrid.replaceChildren([]);
    
    if (developerUuids.includes(user["id"])) {
        addAward("dev", {"count": 1});
    }
    
    for (const awardName in user["awards"]) {
        addAward(awardName, user["awards"][awardName]);
    }
}


function addAward(awardName, awardData) {
    const award = document.createElement("div");
    award.className = "award";
    
    const awardImage = document.createElement("img");
    awardImage.src = `awards/${awardName}.png`;
    award.append(awardImage);
    
    const awardText = document.createElement("span");
    awardText.textContent = `x${awardData["count"]}`;
    award.appendChild(awardText);
    
    awardsGrid.appendChild(award);
}


const urlSearchParams = new URLSearchParams(window.location.search);
if (urlSearchParams.has("player")) {
    const uuid = urlSearchParams.get("player");
    
    if (Helper.isValidUuid(uuid)) {
        await showPlayerInfo(uuid);
    }
}