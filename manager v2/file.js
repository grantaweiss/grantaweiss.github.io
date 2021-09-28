async function initialize_DEPRECATED() {
    const dirHandle = await retrieveObject("dirHandle")
        || await getDirectory();

    if(!dirHandle) {
        console.log("Unable to get directory");
        return;
    }

    if(!await verifyPermission(dirHandle, true)) {
        console.log("Unable to get permission");
        return;
    }

    return dirHandle;
}

async function getDirectory() {
    const dirHandle = await window.showDirectoryPicker();

    if(dirHandle) {
        await storeObject(dirHandle, "dirHandle");
    }

    return dirHandle;
}

async function hasPermission(fileHandle, withWrite) {
    const opts = {mode: withWrite ? "readwrite" : "read"}

    return (await fileHandle.queryPermission(opts) === 'granted');
}

async function verifyPermission(fileHandle, withWrite) {
    const opts = {mode: withWrite ? "readwrite" : "read"}

    return (await fileHandle.queryPermission(opts) === 'granted')
        || (await fileHandle.requestPermission(opts) === 'granted');
}

async function createFile_DEPRECATED(dirHandle) {
    const opts = {
        suggestedName: 'newBoard.json',
        types: [{
            description: 'Task Board File',
            accept: {'application/json': ['.json']},
        }],
        startIn: dirHandle
    };
    var fileHandle = showSaveFilePicker(opts);

    if(!fileHandle) {
        console.log("Trouble creating file");
        return;
    }

    return fileHandle;
}

async function createFile(dirHandle, name) {
    console.log(dirHandle, name);
    let fileHandle = await dirHandle.getFileHandle(name, {create: true});

    if(!fileHandle) {
        console.log(`Unable to create file "${name}" in directory "${dirHandle.name}"`)
    }
    return fileHandle;
}

async function getActiveDirectory() {
    const dirHandle = await retrieveObject("dirHandle");

    if(!dirHandle) {
        console.log("No directory saved");
        return;
    }

    if(!await hasPermission(dirHandle, true)) {
        console.log("Does not currently have permission");
        return;
    }

    return dirHandle;
}