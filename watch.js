function setStorage(name, value) {
  temp = {};
  temp[name] = value;
  chrome.storage.local.set(temp, function() {
    if (chrome.runtime.error) {
      alert("Runtime error.");
    }
  });
}

var video = document.getElementsByTagName("video")[0];
var source = document.createElement('source');
let params = new URLSearchParams(document.location.search.substring(1));
var srcURL = params.get("url");
var refURL = params.get("ref");
var saveTime = true;
source.setAttribute('src', srcURL);
source.setAttribute('type', 'application/x-mpegURL');
video.appendChild(source);

videojs('my-video', {
  html5: {
    hls: {
      overrideNative: false
    },
    nativeAudioTracks: true,
    nativeVideoTracks: true,
    nativeTextTracks: true
  }
}).ready(function() {
  this.hotkeys({
    volumeStep: 0.1,
    seekStep: 5,
    enableModifiersForNumbers: false,
    enableNumbers: true
  });
  this.play();
  let connectedSpan = document.createElement('span');
  connectedSpan.setAttribute('id', "connected");
  if (!navigator.onLine) {
    connectedSpan.classList.add("offline");
  }
  document.getElementById("my-video").appendChild(connectedSpan);
  this.on('ended', function() {
    saveTime = false;
    chrome.storage.local.remove([refURL], function() {
      window.close();
    });
  });
});

chrome.storage.local.get(refURL, function(data) {
  if(data[refURL] >= 5) {
    videojs('my-video').currentTime(data[refURL] - 5);
  }
});


window.addEventListener("beforeunload", function(e) {
  if(saveTime) {
    setStorage(refURL, videojs('my-video').currentTime());
  }
});
// window.addEventListener("online", function(e) {
//   document.getElementById("connected").classList.remove("offline");
// });
// window.addEventListener("offline", function(e) {
//   document.getElementById("connected").classList.add("offline");
// });

function checkConnection() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == this.DONE) {
      if(this.status != 200) {
        document.getElementById("connected").classList.add("offline");
      } else {
        document.getElementById("connected").classList.remove("offline");
      }
    }
  };
  xhttp.timeout = 1000;
  xhttp.onerror = function() {offline=true;};
  xhttp.ontimeout = function() {offline=true;};
  xhttp.open("HEAD", srcURL + "?a=" + Date.now()); // https://code.jquery.com/jquery-3.4.1.slim.min.js?a= Date.now()
  xhttp.send();
}
setInterval(function() {
  checkConnection();
}, 1500);

(function() {
    var mouseTimer = null, cursorVisible = true;

    function disappearCursor() {
        mouseTimer = null;
        document.body.style.cursor = "none";
        cursorVisible = false;
    }

    document.onmousemove = function() {
        if (mouseTimer) {
            window.clearTimeout(mouseTimer);
        }
        if (!cursorVisible) {
            document.body.style.cursor = "initial";
            cursorVisible = true;
        }
        mouseTimer = window.setTimeout(disappearCursor, 1000);
    };
})();
