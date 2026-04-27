import { api } from "./api.js";
import { createLeaderboardUser } from "./users.js";


const discordButton = document.getElementById("kaizoDiscordButton");
discordButton.onclick = function(event) {
    window.open("https://discord.gg/4t9SuMK8Vq");
}

const listButton = document.getElementById("kaizoListButton");
listButton.onclick = function(event) {
    window.open("https://docs.google.com/spreadsheets/d/1mDofZ4qCGyqpzyUf3IdTaaM6_fTXJ-ojbMxXIy6CBbg");
}


const results = document.getElementById("kaizoResults");


async function getList() {
    results.replaceChildren([]);
    
    const list = await api.getKaizoList();
    
    for (const level of list) {
        const button = document.createElement("button");
        button.className = "level";
        
        button.innerHTML = `
            <div class="horizontal textLeft">
                <span>${level["rank"]}</span>
            </div>
            <div class="vertical textRight">
                <span>${level["name"]}</span>
                <span>${level["creator"]}</span>
            </div>
        `;
        results.appendChild(button);
        
        button.onclick = async function(event) {
            if (level["link"]) {
                window.open(level["link"]);
                return
            }
            
            let uuid = null;
            const levelSearch = await api.queryLevelsSearch(level["name"]);
            for (const levelSearchResult of levelSearch) {
                if (levelSearchResult["author_name"].trim().toLowerCase() == level["creator"].trim().toLowerCase()) {
                    uuid = levelSearchResult["id"];
                    break;
                }
            }
            
            window.open(`https://gooberdash.winterpixel.io/?play=${uuid}`);
        }
    }
};


const kaizosLoading = document.getElementById("kaizosLoading");
await getList();
kaizosLoading.remove();