export function createLeaderboardUser(username, rank, score, country = "none", leaderboardType = "global") {
    let rankImageSrc;
    
    if (rank <= 1) {
        rankImageSrc = `awards/season${leaderboardType}rank1.png`;
    } else if (rank <= 10) {
        rankImageSrc = `awards/season${leaderboardType}rank10.png`;
    } else if (rank <= 50) {
        rankImageSrc = `awards/season${leaderboardType}rank50.png`;
    } else if (rank <= 100) {
        rankImageSrc = `awards/season${leaderboardType}rank100.png`;
    } else if (rank <= 1000) {
        rankImageSrc = `awards/season${leaderboardType}rank1000.png`;
    } else if (rank <= 5000) {
        rankImageSrc = `awards/season${leaderboardType}rank5000.png`;
    }
    
    const button = document.createElement("button");
    button.className = "superLongWidth player";
    
    const flag = country != "none" ? `<img class="smallSize" src="https://flagsapi.com/${country.toUpperCase()}/flat/64.png">` : ""
    
    button.innerHTML = `
        <div class="horizontal textLeft">
            <span>${rank}</span>
            ${flag}
        </div>
        <span class="smallFont">${username}</span>
        <div class="horizontal textRight">
            <span>${score}</span>
            <img class="smallSize" src="${rankImageSrc}">
        </div>
    `;
    
    return button;
}


export function createUser(username) {
    const button = document.createElement("button");
    button.className = "player";
    
    const name = document.createElement("span");
    name.textContent = username;
    button.appendChild(name);
    
    return button;
}