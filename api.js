import {
    InvalidLoginError,
    NoLevelsFoundError,
    NoRecordsFoundError,
    InvalidUUIDError,
    RequestError,
} from "./errors.js"


class API {
    #httpsUrl;
    #websocketUrl;
    #token;
    #httpsHeaders;
    #websocket;
    #config;
    #cid;
    
    constructor() {
        this.#httpsUrl = "https://gooberdash-api.winterpixel.io";
        this.#websocketUrl = "wss://gooberdash-api.winterpixel.io";
        
        this.#token = "";
        this.#httpsHeaders = {};
        
        this.#websocket = null;
        
        this.#config = {};
        
        this.#cid = 1;
    }
    
    
    /**
     * @returns {Promise<void>}
     */
    async init() {
        let url = `${this.#httpsUrl}/v2/account/authenticate/custom?create=`;
        
        const tokenHeaders = {
            "authorization": "Basic OTAyaXViZGFmOWgyZTlocXBldzBmYjlhZWIzOTo=",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        };
        
        let uuid = localStorage.getItem("loginUuid");
        
        if (!uuid) {
            url += "true"
            uuid = crypto.randomUUID();
            localStorage.setItem("loginUuid", uuid);
        } else {
            url += "false"
        }
        
        const payload = {
            "id": uuid,
            "vars": {
                "client_version": "99",
                "platform": "HTML5",
            },
        };
        
        const response = await fetch(url, {
            "method": "POST",
            "headers": tokenHeaders,
            "body": JSON.stringify(payload),
        });
        
        if (!response.ok) {
            throw new InvalidLoginError("Invalid login details!");
        }
        
        const json = await response.json();
        this.#token = json.token;
        
        this.#httpsHeaders = {
            "Authorization": `Bearer ${this.#token}`,
            "Content-Type": "application/json",
        };
        
        this.#websocket = new WebSocket(`${this.#websocketUrl}/ws?lang=en&status=true&token=${this.#token}`);
        
