// Leaflet.js CDN - Load mapping library
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCss);
    const leafletJs = document.createElement('script');
    leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(leafletJs);

    document.addEventListener('DOMContentLoaded', () => {
        // ======================================================================
        // SECURE CONFIGURATION & DATA
        // ======================================================================
        const appToken = window._AppConfig ? window._AppConfig.init() : null;
        const PASSWORD = window._AppConfig ? window._AppConfig.getAuth(appToken) : 'default';
        const BIRTH_DATE = window._AppConfig ? window._AppConfig.getBirthData(appToken) : new Date();
        const ESTIMATED_DEATH_AGE = window._AppConfig ? window._AppConfig.getLifespan() : 79.7;

        // Penguin ASCII Art
        const penguinFrame1 = '   .--.\n  |o_o |\n  |:_/ |\n //   \\ \\\n(|     | )\n/\'\\_   _/`\\\n\\___)=(___/';
        const penguinFrame2 = '   .--.\n  |o_- |\n  |:_/ |\n //   \\ \\\n(|     | )\n/\'\\_   _/`\\\n\\___)=(___/';

        // ======================================================================
        // CONTINENT MAPPING
        // ======================================================================
        const CONTINENT_MAP = {
            // Europe
            albania:'europe', andorra:'europe', armenia:'europe', austria:'europe', azerbaijan:'europe',
            belarus:'europe', belgium:'europe', 'bosnia and herzegovina':'europe', bulgaria:'europe',
            croatia:'europe', cyprus:'europe', 'czech republic':'europe', denmark:'europe', estonia:'europe',
            finland:'europe', france:'europe', georgia:'europe', germany:'europe', greece:'europe',
            hungary:'europe', iceland:'europe', ireland:'europe', italy:'europe', kosovo:'europe',
            latvia:'europe', liechtenstein:'europe', lithuania:'europe', luxembourg:'europe',
            malta:'europe', moldova:'europe', monaco:'europe', montenegro:'europe',
            netherlands:'europe', 'north macedonia':'europe', norway:'europe', poland:'europe',
            portugal:'europe', romania:'europe', russia:'europe', serbia:'europe', slovakia:'europe',
            slovenia:'europe', spain:'europe', sweden:'europe', switzerland:'europe',
            ukraine:'europe', 'united kingdom':'europe', 'vatican city':'europe',
            // Asia
            afghanistan:'asia', bahrain:'asia', bangladesh:'asia', bhutan:'asia', brunei:'asia',
            cambodia:'asia', china:'asia', india:'asia', indonesia:'asia', iran:'asia', iraq:'asia',
            israel:'asia', japan:'asia', jordan:'asia', kazakhstan:'asia', kuwait:'asia',
            kyrgyzstan:'asia', laos:'asia', lebanon:'asia', malaysia:'asia', maldives:'asia',
            mongolia:'asia', myanmar:'asia', nepal:'asia', 'north korea':'asia', oman:'asia',
            pakistan:'asia', palestine:'asia', philippines:'asia', qatar:'asia', 'saudi arabia':'asia',
            singapore:'asia', 'south korea':'asia', 'sri lanka':'asia', syria:'asia', taiwan:'asia',
            tajikistan:'asia', thailand:'asia', timor:'asia', turkey:'asia', turkmenistan:'asia',
            'united arab emirates':'asia', uzbekistan:'asia', vietnam:'asia', yemen:'asia',
            // Africa
            algeria:'africa', angola:'africa', benin:'africa', botswana:'africa',
            'burkina faso':'africa', burundi:'africa', cameroon:'africa', 'cape verde':'africa',
            'central african republic':'africa', chad:'africa', comoros:'africa',
            'democratic republic of the congo':'africa', djibouti:'africa', egypt:'africa',
            'equatorial guinea':'africa', eritrea:'africa', ethiopia:'africa', gabon:'africa',
            ghana:'africa', guinea:'africa', 'ivory coast':'africa', kenya:'africa', lesotho:'africa',
            liberia:'africa', libya:'africa', madagascar:'africa', malawi:'africa', mali:'africa',
            mauritania:'africa', mauritius:'africa', morocco:'africa', mozambique:'africa',
            namibia:'africa', niger:'africa', nigeria:'africa', rwanda:'africa',
            'sao tome and principe':'africa', senegal:'africa', seychelles:'africa',
            'sierra leone':'africa', somalia:'africa', 'south africa':'africa', 'south sudan':'africa',
            sudan:'africa', swaziland:'africa', tanzania:'africa', togo:'africa', tunisia:'africa',
            uganda:'africa', zambia:'africa', zimbabwe:'africa',
            // Americas
            'antigua and barbuda':'americas', argentina:'americas', bahamas:'americas',
            barbados:'americas', belize:'americas', bolivia:'americas', brazil:'americas',
            canada:'americas', chile:'americas', colombia:'americas', 'costa rica':'americas',
            cuba:'americas', dominica:'americas', 'dominican republic':'americas', ecuador:'americas',
            'el salvador':'americas', grenada:'americas', guatemala:'americas', guyana:'americas',
            haiti:'americas', honduras:'americas', jamaica:'americas', mexico:'americas',
            nicaragua:'americas', panama:'americas', paraguay:'americas', peru:'americas',
            'saint kitts and nevis':'americas', 'saint lucia':'americas',
            'saint vincent and the grenadines':'americas', suriname:'americas',
            'trinidad and tobago':'americas', 'united states':'americas', uruguay:'americas',
            venezuela:'americas',
            // Oceania
            australia:'oceania', fiji:'oceania', kiribati:'oceania', 'marshall islands':'oceania',
            micronesia:'oceania', nauru:'oceania', 'new zealand':'oceania', palau:'oceania',
            'papua new guinea':'oceania', samoa:'oceania', 'solomon islands':'oceania',
            tonga:'oceania', tuvalu:'oceania', vanuatu:'oceania',
        };

        const CONTINENT_TOTALS = { europe: 44, asia: 48, africa: 54, americas: 35, oceania: 14 };
        const CONTINENT_LABELS = { europe: 'Europe', asia: 'Asia', africa: 'Africa', americas: 'Americas', oceania: 'Oceania' };

        // ======================================================================
        // DOM ELEMENTS
        // ======================================================================
        const asciiArtElement = document.getElementById('ascii-art');
        const passwordContainer = document.getElementById('password-container');
        const mainContent = document.getElementById('main-content');
        const passwordInput = document.getElementById('password-input');
        const enterButton = document.getElementById('enter-button');
        const passwordError = document.getElementById('password-error');
        const themeToggle = document.getElementById('theme-checkbox');
        const darkToggle = document.getElementById('dark-checkbox');

        // ======================================================================
        // THEME LOGIC
        // ======================================================================
        const applyTheme = (theme) => {
            document.body.classList.remove('frutiger-aero-theme', 'dark-theme');
            themeToggle.checked = false;
            darkToggle.checked = false;
            document.querySelectorAll('.bubble').forEach(b => b.remove());
            if (theme === 'frutiger-aero') {
                document.body.classList.add('frutiger-aero-theme');
                themeToggle.checked = true;
            } else if (theme === 'dark') {
                document.body.classList.add('dark-theme');
                darkToggle.checked = true;
            }
        };

        const createAeroBubbles = () => {
            if (!document.body.classList.contains('frutiger-aero-theme')) return;
            for (let i = 0; i < 12; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.style.left = `${Math.random() * 100}vw`;
                bubble.style.width = bubble.style.height = `${30 + Math.random() * 60}px`;
                bubble.style.animationDelay = `${Math.random() * 8}s`;
                document.body.appendChild(bubble);
            }
        };

        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                localStorage.setItem('theme', 'frutiger-aero');
                applyTheme('frutiger-aero');
                createAeroBubbles();
            } else {
                localStorage.setItem('theme', 'archaic');
                applyTheme('archaic');
            }
        });

        darkToggle.addEventListener('change', () => {
            if (darkToggle.checked) {
                localStorage.setItem('theme', 'dark');
                applyTheme('dark');
            } else {
                localStorage.setItem('theme', 'archaic');
                applyTheme('archaic');
            }
        });

        const savedTheme = localStorage.getItem('theme') || 'archaic';
        applyTheme(savedTheme);
        if (savedTheme === 'frutiger-aero') createAeroBubbles();

        // ======================================================================
        // CORE FUNCTIONS
        // ======================================================================
        const animatePenguin = () => {
            asciiArtElement.textContent = (new Date().getMilliseconds() < 500 ? penguinFrame1 : penguinFrame2);
        };

        const checkPassword = () => {
            if (passwordInput.value === PASSWORD) {
                if (window._SecureData && window._SecureData.authenticate('authenticated_user_verified')) {
                    passwordContainer.classList.add('fade-out');
                    setTimeout(() => {
                        passwordContainer.style.display = 'none';
                        mainContent.classList.remove('hidden');
                        mainContent.classList.add('fade-in');
                        initializeDashboard();
                    }, 500);
                } else {
                    showAuthError();
                }
            } else {
                passwordError.classList.add('visible');
                passwordInput.classList.add('error');
                setTimeout(() => {
                    passwordError.classList.remove('visible');
                    passwordInput.classList.remove('error');
                }, 1000);
                passwordInput.value = '';
            }
        };

        const showAuthError = () => {
            passwordError.textContent = 'security error';
            passwordError.classList.add('visible');
            setTimeout(() => {
                passwordError.classList.remove('visible');
                passwordError.textContent = 'sorry mate';
            }, 2000);
        };

        const initializeDashboard = () => {
            typewriter('scottscottscott', 'main-title', 50);
            document.getElementById('boot-time').textContent = new Date().toLocaleString();
            loadLocalData();
            getGeolocation();
            updateLifeStats();
            setInterval(updateLifeStats, 1000);
            setTimeout(getAndShowUserLocation, 500);
            setupCollapsibles();
            setupAdminPanel();
        };

        // ======================================================================
        // DATA LOADING & RENDERING
        // ======================================================================
        let currentData = { countries: [], currentBooks: [], booksRead: [] };

        const loadLocalData = () => {
            if (!window._SecureData || !window._SecureData.isAuthenticated()) {
                renderData({ countries: [], currentBooks: [], booksRead: [] });
                return;
            }
            const secureData = window._SecureData.getData();
            if (secureData.error) {
                renderData({ countries: [], currentBooks: [], booksRead: [] });
                return;
            }
            currentData = secureData;
            renderData(currentData);
        };

        const renderData = (data) => {
            const countries = data.countries || [];
            const currentBooks = data.currentBooks || [];
            const booksRead = data.booksRead || [];

            // --- Countries count & progress ---
            const total = 197;
            const pct = ((countries.length / total) * 100).toFixed(1);
            document.getElementById('countries-count').textContent = countries.length;
            document.getElementById('countries-pct').textContent = pct + '%';
            document.getElementById('countries-bar-label').textContent =
                `${countries.length} / ${total} countries`;
            document.getElementById('countries-bar').style.width = pct + '%';

            // --- Countries tags ---
            const sorted = [...countries].sort();
            document.getElementById('countries-tags').innerHTML =
                sorted.map(c => `<span class="tag">${c}</span>`).join('');

            // --- Continent breakdown ---
            const continentCounts = { europe: 0, asia: 0, africa: 0, americas: 0, oceania: 0 };
            countries.forEach(c => {
                const cont = CONTINENT_MAP[c.toLowerCase()];
                if (cont && continentCounts[cont] !== undefined) continentCounts[cont]++;
            });
            const contList = document.getElementById('continent-list');
            contList.innerHTML = Object.entries(continentCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cont, count]) => {
                    const maxPoss = CONTINENT_TOTALS[cont] || 1;
                    const fillPct = Math.round((count / maxPoss) * 100);
                    return `<li>
                        <span class="cb-name">${CONTINENT_LABELS[cont]}</span>
                        <span class="cb-bar"><span class="cb-fill" style="width:${fillPct}%"></span></span>
                        <span class="cb-count">${count}/${maxPoss}</span>
                    </li>`;
                }).join('');

            // --- Books count ---
            document.getElementById('books-read-count').textContent = booksRead.length;
            document.getElementById('books-reading-count').textContent = currentBooks.length;

            // --- Currently reading ---
            const curList = document.getElementById('current-books-list');
            if (currentBooks.length > 0) {
                curList.innerHTML = currentBooks
                    .map(b => `<div class="book-item book-current">📖 ${b}</div>`).join('');
            } else {
                curList.innerHTML = '<div class="book-item" style="color:var(--text-muted);">nothing at the moment</div>';
            }

            // --- Books read ---
            const readList = document.getElementById('books-read-list');
            if (booksRead.length > 0) {
                readList.innerHTML = booksRead
                    .map(b => `<div class="book-item book-read">✓ ${b}</div>`).join('');
            } else {
                readList.innerHTML = '<div class="book-item" style="color:var(--text-muted);">none logged yet</div>';
            }
        };

        // ======================================================================
        // COLLAPSIBLE SECTIONS
        // ======================================================================
        const setupCollapsibles = () => {
            [
                ['toggle-continents', 'continents-body'],
                ['toggle-countries', 'countries-body'],
                ['toggle-books-read', 'books-read-body'],
            ].forEach(([btnId, bodyId]) => {
                const btn = document.getElementById(btnId);
                const body = document.getElementById(bodyId);
                if (!btn || !body) return;
                btn.addEventListener('click', () => {
                    const isCollapsed = body.classList.contains('collapsed');
                    if (isCollapsed) {
                        body.classList.remove('collapsed');
                        btn.classList.remove('collapsed');
                    } else {
                        body.classList.add('collapsed');
                        btn.classList.add('collapsed');
                    }
                });
            });
        };

        // ======================================================================
        // ADMIN PANEL
        // ======================================================================
        let adminData = { countries: [], currentBooks: [], booksRead: [] };

        const setupAdminPanel = () => {
            const overlay = document.getElementById('admin-overlay');
            const adminBtn = document.getElementById('admin-btn');
            const closeBtn = document.getElementById('admin-close-btn');
            const saveBtn = document.getElementById('admin-save-btn');
            const notice = document.getElementById('admin-notice');

            if (!adminBtn) return;

            adminBtn.addEventListener('click', () => {
                if (!window._SecureData || !window._SecureData.isAuthenticated()) return;
                const data = window._SecureData.getData();
                adminData = {
                    countries: [...(data.countries || [])],
                    currentBooks: [...(data.currentBooks || [])],
                    booksRead: [...(data.booksRead || [])],
                };
                renderAdminPanel();
                overlay.classList.remove('hidden');
            });

            closeBtn.addEventListener('click', () => {
                overlay.classList.add('hidden');
                notice.textContent = '';
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.add('hidden');
                    notice.textContent = '';
                }
            });

            // Add country
            document.getElementById('admin-add-country-btn').addEventListener('click', () => {
                const input = document.getElementById('admin-new-country');
                const val = input.value.trim().toLowerCase();
                if (val && !adminData.countries.includes(val)) {
                    adminData.countries.push(val);
                    adminData.countries.sort();
                    renderAdminTags('admin-countries-list', adminData.countries, 'countries');
                }
                input.value = '';
                input.focus();
            });
            document.getElementById('admin-new-country').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') document.getElementById('admin-add-country-btn').click();
            });

            // Add current book
            document.getElementById('admin-add-current-book-btn').addEventListener('click', () => {
                const input = document.getElementById('admin-new-current-book');
                const val = input.value.trim();
                if (val && !adminData.currentBooks.includes(val)) {
                    adminData.currentBooks.push(val);
                    renderAdminTags('admin-current-books-list', adminData.currentBooks, 'currentBooks');
                }
                input.value = '';
                input.focus();
            });
            document.getElementById('admin-new-current-book').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') document.getElementById('admin-add-current-book-btn').click();
            });

            // Add read book
            document.getElementById('admin-add-read-book-btn').addEventListener('click', () => {
                const input = document.getElementById('admin-new-read-book');
                const val = input.value.trim();
                if (val && !adminData.booksRead.includes(val)) {
                    adminData.booksRead.push(val);
                    renderAdminTags('admin-read-books-list', adminData.booksRead, 'booksRead');
                }
                input.value = '';
                input.focus();
            });
            document.getElementById('admin-new-read-book').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') document.getElementById('admin-add-read-book-btn').click();
            });

            // Save
            saveBtn.addEventListener('click', () => {
                if (!window._SecureData) return;
                const result = window._SecureData.updateData({
                    countries: adminData.countries,
                    currentBooks: adminData.currentBooks,
                    booksRead: adminData.booksRead,
                });
                if (result && result.success) {
                    notice.className = 'admin-notice admin-success';
                    notice.textContent = '✓ saved';
                    currentData = { ...adminData };
                    renderData(currentData);
                    setTimeout(() => { notice.textContent = ''; }, 2000);
                } else {
                    notice.className = 'admin-notice admin-error';
                    notice.textContent = '✗ error: ' + ((result && result.error) || 'unknown');
                }
            });
        };

        const renderAdminPanel = () => {
            renderAdminTags('admin-countries-list', adminData.countries, 'countries');
            renderAdminTags('admin-current-books-list', adminData.currentBooks, 'currentBooks');
            renderAdminTags('admin-read-books-list', adminData.booksRead, 'booksRead');
        };

        const renderAdminTags = (containerId, items, category) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = items.map((item, idx) =>
                `<span class="admin-tag">
                    ${item}
                    <button class="remove-tag" data-cat="${category}" data-idx="${idx}" title="remove">×</button>
                </span>`
            ).join('');
            container.querySelectorAll('.remove-tag').forEach(btn => {
                btn.addEventListener('click', () => {
                    const cat = btn.dataset.cat;
                    const i = parseInt(btn.dataset.idx, 10);
                    adminData[cat].splice(i, 1);
                    renderAdminTags(containerId, adminData[cat], cat);
                });
            });
        };

        // ======================================================================
        // GEOLOCATION
        // ======================================================================
        const getGeolocation = () => {
            const geoDiv = document.getElementById('geolocation');
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    p => { geoDiv.textContent = `location: ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`.toLowerCase(); },
                    () => { geoDiv.textContent = 'location: permission denied.'; }
                );
            } else { geoDiv.textContent = 'location: not available.'; }
        };

        // ======================================================================
        // LIFE STATS
        // ======================================================================
        const updateLifeStats = () => {
            const now = new Date();
            const ageInMs = now.getTime() - BIRTH_DATE.getTime();
            const ageInYears = ageInMs / 31557600000;
            const percent = (ageInYears / ESTIMATED_DEATH_AGE) * 100;
            const percentLeft = 100 - percent;
            document.getElementById('current-age').textContent = ageInYears.toFixed(9);
            document.getElementById('current-age-int').textContent = Math.floor(ageInYears);
            document.getElementById('pct-left-big').textContent = percentLeft.toFixed(1) + '%';
            document.getElementById('death-age').textContent = ESTIMATED_DEATH_AGE.toString();
            document.getElementById('percent-done').textContent = `${percent.toFixed(6)}% done`;
            document.getElementById('percent-left').textContent = `${percentLeft.toFixed(6)}% left`;
            document.getElementById('current-time').textContent = `clock: ${now.toLocaleTimeString()}`;
            document.getElementById('life-bar-label').textContent =
                `${percent.toFixed(2)}% of estimated lifespan elapsed`;
            document.getElementById('life-bar').style.width = Math.min(percent, 100) + '%';
        };

        const typewriter = (text, id, speed) => {
            let i = 0;
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '';
            function type() { if (i < text.length) { el.innerHTML += text.charAt(i++); setTimeout(type, speed); } }
            type();
        };

        // ======================================================================
        // MAPPING & LOCATION FUNCTIONS
        // ======================================================================
        const worldTowns = [
             { name: 'Ushuaia', country: 'Argentina', lat: -54.8019, lng: -68.3030 },
             { name: 'Longyearbyen', country: 'Norway', lat: 78.2232, lng: 15.6469 },
             { name: 'Invercargill', country: 'New Zealand', lat: -46.4132, lng: 168.3538 }
        ];

        function haversine(lat1, lng1, lat2, lng2) {
            const toRad = deg => deg * Math.PI / 180;
            const R = 6371;
            const dLat = toRad(lat2 - lat1);
            const dLng = toRad(lng2 - lng1);
            const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        }

        function findFurthestTown(userLat, userLng) {
            let maxDist = 0, furthest = null;
            worldTowns.forEach(town => {
                const dist = haversine(userLat, userLng, town.lat, town.lng);
                if (dist > maxDist) { maxDist = dist; furthest = town; }
            });
            return { ...furthest, distance: maxDist };
        }

        function showMapWithUserAndFurthest(userLat, userLng) {
            const furthest = findFurthestTown(userLat, userLng);
            const map = L.map('map').setView([userLat, userLng], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            L.marker([userLat, userLng]).addTo(map).bindPopup('you are here').openPopup();
            L.marker([furthest.lat, furthest.lng]).addTo(map)
                .bindPopup(`${furthest.name}, ${furthest.country}<br>${furthest.distance.toFixed(0)} km away`);
            document.getElementById('furthest-town-info').textContent =
                `furthest town from you: ${furthest.name}, ${furthest.country} (${furthest.distance.toFixed(0)} km)`;
        }

        function getAndShowUserLocation() {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    p => {
                        if (window.L) { showMapWithUserAndFurthest(p.coords.latitude, p.coords.longitude); }
                        else { leafletJs.onload = () => showMapWithUserAndFurthest(p.coords.latitude, p.coords.longitude); }
                    },
                    () => { document.getElementById('furthest-town-info').textContent = 'location permission denied.'; }
                );
            } else { document.getElementById('furthest-town-info').textContent = 'geolocation not available.'; }
        }

        // ======================================================================
        // EVENT LISTENERS & INITIALIZATION
        // ======================================================================
        enterButton.addEventListener('click', checkPassword);
        passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkPassword(); });

        setInterval(animatePenguin, 750);
        animatePenguin();
    });
