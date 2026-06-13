(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-slide-dot]"));
    var prev = hero.querySelector("[data-slide-prev]");
    var next = hero.querySelector("[data-slide-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-box]"));
    inputs.forEach(function (input) {
      var scope = input.closest("[data-search-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-card-title") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-filtered", Boolean(keyword) && text.indexOf(keyword) === -1);
        });
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var cover = document.querySelector("[data-player-cover]");
    var stage = document.querySelector("[data-player-stage]");
    var loaded = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }

    if (stage) {
      stage.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        play();
      });
    }

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (cover && video.currentTime === 0) {
        cover.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
}());
