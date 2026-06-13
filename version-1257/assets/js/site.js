(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function showSlide(index) {
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
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    start();
                });
            });

            start();
        }

        var filterGrid = document.querySelector("[data-filter-grid]");
        if (filterGrid) {
            var cards = Array.prototype.slice.call(filterGrid.querySelectorAll("[data-filter-card]"));
            var searchInput = document.querySelector("[data-filter-search]");
            var regionSelect = document.querySelector("[data-filter-region]");
            var typeSelect = document.querySelector("[data-filter-type]");
            var yearSelect = document.querySelector("[data-filter-year]");
            var counter = document.querySelector("[data-filter-count]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (searchInput && query) {
                searchInput.value = query;
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilter() {
                var term = normalize(searchInput && searchInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var shown = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matched = true;

                    if (term && text.indexOf(term) === -1) {
                        matched = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")) !== region) {
                        matched = false;
                    }
                    if (type && normalize(card.getAttribute("data-type")) !== type) {
                        matched = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden-by-filter", !matched);
                    if (matched) {
                        shown += 1;
                    }
                });

                if (counter) {
                    counter.textContent = shown + " 部影片";
                }
            }

            [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });

            applyFilter();
        }
    });
})();
