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
        // Get configuration from secure config (obfuscated)
        const appToken = window._AppConfig ? window._AppConfig.init() : null;
        const PASSWORD = window._AppConfig ? window._AppConfig.getAuth(appToken) : 'default';
        const BIRTH_DATE = window._AppConfig ? window._AppConfig.getBirthData(appToken) : new Date();
        const ESTIMATED_DEATH_AGE = window._AppConfig ? window._AppConfig.getLifespan() : 79.7;
        
        // Sensitive data is now loaded securely after authentication
        // No hardcoded data here - data comes from secure module

        // Penguin ASCII Art
        const penguinFrame1 = '   .--.\n  |o_o |\n  |:_/ |\n //   \\ \\\n(|     | )\n/\'\\_   _/`\\\n\\___)=(___/';
        const penguinFrame2 = '   .--.\n  |o_- |\n  |:_/ |\n //   \\ \\\n(|     | )\n/\'\\_   _/`\\\n\\___)=(___/';

        // ======================================================================
        // DOM ELEMENTS
        // ======================================================================
        const asciiArtElement = document.getElementById('ascii-art');
        const passwordContainer = document.getElementById('password-container');
        const mainContent = document.getElementById('main-content');
        const passwordInput = document.getElementById('password-input');
        const enterButton = document.getElementById('enter-button');
        const passwordError = document.getElementById('password-error');
        const themeToggle = document.getElementById('theme-checkbox'); // <-- NEW
        const leafletCountrySource = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
        let countriesMapInstance = null;
        let countriesMapLayer = null;

        // ======================================================================
        // THEME TOGGLE LOGIC (NEW!) 🥝
        // ======================================================================
        const applyTheme = (theme) => {
            if (theme === 'frutiger-aero') {
                document.body.classList.add('frutiger-aero-theme');
                themeToggle.checked = true;
            } else {
                document.body.classList.remove('frutiger-aero-theme');
                themeToggle.checked = false;
            }
            initializeCommentBoard(theme);
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
                document.querySelectorAll('.bubble').forEach(b => b.remove());
            }
        });

        // On page load, check for saved theme
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
                // Authenticate with secure data module
                if (window._SecureData && window._SecureData.authenticate('authenticated_user_verified')) {
                    passwordContainer.classList.add('fade-out');
                    setTimeout(() => {
                        passwordContainer.style.display = 'none';
                        mainContent.classList.remove('hidden');
                        mainContent.classList.add('fade-in');
                        initializeDashboard();
                    }, 500);
                } else {
                    console.error('Security module authentication failed');
                    showAuthError();
                }
            } else {
                passwordError.classList.add('visible');
                passwordInput.classList.add('error');
                setTimeout(() => {
                    passwordError.classList.remove('visible');
                    passwordInput.classList.remove('error');
                }, 1000);
                passwordInput.value = "";
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
            typewriter("scottscottscott", 'main-title', 50);
            document.getElementById('boot-time').textContent = new Date().toLocaleString();
            loadLocalData();
            getGeolocation();
            updateLifeStats();
            setInterval(updateLifeStats, 1000);
            setTimeout(getAndShowUserLocation, 500); // Load map after slight delay
        };

        const loadLocalData = () => {
            // Get data from secure module only after authentication
            if (window._SecureData && window._SecureData.isAuthenticated()) {
                const secureData = window._SecureData.getData();
                
                if (secureData.error) {
                    document.getElementById('countries-count').textContent = '0';
                    document.getElementById('countries-summary').textContent = 'travel data not available.';
                    return;
                }
                
                const countries = secureData.countries || [];
                document.getElementById('countries-count').textContent = countries.length;
                renderCountriesMap(countries);
            } else {
                // Show placeholder data if not authenticated
                document.getElementById('countries-count').textContent = '0';
                document.getElementById('countries-summary').textContent = 'authentication required to load travel map.';
            }
        };

        const getGeolocation = () => {
            const geoDiv = document.getElementById('geolocation');
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    p => { geoDiv.textContent = `location: ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`.toLowerCase(); },
                    () => { geoDiv.textContent = "location: permission denied.".toLowerCase(); }
                );
            } else { geoDiv.textContent = "location: not available.".toLowerCase(); }
        };

        const updateLifeStats = () => {
            const now = new Date();
            const ageInMs = now.getTime() - BIRTH_DATE.getTime();
            const ageInYears = ageInMs / 31557600000;
            const percent = (ageInYears / ESTIMATED_DEATH_AGE) * 100;
            const percentLeft = 100 - percent;
            document.getElementById('current-age').textContent = ageInYears.toFixed(9).toLowerCase();
            document.getElementById('death-age').textContent = ESTIMATED_DEATH_AGE.toString().toLowerCase();
            document.getElementById('percent-done').textContent = `${percent.toFixed(2)}% done`.toLowerCase();
            document.getElementById('percent-left').textContent = `${percentLeft.toFixed(2)}% left`.toLowerCase();
            document.getElementById('current-time').textContent = `clock: ${now.toLocaleTimeString()}`.toLowerCase();
        };

        const typewriter = (text, id, speed) => {
            let i = 0;
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = "";
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
            L.marker([userLat, userLng]).addTo(map).bindPopup('you are here'.toLowerCase()).openPopup();
            L.marker([furthest.lat, furthest.lng]).addTo(map).bindPopup(`${furthest.name}, ${furthest.country}<br>${furthest.distance.toFixed(0)} km away`.toLowerCase());
            document.getElementById('furthest-town-info').textContent = `furthest town: ${furthest.name}, ${furthest.country} (${furthest.distance.toFixed(0)} km away)`.toLowerCase();
        }

        function getAndShowUserLocation() {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    p => {
                        if (window.L) { showMapWithUserAndFurthest(p.coords.latitude, p.coords.longitude); }
                        else { leafletJs.onload = () => showMapWithUserAndFurthest(p.coords.latitude, p.coords.longitude); }
                    },
                    () => { document.getElementById('furthest-town-info').textContent = 'location permission denied.'.toLowerCase(); }
                );
            } else { document.getElementById('furthest-town-info').textContent = 'geolocation not available.'.toLowerCase(); }
        }

        const normalizeCountryName = (name) => name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
        const countryNameAliases = {
            'united states': 'united states of america',
            'usa': 'united states of america',
            'united states of america': 'united states of america',
            'north macedonia': 'macedonia'
        };

        function getVisitedCountrySet(countries) {
            return new Set(countries.map(country => {
                const normalized = normalizeCountryName(country);
                return countryNameAliases[normalized] || normalized;
            }));
        }

        function applyCountryLayer(countries) {
            const visited = getVisitedCountrySet(countries);
            if (countriesMapLayer) countriesMapLayer.remove();

            fetch(leafletCountrySource)
                .then(response => response.json())
                .then(geojson => {
                    countriesMapLayer = L.geoJSON(geojson, {
                        style: (feature) => {
                            const featureName = normalizeCountryName(feature.properties.name || '');
                            const isVisited = visited.has(featureName);
                            return {
                                fillColor: isVisited ? '#2152ff' : '#d9e2f4',
                                weight: 1,
                                opacity: 1,
                                color: '#a9b8d4',
                                fillOpacity: isVisited ? 0.8 : 0.55
                            };
                        },
                        onEachFeature: (feature, layer) => {
                            layer.bindTooltip(feature.properties.name || 'Unknown');
                        }
                    }).addTo(countriesMapInstance);

                    document.getElementById('countries-summary').textContent = `${countries.length} countries highlighted across the world map.`;
                })
                .catch(() => {
                    document.getElementById('countries-summary').textContent = 'unable to load visited-countries map right now.';
                });
        }

        function renderCountriesMap(countries) {
            const mapTarget = document.getElementById('countries-map');
            if (!mapTarget) return;
            if (!window.L) {
                leafletJs.onload = () => renderCountriesMap(countries);
                return;
            }

            if (!countriesMapInstance) {
                countriesMapInstance = L.map('countries-map', {
                    worldCopyJump: true,
                    zoomControl: false
                }).setView([24, 12], 1.4);
                L.control.zoom({ position: 'bottomright' }).addTo(countriesMapInstance);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(countriesMapInstance);
            }

            applyCountryLayer(countries);
        }

        function initializeCommentBoard(theme) {
            const board = document.getElementById('comment-board');
            if (!board) return;

            board.innerHTML = '';
            const utterances = document.createElement('script');
            utterances.src = 'https://utteranc.es/client.js';
            utterances.async = true;
            utterances.crossOrigin = 'anonymous';
            utterances.setAttribute('repo', 'scottforbes227/scottocs');
            utterances.setAttribute('issue-term', 'pathname');
            utterances.setAttribute('label', 'notes');
            utterances.setAttribute('theme', theme === 'frutiger-aero' ? 'github-light' : 'preferred-color-scheme');
            board.appendChild(utterances);
        }

        // ======================================================================
        // EVENT LISTENERS & INITIALIZATION
        // ======================================================================
        enterButton.addEventListener('click', checkPassword);
        passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkPassword(); });
        
        setInterval(animatePenguin, 750);
        animatePenguin(); // Initial call
    });
