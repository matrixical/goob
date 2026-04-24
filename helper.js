export class Helper {
    static countryToFlagEmoji(code) {
        code = code.toUpperCase();
        
        const offset = 127397;
        return [...code].map(function(character) {
            return String.fromCodePoint(character.charCodeAt() + offset);
        }).join("");
    }
    
    
    static isValidUuid(uuid) {
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
    
    
    static timeAgo(isoDate) {
        const seconds = Math.floor((Date.now() - new Date(isoDate)) / 1000);
        if (seconds < 60) {
            return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
        }
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
        }
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
        }
        
        const days = Math.floor(hours / 24);
        
        if (days < 7) {
            return days === 1 ? "1 day ago" : `${days} days ago`;
        }
        
        if (days < 30) {
            const weeks = Math.floor(days / 7);
            return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
        }
        
        if (days < 365) {
            const months = Math.floor(days / 30);
            return months === 1 ? "1 month ago" : `${months} months ago`;
        }
        
        const years = Math.floor(days / 365);
        return years === 1 ? "1 year ago" : `${years} years ago`;
    }
}