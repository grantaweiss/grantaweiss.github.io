class Board {
    constructor(entry) {
        this.file = entry.handler;
        this.fileName = entry.name;
        this.lastModified = entry.lastModified;
        this.name = entry.name.slice(0, entry.name.lastIndexOf(".")).fromCamelCase();
        this.constructMe();
    }

    async constructMe() {
        this.created = Date.now(); // TODO: remove me - get this from json

        boardList_addEl(this.name, this.created);
    }

    // Add a list to this board
    addList() {

    }

    static async new(entry) {
        const board = new Board(entry);
        return board;
    }
}

String.prototype.fromCamelCase = function() {
    const result = this.valueOf().replace(/([A-Z])/g, " $1").replace(/([0-9]+)/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
};