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

    await sleep(500); // TODO: remove me
    for (const entry of files) {
        await dir.addBoard(entry);
        await sleep(200); // TODO: remove me
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

function boardList_addEl(name, referenceId) {
    let boardSelEl = document.createElement("li");
    // boardSelEl.addEventListener("click", boardSelected);
    boardSelEl.innerText = name;
    boardSelEl.dataset.boardRef = referenceId;

    document.querySelector("#boardList").insertChildAtIndex(boardSelEl, -2);
}

document.querySelector("#loadDirButton").addEventListener("click", Directory.load);
document.querySelector("#newDirButton").addEventListener("click", Directory.new);
document.querySelector("#doBackground").addEventListener("click", backgroundEditor);
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

    document.querySelector("#container").style.background = `url("${resp.url}")`;

    await storeObject(searchTerms, "backgroundSearch");
    await storeObject(resp.url, "backgroundImage");
    await storeObject(backgroundType, "backgroundType");
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