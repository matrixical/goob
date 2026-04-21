import { api } from "./api.js";
import { NoRecordsFoundError } from "./errors.js";
import { enableAllButtons, showPlayerInfo } from "./players.js";


const countries = ["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ER", "ES", "ET", "EU", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"]

const sceneRow = document.getElementById("sceneRow");
const results = document.getElementById("results");


const type = document.getElementById("type");
for (const country of countries) {
    const option = document.createElement("option");
    option.value = `country.${country}`;
    option.text = `${api.countryToFlagEmoji(country)} ${country}`;
    type.appendChild(option);
}

const search = document.getElementById("searchSeason");

const crownsLoading = document.getElementById("crownsLoading");

const currentSeason = await api.getCurrentSeason();
const season = document.getElementById("season");
season.max = currentSeason;
season.value = currentSeason;

const limit = document.getElementById("limit");

const crownLabel = document.getElementById("crownLabel");
const limitLabel = document.getElementById("limitLabel");

type.hidden = false;
search.hidden = false;
season.hidden = false;
limit.hidden = false;
crownLabel.hidden = false;
limitLabel.hidden = false;
crownsLoading.remove();


search.onclick = async function(event) {
    results.replaceChildren([]);
    
    const loading = document.createElement("div");
    loading.className = "loading";
    results.appendChild(loading);
    
    let leaderboard = null;
    try {
        leaderboard = await api.getLeaderboard(type.value, season.value, limit.value);
    } catch (error) {
        if (error instanceof NoRecordsFoundError) {
            loading.remove();
            const label = document.createElement("span");
            label.textContent = "No records found!";
            results.appendChild(label);
            return;
        }
    }
    
    for (const user of Object.values(leaderboard)) {
        const button = document.createElement("button");
        button.className = "long user";
        
        const left = document.createElement("div");
        left.className = "left";
        
        const flag = document.createElement("img");
        // flag.src = `countryflags/${JSON.parse(user["metadata"])["country"]}.png`;
        flag.src = `https://flagsapi.com/${JSON.parse(user["metadata"])["country"]}/flat/64.png`;
        left.appendChild(flag);
        
        const rank = document.createElement("span");
        rank.textContent = user["rank"];
        left.appendChild(rank);
        
        const center = document.createElement("div");
        center.className = "center";
        
        const username = document.createElement("span");
        username.textContent = user["username"];
        center.appendChild(username);
        
        const right = document.createElement("div");
        right.className = "right";
        
        const crowns = document.createElement("span");
        crowns.textContent = user["score"];
        right.appendChild(crowns);
        
        const rankImage = document.createElement("img");
        
        const leaderboardType = type.value == "global" ? "global" : "local";
        
        if (user["rank"] <= 1) {
            rankImage.src = `awards/season${leaderboardType}rank1.png`;
        } else if (user["rank"] <= 10) {
            rankImage.src = `awards/season${leaderboardType}rank10.png`;
        } else if (user["rank"] <= 50) {
            rankImage.src = `awards/season${leaderboardType}rank50.png`;
        } else if (user["rank"] <= 100) {
            rankImage.src = `awards/season${leaderboardType}rank100.png`;
        } else if (user["rank"] <= 1000) {
            rankImage.src = `awards/season${leaderboardType}rank1000.png`;
        } else if (user["rank"] <= 5000) {
            rankImage.src = `awards/season${leaderboardType}rank5000.png`;
        }
        
        right.appendChild(rankImage);
        
        button.appendChild(left);
        button.appendChild(center);
        button.appendChild(right);
        
        results.appendChild(button);
        
        button.onclick = async function(event) {
            button.disabled = true;
            enableAllButtons();
            await showPlayerInfo(user["owner_id"]);
            button.disabled = false;
            
            sceneRow.style.transform = "translateX(0vw)";
        }
    }
    
    loading.remove();
};