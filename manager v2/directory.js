class Directory {
    static activeDir = undefined;

    constructor(dirHandle) {
        Directory.activeDir = this;
        this.handle = dirHandle;
        this.boardList = {};
        this.testHandle();
    }

    async testHandle() {
        console.log("%ctestHandle()", "font-weight:bold;", "checking initial condition of directory");
        await this.checkWritePermission();
    }

    async checkWritePermission() {
        if(await this.hasWritePermission()) {
            console.log("%ccheckWritePermission()", "font-weight:bold;", "has write permission");
            await boardList_active(this);
        } else {
            console.log("%ccheckWritePermission()", "font-weight:bold;" , "does not have write permission");
            await boardList_load();
        }
    }

    async getWritePermission() {
        if(!(await this.hasWritePermission())) {
            if((await this.handle.requestPermission({mode: 'readwrite'})) === 'granted') {
                await boardList_active(this);
            } else {
                console.error("Unhandled else condition");
            }
        } else {
            console.error("Called to get write permission - already had it");
        }
    }

    // Query the directory handle for write permission
    async hasWritePermission() {
        return this.handle && (await this.handle.queryPermission({mode: 'readwrite'}) === 'granted');
    }

    async getSortedFiles() {
        if(!(await this.hasWritePermission())) {
            console.error("Unable to open directory");
            return;
        }

        let fileList = [];

        for await (const entry of this.handle.values()) {
            if(entry.kind == "file" && entry.name[0] != ".") {
                const fileData = await entry.getFile();
                fileList.push({name: entry.name, handler: entry, lastModified: fileData.lastModified});
            }
        }
        
        fileList.sort((a, b) => b.lastModified - a.lastModified);

        return fileList;
    }

    // Add a board to this directory
    async loadBoard(entry) {
        // console.log("Loading board " + entry.name);

        const newBoard = await Board.load(entry);
        // console.log(newBoard);

        this.boardList[newBoard.created] = newBoard;
    }

    static async addBoard(_name) {
        const dir = Directory.activeDir;
        const name = _name.toCamelCase() + ".json";

        if(!dir || !dir.hasWritePermission()) {
            alert("Cannot add a board without an active directory");
            return;
        }

        console.log("Adding board " + name);

        const newBoard = await Board.add(name, dir.handle);

        dir.boardList[newBoard.created] = newBoard;
    }

    static async initialize() {
        console.log("%cDirectory:initialize()", "font-weight:bold;", "Checking directory state");

        if(!Directory.activeDir) {
            console.log("%cDirectory:initialize()", "font-weight:bold;", "There is no active directory right now");

            const dirHandle = await retrieveObject("dirHandle");

            if(dirHandle) {
                console.log("%cDirectory:initialize()", "font-weight:bold;", "There is an available directory, constructing it");
                new Directory(dirHandle);
            } else {
                boardList_new();
            }
        }
    }

    static async new() {
        if(await getDirectory()) {
            await Directory.initialize();
        }
    }

    static async load(evt) {
        if(Directory.activeDir) {
            Directory.activeDir.getWritePermission();
        }
    }
}