document.getElementById('loadDirectory').addEventListener('click', async () => {
    const dirHandle = await initialize();
    
    await boardDirectoryUpdate(dirHandle);
});

document.getElementById('deleteDirectory').addEventListener('click', async () => {
    await removeObject("dirHandle");
    await boardDirectoryUpdate();
});

document.getElementById('addBoardButton').addEventListener('click', createNewBoard);
document.getElementById("addBoardInput").addEventListener('keyup', (evt) => {
    if(evt.key == "Enter") {
        createNewBoard();
    }
});

document.getElementById('columnAdd').addEventListener('click', createColumn);

function boardSelected(evt) {
    const toRemove = document.querySelector("#boardList li.selected");
    if(toRemove) {
        toRemove.classList.remove("selected");
    }
    evt.target.classList.add("selected");
}

function createColumn() {
    let newColEl = document.createElement("div");
    newColEl.classList.add("column");
    let newColHeaderEl = document.createElement("div");
    newColHeaderEl.classList.add("column-header");
    let newColHeaderTextEl = document.createElement("div");
    newColHeaderTextEl.classList.add("col-head-text");
    newColHeaderTextEl.innerText = "New Column";

    document.querySelector("#columnAdd").insertAdjacentElement('beforebegin', newColEl);
    newColEl.appendChild(newColHeaderEl);
    newColHeaderEl.appendChild(newColHeaderTextEl);
}

async function createNewBoard() {
    const activeDir = await getActiveDirectory();

    if(!activeDir) {
        alert("must be in directory first");
        return;
    }

    const newBoardName = document.querySelector("#addBoardInput").value;

    // Todo - more sanitization
    if(newBoardName.length == 0) {
        alert("Invalid file name");
        return;
    }

    const newFileName = newBoardName.toCamelCase() + ".json";

    if(!newFileName) {
        alert("Invalid file name");
        return;
    }

    const fileHandle = await createFile(activeDir, newFileName);
    await boardDirectoryUpdate(activeDir);

    document.querySelector("#addBoardInput").value = "";
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function addCustomContext(elem, type) {
    if(type) {
        elem.dataset.contextType = type;
    }
    elem.addEventListener("contextmenu", customContextAction);
}

function customContextAction(event) {
    event.preventDefault();

    let menu = document.querySelector("#customContextMenu");

    let srcEl = event.srcElement;
    let leftPos, topPos;

    switch (srcEl.dataset.contextType) {
        case "boardSel":
            leftPos = (srcEl.offsetLeft + srcEl.offsetWidth);
            topPos = (srcEl.offsetTop);
            break;
    
        default:
            leftPos = (event.clientX - 10);
            topPos = (event.clientY - 10);
            break;
    }

    menu.style.left = leftPos + "px";
    menu.style.top = topPos + "px";
    menu.classList.add("visible");

    document.querySelector("#container").addEventListener("click", customContextRemove);

    // return false;
}

function customContextRemove(evt) {
    let menu = document.querySelector("#customContextMenu");
    menu.classList.remove("visible");

    evt.srcElement.removeEventListener("click", customContextRemove);
}

async function boardDirectoryUpdate(dirHandle) {
    const parent = document.querySelector("#boardList");
    const addNewBoardEl = parent.lastElementChild;
    removeAllChildNodes(parent);

    if(dirHandle) {
        let fileList = [];

        for await (const entry of dirHandle.values()) {
            if(entry.kind == "file") {
                const fileData = await entry.getFile();
                fileList.push({name: entry.name, handler: entry, lastModified: fileData.lastModified});
            }
        }

        fileList.sort((a, b) => b.lastModified - a.lastModified);

        for (const entry of fileList.values()) {
            let boardSelEl = document.createElement("li");
            boardSelEl.addEventListener("click", boardSelected);

            let sanitizeName = entry.name;
            sanitizeName = sanitizeName.slice(0, sanitizeName.lastIndexOf("."));
            sanitizeName = sanitizeName.fromCamelCase();

            boardSelEl.innerText = sanitizeName;
            addCustomContext(boardSelEl, "boardSel");
            parent.appendChild(boardSelEl);
        }
    }

    parent.appendChild(addNewBoardEl);
}

String.prototype.toCamelCase = function() {
    const regex = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;

    let wordArr = this.valueOf().match(regex) || [];

    let result = "";

    for(let i = 0 , len = wordArr.length; i < len; i++) {
        let currentStr = wordArr[i];

        let tempStr = currentStr.toLowerCase();

        if(i != 0) { 
            // convert first letter to upper case (the word is in lowercase) 
            tempStr = tempStr.substr(0, 1).toUpperCase() + tempStr.substr(1);
        }

        result +=tempStr;
    }

    return result;
}

String.prototype.fromCamelCase = function() {
    const result = this.valueOf().replace(/([A-Z])/g, " $1").replace(/([0-9]+)/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
}