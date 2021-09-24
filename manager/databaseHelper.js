async function storeObject(dirHandle, objName) {
    return new Promise((resolve, reject) => {
        let dbReq = indexedDB.open("database", 1);
        dbReq.onerror = reject;
        dbReq.onupgradeneeded = (event) => {
            let db = dbReq.result;
            db.onerror = reject;

            db.createObjectStore('objects');
        }
        dbReq.onsuccess = (event) => {
            let db = dbReq.result;

            let transObj = db.transaction(["objects"], "readwrite");
            transObj.oncomplete = console.log;
            transObj.onerror = reject;

            let objStore = transObj.objectStore("objects");
            
            let getReq = objStore.put(dirHandle, objName);
            getReq.onerror = reject;
            getReq.onsuccess = resolve;
        };
    });
};

async function retrieveObject(objName) {
    return new Promise((resolve, reject) => {
        let dbReq = indexedDB.open("database", 1);
        dbReq.onerror = reject;
        dbReq.onsuccess = (event) => {
            let db = dbReq.result;

            let transObj = db.transaction(["objects"], "readwrite");
            transObj.oncomplete = console.log;
            transObj.onerror = reject;

            let objStore = transObj.objectStore("objects");
            
            let getReq = objStore.get(objName);
            getReq.onerror = reject;
            getReq.onsuccess = () => {
                resolve(getReq.result);
            };
        };
    });
};

async function removeObject(objName) {
    return new Promise((resolve, reject) => {
        let dbReq = indexedDB.open("database", 1);
        dbReq.onerror = reject;
        dbReq.onsuccess = (event) => {
            let db = dbReq.result;

            let transObj = db.transaction(["objects"], "readwrite");
            transObj.oncomplete = console.log;
            transObj.onerror = reject;

            let objStore = transObj.objectStore("objects");
            
            let getReq = objStore.delete(objName);
            getReq.onerror = reject;
            getReq.onsuccess = () => {
                resolve(getReq.result);
            };
        };
    });
};