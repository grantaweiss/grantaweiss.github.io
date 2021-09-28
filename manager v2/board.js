class Board {
    constructor(entry) {
        this.file = entry.handler;
        this.fileName = entry.name;
        this.lastModified = entry.lastModified;
        this.name = entry.name.slice(0, entry.name.lastIndexOf(".")).fromCamelCase();
        this.listArr = [];
    }

    // Add a list to this board
    addList() {
        let data = {};
        data.title = "New List";
        const list = new List(data);
        this.listArr.push(list);
        document.querySelector("#container .main").insertChildAtIndex(list.element, -2);
    }

    async load() {
        const json = await getJsonFromFile(this.fileObj);
        if(json && json.lists) {
            json.lists.forEach(async item => {
                const listObj = await List.buildFromJson(item);
                this.listArr.push(listObj);
            });
        }
    }

    static async builder(entry) {
        const board = new Board(entry);
        board.fileObj = await board.file.getFile();
        const json = await getJsonFromFile(board.fileObj);

        board.created = Date.now();
        let pos = 0;
        if(json && json.created) {
            board.created = json.created;
            pos = -2;
        }

        await boardList_addEl(board.name, board.created, pos);

        return board;
    }

    static async load(entry) {
        if(!entry.handler) {
            alert("Cannot load a board from an invalid file");
            return;
        }
        return Board.builder(entry);
    }

    static async add(name, dir) {
        if(!name) {
            alert("Cannot add a board without a valid name");
            return;
        }
        
        let data = {};
        data.handler = await createFile(dir, name);
        data.name = name;
        const fileData = await data.handler.getFile();
        data.lastModified = fileData.lastModified;

        return Board.load(data);
    }
}

async function getJsonFromFile(fileObj) {
    const fileText = await fileObj.text();
    let fileJson;
    try {
        fileJson = JSON.parse(fileText);
    } catch (error) {
        
    }

    return fileJson;
}