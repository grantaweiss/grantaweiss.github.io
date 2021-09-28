applyWallpaper();
Directory.initialize();

async function applyWallpaper() {
    const searchTerms = (await retrieveObject("backgroundSearch")) || "nature,water";
    const backgroundType = await retrieveObject("backgroundType") || "fixed";
    
    let backgroundUrl = await buildWallpaperUrl(searchTerms, backgroundType);

    if(backgroundUrl) {
        console.log(backgroundUrl);
        document.querySelector("#container").style.background = `url("${backgroundUrl}")`;
    }
}

async function boardList_active(dir) {
    const files = await dir.getSortedFiles();

    const dirListEl = document.querySelector("#container .left");

    dirListEl.classList.remove("newDir", "loadDir");
    dirListEl.classList.add("showDir");

    for (const entry of files) {
        await dir.loadBoard(entry);
        await sleep(2); // TODO: remove me
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

function boardList_load() {
    const dirListEl = document.querySelector("#container .left");

    dirListEl.classList.remove("showDir", "newDir");
    dirListEl.classList.add("loadDir");
}

function boardList_new() {
    const dirListEl = document.querySelector("#container .left");

    dirListEl.classList.remove("showDir", "loadDir");
    dirListEl.classList.add("newDir");
}

function boardList_addEl(name, referenceId, pos = -2) {
    let boardSelEl = document.createElement("li");
    boardSelEl.addEventListener("click", boardSelected);
    boardSelEl.innerText = name;
    boardSelEl.dataset.boardRef = referenceId;

    document.querySelector("#boardList").insertChildAtIndex(boardSelEl, pos);
}

function boardSelected(evt) {
    const toRemove = document.querySelector("#boardList li.selected");
    if(toRemove) {
        toRemove.classList.remove("selected");
    }
    evt.target.classList.add("selected");
    Directory.activeDir.boardList[evt.target.dataset.boardRef].load();
}

document.querySelector("#columnAdd").addEventListener("click", (evt) => {
    const activeBoardEl = document.querySelector("#boardList li.selected");
    const activeBoard = Directory.activeDir.boardList[activeBoardEl.dataset.boardRef];
    activeBoard.addList();

});
document.querySelector("#loadDirButton").addEventListener("click", Directory.load);
document.querySelector("#newDirButton").addEventListener("click", Directory.new);
document.querySelector("#doBackground").addEventListener("click", backgroundEditor);


document.querySelectorAll("input[name='backgroundType']").forEach((input) => {
    input.addEventListener('change', updateBackgroundType);
});
async function updateBackgroundType(evt) {
    let backgroundType = "fixed";

    if(evt.target.value == "random") {
        backgroundType = document.querySelector("#backgroundSettings [name='backgroundRandType']:checked").value;
    }

    await storeObject(backgroundType, "backgroundType");
}

document.querySelector("#backgroundSettings button").addEventListener("click", async (evt) => {
    const searchTerms = document.querySelector("#backgroundSettings .backgroundSearchTerm").value || "nature,water";

    let backgroundType;
    if(document.querySelector("#backgroundSettings [name='backgroundType']:checked").value == "random") {
        backgroundType = document.querySelector("#backgroundSettings [name='backgroundRandType']:checked").value;
        backgroundUrl = await buildWallpaperUrl(searchTerms, backgroundType);
    } else {
        backgroundType = "fixed";
        backgroundUrl = await buildWallpaperUrl(searchTerms, "randEvery"); // get a truly random pic, but save it
    }

    let resp = await fetch(backgroundUrl, {method: 'HEAD'});

    // Load the image before changing background in css
    let img = new Image();
    img.onload = () => {
        img = undefined;
        document.querySelector("#container").style.background = `url("${resp.url}")`;
    }
    img.src = resp.url;

    await storeObject(searchTerms, "backgroundSearch");
    await storeObject(resp.url, "backgroundImage");
    await storeObject(backgroundType, "backgroundType");
});

document.getElementById('addBoardButton').addEventListener('click', (evt) => {
    Directory.addBoard(document.querySelector("#addBoardInput").value);
});
document.querySelector("#addBoardInput").addEventListener('keyup', (evt) => {
    if(evt.key == "Enter") {
        Directory.addBoard(evt.target.value);
    }
});


Element.prototype.insertChildAtIndex = function(child, index) {
    if (!index) index = 0

    const len = this.children.length + 1;
    index = ((index % len) + len) % len;

    if (index >= this.children.length) {
      this.appendChild(child)
    } else {
      this.insertBefore(child, this.children[index])
    }
  }

async function backgroundEditor() {
    document.querySelector("#backgroundSettings .backgroundSearchTerm").value = await retrieveObject("backgroundSearch") || "";

    document.querySelector("#settings").style.display = "block";
}

async function buildWallpaperUrl(searchTerms, backgroundType, _featured = false, resolution = "/1920x1080") {
    let featured = _featured ? "/featured" : "";

    switch (backgroundType) {
        case "fixed":
            return retrieveObject("backgroundImage");
        case "randEvery":
            return `https://source.unsplash.com${resolution}${featured}?${searchTerms}`;
        case "randDaily":
            return `https://source.unsplash.com${resolution}${featured}/daily?${searchTerms}`;
        case "randWeekly":
            return `https://source.unsplash.com${resolution}${featured}/weekly?${searchTerms}`;
        default:
            break;
    }
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
};