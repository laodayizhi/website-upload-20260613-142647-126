function initializeMoviePlayer(playerId, source) {
    var shell = document.getElementById(playerId);
    if (!shell) {
        return;
    }

    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-start");
    var hasLoaded = false;
    var hlsInstance = null;

    function attachSource() {
        if (!video || hasLoaded) {
            return;
        }
        hasLoaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        attachSource();
        if (button) {
            button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }
    }

    if (button) {
        button.addEventListener("click", startPlayback);
    }

    if (video) {
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        video.addEventListener("error", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
