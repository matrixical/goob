export class InvalidLoginError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidLoginError";
    }
}


export class NoLevelsFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NoLevelsFoundError";
    }
}


export class NoRecordsFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NoRecordsFoundError";
    }
}


export class InvalidUUIDError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidUUIDError";
    }
}


export class RequestError extends Error {
    constructor(message) {
        super(message);
        this.name = "RequestError";
    }
}