        this.#websocket.onclose = function(event) {
            console.log(event.code);
        }
        
        this.#websocket.onopen = async (event) => {
            this.#config = await this.#getConfig();
        }
    }
    
    
    //region Requests
    /**
     * @param {Object} responseJson
     * @returns {boolean}
     */
    #isInvalidResponse(responseJson) {
        const httpsError = ("code" in responseJson) && ("message" in responseJson);
        const websocketError = "error" in responseJson;
        return httpsError || websocketError;
    }
    
    
    /**
     * @param {Object} payload
     * @returns {Promise<Object>}
     */
    async #websocketSend(payload) {
        if (this.#websocket.readyState == WebSocket.CONNECTING) {
            await new Promise((resolve, reject) => {
                this.#websocket.addEventListener("open", resolve, {"once": true});
            });
        }
        
        return new Promise((resolve, reject) => {
            const expectedCid = this.#cid;
            this.#cid++;
            
            const handler = (event) => {
                try {
                    const responseJson = JSON.parse(event.data);
                    
                    if ("status_presence_event" in responseJson) {
                        return;
                    }
                    
                    if (parseInt(responseJson["cid"]) != expectedCid) {
                        return;
                    }
                    
                    const responsePayload = JSON.parse(responseJson["rpc"]["payload"]);
                    
                    this.#websocket.removeEventListener("message", handler);
                    resolve(responsePayload);
                } catch (error) {
                    this.#websocket.removeEventListener("message", handler);
                    reject(error);
                }
            };
            
            this.#websocket.addEventListener("message", handler);
            
            if ("payload" in payload) {
                payload["payload"] = JSON.stringify(payload["payload"]);
            }
            
            this.#websocket.send(JSON.stringify({"cid": expectedCid.toString(), "rpc": payload}));
        });
    }
    
    
    /**
     * @returns {Promise<Object>}
     */
    async #httpsSend(urlEnding, method, payload) {
        const url = `${this.#httpsUrl}${urlEnding}`;
        
        const parameters = {
            "method": method,
            "headers": this.#httpsHeaders,
        }
        
        if (payload) {
            parameters["body"] = JSON.stringify(JSON.stringify(payload));
        }
        
        const response = await fetch(url, parameters);
        
        if (!response.ok) {
            throw new RequestError("Error while sending HTTPS request!")
        }
        
        const json = await response.json();
        return json;
    }
    
    
    /**
     * @returns {Promise<Object>}
     */
    async #getConfig() {
        const response = await this.#websocketSend({"id": "player_fetch_data", "payload": {}});
        return response["data"];
    }
    //endregion
    
    
    //region User
    /**
     * `metadata` needs to be `JSON.parse()`ed
     * 
     * `metadata.country` returns the 2 letter country code
     * 
     * `stats.Winstreak` is the highest winstreak
     * 
     * `stats` may not have some keys if the player has not played a game/died/won/etc.
     * ```
     * {
     *     "awards": {
     *         "awardName": {
     *             "award": "awardName",
     *             "count": 1,
     *         }
     *     },
     *     "display_name": "displayName",
     *     "level": 1,
     *     "skin": {
     *         "hat": "hat_hatName",
     *         "suit": "suit_suitName",
     *         "body": "body_bodyName",
     *         "hand": "hand_handName",
     *         "color": "color_colorName",
     *     },
     *     "stats": {
     *         "CurrentWinstreak": 0,
     *         "Deaths": 0,
     *         "GamesPlayed": 0,
     *         "GamesWon": 0,
     *         "Winstreak": 0,
     *     },
     *     "id": "00000000-0000-0000-0000-000000000001",
     *     "username": "username",
     *     "lang_tag": "en",
     *     "metadata": {
     *         "country": "2 letter country code"
     *     },
     *     "create_time": "ISO 8601 Time",
     *     "update_time": "ISO 8601 Time",
     * }
     * ```
     * @param {string} uuid
     * @returns {Promise<Object>}
     */
    async queryPlayerProfile(uuid) {
        return await this.#websocketSend({
            "id": "query_player_profile",
            "payload": {"user_id": uuid},
        });
    }
    
    
    /**
     * ```
     * {
     *     "display_name": "displayName",
     *     "id": "00000000-0000-0000-0000-000000000001",
     *     "username": "username",
     *     "lang_tag": "en",
     *     "metadata": {},
     *     "create_time": "ISO 8601 Time",
     *     "update_time": "ISO 8601 Time",
     *     "steam_id": "If any",
     *     "apple_id": "If any"
     * }
     * ```
     * @returns {Promise<Object>}
     */
    async getUser(uuid) {
        const response = await this.#httpsSend(`/v2/user?ids=${uuid}`, "GET");
        
        if (this.#isInvalidResponse(response)) {
            throw new InvalidUUIDError("Invalid user UUID!");
        }
        
        const user = response["users"][0];
        user["metadata"] = JSON.parse(user["metadata"]);
        
        return user;
    }
    
    
    /**
     * @param {string} uuid 
     * @returns {boolean}
     */
    #isValidUuid(uuid) {
        if (uuid.length != 36) {
            return false;
        }
        
        if (!/^[a-zA-z0-9-]+$/.test(uuid)) {
            return false;
        }
        
        const parts = uuid.split("-");
        
        if (parts.length != 5) {
            return false;
        }
        
        const lengths = [8, 4, 4, 4, 12];
        
        for (let i = 0; i < lengths.length; i++) {
            if (parts[i].length != lengths[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    
    /**
     * Only works if the user has a published level.
     * 
     * If there are two users with the same name that both have a published level,
     * 
     * it will return both.
     * ```
     * ["uuid", "uuid", "uuid", etc.]
     * ```
     * @returns {Promise<Object>}
     */
    async usernameToUuids(username) {
        const users = {};
        
        if (this.#isValidUuid(username)) {
            const user = await api.getUser(username);
            users[username] = user["username"];
        } else {
            const levels = await api.queryLevelsSearch(username);
            
            for (const level of levels) {
                if ((level["author_name"] == username) && !(level["author_id"] in users)) {
                    users[level["author_id"]] = username;
                }
            }
        }
        
        return users;
    }
    
    
    /**
     * ```
     * {
     *     "awards": {
     *         "awardName": {
     *             "award": "awardName",
     *             "count": 1,
     *         }
     *     },
     *     "level": 1,
     *     "skin": {
     *         "hat": "hat_hatName",
     *         "suit": "suit_suitName",
     *         "body": "body_bodyName",
     *         "hand": "hand_handName",
     *         "color": "color_colorName",
     *     },
     *     "stats": {
     *         "CurrentWinstreak": 0,
     *         "Deaths": 0,
     *         "GamesPlayed": 0,
     *         "GamesWon": 0,
     *         "Winstreak": 0,
     *     },
     *     "lang_tag": "en",
     *     "display_name": "displayName",
     *     "id": "00000000-0000-0000-0000-000000000001",
     *     "username": "username",
     *     "lang_tag": "en",
     *     "metadata": {
     *         "country": "2 letter country code"
     *     },
     *     "create_time": "ISO 8601 Time",
     *     "update_time": "ISO 8601 Time",
     *     "steam_id": "If any",
     *     "apple_id": "If any"
     * }
     * ```
     * @returns {Promise<Object>}
     */
    async getFullUser(uuid) {
        const queryPlayerProfile = await api.queryPlayerProfile(uuid);
        const getUser = await api.getUser(uuid);
        
        const user = {...getUser, ...queryPlayerProfile};
        return user
    }
    //endregion
    
    
    //region Level
    /*
    If the comments refer to a "Level" in an Object, they are referring to this
    
    "theme" can be
    - "castle"
    - "city"
    - "dungeon"
    - "grassy"
    - "green"
    - "meadow"
    - "sandy"
    - "snow"
    
    These are not important and always static
    - "world"
    - "version"
    - "format_version"
    
    If querying level lists, "data" will be ""
    If downloading a level, "data" will be a stringified JSON of the level's data
    
    To calculate rating PERCENTAGE:
    25 * (rating - 1)
    
    "rating_count" is how many people rated the level
    
    "favorites_count" will only be there if using queryLevelsMostFavorited
    
    {
        "id": "00000000-0000-0000-0000-000000000001",
        "author_id": "00000000-0000-0000-0000-000000000001",
        "name": "levelName",
        "author_name": "authorName",
        "theme": "grassy",
        "world": 0,
        "published": "Private or Public or Curated",
        "player_count": 1,
        "game_mode": "Race or Knockout or Lobby",
        "data": "",
        "version": 0,
        "format_version": 2,
        "create_time": "ISO 8601 Time",
        "update_time": "ISO 8601 Time",
        "rating": 5,
        "rating_count": 1
        "favorites_count": 0
    }
    */
    
    
    /**
     * `Array` of `Level`s
     * @returns {Promise<Array>}
     */
    async queryLevelsTopRated() {
        const response = await this.#websocketSend({"id": "levels_query_top_rated", "payload": {}});
        return response["levels"];
    }
    
    
    /**
     * `Array` of `Level`s
     * 
     * `timeRange` can be
     * - `"all"`
     * - `"day"`
     * - `"week"`
     * - `"month"`
     * @param {string} timeRange
     * @returns {Promise<Array>}
     */
    async queryLevelsMostFavorited(timeRange) {
        const response = await this.#websocketSend({
            "id": "levels_query_most_favorited",
            "payload": {"time_range": timeRange},
        });
        return response["levels"];
    }
    
    
    /**
     * `Array` of `Level`s
     * @returns {Promise<Array>}
     */
    async queryLevelsNew() {
        const response = await this.#websocketSend({"id": "levels_query_new", "payload": {}});
        return response["levels"];
    }
    
    
    /**
     * `Array` of `Level`s
     * @returns {Promise<Array>}
     */
    async queryLevelsCurated() {
        const response = await this.#websocketSend({"id": "levels_query_curated", "payload": {}});
        return response["levels"];
    }
    
    
    /**
     * `Array` of `Level`s
     * @param {string} query
     * @returns {Promise<Array>}
     */
    async queryLevelsSearch(query) {
        try {
            const response = await this.#websocketSend({
                "id": "levels_search",
                "payload": {"query": query},
            });
            return response["levels"];
        } catch (error) {
            throw new NoLevelsFoundError("No levels found!");
        }
    }
    
    
    /**
     * `Level`
     * @param {string} uuid
     * @returns {Promise<Object>}
     */
    async downloadLevelData(uuid) {
        const response = await this.#httpsSend("/v2/rpc/levels_editor_get", "POST", {"id": uuid});
        
        if (this.#isInvalidResponse(response)) {
            throw new InvalidUUIDError("Invalid level UUID!");
        }
        
        return response["payload"];
    }
    
    
    /**
     * `metadata` needs to be `JSON.parse()`ed
     * 
     * but `username` does not
     * 
     * `metadata.country` returns the 2 letter country code
     * 
     *  These are not important and always static
     * - `"leaderboard_id"`
     * - `"score"`
     * - `"num_score"`
     * - `"max_num_score"`
     * 
     * `"leaderboard_id"` includes the UUID for the level
     * 
     * Will return an array of time trial records:
     * ```
     * {
     *     "leaderboard_id": "blacklist.timetrial.00000000-0000-0000-0000-000000000001",
     *     "owner_id": "00000000-0000-0000-0000-000000000001",
     *     "username": {"value": "usernameHere"},
     *     "metadata": {"country": "2 letter country code"},
     *     "create_time": {"seconds": "seconds since epoch (integer)"},
     *     "update_time": {"seconds": "seconds since epoch (integer)"},
     *     "rank": 1,
     *     "score": 0,
     *     "num_score": 0,
     *     "max_num_score": 1000000,
     * }
     * ```
     * @returns {Promise<Array>}
     */
    async queryTimeTrialLeaderboard(uuid, limit = 25) {
        try {
            const response = await this.#websocketSend({
                "id": "time_trial_query_leaderboard",
                "payload": {
                    "level_id": uuid,
                    "limit": limit,
                },
            });
            return response["records"];
        } catch (error) {
            throw new NoRecordsFoundError("Could not find time trial leaderboard!");
        }
    }
    //endregion
    
    
    //region Season
    /**
     * @returns {Promise<number>}
     */
    async getCurrentSeason() {
        while (Object.keys(this.#config).length == 0) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        const currentSeasonTemplate = this.#config["metadata"]["seasons"]["season_templates"][1];
        const elapsed = Math.floor(Date.now() / 1000) - currentSeasonTemplate["start_time"];
        
        return Math.floor(elapsed / currentSeasonTemplate["duration"]) + currentSeasonTemplate["start_number"];
    }
    
    
    /**
     * `metadata` needs to be `JSON.parse()`ed
     * 
     * `metadata.country` returns the 2 letter country code
     * 
     *  These are not important and always static
     * - `"num_score"`
     * - `"max_num_score"`
     * 
     * `limit` cannot go over 100
     * 
     * Will return an array of crown leaderboard records:
     * ```
     * {
     *     "leaderboard_id": "global.seasonNumber or country.countryCode.seasonNumber",
     *     "owner_id": "00000000-0000-0000-0000-000000000001",
     *     "username": "usernameHere",
     *     "metadata": {"country": "2 letter country code"},
     *     "create_time": {"seconds": "seconds since epoch (integer)"},
     *     "update_time": {"seconds": "seconds since epoch (integer)"},
     *     "rank": 1,
     *     "score": "Crown score (integer)",
     *     "num_score": 0,
     *     "max_num_score": 1000000,
     * }
     * ```
     * @returns {Promise<Array>}
     */
    async getLeaderboard(leaderboardType, season, limit = 100) {
        let response;
        
        try {
            response = await this.#httpsSend(`/v2/leaderboard/${leaderboardType}.${season}?limit=${limit}`, "GET");
        } catch (error) {
            if (error instanceof RequestError) {
                throw new NoRecordsFoundError("Could not find leaderboard!");
            }
        }
        
        if (this.#isInvalidResponse(response)) {
            throw new NoRecordsFoundError("Could not find leaderboard!");
        }
        
        return response["records"];
    }
    //endregion
    
    
    //region Helpers
    countryToFlagEmoji(code) {
        code = code.toUpperCase();
        
        const offset = 127397;
        return [...code].map(function(character) {
            return String.fromCodePoint(character.charCodeAt() + offset);
        }).join("");
    }
    
    
    isValidUuid(uuid) {
        if (uuid.length != 36) {
            return false;
        }
        
        if (!/^[a-zA-z0-9-]+$/.test(uuid)) {
            return false;
        }
        
        const parts = uuid.split("-");
        
        if (parts.length != 5) {
            return false;
        }
        
        const lengths = [8, 4, 4, 4, 12];
        
        for (let i = 0; i < lengths.length; i++) {
            if (parts[i].length != lengths[i]) {
                return false;
            }
        }
        
        return true;
    }
    //endregion
}


export const api = new API;
await api.init();