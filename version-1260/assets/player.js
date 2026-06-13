import { H as Hls } from "./hls.js";

export function setupPlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var playButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-play]"));
    var muteButton = document.querySelector("[data-player-mute]");
    var fullscreenButton = document.querySelector("[data-player-fullscreen]");
    var hls = null;
    var loaded = false;

    if (!video || !streamUrl) {
        return;
    }

    function loadStream() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        loadStream();
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    function togglePlay() {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    }

    playButtons.forEach(function (button) {
        button.addEventListener("click", togglePlay);
    });

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("hidden");
        }
        playButtons.forEach(function (button) {
            if (!button.hasAttribute("data-player-overlay")) {
                button.textContent = "暂停";
            }
        });
    });
    video.addEventListener("pause", function () {
        if (overlay) {
            overlay.classList.remove("hidden");
        }
        playButtons.forEach(function (button) {
            if (!button.hasAttribute("data-player-overlay")) {
                button.textContent = "播放";
            }
        });
    });

    if (muteButton) {
        muteButton.addEventListener("click", function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (video.requestFullscreen) {
                video.requestFullscreen();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
