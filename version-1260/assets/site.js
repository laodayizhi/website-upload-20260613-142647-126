(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".mobile-menu-button");
        var mobileMenu = document.querySelector(".mobile-menu");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                var isOpen = mobileMenu.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startHero() {
            if (slides.length <= 1) {
                return;
            }
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(parseInt(dot.getAttribute("data-hero-dot"), 10));
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startHero();
            });
        }

        startHero();

        var filterInput = document.querySelector("[data-filter-input]");
        var filterList = document.querySelector("[data-filter-list]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function getUrlQuery() {
            var params = new URLSearchParams(window.location.search);
            return params.get("q") || "";
        }

        if (filterInput && getUrlQuery()) {
            filterInput.value = getUrlQuery();
        }

        function filterCards() {
            if (!filterList) {
                return;
            }
            var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var typeValue = "";
            var yearValue = "";
            selects.forEach(function (select) {
                if (select.getAttribute("data-filter-select") === "type") {
                    typeValue = select.value;
                }
                if (select.getAttribute("data-filter-select") === "year") {
                    yearValue = select.value;
                }
            });
            var cards = Array.prototype.slice.call(filterList.querySelectorAll("[data-filter-card]"));
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var typeMatch = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
                var yearMatch = !yearValue || card.getAttribute("data-year") === yearValue;
                var queryMatch = !query || haystack.indexOf(query) !== -1;
                var keep = typeMatch && yearMatch && queryMatch;
                card.classList.toggle("hidden-card", !keep);
                if (keep) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        if (filterInput) {
            filterInput.addEventListener("input", filterCards);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", filterCards);
        });

        filterCards();

        var shareButton = document.querySelector("[data-share-button]");
        if (shareButton) {
            shareButton.addEventListener("click", function () {
                var url = window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url);
                }
                shareButton.textContent = "已复制";
                setTimeout(function () {
                    shareButton.textContent = "分享";
                }, 1600);
            });
        }
    });
}());
