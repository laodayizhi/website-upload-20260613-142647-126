(function () {
    var state = {
        heroIndex: 0,
        heroTimer: null
    };

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.hidden = !nav.hidden;
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');

        function show(index) {
            if (!slides.length) {
                return;
            }
            state.heroIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === state.heroIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === state.heroIndex);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('active', thumbIndex === state.heroIndex);
            });
        }

        function restartTimer() {
            window.clearInterval(state.heroTimer);
            state.heroTimer = window.setInterval(function () {
                show(state.heroIndex + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(state.heroIndex + 1);
                restartTimer();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(state.heroIndex - 1);
                restartTimer();
            });
        }

        show(0);
        restartTimer();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function movieMatches(movie, query) {
        var text = [
            movie.title,
            movie.year,
            movie.type,
            movie.region,
            movie.category,
            movie.genre,
            movie.tags
        ].join(' ').toLowerCase();
        return text.indexOf(query) !== -1;
    }

    function renderSuggestion(container, items) {
        if (!container) {
            return;
        }
        if (!items.length) {
            container.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
            container.hidden = false;
            return;
        }
        container.innerHTML = items.slice(0, 8).map(function (movie) {
            return [
                '<a href="./' + movie.url + '">',
                '<strong>' + escapeHtml(movie.title) + '</strong>',
                '<span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</span>',
                '</a>'
            ].join('');
        }).join('');
        container.hidden = false;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupGlobalSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
        var data = window.MOVIE_SEARCH_DATA || [];
        forms.forEach(function (form) {
            var input = form.querySelector('input[type="search"]');
            var results = form.querySelector('[data-search-results]');
            if (!input) {
                return;
            }
            input.addEventListener('input', function () {
                var query = normalize(input.value);
                if (!query) {
                    if (results) {
                        results.hidden = true;
                        results.innerHTML = '';
                    }
                    return;
                }
                var matched = data.filter(function (movie) {
                    return movieMatches(movie, query);
                });
                renderSuggestion(results, matched);
            });
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input.value.trim();
                if (!query) {
                    return;
                }
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            });
        });
    }

    function setupSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page) {
            return;
        }
        var input = page.querySelector('[data-search-page-input]');
        var results = page.querySelector('[data-search-page-results]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var data = window.MOVIE_SEARCH_DATA || [];

        function render(query) {
            var normalized = normalize(query);
            var matched = normalized
                ? data.filter(function (movie) { return movieMatches(movie, normalized); })
                : data.slice(0, 60);
            if (!matched.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
                return;
            }
            results.innerHTML = matched.slice(0, 120).map(function (movie) {
                return [
                    '<a href="./' + movie.url + '">',
                    '<strong>' + escapeHtml(movie.title) + '</strong>',
                    '<span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type + ' · ' + movie.category) + '</span>',
                    '</a>'
                ].join('');
            }).join('');
        }

        if (input) {
            input.value = initialQuery;
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
        render(initialQuery);
    }

    function setupCardFilter() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
        panels.forEach(function (panel) {
            var root = panel.parentElement || document;
            var queryInput = panel.querySelector('[data-filter-query]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));

            function apply() {
                var query = normalize(queryInput ? queryInput.value : '');
                var type = typeSelect ? typeSelect.value : '';
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-region'),
                        card.textContent
                    ].join(' '));
                    var typeMatched = !type || card.getAttribute('data-type') === type;
                    var queryMatched = !query || text.indexOf(query) !== -1;
                    card.hidden = !(typeMatched && queryMatched);
                });
            }

            if (queryInput) {
                queryInput.addEventListener('input', apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', apply);
            }
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play-button]');
            var overlay = player.querySelector('[data-player-overlay]');
            var status = player.querySelector('[data-player-status]');
            var source = player.getAttribute('data-src');
            var initialized = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function startPlayback() {
                if (!video || !source) {
                    setStatus('当前影片暂未绑定可播放地址');
                    return;
                }
                if (!initialized) {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            maxBufferLength: 30,
                            enableWorker: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        video._hlsInstance = hls;
                        initialized = true;
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                        initialized = true;
                    } else {
                        video.src = source;
                        initialized = true;
                    }
                }
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                setStatus('正在加载播放源，请保持网络连接稳定');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                        setStatus('浏览器阻止自动播放，请再次点击播放按钮');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', startPlayback);
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupGlobalSearch();
        setupSearchPage();
        setupCardFilter();
        setupPlayers();
    });
})();
