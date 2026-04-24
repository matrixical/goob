import { api } from "./api.js";
import { NoRecordsFoundError } from "./errors.js";
import { enableAllButtons, showPlayerInfo } from "./players.js";


const countries = ["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ER", "ES", "ET", "EU", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"]

const sceneRow = document.getElementById("sceneRow");
const results = document.getElementById("crownResults");


const type = document.getElementById("type");
for (const country of countries) {
    const option = document.createElement("option");
    option.value = `country.${country}`;
    option.text = `${api.countryToFlagEmoji(country)} ${country}`;
    type.appendChild(option);
}

const crownsLoading = document.getElementById("crownsLoading");
const limit = document.getElementById("limit");

const crownLabel = document.getElementById("crownLabel");
const currentSeason = await api.getCurrentSeason();
crownLabel.textContent = `Season ${currentSeason}`

const limitLabel = document.getElementById("limitLabel");

type.hidden = false;
limit.hidden = false;
crownLabel.hidden = false;
limitLabel.hidden = false;
crownsLoading.remove();


type.onchange = async function(event) {
    setUrlParameter("type", type.value);
    
    results.replaceChildren([]);
    
    const loading = document.createElement("div");
    loading.className = "loading";
    results.appendChild(loading);
    
    let leaderboard = null;
    try {
        leaderboard = await api.getLeaderboard(type.value, currentSeason, limit.value);
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
        let rankImageSrc;
        const leaderboardType = type.value == "global" ? "global" : "local";
        
        if (user["rank"] <= 1) {
            rankImageSrc = `awards/season${leaderboardType}rank1.png`;
        } else if (user["rank"] <= 10) {
            rankImageSrc = `awards/season${leaderboardType}rank10.png`;
        } else if (user["rank"] <= 50) {
            rankImageSrc = `awards/season${leaderboardType}rank50.png`;
        } else if (user["rank"] <= 100) {
            rankImageSrc = `awards/season${leaderboardType}rank100.png`;
        } else if (user["rank"] <= 1000) {
            rankImageSrc = `awards/season${leaderboardType}rank1000.png`;
        } else if (user["rank"] <= 5000) {
            rankImageSrc = `awards/season${leaderboardType}rank5000.png`;
        }
        
        const button = document.createElement("button");
        button.className = "superLongWidth player";
        
        button.innerHTML = `
            <div class="horizontal textLeft">
                <img class="smallSize" src="https://flagsapi.com/${JSON.parse(user["metadata"])["country"]}/flat/64.png">
                <span>${user["rank"]}</span>
            </div>
            <span class="smallFont">${user["username"]}</span>
            <div class="horizontal textRight">
                <span>${user["score"]}</span>
                <img class="smallSize" src="${rankImageSrc}">
            </div>
        `;
        
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


const urlSearchParams = new URLSearchParams(window.location.search);
if (urlSearchParams.has("type")) {
    const leaderboardType = urlSearchParams.get("type");
    type.value = leaderboardType;
    
    await type.onchange();
} else {
    await type.onchange();
    deleteUrlParameter("type");
}