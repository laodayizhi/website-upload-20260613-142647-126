(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupImages() {
    document.querySelectorAll("img[data-cover]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    var search = document.querySelector("[data-search-input]");
    var year = document.querySelector("[data-year-filter]");
    var category = document.querySelector("[data-category-filter]");
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedCategory = category ? category.value : "";

      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardCategory = card.getAttribute("data-category") || "";
        var matched = true;

        if (query && title.indexOf(query) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedCategory && cardCategory !== selectedCategory) {
          matched = false;
        }
        card.hidden = !matched;
      });
    }

    [search, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("[data-video]");
      var button = player.querySelector("[data-play-button]");
      var source = player.getAttribute("data-source");
      var hlsInstance = null;
      var isReady = false;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (isReady) {
          return;
        }
        isReady = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        attachSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
