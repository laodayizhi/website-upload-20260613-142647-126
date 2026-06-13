(function () {
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
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    start();
  }

  function normalized(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function cardText(card) {
    return normalized([
      card.getAttribute("data-title"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year")
    ].join(" "));
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var region = scope.querySelector("[data-region-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var reset = scope.querySelector("[data-filter-reset]");
      var list = scope.querySelector("[data-movie-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);

      function apply() {
        var keyword = normalized(input ? input.value : "");
        var regionValue = normalized(region ? region.value : "");
        var typeValue = normalized(type ? type.value : "");
        cards.forEach(function (card) {
          var text = cardText(card);
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedRegion = !regionValue || normalized(card.getAttribute("data-region")) === regionValue;
          var matchedType = !typeValue || normalized(card.getAttribute("data-type")) === typeValue;
          card.hidden = !(matchedKeyword && matchedRegion && matchedType);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (region) {
        region.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
        apply();
      }
    });
  }

  function setupHeroSearch() {
    var form = document.querySelector("[data-hero-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupHeroSearch();
    setupFilters();
  });
})();
