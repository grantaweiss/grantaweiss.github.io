document.getElementById('loadDirectory').addEventListener('click', async () => {
    const dirHandle = await initialize();
    
    await boardDirectoryUpdate(dirHandle);
});

document.getElementById('deleteDirectory').addEventListener('click', async () => {
    removeObject("dirHandle");
});

document.getElementById('addBoard').addEventListener('click', createNewBoard);

async function createNewBoard() {
    const activeDir = await getActiveDirectory();

    if(!activeDir) {
        alert("must be in directory first");
        return;
    }

    const newFileName = prompt("New Board Name?", "newBoard.json");

    if(!newFileName) {
        alert("Invalid file name");
        return;
    }

    const fileHandle = await createFile(activeDir, newFileName);
    await boardDirectoryUpdate(activeDir);
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
            boardSelEl.innerText = entry.name;
            addCustomContext(boardSelEl, "boardSel");
            parent.appendChild(boardSelEl);
        }
    }

    parent.appendChild(addNewBoardEl);
}