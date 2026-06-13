(function () {
  function initializePlayer(videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !streamUrl) {
      return;
    }

    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function startPlayback() {
      hideOverlay();
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.initializePlayer = initializePlayer;
})();
