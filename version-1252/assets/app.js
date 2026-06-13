(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var scope = form.parentElement && form.parentElement.parentElement ? form.parentElement.parentElement.querySelector("[data-filter-scope]") : null;
      if (!scope) {
        scope = document.querySelector("[data-filter-scope]");
      }
      if (!scope) {
        return;
      }
      var input = form.querySelector("[data-search-input]");
      var type = form.querySelector("[data-type-filter]");
      var year = form.querySelector("[data-year-filter]");
      var clear = form.querySelector("[data-clear-filter]");
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-title]"));

      function textOf(item) {
        return [
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-type"),
          item.getAttribute("data-year"),
          item.getAttribute("data-genre")
        ].join(" ").toLowerCase();
      }

      function update() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? Number(year.value) : 0;
        items.forEach(function (item) {
          var haystack = textOf(item);
          var itemType = item.getAttribute("data-type") || "";
          var itemYear = Number(item.getAttribute("data-year")) || 0;
          var matchText = !q || haystack.indexOf(q) !== -1;
          var matchType = !typeValue || itemType.indexOf(typeValue) !== -1 || haystack.indexOf(typeValue.toLowerCase()) !== -1;
          var matchYear = !yearValue || itemYear >= yearValue;
          item.classList.toggle("is-filter-hidden", !(matchText && matchType && matchYear));
        });
      }

      if (input) {
        input.addEventListener("input", update);
      }
      if (type) {
        type.addEventListener("change", update);
      }
      if (year) {
        year.addEventListener("change", update);
      }
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (type) {
            type.value = "";
          }
          if (year) {
            year.value = "";
          }
          update();
        });
      }
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("movieVideo");
      var overlay = document.getElementById("playerOverlay");
      var playToggle = document.getElementById("playToggle");
      var muteToggle = document.getElementById("muteToggle");
      var fullscreenToggle = document.getElementById("fullscreenToggle");
      var attached = false;
      var hls = null;

      if (!video || !streamUrl) {
        return;
      }

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else if (hls) {
              hls.destroy();
              hls = null;
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        }
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      function togglePlay() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (playToggle) {
        playToggle.addEventListener("click", togglePlay);
      }
      if (muteToggle) {
        muteToggle.addEventListener("click", function () {
          video.muted = !video.muted;
          muteToggle.textContent = video.muted ? "静音" : "音量";
        });
      }
      if (fullscreenToggle) {
        fullscreenToggle.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (video.requestFullscreen) {
            video.requestFullscreen();
          }
        });
      }
      video.addEventListener("play", function () {
        if (playToggle) {
          playToggle.textContent = "暂停";
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (playToggle) {
          playToggle.textContent = "▶";
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  };
})();
